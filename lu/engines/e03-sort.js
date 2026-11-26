// E03 – Phân loại vào nhóm: kéo (hoặc chạm rồi chạm giỏ) từng vật vào đúng nhóm.
import { dragOrTap, esc } from '../core/lu-core.js';
import { need, vis, okVi, OK_VI } from './common.js';

export const id = 'E03', version = '1.0.0', name = 'Phân loại vào nhóm';

export function validate(act) {
  const e = need(act, ['skill_id', 'title', 'groups', 'items', 'no', 'done']);
  const g = new Set((act.groups || []).map(x => x.id));
  if (g.size < 2) e.push(`${act.activity_id}: cần ít nhất 2 nhóm`);
  (act.items || []).forEach(it => { if (!g.has(it.g)) e.push(`${act.activity_id}: vật ${it.e} thuộc nhóm không có`); });
  return e;
}
export function generate(act, rng) {
  const per = act.per_round || 4; const rounds = [];
  for (let r = 0; r < (act.rounds || 2); r++) {
    // mỗi nhóm có ít nhất một vật
    const first = act.groups.map(g => rng.pick(act.items.map((x, i) => i).filter(i => act.items[i].g === g.id)));
    const rest = rng.sample(act.items.map((x, i) => i).filter(i => !first.includes(i)), Math.max(0, per - first.length));
    rounds.push({ items: rng.shuffle([...first, ...rest]) });
  }
  return { rounds };
}
export function verify(act, v) {
  const e = [];
  v.rounds.forEach((r, k) => { act.groups.forEach(g => { if (!r.items.some(i => act.items[i].g === g.id)) e.push(`${act.activity_id} vòng ${k + 1}: nhóm "${g.label}" không có vật nào`); });
    if (new Set(r.items).size !== r.items.length) e.push(`${act.activity_id} vòng ${k + 1}: vật trùng`); });
  return e;
}
export const lines = act => [...(act.intro || []), act.again, act.no, act.done, ...OK_VI, ...act.groups.map(g => g.say)].filter(Boolean);

export async function mount(ctx, act, v) { for (let r = 0; r < v.rounds.length; r++) { await round(ctx, act, v.rounds[r], r === 0); ctx.tick?.(); } }

function round(ctx, act, R, first) {
  const { ui, voice } = ctx; const tries = {}; let left = R.items.length, sel = null;
  return new Promise(done => {
    ui.scene(act.title, `<div class="bins">${act.groups.map(g => `<div class="bin" data-g="${esc(g.id)}"><div class="bin-h">${g.e ? vis(g.e) : ''} ${esc(g.label)}</div><div class="bin-in"></div></div>`).join('')}</div>`);
    const tray = ui.answers(act.label || 'Kéo vào đúng nhóm', R.items.map(i => `<div class="piece" data-i="${i}">${vis(act.items[i].e)}</div>`).join('')); tray.classList.add('tray');
    const markNext = () => { const p = tray.querySelector('.piece'); if (p) ctx.test.mark([p, ui.stage.querySelector(`.bin[data-g="${CSS.escape(act.items[+p.dataset.i].g)}"]`)]); };
    const drop = (piece, bin) => {
      const i = +piece.dataset.i; tries[i] = tries[i] || 0;
      if (bin.dataset.g === act.items[i].g) {
        bin.querySelector('.bin-in').insertAdjacentHTML('beforeend', `<span>${vis(act.items[i].e)}</span>`); piece.remove(); left--;
        ctx.record({ skill_id: act.skill_id, correct: true, first_try: tries[i] === 0, tries: tries[i] + 1, hints: 0 });
        if (left === 0) voice.say(['__jingle', act.done]).then(done); else { voice.say([okVi()]); markNext(); }
      } else { tries[i]++; ui.shake(piece); voice.say(['__boing', act.no]); }
    };
    tray.querySelectorAll('.piece').forEach(p => dragOrTap(p, { isBusy: () => voice.busy, targetClass: 'bin', onDrop: drop,
      onSelect: x => { tray.querySelectorAll('.piece.sel').forEach(y => y.classList.remove('sel')); sel = x; x.classList.add('sel'); } }));
    ui.stage.querySelectorAll('.bin').forEach(b => b.onclick = () => { if (voice.busy || !sel || !sel.isConnected) return; const p = sel; p.classList.remove('sel'); sel = null; drop(p, b); });
    markNext();
    voice.say(first ? act.intro : [act.again || act.intro[0]]);
  });
}

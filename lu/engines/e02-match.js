// E02 – Kéo thả ghép cặp (kéo, hoặc chạm hình rồi chạm đích).
// target_style: "shadow" (đích là bóng của chính hình) hoặc "pair" (mỗi mục có {piece, target} riêng).
import { dragOrTap, esc } from '../core/lu-core.js';
import { need, vis, okVi, OK_VI } from './common.js';

export const id = 'E02', version = '1.0.0', name = 'Kéo thả ghép cặp';

const setsOf = act => act.target_style === 'pair' ? act.sets.map(s => s.map(p => ({ k: p.piece, piece: p.piece, target: p.target }))) : act.sets.map(s => s.map(k => ({ k, piece: k, target: k })));

export function validate(act) {
  const e = need(act, ['skill_id', 'title', 'sets', 'no', 'done']);
  (act.sets || []).forEach((s, i) => { if (s.length < 2) e.push(`${act.activity_id}: bộ ${i + 1} cần ít nhất 2 hình`); });
  return e;
}
export function generate(act, rng) {
  const sets = setsOf(act); const pick = rng.sample(sets.map((s, i) => i), act.rounds || sets.length);
  return { rounds: pick.map(i => ({ set: i, targets: rng.shuffle(sets[i].map((x, j) => j)), pieces: rng.shuffle(sets[i].map((x, j) => j)) })) };
}
export function verify(act, v) {
  const e = []; const sets = setsOf(act);
  v.rounds.forEach((r, k) => { const s = sets[r.set]; if (!s) return e.push(`${act.activity_id} vòng ${k + 1}: bộ không có`);
    if (new Set(s.map(x => x.k)).size !== s.length) e.push(`${act.activity_id} vòng ${k + 1}: hai hình trùng nhau`);
    if (new Set(s.map(x => x.target)).size !== s.length) e.push(`${act.activity_id} vòng ${k + 1}: hai đích trùng nhau`); });
  return e;
}
export const lines = act => [...(act.intro || []), act.again, act.no, act.done, act.ok_each, ...OK_VI].filter(Boolean);

export async function mount(ctx, act, v) {
  const sets = setsOf(act);
  for (let r = 0; r < v.rounds.length; r++) { await round(ctx, act, sets[v.rounds[r].set], v.rounds[r], r === 0); ctx.tick?.(); }
}

function round(ctx, act, items, R, first) {
  const { ui, voice } = ctx; const tries = {}; let left = items.length, sel = null;
  return new Promise(done => {
    const shadow = act.target_style !== 'pair';
    ui.scene(act.title, `<div class="shadows">${R.targets.map(j => `<div class="shadow" data-k="${esc(items[j].k)}">${shadow ? `<span class="sil">${vis(items[j].target)}</span>` : `<span class="tgt">${vis(items[j].target)}</span>`}</div>`).join('')}</div>`);
    const tray = ui.answers(act.label || 'Kéo hình về đúng chỗ', R.pieces.map(j => `<div class="piece" data-k="${esc(items[j].k)}">${vis(items[j].piece)}</div>`).join('')); tray.classList.add('tray');
    const markNext = () => { const p = tray.querySelector('.piece'); if (p) ctx.test.mark([p, ui.stage.querySelector(`.shadow[data-k="${CSS.escape(p.dataset.k)}"]`)]); };
    const drop = (piece, target) => {
      const k = piece.dataset.k; tries[k] = tries[k] || 0;
      if (target.classList.contains('filled')) return;
      if (target.dataset.k === k) {
        target.classList.add('filled'); target.innerHTML = vis(items.find(x => x.k === k).piece); piece.remove(); left--;
        ctx.record({ skill_id: act.skill_id, correct: true, first_try: tries[k] === 0, tries: tries[k] + 1, hints: 0 });
        if (left === 0) voice.say(['__jingle', act.done]).then(done); else { voice.say([act.ok_each || okVi()]); markNext(); }
      } else { tries[k]++; ui.shake(piece); voice.say(['__boing', act.no]); }
    };
    tray.querySelectorAll('.piece').forEach(p => dragOrTap(p, { isBusy: () => voice.busy, targetClass: 'shadow', onDrop: drop,
      onSelect: x => { tray.querySelectorAll('.piece.sel').forEach(y => y.classList.remove('sel')); sel = x; x.classList.add('sel'); } }));
    ui.stage.querySelectorAll('.shadow').forEach(s => s.onclick = () => { if (voice.busy || !sel || !sel.isConnected) return; const p = sel; p.classList.remove('sel'); sel = null; drop(p, s); });
    markNext();
    voice.say(first ? act.intro : [act.again || act.intro[0]]);
  });
}

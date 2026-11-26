// E08 – Xếp hình không gian.
//   jigsaw : tranh cắt thành mảnh (2×2 … 3×3), kéo từng mảnh vào đúng ô. 4–5 tuổi có tranh mờ làm mẫu, 5–6 tuổi không có.
//   rotate : các mảnh đã nằm đúng chỗ nhưng bị xoay; chạm để xoay 90° cho tới khi tranh thẳng (xoay hình trong đầu).
// Tranh là ảnh vẽ tay đã duyệt ("asset:BC-0003") hoặc hình vẽ mã ("art:buom").
import { vis, sleep, setAuto, req } from './kit.js';
import { dragOrTap } from '../core/lu-core.js';
import { okVi, OK_VI } from './common.js';

export const id = 'E08', version = '1.0.0', name = 'Xếp hình không gian';

export function validate(act) {
  const e = req(act, ['mode', 'skill_id', 'title', 'pictures', 'cols', 'rows', 'done']);
  if (!['jigsaw', 'rotate'].includes(act.mode)) e.push(`${act.activity_id}: mode phải là jigsaw hoặc rotate`);
  if (act.cols * act.rows > 9) e.push(`${act.activity_id}: tối đa 9 mảnh cho 4–6 tuổi`);
  return e;
}
export function generate(act, rng) {
  const pics = rng.sample(act.pictures, Math.min(act.rounds || 1, act.pictures.length)); const n = act.cols * act.rows;
  return { rounds: pics.map(p => ({ pic: p.v, name: p.name, order: rng.shuffle(Array.from({ length: n }, (_, i) => i)),
    rot: Array.from({ length: n }, () => act.mode === 'rotate' ? rng.pick([1, 2, 3]) : 0) })) };
}
export function verify(act, v) {
  const e = []; v.rounds.forEach((r, k) => { if (new Set(r.order).size !== act.cols * act.rows) e.push(`${act.activity_id} vòng ${k + 1}: thiếu mảnh`);
    if (act.mode === 'rotate' && r.rot.every(x => x % 4 === 0)) e.push(`${act.activity_id} vòng ${k + 1}: không có mảnh nào bị xoay`); });
  return e;
}
export const lines = act => [...(act.intro || []), act.again, act.no, act.done, act.look, ...OK_VI].filter(Boolean);
export async function mount(ctx, act, v) { for (let r = 0; r < v.rounds.length; r++) { await round(ctx, act, v.rounds[r], r === 0); ctx.tick?.(); } }

// Một mảnh: khung cắt (overflow hidden) chứa toàn bộ tranh được dịch đi (x, y)
const pieceInner = (pic, i, C, R) => { const x = i % C, y = Math.floor(i / C);
  return `<span class="pz-crop"><span class="pz-full" style="width:${C * 100}%;height:${R * 100}%;left:${-x * 100}%;top:${-y * 100}%">${vis(pic)}</span></span>`; };

function round(ctx, act, R, first) {
  const { ui, voice } = ctx; const C = act.cols, Rr = act.rows, n = C * Rr; let left = n, wrong = 0, sel = null;
  return new Promise(done => {
    const ghost = act.ghost ? `<div class="pz-ghost">${vis(R.pic)}</div>` : '';
    const board = `<div class="pz-board" style="grid-template-columns:repeat(${C},1fr);aspect-ratio:${act.aspect || '16/10'}">${ghost}${Array.from({ length: n }, (_, i) =>
      act.mode === 'rotate' ? `<button class="pz-slot rot" data-i="${i}" data-r="${R.rot[i]}" style="--rot:${R.rot[i] * 90}deg">${pieceInner(R.pic, i, C, Rr)}</button>` : `<div class="pz-slot" data-i="${i}"></div>`).join('')}</div>`;
    ui.scene(act.title, board);
    const B = ui.stage.querySelector('.pz-board');
    const finish = () => { B.classList.add('whole'); ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0 }); voice.say(['__jingle', act.done]).then(done); };
    if (act.mode === 'rotate') {
      const slots = [...B.querySelectorAll('.pz-slot')];
      const upright = () => slots.every(s => +s.dataset.r % 4 === 0);
      const turn = s => { const r = (+s.dataset.r + 1); s.dataset.r = r; s.style.setProperty('--rot', (r * 90) + 'deg'); if (r % 4 === 0) { s.classList.add('ok'); if (!upright()) voice.speak([okVi()]); } else s.classList.remove('ok');
        if (upright()) { slots.forEach(x => x.disabled = true); finish(); } };
      slots.forEach(s => { if (+s.dataset.r % 4 === 0) s.classList.add('ok'); s.onclick = () => { if (voice.busy || s.classList.contains('ok')) return; turn(s); }; });
      const nextBad = () => slots.find(s => +s.dataset.r % 4 !== 0);
      ctx.test.mark([nextBad()]);
      setAuto(ctx, async () => { let s; while ((s = nextBad())) { turn(s); await sleep(ctx, 220); } }, () => {});
      voice.say(first ? act.intro : [act.again || act.intro[0]]);
      return;
    }
    const tray = ui.answers(act.label || 'Kéo mảnh vào đúng chỗ', R.order.map(i => `<div class="piece pz-piece" data-i="${i}" style="aspect-ratio:${aspectPiece(act)}">${pieceInner(R.pic, i, C, Rr)}</div>`).join('')); tray.classList.add('tray', 'pz-tray');
    const markNext = () => { const p = tray.querySelector('.pz-piece'); if (p) ctx.test.mark([p, B.querySelector(`.pz-slot[data-i="${p.dataset.i}"]`)]); };
    const drop = (piece, slot) => {
      if (slot.classList.contains('filled')) return;
      if (slot.dataset.i === piece.dataset.i) {
        slot.classList.add('filled'); slot.innerHTML = pieceInner(R.pic, +slot.dataset.i, C, Rr); piece.remove(); left--;
        if (left === 0) finish(); else { voice.say([okVi()]); markNext(); }
      } else { wrong++; ui.shake(piece); voice.say(['__boing', act.no]); if (wrong === 2 && act.look) voice.say([act.look]); }
    };
    tray.querySelectorAll('.pz-piece').forEach(p => dragOrTap(p, { isBusy: () => voice.busy, targetClass: 'pz-slot', onDrop: drop,
      onSelect: x => { tray.querySelectorAll('.piece.sel').forEach(y => y.classList.remove('sel')); sel = x; x.classList.add('sel'); } }));
    B.querySelectorAll('.pz-slot').forEach(s => s.onclick = () => { if (voice.busy || !sel || !sel.isConnected) return; const p = sel; p.classList.remove('sel'); sel = null; drop(p, s); });
    markNext();
    voice.say(first ? act.intro : [act.again || act.intro[0]]);
  });
}
const aspectPiece = act => { const [w, h] = String(act.aspect || '16/10').split('/').map(Number); return `${w / act.cols}/${h / act.rows}`; };

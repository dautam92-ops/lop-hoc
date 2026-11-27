// E06 – Tìm và phát hiện: chạm hết các vật cần tìm trong một khung cảnh.
import { fill } from '../core/lu-core.js';
import { need, onTap, vis, okVi, OK_VI } from './common.js';
import * as MORE from './e06-more.js';

export const id = 'E06', version = '1.0.0', name = 'Tìm và phát hiện';

export function validate(act) {
  if (MORE.MORE.has(act.mode)) return MORE.validate(act);
  const e = need(act, ['skill_id', 'title', 'targets', 'distractors', 'q', 'no', 'done']);
  const t = new Set((act.targets || []).map(x => x.e));
  if ((act.distractors || []).some(d => t.has(d))) e.push(`${act.activity_id}: vật gây nhiễu trùng vật cần tìm`);
  return e;
}
export function generate(act, rng) {
  if (MORE.MORE.has(act.mode)) return MORE.generate(act, rng);
  const rounds = [];
  const ts = rng.sample(act.targets.map((x, i) => i), Math.min(act.rounds || 2, act.targets.length));
  for (const t of ts) {
    const k = rng.int(act.min || 2, act.max || 4); const cells = act.cells || 9;
    const others = Array.from({ length: cells - k }, () => rng.pick(act.distractors));
    const grid = rng.shuffle([...Array(k).fill(act.targets[t].e), ...others]);
    // Cảnh "rơi vãi" (tam 27/11 13:03): vật nằm rải rác trên mặt đất vườn thay vì xếp ô.
    // Vị trí do mã dựng: lưới 3 cột lệch ngẫu nhiên, mỗi vật một ô nên không chồng nhau; góc xoay ngẫu nhiên.
    if (act.layout === 'roi') { const cols = 3, rows = Math.ceil(grid.length / cols);
      const pos = grid.map((_, i) => ({ x: 18 + (i % cols) * 32 + rng.int(-7, 7), y: 15 + Math.floor(i / cols) * (70 / Math.max(1, rows - 1)) + rng.int(-4, 4), r: act.xoay === 0 ? 0 : rng.int(-(act.xoay || 35), act.xoay || 35) }));
      rounds.push({ t, grid, pos }); }
    else rounds.push({ t, grid });
  }
  return { rounds };
}
export function verify(act, v) {
  if (MORE.MORE.has(act.mode)) return MORE.verify(act, v);
  const e = [];
  v.rounds.forEach((r, k) => { const n = r.grid.filter(x => x === act.targets[r.t].e).length; if (n < 1) e.push(`${act.activity_id} vòng ${k + 1}: không có vật cần tìm`);
    try { fill(act.q, { name: act.targets[r.t].name }); } catch (x) { e.push(x.message); } });
  return e;
}
export const lines = act => MORE.MORE.has(act.mode) ? MORE.lines(act) : [...(act.intro || []), act.no, act.done, ...OK_VI, ...act.targets.map(t => fill(act.q, { name: t.name }))].filter(Boolean);

export async function mount(ctx, act, v) { if (MORE.MORE.has(act.mode)) return MORE.mount(ctx, act, v); for (let r = 0; r < v.rounds.length; r++) { await round(ctx, act, v.rounds[r], r === 0); ctx.tick?.(); } }

function round(ctx, act, R, first) {
  const { ui, voice } = ctx; const target = act.targets[R.t].e; let left = R.grid.filter(x => x === target).length, wrong = 0;
  return new Promise(done => {
    ui.scene(act.title, '');
    const roi = act.layout === 'roi' && R.pos;
    const cells = R.grid.map((x, i) => roi
      ? `<button class="opt cell-f roi-it" data-i="${i}" aria-label="vật ${i + 1}" style="left:${R.pos[i].x}%;top:${R.pos[i].y}%;--rot:${R.pos[i].r}deg;--co:${(act.co || {})[x] || 1}">${vis(x)}</button>`
      : `<button class="opt cell-f" data-i="${i}" aria-label="ô ${i + 1}">${vis(x)}</button>`).join('');
    const box = roi
      ? ui.answers('', `<div class="roi-vuon">${act.bg ? `<div class="roi-bg">${vis(act.bg)}</div>` : ''}${act.spill ? `<div class="roi-gio">${vis(act.spill)}</div>` : ''}${cells}</div>`)
      : ui.answers(act.label || 'Chạm vào hình cần tìm', `<div class="grid">${cells}</div>`);
    const markNext = () => ctx.test.mark(box.querySelector(`.cell-f:not(.right)[data-i="${R.grid.findIndex((x, i) => x === target && !box.querySelector(`[data-i="${i}"]`).classList.contains('right'))}"]`));
    markNext();
    const q = fill(act.q, { name: act.targets[R.t].name });
    onTap(box, '.cell-f', voice, b => {
      if (b.classList.contains('right')) return;
      if (R.grid[+b.dataset.i] === target) {
        b.classList.add('right'); left--;
        if (left === 0) { ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0 }); voice.say(['__jingle', act.done]).then(done); }
        else { voice.speak([okVi()]); markNext(); }
      } else { wrong++; ui.shake(b); voice.say(['__boing', act.no, q]); }
    });
    voice.say(first ? [...(act.intro || []), q] : [q]);
  });
}

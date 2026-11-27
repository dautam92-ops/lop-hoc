// E01 – Chạm chọn: chế độ mở rộng cho Phòng mẫu.
//   clue  : suy luận từ manh mối. Lu nói từng manh mối, bé chạm để LOẠI các hình không khớp; còn lại một hình là đáp án.
//           Đáp án chính xác theo cách dựng: mỗi hình có thuộc tính, mỗi manh mối là điều kiện; verify bảo đảm còn đúng một hình.
//   flash : nhìn nhanh rồi chọn số lượng theo trí nhớ (cách học 45, tam khen hay). Có nút "Xem lại".
import { vis, esc, fill, sleep, setAuto, numBtn, req } from './kit.js';
import { groupHTML } from '../ui/art.js';

export const MORE = new Set(['clue', 'flash']);
const fits = (o, c) => c.has ? (o.tags || []).includes(c.has) : c.not ? !(o.tags || []).includes(c.not) : true;

export function validate(act) {
  const e = req(act, ['skill_id', 'title']);
  if (act.mode === 'clue') { e.push(...req(act, ['puzzles', 'done'])); (act.puzzles || []).forEach((p, k) => { const left = p.opts.filter(o => p.clues.every(c => fits(o, c)));
    if (left.length !== 1) e.push(`${act.activity_id} câu ${k + 1}: các manh mối phải để lại đúng MỘT hình (đang còn ${left.length})`);
    let rest = p.opts; p.clues.forEach((c, j) => { const nx = rest.filter(o => fits(o, c)); if (nx.length === rest.length) e.push(`${act.activity_id} câu ${k + 1}: manh mối ${j + 1} không loại được hình nào`); rest = nx; }); }); }
  if (act.mode === 'flash') { e.push(...req(act, ['objs', 'pool', 'q', 'ok', 'no', 'words'])); if (act.scatter && Math.max(...(act.pool || [0])) > 12) e.push(`${act.activity_id}: xếp lộn xộn tối đa 12 vật`); if (Math.max(...(act.pool || [0])) > (act.words || []).length) e.push(`${act.activity_id}: thiếu chữ đọc số`); }
  return e;
}
export function generate(act, rng) {
  if (act.mode === 'clue') return { rounds: rng.sample(act.puzzles.map((p, i) => i), act.rounds || act.puzzles.length).map(i => ({ i, order: rng.shuffle(act.puzzles[i].opts.map((o, j) => j)) })) };
  return { rounds: rng.sample(act.pool, act.rounds || 3).map(n => { const s = new Set([n]); for (const d of rng.shuffle([-1, 1, -2, 2])) { if (s.size >= 3) break; if (n + d >= 1 && n + d <= Math.max(...act.pool) + 1) s.add(n + d); } return { n, obj: rng.pick(act.objs), opts: [...s].sort((a, b) => a - b), ...(act.scatter ? { pos: scatterPos(n, rng) } : {}) }; }) };
}
// Xếp lộn xộn (cấp 3 trở lên của "Nhìn nhanh đếm nhanh"): chọn n ô ngẫu nhiên trong lưới 4×3, lệch nhẹ, không chồng lên nhau
function scatterPos(n, rng) { const cells = rng.sample(Array.from({ length: 12 }, (_, i) => i), n); return cells.map(c => [12.5 + (c % 4) * 25 + rng.int(-5, 5), 17 + Math.floor(c / 4) * 33 + rng.int(-5, 5)]); }
const scatterHTML = (obj, pos) => `<span class="grp-box scat" role="img" aria-label="${pos.length}">${pos.map(([x, y]) => `<span class="grp-it" style="left:${x}%;top:${y}%;width:21%;height:28%">${vis(obj)}</span>`).join('')}</span>`;
export function verify(act, v) {
  const e = [];
  if (act.mode === 'flash') v.rounds.forEach((r, k) => { if (!r.opts.includes(r.n)) e.push(`${act.activity_id} vòng ${k + 1}: đáp án không có trong lựa chọn`); if (r.n > 10 && !act.ten_frame) e.push(`${act.activity_id}: số lớn hơn 10 cần khung mười`); });
  return e;
}
export function lines(act) {
  const L = [...(act.intro || []), act.done, act.again, act.q, act.no, act.look];
  if (act.mode === 'clue') act.puzzles.forEach(p => { L.push(p.q, p.ok, ...p.clues.map(c => c.say), ...p.opts.map(o => o.say)); });
  if (act.mode === 'flash') act.pool.forEach(n => L.push(fill(act.ok, { word: act.words[n - 1] })));
  return L.filter(Boolean);
}
export async function mount(ctx, act, v) { for (let r = 0; r < v.rounds.length; r++) { await (act.mode === 'clue' ? clue : flash)(ctx, act, v.rounds[r], r === 0); ctx.tick?.(); } }

function clue(ctx, act, R, first) {
  const { ui, voice } = ctx; const P = act.puzzles[R.i]; let ci = 0, wrong = 0; const out = new Set();
  return new Promise(done => {
    ui.scene(act.title, `<div class="clues">${P.clues.map((c, j) => `<span class="cl-k" data-j="${j}">${j + 1}</span>`).join('')}</div>`);
    const box = ui.answers(act.label || 'Chạm để loại hình không đúng', R.order.map(j => `<button class="opt face clue-o" data-j="${j}" aria-label="${esc(P.opts[j].say || '')}">${vis(P.opts[j].e)}</button>`).join(''));
    const btn = j => box.querySelector(`[data-j="${j}"]`);
    const toCut = () => P.opts.map((o, j) => j).filter(j => !out.has(j) && !fits(P.opts[j], P.clues[ci]));
    const answer = P.opts.findIndex(o => P.clues.every(c => fits(o, c)));
    const showClue = () => { ui.stage.querySelectorAll('.cl-k').forEach(k => k.classList.toggle('now', +k.dataset.j === ci)); ctx.test.mark(btn(toCut()[0])); return voice.say([P.clues[ci].say]); };
    const next = () => {
      ui.stage.querySelector(`.cl-k[data-j="${ci}"]`).classList.add('done'); ci++;
      if (ci < P.clues.length) return showClue();
      btn(answer).classList.add('right'); ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0 });
      voice.say(['__jingle', P.ok, act.done].filter(Boolean)).then(done);
    };
    box.addEventListener('click', e => { const b = e.target.closest('.clue-o'); if (!b || voice.busy || ci >= P.clues.length) return; const j = +b.dataset.j; if (out.has(j)) return;
      if (!fits(P.opts[j], P.clues[ci])) { out.add(j); b.classList.add('out'); if (!toCut().length) next(); else { voice.speak(['__jingle']); ctx.test.mark(btn(toCut()[0])); } }
      else { wrong++; ui.shake(b); voice.say(['__boing', P.clues[ci].say]); if (wrong >= 2) btn(toCut()[0])?.classList.add('hint'); } });
    setAuto(ctx, async () => { while (ci < P.clues.length) { const j = toCut()[0]; if (j === undefined) break; btn(j).click(); await sleep(ctx, 80); while (voice.busy) await sleep(ctx, 60); } },
      () => { const j = P.opts.map((o, j) => j).find(j => !out.has(j) && fits(P.opts[j], P.clues[ci])); if (j !== undefined) btn(j).click(); });
    voice.say(first ? [...(act.intro || []), P.q].filter(Boolean) : [P.q].filter(Boolean)).then(showClue);
  });
}

function flash(ctx, act, R, first) {
  const { ui, voice } = ctx; let wrong = 0;
  return new Promise(done => {
    const pic = act.ten_frame ? vis(`art:khung10:${R.n}`) : R.pos ? scatterHTML(R.obj, R.pos) : groupHTML(R.obj, R.n);
    ui.scene(act.title, `<div class="flash"><div class="fl-pic">${pic}</div><div class="fl-cover"><span>?</span></div></div>`);
    const F = ui.stage.querySelector('.flash');
    const show = async () => { F.classList.remove('hid'); await sleep(ctx, act.show_ms || 2000); F.classList.add('hid'); };
    const box = ui.answers('Bé chọn số', R.opts.map((v, i) => numBtn(v, i)).join('') + `<button class="big-btn alt fl-again">Xem lại</button>`);
    const ok = box.querySelector(`[data-i="${R.opts.indexOf(R.n)}"]`); ctx.test.mark(ok);
    box.querySelector('.fl-again').onclick = () => { if (!voice.busy) show(); };
    box.addEventListener('click', e => { const b = e.target.closest('.num'); if (!b || voice.busy) return; const v = R.opts[+b.dataset.i];
      if (v === R.n) { b.classList.add('right'); F.classList.remove('hid'); ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0 }); voice.say(['__jingle', fill(act.ok, { word: act.words[R.n - 1] })]).then(done); }
      else { wrong++; ui.shake(b); voice.say(['__boing', act.no]); if (wrong >= 2) ok.classList.add('hint'); } });
    setAuto(ctx, () => ok.click(), () => box.querySelector(`.num:not([data-i="${R.opts.indexOf(R.n)}"])`)?.click());
    voice.say(first ? [...(act.intro || []), act.look].filter(Boolean) : [act.look].filter(Boolean)).then(show).then(() => voice.say([act.q]));
  });
}

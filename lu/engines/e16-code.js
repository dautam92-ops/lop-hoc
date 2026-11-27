// E16 – Lập trình mũi tên (tam thích "lập trình mê cung", phương án 27/11).
// Bé xếp các thẻ mũi tên thành một chuỗi lệnh rồi bấm "Chạy"; Mono đi đúng theo chuỗi lệnh trên lưới.
// Đụng đá, ra ngoài lưới hay bước vào vũng nước: Mono dừng, lắc nhẹ, bé sửa lại chuỗi (không phạt, chuỗi lệnh được giữ).
// Cấp khó do dữ liệu quyết định: số mũi tên tối đa, có rẽ, có vật cần nhặt, có vũng nước (xem phương án, mục Thang 5 cấp).
// Mỗi câu đố được kiểm chứng: luôn có đường đi nhặt đủ vật rồi tới đích với số mũi tên ≤ max.
import { vis, esc, sleep, setAuto, playSound, req } from './kit.js';
import { luArt } from '../core/lu-core.js';

export const id = 'E16', version = '1.0.0', name = 'Lập trình mũi tên';
const DIRS = { len: [0, -1], xuong: [0, 1], trai: [-1, 0], phai: [1, 0] };
const ARROW = { len: 'M50 18 80 52H62v30H38V52H20z', xuong: 'M50 82 80 48H62V18H38v30H20z', trai: 'M18 50 52 20v18h30v24H52v18z', phai: 'M82 50 48 20v18H18v24h30v18z' };
const TEN = { len: 'đi lên', xuong: 'đi xuống', trai: 'sang trái', phai: 'sang phải' };
const arrowSVG = d => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${ARROW[d]}" fill="#f6c85f" stroke="#6b5232" stroke-width="5" stroke-linejoin="round"/></svg>`;
const k = ([x, y]) => `${x},${y}`;

export function validate(act) {
  const e = req(act, ['skill_id', 'title', 'puzzles', 'q', 'ok', 'bump', 'short', 'done']);
  (act.puzzles || []).forEach((p, i) => {
    const w = `${act.activity_id} câu ${i + 1}`;
    if (!(p.cols >= 2 && p.rows >= 1 && p.cols * p.rows <= 30)) e.push(`${w}: lưới tối đa 30 ô cho 4–6 tuổi`);
    if (!(p.max >= 1 && p.max <= 8)) e.push(`${w}: tối đa 8 mũi tên`);
    if ((p.items || []).length && !act.got) e.push(`${w}: có vật cần nhặt thì cần lời "got"`);
    if ((p.water || []).length && !act.wet) e.push(`${w}: có vũng nước thì cần lời "wet"`);
  });
  return e;
}
export const generate = (act) => ({ rounds: act.puzzles.slice(0, act.rounds || act.puzzles.length).map((p, i) => ({ i })) });

// Đường ngắn nhất (theo số mũi tên) nhặt hết vật rồi tới đích; trả về danh sách hướng hoặc null
export function solve(p) {
  const block = new Set([...(p.rocks || []), ...(p.water || [])].map(k)), items = (p.items || []).map(k), full = (1 << items.length) - 1;
  const st = [p.start[0], p.start[1], 0], seen = new Map([[st.join('|'), null]]), q = [st];
  while (q.length) {
    const [x, y, m] = q.shift();
    if (m === full && x === p.goal[0] && y === p.goal[1]) { const path = []; let c = [x, y, m].join('|'); while (seen.get(c)) { const [prev, d] = seen.get(c); path.unshift(d); c = prev; } return path; }
    for (const [d, [dx, dy]] of Object.entries(DIRS)) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= p.cols || ny >= p.rows || block.has(`${nx},${ny}`)) continue;
      const ii = items.indexOf(`${nx},${ny}`); const nm = ii >= 0 ? m | (1 << ii) : m; const key = [nx, ny, nm].join('|');
      if (!seen.has(key)) { seen.set(key, [[x, y, m].join('|'), d]); q.push([nx, ny, nm]); }
    }
  }
  return null;
}
export function verify(act, v) {
  const e = [];
  v.rounds.forEach(r => { const p = act.puzzles[r.i], w = `${act.activity_id} câu ${r.i + 1}`;
    const cells = [p.start, p.goal, ...(p.rocks || []), ...(p.water || []), ...(p.items || [])].map(k);
    if (new Set(cells).size !== cells.length) e.push(`${w}: hai thứ nằm chung một ô`);
    if ([...(p.rocks || []), ...(p.water || []), ...(p.items || []), p.start, p.goal].some(([x, y]) => x < 0 || y < 0 || x >= p.cols || y >= p.rows)) e.push(`${w}: có thứ nằm ngoài lưới`);
    const s = solve(p); if (!s) e.push(`${w}: không có đường tới đích`); else if (s.length > p.max) e.push(`${w}: cần ${s.length} mũi tên, nhiều hơn ${p.max} ô lệnh`);
  });
  return e;
}
export const lines = act => [...(act.intro || []), act.q, act.again, act.ok, act.bump, act.short, act.got, act.wet, act.hint, act.done, ...Object.values(TEN)].filter(Boolean);

export async function mount(ctx, act, v) { for (let r = 0; r < v.rounds.length; r++) { await round(ctx, act, act.puzzles[v.rounds[r].i], r === 0); ctx.tick?.(); } }

function round(ctx, act, P, first) {
  const { ui, voice } = ctx; const C = P.cols, R = P.rows; const sol = solve(P);
  let prog = [], running = false, fails = 0;
  return new Promise(done => {
    const at = ([x, y]) => `left:${(x + .5) * 100 / C}%;top:${(y + .5) * 100 / R}%`;
    const cells = Array.from({ length: C * R }, (_, i) => `<i class="cd-cell${(i % C + Math.floor(i / C)) % 2 ? ' alt' : ''}"></i>`).join('');
    ui.scene(act.title, `<div class="code-wrap"><div class="cd-board" style="--c:${C};--r:${R}">${cells}
      ${(P.water || []).map(c => `<div class="cd-thing cd-water" style="${at(c)}"></div>`).join('')}
      ${(P.rocks || []).map(c => `<div class="cd-thing" style="${at(c)}">${vis(act.rock || 'art:soi')}</div>`).join('')}
      ${(P.items || []).map(c => `<div class="cd-thing cd-item" data-c="${k(c)}" style="${at(c)}">${vis(act.item || 'art:hat-dau')}</div>`).join('')}
      <div class="cd-thing cd-goal" style="${at(P.goal)}">${vis(act.goal || 'art:hat-dau')}</div>
      <div class="cd-mono" style="${at(P.start)}">${luArt('di-bo')}</div></div>
      <div class="cd-prog" aria-label="Chuỗi lệnh">${Array.from({ length: P.max }, (_, i) => `<span class="cd-slot" data-i="${i}"></span>`).join('')}</div></div>`);
    const box = ui.answers('', `<div class="cd-pad">${Object.keys(DIRS).map(d => `<button class="opt cd-arrow" data-d="${d}" aria-label="${TEN[d]}">${arrowSVG(d)}</button>`).join('')}</div>
      <div class="cd-act"><button class="big-btn alt cd-undo">Xóa</button><button class="big-btn cd-run">Chạy</button></div>`);
    const board = ui.stage.querySelector('.cd-board'), mono = board.querySelector('.cd-mono'), slots = [...ui.stage.querySelectorAll('.cd-slot')];
    const runBtn = box.querySelector('.cd-run');
    const draw = () => { slots.forEach((s, i) => { s.innerHTML = prog[i] ? arrowSVG(prog[i]) : ''; s.classList.toggle('full', !!prog[i]); }); runBtn.disabled = !prog.length; mark(); };
    const firstWrong = () => { let i = 0; while (i < prog.length && prog[i] === sol[i]) i++; return i; };
    const mark = () => { const i = firstWrong(); ctx.test.mark(i < prog.length ? box.querySelector('.cd-undo') : i < sol.length ? box.querySelector(`[data-d="${sol[i]}"]`) : runBtn); };
    const place = c => { mono.style.cssText = at(c); };
    const reset = () => { place(P.start); board.querySelectorAll('.cd-item').forEach(it => it.classList.remove('got')); slots.forEach(s => s.classList.remove('now', 'bad')); };
    const hint = () => { if (fails < 2) return; const i = firstWrong(); box.querySelectorAll('.hint').forEach(b => b.classList.remove('hint'));
      if (i < prog.length) { slots[i].classList.add('bad'); box.querySelector('.cd-undo').classList.add('hint'); } else if (i < sol.length) box.querySelector(`[data-d="${sol[i]}"]`).classList.add('hint'); };
    const fail = async (line, slot) => { fails++; ui.shake(mono); if (slot !== undefined) slots[slot]?.classList.add('bad'); await voice.say(['__boing', line]); await sleep(ctx, 400); reset(); running = false; hint(); };
    const run = async () => {
      if (running || voice.busy || !prog.length) return; running = true; reset();
      const block = new Set((P.rocks || []).map(k)), wet = new Set((P.water || []).map(k)); let pos = [...P.start]; const got = new Set();
      for (let i = 0; i < prog.length; i++) {
        slots.forEach(s => s.classList.remove('now')); slots[i].classList.add('now');
        const [dx, dy] = DIRS[prog[i]]; const n = [pos[0] + dx, pos[1] + dy];
        if (n[0] < 0 || n[1] < 0 || n[0] >= C || n[1] >= R || block.has(k(n))) return fail(act.bump, i);
        pos = n; place(pos); playSound('buoc', { k: i }); await sleep(ctx, 480);
        if (wet.has(k(pos))) return fail(act.wet, i);
        const it = board.querySelector(`.cd-item[data-c="${k(pos)}"]`); if (it && !got.has(k(pos))) { got.add(k(pos)); it.classList.add('got'); if (act.got) voice.speak([act.got]); }
      }
      slots.forEach(s => s.classList.remove('now'));
      if (pos[0] === P.goal[0] && pos[1] === P.goal[1] && got.size === (P.items || []).length) {
        board.querySelector('.cd-goal').classList.add('got'); ctx.record({ skill_id: act.skill_id, correct: true, first_try: fails === 0, tries: fails + 1, hints: fails >= 2 ? 1 : 0, arrows: prog.length });
        await voice.say(['__jingle', act.ok]); return done();
      }
      return fail(act.short);
    };
    box.addEventListener('click', e => {
      if (running || voice.busy) return;
      const a = e.target.closest('.cd-arrow'); if (a) { if (prog.length < P.max) { prog.push(a.dataset.d); playSound('cham'); box.querySelectorAll('.hint').forEach(b => b.classList.remove('hint')); slots.forEach(s => s.classList.remove('bad')); draw(); } else ui.shake(ui.stage.querySelector('.cd-prog')); return; }
      if (e.target.closest('.cd-undo')) { prog.pop(); slots.forEach(s => s.classList.remove('bad')); draw(); return; }
      if (e.target.closest('.cd-run')) run();
    });
    // Phòng mẫu và máy chơi thử: xếp đúng lời giải rồi chạy / xếp một mũi tên đi ra ngoài lưới
    setAuto(ctx, async () => { prog = [...sol]; draw(); await run(); },
      async () => { const d = Object.keys(DIRS).find(d => { const [dx, dy] = DIRS[d]; const x = P.start[0] + dx, y = P.start[1] + dy; return x < 0 || y < 0 || x >= C || y >= R; }) || sol[0]; prog = [d]; draw(); await run(); });
    draw();
    voice.say(first ? [...(act.intro || []), act.q].filter(Boolean) : [act.again || act.q].filter(Boolean));
  });
}

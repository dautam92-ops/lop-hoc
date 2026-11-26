// E07 – Đường đi, mê cung (tư duy không gian, phối hợp tay mắt).
// Mê cung hoàn hảo sinh theo seed (luôn có đúng một đường giữa hai ô, không bao giờ bế tắc).
// Bé kéo ngón tay (hoặc chạm ô bên cạnh) để dẫn Lu đi. Đụng hàng rào thì Lu dừng lại, không phạt.
// 5–6 tuổi: nhặt đủ vật trên đường rồi mới về đích (nhiều bước, lập kế hoạch).
import { vis, esc, sleep, setAuto, pointerTrack, playSound, req } from './kit.js';
import { luArt } from '../core/lu-core.js';

export const id = 'E07', version = '1.0.0', name = 'Đường đi, mê cung';

export function validate(act) {
  const e = req(act, ['skill_id', 'title', 'cols', 'rows', 'goal', 'done']);
  if (act.cols * act.rows > 64) e.push(`${act.activity_id}: mê cung quá lớn cho 4–6 tuổi (tối đa 8×8)`);
  if ((act.collect?.n || 0) > 4) e.push(`${act.activity_id}: tối đa 4 vật cần nhặt`);
  return e;
}

export function generate(act, rng) {
  const rounds = [];
  for (let r = 0; r < (act.rounds || 1); r++) {
    const C = act.cols, R = act.rows; const walls = new Set(); // cạnh giữa hai ô "a-b" (a<b) là tường nếu có trong set
    for (let i = 0; i < C * R; i++) { if ((i % C) < C - 1) walls.add(`${i}-${i + 1}`); if (i + C < C * R) walls.add(`${i}-${i + C}`); }
    const seen = new Set([0]), st = [0];
    while (st.length) { const c = st[st.length - 1]; const nb = neighbors(c, C, R).filter(n => !seen.has(n));
      if (!nb.length) { st.pop(); continue; } const n = rng.pick(nb); walls.delete(key(c, n)); seen.add(n); st.push(n); }
    const goal = C * R - 1; const free = Array.from({ length: C * R }, (_, i) => i).filter(i => i !== 0 && i !== goal);
    const items = act.collect ? rng.sample(free, act.collect.n) : [];
    rounds.push({ walls: [...walls], goal, items });
  }
  return { rounds };
}
const key = (a, b) => a < b ? `${a}-${b}` : `${b}-${a}`;
function neighbors(i, C, R) { const x = i % C, y = Math.floor(i / C), n = []; if (x > 0) n.push(i - 1); if (x < C - 1) n.push(i + 1); if (y > 0) n.push(i - C); if (y < R - 1) n.push(i + C); return n; }
export function pathBetween(a, b, walls, C, R) {
  const W = new Set(walls), prev = new Map([[a, -1]]), q = [a];
  while (q.length) { const c = q.shift(); if (c === b) break; for (const n of neighbors(c, C, R)) if (!W.has(key(c, n)) && !prev.has(n)) { prev.set(n, c); q.push(n); } }
  if (!prev.has(b)) return null; const p = []; for (let c = b; c !== -1; c = prev.get(c)) p.unshift(c); return p;
}
export function verify(act, v) {
  const e = [];
  v.rounds.forEach((r, k) => { const C = act.cols, R = act.rows;
    for (const t of [...r.items, r.goal]) if (!pathBetween(0, t, r.walls, C, R)) e.push(`${act.activity_id} vòng ${k + 1}: không có đường tới ô ${t}`); });
  return e;
}
export const lines = act => [...(act.intro || []), act.hint, act.bump, act.done, act.collect?.ok, act.collect?.need, act.again].filter(Boolean);

export async function mount(ctx, act, v) { for (let r = 0; r < v.rounds.length; r++) { await round(ctx, act, v.rounds[r], r === 0); ctx.tick?.(); } }

function round(ctx, act, R, first) {
  const { ui, voice } = ctx; const C = act.cols, Rw = act.rows; const W = new Set(R.walls);
  let pos = 0, bumps = 0, left = new Set(R.items), trail = [0], lastBump = 0;
  return new Promise(done => {
    const cellW = 100 / C, cellH = 100 / Rw;
    const wallSvg = [...W].map(k => { const [a, b] = k.split('-').map(Number); const ax = a % C, ay = Math.floor(a / C);
      return b === a + 1 ? `<path d="M${(ax + 1) * cellW} ${ay * cellH}V${(ay + 1) * cellH}"/>` : `<path d="M${ax * cellW} ${(ay + 1) * cellH}H${(ax + 1) * cellW}"/>`; }).join('');
    const ctr = i => [((i % C) + .5) * cellW, (Math.floor(i / C) + .5) * cellH];
    ui.scene(act.title, `<div class="maze" style="--c:${C};--r:${Rw};aspect-ratio:${C}/${Rw}">
      <svg class="mz-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100" height="100" fill="#f3ead2"/><polyline class="mz-trail" fill="none" points=""/>
      <g class="mz-walls">${wallSvg}<rect x="0" y="0" width="100" height="100" fill="none"/></g></svg>
      ${R.items.map(i => `<div class="mz-it" data-c="${i}" style="left:${ctr(i)[0]}%;top:${ctr(i)[1]}%">${vis(act.collect.e)}</div>`).join('')}
      <div class="mz-goal" style="left:${ctr(R.goal)[0]}%;top:${ctr(R.goal)[1]}%">${vis(act.goal)}</div>
      <div class="mz-lu" style="left:${ctr(0)[0]}%;top:${ctr(0)[1]}%">${act.token ? vis(act.token) : luArt('di-bo')}</div></div>`);
    const box = ui.stage.querySelector('.maze'), luEl = box.querySelector('.mz-lu'), tr = box.querySelector('.mz-trail');
    const draw = () => { const [x, y] = ctr(pos); luEl.style.left = x + '%'; luEl.style.top = y + '%'; tr.setAttribute('points', trail.map(c => ctr(c).join(',')).join(' ')); };
    const finish = () => { ctx.record({ skill_id: act.skill_id, correct: true, first_try: bumps <= 2, tries: 1 + bumps, hints: 0, bumps }); voice.say(['__jingle', act.done]).then(done); };
    const moveTo = n => {
      if (n === pos) return true;
      if (!neighbors(pos, C, Rw).includes(n)) return false;
      if (W.has(key(pos, n))) { bumps++; ui.shake(luEl); if (Date.now() - lastBump > 2500) { lastBump = Date.now(); voice.say(['__boing', act.bump]); } return false; }
      if (R.goal === n && left.size) { if (!voice.busy) voice.say([act.collect.need]); return false; }
      pos = n; trail.push(n); playSound('buoc', { k: trail.length % 6 }); draw();
      if (left.has(n)) { left.delete(n); const it = box.querySelector(`.mz-it[data-c="${n}"]`); if (it) it.classList.add('got'); if (left.size) voice.speak([act.collect.ok]); }
      if (n === R.goal) { busy = true; finish(); }
      return true;
    };
    let busy = false;
    const cellAt = (x, y) => { const r = box.getBoundingClientRect(); const cx = Math.floor((x - r.left) / r.width * C), cy = Math.floor((y - r.top) / r.height * Rw); return cx < 0 || cy < 0 || cx >= C || cy >= Rw ? -1 : cy * C + cx; };
    pointerTrack(box, { isBusy: () => voice.busy || busy,
      onStart: (x, y) => { const c = cellAt(x, y); if (c >= 0 && c !== pos) moveTo(c); },
      onMove: (x, y) => { const c = cellAt(x, y); if (c >= 0 && c !== pos && !busy) moveTo(c); } });
    // Phòng mẫu: đi đúng đường (BFS) hoặc thử đụng tường
    setAuto(ctx, async () => { const targets = [...left, R.goal]; for (const t of targets) { const p = pathBetween(pos, t, R.walls, C, Rw); for (const c of p.slice(1)) { if (busy) return; moveTo(c); await sleep(ctx, 160); } } },
      () => { const n = neighbors(pos, C, Rw).find(n => W.has(key(pos, n))); if (n !== undefined) moveTo(n); });
    ctx.test.mark([luEl]);
    voice.say(first ? [...(act.intro || []), act.hint].filter(Boolean) : [act.again || act.hint].filter(Boolean));
  });
}

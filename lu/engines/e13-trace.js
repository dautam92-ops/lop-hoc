// E13 – Vẽ nét và tô (Tracing Engine + tô màu).
//   trace : tô theo nét chữ cái, chữ số, nét cơ bản. Ba chế độ theo chỉ thị Chương trình mục 6:
//           "mau" (Lu tô mẫu, bé xem), "ho-tro" (đường chấm + mũi tên + chấm bắt đầu, dung sai rộng), "doc-lap" (chỉ còn đường mờ, dung sai hẹp).
//           Chỉ kiểm tra bé đi đúng điểm bắt đầu, đúng chiều, không lệch khỏi đường quá xa. KHÔNG chấm chữ viết tay (ghi "đã tham gia").
//   color : tô màu tranh theo vùng. "tu-do": tô màu nào cũng đẹp. "theo-so" (5–6 tuổi): mỗi vùng có số, số ứng với một màu.
import { vis, esc, sleep, setAuto, svgPoint, saveArtwork, req } from './kit.js';
import { GLYPHS } from '../core/strokes.js';
import { COLOR_PICTURES } from '../ui/art-lab.js';

export const id = 'E13', version = '1.0.0', name = 'Vẽ nét và tô';

export function validate(act) {
  const e = req(act, ['mode', 'skill_id', 'title', 'done']);
  if (act.mode === 'trace') { e.push(...req(act, ['glyphs', 'phases'])); (act.glyphs || []).forEach(g => { if (!GLYPHS[g]) e.push(`${act.activity_id}: chưa có dữ liệu nét cho "${g}"`); }); }
  if (act.mode === 'color') { e.push(...req(act, ['picture', 'palette'])); if (!COLOR_PICTURES[act.picture]) e.push(`${act.activity_id}: chưa có tranh tô "${act.picture}"`); }
  return e;
}
export const generate = act => ({ rounds: act.mode === 'trace' ? act.glyphs.map(g => ({ g })) : [{}] });
export const verify = () => [];
export function lines(act) {
  const L = [...(act.intro || []), act.done, act.start_here, act.redo, act.watch, act.your_turn, act.alone, act.wrong_color, act.more];
  if (act.mode === 'trace') act.glyphs.forEach(g => { L.push(act.say?.[g], (act.done || '').replace('{name}', GLYPHS[g].name)); GLYPHS[g].strokes.forEach(s => L.push(s.say)); });
  if (act.mode === 'color') { (act.palette || []).forEach(p => L.push(p.say, (act.wrong_color || 'Vùng số {n} tô màu {c} nhé.').replace('{n}', p.n).replace('{c}', p.name), (act.done || '').replace('{c}', p.name))); (act.praise || []).forEach(p => L.push(p)); }
  return L.filter(Boolean);
}
export async function mount(ctx, act, v) {
  if (act.mode === 'color') { await color(ctx, act); ctx.tick?.(); return; }
  for (let r = 0; r < v.rounds.length; r++) { await traceGlyph(ctx, act, v.rounds[r].g, r === 0); ctx.tick?.(); }
}

/* ---------- Tô theo nét ---------- */
const PAPER = `<g class="tr-paper"><path d="M0 14H100M0 62H100M0 110H100" stroke="#d9c79f" stroke-width=".8"/><path d="M0 38H100M0 86H100" stroke="#ece1c6" stroke-width=".6" stroke-dasharray="2 2"/></g>`;
function samplePath(svg, d, step = 2.5) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); svg.appendChild(p);
  const L = p.getTotalLength(), pts = []; for (let s = 0; s <= L; s += step) { const q = p.getPointAtLength(s); pts.push([q.x, q.y]); }
  const e = p.getPointAtLength(L); pts.push([e.x, e.y]); p.remove(); return { pts, L };
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const arrowAt = (pts, k) => { const a = pts[Math.min(k, pts.length - 2)], b = pts[Math.min(k + 3, pts.length - 1)]; const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; return `<path d="M-3 -3L3 0L-3 3" transform="translate(${a[0]} ${a[1]}) rotate(${ang})" class="tr-arrow"/>`; };

function traceGlyph(ctx, act, g, first) {
  const { ui, voice } = ctx; const G = GLYPHS[g]; const phases = act.phases;
  return new Promise(async done => {
    ui.scene(act.title, `<div class="trace"><svg class="tr-svg" viewBox="0 0 100 130">${PAPER}<g class="tr-guides"></g><g class="tr-ink"></g><g class="tr-ui"></g></svg><div class="tr-name">${esc(G.name)}</div></div>`);
    const svg = ui.stage.querySelector('.tr-svg'), guides = svg.querySelector('.tr-guides'), ink = svg.querySelector('.tr-ink'), uiG = svg.querySelector('.tr-ui');
    const S = G.strokes.map(s => ({ ...s, ...samplePath(svg, s.d) }));
    const intro = [...(first ? act.intro || [] : []), act.say?.[g]].filter(Boolean);
    if (intro.length) await voice.say(intro);
    let resets = 0;
    for (const ph of phases) {
      const tol = ph === 'doc-lap' ? (act.tol_alone || 9) : (act.tol || 13);
      guides.innerHTML = S.map(s => `<path d="${s.d}" class="tr-guide ${ph}"/>`).join('');
      ink.innerHTML = '';
      if (ph === 'mau') { await voice.say([act.watch || 'Bé xem Lu tô mẫu nhé.']); for (const s of S) await demoStroke(ctx, s, ink, uiG, voice); await sleep(ctx, 400); continue; }
      await voice.say([ph === 'doc-lap' ? (act.alone || 'Giờ bé tự tô nhé.') : (act.your_turn || 'Đến lượt bé tô theo đường chấm nhé.')]);
      for (let k = 0; k < S.length; k++) resets += await doStroke(ctx, act, S[k], k, ph, tol, ink, uiG);
      uiG.innerHTML = '';
    }
    // Tô theo nét: chỉ ghi đã tham gia, không suy ra khả năng viết tay (chỉ thị Chương trình mục 6)
    ctx.record({ skill_id: act.skill_id, kind: 'participation', correct: true, first_try: resets === 0, tries: resets + 1, hints: 0, glyph: g });
    await voice.say(['__jingle', act.done.replace('{name}', G.name)]);
    done();
  });
}
async function demoStroke(ctx, s, ink, uiG, voice) {
  const pen = `<circle r="4.5" class="tr-pen"/>`; uiG.innerHTML = pen; const c = uiG.querySelector('circle');
  const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); pl.setAttribute('class', 'tr-line demo'); ink.appendChild(pl);
  const talk = voice.say([s.say]); const pts = s.pts; const dt = Math.max(8, Math.min(30, 1400 / pts.length));
  for (let i = 0; i < pts.length; i++) { c.setAttribute('cx', pts[i][0]); c.setAttribute('cy', pts[i][1]); pl.setAttribute('points', pts.slice(0, i + 1).map(p => p.join(',')).join(' ')); await sleep(ctx, dt); }
  await talk; uiG.innerHTML = '';
}
function doStroke(ctx, act, s, k, ph, tol, ink, uiG) {
  const { voice } = ctx; const svg = ink.ownerSVGElement; const pts = s.pts;
  return new Promise(res => {
    uiG.innerHTML = `<circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="5.5" class="tr-start"/><text x="${pts[0][0]}" y="${pts[0][1] + 2.2}" class="tr-num">${k + 1}</text>` +
      (ph === 'ho-tro' && !s.dot ? [0.2, 0.5, 0.8].map(f => arrowAt(pts, Math.floor(pts.length * f))).join('') : '') + `<circle cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="3" class="tr-end"/>`;
    const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); pl.setAttribute('class', 'tr-line'); ink.appendChild(pl);
    let idx = 0, drawn = [], active = false, resets = 0, lastWarn = 0;
    const startEl = uiG.querySelector('.tr-start');
    ctx.test.mark([startEl]);
    const finish = () => { active = false; svg.onpointerdown = svg.onpointermove = svg.onpointerup = null; pl.classList.add('ok'); uiG.querySelectorAll('.tr-arrow').forEach(a => a.remove()); res(resets); };
    const reset = why => { resets++; drawn = []; idx = 0; active = false; pl.setAttribute('points', ''); if (Date.now() - lastWarn > 2500) { lastWarn = Date.now(); voice.say(['__boing', why === 'start' ? (act.start_here || 'Bé bắt đầu từ chấm xanh số ' + (k + 1) + ' nhé.') : (act.redo || 'Mình tô lại nét này nhé, đi theo đường chấm.')]); } };
    const feed = (x, y) => {
      const p = [x, y];
      // Tiến theo các điểm mốc theo thứ tự; cho phép vượt tối đa 4 mốc để không bắt bé đi quá chậm
      let best = -1; for (let j = idx; j < Math.min(pts.length, idx + 5); j++) if (dist(p, pts[j]) <= tol) best = j;
      if (best >= 0) idx = best + 1;
      else { const near = Math.min(...pts.slice(Math.max(0, idx - 6), Math.min(pts.length, idx + 6)).map(q => dist(p, q))); if (near > tol * 2.2) return reset('off'); }
      drawn.push(p); pl.setAttribute('points', drawn.map(q => q.join(',')).join(' '));
      if (idx >= pts.length - 1) finish();
    };
    svg.onpointerdown = e => { if (voice.busy) return; e.preventDefault(); const q = svgPoint(svg, e.clientX, e.clientY);
      if (s.dot) { if (dist([q.x, q.y], pts[0]) <= tol) { drawn = [[q.x, q.y], [q.x + .1, q.y + .1]]; pl.setAttribute('points', drawn.map(p => p.join(',')).join(' ')); return finish(); } return reset('start'); }
      if (dist([q.x, q.y], pts[0]) > tol * 1.4) return reset('start'); active = true; svg.setPointerCapture?.(e.pointerId); drawn = []; idx = 0; feed(q.x, q.y); };
    svg.onpointermove = e => { if (!active) return; const q = svgPoint(svg, e.clientX, e.clientY); feed(q.x, q.y); };
    svg.onpointerup = () => { if (!active) return; active = false; if (idx < pts.length - 1) reset('off'); };
    // Phòng mẫu: tô đúng theo đường (dùng chính dữ liệu nét) hoặc bắt đầu sai chỗ
    setAuto(ctx, async () => { active = true; drawn = []; idx = 0; for (let i = 0; i < pts.length && active; i += 2) { feed(pts[i][0] + .8, pts[i][1] - .8); await sleep(ctx, 12); } if (active) feed(...pts.at(-1)); },
      () => reset('start'));
  });
}

/* ---------- Tô màu ---------- */
function color(ctx, act) {
  const { ui, voice } = ctx; const P = COLOR_PICTURES[act.picture]; const byNum = act.style === 'theo-so';
  return new Promise(done => {
    let cur = 0, filled = new Map(), wrong = 0;
    const regionSvg = P.regions.map(([id, d, n, c, rot]) => `<path class="cl-r" data-r="${id}" data-n="${n}" d="${d}"${rot ? ` transform="rotate(${rot} 200 330)"` : ''}/>`).join('');
    const nums = byNum ? P.regions.filter(r => r[3]).map(([id, , n, [x, y]]) => `<text class="cl-n" x="${x}" y="${y + 6}" data-for="${id}">${n}</text>`).join('') : '';
    ui.scene(act.title, `<div class="color-pic"><svg viewBox="${P.vb}" class="cl-svg">${regionSvg}<g class="cl-lines" fill="none" stroke="#6b5232" stroke-width="3" stroke-linecap="round">${P.lines}</g>${nums}</svg></div>`);
    const svg = ui.stage.querySelector('.cl-svg');
    const pal = act.palette;
    const box = ui.answers(byNum ? 'Số nào thì màu nấy' : 'Bé chọn màu rồi chạm vào tranh', pal.map((p, i) => `<button class="opt crayon${i === 0 ? ' on' : ''}" data-i="${i}" aria-label="${esc(p.name)}" style="--c:${p.c}">${byNum ? `<b>${p.n}</b>` : ''}${vis('art:but-sap:' + encodeURIComponent(p.c))}</button>`).join('') + `<button class="big-btn cl-done">Xong rồi</button>`);
    box.addEventListener('click', e => { const b = e.target.closest('.crayon'); if (!b || voice.busy) return; box.querySelectorAll('.crayon').forEach(x => x.classList.remove('on')); b.classList.add('on'); cur = +b.dataset.i; if (pal[cur].say) voice.speak([pal[cur].say]); });
    const paint = (r, i) => {
      const n = +r.dataset.n;
      if (byNum && pal[i].n !== n) { wrong++; ui.shake(box.querySelector(`[data-i="${i}"]`)); const want = pal.find(p => p.n === n); voice.say(['__boing', (act.wrong_color || 'Vùng số {n} tô màu {c} nhé.').replace('{n}', n).replace('{c}', want?.name || '')]); return; }
      r.style.fill = pal[i].c; r.classList.add('done'); filled.set(r.dataset.r, pal[i].name);
    };
    svg.addEventListener('click', e => { const r = e.target.closest('.cl-r'); if (!r || voice.busy) return; paint(r, cur); });
    const doneBtn = box.querySelector('.cl-done');
    const need = act.min_regions || Math.ceil(P.regions.length * .5);
    doneBtn.onclick = () => {
      if (voice.busy) return;
      if (filled.size < need) return voice.say([act.more || 'Bé tô thêm vài chỗ nữa nhé.']);
      if (byNum && filled.size < P.regions.length) return voice.say([act.more || 'Còn vài vùng có số chưa tô đó.']);
      const fav = [...filled.values()].reduce((m, c) => (m[c] = (m[c] || 0) + 1, m), {}); const top = Object.entries(fav).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      saveArtwork('to-mau', svg.outerHTML);
      ctx.record({ skill_id: act.skill_id, kind: byNum ? 'answer' : 'participation', correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0, regions: filled.size });
      voice.say(['__jingle', (act.done || '').replace('{c}', top)]).then(done);
    };
    ctx.test.mark([doneBtn]);
    // Phòng mẫu: tô đúng số (hoặc tô tự do hết các vùng), rồi bấm Xong; thử sai: tô vùng bằng màu khác số
    setAuto(ctx, async () => { for (const r of svg.querySelectorAll('.cl-r')) { const i = byNum ? pal.findIndex(p => p.n === +r.dataset.n) : (Math.abs(r.dataset.r.length * 7) % pal.length); paint(r, i < 0 ? 0 : i); await sleep(ctx, 40); } doneBtn.click(); },
      byNum ? () => { const r = svg.querySelector('.cl-r:not(.done)'); const i = pal.findIndex(p => p.n !== +r.dataset.n); paint(r, i); } : () => doneBtn.click());
    voice.say(act.intro || []);
  });
}

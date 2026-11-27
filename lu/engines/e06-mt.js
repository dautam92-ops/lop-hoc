// E06 – Tìm và phát hiện: hai chế độ bổ sung theo chỉ thị Phương pháp giáo dục (tam 26/11 16:26).
//   where : GHI NHỚ VỊ TRÍ. Lu cho xem vài đồ vật trên lưới ô, rồi úp hết lại; Lu gọi tên một vật, bé chạm đúng ô nó nằm.
//           Có nút "Xem lại" (không ép trí nhớ quá sức). Sai: ô rung nhẹ, không lộ đáp án; sai 2 lần thì ô đúng sáng gợi ý.
//   copy  : TÁI TẠO MÔ HÌNH (xếp lại theo mẫu). Bên trái là mẫu của Lu, bên phải lưới trống; bé chạm ô để tô cho giống mẫu.
//           Tự sửa lỗi kiểu Montessori: chạm ô không có trong mẫu thì ô không tô (rung nhẹ), bé tự nhìn lại mẫu.
// Không gọi mạng, không AI trong phiên học. Đáp án đúng theo cách dựng: verify kiểm tra vị trí không trùng, mẫu hợp lệ.
import { vis, esc, fill, sleep, setAuto, req, countdown } from './kit.js';

export const MODES = new Set(['where', 'copy']);

export function validate(act) {
  const e = req(act, ['skill_id', 'title', 'done']);
  if (act.mode === 'where') {
    e.push(...req(act, ['objs', 'cols', 'cells', 'show', 'q']));
    if ((act.objs || []).length < act.show) e.push(`${act.activity_id}: số đồ vật ít hơn số cần hiện`);
    if (act.show > act.cells) e.push(`${act.activity_id}: nhiều vật hơn số ô`);
    if ((act.asks || 1) > act.show) e.push(`${act.activity_id}: hỏi nhiều hơn số vật`);
  }
  if (act.mode === 'copy') {
    e.push(...req(act, ['size', 'colors', 'models', 'q']));
    (act.models || []).forEach((m, k) => {
      const cells = m.map(x => x.c);
      if (new Set(cells).size !== cells.length) e.push(`${act.activity_id} mẫu ${k + 1}: trùng ô`);
      if (m.some(x => x.c < 0 || x.c >= act.size * act.size)) e.push(`${act.activity_id} mẫu ${k + 1}: ô ngoài lưới`);
      if (m.some(x => (x.k || 0) >= act.colors.length)) e.push(`${act.activity_id} mẫu ${k + 1}: màu không có trong bảng màu`);
      if (m.length < 2) e.push(`${act.activity_id} mẫu ${k + 1}: cần ít nhất 2 ô`);
    });
    if (act.colors.length > 1 && !act.color_names) e.push(`${act.activity_id}: thiếu tên màu để Lu đọc`);
  }
  return e;
}

export function generate(act, rng) {
  if (act.mode === 'where') return { rounds: Array.from({ length: act.rounds || 3 }, () => {
    const objs = rng.sample(act.objs.map((o, i) => i), act.show), cells = rng.sample([...Array(act.cells).keys()], act.show);
    return { pos: objs.map((o, i) => ({ o, c: cells[i] })), asks: rng.sample(objs.map((o, i) => i), act.asks || 1) };
  }) };
  return { rounds: rng.sample(act.models.map((m, i) => i), Math.min(act.rounds || 2, act.models.length)).map(m => ({ m })) };
}

export function verify(act, v) {
  const e = [];
  v.rounds.forEach((r, k) => {
    if (act.mode === 'where') { if (new Set(r.pos.map(p => p.c)).size !== r.pos.length) e.push(`${act.activity_id} vòng ${k + 1}: hai vật cùng một ô`); if (new Set(r.pos.map(p => p.o)).size !== r.pos.length) e.push(`${act.activity_id} vòng ${k + 1}: vật trùng`); }
    if (act.mode === 'copy' && !act.models[r.m]) e.push(`${act.activity_id} vòng ${k + 1}: không có mẫu`);
  });
  return e;
}

export function lines(act) {
  const L = [...(act.intro || []), act.done, act.again, act.look, act.no, act.hint];
  if (act.mode === 'where') act.objs.forEach(o => L.push(fill(act.q, { name: o.name }), o.found));
  if (act.mode === 'copy') { L.push(act.q, act.pick); (act.color_names || []).forEach(n => L.push(fill(act.pick_color || 'Bé chọn màu {name}.', { name: n }))); }
  return L.filter(Boolean);
}

export async function mount(ctx, act, v) { for (let r = 0; r < v.rounds.length; r++) { await (act.mode === 'where' ? where : copy)(ctx, act, v.rounds[r], r === 0); ctx.tick?.(); } }

/* ---------- Ghi nhớ vị trí ---------- */
function where(ctx, act, R, first) {
  const { ui, voice } = ctx; let k = 0, wrong = 0;
  return new Promise(done => {
    const at = c => R.pos.find(p => p.c === c);
    ui.scene(act.title, `<div class="wh-grid" style="--n:${act.cols}">${[...Array(act.cells).keys()].map(c => { const p = at(c); return `<button class="wh-c" data-c="${c}" aria-label="ô ${c + 1}"><span class="wh-f">${p ? vis(act.objs[p.o].e) : ''}</span><span class="wh-b" aria-hidden="true"></span></button>`; }).join('')}</div>`);
    const G = ui.stage.querySelector('.wh-grid'); const cell = c => G.querySelector(`.wh-c[data-c="${c}"]`);
    const target = () => R.pos[R.asks[k]];
    const ask = () => fill(act.q, { name: act.objs[target().o].name });
    let looking = false;
    const look = async () => { looking = true; G.classList.remove('cov'); await countdown(ctx, act.look_ms || 3000); G.classList.add('cov'); G.querySelectorAll('.wh-c.got').forEach(x => x.classList.add('open')); looking = false; };
    const box = ui.answers(act.label || 'Bé chạm vào ô đúng', `<button class="big-btn alt wh-again">Xem lại</button>`);
    box.querySelector('.wh-again').onclick = async () => { if (voice.busy || looking) return; await look(); };
    const mark = () => ctx.test.mark(cell(target().c));
    const pick = b => { const c = +b.dataset.c; const p = target();
      if (c === p.c) { b.classList.add('got', 'open'); ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: wrong >= 2 ? 1 : 0 }); wrong = 0; const f = act.objs[p.o].found; k++;
        if (k >= R.asks.length) { G.classList.remove('cov'); voice.say(['__jingle', f, act.done].filter(Boolean)).then(done); }
        else { voice.say(['__jingle', f, ask()].filter(Boolean)); mark(); } }
      else { wrong++; ui.shake(b); voice.speak(['__boing']); if (wrong === 2) { cell(p.c).classList.add('hint'); if (act.hint) voice.say([act.hint]); } } };
    G.addEventListener('click', e => { const b = e.target.closest('.wh-c'); if (!b || voice.busy || looking || !G.classList.contains('cov') || b.classList.contains('got')) return; pick(b); });
    setAuto(ctx, async () => { while (k < R.asks.length) { pick(cell(target().c)); await sleep(ctx, 60); while (voice.busy) await sleep(ctx, 50); } },
      () => { const w = [...G.querySelectorAll('.wh-c')].find(b => +b.dataset.c !== target().c && !b.classList.contains('got')); if (w) pick(w); });
    mark();
    voice.say(first ? [...(act.intro || []), act.look].filter(Boolean) : [act.look].filter(Boolean)).then(look).then(() => voice.say([ask()]));
  });
}

/* ---------- Tái tạo mô hình ---------- */
function copy(ctx, act, R, first) {
  const { ui, voice } = ctx; const M = act.models[R.m]; const N = act.size * act.size; const want = new Map(M.map(x => [x.c, x.k || 0])); let col = 0, wrong = 0; const got = new Set();
  return new Promise(done => {
    const grid = (cls, fill_) => `<div class="mt-grid ${cls}" style="--n:${act.size}">${[...Array(N).keys()].map(c => fill_(c)).join('')}</div>`;
    const model = grid('mt-model', c => `<span class="mt-c${want.has(c) ? ' on' : ''}" style="${want.has(c) ? `--k:${act.colors[want.get(c)]}` : ''}"></span>`);
    const mine = grid('mt-mine', c => `<button class="mt-c" data-c="${c}" aria-label="ô ${c + 1}"></button>`);
    ui.scene(act.title, `<div class="mt-copy"><div class="mt-side"><b>Mẫu của Mono</b>${model}</div><div class="mt-side"><b>Bé xếp</b>${mine}</div></div>`);
    const G = ui.stage.querySelector('.mt-mine'); const cell = c => G.querySelector(`.mt-c[data-c="${c}"]`);
    const multi = act.colors.length > 1;
    const box = multi ? ui.answers(act.pick || 'Bé chọn màu rồi chạm ô', act.colors.map((c, i) => `<button class="opt mt-pal${i === 0 ? ' sel' : ''}" data-k="${i}" style="--k:${c}" aria-label="${esc(act.color_names[i])}"><i></i></button>`).join('')) : null;
    const left = () => M.filter(x => !got.has(x.c));
    const mark = () => { const n = left()[0]; if (!n) return; ctx.test.mark(multi && (n.k || 0) !== col ? [box.querySelector(`.mt-pal[data-k="${n.k || 0}"]`), cell(n.c)] : [cell(n.c)]); };
    if (box) box.addEventListener('click', e => { const b = e.target.closest('.mt-pal'); if (!b) return; col = +b.dataset.k; box.querySelectorAll('.mt-pal').forEach(x => x.classList.toggle('sel', x === b)); mark(); });
    const tap = b => { const c = +b.dataset.c; if (got.has(c)) return;
      if (want.has(c) && want.get(c) === col) { got.add(c); b.classList.add('on'); b.style.setProperty('--k', act.colors[col]); voice.sfx ? voice.sfx('__dung') : null;
        if (!left().length) { ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0 }); ui.stage.querySelector('.mt-copy').classList.add('done'); voice.say(['__jingle', act.done]).then(done); }
        else mark(); }
      else { wrong++; ui.shake(b); voice.speak(['__boing']); if (want.has(c) && multi) voice.say([fill(act.pick_color || 'Bé chọn màu {name}.', { name: act.color_names[want.get(c)] })]); else if (wrong === 2 && act.hint) voice.say([act.hint]); } };
    G.addEventListener('click', e => { const b = e.target.closest('.mt-c'); if (b && !voice.busy) tap(b); });
    setAuto(ctx, async () => { for (const x of [...left()]) { if (multi && (x.k || 0) !== col) box.querySelector(`.mt-pal[data-k="${x.k || 0}"]`).click(); tap(cell(x.c)); await sleep(ctx, 40); while (voice.busy) await sleep(ctx, 50); } },
      () => { const c = [...Array(N).keys()].find(c => !want.has(c)); if (c !== undefined) tap(cell(c)); });
    mark();
    voice.say(first ? [...(act.intro || []), act.q].filter(Boolean) : [act.again || act.q].filter(Boolean));
  });
}

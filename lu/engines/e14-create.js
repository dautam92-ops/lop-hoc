// E14 – Sáng tạo tự do: không có đáp án duy nhất, không chấm đúng sai (chỉ ghi "đã tham gia").
//   draw    : vẽ bằng bút sáp trên giấy. Có thể có hình vẽ sẵn (base, nét liền) và tranh nét đứt (trace) để bé tô theo.
//             KHÔNG hỏi lại "bé đã vẽ gì" bằng vài hình có sẵn (tam 26/11 18:25: bé vẽ gì cũng được nên hỏi vậy không hợp;
//             thay bằng tô theo nét đứt của tranh cho sẵn). Vẽ xong Lu khen chung một lần.
//   sticker : trang trí khung cảnh bằng cách kéo hình dán vào tranh, đặt ở đâu cũng được.
// Tranh của bé lưu trong "Tủ tranh" trên máy, không gửi đi đâu (S13).
import { vis, esc, sleep, setAuto, svgPoint, saveArtwork, frameHTML, req, motNgon } from './kit.js';
import { dragOrTap } from '../core/lu-core.js';

export const id = 'E14', version = '1.0.0', name = 'Xây dựng, trang trí tự do';
const CRAYONS = [['#e0705a', 'đỏ'], ['#f0a050', 'cam'], ['#f6c85f', 'vàng'], ['#8fae3e', 'xanh lá'], ['#6aa6c8', 'xanh dương'], ['#a58bc9', 'tím'], ['#6b5232', 'nâu']];

export function validate(act) {
  const e = req(act, ['mode', 'skill_id', 'title', 'done']);
  if (act.mode === 'draw' && act.ideas) e.push(`${act.activity_id}: không hỏi lại "bé đã vẽ gì" bằng hình có sẵn (tam 26/11); dùng tranh nét đứt "trace" để bé tô theo`);
  if (act.mode === 'sticker') e.push(...req(act, ['stickers']));
  return e;
}
export const generate = () => ({ rounds: [{}] });
export const verify = () => [];
export const lines = act => [...(act.intro || []), act.done, act.empty, act.more].filter(Boolean);
export async function mount(ctx, act) { await (act.mode === 'sticker' ? sticker : draw)(ctx, act); ctx.tick?.(); }

function draw(ctx, act) {
  const { ui, voice } = ctx;
  return new Promise(done => {
    ui.scene(act.title, `<div class="draw-pad"><svg class="dw-svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#fffdf6"/>${act.trace ? `<g class="dw-trace" fill="none" stroke="#a8916a" stroke-width="6" stroke-dasharray="2 14" stroke-linecap="round" stroke-linejoin="round">${act.trace}</g>` : ''}${act.base ? `<g class="dw-base" fill="none" stroke="#6b5232" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${act.base}</g>` : ''}<g class="dw-ink"></g></svg></div>`);
    const svg = ui.stage.querySelector('.dw-svg'), inkG = svg.querySelector('.dw-ink');
    let col = CRAYONS[0][0], width = 9, strokes = 0, cur = null, pts = [];
    const box = ui.answers('Bé chọn màu bút sáp', CRAYONS.map(([c, n], i) => `<button class="opt crayon${i === 0 ? ' on' : ''}" data-c="${c}" aria-label="màu ${n}" style="--c:${c}">${vis('art:but-sap:' + encodeURIComponent(c))}</button>`).join('') +
      `<button class="opt dw-undo" aria-label="xóa nét vừa vẽ">${UNDO}</button><button class="big-btn dw-done">Vẽ xong</button>`);
    box.addEventListener('click', e => { const b = e.target.closest('.crayon'); if (!b) return; box.querySelectorAll('.crayon').forEach(x => x.classList.remove('on')); b.classList.add('on'); col = b.dataset.c; });
    box.querySelector('.dw-undo').onclick = () => { inkG.lastElementChild?.remove(); strokes = inkG.children.length; };
    // Tay tì (tam 27/11 22:57): chỉ một ngón vẽ; tay tì trong hay ngoài vùng vẽ không làm đứt nét, không thêm nét lạ (kit.js motNgon)
    motNgon(svg, { isBusy: () => voice.busy,
      onStart: (cx, cy) => { const q = svgPoint(svg, cx, cy); pts = [[q.x, q.y]];
        cur = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); cur.setAttribute('class', 'dw-line'); cur.setAttribute('stroke', col); cur.setAttribute('stroke-width', width); cur.setAttribute('points', `${q.x},${q.y} ${q.x + .1},${q.y}`); inkG.appendChild(cur); },
      onMove: (cx, cy) => { if (!cur) return; const q = svgPoint(svg, cx, cy); pts.push([q.x, q.y]); cur.setAttribute('points', pts.map(p => p.join(',')).join(' ')); },
      onEnd: () => { if (cur) { strokes++; cur = null; } },
      // nét bỏ dở vì tay đặt trước rồi ngón khác vẽ: xóa nét chấm thừa; trình duyệt hủy chạm giữa chừng: giữ phần đã vẽ
      onCancel: () => { if (!cur) return; if (pts.length < 3) cur.remove(); else strokes++; cur = null; } });
    const doneBtn = box.querySelector('.dw-done');
    const finish = async () => {
      saveArtwork('ve', svg.outerHTML);
      ctx.record({ skill_id: act.skill_id, kind: 'participation', correct: true, first_try: true, tries: 1, hints: 0, strokes });
      voice.say(['__jingle', act.done]).then(done);
    };
    doneBtn.onclick = () => { if (voice.busy) return; if (strokes < (act.min_strokes || 2)) return voice.say([act.empty || 'Bé vẽ thêm vài nét nữa nhé.']); finish(); };
    ctx.test.mark([doneBtn]);
    setAuto(ctx, async () => { // vẽ vài nét mẫu rồi bấm xong
      for (let s = 0; s < 3; s++) { const c = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); c.setAttribute('class', 'dw-line'); c.setAttribute('stroke', CRAYONS[s][0]); c.setAttribute('stroke-width', width);
        c.setAttribute('points', Array.from({ length: 20 }, (_, i) => `${200 + Math.cos(i / 3 + s) * (40 + s * 30)},${150 + Math.sin(i / 3 + s) * (40 + s * 20)}`).join(' ')); inkG.appendChild(c); strokes++; await sleep(ctx, 60); }
      doneBtn.click(); }, () => doneBtn.click());
    voice.say(act.intro || []);
  });
}
const UNDO = `<svg viewBox="0 0 24 24" class="lu-ic" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12h-2" transform="translate(0 -6)"/></svg>`;

// keep: true = giữ hình bé đã dán ở bài tập sticker trước (cùng một bức tranh qua nhiều bài tập)
let lastDrop = '';
function sticker(ctx, act) {
  const { ui, voice } = ctx; let placed = 0, sel = null;
  return new Promise(done => {
    ui.scene(act.title, `<div class="stk-scene">${frameHTML({ bg: act.bg })}<div class="stk-drop"></div></div>`);
    const sc = ui.stage.querySelector('.stk-scene'), drop = sc.querySelector('.stk-drop'); drop.innerHTML = act.keep ? lastDrop : '';
    const tray = ui.answers('Kéo hình dán vào tranh', act.stickers.map((s, i) => `<div class="piece stk" data-i="${i}">${vis(s)}</div>`).join('') + `<button class="big-btn stk-done">Xong rồi</button>`); tray.classList.add('tray');
    const put = (p, x, y) => { const r = drop.getBoundingClientRect(); const px = Math.max(4, Math.min(96, (x - r.left) / r.width * 100)), py = Math.max(6, Math.min(96, (y - r.top) / r.height * 100));
      drop.insertAdjacentHTML('beforeend', `<span class="stk-on" style="left:${px}%;top:${py}%">${vis(act.stickers[+p.dataset.i])}</span>`); placed++; };
    tray.querySelectorAll('.stk').forEach(p => dragOrTap(p, { isBusy: () => voice.busy, targetClass: 'stk-drop', onDrop: (pc, t, ) => {}, onSelect: x => { sel = x; tray.querySelectorAll('.stk').forEach(y => y.classList.toggle('sel', y === x)); } }));
    // dragOrTap báo onDrop không kèm tọa độ: theo dõi điểm thả bằng pointerup trên tài liệu
    document.addEventListener('pointerup', e => { const g = document.querySelector('.piece.drag'); if (!g) return; const el = document.elementsFromPoint(e.clientX, e.clientY).find(x => x === drop); if (el) { const src = tray.querySelector('.stk.ghost'); if (src) put(src, e.clientX, e.clientY); } }, true);
    drop.onclick = e => { if (voice.busy || !sel) return; put(sel, e.clientX, e.clientY); };
    const doneBtn = tray.querySelector('.stk-done');
    doneBtn.onclick = () => { if (voice.busy) return; if (placed < (act.min || 3) && ctx.fast) { const r = drop.getBoundingClientRect(); for (let i = placed; i < (act.min || 3); i++) put(tray.querySelectorAll('.stk')[i % act.stickers.length], r.left + r.width * (.2 + .25 * i), r.top + r.height * .5); } /* chạy thử tự động: tự dán đủ hình */
      if (placed < (act.min || 3)) return voice.say([act.more || 'Bé dán thêm vài hình nữa nhé.']);
      lastDrop = drop.innerHTML; saveArtwork('dan-hinh', sc.innerHTML); ctx.record({ skill_id: act.skill_id, kind: 'participation', correct: true, first_try: true, tries: 1, hints: 0, placed }); voice.say(['__jingle', act.done]).then(done); };
    ctx.test.mark([doneBtn]);
    setAuto(ctx, async () => { const r = drop.getBoundingClientRect(); for (let i = 0; i < Math.max(act.min || 3, 3); i++) { put(tray.querySelectorAll('.stk')[i % act.stickers.length], r.left + r.width * (.2 + .25 * i), r.top + r.height * (.4 + .1 * (i % 2))); await sleep(ctx, 80); } doneBtn.click(); }, () => doneBtn.click());
    voice.say(act.intro || []);
  });
}

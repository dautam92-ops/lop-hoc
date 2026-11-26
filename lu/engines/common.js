// Phần dùng chung của các engine: vẽ ô đáp án, kiểm tra biến thể chung.
import { esc } from '../core/lu-core.js';
import { vis } from '../ui/art.js';
export { vis };
// Lời khen ngắn tiếng Việt cho mỗi lượt đúng trong phần tiếng Việt (S07-R02, quy tắc ngôn ngữ 26/11).
// '__ok' / '__no' là tiếng Anh, CHỈ dùng trong phần học tiếng Anh.
export const OK_VI = ['Đúng rồi!', 'Bé giỏi lắm!', 'Chính xác rồi!'];
let okN = 0; export const okVi = () => OK_VI[okN++ % OK_VI.length];

// Nhóm n vật xếp gọn trong ô: dùng groupHTML của ui/art.js (cũng gọi được qua vis('art:tao*3')).
export { groupHTML } from '../ui/art.js';
import { groupHTML } from '../ui/art.js';

export const BAL_COLORS = ['#ff4d4d', '#2f80ed', '#ffb020', '#22b07d', '#a66cff'];
export const balloonSVG = c => `<svg viewBox="0 0 64 120" aria-hidden="true"><path d="M32 4C15 4 6 18 6 33c0 19 15 33 26 38 11-5 26-19 26-38C58 18 49 4 32 4z" fill="${c}"/><ellipse cx="22" cy="24" rx="6" ry="10" fill="#fff6"/><path d="M32 71l-4 6h8z" fill="${c}"/><path d="M32 77c-7 10 7 18 0 40" fill="none" stroke="#5d6e7a" stroke-width="2"/></svg>`;

// Kiểu ô đáp án. Ô cảm xúc chỉ có gương mặt, không có chữ (S02-R09).
// D43: đáp án dạng chữ luôn có nhãn A, B, C và được đọc to bằng tiếng Việt (trẻ 4–6 tuổi chưa đọc được).
export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'G'];
export const letterLine = L => `Đáp án ${L}.`;
export const optSay = o => o.say || o.t;
export const textOpts = (opts, style) => style === 'wide';
export const readOptLines = list => list.flatMap((o, k) => [letterLine(LETTERS[k]), optSay(o)]).filter(Boolean);
export function optHTML(o, i, style, letter = '') {
  const attrs = `data-i="${i}"`;
  const tag = letter ? `<span class="opt-letter" aria-hidden="true">${letter}</span>` : '';
  switch (style) {
    case 'face': return `<button class="opt face" ${attrs} aria-label="lựa chọn ${i + 1}">${vis(o.e)}</button>`;
    case 'wide': return `<button class="opt wide" ${attrs}${letter ? ` aria-label="Đáp án ${letter}: ${esc(o.t || '')}"` : ''}>${tag}<span class="em">${vis(o.e)}</span>${esc(o.t)}</button>`;
    case 'plate': return `<button class="opt plate" ${attrs}>${o.n ? groupHTML(o.e, o.n) : vis(o.e)}</button>`;
    case 'number': return `<button class="opt" ${attrs}>${o.v}<span class="dots">${'●'.repeat(o.v)}</span></button>`;
    case 'color': return `<button class="opt" ${attrs} aria-label="lựa chọn ${i + 1}"><span class="color-ball" style="background:${o.c}"></span></button>`;
    default: return `<button class="opt face" ${attrs}>${vis(o.e)}</button>`;
  }
}

// Kiểm tra chung cho một vòng chọn đáp án (S09-R03)
export function verifyChoice(opts, answerIdx, where) {
  const errs = [];
  if (!Array.isArray(opts) || opts.length < 2) errs.push(`${where}: cần ít nhất 2 phương án`);
  else {
    if (!(answerIdx >= 0 && answerIdx < opts.length)) errs.push(`${where}: đáp án không nằm trong các phương án`);
    const keys = opts.map(o => JSON.stringify([o.e, o.t, o.v, o.c, o.w, o.n]));
    if (new Set(keys).size !== keys.length) errs.push(`${where}: có phương án trùng nhau`);
  }
  return errs;
}

export const need = (act, fields) => fields.filter(f => act[f] === undefined || act[f] === null || act[f] === '').map(f => `${act.activity_id}: thiếu trường "${f}"`);

// Đợi một lần chạm hợp lệ (khi giọng đọc xong) trên vùng chứa
export const onTap = (box, sel, voice, fn) => { box.addEventListener('click', e => { const b = e.target.closest(sel); if (!b || voice.busy) return; fn(b); }); };

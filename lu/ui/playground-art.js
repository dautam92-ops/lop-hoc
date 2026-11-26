// Tranh nhỏ cho 12 sân chơi: mỗi sân là một cảnh màu nước riêng (không dùng biểu tượng đường nét chung).
// Vẽ bằng mã cho tới khi Art Factory có bìa đã duyệt (slot bia-san-choi-XX trong content/asset-slots.json).
import { INK } from './art.js';

const wc = s => `<g filter="url(#lu-wc)">${s}</g>`;
const pen = (s, w = 1.8) => `<g filter="url(#lu-pencil)" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity=".85">${s}</g>`;
const bg = (sky, g1, g2) => wc(`<rect width="160" height="120" fill="${sky}"/><path d="M0 84 Q40 70 80 80 T160 76 V120 H0z" fill="${g1}"/><path d="M0 98 Q50 88 100 96 T160 94 V120 H0z" fill="${g2}"/>`)
;
const sun = (x, y, r = 9) => wc(`<circle cx="${x}" cy="${y}" r="${r}" fill="#f6c85f"/>`);
const cloud = (x, y) => wc(`<path d="M${x} ${y}a7 7 0 0 1 12-5 9 9 0 0 1 16 3 6 6 0 0 1 0 12h-26a5 5 0 0 1-2-10z" fill="#fff" opacity=".9"/>`);
const tree = (x, y, s = 1, c = '#7fb36b') => wc(`<rect x="${x - 2 * s}" y="${y - 4 * s}" width="${4 * s}" height="${14 * s}" fill="#9a7445"/><circle cx="${x}" cy="${y - 10 * s}" r="${11 * s}" fill="${c}"/>`) + pen(`<circle cx="${x}" cy="${y - 10 * s}" r="${11 * s}"/>`, 1.4);
const house = (x, y, wall, roof, s = 1) => wc(`<rect x="${x}" y="${y}" width="${26 * s}" height="${20 * s}" fill="${wall}"/><path d="M${x - 4 * s} ${y + 1}L${x + 13 * s} ${y - 14 * s}L${x + 30 * s} ${y + 1}z" fill="${roof}"/><rect x="${x + 10 * s}" y="${y + 8 * s}" width="${7 * s}" height="${12 * s}" fill="#a77a4a"/>`)
  + pen(`<path d="M${x} ${y}v${20 * s}h${26 * s}v${-20 * s}M${x - 4 * s} ${y + 1}L${x + 13 * s} ${y - 14 * s}L${x + 30 * s} ${y + 1}"/>`, 1.4);
const flowerFace = (x, y, petal, mouth) => wc(`${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${x}" cy="${y - 8}" rx="5" ry="8" fill="${petal}" transform="rotate(${a} ${x} ${y})"/>`).join('')}<circle cx="${x}" cy="${y}" r="7" fill="#fbe7a6"/><path d="M${x} ${y + 7}v18" stroke="#6f9a3e" stroke-width="3"/><ellipse cx="${x + 6}" cy="${y + 18}" rx="6" ry="3" fill="#7fb36b"/>`)
  + `<circle cx="${x - 2.5}" cy="${y - 1}" r="1.1" fill="${INK}"/><circle cx="${x + 2.5}" cy="${y - 1}" r="1.1" fill="${INK}"/><path d="${mouth(x, y)}" stroke="${INK}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;

const SCENES = {
  // Thị trấn tiếng Anh: phố nhỏ, bạn chào "Hi!"
  P01: () => bg('#dcecf3', '#c9dea0', '#b5d08a') + cloud(18, 18) + house(18, 66, '#f6e6c6', '#6aa6c8') + house(60, 60, '#fbe3d6', '#e48a76', 1.15) + house(108, 68, '#eef2d8', '#8fae3e', .9)
    + wc(`<path d="M104 18h40a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8h-26l-8 8v-8h-6a8 8 0 0 1-8-8v-12a8 8 0 0 1 8-8z" fill="#fff"/>`)
    + pen(`<path d="M104 18h40a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8h-26l-8 8v-8h-6a8 8 0 0 1-8-8v-12a8 8 0 0 1 8-8z"/>`, 1.4)
    + `<text x="124" y="38" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="17" fill="#4f8fa3">Hi!</text>`,
  // Siêu thị toán học: quầy hàng mái sọc, táo cam, đồng xu
  P02: () => bg('#fbf0d2', '#e8d6a8', '#dcc48f') + wc(`<rect x="30" y="50" width="100" height="44" fill="#f6e6c6"/><rect x="34" y="72" width="92" height="5" fill="#c9a36a"/>`)
    + wc(`<path d="M24 30h112l-4 16H28z" fill="#fff6e2"/>${[0, 2, 4, 6].map(i => `<path d="M${24 + i * 14} 30h14l-1 16h-13z" fill="#e48a76"/>`).join('')}<path d="M28 46${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `a6.5 5 0 0 0 13 0`).join('')}z" fill="#e48a76"/>`)
    + pen(`<path d="M24 30h112l-4 16H28zM30 50v44h100V50"/>`, 1.4)
    + wc(`${[44, 56, 68].map(x => `<circle cx="${x}" cy="66" r="5.5" fill="#e0705a"/>`).join('')}${[92, 104, 116].map(x => `<circle cx="${x}" cy="66" r="5.5" fill="#f0a640"/>`).join('')}${[46, 60, 74, 88, 102, 116].map((x, i) => `<rect x="${x - 5}" y="80" width="10" height="10" rx="2" fill="${['#9fc8e0', '#f6c85f', '#a58bc9'][i % 3]}"/>`).join('')}`)
    + wc(`<circle cx="18" cy="104" r="8" fill="#f6c85f"/><circle cx="142" cy="102" r="7" fill="#f6c85f"/>`) + pen(`<circle cx="18" cy="104" r="8"/><circle cx="142" cy="102" r="7"/>`, 1.2) + `<text x="18" y="108" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="10" fill="#a87a1e">1</text><text x="142" y="106" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="9" fill="#a87a1e">2</text>`,
  // Rừng logic: hàng cây theo quy luật tròn – nhọn – tròn – nhọn – ?
  P03: () => bg('#e3efd9', '#b8d48f', '#9fc278') + [20, 50, 80, 110].map((x, i) => i % 2 ? wc(`<rect x="${x - 2}" y="70" width="4" height="12" fill="#9a7445"/><path d="M${x} 38l15 34h-30z" fill="#4c8540"/>`) + pen(`<path d="M${x} 38l15 34h-30z"/>`, 1.4) : tree(x, 78, 1.25, '#7fb36b')).join('')
    + wc(`<rect x="128" y="50" width="22" height="26" rx="6" fill="#fffaf0"/>`) + pen(`<rect x="128" y="50" width="22" height="26" rx="6" stroke-dasharray="3 3"/>`, 1.4) + `<text x="139" y="70" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="18" fill="#5e9a4f">?</text>`,
  // Vườn cảm xúc: những bông hoa có khuôn mặt vui, ngạc nhiên, bình tĩnh
  P04: () => bg('#fbe6ea', '#d7e8b5', '#c4dc98') + sun(26, 22) + flowerFace(40, 58, '#e98b9a', (x, y) => `M${x - 3} ${y + 2}q3 3 6 0`) + flowerFace(80, 48, '#f6c85f', (x, y) => `M${x - 1.6} ${y + 3}a1.6 1.8 0 1 0 3.2 0a1.6 1.8 0 1 0 -3.2 0`) + flowerFace(120, 58, '#a58bc9', (x, y) => `M${x - 3} ${y + 3}h6`),
  // Đảo chữ số: đảo nhỏ có cây dừa, đá bước số 1 2 3
  P05: () => wc(`<rect width="160" height="120" fill="#cfe6ec"/><path d="M0 70 Q40 62 80 70 T160 66 V120 H0z" fill="#a9d3e0"/><ellipse cx="104" cy="74" rx="44" ry="14" fill="#efd9a8"/>`)
    + wc(`<path d="M108 74c0-18-3-30 4-44" stroke="#9a7445" stroke-width="5" fill="none"/><path d="M112 30c-16-6-28 0-32 8 12-3 22-2 32-8zM112 30c14-8 26-4 30 4-12-2-20-1-30-4zM112 30c-4-12 2-20 10-22-4 8-6 14-10 22z" fill="#5e9a4f"/>`) + pen(`<path d="M108 74c0-18-3-30 4-44"/>`, 1.3) + sun(30, 24)
    + [[22, 96, 1], [46, 102, 2], [70, 94, 3]].map(([x, y, n]) => wc(`<ellipse cx="${x}" cy="${y}" rx="12" ry="7" fill="#e2c389"/>`) + `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="14" fill="${INK}">${n}</text>`).join(''),
  // Vườn chữ cái: chữ mọc lên từ luống đất cạnh cuốn sách mở
  P06: () => bg('#efe7f6', '#d7e8b5', '#c4dc98') + wc(`<path d="M18 92h124v10H18z" fill="#a77a4a"/>`) + [['a', 36, '#e48a76'], ['b', 64, '#6aa6c8'], ['c', 92, '#a58bc9']].map(([l, x, c]) => wc(`<path d="M${x} 92v-16" stroke="#6f9a3e" stroke-width="3"/><ellipse cx="${x + 6}" cy="84" rx="6" ry="3" fill="#7fb36b"/>`) + `<text x="${x}" y="74" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="30" fill="${c}">${l}</text>`).join('')
    + wc(`<path d="M112 70q12-6 22 0v22q-10-6-22 0zM134 70q10-6 22 0v22q-12-6-22 0z" fill="#fffaf0"/>`) + pen(`<path d="M112 70q12-6 22 0v22q-10-6-22 0zM134 70q10-6 22 0v22q-12-6-22 0z"/>`, 1.3),
  // Lâu đài trí nhớ: lâu đài có cờ, thẻ úp và một thẻ lật
  P07: () => bg('#e7e3f4', '#cfd9b0', '#bccb98') + wc(`<rect x="52" y="40" width="56" height="44" fill="#e9dcc6"/><rect x="44" y="30" width="16" height="54" fill="#dccdb2"/><rect x="100" y="30" width="16" height="54" fill="#dccdb2"/><path d="M44 30l8-12 8 12zM100 30l8-12 8 12z" fill="#8a7fc0"/><path d="M72 84v-16a8 8 0 0 1 16 0v16z" fill="#a77a4a"/><path d="M52 18v-10l10 4-10 4M108 18v-10l10 4-10 4" fill="#e48a76"/>`)
    + pen(`<rect x="52" y="40" width="56" height="44"/><rect x="44" y="30" width="16" height="54"/><rect x="100" y="30" width="16" height="54"/><path d="M52 18V6M108 18V6"/>`, 1.3)
    + [18, 132].map(x => wc(`<rect x="${x - 9}" y="90" width="18" height="22" rx="3" fill="#8a7fc0"/>`)).join('') + wc(`<rect x="66" y="92" width="18" height="22" rx="3" fill="#fffaf0"/>`) + pen(`<rect x="66" y="92" width="18" height="22" rx="3"/>`, 1.2) + `<path d="M75 97l2 4 4 .6-3 3 .7 4-3.7-2-3.7 2 .7-4-3-3 4-.6z" fill="#f6c85f"/>`,
  // Học viện thám tử: kính lúp soi dấu chân trên lối mòn
  P08: () => bg('#f3e6dc', '#d9cf9e', '#c9bd85') + wc(`<path d="M0 100 Q60 84 100 92 T160 84 V108 Q100 100 60 110 T0 116z" fill="#e8d6a8"/>`) + [[18, 106], [32, 100], [46, 104], [60, 97]].map(([x, y], i) => wc(`<g transform="rotate(${70 + (i % 2 ? 10 : -10)} ${x} ${y})" fill="#8a6a44" opacity=".55"><ellipse cx="${x}" cy="${y - 2}" rx="3.4" ry="4.6"/><ellipse cx="${x}" cy="${y + 5}" rx="2.6" ry="2.4"/></g>`)).join('') + tree(132, 72, 1, '#6f9a3e')
    + wc(`<circle cx="92" cy="52" r="20" fill="#e3f1f6" opacity=".85"/><path d="M106 66l16 16" stroke="#9a7445" stroke-width="8" stroke-linecap="round"/>`) + pen(`<circle cx="92" cy="52" r="20"/><path d="M106 66l16 16"/>`, 2) + wc(`<ellipse cx="90" cy="54" rx="4" ry="6" fill="#a77a4a" opacity=".7"/>`),
  // Phòng thí nghiệm Lu: bình nổi bọt, chậu mầm, nam châm
  P09: () => bg('#dfeef0', '#d5dcb8', '#c6cea2') + wc(`<rect x="14" y="88" width="132" height="8" fill="#c9a36a"/>`) + wc(`<path d="M52 36h16v16l14 30a6 6 0 0 1-6 8H44a6 6 0 0 1-6-8l14-30z" fill="#e3f1f6"/><path d="M40 74h40l4 8a6 6 0 0 1-6 8H42a6 6 0 0 1-6-8z" fill="#7fc0b0"/>`) + pen(`<path d="M52 36h16v16l14 30a6 6 0 0 1-6 8H44a6 6 0 0 1-6-8l14-30zM50 36h20"/>`, 1.4)
    + wc([[56, 28, 4], [64, 18, 3], [58, 10, 2.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#bfe3da"/>`).join(''))
    + wc(`<path d="M100 88l4-18h20l4 18z" fill="#c4704f"/><path d="M114 70c0-10 0-16 1-20" stroke="#6f9a3e" stroke-width="3" fill="none"/><path d="M115 52c-8-4-14 0-16 4 6-1 10 0 16-4zM115 52c7-5 13-2 15 2-6 0-10 0-15-2z" fill="#7fb36b"/>`) + pen(`<path d="M100 88l4-18h20l4 18z"/>`, 1.3)
    + wc(`<path d="M132 30v14a8 8 0 0 0 16 0V30h-5v14a3 3 0 0 1-6 0V30z" fill="#e0705a"/><rect x="132" y="28" width="5" height="5" fill="#ddd"/><rect x="143" y="28" width="5" height="5" fill="#ddd"/>`),
  // Xưởng sáng tạo: giá vẽ, bảng màu, lọ bút
  P10: () => bg('#fbe8df', '#e6d9b8', '#d9c99f') + wc(`<path d="M50 104l14-74M98 104L84 30M74 30v76" stroke="#a77a4a" stroke-width="4"/><rect x="48" y="30" width="52" height="40" fill="#fffaf0"/><path d="M54 62q12-20 22-8t20-6v16H54z" fill="#9fc8e0"/><circle cx="88" cy="40" r="6" fill="#f6c85f"/>`) + pen(`<rect x="48" y="30" width="52" height="40"/>`, 1.4)
    + wc(`<path d="M112 92c0-12 10-20 22-20s18 6 18 12-6 6-10 6-6 4-4 8-4 6-12 6-14-4-14-12z" fill="#f3e2c2"/>${[['#e0705a', 124, 82], ['#f6c85f', 134, 78], ['#6aa6c8', 144, 82], ['#7fb36b', 122, 92]].map(([c, x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="${c}"/>`).join('')}`)
    + wc(`<rect x="16" y="82" width="18" height="22" fill="#6aa6c8"/><path d="M20 82l-4-20M26 82v-24M30 82l6-18" stroke="#a77a4a" stroke-width="2.4"/><circle cx="16" cy="61" r="2.6" fill="#e48a76"/><circle cx="26" cy="57" r="2.6" fill="#f6c85f"/><circle cx="36" cy="63" r="2.6" fill="#7fb36b"/>`),
  // Thành phố tự lập: đèn giao thông, vạch qua đường, ngôi nhà có trái tim
  P11: () => bg('#e5efe0', '#cfdcb4', '#bdcd9c') + wc(`<path d="M0 96h160v16H0z" fill="#b9b1a2"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${44 + i * 12}" y="99" width="7" height="10" fill="#fff"/>`).join('')}`) + house(98, 58, '#f6e6c6', '#d9774f', 1.2)
    + wc(`<path d="M114 72c-3-4-9-1-6 4l6 5 6-5c3-5-3-8-6-4z" fill="#e0705a"/>`) + wc(`<rect x="32" y="56" width="4" height="40" fill="#8b8172"/><rect x="24" y="26" width="20" height="34" rx="5" fill="#5e5548"/><circle cx="34" cy="34" r="4.5" fill="#e0705a"/><circle cx="34" cy="44" r="4.5" fill="#f6c85f"/><circle cx="34" cy="54" r="4.5" fill="#7fb36b"/>`) + pen(`<rect x="24" y="26" width="20" height="34" rx="5"/>`, 1.3) + cloud(60, 20),
  // Vương quốc âm nhạc: trống, nốt nhạc bay, lều cờ
  P12: () => bg('#fbe9d8', '#e4d7a8', '#d6c78e') + wc(`<path d="M106 76l20-36 20 36z" fill="#e48a76"/><path d="M126 40v-12l10 4-10 4" fill="#f6c85f"/><path d="M120 76l6-14 6 14z" fill="#a77a4a"/>`) + pen(`<path d="M106 76l20-36 20 36zM126 40V28"/>`, 1.3)
    + wc(`<ellipse cx="56" cy="74" rx="26" ry="8" fill="#f6e6c6"/><path d="M30 74v20a26 8 0 0 0 52 0V74" fill="#d9774f"/><path d="M34 80l8 16M46 82l4 16M62 82l-4 16M76 80l-8 16" stroke="#f6c85f" stroke-width="2.4"/><path d="M40 62l14 10M78 60l-16 12" stroke="#a77a4a" stroke-width="3.4" stroke-linecap="round"/>`) + pen(`<ellipse cx="56" cy="74" rx="26" ry="8"/><path d="M30 74v20a26 8 0 0 0 52 0V74"/>`, 1.3)
    + [[30, 34, '#a58bc9'], [62, 24, '#6aa6c8'], [92, 38, '#5e9a4f']].map(([x, y, c]) => wc(`<ellipse cx="${x}" cy="${y + 12}" rx="5" ry="4" fill="${c}" transform="rotate(-20 ${x} ${y + 12})"/><path d="M${x + 4.5} ${y + 11}V${y - 4}q6 2 8 8" stroke="${c}" stroke-width="2.4" fill="none"/>`)).join(''),
};

export const pgScene = (id, label = '') => `<svg class="lu-art pg-scene" viewBox="0 0 160 120" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}><clipPath id="pgc-${id}"><rect width="160" height="120" rx="18"/></clipPath><g clip-path="url(#pgc-${id})">${(SCENES[id] || SCENES.P05)()}</g></svg>`;
export const PG_SCENE_IDS = Object.keys(SCENES);

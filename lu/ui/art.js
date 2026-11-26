// Thư viện hình vẽ bằng code (SVG) theo phong cách Lu: màu nước loang nhẹ + nét bút chì nâu.
// Dùng cho đồ vật cần đếm chính xác, hình học, biểu cảm, huy hiệu môn học (D37: số lượng, chữ, hình học dựng bằng code).
// Hình minh họa phức tạp (con vật, cảnh) lấy từ Asset Registry sau khi Art Factory tạo và Admin duyệt.

export const INK = '#6b5232';
let defsDone = false;
export const ART_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<filter id="lu-wc" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="n"/>
 <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" result="d"/>
 <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="9" result="g"/>
 <feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -0.5 1.12" result="ga"/>
 <feComposite in="d" in2="ga" operator="in"/>
</filter>
<filter id="lu-pencil" x="-5%" y="-5%" width="110%" height="110%">
 <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2" result="n"/>
 <feDisplacementMap in="SourceGraphic" in2="n" scale="1.3" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="lu-wc-big" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="7" result="n"/>
 <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>
 <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="5" result="g"/>
 <feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -0.7 1.15" result="ga"/>
 <feComposite in="d" in2="ga" operator="in"/>
</filter>
<radialGradient id="lu-blush"><stop offset="0" stop-color="#f19a86" stop-opacity=".75"/><stop offset="1" stop-color="#f19a86" stop-opacity="0"/></radialGradient>
</defs></svg>`;
export function ensureArtDefs(doc = document) { if (defsDone || !doc?.body) return; doc.body.insertAdjacentHTML('afterbegin', ART_DEFS); defsDone = true; }

export const wrap = (inner, label = '', vb = '0 0 100 100') => `<svg class="lu-art" viewBox="${vb}" role="img"${label ? ` aria-label="${label}"` : ' aria-hidden="true"'}>${inner}</svg>`;
export const wc = s => `<g filter="url(#lu-wc)">${s}</g>`;
export const pen = s => `<g filter="url(#lu-pencil)" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${s}</g>`;
export const shadow = (cx = 50, cy = 90, rx = 26) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="4.5" fill="#6b5232" opacity=".12"/>`;

/* ---------- Đồ vật ---------- */
const BEAN = 'M36 30c9-8 25-6 31 6 4 8 0 14-5 18-4 3-4 8 0 12 6 7 0 19-14 18-15-1-24-14-22-30 1-10 4-18 10-24z';
export const ART = {
  'hat-dau': () => wrap(shadow(50, 90, 22) + wc(`<path d="${BEAN}" fill="#d9b46a"/><path d="M40 34c6-4 14-4 18 1" stroke="#fff4d6" stroke-width="5" stroke-linecap="round" fill="none" opacity=".7"/>`) +
    pen(`<path d="${BEAN}"/><path d="M60 52c-5 2-7 6-5 10" stroke-width="1.8"/>`), 'hạt đậu'),
  'mam-dau': () => wrap(shadow(50, 92, 22) + wc(`<path d="M30 58c4-12 36-12 40 0 3 12-6 26-20 26S27 70 30 58z" fill="#d9b46a"/><path d="M50 56c0-10 0-18 1-24" stroke="#7da23a" stroke-width="5" fill="none"/>
    <path d="M51 34c-12-2-20-10-20-20 12 0 20 7 20 20z" fill="#a9c75a"/><path d="M51 34c10-3 18-12 18-22-12 1-18 9-18 22z" fill="#8fae3e"/>`) +
    pen(`<path d="M30 58c4-12 36-12 40 0 3 12-6 26-20 26S27 70 30 58z"/><path d="M50 56c0-10 0-18 1-24"/><path d="M51 34c-12-2-20-10-20-20 12 0 20 7 20 20z"/><path d="M51 34c10-3 18-12 18-22-12 1-18 9-18 22z"/>`), 'mầm đậu'),
  'bong-bay': (c = '#e0705a') => wrap(wc(`<path d="M50 8C33 8 23 22 23 37c0 18 15 31 27 36 12-5 27-18 27-36C77 22 67 8 50 8z" fill="${c}"/><ellipse cx="39" cy="26" rx="6" ry="10" fill="#fff" opacity=".45"/>`) +
    pen(`<path d="M50 8C33 8 23 22 23 37c0 18 15 31 27 36 12-5 27-18 27-36C77 22 67 8 50 8z"/><path d="M50 73l-3 5h6z"/><path d="M50 78c-4 6 4 9 0 20" stroke-width="1.6"/>`), 'bóng bay'),
  la: (c = '#8fae3e') => wrap(wc(`<path d="M18 80C18 46 40 22 84 16 80 58 58 82 18 80z" fill="${c}"/>`) + pen(`<path d="M18 80C18 46 40 22 84 16 80 58 58 82 18 80z"/><path d="M18 80 70 30M40 58l-2-12M52 46l10 2" stroke-width="1.7"/>`), 'chiếc lá'),
  hoa: (c = '#e48a76') => wrap(shadow(50, 94, 14) + wc([0, 72, 144, 216, 288].map(a => `<ellipse cx="50" cy="26" rx="11" ry="16" fill="${c}" transform="rotate(${a} 50 42)"/>`).join('') + `<circle cx="50" cy="42" r="9" fill="#f6c85f"/><path d="M50 58v34" stroke="#7da23a" stroke-width="4"/>`) +
    pen(`<circle cx="50" cy="42" r="9"/><path d="M50 58v34M50 78c-8-6-14-4-16 0 6 4 12 4 16 0z"/>`), 'bông hoa'),
  sao: (c = '#f6c85f') => wrap(wc(`<path d="M50 8l11 24 26 3-19 18 5 26-23-13-23 13 5-26L13 35l26-3z" fill="${c}"/>`) + pen(`<path d="M50 8l11 24 26 3-19 18 5 26-23-13-23 13 5-26L13 35l26-3z"/>`), 'ngôi sao'),
  tao: () => wrap(shadow(50, 92, 24) + wc(`<path d="M50 30c-8-8-30-8-32 14-2 22 14 42 26 42 4 0 4-2 6-2s2 2 6 2c12 0 28-20 26-42-2-22-24-22-32-14z" fill="#d9604c"/><ellipse cx="34" cy="46" rx="5" ry="9" fill="#fff" opacity=".4"/><path d="M52 26c4-10 12-14 20-12-2 8-10 12-20 12z" fill="#8fae3e"/>`) +
    pen(`<path d="M50 30c-8-8-30-8-32 14-2 22 14 42 26 42 4 0 4-2 6-2s2 2 6 2c12 0 28-20 26-42-2-22-24-22-32-14z"/><path d="M50 30c0-6-1-12-4-16"/><path d="M52 26c4-10 12-14 20-12-2 8-10 12-20 12z"/>`), 'quả táo'),
  'chau-cay': () => wrap(shadow(50, 94, 24) + wc(`<path d="M28 60h44l-6 30H34z" fill="#c9825a"/><rect x="24" y="54" width="52" height="10" rx="4" fill="#b06e4b"/><path d="M50 54V32" stroke="#7da23a" stroke-width="4"/><path d="M50 36c-12 0-18-8-18-16 12 0 18 6 18 16zM50 32c10 0 16-8 16-16-11 0-16 6-16 16z" fill="#8fae3e"/>`) +
    pen(`<path d="M28 64h44l-6 26H34z"/><rect x="24" y="54" width="52" height="10" rx="4"/><path d="M50 54V32"/>`), 'chậu cây'),
  nen: () => wrap(shadow(50, 92, 18) + wc(`<rect x="38" y="44" width="24" height="44" rx="4" fill="#f6e6c6"/><path d="M50 14c-8 10-8 18 0 24 8-6 8-14 0-24z" fill="#f6c85f"/><path d="M50 22c-4 6-4 10 0 14 4-4 4-8 0-14z" fill="#e2a94b"/>`) +
    pen(`<rect x="38" y="44" width="24" height="44" rx="4"/><path d="M50 38v6"/><path d="M50 14c-8 10-8 18 0 24 8-6 8-14 0-24z"/>`), 'ngọn nến'),
  // Đồ vật cho buổi L001 bản 12 chặng (nền tạm vẽ bằng mã, thay bằng ảnh Asset Registry khi đã duyệt)
  ao: (c = '#e0705a') => wrap(shadow(50, 92, 26) + wc(`<path d="M34 18 18 28l8 18 8-5v41h32V41l8 5 8-18-16-10c-2 7-8 11-16 11s-14-4-16-11z" fill="${c}"/>`) + pen(`<path d="M34 18 18 28l8 18 8-5v41h32V41l8 5 8-18-16-10c-2 7-8 11-16 11s-14-4-16-11z"/>`), 'chiếc áo'),
  gio: () => wrap(shadow(50, 92, 30) + wc(`<path d="M16 46h68l-8 40H24z" fill="#c99a5b"/><path d="M22 58h56M24 70h52" stroke="#a77a4a" stroke-width="3"/>`) + pen(`<path d="M16 46h68l-8 40H24z"/><path d="M28 46c0-26 44-26 44 0"/>`), 'cái giỏ'),
  tui: () => wrap(shadow(50, 92, 24) + wc(`<path d="M34 30c-14 10-18 30-14 44 4 12 56 12 60 0 4-14 0-34-14-44z" fill="#e7d2a8"/><path d="M34 30h32l-4-10H38z" fill="#d7bc88"/>`) + pen(`<path d="M34 30c-14 10-18 30-14 44 4 12 56 12 60 0 4-14 0-34-14-44z"/><path d="M34 30h32"/><path d="M40 26c6 4 14 4 20 0" stroke="#a24f3c" stroke-width="2.6"/>`), 'túi hạt'),
  'qua-dau': () => wrap(shadow(50, 90, 26) + wc(`<path d="M18 70C28 40 58 22 84 22c-4 30-34 52-66 48z" fill="#8fbf55"/><circle cx="40" cy="58" r="6" fill="#a9d36b"/><circle cx="54" cy="46" r="6" fill="#a9d36b"/><circle cx="68" cy="34" r="6" fill="#a9d36b"/>`) + pen(`<path d="M18 70C28 40 58 22 84 22c-4 30-34 52-66 48z"/><path d="M84 22c2-6 6-10 10-10"/>`), 'quả đậu'),
  coc: (n = '') => wrap(shadow(50, 94, 16) + wc(`<rect x="22" y="12" width="56" height="44" rx="8" fill="#f1dcb4"/><rect x="45" y="56" width="10" height="36" fill="#b4835a"/>`) + pen(`<rect x="22" y="12" width="56" height="44" rx="8"/><rect x="45" y="56" width="10" height="36"/>`) + (n ? `<text x="50" y="47" text-anchor="middle" font-size="36" font-weight="800" fill="${INK}" font-family="var(--lu-font-display, sans-serif)">${n}</text>` : ''), n ? `cọc số ${n}` : 'cọc gỗ'),
  // Buổi L001 dạng nhiều bài nhỏ (D46): đồ vật vẽ bằng mã, cùng nét chì + màu nước
  'binh-tuoi': () => wrap(shadow(50, 92, 28) + wc(`<path d="M24 44h40l-4 42H28z" fill="#6aa6c8"/><path d="M64 52l22-16 4 6-24 18z" fill="#5b93b4"/><ellipse cx="44" cy="44" rx="20" ry="5" fill="#8cc3d8"/>`) +
    pen(`<path d="M24 44h40l-4 42H28z"/><path d="M64 52l22-16 4 6-24 18"/><path d="M30 44c0-16 28-16 28 0"/><path d="M90 30l4-4M92 38h6M86 24l1-6" stroke-width="1.8"/>`), 'bình tưới'),
  'mat-troi': () => wrap(wc(`<circle cx="50" cy="50" r="22" fill="#f6c85f"/>` + Array.from({ length: 8 }, (_, i) => `<path d="M50 10v12" stroke="#f2b33d" stroke-width="7" stroke-linecap="round" transform="rotate(${i * 45} 50 50)"/>`).join('')) + pen(`<circle cx="50" cy="50" r="22"/>`), 'mặt trời'),
  'mat-trang': () => wrap(wc(`<path d="M62 14a36 36 0 1 0 22 52A30 30 0 0 1 62 14z" fill="#f3e3a6"/>`) + pen(`<path d="M62 14a36 36 0 1 0 22 52A30 30 0 0 1 62 14z"/>`), 'mặt trăng'),
  'giot-nuoc': () => wrap(wc(`<path d="M50 12C40 30 28 44 28 60a22 22 0 0 0 44 0c0-16-12-30-22-48z" fill="#8cc3d8"/><ellipse cx="42" cy="58" rx="4" ry="8" fill="#fff" opacity=".5"/>`) + pen(`<path d="M50 12C40 30 28 44 28 60a22 22 0 0 0 44 0c0-16-12-30-22-48z"/>`), 'giọt nước'),
  soi: () => wrap(shadow(50, 84, 24) + wc(`<path d="M24 64c0-14 12-24 28-24s26 10 26 22-12 20-28 20-26-6-26-18z" fill="#b8b2a6"/><ellipse cx="42" cy="54" rx="7" ry="4" fill="#fff" opacity=".35"/>`) + pen(`<path d="M24 64c0-14 12-24 28-24s26 10 26 22-12 20-28 20-26-6-26-18z"/>`), 'viên sỏi'),
  'xa-phong': () => wrap(shadow(50, 84, 28) + wc(`<rect x="22" y="44" width="56" height="34" rx="14" fill="#f3b6c4"/><circle cx="70" cy="30" r="8" fill="#e8f3f8"/><circle cx="56" cy="22" r="5" fill="#e8f3f8"/><circle cx="80" cy="18" r="4" fill="#e8f3f8"/>`) +
    pen(`<rect x="22" y="44" width="56" height="34" rx="14"/><circle cx="70" cy="30" r="8"/><circle cx="56" cy="22" r="5"/><circle cx="80" cy="18" r="4"/>`), 'bánh xà phòng'),
  'voi-nuoc': () => wrap(wc(`<rect x="14" y="24" width="50" height="14" rx="6" fill="#a9b8c2"/><rect x="50" y="30" width="14" height="22" rx="4" fill="#a9b8c2"/><rect x="30" y="14" width="10" height="12" fill="#8d9ca6"/><path d="M57 56c-3 6-3 10 0 12 3-2 3-6 0-12zM57 74c-3 6-3 10 0 12 3-2 3-6 0-12z" fill="#8cc3d8"/>`) +
    pen(`<rect x="14" y="24" width="50" height="14" rx="6"/><rect x="50" y="30" width="14" height="22" rx="4"/><path d="M24 14h26"/>`), 'vòi nước'),
  'ban-tay': (c = '#fbe3bf') => wrap(wc(`<path d="M30 90V52c0-6 8-6 8 0V30c0-6 8-6 8 0v-6c0-6 8-6 8 0v6c0-6 8-6 8 0v24c2-8 12-6 10 2l-6 22c-2 8-8 12-16 12H30z" fill="${c}"/>`) +
    pen(`<path d="M30 90V52c0-6 8-6 8 0V30c0-6 8-6 8 0v-6c0-6 8-6 8 0v6c0-6 8-6 8 0v24c2-8 12-6 10 2l-6 22c-2 8-8 12-16 12H30z"/><path d="M38 52V40M46 30v20M54 30v20M62 36v18" stroke-width="1.6"/>`), 'bàn tay'),
  may: () => wrap(wc(`<path d="M18 66c-10 0-12-16 0-18 0-14 18-20 26-8 6-12 26-10 28 6 14-2 18 20 4 20z" fill="#fffaf0"/>`) + pen(`<path d="M18 66c-10 0-12-16 0-18 0-14 18-20 26-8 6-12 26-10 28 6 14-2 18 20 4 20z"/>`), 'đám mây'),
  'cau-vong': () => wrap(wc(['#e48a76', '#f6c85f', '#a9c75a', '#6aa6c8'].map((c, i) => `<path d="M${12 + i * 7} 80a${38 - i * 7} ${38 - i * 7} 0 0 1 ${76 - i * 14} 0" fill="none" stroke="${c}" stroke-width="7"/>`).join('')) + pen(`<path d="M8 80a42 42 0 0 1 84 0"/>`), 'cầu vồng'),
  chim: (c = '#e98b9a') => wrap(shadow(50, 90, 18) + wc(`<ellipse cx="48" cy="56" rx="26" ry="20" fill="${c}"/><circle cx="68" cy="40" r="13" fill="${c}"/><path d="M80 40l12 3-12 4z" fill="#f2b33d"/><path d="M34 52c8-12 22-10 26 2-10 6-20 6-26-2z" fill="#fff" opacity=".5"/>`) +
    pen(`<ellipse cx="48" cy="56" rx="26" ry="20"/><circle cx="68" cy="40" r="13"/><circle cx="71" cy="37" r="2" fill="${INK}"/><path d="M80 40l12 3-12 4M44 76v12M54 76v12"/>`), 'chú chim'),
  tho: (c = '#f4efe6') => wrap(shadow(50, 92, 22) + wc(`<ellipse cx="38" cy="16" rx="6" ry="16" fill="${c}"/><ellipse cx="58" cy="16" rx="6" ry="16" fill="${c}"/><ellipse cx="38" cy="18" rx="2.5" ry="10" fill="#f2b8c0"/><ellipse cx="58" cy="18" rx="2.5" ry="10" fill="#f2b8c0"/><ellipse cx="50" cy="70" rx="22" ry="20" fill="${c}"/><circle cx="48" cy="42" r="16" fill="${c}"/><circle cx="72" cy="78" r="6" fill="#fff"/><circle cx="40" cy="46" r="3.5" fill="#f2b8c0" opacity=".7"/><circle cx="58" cy="46" r="3.5" fill="#f2b8c0" opacity=".7"/>`) +
    pen(`<ellipse cx="38" cy="16" rx="6" ry="16"/><ellipse cx="58" cy="16" rx="6" ry="16"/><circle cx="48" cy="42" r="16"/><path d="M30 76c0-12 8-20 20-20s20 8 20 20-8 14-20 14-20-2-20-14z"/><circle cx="72" cy="78" r="6"/><circle cx="43" cy="39" r="2" fill="${INK}"/><circle cx="54" cy="39" r="2" fill="${INK}"/><path d="M47 45l2 2 2-2M49 47v2"/>`), 'bạn thỏ'),
  'ca-rot': () => wrap(shadow(50, 90, 16) + wc(`<path d="M50 88c-6-8-14-38-12-52 2-8 22-8 24 0 2 14-6 44-12 52z" fill="#ec9a4a"/><path d="M44 28c-8-10-4-20 2-18 2 6 4 12 4 18M56 28c8-10 4-20-2-18-2 6-4 12-4 18M50 28V8" fill="#7fae4e" stroke="#7fae4e" stroke-width="5" stroke-linecap="round"/>`) +
    pen(`<path d="M50 88c-6-8-14-38-12-52 2-8 22-8 24 0 2 14-6 44-12 52z"/><path d="M42 46h6M46 60h6M44 72h5"/>`), 'củ cà rốt'),
  'chong-chong': () => wrap(shadow(50, 94, 10) + wc(`<path d="M50 44L50 14c14 0 22 12 0 30z" fill="#e48a76"/><path d="M50 44L80 44c0 14-12 22-30 0z" fill="#f6c85f"/><path d="M50 44L50 74c-14 0-22-12 0-30z" fill="#6aa6c8"/><path d="M50 44L20 44c0-14 12-22 30 0z" fill="#a9c75a"/><rect x="48" y="44" width="4" height="48" fill="#c9a56b"/>`) +
    pen(`<path d="M50 44L50 14c14 0 22 12 0 30zM50 44L80 44c0 14-12 22-30 0zM50 44L50 74c-14 0-22-12 0-30zM50 44L20 44c0-14 12-22 30 0z"/><path d="M50 46v46"/><circle cx="50" cy="44" r="3" fill="${INK}"/>`), 'chong chóng'),
  nha: (c = '#e48a76') => wrap(shadow(50, 90, 34) + wc(`<path d="M14 48L50 18l36 30z" fill="${c}"/><rect x="22" y="46" width="56" height="42" fill="#f6e3c0"/><rect x="42" y="62" width="16" height="26" fill="#b57f4f"/><rect x="28" y="54" width="10" height="10" fill="#bfe0f0"/><rect x="62" y="54" width="10" height="10" fill="#bfe0f0"/>`) +
    pen(`<path d="M12 48L50 16l38 32"/><path d="M22 46v42h56V46"/><path d="M42 88V62h16v26"/><rect x="28" y="54" width="10" height="10"/><rect x="62" y="54" width="10" height="10"/>`), 'ngôi nhà'),
  dieu: (c = '#e98b9a') => wrap(wc(`<path d="M50 8L76 36 50 64 24 36z" fill="${c}"/><path d="M50 8v56M24 36h52" stroke="#fff" stroke-width="2" opacity=".6"/><path d="M50 64c-6 8 6 12 0 20s6 10 0 14" fill="none" stroke="#c9a56b" stroke-width="2.5"/><path d="M44 74l6 4-6 4zM56 86l-6 4 6 4z" fill="#f6c85f"/>`) +
    pen(`<path d="M50 8L76 36 50 64 24 36z"/>`), 'con diều'),
  // Ký hiệu Yes / No cho phần tiếng Anh (nhóm G: giao diện, SVG)
  yes: () => wrap(wc(`<circle cx="50" cy="50" r="38" fill="#a9c75a"/>`) + pen(`<circle cx="50" cy="50" r="38"/>`) + `<path d="M32 52l12 12 24-28" fill="none" stroke="#fffaf0" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`, 'yes'),
  no: () => wrap(wc(`<circle cx="50" cy="50" r="38" fill="#e48a76"/>`) + pen(`<circle cx="50" cy="50" r="38"/>`) + `<path d="M36 36l28 28M64 36 36 64" fill="none" stroke="#fffaf0" stroke-width="9" stroke-linecap="round"/>`, 'no'),
  // Hình học: vẽ chính xác bằng code
  'hinh-tron': (c = '#6aa6c8') => wrap(wc(`<circle cx="50" cy="50" r="34" fill="${c}"/>`) + pen(`<circle cx="50" cy="50" r="34"/>`), 'hình tròn'),
  'hinh-vuong': (c = '#f2c14e') => wrap(wc(`<rect x="18" y="18" width="64" height="64" rx="4" fill="${c}"/>`) + pen(`<rect x="18" y="18" width="64" height="64" rx="4"/>`), 'hình vuông'),
  'hinh-tam-giac': (c = '#8fb24a') => wrap(wc(`<path d="M50 14 86 80H14z" fill="${c}"/>`) + pen(`<path d="M50 14 86 80H14z"/>`), 'hình tam giác'),
};

/* ---------- Gương mặt cảm xúc (cùng một khuôn mặt, chỉ đổi nét) ---------- */
const FACE = {
  vui: { eyes: '<path d="M33 44c3-4 8-4 10 0M57 44c3-4 8-4 10 0"/>', mouth: '<path d="M36 60c6 10 22 10 28 0"/>', fill: '<path d="M36 60c6 10 22 10 28 0z" fill="#c9604c"/>' },
  buon: { eyes: '<circle cx="38" cy="46" r="2.6" fill="' + INK + '"/><circle cx="62" cy="46" r="2.6" fill="' + INK + '"/><path d="M31 38l10-3M69 38l-10-3"/>', mouth: '<path d="M38 68c5-6 19-6 24 0"/>', tear: '<path d="M33 52c-2 4-2 7 0 8 2-1 2-4 0-8z" fill="#8cc3d8"/>' },
  gian: { eyes: '<circle cx="38" cy="47" r="2.6" fill="' + INK + '"/><circle cx="62" cy="47" r="2.6" fill="' + INK + '"/><path d="M30 37l12 5M70 37l-12 5"/>', mouth: '<path d="M38 66h24"/>', cheek: '#e88b72' },
  'ngac-nhien': { eyes: '<circle cx="38" cy="45" r="3.4" fill="' + INK + '"/><circle cx="62" cy="45" r="3.4" fill="' + INK + '"/><path d="M32 35c3-3 8-3 10 0M58 35c3-3 8-3 10 0"/>', mouth: '<ellipse cx="50" cy="64" rx="6" ry="8"/>' },
  so: { eyes: '<circle cx="38" cy="46" r="3" fill="' + INK + '"/><circle cx="62" cy="46" r="3" fill="' + INK + '"/><path d="M31 37l10 2M69 37l-10 2"/>', mouth: '<path d="M37 66c3-3 5 3 8 0s5 3 8 0 5 3 8 0"/>' },
  'binh-tinh': { eyes: '<path d="M33 46c3 3 7 3 10 0M57 46c3 3 7 3 10 0"/>', mouth: '<path d="M40 62c5 4 15 4 20 0"/>' },
};
export function face(kind) {
  const f = FACE[kind] || FACE.vui;
  return wrap(wc(`<circle cx="50" cy="50" r="40" fill="#fbe3bf"/><circle cx="30" cy="58" r="8" fill="url(#lu-blush)"/><circle cx="70" cy="58" r="8" fill="url(#lu-blush)"/>${f.cheek ? `<circle cx="50" cy="50" r="40" fill="${f.cheek}" opacity=".18"/>` : ''}`) +
    (f.fill || '') + (f.tear || '') + pen(`<circle cx="50" cy="50" r="40"/>${f.eyes}${f.mouth}`), { vui: 'vui', buon: 'buồn', gian: 'tức giận', 'ngac-nhien': 'ngạc nhiên', so: 'sợ', 'binh-tinh': 'bình tĩnh' }[kind]);
}

/* ---------- Huy hiệu môn học trên bản đồ (không dùng emoji) ---------- */
const BADGE = {
  'Toán': ['#f2c14e', `<circle cx="34" cy="56" r="9"/><circle cx="50" cy="44" r="9"/><circle cx="66" cy="56" r="9"/>`, '#fff8e6'],
  'Tư duy': ['#a58bc9', `<path d="M30 36h14c0-6 12-6 12 0h14v14c6 0 6 12 0 12v14H56c0-6-12-6-12 0H30z"/>`, '#f3ecfb'],
  'Tiếng Việt': ['#e48a76', `<path d="M42 70V48c0-8 16-8 16 0v22M42 58h16"/><path d="M46 36l8-5" />`, '#fdecea'],
  'Tiếng Anh': ['#6aa6c8', `<path d="M28 68l9-30 9 30M31 58h12"/><path d="M54 38v30h8c8 0 8-14 0-14h-8 7c7 0 7-12 0-12z"/>`, '#e8f3f8'],
  'EQ và xã hội': ['#e98b9a', `<path d="M50 72S30 60 30 46c0-7 5-12 11-12 4 0 7 2 9 5 2-3 5-5 9-5 6 0 11 5 11 12 0 14-20 26-20 26z"/>`, '#fde9ec'],
  'Khám phá': ['#8fae3e', `<circle cx="45" cy="46" r="13"/><path d="M55 56l13 13"/>`, '#eef4dc'],
  'Lễ hội': ['#e0705a', `<path d="M40 30h20M38 38c0-6 24-6 24 0v20c0 8-24 8-24 0zM50 66v8M44 74h12"/><path d="M38 48h24"/>`, '#fff0e0'],
};
export function badge(group, festival) {
  const [c, glyph, soft] = BADGE[festival ? 'Lễ hội' : group] || BADGE['Khám phá'];
  return wrap(wc(`<circle cx="50" cy="52" r="40" fill="${c}"/><circle cx="50" cy="52" r="31" fill="${soft}"/>`) +
    `<g fill="none" stroke="${c}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#lu-pencil)">${glyph}</g>` + pen('<circle cx="50" cy="52" r="40"/>'), group);
}
export const BADGE_COLORS = Object.fromEntries(Object.entries(BADGE).map(([k, v]) => [k, v[0]]));

// Hiển thị một "hình" trong nội dung bài: "art:hat-dau", "art:bong-bay:#6aa6c8", "face:vui". Chuỗi khác hiện như chữ.
// Nhóm n vật xếp gọn trong ô vuông, sát nhau, không thành hàng dọc (góp ý chị tam 26/11, giống quy tắc 30 bài hằng ngày):
// 3 = tam giác (1 trên, 2 dưới), 4 = 2×2, 5 = 3 trên 2 dưới, … tối đa 10. Viết trong nội dung: "art:tao*3".
export const GROUP_ROWS = { 1: [1], 2: [2], 3: [1, 2], 4: [2, 2], 5: [3, 2], 6: [3, 3], 7: [4, 3], 8: [4, 4], 9: [3, 3, 3], 10: [5, 5] };
export function groupHTML(obj, n) {
  const rows = GROUP_ROWS[n] || [n]; const cols = Math.max(...rows), R = rows.length, cell = 100 / Math.max(cols, R);
  const size = Math.min(74, cell * 1.08); let k = 0; const pts = [];
  rows.forEach((m, r) => { for (let j = 0; j < m; j++) pts.push([50 + (j - (m - 1) / 2) * cell * .96, 50 + (r - (R - 1) / 2) * cell * .92]); });
  return `<span class="grp-box" role="img" aria-label="${n}">${pts.map(([x, y]) => `<span class="grp-it" style="left:${x}%;top:${y}%;width:${size}%;height:${size}%">${vis(obj)}</span>`).join('')}</span>`;
}
let luFn = null, assetSrc = {};
export const setVisLu = f => { luFn = f; };
export const setVisAssets = m => { assetSrc = m || {}; };
export function vis(x) {
  if (typeof x !== 'string') return '';
  if (x.startsWith('lu:')) return luFn ? luFn(x.slice(3)) : '';
  if (x.startsWith('asset:')) { const k = x.slice(6), src = assetSrc[k]; return src ? `<img class="lu-art asset" src="${src}" alt="">` : ''; }
  const g = x.match(/^((?:art|face):[^*]+)\*(\d+)$/); if (g) return groupHTML(g[1], Math.min(+g[2], 10));
  if (x.startsWith('art:')) { const [, k, arg] = x.split(':');
    // Ảnh vẽ tay đã duyệt thay cho hình vẽ mã (slot "art:hat-dau" trong Asset Registry); hình có tham số (màu, số trên cọc) giữ hình vẽ mã
    if (!arg && assetSrc['art:' + k]) return `<img class="lu-art asset" src="${assetSrc['art:' + k]}" alt="" draggable="false">`;
    return ART[k] ? ART[k](arg ? decodeURIComponent(arg) : undefined) : ''; }
  if (x.startsWith('face:')) return face(x.slice(5));
  return x;
}
export const EMOJI_RE = /(?![©®™])\p{Extended_Pictographic}/u;

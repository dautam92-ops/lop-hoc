// Vẽ cảnh bản đồ bằng code theo ngôn ngữ đồ họa của Lu (màu nước + bút chì).
// Đây là lớp NỀN (không tương tác). Lớp tương tác (chặng bài, địa điểm) đặt riêng phía trên (D38 mục 7).
// Khi Art Factory có ảnh nền đạt chuẩn và Admin duyệt (slot "BD-vung-01"…), app dùng ảnh đó thay cho lớp vẽ này.
import { makeRng } from '../core/lu-core.js';
import { INK } from './art.js';

export const REGION_THEME = {
  1: { name: 'lang', ground: ['#e6efc4', '#d5e5a6', '#c4d98c'], accent: '#8fae3e', water: '#a9d3df', path: '#ecd9a8', deco: { tree: 6, bamboo: 4, bush: 8, flower: 16, house: 4, rice: 3 } },
  2: { name: 'rung', ground: ['#d9ebc8', '#bcdca8', '#9fcb8c'], accent: '#5e9a4f', water: '#9fd0dc', path: '#e6d3a5', deco: { tree: 22, bamboo: 2, bush: 10, flower: 8, house: 1, rice: 0 } },
  3: { name: 'bien', ground: ['#f6ead0', '#f1dfb7', '#e9d3a0'], accent: '#e2a94b', water: '#9ccbe0', path: '#f3e6c4', sea: true, deco: { tree: 4, bamboo: 0, bush: 4, flower: 4, house: 2, rice: 0 } },
  4: { name: 'nui', ground: ['#eef0e2', '#dfe4cc', '#cdd5b3'], accent: '#c9826a', water: '#b5d7e3', path: '#e9dcc0', peaks: true, deco: { tree: 8, bamboo: 0, bush: 6, flower: 8, house: 2, rice: 0 } },
  5: { name: 'thi-tran', ground: ['#e9efd9', '#dbe6c4', '#cbdcae'], accent: '#d9774f', water: '#a9d3df', path: '#efdcb2', deco: { tree: 6, bamboo: 2, bush: 6, flower: 10, house: 10, rice: 0 } },
  6: { name: 'vuon-chu', ground: ['#efe9f6', '#e2d9ef', '#d4c8e6'], accent: '#a58bc9', water: '#b7d6e6', path: '#efe1c4', deco: { tree: 6, bamboo: 0, bush: 10, flower: 30, house: 2, rice: 0 } },
  7: { name: 'trang-trai', ground: ['#f4ecc9', '#ead9a2', '#dfc87f'], accent: '#e48a76', water: '#a9d3df', path: '#efdcb2', deco: { tree: 6, bamboo: 0, bush: 6, flower: 10, house: 3, rice: 6 } },
  8: { name: 'song-sao', ground: ['#dfe9ef', '#cfdde8', '#bccfdf'], accent: '#6a8fc8', water: '#7fb0d6', path: '#efe3c6', deco: { tree: 8, bamboo: 2, bush: 6, flower: 6, house: 2, rice: 0 } },
  9: { name: 'dao', ground: ['#f2e7cc', '#e2d6a8', '#cfd18f'], accent: '#c9a66b', water: '#9ccbe0', path: '#f3e6c4', sea: true, deco: { tree: 10, bamboo: 0, bush: 6, flower: 6, house: 1, rice: 0 } },
  10: { name: 'truong', ground: ['#e9f0d6', '#d7e6b6', '#c4d999'], accent: '#6fa86a', water: '#a9d3df', path: '#efdcb2', deco: { tree: 8, bamboo: 0, bush: 8, flower: 12, house: 4, rice: 0 } },
};

const wc = (s, f = 'lu-wc-big') => `<g filter="url(#${f})">${s}</g>`;
const pen = (s, w = 3) => `<g filter="url(#lu-pencil)" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity=".85">${s}</g>`;

// Đường cong mềm đi qua các điểm (Catmull-Rom → Bezier)
export function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${(p1.x + (p2.x - p0.x) / 6).toFixed(1)} ${(p1.y + (p2.y - p0.y) / 6).toFixed(1)} ${(p2.x - (p3.x - p1.x) / 6).toFixed(1)} ${(p2.y - (p3.y - p1.y) / 6).toFixed(1)} ${p2.x} ${p2.y}`;
  }
  return d;
}
const wobble = (rng, x0, x1, y, amp, step = 60) => { let d = `M${x0} ${y}`; for (let x = x0 + step; x <= x1 + step; x += step) d += ` Q${x - step / 2} ${y + (rng.next() - .5) * amp * 2} ${Math.min(x, x1)} ${y + (rng.next() - .5) * amp}`; return d; };

/* ---------- Thành phần cảnh ---------- */
const tree = (x, y, s, rng, c = ['#8fae3e', '#a9c75a', '#7a9a35']) => {
  const k = rng.int(0, 2);
  return wc(`<path d="M${x - 5 * s} ${y}l3 ${-40 * s}h${4 * s}l3 ${40 * s}z" fill="#9a7445"/>` +
    `<circle cx="${x}" cy="${y - 52 * s}" r="${30 * s}" fill="${c[k]}"/><circle cx="${x - 20 * s}" cy="${y - 38 * s}" r="${20 * s}" fill="${c[(k + 1) % 3]}"/><circle cx="${x + 20 * s}" cy="${y - 40 * s}" r="${22 * s}" fill="${c[(k + 2) % 3]}"/>`, 'lu-wc') +
    pen(`<path d="M${x - 30 * s} ${y - 46 * s}c-6-26 20-44 34-34 14-12 40 6 30 30 8 14-8 30-22 24-10 10-34 6-36-6-12-2-14-12-6-14z"/><path d="M${x} ${y}v${-26 * s}"/>`, 2.4);
};
const bamboo = (x, y, s) => wc([0, 14, 26, -12].map((dx, i) => `<path d="M${x + dx * s} ${y}c${2 * s} ${-40 * s} ${-2 * s} ${-80 * s} ${(i % 2 ? 6 : -4) * s} ${-(110 + i * 12) * s}" stroke="#7da23a" stroke-width="${6 * s}" fill="none"/>` +
  `<path d="M${x + dx * s} ${y - (100 + i * 10) * s}c${14 * s} ${-6 * s} ${24 * s} 0 ${30 * s} ${8 * s}c${-12 * s} ${4 * s} ${-22 * s} ${2 * s} ${-30 * s} ${-8 * s}z" fill="#a9c75a"/>`).join(''), 'lu-wc');
const bush = (x, y, s, c = '#9cbf55') => wc(`<ellipse cx="${x}" cy="${y}" rx="${26 * s}" ry="${15 * s}" fill="${c}"/><ellipse cx="${x - 14 * s}" cy="${y + 3 * s}" rx="${15 * s}" ry="${11 * s}" fill="#87a845"/>`, 'lu-wc');
const flower = (x, y, c) => `<circle cx="${x}" cy="${y}" r="5" fill="${c}" opacity=".85"/><circle cx="${x}" cy="${y}" r="2" fill="#f6c85f"/>`;
const house = (x, y, s, roof = '#c4704f') => wc(`<rect x="${x - 34 * s}" y="${y - 40 * s}" width="${68 * s}" height="${40 * s}" fill="#f6e6c6"/><path d="M${x - 46 * s} ${y - 38 * s}L${x} ${y - 76 * s}L${x + 46 * s} ${y - 38 * s}z" fill="${roof}"/>` +
  `<rect x="${x - 9 * s}" y="${y - 24 * s}" width="${18 * s}" height="${24 * s}" fill="#a77a4a"/><rect x="${x + 16 * s}" y="${y - 30 * s}" width="${12 * s}" height="${10 * s}" fill="#a9d3df"/>`, 'lu-wc') +
  pen(`<path d="M${x - 46 * s} ${y - 38 * s}L${x} ${y - 76 * s}L${x + 46 * s} ${y - 38 * s}z"/><path d="M${x - 34 * s} ${y - 38 * s}V${y}h${68 * s}V${y - 38 * s}"/><path d="M${x - 9 * s} ${y}v${-24 * s}h${18 * s}v${24 * s}"/>`, 2.2);
const rice = (x, y, w, h) => wc(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#cfe08f"/>` + Array.from({ length: Math.floor(h / 16) }, (_, i) => `<path d="M${x + 10} ${y + 10 + i * 16}h${w - 20}" stroke="#a9c75a" stroke-width="5" stroke-dasharray="3 9"/>`).join(''), 'lu-wc') + pen(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18"/>`, 2);
const peak = (x, y, s) => wc(`<path d="M${x - 90 * s} ${y}L${x} ${y - 130 * s}L${x + 90 * s} ${y}z" fill="#c9b8a0"/><path d="M${x - 26 * s} ${y - 92 * s}L${x} ${y - 130 * s}L${x + 26 * s} ${y - 92 * s}q-13 10-26 0q-13 10-26 0z" fill="#fff"/>`) + pen(`<path d="M${x - 90 * s} ${y}L${x} ${y - 130 * s}L${x + 90 * s} ${y}"/>`, 2.4);

/* ---------- Địa điểm theo tiến độ của Làng Hạt Đậu (10 thay đổi của thế giới Lu) ---------- */
// Mỗi 3 bài xong, một địa điểm được "tô màu". Chưa tới thì chỉ là nét chì phác.
const LM = [
  (x, y) => `<path d="M${x - 30} ${y}c6-14 54-14 60 0z" fill="#b8865a"/>` + [-16, 0, 16].map(d => `<path d="M${x + d} ${y - 6}v-22" stroke="#7da23a" stroke-width="4"/><path d="M${x + d} ${y - 26}c-10 0-14-6-14-12 9 0 14 5 14 12zM${x + d} ${y - 28}c8 0 12-6 12-12-8 0-12 5-12 12z" fill="#a9c75a"/>`).join(''),
  (x, y) => Array.from({ length: 7 }, (_, i) => `<path d="M${x - 60 + i * 20} ${y}v-46" stroke="#c9a15a" stroke-width="7" stroke-linecap="round"/>`).join('') + `<path d="M${x - 66} ${y - 30}h132M${x - 66} ${y - 14}h132" stroke="#b08a4a" stroke-width="5"/>`,
  (x, y) => `<path d="M${x - 22} ${y - 30}h44l-6 30h-32z" fill="#c9825a"/>` + ['#e48a76', '#f6c85f', '#b49be0'].map((c, i) => `<circle cx="${x - 12 + i * 12}" cy="${y - 42 - (i % 2) * 6}" r="8" fill="${c}"/>`).join(''),
  (x, y) => `<ellipse cx="${x}" cy="${y - 18}" rx="18" ry="16" fill="#f6d77a"/><circle cx="${x + 10}" cy="${y - 34}" r="11" fill="#f6d77a"/><path d="M${x + 20} ${y - 34}l8 3-8 3z" fill="#e2a94b"/><circle cx="${x + 13}" cy="${y - 36}" r="2" fill="${INK}"/>`,
  (x, y) => `<path d="M${x - 40} ${y}v-80M${x + 40} ${y}v-80M${x - 46} ${y - 80}h92" stroke="#b08a4a" stroke-width="6"/>` + Array.from({ length: 6 }, (_, i) => `<circle cx="${x - 34 + i * 14}" cy="${y - 70 + (i % 2) * 10}" r="9" fill="#a9c75a"/>`).join(''),
  (x, y) => `<circle cx="${x + 30}" cy="${y - 80}" r="40" fill="#8fae3e"/><path d="M${x + 26} ${y}v-50" stroke="#9a7445" stroke-width="10"/><rect x="${x - 40}" y="${y - 26}" width="46" height="8" rx="3" fill="#b8865a"/><path d="M${x - 34} ${y - 18}v18M${x} ${y - 18}v18" stroke="#9a7445" stroke-width="5"/>`,
  (x, y) => `<ellipse cx="${x}" cy="${y - 10}" rx="30" ry="12" fill="#b9b2a4"/><rect x="${x - 30}" y="${y - 30}" width="60" height="22" fill="#cfc6b4"/><ellipse cx="${x}" cy="${y - 32}" rx="34" ry="10" fill="#9a7445"/>`,
  (x, y) => `<rect x="${x - 34}" y="${y - 40}" width="68" height="40" fill="#d8b47a"/><path d="M${x - 42} ${y - 38}L${x} ${y - 66}L${x + 42} ${y - 38}z" fill="#c4704f"/><rect x="${x - 10}" y="${y - 22}" width="20" height="22" fill="#8a6a3a"/>`,
  (x, y) => `<path d="M${x - 50} ${y}v-90M${x + 50} ${y}v-90" stroke="#9a7445" stroke-width="9"/><path d="M${x - 60} ${y - 88}q60-30 120 0" stroke="#c4704f" stroke-width="12" fill="none"/>` + ['#e48a76', '#f6c85f', '#6aa6c8', '#8fae3e'].map((c, i) => `<path d="M${x - 36 + i * 24} ${y - 80}l10 18 10-18z" fill="${c}"/>`).join(''),
  (x, y) => `<ellipse cx="${x}" cy="${y - 10}" rx="90" ry="26" fill="#efd9a8"/>` + [-60, -20, 20, 60].map((d, i) => `<path d="M${x + d} ${y - 90}v40" stroke="${INK}" stroke-width="2"/><ellipse cx="${x + d}" cy="${y - 40}" rx="13" ry="17" fill="${['#e0705a', '#f6c85f', '#e48a76', '#f2b134'][i]}"/>`).join('') + `<path d="M${x - 70} ${y - 92}q70 18 140 0" stroke="${INK}" stroke-width="2" fill="none"/>`,
];
export const LANDMARK_NAMES_1 = ['vườn hạt đậu nảy mầm', 'hàng rào tre', 'chậu hoa', 'gà con Bông', 'giàn đậu leo', 'ghế gỗ dưới gốc cây', 'giếng nước có nắp', 'chuồng gà', 'cổng làng treo cờ', 'sân lễ hội Hạt Đậu'];

// Lớp nền của một vùng. pts: toạ độ chặng bài trong khung 1000 × H (đơn vị đã nhân 10)
export function regionBackground(region, pts, { doneCount = 0, avoid = [] } = {}) {
  const T = REGION_THEME[region.id] || REGION_THEME[1]; const rng = makeRng(region.id * 7919);
  const W = 1000, H = region.h * 10; const out = [];
  out.push(`<rect x="-400" width="1800" height="${H}" fill="${T.ground[0]}"/>`);
  // các dải đồi
  for (let y = 120, k = 0; y < H + 200; y += 230, k++) out.push(wc(`<path d="${wobble(rng, -440, W + 440, y, 50)} L${W + 440} ${y + 260} L-440 ${y + 260}z" fill="${T.ground[1 + (k % 2)]}" opacity=".75"/>`));
  if (T.peaks) for (let y = 300; y < H; y += 700) out.push(peak(rng.int(120, 300), y, 1.2), peak(rng.int(700, 880), y + 300, 1));
  // nước: sông uốn hoặc biển một bên
  const rivers = [];
  if (T.sea) { out.push(wc(`<path d="M${W - 120} 0 C${W - 30} ${H * .3} ${W - 200} ${H * .6} ${W - 90} ${H} L1400 ${H} L1400 0z" fill="${T.water}"/>`)); }
  else for (const fy of [0.33, 0.72]) {
    const y = H * fy; rivers.push(y);
    const d = `M-440 ${y + 40} C-200 ${y - 60} 0 ${y + 60} 200 ${y - 40} S380 ${y + 110} 560 ${y + 10} S880 ${y - 70} 1100 ${y + 30} S1300 ${y - 30} 1440 ${y}`;
    out.push(wc(`<path d="${d}" stroke="${T.water}" stroke-width="70" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#d6ecf2" stroke-width="18" fill="none" opacity=".7" stroke-dasharray="40 60"/>`));
  }
  // ruộng lúa
  for (let i = 0; i < T.deco.rice; i++) { const y = rng.int(200, H - 300), x = rng.next() < .5 ? 30 : 760; out.push(rice(x, y, 210, 120)); }
  // đường đi
  const path = smoothPath(pts);
  out.push(wc(`<path d="${path}" stroke="#c9ad72" stroke-width="64" fill="none" stroke-linecap="round" opacity=".55"/><path d="${path}" stroke="${T.path}" stroke-width="50" fill="none" stroke-linecap="round"/>`));
  out.push(pen(`<path d="${path}" stroke-dasharray="2 22" stroke-width="4" opacity=".35"/>`));
  // cầu tre chỗ đường qua sông
  for (const ry of rivers) { const p = pts.reduce((a, b) => Math.abs(b.y - ry) < Math.abs(a.y - ry) ? b : a);
    out.push(wc(`<rect x="${p.x - 50}" y="${p.y - 34}" width="100" height="68" rx="10" fill="#d4b072"/>` + [0, 1, 2, 3, 4].map(i => `<path d="M${p.x - 44 + i * 22} ${p.y - 30}v60" stroke="#b08a4a" stroke-width="5"/>`).join('')), pen(`<rect x="${p.x - 50}" y="${p.y - 34}" width="100" height="68" rx="10"/>`, 2.4)); }
  // trang trí: tránh đường đi
  const far = (x, y, m = 95) => pts.every(p => Math.hypot(p.x - x, p.y - y) > m) && rivers.every(r => Math.abs(r - y) > 70) && avoid.every(p => Math.hypot(p.x - x, p.y - y) > 170);
  const place = (n, m, fn) => { for (let i = 0, tries = 0; i < n && tries < n * 30; tries++) { const x = rng.int(-360, 1360), y = rng.int(80, H - 30); if (far(x, y, m)) { out.push(fn(x, y)); i++; } } };
  const perScreen = H / 1000 * 1.8;
  place(Math.round(T.deco.house * perScreen / 1.5), 130, (x, y) => house(x, y, rng.next() * .3 + .8, rng.pick(['#c4704f', '#b8654a', '#a95f45'])));
  place(Math.round(T.deco.tree * perScreen), 100, (x, y) => tree(x, y, rng.next() * .5 + .8, rng));
  place(Math.round(T.deco.bamboo * perScreen), 90, (x, y) => bamboo(x, y, rng.next() * .4 + .8));
  place(Math.round(T.deco.bush * perScreen), 70, (x, y) => bush(x, y, rng.next() * .5 + .7));
  place(Math.round(T.deco.flower * perScreen), 50, (x, y) => flower(x, y, rng.pick(['#e48a76', '#f6c85f', '#ffffff', '#b49be0'])));
  return `<svg class="map-bg" viewBox="-400 0 1800 ${H}" preserveAspectRatio="none" aria-hidden="true">${out.join('')}</svg>`;
}

// Địa điểm (lớp riêng, có thể chạm). unlocked=false → nét chì phác, chưa tô màu.
export function landmarkSVG(i, unlocked, tight = false) {
  const body = LM[i] ? LM[i](100, 110) : '';
  return `<svg viewBox="${tight ? '20 10 160 110' : '0 0 200 120'}" class="lm-svg ${unlocked ? 'on' : 'off'}" aria-hidden="true">${unlocked ? `<g filter="url(#lu-wc)">${body}</g>` : `<g filter="url(#lu-pencil)" opacity=".45" style="mix-blend-mode:multiply">${body.replace(/fill="[^"]+"/g, 'fill="none"').replace(/stroke="[^"]+"/g, `stroke="${INK}"`).replace(/<path /g, `<path stroke="${INK}" stroke-width="2" fill="none" `).replace(/<(circle|ellipse|rect) /g, `<$1 stroke="${INK}" stroke-width="2" `)}</g>`}</svg>`;
}

/* ---------- Bản đồ thế giới: 10 vùng đất trên một hành trình ---------- */
// Vị trí 10 vùng (tỉ lệ 0..1) cho màn hình ngang và dọc: một hành trình uốn lượn
export const WORLD_LAYOUT = {
  land: [[.13, .78], [.31, .85], [.5, .76], [.69, .85], [.87, .74], [.85, .38], [.67, .27], [.49, .37], [.31, .26], [.13, .35]],
  port: [[.24, .9], [.7, .86], [.78, .7], [.32, .64], [.22, .48], [.7, .44], [.8, .28], [.38, .24], [.2, .1], [.66, .08]],
};
const closedSmooth = pts => { const n = pts.length; let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ` C${(p1.x + (p2.x - p0.x) / 6).toFixed(1)} ${(p1.y + (p2.y - p0.y) / 6).toFixed(1)} ${(p2.x - (p3.x - p1.x) / 6).toFixed(1)} ${(p2.y - (p3.y - p1.y) / 6).toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`; }
  return d + 'z'; };
const island = (rng, x, y, rx, ry) => closedSmooth(Array.from({ length: 11 }, (_, k) => { const a = k / 11 * Math.PI * 2, r = .82 + rng.next() * .3; return { x: x + Math.cos(a) * rx * r, y: y + Math.sin(a) * ry * r }; }));
const LAND_GLYPH = {
  1: (x, y) => house(x - 30, y + 10, .6) + tree(x + 36, y + 12, .55, makeRng(1)),
  2: (x, y) => tree(x - 30, y + 14, .6, makeRng(2), ['#5e9a4f', '#7fb36b', '#4c8540']) + tree(x + 10, y + 6, .75, makeRng(3), ['#5e9a4f', '#7fb36b', '#4c8540']) + tree(x + 44, y + 16, .55, makeRng(4), ['#5e9a4f', '#7fb36b', '#4c8540']),
  3: (x, y) => wc(`<path d="M${x - 50} ${y + 10}q25-18 50 0t50 0" stroke="#6aa6c8" stroke-width="8" fill="none"/><path d="M${x - 10} ${y - 30}l20 30h-30z" fill="#fff"/><path d="M${x - 24} ${y}h44l-8 10h-28z" fill="#c4704f"/>`, 'lu-wc'),
  4: (x, y) => peak(x - 20, y + 20, .55) + peak(x + 26, y + 20, .45),
  5: (x, y) => house(x - 26, y + 16, .5, '#d9774f') + house(x + 26, y + 16, .5, '#c4704f') + wc(`<ellipse cx="${x}" cy="${y - 34}" rx="9" ry="12" fill="#e0705a"/><ellipse cx="${x + 24}" cy="${y - 28}" rx="8" ry="10" fill="#f6c85f"/>`, 'lu-wc'),
  6: (x, y) => [-30, 0, 30].map((d, i) => `<text x="${x + d}" y="${y + 6}" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="34" fill="${['#a58bc9', '#e48a76', '#6aa6c8'][i]}">${'abc'[i]}</text>`).join('') + [-36, -6, 26].map(d => flower(x + d, y + 22, '#f6c85f')).join(''),
  7: (x, y) => wc(`<rect x="${x - 34}" y="${y - 16}" width="50" height="34" fill="#d9774f"/><path d="M${x - 40} ${y - 14}L${x - 9} ${y - 40}L${x + 22} ${y - 14}z" fill="#a95f45"/><circle cx="${x + 36}" cy="${y + 6}" r="12" fill="#f6c85f"/>`, 'lu-wc'),
  8: (x, y) => wc(`<path d="M${x - 50} ${y + 6}c30-20 70 20 100 0" stroke="#7fb0d6" stroke-width="16" fill="none"/>`, 'lu-wc') + [[-30, -26], [6, -36], [36, -20]].map(([dx, dy]) => `<path d="M${x + dx} ${y + dy - 9}l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#f6c85f"/>`).join(''),
  9: (x, y) => wc(`<ellipse cx="${x}" cy="${y + 14}" rx="46" ry="14" fill="#efd9a8"/><path d="M${x + 6} ${y + 10}c0-20-2-34 4-44" stroke="#9a7445" stroke-width="5" fill="none"/><path d="M${x + 10} ${y - 34}c-16-6-26 0-30 6 12-2 20 0 30-6zM${x + 10} ${y - 34}c14-8 24-4 30 2-12 0-20-2-30-2z" fill="#7fb36b"/>`, 'lu-wc'),
  10: (x, y) => wc(`<rect x="${x - 40}" y="${y - 24}" width="80" height="42" fill="#f6e6c6"/><path d="M${x - 48} ${y - 22}L${x} ${y - 50}L${x + 48} ${y - 22}z" fill="#6fa86a"/><rect x="${x - 8}" y="${y - 6}" width="16" height="24" fill="#a77a4a"/><path d="M${x} ${y - 50}v-16" stroke="${INK}" stroke-width="2"/><path d="M${x} ${y - 66}h14l-4 5 4 5h-14z" fill="#e0705a"/>`, 'lu-wc'),
};
export function worldBackground(regions, W, H, layout) {
  const rng = makeRng(2026); const out = []; const R = Math.min(W, H) * .115;
  out.push(`<rect width="${W}" height="${H}" fill="#cfe6ec"/>`);
  for (let i = 0; i < 26; i++) { const x = rng.int(0, W), y = rng.int(0, H); out.push(`<path d="M${x} ${y}q14-8 28 0t28 0" stroke="#e9f4f6" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>`); }
  const pts = layout.map(([x, y]) => ({ x: x * W, y: y * H }));
  out.push(wc(`<path d="${smoothPath(pts)}" stroke="#f3e6c4" stroke-width="${R * .32}" fill="none" stroke-linecap="round" opacity=".9"/>`), pen(`<path d="${smoothPath(pts)}" stroke-dasharray="2 18" stroke-width="4" opacity=".35"/>`));
  regions.forEach((r, i) => {
    const T = REGION_THEME[r.id]; const { x, y } = pts[i]; const lit = r.lit;
    const shore = island(rng, x, y, R * 1.18, R * .86), land = island(makeRng(r.id * 31), x, y - R * .04, R * 1.02, R * .72);
    out.push(wc(`<path d="${shore}" fill="${lit ? '#f1e3bd' : '#eef2ea'}"/>`));
    out.push(wc(`<path d="${land}" fill="${T.ground[1]}" opacity="${lit ? 1 : .55}"/><path d="${land}" fill="${T.ground[2]}" transform="translate(${x * .1} ${y * .1}) scale(.9)" opacity="${lit ? .55 : .3}"/>`));
    out.push(pen(`<path d="${shore}" opacity="${lit ? .55 : .35}"/>`, 2.4));
    const g = LAND_GLYPH[r.id] ? LAND_GLYPH[r.id](x, y) : '';
    const k = R / 70;
    out.push(`<g transform="translate(${x} ${y - R * .1}) scale(${k.toFixed(3)}) translate(${-x} ${-y})">${lit ? g : `<g opacity=".7" style="filter:saturate(.5)">${g}</g>`}</g>`);
    if (!lit) out.push(wc(`<ellipse cx="${x - R * .55}" cy="${y + R * .38}" rx="${R * .5}" ry="${R * .16}" fill="#fff" opacity=".75"/><ellipse cx="${x + R * .6}" cy="${y - R * .42}" rx="${R * .42}" ry="${R * .14}" fill="#fff" opacity=".7"/>`, 'lu-wc'));
  });
  return `<svg class="map-bg" viewBox="0 0 ${W} ${H}" aria-hidden="true">${out.join('')}</svg>`;
}

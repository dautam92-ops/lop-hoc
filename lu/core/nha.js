// Màn nhà và danh sách buổi (tam duyệt 26/11/2026 20:51). Dùng chung cho index.html và buoi.html.
// Tiến độ đọc từ cùng kho với bài học và cổng luyện tập: kv "done:Lxxx", "resume:Lxxx".
import { createVoice, holdButton, esc } from './lu-core.js';
import { LocalStorageAdapter } from './storage.js';

const j = async u => { const r = await fetch(u); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); };
const jOr = async (u, d) => { try { return await j(u); } catch { return d; } };

// 12 cổng mặc định khi chưa có content/cong/cong.json (luồng cổng luyện tập sở hữu tệp đó).
const CONG_MAC_DINH = [
  ['chu-cai', 'Chữ cái'], ['so-dem', 'Số và đếm'], ['toan-tu-duy', 'Toán tư duy'], ['logic', 'Logic'],
  ['khong-gian', 'Không gian'], ['tri-nho', 'Trí nhớ'], ['tham-tu', 'Thám tử'], ['tuong-tuong', 'Tưởng tượng'],
  ['ke-chuyen', 'Kể chuyện'], ['cam-xuc', 'Cảm xúc'], ['tieng-anh', 'Tiếng Anh'], ['kham-pha', 'Khám phá'],
].map(([id, ten]) => ({ id, ten, trang_thai: 'sap-mo' }));

// Biểu tượng cổng vẽ bằng mã: HÌNH TẠM, chờ tranh vẽ tay (content/man-nha/anh-can-ve.json, mã art:cong-*).
const ICON = {
  'chu-cai': '<text x="32" y="45" font-size="32" font-weight="800" text-anchor="middle" fill="#d9735e" font-family="Baloo 2,sans-serif">Aa</text>',
  'so-dem': '<text x="32" y="44" font-size="28" font-weight="800" text-anchor="middle" fill="#5f7a2a" font-family="Baloo 2,sans-serif">123</text>',
  'toan-tu-duy': '<text x="32" y="44" font-size="26" font-weight="800" text-anchor="middle" fill="#8a6a3a" font-family="Baloo 2,sans-serif">2+1</text>',
  logic: '<circle cx="14" cy="34" r="8" fill="#d9735e"/><rect x="25" y="26" width="15" height="15" rx="2" fill="#8fae3e"/><path d="M50 26l9 16H41z" fill="#f6c85f"/>',
  'khong-gian': '<path d="M32 14l16 9v18l-16 9-16-9V23z" fill="#cfe4f4" stroke="#4f8fa3" stroke-width="2.5"/><path d="M16 23l16 9 16-9M32 32v18" stroke="#4f8fa3" stroke-width="2.5" fill="none"/>',
  'tri-nho': '<rect x="10" y="16" width="20" height="30" rx="4" fill="#a8c24a"/><rect x="34" y="16" width="20" height="30" rx="4" fill="#fff" stroke="#8fae3e" stroke-width="2.5"/><circle cx="44" cy="31" r="5" fill="#d9735e"/>',
  'tham-tu': '<circle cx="27" cy="27" r="13" fill="#cfe4f4" stroke="#4a3b22" stroke-width="4"/><path d="M37 37l13 13" stroke="#8a6a3a" stroke-width="6" stroke-linecap="round"/>',
  'tuong-tuong': '<path d="M18 44a10 10 0 0 1 2-20 13 13 0 0 1 24-2 11 11 0 0 1 3 22z" fill="#fff" stroke="#c49bd6" stroke-width="3"/><circle cx="50" cy="14" r="4" fill="#f6c85f"/>',
  'ke-chuyen': '<path d="M32 20c-7-5-15-5-22-3v28c7-2 15-2 22 3 7-5 15-5 22-3V17c-7-2-15-2-22 3z" fill="#fdf0cc" stroke="#8a6a3a" stroke-width="2.5"/><path d="M32 20v28" stroke="#8a6a3a" stroke-width="2.5"/>',
  'cam-xuc': '<circle cx="32" cy="32" r="18" fill="#f7d58a"/><circle cx="25" cy="29" r="2.4" fill="#4a3b22"/><circle cx="39" cy="29" r="2.4" fill="#4a3b22"/><path d="M24 37q8 7 16 0" stroke="#4a3b22" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
  'tieng-anh': '<rect x="10" y="16" width="44" height="30" rx="8" fill="#cfe4f4"/><text x="32" y="38" font-size="18" font-weight="800" text-anchor="middle" fill="#2f6f86" font-family="Baloo 2,sans-serif">Hi!</text><path d="M20 46l-4 8 10-8" fill="#cfe4f4"/>',
  'kham-pha': '<path d="M16 48C16 26 30 14 50 14c0 22-12 34-34 34z" fill="#a8c24a"/><path d="M16 48L42 22" stroke="#5f7a2a" stroke-width="2.5"/>',
};
const HAT = (fill, stroke) => `<svg viewBox="0 0 34 22" aria-hidden="true"><path d="M3 12c0-6 6-9 12-8 4 .6 5 3 8 3s7-2 9 2c2 5-4 10-13 10C9 19 3 17 3 12z" fill="${fill}" stroke="${stroke}" stroke-width="2"/></svg>`;
export const SVG = {
  loa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#4a3626"/><path d="M16 8.5c1.6 1.8 1.6 5.2 0 7M18.6 6c3 3.2 3 8.8 0 12" stroke="#4a3626" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  khoa: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#fbf5e8"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="#fbf5e8" stroke-width="2.4" fill="none"/><circle cx="12" cy="15.5" r="1.6" fill="#7d4f27"/></svg>',
  khoaNhat: '<svg class="dau" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#d9a86c" stroke="#7d4f27" stroke-width="1.2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="#7d4f27" stroke-width="2" fill="none"/><circle cx="12" cy="15.5" r="1.5" fill="#4a3626"/></svg>',
  la: '<svg class="dau" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19C4 10 11 4 21 4c0 10-7 15-17 15z" fill="#8fae3e" stroke="#5f7a1e" stroke-width="1.2"/><path d="M4 19 16 8" stroke="#5f7a1e" stroke-width="1.6"/></svg>',
  choi: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.2v15.6c0 .8.9 1.3 1.6.9l12.2-7.8c.6-.4.6-1.4 0-1.8L8.1 3.3c-.7-.4-1.6.1-1.6.9z" fill="#fbf5e8"/></svg>',
  nha: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5" stroke="#a9713f" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 10v10h13V10" fill="#f2be2e" stroke="#7d4f27" stroke-width="1.6"/><rect x="10" y="14" width="4" height="6" fill="#a9713f"/></svg>',
  ve: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5 4 10.5 9.5 16" stroke="#4a3626" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.8 10.5H14a6 6 0 0 1 0 12h-1.5" stroke="#4a3626" stroke-width="2.8" fill="none" stroke-linecap="round"/></svg>',
  duong: '<svg viewBox="0 0 48 32" aria-hidden="true"><path d="M6 26C14 26 14 12 24 14S34 6 42 6" stroke="#a9713f" stroke-width="2.4" fill="none" stroke-dasharray="3 4" stroke-linecap="round"/><circle cx="6" cy="26" r="4.5" fill="#7d4f27"/><circle cx="24" cy="14" r="4.5" fill="#7d4f27"/><circle cx="42" cy="6" r="4.5" fill="#7d4f27"/></svg>',
  hatXong: HAT('#7e9a35', '#4a6a1a'), hatCho: HAT('#fffaf0', '#c9a77a'),
};
// Chậu cây "Vườn ươm" (hình vẽ mã tạm, chờ tranh vẽ tay: anh-can-ve.json art:chau-*).
// loai: 'trong' (chưa tới), 'hat' (hôm nay, hạt vừa ló), 'cay1' | 'cay2' | 'cay3' (đã học, cây lớn dần)
export function chauCay(loai) {
  const chau = '<path d="M14 52h72l-8 44H22z" fill="#c8794a" stroke="#7d4f27" stroke-width="2.4" stroke-linejoin="round"/><path d="M22 60c10 3 46 3 56 0" stroke="#e39a68" stroke-width="2.4" fill="none" opacity=".7"/><rect x="9" y="42" width="82" height="13" rx="4" fill="#d98b57" stroke="#7d4f27" stroke-width="2.4"/><ellipse cx="50" cy="43.5" rx="36" ry="4.5" fill="#6b4a2e"/>';
  const la = (x, y, r, s = 1) => `<path d="M${x} ${y}c${8 * s}-${10 * r} ${22 * s}-${10 * r} ${26 * s}-${4 * r}c-${6 * s} ${9 * r}-${18 * s} ${10 * r}-${26 * s} ${4 * r}z" fill="#8fae3e" stroke="#5f7a1e" stroke-width="1.8"/>`;
  const than = (h) => `<path d="M50 44c0-${h * .4} -2-${h * .7} 0-${h}" stroke="#5f7a1e" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  let cay = '';
  if (loai === 'hat') cay = '<ellipse cx="50" cy="41" rx="8" ry="5.5" fill="#e0b56a" stroke="#8a5a2e" stroke-width="1.8"/><path d="M50 38c-1-4 1-7 4-8" stroke="#7e9a35" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  if (loai === 'cay1') cay = than(14) + la(50, 32, .8, -1) + la(50, 32, .8);
  if (loai === 'cay2') cay = than(28) + la(50, 34, .9, -1) + la(50, 24, 1) + la(50, 18, .8, -1);
  if (loai === 'cay3') cay = than(40) + la(50, 36, 1, -1) + la(50, 28, 1.1) + la(50, 18, 1, -1) + la(50, 9, .8) + '<path d="M57 30c5 2 6 9 3 14" stroke="#6f8f2a" stroke-width="5" fill="none" stroke-linecap="round"/>';
  return `<svg class="chau" viewBox="2 -22 96 118" preserveAspectRatio="xMidYMax meet" data-art="art:chau-${loai}" aria-hidden="true"><g transform="translate(50 44) scale(1.45) translate(-50 -44)">${cay}</g>${chau}</svg>`;
}
export const SINH_VAT = {
  ong: '<svg class="sinh-vat" viewBox="0 0 40 30" data-art="art:ong" aria-hidden="true"><ellipse cx="14" cy="9" rx="7" ry="6" fill="#fff" stroke="#c9b38a" stroke-width="1.5" opacity=".9"/><ellipse cx="24" cy="8" rx="7" ry="6" fill="#fff" stroke="#c9b38a" stroke-width="1.5" opacity=".9"/><ellipse cx="20" cy="19" rx="11" ry="8" fill="#f2be2e" stroke="#4a3626" stroke-width="1.8"/><path d="M17 12v14M23 12v14" stroke="#4a3626" stroke-width="2.4"/><circle cx="30" cy="18" r="1.4" fill="#4a3626"/></svg>',
  buom: '<svg class="sinh-vat" viewBox="0 0 40 30" data-art="art:buom" aria-hidden="true"><path d="M20 15C14 2 2 4 6 14c-4 8 8 12 14 2z" fill="#f2a99a" stroke="#a8604f" stroke-width="1.5"/><path d="M20 15C26 2 38 4 34 14c4 8-8 12-14 2z" fill="#f7d58a" stroke="#a8803f" stroke-width="1.5"/><path d="M20 8v16" stroke="#4a3626" stroke-width="2.2" stroke-linecap="round"/></svg>',
  oc: '<svg class="sinh-vat" viewBox="0 0 40 30" data-art="art:oc-sen" aria-hidden="true"><path d="M6 26h28c0-3-3-5-7-5" fill="#e8d3a6" stroke="#8a6a3a" stroke-width="1.6"/><circle cx="18" cy="17" r="9" fill="#d9a86c" stroke="#7d4f27" stroke-width="1.8"/><path d="M18 17m-4 0a4 4 0 1 0 4-4" stroke="#7d4f27" stroke-width="1.6" fill="none"/><path d="M30 21l2-7M33 21l3-6" stroke="#8a6a3a" stroke-width="1.4"/></svg>',
};
// Dây đậu tiến độ của chủ đề (theo ảnh mẫu màn nhà đã duyệt): hạt xanh = đã học, hạt sáng = hôm nay, hạt viền = chưa tới.
export function dayDau(n, xong, homNay) {
  const W = 1000, H = 60, x0 = 40, x1 = 960, step = (x1 - x0) / Math.max(1, n - 1);
  const y = i => 30 + Math.sin(i * 0.9) * 3;
  let beans = '';
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * step, cy = y(i), r = Math.min(15, step * 0.42);
    const t = xong(i) ? 'x' : i === homNay ? 'h' : 'c';
    const fill = t === 'x' ? '#7e9a35' : t === 'h' ? '#c8d94a' : '#fffaf0', st = t === 'c' ? '#c9a77a' : '#4a6a1a';
    const k = t === 'h' ? 1.35 : 1;
    if (t === 'h') beans += `<circle cx="${cx}" cy="${cy}" r="${r * 2}" fill="#f2be2e" opacity=".28"/>`;
    beans += `<ellipse cx="${cx}" cy="${cy}" rx="${r * k}" ry="${r * 0.68 * k}" fill="${fill}" stroke="${st}" stroke-width="2.2"/>`;
    if (t === 'x') beans += `<ellipse cx="${cx - r * .3}" cy="${cy - r * .2}" rx="${r * .3}" ry="${r * .16}" fill="#c8d94a" opacity=".7"/>`;
  }
  const leaf = (x, dir) => `<path d="M${x} 30c${dir * 14}-16 ${dir * 30}-14 ${dir * 34}-6c${-dir * 8} 10 ${-dir * 24} 12 ${-dir * 34} 6z" fill="#8fae3e" stroke="#5f7a1e" stroke-width="2"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Tiến độ chủ đề"><path d="M${x0 - 20} 30 Q ${W / 2} ${24} ${x1 + 20} 30" stroke="#6f8f2a" stroke-width="5" fill="none" stroke-linecap="round"/>${leaf(x0 - 20, -1)}${leaf(x1 + 20, 1)}${beans}</svg>`;
}
export const congIcon = c => c.hinh && /\.(webp|png|svg)$/.test(c.hinh) && !c.hinh_tam
  ? `<img src="${esc(c.hinh)}" alt="">`
  : `<svg viewBox="0 0 64 64" data-art="art:cong-${esc(c.id)}" aria-hidden="true">${ICON[c.id] || ICON['kham-pha']}</svg>`;

/* ---------- Giọng đọc: Hoài My nếu đã có tệp, chưa có thì giọng tạm của trình duyệt ---------- */
function makeTts() {
  const s = 'speechSynthesis' in window ? speechSynthesis : null; if (!s) return null;
  const pick = () => s.getVoices().find(v => v.lang?.toLowerCase().startsWith('vi')) || null;
  return {
    ok: () => true,
    speak: t => new Promise(res => { const u = new SpeechSynthesisUtterance(t); u.lang = 'vi-VN'; const v = pick(); if (v) u.voice = v; u.rate = .95; u.onend = u.onerror = () => res(); s.speak(u); }),
    cancel: () => s.cancel(), unlock: () => { try { s.speak(new SpeechSynthesisUtterance('')); } catch {} },
  };
}

/* ---------- Dữ liệu chung ---------- */
export async function taiDuLieu() {
  const p = new URLSearchParams(location.search); const fast = p.get('fast') === '1';
  const [cfg, cur, audio, ds, chars] = await Promise.all([
    j('content/man-nha/man-nha.json'), j('content/curriculum.json'), jOr('content/audio/registry.json', { clips: {} }),
    j('content/man-nha/goi-bai.json'), jOr('registry/characters.json', null),
  ]);
  const congRaw = ds.cong ? await jOr('content/cong/cong.json', null) : null;
  const ns = p.get('ns') || cfg.ns; const store = new LocalStorageAdapter(ns);
  const kv = () => store.d.kv || {};
  const chuDe = cur.regions.map((r, i) => ({ so: i + 1, ten: r.name, tuoi: r.age, buoi: r.lessons.map(l => ({ id: l.id, so: +l.id.slice(1), ten: l.title })),
    nen: (cfg.chu_de.find(c => c.so === i + 1) || {}).nen || cfg.nen_mac_dinh }));
  const tatCa = chuDe.flatMap(c => c.buoi.map(b => ({ ...b, chuDe: c.so })));
  const daXong = id => !!kv()['done:' + id];
  const moHet = () => !!kv()['nha:mo-het'];
  const homNay = tatCa.find(b => !daXong(b.id)) || null;
  const moDuoc = b => daXong(b.id) || (homNay && b.id === homNay.id) || moHet();
  let congs = (congRaw && (congRaw.cong || congRaw.cổng || congRaw.gates || (Array.isArray(congRaw) ? congRaw : null))) || CONG_MAC_DINH;
  congs = congs.map(c => ({ id: c.id, ten: c.ten || c.name || c.id, hinh: c.hinh || c.icon || '', hinh_tam: c.hinh_tam, trang_thai: c.trang_thai || c.status || 'sap-mo' }));
  const voice = createVoice({ clips: audio.clips, base: 'content/audio/', fast, tts: fast ? null : makeTts() });
  const luKid = chars?.LU?.bieu_cam?.vui?.webp || cfg.lu.vay;
  // Gói bài có sẵn chưa (bản nháp hoặc đã xuất bản)
  const goi = async id => { const t = ds.goi[id]; if (!t) return null; const x = await jOr(`content/${t}/${id}.json`, null); return x && { ...x, __nhap: t === 'drafts' }; };
  const linkBuoi = (b, nhap = true) => `player.html?${nhap ? 'draft' : 'lesson'}=${b.id}&ns=${encodeURIComponent(ns)}&nha=1`;
  return { p, fast, cfg, ns, store, kv, chuDe, tatCa, daXong, moHet, homNay, moDuoc, congs, voice, luKid, goi, linkBuoi };
}

// Chạm lần đầu mở khóa âm thanh (trình duyệt chặn tự phát)
export function moAmThanh(voice, fn) {
  let done = false;
  const go = () => { if (done) return; done = true; voice.unlock(); fn && fn(); };
  addEventListener('pointerdown', go, { once: true, capture: true });
}

/* ---------- Khu bố mẹ (giữ 2 giây) ---------- */
export function khuBoMe(btn, D, { fast } = {}) {
  const box = document.createElement('div'); box.className = 'bo-me'; box.hidden = true;
  box.innerHTML = `<div class="hop" role="dialog" aria-label="Khu bố mẹ"><h2>Khu bố mẹ</h2>
    <label>Tên bé<input type="text" id="bm-ten" maxlength="20"></label>
    <label class="hang"><input type="checkbox" id="bm-mo">Mở sẵn tất cả buổi học</label>
    <p>Mặc định bé học lần lượt từng buổi. Mở sẵn để bố mẹ chọn buổi bất kỳ.</p>
    <div class="nut"><button id="bm-luu">Lưu</button><button class="phu" id="bm-dong">Đóng</button></div></div>`;
  document.body.appendChild(box);
  const ten = box.querySelector('#bm-ten'), mo = box.querySelector('#bm-mo');
  const open = () => { ten.value = D.kv()['nha:ten'] || ''; mo.checked = D.moHet(); box.hidden = false; ten.focus(); };
  holdButton(btn, open, fast);
  btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  box.querySelector('#bm-dong').onclick = () => { box.hidden = true; };
  box.querySelector('#bm-luu').onclick = () => {
    D.store.setSession('nha:ten', ten.value.trim()); D.store.setSession('nha:mo-het', mo.checked); location.reload();
  };
}

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
export const SVG = {
  loa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#4a3b22"/><path d="M16 8.5c1.6 1.8 1.6 5.2 0 7M18.6 6c3 3.2 3 8.8 0 12" stroke="#4a3b22" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  khoa: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#4a3b22"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="#4a3b22" stroke-width="2.4" fill="none"/></svg>',
  khoaNhat: '<svg class="dau" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#b4a17e"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="#b4a17e" stroke-width="2.4" fill="none"/></svg>',
  la: '<svg class="dau" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19C5 10 11 5 20 5c0 9-6 14-15 14z" fill="#8fae3e"/><path d="M5 19 15 9" stroke="#5f7a2a" stroke-width="1.8"/></svg>',
  choi: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5v17l14-8.5z" fill="#fff"/></svg>',
  nha: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V10l8-6 8 6v11h-5v-6H9v6z" fill="#8a6a3a"/></svg>',
  ve: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6 4 12l6 6M4.5 12H15a5 5 0 0 1 0 10h-2" stroke="#4a3b22" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  duong: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="18" r="2.8" fill="#8fae3e"/><circle cx="12" cy="12" r="2.8" fill="#8fae3e"/><circle cx="19" cy="6" r="2.8" fill="#c9b38a"/><path d="M6.9 16.1 10.1 13.9M13.9 10.1 17.1 7.9" stroke="#8a6a3a" stroke-width="1.8" stroke-dasharray="2 2"/></svg>',
};
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
  const luKid = chars?.LU?.goc_nhin?.truoc?.webp || cfg.lu.vay;
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

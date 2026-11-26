import { setVisLu } from '../ui/art.js';
// lu-core: thư viện dùng chung cho Hành trình, Sân chơi và Admin xem trước.
// Không phụ thuộc chế độ học, không gọi mạng khi trẻ chơi (S03-R06, D18).
export const CORE_VERSION = '0.1.0';

/* ---------- Ngẫu nhiên có seed: cùng seed thì ra đúng biến thể cũ (S09-R02) ---------- */
export function makeRng(seed) {
  let s = (Number(seed) >>> 0) || 1;
  const next = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  return { seed, next, shuffle, int: (a, b) => a + Math.floor(next() * (b - a + 1)), pick: a => a[Math.floor(next() * a.length)], sample: (a, n) => shuffle(a).slice(0, n) };
}
export const subSeed = (seed, k) => ((Number(seed) >>> 0) ^ Math.imul(k + 1, 0x9E3779B1)) >>> 0;
export const newSeed = () => (Math.random() * 2 ** 32) >>> 0;

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Điền {tên} trong câu. Thiếu biến thì báo lỗi ngay, không để lọt "{n}" hay "undefined" ra màn hình (S02-R08).
export function fill(text, vars = {}) {
  return String(text).replace(/\{(\w+)\}/g, (_, k) => {
    if (vars[k] === undefined || vars[k] === null || Number.isNaN(vars[k])) throw new Error(`Thiếu biến {${k}} trong câu: ${text}`);
    return vars[k];
  });
}
export const uid = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2));

/* ---------- Giọng đọc: đọc hết câu rồi mới cho chạm (S02-R06) ---------- */
// Âm khen tiếng Anh chỉ dùng trong phần tiếng Anh; khi phát thì chữ hiển thị cũng là tiếng Anh, không để chữ tiếng Việt cũ.
const CAP = { __ok: 'Excellent!', __no: 'Oops!' };
export function createVoice({ clips = {}, base = '', fast = false, onMissing = () => {} } = {}) {
  const audio = typeof Audio !== 'undefined' ? new Audio() : null;
  const v = { busy: false, last: [], caption: null, onBusy: () => {} };
  const src = k => { const c = clips[k]; if (!c) return null; return c.startsWith('data:') || /^https?:|^\//.test(c) ? c : base + c; };
  v.speak = (keys) => new Promise(done => {
    keys = [].concat(keys).filter(Boolean); v.busy = true; v.onBusy(true);
    let i = 0;
    const finish = () => { v.busy = false; v.onBusy(false); done(); };
    const next = () => {
      if (i >= keys.length) return finish();
      const k = keys[i++];
      if (v.caption && (!k.startsWith('__') || CAP[k])) v.caption.textContent = CAP[k] || k; // chữ hiện luôn khớp lời đang đọc, cùng ngôn ngữ
      if (!k.startsWith('__') && !clips[k]) onMissing(k);
      if (fast || !audio) return setTimeout(next, 5);
      const s = src(k);
      if (!s) return setTimeout(next, k.startsWith('__') ? 300 : 500 + k.length * 55);
      let ended = false; const go = () => { if (!ended) { ended = true; next(); } };
      audio.onended = go; audio.onerror = go; audio.src = s;
      const p = audio.play(); if (p && p.catch) p.catch(() => setTimeout(go, 500 + k.length * 55));
      setTimeout(go, 15000);
    };
    next();
  });
  // Âm hiệu ngắn phát song song, không khóa chạm (vd. tiếng "ting" khi lật đúng một đôi).
  const fx = typeof Audio !== 'undefined' ? new Audio() : null;
  v.sfx = k => { const s = src(k); if (fast || !fx || !s) return; try { fx.currentTime = 0; } catch {} fx.src = s; const p = fx.play(); if (p && p.catch) p.catch(() => {}); };
  v.say = keys => { v.last = [].concat(keys).filter(k => k && !k.startsWith('__')); return v.speak(keys); };
  v.replay = () => (!v.busy && v.last.length ? v.speak(v.last) : Promise.resolve());
  v.unlock = () => { if (!audio) return; audio.muted = true; const p = audio.play(); if (p && p.catch) p.catch(() => {}); audio.pause(); audio.muted = false; };
  v.stop = () => { if (audio) audio.pause(); v.busy = false; v.onBusy(false); };
  return v;
}

/* ---------- Khung màn hình: thanh chặng, cảnh học, khu đáp án tách riêng (S02-R07, S04-R08) ---------- */
// Dự phòng khi chưa nạp ảnh Lu chính thức: mầm cây hai lá (không dùng hình chú chó cũ)
export const LU_SVG = `<svg class="lu" viewBox="0 0 160 150" role="img" aria-label="Lu"><ellipse cx="80" cy="140" rx="40" ry="7" fill="#6b5232" opacity=".12"/><path d="M80 138V80" stroke="#6a8a2a" stroke-width="8" stroke-linecap="round"/><path d="M80 84C52 84 34 64 34 38c28 0 46 18 46 46z" fill="#a9c75a" stroke="#6b5232" stroke-width="3"/><path d="M80 84c26-3 44-24 44-50-28 3-44 22-44 50z" fill="#8fae3e" stroke="#6b5232" stroke-width="3"/></svg>`;

// Ảnh Lu theo ngữ cảnh: app gắn hàm trả về <img> từ Character Registry; mặc định dùng hình cũ để engine chạy độc lập.
const luArtHook = { fn: null };
export function setLuArt(fn) { luArtHook.fn = fn; setVisLu(fn); }
export const luArt = (expr = 'vui') => (luArtHook.fn ? luArtHook.fn(expr) : LU_SVG);

export function createUI(root, voice) {
  root.innerHTML = `<div class="app"><div class="backdrop" aria-hidden="true"></div><div class="top"><div class="steps"></div><button class="ibtn replay" aria-label="Nghe lại"><svg class="lu-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 9.5h3l4.5-4v13l-4.5-4h-3z"/><path d="M15.5 9c1.2 1.6 1.2 4.4 0 6"/><path d="M18 6.8c2.4 2.9 2.4 7.5 0 10.4"/></svg></button></div><div class="stage"></div></div>`;
  const q = s => root.querySelector(s);
  const ui = { root, stage: q('.stage'), steps: [] };
  q('.replay').onclick = () => voice.replay();
  voice.onBusy = b => { if (b) root.dataset.busy = 1; else delete root.dataset.busy; const lu = root.querySelector('.lu'); if (lu) lu.classList.toggle('talk', b); };
  ui.setSteps = names => { ui.steps = names; };
  ui.setStep = n => { q('.steps').innerHTML = ui.steps.map((s, i) => `<i class="${i < n ? 'done' : i === n ? 'now' : ''}" title="${esc(s)}"></i>`).join(''); };
  ui.scene = (title, inner = '') => { const guide = luArtHook.fn && !/class="lu[ "]/.test(inner) ? `<div class="guide" aria-hidden="true">${luArtHook.fn(ui.guide || 'chi-tay')}</div>` : ''; ui.stage.innerHTML = `<div class="scene">${guide}<h1 class="title">${esc(title)}</h1>${inner}<div class="cap"></div></div>`; voice.caption = ui.stage.querySelector('.cap'); return ui.stage.querySelector('.scene'); };
  ui.answers = (label, html) => { const d = document.createElement('div'); d.className = 'answers'; d.innerHTML = `<div class="lbl">${esc(label)}</div>` + html; ui.stage.appendChild(d); return d; };
  // Bối cảnh L1–L2 phía sau cả màn (S04-R15). html rỗng thì bỏ nền.
  ui.setBackdrop = (k, html, real) => { const b = q('.backdrop'), a = q('.app'); if (b.dataset.k === (k || '')) return; b.dataset.k = k || ''; b.innerHTML = html || ''; a.classList.toggle('has-bd', !!html); a.classList.toggle('bd-tam', !!html && !real); };
  ui.shake = el => { el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 450); };
  return ui;
}

// Nút giữ 2 giây để vào khu bố mẹ (khóa người lớn, S13-R12)
export function holdButton(b, fn, fast) {
  let t = null, st = 0; const bar = b.querySelector('.bar');
  const stop = () => { cancelAnimationFrame(t); t = null; if (bar) bar.style.width = 0; };
  const tick = () => { const p = Math.min(1, (Date.now() - st) / 2000); if (bar) bar.style.width = (p * 100) + '%'; if (p >= 1) { stop(); fn(); } else t = requestAnimationFrame(tick); };
  b.addEventListener('pointerdown', e => { e.preventDefault(); st = Date.now(); tick(); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, stop));
  if (fast) b.addEventListener('dblclick', fn);
}

// Kéo thả hoặc chạm hai lần (chạm hình rồi chạm đích) – dùng chung cho E02, E03
export function dragOrTap(piece, { isBusy, targetClass, onDrop, onSelect }) {
  piece.addEventListener('pointerdown', ev => {
    if (isBusy()) return; ev.preventDefault();
    const r0 = piece.getBoundingClientRect(); const sx = ev.clientX, sy = ev.clientY; let moved = false, ghost = null;
    const mv = e => { const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > 8) { moved = true; ghost = piece.cloneNode(true); ghost.classList.add('drag'); ghost.style.width = r0.width + 'px'; ghost.style.height = r0.height + 'px'; document.body.appendChild(ghost); piece.classList.add('ghost'); }
      if (ghost) { ghost.style.left = (r0.left + dx) + 'px'; ghost.style.top = (r0.top + dy) + 'px'; } };
    const up = e => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      if (ghost) { ghost.remove(); piece.classList.remove('ghost'); const t = document.elementsFromPoint(e.clientX, e.clientY).find(x => x.classList && x.classList.contains(targetClass)); if (t) onDrop(piece, t); }
      else onSelect(piece); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
  });
}

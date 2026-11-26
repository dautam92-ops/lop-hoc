// Bộ công cụ dùng chung cho các engine mới (E07, E08, E10–E14) và các chế độ mở rộng của E00, E01, E04, E06.
// Không phụ thuộc chế độ học, không gọi mạng, không gọi AI trong phiên học (S03-R06, chỉ thị Method Library mục XII).
import { esc, fill } from '../core/lu-core.js';
import { vis } from '../ui/art.js';
export { esc, fill, vis };

export const sleep = (ctx, ms) => new Promise(r => setTimeout(r, ctx.fast ? 0 : ms));
// Hook cho Phòng mẫu: "Thử đúng" / "Thử sai" gọi hàm do engine đăng ký (với thao tác không phải chạm một nút)
export const setAuto = (ctx, right, wrong) => { if (ctx.test?.setAuto) ctx.test.setAuto(right, wrong); };

// Khung tranh kể chuyện: nền (ảnh đã duyệt "asset:BC-0002" hoặc hình vẽ mã) + nhân vật, đồ vật đặt theo % (x, y là tâm đáy)
export function frameHTML({ bg = '', items = [], cls = '' } = {}) {
  const bgh = bg ? `<div class="fr-bg">${bg.startsWith('asset:') || bg.startsWith('art:') ? vis(bg) : bg}</div>` : '';
  return `<div class="frame ${cls}">${bgh}${items.map((it, i) => `<div class="fr-it${it.tap ? ' tap' : ''}" data-i="${i}" style="left:${it.x}%;bottom:${100 - (it.y ?? 90)}%;width:${it.w || 22}%;${it.flip ? 'transform:translateX(-50%) scaleX(-1)' : ''}">${vis(it.v)}</div>`).join('')}</div>`;
}

// Lời khen cụ thể: ưu tiên câu soạn sẵn cho đúng việc bé làm; xoay vòng để không lặp một câu (S07, mục VI chỉ thị)
export function praiser(list) { let n = 0; return (vars = {}) => fill(list[n++ % list.length], vars); }
export const PRAISE_VI = ['Đúng rồi!', 'Bé giỏi lắm!', 'Chính xác rồi!', 'Hay quá!'];
export const PRAISE_EN = ['Great job!', 'Well done!', 'Super!', 'Excellent!'];

// Nút số dùng chung (chọn số lượng)
export const numBtn = (v, i) => `<button class="opt num" data-i="${i}" aria-label="số ${v}">${v}</button>`;

/* ---------- Âm thanh tổng hợp bằng WebAudio (không cần tải file): nhạc cụ cho E12 và tiếng hiệu ứng nhẹ ---------- */
let AC = null;
export function audioCtx() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch { return null; } }
const env = (ac, g, t, a, d, peak = .6) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
const noiseBuf = ac => { const b = ac.createBuffer(1, ac.sampleRate * .5, ac.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };
const NOTES = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, C6: 1046.5 };
// Trả về thời lượng (giây) của âm
export function playSound(kind, opt = {}) {
  const ac = audioCtx(); if (!ac) return .3; const t = ac.currentTime + .01; const out = ac.createGain(); out.gain.value = opt.vol ?? .9; out.connect(ac.destination);
  if (kind === 'trong') { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(55, t + .25); env(ac, g, t, .005, .35, .9); o.connect(g).connect(out); o.start(t); o.stop(t + .45);
    const n = ac.createBufferSource(), ng = ac.createGain(), f = ac.createBiquadFilter(); n.buffer = noiseBuf(ac); f.type = 'lowpass'; f.frequency.value = 900; env(ac, ng, t, .002, .08, .25); n.connect(f).connect(ng).connect(out); n.start(t); n.stop(t + .12); return .4; }
  if (kind === 'chuong') { [1, 2.76, 5.4].forEach((m, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = 880 * m; env(ac, g, t, .004, 1.4 - i * .4, .35 / (i + 1)); o.connect(g).connect(out); o.start(t); o.stop(t + 1.6); }); return 1.2; }
  if (kind === 'dan' || kind.startsWith('note:')) { const f = NOTES[kind.split(':')[1] || opt.note || 'E5'] || 659.25; [1, 4].forEach((m, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f * m; env(ac, g, t, .003, i ? .15 : .7, i ? .12 : .5); o.connect(g).connect(out); o.start(t); o.stop(t + .9); }); return .6; }
  if (kind === 'xac-xo') { [0, .14].forEach(dt => { const n = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter(); n.buffer = noiseBuf(ac); f.type = 'highpass'; f.frequency.value = 4000; env(ac, g, t + dt, .01, .09, .45); n.connect(f).connect(g).connect(out); n.start(t + dt); n.stop(t + dt + .15); }); return .35; }
  if (kind === 'vo-tay') { const n = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter(); n.buffer = noiseBuf(ac); f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = .8; env(ac, g, t, .002, .12, .9); n.connect(f).connect(g).connect(out); n.start(t); n.stop(t + .2); return .25; }
  if (kind === 'nuoc') { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(900, t + .12); env(ac, g, t, .005, .15, .3); o.connect(g).connect(out); o.start(t); o.stop(t + .2); return .2; }
  if (kind === 'cham') { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = 220; env(ac, g, t, .004, .1, .25); o.connect(g).connect(out); o.start(t); o.stop(t + .15); return .12; }
  if (kind === 'buoc') { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = 520 + (opt.k || 0) * 30; env(ac, g, t, .003, .08, .18); o.connect(g).connect(out); o.start(t); o.stop(t + .1); return .08; }
  return .2;
}
export const SOUND_NAMES = { trong: 'cái trống', chuong: 'cái chuông', dan: 'đàn gõ', 'xac-xo': 'cái xắc xô', 'vo-tay': 'tiếng vỗ tay' };

// Lưu sản phẩm sáng tạo của bé trên máy (Tủ tranh), không gửi đi đâu
export function saveArtwork(kind, data) {
  try { const k = 'lu-tu-tranh'; const a = JSON.parse(localStorage.getItem(k) || '[]'); a.unshift({ kind, data, at: Date.now() }); localStorage.setItem(k, JSON.stringify(a.slice(0, 24))); } catch { /* bộ nhớ đầy hoặc bị chặn: bỏ qua */ }
}

// Kéo một phần tử tự do bằng con trỏ, gọi onMove(x,y) theo tọa độ client và onEnd
export function pointerTrack(el, { onStart, onMove, onEnd, isBusy = () => false }) {
  el.addEventListener('pointerdown', e => {
    if (isBusy()) return; e.preventDefault(); el.setPointerCapture?.(e.pointerId);
    if (onStart && onStart(e.clientX, e.clientY, e) === false) return;
    const mv = ev => onMove && onMove(ev.clientX, ev.clientY, ev);
    const up = ev => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); onEnd && onEnd(ev.clientX, ev.clientY, ev); };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
}
// Đổi tọa độ client sang tọa độ viewBox của một SVG
export function svgPoint(svg, x, y) { const p = svg.createSVGPoint(); p.x = x; p.y = y; const m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x, y }; }

// Kiểm tra chung cho dữ liệu hoạt động
export const req = (act, fields) => fields.filter(f => act[f] === undefined || act[f] === null || act[f] === '').map(f => `${act.activity_id}: thiếu trường "${f}"`);

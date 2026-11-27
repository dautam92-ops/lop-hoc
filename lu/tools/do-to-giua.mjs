// Quy tắc 33 (tam 26/11 17:35): mọi thứ để bé học phải TO và nằm GIỮA màn hình.
// Hàm đo chạy trong trình duyệt (page.evaluate). Dùng chung cho Phòng mẫu (test-lab) và cổng kiểm tra bài (play-draft).
export const NGUONG = {
  phone: { tile: 72 },   // ô bé chạm để trả lời: cạnh ngắn ≥ 72px (trước 26/11 là 60px)
  ipad: { tile: 100 },  // ≥ 100px trên iPad (trước là 64–88px)
  cao: 0.45,             // khối nội dung học cao ≥ 45% vùng dưới thanh trên cùng
  tam: [0.35, 0.65],     // tâm khối nằm trong 35–65% chiều cao vùng đó
  trong: 0.12,           // không khoảng trống dọc nào giữa các phần học lớn hơn 12% chiều cao màn
};
export async function doToGiua() {
  // chờ các hiệu ứng xuất hiện (trượt vào, phóng to) chạy xong để đo đúng vị trí thật
  const anims = document.getAnimations().filter(a => a.effect?.getComputedTiming().iterations !== Infinity).map(a => a.finished.catch(() => {}));
  await Promise.race([Promise.all(anims), new Promise(r => setTimeout(r, 1500))]);
  const vw = innerWidth, vh = innerHeight;
  const top = document.querySelector('.top')?.getBoundingClientRect().bottom || 0;
  const H = vh - top;
  const ok = r => r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < vh;
  const shown = el => { for (let x = el; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (s.visibility === 'hidden' || s.display === 'none') return false; } return true; };
  const TILE = '.stage .opt, .stage .card, .stage .piece, .stage .cell-f, .stage .shadow, .stage .prop';
  const els = [...document.querySelectorAll(TILE)].filter(e => !e.closest('.lbl') && !e.classList.contains('crayon') && !e.classList.contains('dw-undo') /* dụng cụ vẽ, không phải nội dung học (quy tắc 47: thanh bút gọn để vùng vẽ to) */ && shown(e)).filter(e => ok(e.getBoundingClientRect()));
  const tiles = els.map(e => e.getBoundingClientRect());
  // mảnh ghép tranh có hình dạng theo tranh gốc (dẹt), nên đo cạnh dài
  const side = (e, r) => e.classList.contains('pz-piece') ? Math.max(r.width, r.height) : Math.min(r.width, r.height);
  if (!tiles.length) return { skip: true };
  const parts = [...document.querySelectorAll('.stage .scene > *:not(.guide):not(.bd-note), .stage .answers > *')]
    // ô lời dẫn (.cap) giữ chỗ cả khi Lu chưa nói, nên chỉ cần có chiều cao
    .filter(shown).map(e => e.getBoundingClientRect()).filter(r => r.height > 4 && r.bottom > 0 && r.top < vh).concat(tiles);
  const y0 = Math.max(top, Math.min(...parts.map(r => r.top))), y1 = Math.min(vh, Math.max(...parts.map(r => r.bottom)));
  // khoảng trống dọc lớn nhất giữa các phần học (gộp khoảng)
  const iv = parts.map(r => [Math.max(r.top, top), Math.min(r.bottom, vh)]).sort((a, b) => a[0] - b[0]);
  let gap = 0, end = iv[0][1];
  for (const [a, b] of iv) { if (a > end) gap = Math.max(gap, a - end); end = Math.max(end, b); }
  return {
    tile: Math.round(Math.min(...els.map((e, i) => side(e, tiles[i])))),
    cao: +((y1 - y0) / H).toFixed(2),
    tam: +(((y0 + y1) / 2 - top) / H).toFixed(2),
    trong: +(gap / vh).toFixed(2),
  };
}
export function danhGia(m, dev) {
  if (!m || m.skip) return [];
  const n = NGUONG, e = [];
  if (m.tile < n[dev].tile) e.push(`ô đáp án nhỏ ${m.tile}px (cần ≥ ${n[dev].tile}px)`);
  if (m.cao < n.cao) e.push(`khối bài học chỉ cao ${Math.round(m.cao * 100)}% màn (cần ≥ ${n.cao * 100}%)`);
  if (m.tam < n.tam[0] || m.tam > n.tam[1]) e.push(`khối bài học lệch, tâm ở ${Math.round(m.tam * 100)}% chiều cao (cần 35–65%)`);
  if (m.trong > n.trong) e.push(`khoảng trống giữa ${Math.round(m.trong * 100)}% màn (tối đa ${n.trong * 100}%)`);
  return e;
}

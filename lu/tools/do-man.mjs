// Đo một màn đang mở (chạy trong trình duyệt). Dùng chung cho bài học (play-draft) và cổng luyện tập (cong/kiem-cong),
// để mọi lỗi tam đã báo được kiểm cùng một cách ở mọi nơi (tam 26/11 20:47).
export function doMan() {
  const vw = innerWidth, vh = innerHeight, A = vw * vh;
  const vis = r => Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
  const bd = document.querySelector('.app.has-bd'); const real = bd && !bd.classList.contains('bd-tam');
  const bdArea = bd ? vis(document.querySelector('.backdrop').getBoundingClientRect()) : 0;
  const ui = [...document.querySelectorAll('.top, .answers .lbl, .big-btn, .scene .title, .cap')].reduce((s, x) => s + vis(x.getBoundingClientRect()), 0);
  const taps = [...document.querySelectorAll('.stage .opt, .stage .piece, .stage .cell, .stage .bal, .stage .card, .stage .prop, .stage .big-btn')].map(x => x.getBoundingClientRect()).filter(r => r.width);
  return { illusPct: Math.round(100 * Math.max(0, bdArea - ui) / A), backdrop: !!bd, realBackdrop: !!real, minTap: taps.length ? Math.round(Math.min(...taps.map(r => Math.min(r.width, r.height)))) : 0,
    emoji: ((document.body.innerText || '').match(/\p{Extended_Pictographic}/gu) || []).length };
}

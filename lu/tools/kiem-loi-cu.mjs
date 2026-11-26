// Phép thử cho các lỗi tam đã báo (tam 26/11 18:40: "mọi lỗi tôi đã gửi không được phép lặp lại").
// Chạy trên một màn đang mở; dùng chung cho Phòng mẫu (test-lab.mjs) và cổng kiểm tra bài (play-draft.mjs → cong-kiem-tra.mjs).
// Thêm lỗi mới: viết phép thử ở đây, chạy trên bản lỗi để thấy nó bắt được, rồi sửa và ghi vào SO-LOI.md.
export async function kiemLoiCu(page) {
  const r = { checks: {} }, errs = [];
    // Kéo thả: vật đang kéo giữ đúng cỡ ô, không phóng to (tam 26/11 18:17: táo, rau khổng lồ che màn)
    const pc = await page.evaluate(() => { const p = [...document.querySelectorAll('.stage .piece')].find(x => x.offsetParent && !x.classList.contains('filled')); if (!p) return null; const r = p.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; });
    if (pc) {
    await page.mouse.move(pc.x, pc.y); await page.mouse.down(); await page.mouse.move(pc.x + 20, pc.y - 30, { steps: 4 });
    const g = await page.evaluate(() => { const d = document.querySelector('.piece.drag'); if (!d) return null; const r = d.getBoundingClientRect(); const clip = getComputedStyle(d).overflow === 'hidden'; const big = Math.max(r.width, r.height, ...[...d.querySelectorAll('*')].map(x => { const q = x.getBoundingClientRect(); const w = clip ? Math.min(q.right, r.right) - Math.max(q.left, r.left) : q.width, h = clip ? Math.min(q.bottom, r.bottom) - Math.max(q.top, r.top) : q.height; return Math.max(w, h); })); return { w: r.width, big }; });
    await page.mouse.move(pc.x, pc.y, { steps: 2 }); await page.mouse.up(); await page.waitForTimeout(80);
    r.checks.keoGiuCo = !!g && g.big <= Math.max(pc.w, pc.h) * 1.25;
    if (!g) errs.push('Kéo thả: không thấy vật đang kéo'); else if (!r.checks.keoGiuCo) errs.push(`Kéo thả: vật bị phóng to ${Math.round(g.big)}px khi ô chỉ ${Math.round(Math.max(pc.w, pc.h))}px`);
    }
    // Chạm điểm trên ảnh (tam 26/11 18:35): vùng chạm bao trọn vật + lề, chạm gần mép ngoài vật vẫn nhận, vòng đánh dấu đúng tâm vật
    const hitA = await page.evaluate(() => globalThis.__luHit ? globalThis.__luHit() : null);
    if (hitA?.length) {
    const h = hitA.find(x => !x.found), P = h.pics[0];
    const objHalf = await page.evaluate(i => { const e = document.querySelectorAll('.df-pic')[0].querySelectorAll('.fr-it')[i].getBoundingClientRect(); return Math.max(e.width, e.height) / 2; }, h.i);
    const n0 = await page.evaluate(() => document.querySelectorAll('.df-count i.on').length);
    await page.mouse.click(P.cx + objHalf + 12, P.cy); await page.waitForTimeout(120);
    const after = await page.evaluate(i => { const fr = document.querySelectorAll('.df-pic')[0]; const it = fr.querySelectorAll('.fr-it')[i].getBoundingClientRect(); const rg = [...fr.querySelectorAll('.df-ring')].pop()?.getBoundingClientRect();
      return { n: document.querySelectorAll('.df-count i.on').length, off: rg ? Math.hypot(rg.left + rg.width / 2 - (it.left + it.width / 2), rg.top + rg.height / 2 - (it.top + it.height / 2)) : 999, cover: rg ? rg.width >= Math.max(it.width, it.height) : false }; }, h.i);
    r.checks.chamGanNhan = after.n > n0; if (!r.checks.chamGanNhan) errs.push('Chạm điểm trên ảnh: chạm sát ngoài mép vật (12px) không được nhận');
    r.checks.vongDungTam = after.off <= 4 && after.cover; if (!r.checks.vongDungTam) errs.push(`Chạm điểm trên ảnh: vòng đánh dấu lệch tâm vật ${Math.round(after.off)}px hoặc không bao trọn vật`);
    }
    const tapImg = await page.evaluate(() => { const e = [...document.querySelectorAll('.stage .frame .fr-it.tap')].find(x => x.offsetParent && getComputedStyle(x).visibility !== 'hidden'); if (!e) return null; const r = e.getBoundingClientRect();
    const t = document.elementFromPoint(r.right + Math.min(12, r.width * .3), r.top + r.height / 2); return { ok: !!t && (t === e || e.contains(t)) }; });
    if (tapImg) { r.checks.vatChamRong = tapImg.ok; if (!tapImg.ok) errs.push('Chạm điểm trên ảnh: vùng chạm của vật không rộng hơn vật'); }
    // Ghi nhớ vị trí (tam 26/11 18:39): lúc hỏi, mọi đồ vật phải bị úp kín, không nhìn thấy
    const whShow = !(await page.$('.wh-grid')) ? null : await page.evaluate(async () => { for (let i = 0; i < 80 && !document.querySelector('.wh-grid.cov'); i++) await new Promise(r => setTimeout(r, 100));
    const G = document.querySelector('.wh-grid.cov'); if (!G) return null;
    return [...G.querySelectorAll('.wh-c:not(.open)')].filter(c => { const a = c.querySelector('.wh-f .lu-art, .wh-f img, .wh-f svg'); if (!a) return false; const r = c.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return getComputedStyle(a).visibility !== 'hidden' && (t === a || a.contains(t)); }).length; });
    if (whShow !== null) { r.checks.upKinKhiHoi = whShow === 0; if (whShow) errs.push(`Ghi nhớ vị trí: lúc hỏi còn ${whShow} đồ vật nhìn thấy, chưa úp kín`); }
  return { checks: r.checks, errs };
}

// Phân loại vào giỏ (tam 26/11 18:47 "Xếp đồ về đúng chỗ"): sau mỗi lần thả, mọi vật đã thả phải hiện đủ, cỡ vừa phải,
// nằm trọn trong giỏ, không chồng lên nhau; hình đầu giỏ nhỏ gọn. Gọi sau MỖI bước làm bài (test-lab, play-draft).
export async function kiemGio(page) {
  const m = await page.evaluate(() => {
    const W = document.querySelector('.stage .bins[data-n]'); if (!W) return null; const e = [];
    const tray = document.querySelectorAll('.stage .tray .piece').length; const spans = [...W.querySelectorAll('.bin-in > span')];
    if (spans.length + tray !== +W.dataset.n) e.push(`đã thả ${+W.dataset.n - tray} vật mà giỏ chỉ có ${spans.length}`);
    for (const b of W.querySelectorAll('.bin')) {
      const B = b.getBoundingClientRect(); const lab = b.querySelector('.bin-h')?.innerText.trim();
      for (const h of b.querySelectorAll('.bin-h img, .bin-h svg, .bin-h .lu-art')) { const R = h.getBoundingClientRect(); if (Math.max(R.width, R.height) > Math.min(96, B.height * .3)) e.push(`hình đầu giỏ "${lab}" quá to ${Math.round(Math.max(R.width, R.height))}px`); }
      const rs = [...b.querySelectorAll('.bin-in > span')].map(s => s.getBoundingClientRect());
      rs.forEach((R, i) => {
        if (Math.min(R.width, R.height) < 28) e.push(`vật trong giỏ "${lab}" bị mất (cỡ ${Math.round(R.width)}×${Math.round(R.height)}px)`);
        else if (Math.max(R.width, R.height) > Math.min(120, B.width * .6)) e.push(`vật trong giỏ "${lab}" quá to ${Math.round(Math.max(R.width, R.height))}px`);
        if (R.left < B.left - 1 || R.right > B.right + 1 || R.top < B.top - 1 || R.bottom > B.bottom + 1) e.push(`vật trong giỏ "${lab}" tràn ra ngoài giỏ`);
        if (R.bottom > innerHeight + 1) e.push(`vật trong giỏ "${lab}" nằm ngoài màn hình`);
        rs.slice(i + 1).forEach(Q => { const ov = Math.max(0, Math.min(R.right, Q.right) - Math.max(R.left, Q.left)) * Math.max(0, Math.min(R.bottom, Q.bottom) - Math.max(R.top, Q.top)); if (ov > .1 * R.width * R.height) e.push(`vật trong giỏ "${lab}" chồng lên nhau`); });
      });
    }
    return [...new Set(e)];
  });
  return m === null ? null : { ok: !m.length, errs: m.map(x => 'Xếp vào giỏ: ' + x) };
}

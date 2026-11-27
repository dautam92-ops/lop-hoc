// Tay tì khi vẽ (tam 27/11 22:57): "bàn tay con nhỏ nên rất dễ tì vào màn hình, khiến nét vẽ bị dừng, không vẽ mượt mà,
// không vẽ được, nhất là trên iPad". Phép thử giả lập cảm ứng nhiều điểm thật (CDP Input.dispatchTouchEvent) trên màn vẽ:
//   1) Lòng bàn tay đặt sẵn (vết chạm to) rồi ngón tay vẽ: nét vẫn liền, đi đúng theo ngón, không nhảy về chỗ tay tì.
//   2) Đang vẽ thì tay tì xuống giữa chừng (trong và ngoài vùng vẽ): nét không đứt, không thêm nét lạ.
//   3) Tô theo nét chữ: tay tì không làm Lu báo "bắt đầu từ chấm xanh" / "tô lại", nét vẫn tô xong.
//   4) Tô màu: tay tì lên tranh không tô màu; tay tì lên nút "Xong" không bấm được; ngón tay chạm vẫn tô được.
// Dùng: kiemTayTi(page) trên một màn đang mở; node tools/kiem-tay-ti.mjs chạy mọi mẫu vẽ trong Phòng mẫu × iPad, điện thoại.
const BAN_TAY = 30; // bán kính vết tì (px): lòng bàn tay trẻ ~60px

async function cham(page) {
  const cdp = await page.context().newCDPSession(page); const on = new Map();
  const gui = type => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...on.values()] });
  return {
    async xuong(id, x, y, r = 4) { on.set(id, { id, x, y, radiusX: r, radiusY: r, force: 1 }); await gui('touchStart'); },
    async di(id, x, y) { const p = on.get(id); p.x = x; p.y = y; await gui('touchMove'); },
    async len(id) { on.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [...on.values()] }); },
    async het() { on.clear(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }).catch(() => {}); },
  };
}
const cho = (page, ms) => page.waitForTimeout(ms);
const ranh = page => page.waitForFunction(() => !document.querySelector('.lu-root')?.classList.contains('busy') && !window.__labVoiceBusy?.(), null, { timeout: 6000 }).catch(() => {});
const boing = page => page.evaluate(() => (window.__labTest?.spoken || []).filter(x => x.k === '__boing').length);
const hop = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height, vw: innerWidth, vh: innerHeight }; }, sel);
// Chỗ tay tì: mép dưới bên phải vùng vẽ (trẻ thuận tay phải), một nửa trong một nửa ngoài vùng vẽ
const choTi = (B, k = 0) => ({ x: Math.min(B.vw - 8, B.l + B.w * (.82 - k * .5)), y: Math.min(B.vh - 8, B.b - 4 + k * 30) });

async function veTuDo(page, errs, checks) {
  const B = await hop(page, '.dw-svg'); const T = await cham(page);
  const dem = () => page.evaluate(() => document.querySelectorAll('.dw-ink polyline').length);
  // nét: ngang giữa vùng vẽ, trong khoảng 20%–65% chiều rộng (tránh chỗ tay tì)
  const y = B.t + B.h * .4, x1 = B.l + B.w * .2, x2 = B.l + B.w * .65;
  const soat = async (n0, ten) => {
    const r = await page.evaluate(([y, x1, x2]) => { const svg = document.querySelector('.dw-svg'); const L = [...svg.querySelectorAll('.dw-ink polyline')]; const m = svg.getScreenCTM();
      const toC = ([x, yy]) => ({ x: x * m.a + m.e, y: yy * m.d + m.f });
      return L.map(pl => { const P = pl.getAttribute('points').trim().split(/\s+/).map(s => toC(s.split(',').map(Number)));
        return { n: P.length, xa: Math.min(...P.map(p => p.x)), xb: Math.max(...P.map(p => p.x)), lech: Math.max(...P.map(p => Math.abs(p.y - y))) }; }); }, [y, x1, x2]);
    const moi = r.slice(n0); const ok = moi.length === 1 && moi[0].xa <= x1 + 12 && moi[0].xb >= x2 - 12 && moi[0].lech <= 14;
    if (!ok) errs.push(`Tay tì khi vẽ (${ten}): ` + (moi.length !== 1 ? `thành ${moi.length} nét thay vì 1 nét liền` : moi[0].lech > 14 ? `nét nhảy về chỗ tay tì (lệch ${Math.round(moi[0].lech)}px)` : `nét bị đứt, chỉ vẽ được ${Math.round(moi[0].xb - moi[0].xa)}/${Math.round(x2 - x1)}px`));
    return ok;
  };
  // 1) tay tì trước
  let n0 = await dem(); const P = choTi(B), Q = choTi(B, 1);
  await T.xuong(9, P.x, P.y, BAN_TAY); await T.xuong(8, Q.x, Q.y, BAN_TAY); await cho(page, 60);
  await T.xuong(1, x1, y); for (let i = 1; i <= 14; i++) { await T.di(1, x1 + (x2 - x1) * i / 14, y); if (i % 4 === 0) await T.di(9, P.x - i / 3, P.y - 1); }
  await T.len(1); await T.len(9); await T.len(8); await cho(page, 80);
  checks.tayTiTruoc = await soat(n0, 'tay tì trước');
  // 2) tay tì giữa chừng
  n0 = await dem();
  await T.xuong(1, x1, y); for (let i = 1; i <= 14; i++) { await T.di(1, x1 + (x2 - x1) * i / 14, y); if (i === 5) await T.xuong(9, P.x, P.y, BAN_TAY); if (i === 8) await T.xuong(8, Q.x, Q.y, BAN_TAY); if (i > 8) await T.di(9, P.x - i, P.y - 2); }
  await T.len(1); await T.len(9); await T.len(8); await cho(page, 80);
  checks.tayTiGiua = await soat(n0, 'tay tì giữa chừng');
  // 3) tay tì lên nút "Vẽ xong" không được bấm
  await nutXong(page, T, '.dw-done', errs, checks);
  await T.het();
}

async function nutXong(page, T, sel, errs, checks) {
  const b = await hop(page, sel); if (!b) return;
  const s0 = await page.evaluate(() => (window.__labTest?.spoken || []).length);
  await T.xuong(7, b.l + b.w / 2, b.t + b.h / 2, BAN_TAY); await cho(page, 50); await T.len(7); await cho(page, 250);
  const s1 = await page.evaluate(() => (window.__labTest?.spoken || []).length);
  checks.tayTiNut = s1 === s0 && !(await page.evaluate(() => window.__labTest?.done));
  if (!checks.tayTiNut) errs.push('Tay tì khi vẽ: lòng bàn tay chạm vào nút "Xong" mà nút vẫn bấm');
}

async function toNet(page, errs, checks) {
  // chờ hết phần Lu tô mẫu, tới lượt bé (có chấm xanh bắt đầu)
  await page.waitForSelector('.tr-svg .tr-start', { timeout: 15000 }).catch(() => {}); await ranh(page); await cho(page, 150);
  const net = await page.evaluate(() => { const svg = document.querySelector('.tr-svg'); const st = svg.querySelector('.tr-start'); if (!st) return null;
    const sx = +st.getAttribute('cx'), sy = +st.getAttribute('cy'); const m = svg.getScreenCTM();
    const g = [...svg.querySelectorAll('.tr-guide')].map(p => { const a = p.getPointAtLength(0); return { p, d: Math.hypot(a.x - sx, a.y - sy) }; }).sort((a, b) => a.d - b.d)[0].p;
    const L = g.getTotalLength(), P = []; for (let s = 0; s <= L; s += L / 40) { const q = g.getPointAtLength(Math.min(s, L)); P.push({ x: q.x * m.a + m.e, y: q.y * m.d + m.f }); }
    const e = g.getPointAtLength(L); P.push({ x: e.x * m.a + m.e, y: e.y * m.d + m.f }); return P; });
  if (!net) { errs.push('Tay tì khi vẽ: không tới được lượt bé tô'); return; }
  const B = await hop(page, '.tr-svg'); const T = await cham(page); const b0 = await boing(page);
  await page.evaluate(() => { window.__netThu = [...document.querySelectorAll('.tr-svg .tr-line')].pop(); });
  const P = choTi(B), Q = choTi(B, 1);
  await T.xuong(9, P.x, P.y, BAN_TAY); await cho(page, 40);
  await T.xuong(1, net[0].x, net[0].y);
  for (let i = 1; i < net.length; i++) { await T.di(1, net[i].x, net[i].y); if (i === Math.floor(net.length / 2)) await T.xuong(8, Q.x, Q.y, BAN_TAY); if (i % 5 === 0) await T.di(9, P.x - i / 4, P.y); }
  await T.len(1); await T.len(9); await T.len(8); await T.het(); await cho(page, 150);
  const xongNet = await page.evaluate(() => !!window.__netThu?.classList.contains('ok')); const b1 = await boing(page);
  checks.tayTiToNet = xongNet && b1 === b0;
  if (!checks.tayTiToNet) errs.push(`Tay tì khi tô theo nét: ${b1 > b0 ? 'Lu báo sai ("bắt đầu từ chấm xanh"/"tô lại") vì tay tì' : 'nét không tô xong được'}`);
}

async function toMau(page, errs, checks) {
  await ranh(page); const T = await cham(page);
  const vung = await page.evaluate(() => { const R = [...document.querySelectorAll('.cl-svg .cl-r')].map(r => { const b = r.getBoundingClientRect(); return { id: r.dataset.r, x: b.left + b.width / 2, y: b.top + b.height / 2, a: b.width * b.height }; })
    .filter(v => document.elementFromPoint(v.x, v.y)?.closest?.('.cl-r')?.dataset.r === v.id).sort((a, b) => b.a - a.a); return R.slice(0, 2); });
  if (vung.length < 2) return;
  const daTo = id => page.evaluate(i => document.querySelector(`.cl-r[data-r="${i}"]`).classList.contains('done'), id);
  // tay tì lên vùng 1: không được tô
  await T.xuong(9, vung[0].x, vung[0].y, BAN_TAY); await cho(page, 60);
  // ngón tay chạm vùng 2 trong khi tay vẫn tì: phải tô được
  await T.xuong(1, vung[1].x, vung[1].y); await cho(page, 40); await T.len(1); await cho(page, 60); await T.len(9); await cho(page, 150);
  const tiTo = await daTo(vung[0].id), ngonTo = await daTo(vung[1].id);
  checks.tayTiToMau = !tiTo && ngonTo;
  if (tiTo) errs.push('Tay tì khi tô màu: lòng bàn tay chạm vào tranh cũng tô màu');
  if (!ngonTo) errs.push('Tay tì khi tô màu: đang tì tay thì ngón tay chạm không tô được');
  await nutXong(page, T, '.cl-done', errs, checks);
  await T.het();
}

export async function kiemTayTi(page) {
  const checks = {}, errs = [];
  if (await page.$('.dw-svg')) await veTuDo(page, errs, checks);
  else if (await page.$('.tr-svg')) await toNet(page, errs, checks);
  else if (await page.$('.cl-svg')) await toMau(page, errs, checks);
  else return null;
  return { checks, errs };
}

// Chạy riêng: mọi mẫu vẽ / tô theo nét / tô màu trong Phòng mẫu × iPad, điện thoại (đều có cảm ứng)
export async function chayTayTi({ base, samples, chromium, only = [] }) {
  const DEV = { ipad: { viewport: { width: 1180, height: 820 }, hasTouch: true }, phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } };
  const ve = samples.filter(s => ['E13', 'E14'].includes(s.engine || s.act?.engine) && (s.mode || s.act?.mode) !== 'sticker' && (!only.length || only.includes(s.id)));
  const b = await chromium.launch(); const rows = [];
  for (const s of ve) for (const dev of ['ipad', 'phone']) {
    const age = Object.keys(s.levels || { '4-5': 1 })[0];
    const ctx = await b.newContext(DEV[dev]); const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    try {
      await page.goto(`${base}?s=${s.id}&age=${age}&seed=7&fast=1&auto=1&tts=0&idle=600000`);
      await page.waitForSelector('.dw-svg, .tr-svg, .cl-svg', { timeout: 8000 }); await ranh(page); await cho(page, 200);
      const k = await kiemTayTi(page); if (k) errs.push(...k.errs);
    } catch (e) { errs.push(String(e.message || e).split('\n')[0]); }
    rows.push({ id: s.id, dev, errs }); await ctx.close();
  }
  await b.close(); return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { createRequire } = await import('node:module'); const { readFileSync } = await import('node:fs'); const { serve } = await import('./serve.mjs');
  const { chromium } = createRequire(import.meta.url)('playwright');
  const port = 5990 + Math.floor(Math.random() * 9); const srv = await serve(port);
  const D = JSON.parse(readFileSync(new URL('../content/lab/samples.json', import.meta.url)));
  const rows = await chayTayTi({ base: `http://127.0.0.1:${port}/lab/play.html`, samples: D.samples, chromium, only: process.argv.slice(2) });
  let fail = 0; for (const r of rows) { console.log(`${r.errs.length ? 'LỖI' : ' ok '} ${r.id} ${r.dev}${r.errs.length ? ': ' + r.errs.join(' | ') : ''}`); if (r.errs.length) fail++; }
  console.log(`\nTay tì khi vẽ: ${rows.length - fail}/${rows.length} đạt`); srv.close?.(); process.exit(fail ? 1 : 0);
}

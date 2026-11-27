// Phép thử màn nhà và danh sách buổi (tam 26/11/2026: mọi lỗi đã báo áp dụng cho MỌI màn hình, kể cả menu).
// Chạy: node tools/nha/kiem-man-nha.mjs [--shots]   → reports/man-nha.json (+ ảnh reports/man-nha/*.png)
// Thoát mã 1 nếu có mục đỏ. Cổng tools/cong-kiem-tra.mjs gọi tệp này.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { serve } from '../serve.mjs';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SHOTS = process.argv.includes('--shots'); const OUT = path.join(ROOT, 'reports', 'man-nha');
if (SHOTS) await mkdir(OUT, { recursive: true });
const rows = []; const check = (ten, ok, chiTiet = '') => rows.push({ ten, ok: !!ok, chiTiet: String(chiTiet || '') });
const rd = async f => JSON.parse(await readFile(path.join(ROOT, f), 'utf8'));

// ---------- Kiểm tra tĩnh ----------
const cfg = await rd('content/man-nha/man-nha.json');
const tu = s => s.trim().split(/\s+/).length;
const dai = Object.entries(cfg.loi).filter(([, s]) => tu(s) > 10);
check('Lời Lu ngắn, mỗi câu tối đa 10 từ (quy tắc 34)', !dai.length, dai.map(([k, s]) => `${k}: ${tu(s)} từ`).join('; '));
const assets = (await rd('registry/assets.json')).assets.filter(a => a.trang_thai === 'da_duyet');
const duyet = new Set(assets.map(a => a.path));
const lu = await rd('registry/characters.json'); for (const g of Object.values(lu[lu.nhan_vat_chinh || 'LU'])) if (g && typeof g === 'object') for (const v of Object.values(g)) if (v?.webp) duyet.add(v.webp);
const anhCfg = [cfg.nen_mac_dinh, ...cfg.chu_de.map(c => c.nen), ...Object.values(cfg.lu)];
const chuaDuyet = anhCfg.filter(a => !duyet.has(a));
check('Ảnh nền và ảnh Lu trên màn nhà là ảnh vẽ tay đã duyệt', !chuaDuyet.length, chuaDuyet.join(', '));
const ds = spawnSync(process.execPath, ['tools/nha/ds-goi.mjs', '--kiem'], { cwd: ROOT, encoding: 'utf8' });
check('Danh sách gói bài của màn nhà khớp thư mục bài (goi-bai.json)', ds.status === 0, ds.stdout.trim());
const choVe = new Set((await rd('content/man-nha/anh-can-ve.json')).anh.map(a => a.ma));

// ---------- Chơi thật trên 3 cỡ màn ----------
const { chromium } = require('playwright');
const port = 5900 + Math.floor(Math.random() * 90); const srv = await serve(port); const U = p => `http://127.0.0.1:${port}/${p}`;
const b = await chromium.launch();
const VP = [['phone', 390, 844], ['ipad', 1180, 820], ['pc', 1440, 900]];

// Đo chung trên một màn: tràn màn, cỡ nút, emoji, hình vẽ mã chờ vẽ
async function doMan(page, dev) {
  return page.evaluate(({ dev }) => {
    const vw = innerWidth, vh = innerHeight; const loi = [];
    const shown = el => { for (let x = el; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden') return false; } return !el.closest('[hidden]'); };
    const cuon = el => { for (let x = el.parentElement; x && x !== document.body; x = x.parentElement) { const o = getComputedStyle(x).overflowX; if (o === 'auto' || o === 'scroll') return x; } return null; };
    if (document.documentElement.scrollWidth > vw + 2) loi.push(`trang rộng ${document.documentElement.scrollWidth}px > màn ${vw}px`);
    const nut = [...document.querySelectorAll('a[href], button, [role=button]')].filter(e => shown(e) && !e.closest('.bo-me'));
    const min = dev === 'phone' ? 72 : 64; const nho = [], tran = [];
    for (const e of nut) {
      const r = e.getBoundingClientRect(); if (r.width < 2) continue;
      const c = cuon(e);
      if (!c && (r.left < -2 || r.right > vw + 2)) tran.push(e.getAttribute('aria-label') || e.textContent.trim().slice(0, 20));
      if (Math.min(r.width, r.height) < min - 0.5) nho.push(`${(e.getAttribute('aria-label') || e.textContent.trim()).slice(0, 20)} ${Math.round(Math.min(r.width, r.height))}px`);
    }
    const txt = document.body.innerText; const emoji = (txt.match(/\p{Extended_Pictographic}/gu) || []).filter(c => !/[©®™]/.test(c));
    const art = [...document.querySelectorAll('[data-art]')].filter(shown).map(e => e.dataset.art);
    const imgs = [...document.images].filter(shown).map(i => ({ src: new URL(i.src).pathname.replace(/^\//, ''), ok: i.complete && i.naturalWidth > 0 }));
    return { loi, nho, tran, emoji, art, imgs, so: nut.length };
  }, { dev });
}

for (const [vp, w, h] of VP) {
  for (const tt of ['moi', 'dang-hoc']) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) errs.push(`${r.status()} ${new URL(r.url()).pathname}`); });
    const ns = `kiem-nha-${vp}-${tt}`;
    if (tt === 'dang-hoc') await page.addInitScript(ns => { localStorage.setItem(ns + ':data', JSON.stringify({ events: [], observations: [], kv: { 'done:L001': { at: 1 } } })); }, ns);
    const tag = `[${vp}, ${tt === 'moi' ? 'bé mới' : 'đã học buổi 1'}]`;
    await page.goto(U(`index.html?fast=1&ns=${ns}`));
    const ok = await page.waitForFunction(() => window.__luNha?.ready, null, { timeout: 15000 }).then(() => true, () => false);
    check(`${tag} Màn nhà mở được`, ok);
    if (!ok) { await ctx.close(); continue; }
    await page.waitForTimeout(300);
    if (SHOTS) await page.screenshot({ path: path.join(OUT, `nha-${vp}-${tt}.png`), fullPage: true });
    const m = await doMan(page, vp);
    const st = await page.evaluate(() => {
      const top = document.querySelector('.nha-top').getBoundingClientRect().bottom, vh = innerHeight, H = vh - top;
      const main = document.querySelector('.nha-main').getBoundingClientRect(), card = document.querySelector('.hom-nay');
      const cr = card.getBoundingClientRect(), play = document.querySelector('.choi').getBoundingClientRect();
      const y0 = Math.max(main.top, top), y1 = Math.min(main.bottom, vh);
      const bg = getComputedStyle(document.getElementById('nen')).backgroundImage;
      return { cao: +((y1 - y0) / H).toFixed(2), tam: +(((y0 + y1) / 2 - top) / H).toFixed(2), the: Math.round(cr.width), play: Math.round(play.width), cardIn: cr.top >= 0 && cr.bottom <= vh + 1, bg, gates: document.querySelectorAll('.cong').length, sap: document.querySelectorAll('.cong.sap').length, info: window.__luNha };
    });
    check(`${tag} Không lỗi kỹ thuật, không tải lỗi`, !errs.length, errs.slice(0, 3).join('; '));
    check(`${tag} Không tràn màn`, !m.loi.length && !m.tran.length, [...m.loi, ...m.tran].slice(0, 3).join('; '));
    check(`${tag} Nút đủ to để bé chạm (≥${vp === 'phone' ? 72 : 64}px)`, !m.nho.length, m.nho.slice(0, 4).join('; '));
    check(`${tag} Không emoji`, !m.emoji.length, m.emoji.join(' '));
    const ngoai = m.art.filter(a => !choVe.has(a));
    check(`${tag} Hình vẽ mã chỉ dùng khi đang chờ vẽ tay`, !ngoai.length, ngoai.join(', '));
    const anhLoi = m.imgs.filter(i => !i.ok || !duyet.has(decodeURIComponent(i.src))).map(i => i.src);
    check(`${tag} Ảnh hiện đủ và là ảnh đã duyệt`, !anhLoi.length, anhLoi.slice(0, 3).join(', '));
    check(`${tag} Có nền vẽ tay`, /url\(/.test(st.bg));
    // Quy tắc 33: khối "buổi hôm nay" to và nằm giữa
    check(`${tag} Buổi hôm nay to, nằm giữa màn (quy tắc 33)`, st.cao >= 0.45 && st.tam >= 0.35 && st.tam <= 0.65 && st.cardIn, `cao ${st.cao}, tâm ${st.tam}${st.cardIn ? '' : ', thẻ bị cắt'}`);
    check(`${tag} Nút chơi to (≥84px)`, st.play >= 84, `${st.play}px`);
    check(`${tag} Đủ 12 cổng luyện tập`, st.gates === 12, `${st.gates} cổng`);
    if (tt === 'moi') {
      check(`${tag} Bé mới: buổi hôm nay là buổi 1, bấm vào học được`, st.info.homNay === 'L001' && /player\.html\?draft=L001/.test(st.info.link || ''), st.info.link);
      await page.click('.hom-nay');
      const vao = await page.waitForSelector('.go, .hub, .lu-root *', { timeout: 15000 }).then(() => true, () => false);
      check(`${tag} Bấm thẻ buổi hôm nay vào đúng buổi`, vao && page.url().includes('draft=L001'), page.url());
      const ve = await page.$('.corner-btn.exit');
      check(`${tag} Trong buổi có nút về nhà`, !!ve);
      if (ve) { await ve.click(); const ok2 = await page.waitForFunction(() => window.__luNha?.ready, null, { timeout: 10000 }).then(() => true, () => false); check(`${tag} Nút về nhà quay lại màn nhà`, ok2 && /index\.html/.test(page.url()), page.url()); }
    } else {
      check(`${tag} Đã học buổi 1: buổi hôm nay là buổi 2`, st.info.homNay === 'L002', st.info.homNay);
    }
    // Danh sách buổi
    await page.goto(U(`buoi.html?fast=1&ns=${ns}`));
    const ok3 = await page.waitForFunction(() => window.__luBuoi?.ready, null, { timeout: 15000 }).then(() => true, () => false);
    check(`${tag} Danh sách buổi mở được`, ok3);
    if (ok3) {
      await page.waitForTimeout(200);
      if (SHOTS) await page.screenshot({ path: path.join(OUT, `buoi-${vp}-${tt}.png`), fullPage: true });
      const m2 = await doMan(page, vp);
      const l = await page.evaluate(() => ({ n: document.querySelectorAll('.buoi').length, dang: [...document.querySelectorAll('.buoi.dang')].map(e => e.textContent.trim()), khoaLink: document.querySelectorAll('a.buoi.khoa').length, xong: document.querySelectorAll('.buoi.xong').length }));
      check(`${tag} Danh sách: 30 buổi mỗi chủ đề, đánh dấu đúng buổi hôm nay`, l.n === 30 && l.dang.length === 1 && l.dang[0] === (tt === 'moi' ? '1' : '2') && !l.khoaLink && l.xong === (tt === 'moi' ? 0 : 1), JSON.stringify(l));
      check(`${tag} Danh sách: không tràn màn, nút đủ to, không emoji`, !m2.loi.length && !m2.tran.length && !m2.nho.length && !m2.emoji.length, [...m2.loi, ...m2.tran, ...m2.nho, ...m2.emoji].slice(0, 4).join('; '));
      await page.click('.chuong button[data-cd="2"]'); await page.waitForTimeout(150);
      const cd2 = await page.evaluate(() => [...document.querySelectorAll('.buoi b')].map(e => +e.textContent));
      check(`${tag} Danh sách: chuyển sang chủ đề 2 thấy buổi 31–60`, cd2[0] === 31 && cd2.at(-1) === 60, `${cd2[0]}–${cd2.at(-1)}`);
    }
    await ctx.close();
  }
}
await b.close(); srv.close();
const red = rows.filter(r => !r.ok);
await mkdir(path.join(ROOT, 'reports'), { recursive: true });
await writeFile(path.join(ROOT, 'reports', 'man-nha.json'), JSON.stringify({ at: new Date().toISOString(), rows }, null, 2));
for (const r of rows) console.log(`${r.ok ? 'ĐẠT ' : 'ĐỎ  '} ${r.ten}${r.chiTiet ? ' — ' + r.chiTiet : ''}`);
console.log(red.length ? `\nMÀN NHÀ: ${red.length} mục đỏ.` : `\nMÀN NHÀ: đạt ${rows.length}/${rows.length} mục.`);
process.exit(red.length ? 1 : 0);

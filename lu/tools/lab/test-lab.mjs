// Kiểm tra Phòng mẫu bằng trình duyệt thật: mỗi mẫu × mỗi tuổi × iPad và điện thoại.
//  1) Không lỗi JS, hiện được màn đầu.
//  2) CỐ TÌNH CHỌN SAI TRƯỚC: sau thao tác sai không được có lời khen, âm báo đúng, hay kết quả "đúng" (tam: lỗi không bao giờ lặp lại).
//  3) Lật thẻ (E05): sau lần lật (đúng hay sai) Lu không nói gì; đôi đúng chỉ có âm "ting".
//  4) Làm đúng đến hết: hoạt động kết thúc và có ghi kết quả.
//  5) Chụp màn hình màn đầu (tools/lab/out/).
// Chạy: node tools/lab/test-lab.mjs [CC-08] [--shots]   (tự bật máy chủ tĩnh trên máy)
import { createRequire } from 'node:module';
import { serve } from '../serve.mjs';
import { doToGiua, danhGia } from '../do-to-giua.mjs';
import { kiemLoiCu } from '../kiem-loi-cu.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const port = 5900 + Math.floor(Math.random() * 90); const srv = await serve(port);
const BASE = `http://127.0.0.1:${port}/lab/play.html`;
const D = JSON.parse(readFileSync(new URL('../../content/lab/samples.json', import.meta.url)));
const only = process.argv.slice(2).filter(a => !a.startsWith('--')); const shots = process.argv.includes('--shots'); const ANH = process.argv.includes('--anh-cho') ? '&anh=cho' : '';
const OUT = new URL('./out/', import.meta.url); mkdirSync(OUT, { recursive: true });
const PRAISE = /__jingle|__dung|__ok|Bé giỏi|giỏi lắm|giỏi quá|Đúng rồi|Tuyệt|Chính xác|Yes!|Great|Well done/i;
const DEV = { ipad: { viewport: { width: 1180, height: 820 } }, phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } };
const b = await chromium.launch(); const rows = []; let fail = 0;
for (const s of D.samples) {
  if (only.length && !only.includes(s.id)) continue;
  for (const age of Object.keys(s.levels)) for (const dev of ['ipad', 'phone']) {
    const r = { id: s.id, age, dev, checks: {} }; const errs = [];
    const page = await b.newPage(DEV[dev]); page.on('pageerror', e => errs.push(e.message)); page.on('response', res => { if (res.status() >= 400) errs.push(`tải lỗi ${res.status()} ${res.url().replace(/^.*\/lu\//, '')}`); });
    try {
      await page.goto(`${BASE}?s=${s.id}&age=${age}&seed=7&fast=1&auto=1&tts=0&idle=600000${ANH}`);
      await page.waitForFunction(() => window.__labTest && (window.__labTest.current.length || window.__labTest.right || window.__labTest.done), null, { timeout: 8000 });
      const idle = () => page.waitForFunction(() => !document.querySelector('.lu-root')?.classList.contains('busy') && !window.__labVoiceBusy?.(), null, { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(150);
      // Không tràn màn hình: mọi nút bé cần chạm phải nằm trong khung nhìn, không phải cuộn (tam 26/11: 8 thẻ lật bị tràn iPad)
      const over = await page.evaluate(() => { const b = [...document.querySelectorAll('.stage button, .stage .opt, .stage .piece, .stage .card, .stage .shadow, .stage .cell-f')].filter(x => x.offsetParent).map(x => x.getBoundingClientRect().bottom); return b.length ? Math.round(Math.max(...b) - innerHeight) : 0; });
      r.checks.vuaManHinh = over <= 2; if (over > 2) errs.push(`nút tràn khỏi màn hình ${over}px`);
      // Quy tắc 33: nội dung bé học to và nằm giữa màn hình
      r.toGiua = await page.evaluate(doToGiua); const tg = danhGia(r.toGiua, dev);
      r.checks.toGiua = !tg.length; for (const x of tg) errs.push('Quy tắc 33: ' + x);
      { const k = await kiemLoiCu(page); Object.assign(r.checks, k.checks); errs.push(...k.errs); }
      if (shots) await page.screenshot({ path: new URL(`${s.id}_${age}_${dev}.png`, OUT).pathname });
      // ---- thử sai trước
      const w = await page.evaluate(async () => {
        const T = window.__labTest; const n0 = T.spoken.length, e0 = T.events.length, f0 = (T.sfx || []).length;
        let did = false;
        if (T.wrong) { await T.wrong(); did = true; }
        else {
          const cur = T.current.filter(Boolean);
          const click = el => { el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); el.click(); };
          if (cur.length === 2 && cur[0].classList.contains('card')) { const o = [...document.querySelectorAll('.card:not(.right)')].find(x => x !== cur[0] && x !== cur[1]); if (o) { click(cur[0]); click(o); did = true; } }
          else if (cur.length === 2) { const t = cur[1]; const o = [...document.querySelectorAll('.' + [...t.classList][0])].find(x => x !== t && !x.classList.contains('filled')); if (o) { click(cur[0]); click(o); did = true; } }
          else if (cur.length === 1 && cur[0].classList.contains('opt')) { const o = [...cur[0].parentElement.querySelectorAll('.opt')].find(x => x !== cur[0] && !x.disabled && !x.classList.contains('right')); if (o) { click(o); did = true; } }
        }
        await new Promise(r => setTimeout(r, 120));
        return { did, spoken: T.spoken.slice(n0).map(x => x.k), events: T.events.slice(e0), sfx: (T.sfx || []).slice(f0).map(x => x.k) };
      });
      if (w.did) {
        const praised = w.spoken.filter(k => PRAISE.test(k)).concat(w.sfx);
        const okEvt = w.events.filter(e => e.kind === 'answer' && e.correct);
        r.checks.sai_khong_khen = !praised.length && !okEvt.length; if (!r.checks.sai_khong_khen) errs.push('Chọn sai mà vẫn khen/báo đúng: ' + JSON.stringify({ praised, okEvt: okEvt.length }));
        if (s.engine === 'E05') { r.checks.lat_sai_im_lang = !w.spoken.length; if (w.spoken.length) errs.push('Lật sai mà Lu vẫn nói: ' + w.spoken.join(' | ')); }
      } else r.checks.sai_khong_khen = 'không có thao tác sai (hoạt động mở hoặc tham gia)';
      // ---- làm đúng đến hết
      let steps = 0;
      while (steps++ < 120) {
        const st = await page.evaluate(async () => {
          const T = window.__labTest; if (T.done) return 'done';
          const n0 = T.spoken.length;
          const ok = await window.__labCmd('right');
          await new Promise(r => setTimeout(r, 40));
          return { ok, spoken: T.spoken.slice(n0).map(x => x.k), done: T.done, engine: T.variant && 1 };
        });
        if (st === 'done') break;
        if (s.engine === 'E05' && st.spoken && !st.done) { const bad = st.spoken.filter(k => k !== '__dung'); if (bad.length && !(await page.evaluate(() => window.__labTest.done))) { errs.push('Lật đúng mà Lu vẫn nói: ' + bad.join(' | ')); r.checks.lat_dung_chi_ting = false; } }
        await page.waitForTimeout(30);
      }
      const T = await page.evaluate(() => ({ done: window.__labTest.done, events: window.__labTest.events.length, err: window.__labTest.error }));
      r.checks.choi_het = T.done; if (!T.done) errs.push('Không chơi được tới cuối');
      r.checks.ghi_ket_qua = T.events > 0; if (!T.events) errs.push('Không ghi kết quả');
      if (s.engine === 'E05' && r.checks.lat_dung_chi_ting !== false) r.checks.lat_dung_chi_ting = true;
    } catch (e) { errs.push(String(e.message || e)); }
    r.errs = errs; r.ok = !errs.length; if (!r.ok) fail++;
    rows.push(r); console.log(`${r.ok ? 'ĐẠT ' : 'LỖI '} ${s.id} ${age} ${dev}${errs.length ? '\n    ' + errs.slice(0, 4).join('\n    ') : ''}`);
    await page.close();
  }
}
// ---- Không trả lời: Lu nhắc lại câu hỏi, rồi làm sáng chỗ cần chạm (không áp dụng lật thẻ: chỉ giải thích lúc đầu)
for (const id of ['CC-01', 'CC-17', 'MX-09', 'CC-08']) {
  if (only.length && !only.includes(id)) continue;
  const page = await b.newPage(DEV.ipad); const errs = [];
  await page.goto(`${BASE}?s=${id}&age=4-5&seed=7&fast=1&auto=1&tts=0&idle=500`); await page.waitForTimeout(2200);
  const r = await page.evaluate(() => ({ idle: window.__labTest.idle, hint: !!document.querySelector('.hint'), spoken: window.__labTest.spoken.map(x => x.k) }));
  const e05 = id === 'CC-08';
  const ok = e05 ? !r.idle.length : r.idle.includes(1) && r.idle.includes(2) && r.hint;
  if (!ok) { fail++; errs.push(e05 ? 'Lật thẻ không được nhắc lại khi bé dừng tay' : 'Không trả lời mà Lu không nhắc lại hoặc không làm sáng chỗ cần chạm: ' + JSON.stringify(r.idle)); }
  rows.push({ id, age: '4-5', dev: 'ipad', checks: { khong_tra_loi: ok }, errs, ok }); console.log(`${ok ? 'ĐẠT ' : 'LỖI '} ${id} không trả lời${errs.length ? '\n    ' + errs.join('\n    ') : ''}`);
  await page.close();
}
await b.close(); srv.close();
writeFileSync(new URL('ket-qua.json', OUT), JSON.stringify({ at: new Date().toISOString(), total: rows.length, fail, rows }, null, 1));
console.log(`\n${rows.length - fail}/${rows.length} lượt đạt.`); process.exit(fail ? 1 : 0);

// Chạy trọn một buổi học nháp nhiều chặng (D42) trên trình duyệt thật, chụp mỗi chặng, đo hình minh họa.
// Chạy: node tools/play-draft.mjs L001   → reports/draft-L001/*.png, reports/draft-L001.json
import { doToGiua } from './do-to-giua.mjs';
import { kiemLoiCu, kiemGio } from './kiem-loi-cu.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = (process.argv[2] || 'L001').replace(/[^\w-]/g, '');
const OUT = path.join(ROOT, 'reports', `draft-${id}`); await mkdir(OUT, { recursive: true });
const { chromium } = require('playwright');
const port = 5700 + Math.floor(Math.random() * 200); const srv = await serve(port);
const b = await chromium.launch(); const result = { id, runs: [] };
const { readFile } = await import('node:fs/promises');
const DRAFT = JSON.parse(await readFile(path.join(ROOT, 'content/drafts', id + '.json'), 'utf8'));
const ACT_IDS = (DRAFT.stages || []).flatMap(st => st.activities.map(a => a.activity_id));
for (const [vp, w, h] of [['ipad', 1180, 820], ['phone', 390, 844]]) {
  const page = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/player.html?draft=${id}&fast=1&seed=5&ns=draft-${vp}`);
  await page.waitForSelector('.go', { timeout: 10000 }); await page.screenshot({ path: path.join(OUT, `00-bat-dau-${vp}.png`) });
  await page.click('.go'); const shots = []; let last = '', k = 1; const wrongTried = new Set(), wrongOk = []; let wrongChecked = 0;
  for (let i = 0; i < 8000; i++) {
    await page.waitForTimeout(25);
    const st = await page.evaluate(() => ({ done: window.__luTest?.done, n: (window.__luTest?.current || []).length, step: document.querySelector('.steps .now')?.title || '', t: document.querySelector('.scene .title')?.innerText || '' }));
    if (st.done) break;
    const key = st.step + '|' + st.t;
    if (st.n && key !== last) {
      last = key; await page.waitForTimeout(200);
      const m = await page.evaluate(() => {
        const vw = innerWidth, vh = innerHeight, A = vw * vh;
        const vis = r => Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
        const bd = document.querySelector('.app.has-bd'); const real = bd && !bd.classList.contains('bd-tam');
        const bdArea = bd ? vis(document.querySelector('.backdrop').getBoundingClientRect()) : 0;
        const ui = [...document.querySelectorAll('.top, .answers .lbl, .big-btn, .scene .title, .cap')].reduce((s, x) => s + vis(x.getBoundingClientRect()), 0);
        const taps = [...document.querySelectorAll('.stage .opt, .stage .piece, .stage .cell, .stage .bal, .stage .card, .stage .prop, .stage .big-btn')].map(x => x.getBoundingClientRect()).filter(r => r.width);
        return { illusPct: Math.round(100 * Math.max(0, bdArea - ui) / A), backdrop: !!bd, realBackdrop: !!real, minTap: taps.length ? Math.round(Math.min(...taps.map(r => Math.min(r.width, r.height)))) : 0,
          emoji: ((document.body.innerText || '').match(/\p{Extended_Pictographic}/gu) || []).length };
      });
      m.toGiua = await page.evaluate(doToGiua);
      m.loiCu = (await kiemLoiCu(page)).errs;
      const file = `${String(k++).padStart(2, '0')}-${vp}.png`; await page.screenshot({ path: path.join(OUT, file) });
      shots.push({ step: st.step, title: st.t, file, ...m });
    }
    // Thử chọn SAI trước (một lần mỗi màn): Lu không được báo đúng khi bé chọn sai.
    if (st.n && !wrongTried.has(last)) {
      wrongTried.add(last);
      for (let w = 0; w < 400 && await page.evaluate(() => !!document.querySelector('[data-busy]')); w++) await page.waitForTimeout(25);
      const tried = await page.evaluate(() => { const c = window.__luTest?.current || []; if (c.length !== 1 || !c[0].classList.contains('opt') || c[0].closest('[data-any]')) return false;
        const o = [...c[0].parentElement.querySelectorAll('.opt')].find(x => x !== c[0] && x.innerHTML !== c[0].innerHTML && !x.classList.contains('right')); /* ô trông giống hệt đáp án (vd. nhiều hạt đậu cần tìm) là đáp án đúng, không phải chọn sai */ if (!o) return false; window.__wrongEl = o; window.__evBefore = (window.__luTest.events || []).length; o.click(); return true; });
      if (tried) { await page.waitForTimeout(150);
        const bad = await page.evaluate(() => window.__wrongEl.classList.contains('right') || (window.__luTest.events || []).slice(window.__evBefore).some(e => e.correct));
        if (bad) wrongOk.push(st.step + ' ' + st.t); else wrongChecked++; }
    }
    { const g = await kiemGio(page); if (g && !g.ok && shots.length) { const L = shots[shots.length - 1]; L.loiCu = [...new Set([...(L.loiCu || []), ...g.errs])]; } }
    await page.evaluate(() => { if (document.querySelector("[data-busy]")) return; const T = window.__luTest; const c = (T.current || []).slice(); T.current = [];
      c.forEach(el => { if (!el.isConnected) return; if (el.classList.contains('piece')) { const r = el.getBoundingClientRect(); el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.x + 5, clientY: r.y + 5 })); dispatchEvent(new PointerEvent('pointerup', { clientX: r.x + 5, clientY: r.y + 5 })); } else el.click(); }); });
  }
  const done = await page.evaluate(() => !!window.__luTest?.done);
  const ev = await page.evaluate(() => (window.__luTest?.events || []).map(e => ({ a: e.activity_id, k: e.kind, ok: e.correct })));
  await page.screenshot({ path: path.join(OUT, `99-ket-thuc-${vp}.png`) });
  const allIds = await page.evaluate(() => null) || [];
  result.runs.push({ vp, done, errors: errs, events: ev.length, activities: [...new Set(ev.map(e => e.a))].length, noEvent: ACT_IDS.filter(x => !ev.some(e => e.a === x)), wrongChecked, wrongOk, shots });
  await page.close();
}
await b.close(); srv.close();
await writeFile(path.join(ROOT, 'reports', `draft-${id}.json`), JSON.stringify(result, null, 1));
for (const r of result.runs) {
  const avg = Math.round(r.shots.reduce((s, x) => s + x.illusPct, 0) / (r.shots.length || 1));
  console.log(`${r.vp}: ${r.done ? 'chạy hết buổi' : 'CHƯA chạy hết'}, ${r.shots.length} màn, ${r.activities} hoạt động ghi sự kiện, ${r.events} sự kiện, lỗi JS ${r.errors.length}, hình minh họa TB ${avg}%, vùng chạm nhỏ nhất ${Math.min(...r.shots.map(s => s.minTap || 999))}px, nền ảnh thật ${r.shots.filter(s => s.realBackdrop).length}/${r.shots.length}, emoji ${r.shots.reduce((s, x) => s + x.emoji, 0)}`);
  console.log(`   thử chọn sai: ${r.wrongChecked} màn báo sai đúng cách, ${r.wrongOk.length} màn báo ĐÚNG khi chọn sai`); r.wrongOk.forEach(x => console.log('   ✗ chọn sai vẫn khen: ' + x));
  r.errors.slice(0, 5).forEach(e => console.log('   ✗ ' + e));
  if (r.noEvent?.length) console.log('   hoạt động không ghi sự kiện: ' + r.noEvent.join(', '));
}

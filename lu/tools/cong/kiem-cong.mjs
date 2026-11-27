// Kiểm tra cổng luyện tập (bắt buộc, nằm trong tools/cong-kiem-tra.mjs).
// Chạy: node tools/cong/kiem-cong.mjs [so-dem]   → reports/cong-so-dem.json, reports/cong-so-dem/*.png; thoát mã 1 nếu có mục đỏ.
// 1. Không bài nào trùng hoặc giống gần bài tập trong 300 buổi (sổ lập lại từ bản buổi học hiện tại, không dùng sổ cũ).
// 2. Không trùng trong kho. 3. Đáp án đúng. 4. Chỉ ảnh vẽ tay đã duyệt. 5. Câu hỏi ≤ 12 từ. 6. Chơi thật trên iPad, điện thoại.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { ENGINES } from '../../engines/index.js';
import { makeRng } from '../../core/lu-core.js';
import { donVi, kiemTrung, taoSo, themVaoSo } from './van-tay.mjs';
import { lapSo } from './so-bai-300.mjs';
import { serve } from '../serve.mjs';
import { doToGiua, danhGia } from '../do-to-giua.mjs';
import { kiemLoiCu, kiemGio } from '../kiem-loi-cu.mjs';
import { doMan } from '../do-man.mjs';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const id = (process.argv[2] || 'so-dem').replace(/[^\w-]/g, '');
const J = async p => JSON.parse(await readFile(path.join(ROOT, p), 'utf8'));
const K = await J(`content/cong/${id}.json`);
const rows = []; const check = (ten, ok, chiTiet = '') => rows.push({ ten, ok: !!ok, chiTiet });

// 1–2. Trùng
const so300 = await lapSo(); const s300 = taoSo(so300.muc); const sKho = taoSo();
const trung300 = [], trungKho = [];
for (const a of K.bai) for (const u of donVi(a)) {
  const t = kiemTrung(u, s300); if (t) trung300.push(`${a.activity_id} ${t.loai} với ${t.voi}`);
  const t2 = kiemTrung(u, sKho); if (t2) trungKho.push(`${a.activity_id} ${t2.loai} với ${t2.voi}`);
  themVaoSo(sKho, { ...u, nguon: a.activity_id });
}
check(`Không trùng bài tập trong 300 buổi (sổ: ${so300.buoi.length} buổi, ${so300.so_bai_tap} bài tập)`, !trung300.length, trung300.slice(0, 3).join('; '));
check('Không trùng nhau trong kho cổng', !trungKho.length, trungKho.slice(0, 3).join('; '));
// 3. Đáp án
const loi = []; for (const a of K.bai) { const E = ENGINES[a.engine]; for (let s = 1; s <= 5; s++) loi.push(...E.validate(a), ...E.verify(a, E.generate(a, makeRng(s)))); }
check(`Đáp án đúng (${K.bai.length} bài × 5 biến thể)`, !loi.length, [...new Set(loi)].slice(0, 3).join('; '));
// 4. Ảnh
const duyet = new Set((await J('registry/assets.json')).assets.filter(a => a.trang_thai === 'da_duyet').map(a => a.slot));
const thieu = new Set(); JSON.stringify(K.bai, (k, v) => { if (typeof v === 'string') { const m = v.match(/^art:([^*:]+)(\*\d+)?$/); if (m && !duyet.has('art:' + m[1])) thieu.add(m[1]); } return v; });
check('Đồ vật đều là ảnh vẽ tay đã duyệt', !thieu.size, [...thieu].join(', '));
// 5. Lời dẫn ngắn (quy tắc 34) và không emoji
const dai = K.bai.flatMap(a => [a.q, ...(a.items || []).map(i => i.q)].filter(Boolean)).filter(q => q.split(/\s+/).length > 12);
check('Câu hỏi tối đa 12 từ', !dai.length, dai.slice(0, 2).join(' | '));
check('Không emoji', !/\p{Extended_Pictographic}/u.test(JSON.stringify(K.bai)));
check('Mỗi phòng có bài', K.phong.every(p => K.bai.some(a => a.phong === p.id)), K.phong.filter(p => !K.bai.some(a => a.phong === p.id)).map(p => p.id).join(', '));

// 6. Chơi thật
const OUT = path.join(ROOT, 'reports', `cong-${id}`); await mkdir(OUT, { recursive: true });
const { chromium } = require('playwright'); const port = 5900 + Math.floor(Math.random() * 90); const srv = await serve(port); const b = await chromium.launch();
// Phòng đại diện cho mọi dạng bài
const dangPhong = new Map(); K.bai.forEach(a => { if (!dangPhong.has(a.dang)) dangPhong.set(a.dang, a.phong); });
const phongThu = [...new Set(dangPhong.values())];
const runs = [];
for (const [vp, w, h] of [['ipad', 1180, 820], ['phone', 390, 844]]) {
  const page = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const run = { vp, errs, man: [], tran: [], wrongOk: [], wrongChecked: 0, luot: 0, done: 0 };
  // Sảnh và màn cổng: mọi thẻ nằm trọn trong màn hình, không cuộn ngang
  for (const [ten, q] of [['sanh', ''], ['cong', `&cong=${id}&mo=1`]]) {
    await page.goto(`http://127.0.0.1:${port}/cong.html?fast=1&ns=k-${vp}${q}`); await page.waitForSelector('.hub-card'); await page.waitForTimeout(300);
    const t = await page.evaluate(() => { const vw = innerWidth, vh = innerHeight; const bad = [...document.querySelectorAll('.hub-card, .big-btn')].filter(e => { const r = e.getBoundingClientRect(); return r.right > vw + 1 || r.left < -1 || r.bottom > vh + 1; }).map(e => e.innerText.split('\n')[0]); return { bad, ngang: document.documentElement.scrollWidth > vw + 1, nho: Math.round(Math.min(...[...document.querySelectorAll('.hub-card')].map(e => Math.min(e.offsetWidth, e.offsetHeight)))) }; });
    if (t.bad.length || t.ngang) run.tran.push(`${ten}: ${t.ngang ? 'cuộn ngang; ' : ''}${t.bad.join(', ')} tràn màn`);
    if (t.nho < 72) run.tran.push(`${ten}: thẻ nhỏ ${t.nho}px`);
    await page.screenshot({ path: path.join(OUT, `${ten}-${vp}.png`) });
  }
  for (const ph of phongThu) {
    await page.goto(`http://127.0.0.1:${port}/cong.html?fast=1&seed=7&mo=1&ns=k-${vp}-luot&cong=${id}&phong=${ph}`);
    run.luot++; let last = '', k = 0; const tried = new Set();
    for (let i = 0; i < 6000; i++) {
      await page.waitForTimeout(25);
      const st = await page.evaluate(() => ({ done: window.__luTest?.done, man: window.__luTest?.man, n: (window.__luTest?.current || []).length, step: document.querySelectorAll('.steps .done').length, t: document.querySelector('.scene .title')?.innerText || '' }));
      if (st.done) { run.done++; break; }
      const key = st.step + '|' + st.t;
      if (st.man === 'luot' && st.n && key !== last) {
        last = key; await page.waitForTimeout(200);
        const tg = danhGia(await page.evaluate(doToGiua), vp === 'phone' ? 'phone' : 'ipad');
        const lc = (await kiemLoiCu(page)).errs; const dm = await page.evaluate(doMan);
        const file = `${ph}-${String(++k).padStart(2, '0')}-${vp}.png`; await page.screenshot({ path: path.join(OUT, file) });
        run.man.push({ file, title: st.t, toGiua: tg, loiCu: lc, ...dm });
      }
      if (st.man === 'luot' && st.n && !tried.has(last)) {
        tried.add(last);
        for (let w2 = 0; w2 < 400 && await page.evaluate(() => !!document.querySelector('[data-busy]')); w2++) await page.waitForTimeout(25);
        const t = await page.evaluate(() => { const c = window.__luTest?.current || []; if (c.length !== 1 || !c[0].classList.contains('opt')) return false;
          const o = [...c[0].parentElement.querySelectorAll('.opt')].find(x => x !== c[0]); if (!o) return false; window.__w = o; window.__e0 = window.__luTest.events.length; o.click(); return true; });
        if (t) { await page.waitForTimeout(150); const bad = await page.evaluate(() => window.__w.classList.contains('right') || window.__luTest.events.slice(window.__e0).some(e => e.correct)); if (bad) run.wrongOk.push(`${ph} ${st.t}`); else run.wrongChecked++; }
      }
      { const g = await kiemGio(page); if (g && !g.ok && run.man.length) run.man.at(-1).loiCu.push(...g.errs); }
      await page.evaluate(() => { if (document.querySelector('[data-busy]')) return; const T = window.__luTest; const c = (T.current || []).slice(); T.current = [];
        c.forEach(el => { if (!el.isConnected) return; if (el.classList.contains('piece')) { const r = el.getBoundingClientRect(); el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.x + 5, clientY: r.y + 5 })); dispatchEvent(new PointerEvent('pointerup', { clientX: r.x + 5, clientY: r.y + 5 })); } else el.click(); }); });
    }
    await page.screenshot({ path: path.join(OUT, `${ph}-xong-${vp}.png`) });
  }
  // Sau 3 lượt trong ngày: không còn nút Luyện thêm, Lu rủ nghỉ
  const nghi = await page.evaluate(() => !document.querySelector('.cg-them') && !!document.querySelector('.cg-mo-them'));
  run.nghi = phongThu.length >= 3 ? nghi : true;
  runs.push(run); await page.close();
}
await b.close(); srv.close();
for (const r of runs) {
  check(`[${r.vp}] Chơi hết ${r.luot} lượt (phòng ${phongThu.join(', ')})`, r.done === r.luot, `${r.done}/${r.luot}`);
  check(`[${r.vp}] Không lỗi kỹ thuật (JS)`, !r.errs.length, r.errs.slice(0, 2).join('; '));
  check(`[${r.vp}] Sảnh và màn cổng không tràn màn`, !r.tran.length, r.tran.join('; '));
  check(`[${r.vp}] Chọn sai thì Lu báo sai, không khen`, !r.wrongOk.length && r.wrongChecked > 0, r.wrongOk.length ? r.wrongOk.join('; ') : `${r.wrongChecked} màn`);
  const tg = r.man.flatMap(m => m.toGiua.map(e => `${m.file}: ${e}`)); const lc = r.man.flatMap(m => m.loiCu.map(e => `${m.file}: ${e}`));
  check(`[${r.vp}] Nội dung học to, nằm giữa màn (quy tắc 33)`, r.man.length && !tg.length, tg.slice(0, 3).join('; '));
  check(`[${r.vp}] Không lặp lỗi tam đã báo`, !lc.length, lc.slice(0, 3).join('; '));
  // Cùng các mục của bài học (play-draft → cong-kiem-tra), đo bằng cùng hàm tools/do-man.mjs
  const s = r.man;
  check(`[${r.vp}] Mọi màn có nền ảnh thật`, s.length && s.every(x => x.realBackdrop), `${s.filter(x => x.realBackdrop).length}/${s.length}`);
  check(`[${r.vp}] Không emoji trên màn`, s.every(x => !x.emoji));
  const minTap = Math.min(...s.map(x => x.minTap || 999));
  check(`[${r.vp}] Nút chạm từ 48px trở lên`, minTap >= 48, `${minTap}px`);
  const avg = Math.round(s.reduce((a, x) => a + x.illusPct, 0) / (s.length || 1));
  check(`[${r.vp}] Hình minh họa chiếm 65% màn hình trở lên`, avg >= 65, `${avg}%`);
  check(`[${r.vp}] Sau ${3} lượt trong ngày Lu rủ nghỉ, bố mẹ mở thêm được`, r.nghi);
}
await writeFile(path.join(ROOT, 'reports', `cong-${id}.json`), JSON.stringify({ id, at: new Date().toISOString(), rows, runs }, null, 1));
for (const r of rows) console.log(`${r.ok ? 'XANH' : 'ĐỎ  '} ${r.ten}${r.chiTiet ? ' · ' + r.chiTiet : ''}`);
const red = rows.filter(r => !r.ok).length; console.log(red ? `CỔNG ĐÓNG: ${red} mục đỏ` : `CỔNG MỞ: ${rows.length}/${rows.length} mục xanh`);
if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(red ? 1 : 0);
export { rows };

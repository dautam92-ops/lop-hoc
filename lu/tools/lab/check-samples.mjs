// Kiểm tra nội dung Phòng mẫu không cần trình duyệt: validate + generate/verify 30 seed cho mỗi hoạt động, đủ lời thoại.
// Chạy: node tools/lab/check-samples.mjs
import { kiemLapLuot } from '../kiem-lap-luot.mjs';
import { readFileSync } from 'node:fs';
import { ENGINES } from '../../engines/index.js';
import { makeRng } from '../../core/lu-core.js';
import { SCENE_KINDS } from '../../ui/scenes.js';
import { kiemHanhDong } from '../../core/hanh-dong.js';
import { kiemBai, kiemAnh } from '../kiem-logic.mjs';
import { readdirSync } from 'node:fs';
const D = JSON.parse(readFileSync(new URL('../../content/lab/samples.json', import.meta.url)));
let bad = 0, n = 0, hinhLoi = 0;
for (const s of D.samples) for (const [age, act] of Object.entries(s.levels)) {
  n++; const E = ENGINES[act.engine]; const errs = [];
  if (!E) errs.push('không có engine ' + act.engine);
  else {
    errs.push(...E.validate(act));
    for (let seed = 1; seed <= 30 && !errs.length; seed++) { try { const v = E.generate(act, makeRng(seed)); errs.push(...(E.verify ? E.verify(act, v) : [])); } catch (e) { errs.push(`seed ${seed}: ${e.message}`); } }
    try { const L = E.lines(act); if (!L.length) errs.push('không có lời thoại'); } catch (e) { errs.push('lines: ' + e.message); }
    errs.push(...kiemLapLuot({ stages: [{ activities: [act] }] })); // quy tắc 49: ba lượt phải khác nhau
  }
  if (errs.length) { bad++; console.log(`LỖI ${act.activity_id}:\n  ` + [...new Set(errs)].slice(0, 6).join('\n  ')); }
}
// Nền: mỗi bài phải có nền hợp lệ; hai bài liền nhau trong cùng danh sách không trùng nền; ít nhất 8 nền khác nhau (tam 26/11).
const slots = new Set(JSON.parse(readFileSync(new URL('../../registry/assets.json', import.meta.url))).assets.filter(a => a.trang_thai === 'da_duyet' && a.slot).map(a => a.slot));
const bds = D.samples.map(s => s.bd);
D.samples.forEach((s, i) => {
  if (!s.bd || !(SCENE_KINDS.includes(s.bd) || slots.has(s.bd))) { bad++; console.log(`LỖI ${s.id}: nền "${s.bd}" không có ảnh duyệt hay cảnh vẽ`); }
  if (i && s.bd === bds[i - 1] && s.id.slice(0, 2) === D.samples[i - 1].id.slice(0, 2)) { bad++; console.log(`LỖI ${s.id}: trùng nền với bài liền trước (${s.bd})`); }
});
const nb = new Set(bds).size; if (nb < 8) { bad++; console.log(`LỖI: chỉ có ${nb} nền khác nhau`); }
console.log(`Nền: ${nb} loại cho ${bds.length} bài.`);
// Hình nghèo nàn (tam 26/11 19:04 "Trên trời và trên cạn hình ảnh quá nghèo nàn"): đồ vật, con vật, cảnh bé nhìn phải là ảnh vẽ tay đã duyệt.
// Hình vẽ mã chỉ được dùng cho hình học và hình có tham số (màu, số). Chỗ nào chưa có ảnh phải nằm trong danh sách chờ vẽ trên máy 24H (tools/lab/anh-con-thieu.json).
{ const artSlots = new Set([...slots].filter(x => x.startsWith('art:')));
  let cho = new Set(); try { cho = new Set(JSON.parse(readFileSync(new URL('./anh-con-thieu.json', import.meta.url))).items.map(i => i.slot)); } catch {}
  const used = new Map(); const walk = (o, id) => { if (typeof o === 'string') { const m = o.match(/^art:([^*:]+)(\*\d+)?$/); if (m) (used.get(m[1]) || used.set(m[1], new Set()).get(m[1])).add(id); } else if (o && typeof o === 'object') for (const v of Object.values(o)) walk(v, id); };
  for (const s of D.samples) walk(s, s.id);
  const hinhHoc = k => /^hinh-/.test(k);
  const thieu = [...used].filter(([k]) => !artSlots.has('art:' + k) && !hinhHoc(k));
  const khongTheoDoi = thieu.filter(([k]) => !cho.has('art:' + k));
  for (const [k, ids] of khongTheoDoi) { hinhLoi++; console.log(`LỖI hình nghèo nàn: art:${k} (${[...ids].join(', ')}) đang là hình vẽ mã, chưa có ảnh vẽ tay và không có trong danh sách chờ vẽ anh-con-thieu.json`); }
  const thua = [...cho].filter(k => artSlots.has(k)); if (thua.length) console.log(`Ảnh đã duyệt, gỡ khỏi danh sách chờ: ${thua.join(', ')}`);
  console.log(`Hình vẽ tay: ${used.size - thieu.length}/${used.size} hình đã có ảnh; ${thieu.length} hình chờ vẽ trên máy 24H.`); }
// Quy tắc 34 (tam 26/11 19:56 và 20:07): lời dẫn ngắn, hỏi thẳng việc bé cần làm.
// Bài trên màn: câu hỏi ≤ 10 từ, lời mở đầu và câu hướng dẫn ≤ 12 từ. Bài ngoài màn hình (E15) ≤ 25 từ; kể chuyện (E10) là nội dung truyện, không đo.
{ const wc = x => String(x).trim().split(/\s+/).length;
  for (const s of D.samples) for (const [age, l] of Object.entries(s.levels)) { if (l.engine === 'E10') continue; const lim = l.engine === 'E15' ? 25 : 12;
    const qs = [l.q, ...(l.items || []).map(i => i.q), ...(l.tasks || []).map(t => t.q)].filter(x => typeof x === 'string');
    const hd = [...(l.intro || []), l.listen, l.look, l.your_turn, l.again, ...(l.tasks || []).map(t => t.act)].filter(x => typeof x === 'string');
    for (const q of qs) if (wc(q) > 10) { hinhLoi++; console.log(`LỖI quy tắc 34 ${s.id} ${age}: câu hỏi dài ${wc(q)} từ (≤ 10): ${q}`); }
    for (const x of hd) if (wc(x) > lim) { hinhLoi++; console.log(`LỖI quy tắc 34 ${s.id} ${age}: lời dẫn dài ${wc(x)} từ (≤ ${lim}): ${x}`); } } }
// Quy tắc 38 (tam 27/11 "Bé đoán xem" L002): câu hỏi hành động thì mọi ảnh đáp án là hành động của chính nhân vật được hỏi.
for (const x of kiemHanhDong(D.samples)) { hinhLoi++; console.log('LỖI ' + x); }
// Soát logic (QUY-TAC-LOGIC.md, tam 27/11 11:06): mẫu không có điều vô lý; câu mô tả ảnh soát TRƯỚC khi vẽ.
for (const x of kiemBai({ lesson_id: 'lab', samples: D.samples }).loi) { hinhLoi++; console.log('LỖI logic ' + x); }
for (const f of readdirSync(new URL('./', import.meta.url)).filter(f => /^anh-.*\.json$/.test(f)))
  for (const x of kiemAnh(JSON.parse(readFileSync(new URL('./' + f, import.meta.url)))).loi) { hinhLoi++; console.log(`LỖI logic ảnh ${f}: ${x}`); }
// Quy tắc 45 (tam 27/11 15:40): ảnh đồ vật, con vật vẽ một lần rồi dùng lại; tệp câu mô tả chờ vẽ không được trùng ảnh trong kho.
{ const { kiemDungLai, docTepAnh, khoAnh } = await import('../kiem-dung-lai.mjs');
  for (const x of kiemDungLai(await docTepAnh(), await khoAnh(), JSON.parse(readFileSync(new URL('../../content/kien-thuc/vat.json', import.meta.url))).vat)) { hinhLoi++; console.log('LỖI ' + x); } }
console.log(`${n - bad}/${n} hoạt động đạt.`); if (hinhLoi) console.log(`${hinhLoi} hình nghèo nàn chưa được theo dõi.`); process.exit(bad || hinhLoi ? 1 : 0);

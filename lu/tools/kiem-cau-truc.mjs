// Kiểm cấu trúc buổi học và lịch ôn (tam duyệt 26/11/2026).
// 1. Từ L002 trở đi mọi buổi theo cấu trúc L001: 10–12 bài nhỏ, mỗi bài nhỏ 3–4 bài tập, đủ 6 nhóm kỹ năng.
// 2. Lịch ôn: chữ cái và số ôn 5 lượt (sau 3, 7, 14, 30, 60 buổi); mỗi lượt ôn dùng một cách học
//    chưa dùng cho nội dung đó ở các buổi trước. Hoạt động ôn ghi `on_tap: "chu:a"` hoặc `"so:5"`;
//    hoạt động dạy lần đầu ghi `noi_dung` cùng dạng khóa. Từ L004 mỗi buổi có ít nhất 1 hoạt động ôn.
// Dùng: node tools/kiem-cau-truc.mjs L002   (in JSON, thoát mã 1 nếu lỗi)
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exCount } from '../core/runner.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const NHOM_BAT_BUOC = ['TO', 'TV', 'TD', 'KP', 'EQ', 'EN'];
const so = id => +String(id).replace(/\D/g, '');
export const LICH_ON = [3, 7, 14, 30, 60];
// 18 năng lực (Khung phương pháp, tam duyệt 26/11). Q3: mỗi buổi từ L002 rèn ≥ 8 năng lực, luôn có NL11 tưởng tượng và NL12 sáng tạo;
// 5 buổi liền nhau phủ đủ 18. Năng lực lấy từ trường `nang_luc` của hoạt động, nếu không có thì suy từ `mechanic`.
const _M = 'M01 02 16|M02 02|M03 02 10|M04 02 04|M05 02 04|M06 02 18|M07 02 18|M08 02 04|M09 05 04|M10 07 10|M11 06 04|M12 06 13 16|M13 05|M14 02 05|M15 02 18|M16 02 04|M17 01 05|M18 01 04|M19 01 04|M20 01 18|M21 07 09|M22 07 09|M23 08 14 09|M24 06 09|M25 04 07|M26 04 13|M27 13 06|M28 09|M29 16 07|M30 08 09|M31 06 18 16|M32 06|M33 06 11|M34 05 06|M35 05 18|M36 03 08|M37 03 05|M38 03|M39 03 08|M40 03 14|M41 03 04|M42 16 03|M43 03|M44 03 08|M45 03 17 14|M46 03 10|M47 03|M48 18 03|M49 04 03|M50 18 03|M51 17|M52 18 04|M53 10 04|M54 12 15 11|M55 12 06 18|M56 17 08|M57 14 17|M58 16 12';
export const NL_CUA = Object.fromEntries(_M.split('|').map(x => { const [m, ...r] = x.split(' '); return [m, r.map(y => 'NL' + y)]; }));
export const nangLuc = pkg => new Set((pkg.stages || []).flatMap(s => s.activities || []).flatMap(a => a.nang_luc || NL_CUA[a.mechanic] || []));
export function kiemNangLuc(pkg, truoc) {
  const loi = []; if (so(pkg.lesson_id) < 2) return loi;
  const nl = nangLuc(pkg);
  if (nl.size < 8) loi.push(`chỉ rèn ${nl.size} năng lực, cần ít nhất 8`);
  for (const k of ['NL11', 'NL12']) if (!nl.has(k)) loi.push(`thiếu ${k === 'NL11' ? 'tưởng tượng' : 'sáng tạo'}`);
  const cua = truoc.filter(p => so(p.lesson_id) >= 2).sort((a, b) => so(a.lesson_id) - so(b.lesson_id)).slice(-4);
  if (cua.length === 4) {
    const all = new Set([...nl, ...cua.flatMap(p => [...nangLuc(p)])]);
    const thieu = Array.from({ length: 18 }, (_, i) => 'NL' + String(i + 1).padStart(2, '0')).filter(k => !all.has(k));
    if (thieu.length) loi.push(`5 buổi ${cua[0].lesson_id}–${pkg.lesson_id} chưa phủ đủ 18 năng lực, thiếu ${thieu.join(', ')}`);
  }
  return loi;
}
export const cachHoc = a => a.mechanic || `${a.engine}${a.mode ? ':' + a.mode : ''}`;

export function kiemCauTruc(pkg) {
  const loi = [], st = pkg.stages || [];
  if (st.length < 10 || st.length > 12) loi.push(`có ${st.length} bài nhỏ, cần 10–12`);
  st.forEach((s, i) => {
    const n = (s.activities || []).reduce((t, a) => t + exCount(a, null), 0);
    if (n < 3 || n > 4) loi.push(`bài nhỏ ${i + 1} "${s.title}" có ${n} bài tập, cần 3–4`);
  });
  const co = new Set(st.flatMap(s => (s.activities || []).map(a => (a.skill_id || '').split('.')[0])).filter(Boolean));
  const thieu = NHOM_BAT_BUOC.filter(k => !co.has(k));
  if (thieu.length) loi.push(`thiếu nhóm kỹ năng ${thieu.join(', ')}`);
  return loi;
}

export function kiemOn(pkg, truoc) {
  // truoc: các buổi có số nhỏ hơn, đã dựng
  const loi = [], acts = (pkg.stages || []).flatMap(s => s.activities || []);
  const on = acts.filter(a => a.on_tap);
  if (so(pkg.lesson_id) >= 4 && !on.length) loi.push('buổi từ L004 phải có ít nhất 1 hoạt động ôn cách quãng (on_tap)');
  for (const a of on) {
    const k = a.on_tap, m = cachHoc(a);
    const daDung = truoc.flatMap(p => (p.stages || []).flatMap(s => s.activities || []))
      .filter(b => b.on_tap === k || b.noi_dung === k).map(cachHoc);
    if (daDung.includes(m)) loi.push(`${a.activity_id} ôn ${k} bằng cách học ${m} đã dùng trước đó, phải đổi cách khác`);
  }
  return loi;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const id = process.argv[2] || 'L001';
  const dir = path.join(ROOT, 'content/drafts');
  const all = [];
  for (const f of (await readdir(dir)).filter(f => /^[LM]\d+\.json$/.test(f))) all.push(JSON.parse(await readFile(path.join(dir, f), 'utf8')));
  const pkg = all.find(p => p.lesson_id === id);
  if (!pkg) { console.log(JSON.stringify({ cau_truc: [`không thấy ${id}`], on_tap: [] })); process.exit(1); }
  const tr = all.filter(p => so(p.lesson_id) < so(id));
  const r = { cau_truc: kiemCauTruc(pkg), on_tap: kiemOn(pkg, tr), nang_luc: kiemNangLuc(pkg, tr) };
  console.log(JSON.stringify(r));
  process.exit(r.cau_truc.length + r.on_tap.length + r.nang_luc.length ? 1 : 0);
}

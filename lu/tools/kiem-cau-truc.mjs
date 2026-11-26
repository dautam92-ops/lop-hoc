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
export const LICH_ON = [3, 7, 14, 30, 60];
const so = id => +String(id).replace(/\D/g, '');
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
  for (const f of (await readdir(dir)).filter(f => /^L\d+\.json$/.test(f))) all.push(JSON.parse(await readFile(path.join(dir, f), 'utf8')));
  const pkg = all.find(p => p.lesson_id === id);
  if (!pkg) { console.log(JSON.stringify({ cau_truc: [`không thấy ${id}`], on_tap: [] })); process.exit(1); }
  const r = { cau_truc: kiemCauTruc(pkg), on_tap: kiemOn(pkg, all.filter(p => so(p.lesson_id) < so(id))) };
  console.log(JSON.stringify(r));
  process.exit(r.cau_truc.length + r.on_tap.length ? 1 : 0);
}

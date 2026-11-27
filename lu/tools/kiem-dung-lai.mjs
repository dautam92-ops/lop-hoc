// Quy tắc 45 (tam 27/11 15:40): dùng lại ảnh. Đồ vật, con vật, hình khối (quả táo, con sâu, hình tròn…) chỉ vẽ MỘT lần,
// vào kho chung (registry/assets.json, gắn slot art:x) rồi mọi bài dùng lại. Chỉ vẽ mới ảnh nhân vật làm hành động riêng của bài
// hoặc cảnh riêng. Phép thử chạy trên mọi tệp câu mô tả ảnh CHỜ VẼ (tools/lab/anh-*.json không có "trang_thai": "da_ve" | "bo"):
//  1. slot đã có ảnh trong kho (không tính ảnh đã thay thế) → lỗi, dùng lại ảnh đó;
//  2. vật cùng tên (kho kiến thức) đã có ảnh dưới slot khác → lỗi, dùng lại slot đó;
//  3. một slot nằm trong hai tệp chờ vẽ → lỗi, vẽ trùng;
// Muốn vẽ lại có chủ ý (tam yêu cầu, ảnh cũ hỏng) thì ghi "ve_lai": "<lý do>" ở mục đó.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bo = s => String(s || '').replace(/^art:/, '');

export async function khoAnh() {
  const A = JSON.parse(await readFile(path.join(ROOT, 'registry/assets.json'), 'utf8')).assets;
  const m = new Map(); for (const a of A) if (a.slot && a.trang_thai !== 'thay_the') m.set(bo(a.slot), a.asset_id); return m;
}
export function kiemDungLai(files, kho, KB) {
  const loi = [], cho = files.filter(f => !['da_ve', 'bo'].includes(f.data.trang_thai));
  const tenCoAnh = new Map(); for (const [s, id] of kho) if (KB[s]?.ten) tenCoAnh.set(KB[s].ten.toLowerCase(), [s, id]);
  const noi = new Map();
  for (const f of cho) for (const it of f.data.items || []) {
    const s = bo(it.slot), at = `${f.ten}: ${it.id || s}`;
    if (it.ve_lai) continue;
    if (kho.has(s)) loi.push(`${at}: art:${s} đã có ảnh ${kho.get(s)} trong kho; dùng lại, không vẽ mới (quy tắc 45). Cố ý vẽ lại thì ghi "ve_lai": "<lý do>"`);
    else { const t = KB[s]?.ten?.toLowerCase(); const c = t && tenCoAnh.get(t); if (c && c[0] !== s) loi.push(`${at}: "${KB[s].ten}" đã có ảnh ${c[1]} ở slot art:${c[0]}; dùng lại slot đó (quy tắc 45)`); }
    if (noi.has(s)) loi.push(`${at}: art:${s} cũng đang chờ vẽ ở ${noi.get(s)}; vẽ trùng (quy tắc 45)`); else noi.set(s, f.ten);
  }
  return loi;
}
export async function docTepAnh() {
  const dir = path.join(ROOT, 'tools/lab');
  return Promise.all((await readdir(dir)).filter(f => /^anh-.*\.json$/.test(f)).map(async f => ({ ten: f, data: JSON.parse(await readFile(path.join(dir, f), 'utf8')) })));
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const KB = JSON.parse(await readFile(path.join(ROOT, 'content/kien-thuc/vat.json'), 'utf8')).vat;
  const loi = kiemDungLai(await docTepAnh(), await khoAnh(), KB);
  console.log(loi.length ? loi.join('\n') : 'Quy tắc 45: không vẽ trùng ảnh đã có trong kho.'); process.exit(loi.length ? 1 : 0);
}

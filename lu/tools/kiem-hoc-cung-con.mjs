// Kiểm phần "Học cùng con" của mỗi buổi (quy tắc Q4, QUY-TAC-BUOI-HOC.md, tam duyệt hướng 27/11/2026).
// Dữ liệu: content/hoc-cung-con/<id>.json (hoặc trường hoc_cung_con trong bài, nếu đã lồng vào).
// Dùng: node tools/kiem-hoc-cung-con.mjs L001   (in lỗi, thoát mã 1 nếu có lỗi)
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const LOAI_MOI = ['chi-cho', 'hoi', 'do-bo-me', 'ke', 'lam-cung'];
const tu = s => String(s || '').replace(/[.,!?:;“”"]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
// Lời Mono gọi trẻ là "bé", không gọi "con" (trừ tên vật như "gà con").
const goiCon = s => /(^|[\s,.!?:])con(?=[\s,.!?:]|$)/i.test(String(s).replace(/gà con|chú gà con|mèo con|cá con/gi, ''));

export async function docHocCungCon(id, pkg) {
  if (pkg?.hoc_cung_con) return pkg.hoc_cung_con;
  try { return JSON.parse(await readFile(path.join(ROOT, 'content/hoc-cung-con', id + '.json'), 'utf8')); } catch { return null; }
}

export function kiemHocCungCon(pkg, h, hTruoc) {
  const loi = [];
  if (!h) return ['chưa có phần học cùng con (dặn bố mẹ, Mono mời bố mẹ, hoạt động cuối buổi)'];
  const d = h.dan_bo_me || {};
  for (const k of ['hom_nay', 'chuan_bi', 'ngoi_canh']) {
    if (!d[k]) loi.push(`dặn bố mẹ thiếu "${k}"`);
    else if (tu(d[k]) > 25) loi.push(`dặn bố mẹ "${k}" dài ${tu(d[k])} từ, tối đa 25`);
  }
  const m = h.moi_bo_me || [], nBai = (pkg?.stages || []).length;
  if (m.length < 3 || m.length > 4) loi.push(`có ${m.length} lời mời bố mẹ, cần 3–4`);
  if (new Set(m.map(x => x.loai)).size < 2) loi.push('lời mời bố mẹ cần ít nhất 2 kiểu khác nhau');
  m.forEach((x, i) => {
    const at = `lời mời ${i + 1}`;
    if (!Number.isInteger(x.sau_bai) || x.sau_bai < 0 || (nBai && x.sau_bai >= nBai)) loi.push(`${at}: sau_bai không đúng bài nhỏ`);
    if (i && x.sau_bai - m[i - 1].sau_bai < 2) loi.push(`${at}: cách lời mời trước ít hơn 2 bài nhỏ`);
    if (!LOAI_MOI.includes(x.loai)) loi.push(`${at}: kiểu "${x.loai}" không có trong ${LOAI_MOI.join(', ')}`);
    if (tu(x.loi) > 12) loi.push(`${at}: lời Mono dài ${tu(x.loi)} từ, tối đa 12`);
    if (!/bố mẹ/.test(x.loi || '')) loi.push(`${at}: lời Mono phải nhắc "bố mẹ"`);
    if (goiCon(x.loi)) loi.push(`${at}: lời Mono gọi trẻ là "con", đổi thành "bé"`);
    if (!x.goi_y || tu(x.goi_y) > 20) loi.push(`${at}: gợi ý cho bố mẹ cần có và tối đa 20 từ`);
  });
  const c = h.cuoi_buoi || {};
  if (!c.loi || tu(c.loi) > 12) loi.push('lời Mono cuối buổi cần có và tối đa 12 từ');
  if (c.loi && !/tắt máy/.test(c.loi)) loi.push('lời Mono cuối buổi phải mời tắt máy');
  if (c.loi && goiCon(c.loi)) loi.push('lời Mono cuối buổi gọi trẻ là "con", đổi thành "bé"');
  if (!c.ten || !(c.phut > 0 && c.phut <= 10)) loi.push('hoạt động cuối buổi cần tên và 1–10 phút');
  if (hTruoc) {
    const cu = new Set((hTruoc.moi_bo_me || []).map(x => x.loi));
    m.filter(x => cu.has(x.loi)).forEach(x => loi.push(`lời mời "${x.loi}" lặp lại buổi trước`));
  }
  return loi;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const id = process.argv[2] || 'L001';
  const pkg = JSON.parse(await readFile(path.join(ROOT, 'content/drafts', id + '.json'), 'utf8'));
  const truoc = 'L' + String(+id.slice(1) - 1).padStart(3, '0');
  const loi = kiemHocCungCon(pkg, await docHocCungCon(id, pkg), await docHocCungCon(truoc));
  console.log(loi.length ? loi.join('\n') : `${id}: học cùng con đạt`);
  process.exit(loi.length ? 1 : 0);
}

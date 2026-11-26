// Lập danh sách gói bài đã có (bản nháp hoặc đã xuất bản) cho màn nhà, để trang không phải dò từng tệp (không lỗi 404).
// Chạy: node tools/nha/ds-goi.mjs        → content/man-nha/goi-bai.json
//       node tools/nha/ds-goi.mjs --kiem  → báo lỗi nếu tệp đang lưu lệch với thư mục bài (dùng trong cổng kiểm tra)
import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ls = async d => { try { return (await readdir(path.join(ROOT, d))).filter(f => /^L\d{3}\.json$/.test(f)).map(f => f.slice(0, 4)); } catch { return []; } };
export async function lapDanhSach() {
  const goi = {};
  for (const id of await ls('content/drafts')) goi[id] = 'drafts';
  for (const id of await ls('content/lessons')) goi[id] = 'lessons'; // bản đã xuất bản thắng bản nháp
  let cong = false; try { await access(path.join(ROOT, 'content/cong/cong.json')); cong = true; } catch {}
  return { format: 'lu-goi-bai', ghi_chu: 'Sinh bằng tools/nha/ds-goi.mjs, không sửa tay.', cong, goi: Object.fromEntries(Object.entries(goi).sort()) };
}
const OUT = path.join(ROOT, 'content/man-nha/goi-bai.json');
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ds = await lapDanhSach(); const txt = JSON.stringify(ds, null, 2) + '\n';
  if (process.argv.includes('--kiem')) {
    let cu = ''; try { cu = await readFile(OUT, 'utf8'); } catch {}
    if (cu !== txt) { console.log('LỆCH: chạy lại node tools/nha/ds-goi.mjs'); process.exit(1); }
    console.log('khớp');
  } else { await writeFile(OUT, txt); console.log(`${Object.keys(ds.goi).length} gói bài, cổng: ${ds.cong}`); }
}

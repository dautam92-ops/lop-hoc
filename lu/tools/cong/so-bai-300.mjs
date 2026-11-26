// Sổ 300 buổi: dấu vân tay của MỌI bài tập trong các buổi học (bản nháp content/drafts và bản xuất bản content/lessons).
// Chạy: node tools/cong/so-bai-300.mjs   → content/cong/so-bai-300.json
// Cổng luyện tập không được có bài nào trùng sổ này (tam 26/11 20:23).
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { normalizeLesson } from '../../core/session.js';
import { donVi } from './van-tay.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function lapSo() {
  const goi = [];
  for (const d of ['content/drafts', 'content/lessons']) {
    let fs = []; try { fs = await readdir(path.join(ROOT, d)); } catch { continue; }
    for (const f of fs.filter(f => /^L\d+\.json$/.test(f))) goi.push(JSON.parse(await readFile(path.join(ROOT, d, f), 'utf8')));
  }
  const muc = [];
  for (const p of goi) for (const a of normalizeLesson(p).activities) donVi(a).forEach((u, k) => muc.push({ nguon: `${p.lesson_id}/${a.activity_id}#${k + 1}`, ...u }));
  return { format: 'lu-so-bai-300', at: new Date().toISOString(), buoi: [...new Set(goi.map(p => p.lesson_id))].sort(), so_bai_tap: muc.length, muc };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const s = await lapSo();
  await writeFile(path.join(ROOT, 'content/cong/so-bai-300.json'), JSON.stringify(s, null, 1));
  console.log(`Sổ 300 buổi: ${s.buoi.length} buổi (${s.buoi.join(', ')}), ${s.so_bai_tap} bài tập → content/cong/so-bai-300.json`);
}

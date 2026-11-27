// Tự thử máy soát logic: mọi mẫu sai trong mau-sai.json phải bị bắt, bài mẫu đúng không bị báo oan.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { kiemCau, kiemAnh } from '../kiem-logic.mjs';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const m = JSON.parse(await readFile(path.join(DIR, 'mau-sai.json'), 'utf8'));
const lot = [];
m.mau.forEach((x, i) => { const r = kiemCau(x, `mau-${i}`); const ma = x.ma === 'KB' ? 'kho kiến thức' : x.ma; if (!r.loi.some(l => l.includes(ma))) lot.push(`${x.ma} ${x.vi}`); });
const dem = new Set(['hat-dau']);
for (const it of m.anh_sai.items) { const r = kiemAnh({ style_do_vat: m.anh_sai.style_do_vat, items: [it] }, dem); if (!r.loi.some(l => l.includes(it.ma))) lot.push(`${it.ma} ${it.id}`); }
const tong = m.mau.length + m.anh_sai.items.length;
console.log(lot.length ? `LỌT ${lot.length}/${tong}: ${lot.join('; ')}` : `BẮT ĐỦ ${tong}/${tong} mẫu sai`);
process.exit(lot.length ? 1 : 0);

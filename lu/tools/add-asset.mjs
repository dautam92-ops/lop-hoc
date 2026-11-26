// Đăng ký tài nguyên vào Asset Registry (S08, D26). Không bao giờ ghi đè: mỗi lần sửa là một phiên bản mới.
//   them … --slot L001-BG-02 | --slot art:hat-dau   gắn ảnh vào ô bối cảnh của buổi hoặc thay hình vẽ mã của đồ vật
//
//   node tools/add-asset.mjs them <tệp> --thu-muc lu/goc --mo-ta "lu dung thang vui" --nguon chatgpt-image [--nguoi tam] [--ghi-chu "..."]
//   node tools/add-asset.mjs phien-ban-moi <asset_id> <tệp> [--ghi-chu "..."]   bản sửa của một tài nguyên đã có
//   node tools/add-asset.mjs duyet <asset_id>          đánh dấu đã duyệt (chỉ Admin)
//   node tools/add-asset.mjs nhap-moi --thu-muc lu/goc --nguon chatgpt-image     đăng ký mọi tệp trong assets/_nhap-moi
//   node tools/add-asset.mjs danh-sach [thư mục]
import { readFile, writeFile, copyFile, readdir, rename, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REG = path.join(ROOT, 'registry/assets.json');
const A = path.join(ROOT, 'assets');
const PREFIX = { lu: 'LU', 'thuong-hieu': 'TH', 'ban-do': 'BD', 'boi-canh': 'BC', 'nhan-vat-phu': 'NV', 'do-vat': 'DV', 'bieu-tuong': 'BT', 'giao-dien': 'GD' };
const NGUON = { 'chatgpt-image': 'ChatGPT Image (OpenAI) – điều khoản: người dùng sở hữu đầu ra; kiểm tra lại trước khi bán', comfyui: 'ComfyUI trên máy – ghi rõ mô hình và giấy phép mô hình', 'tu-ve': 'Tự vẽ / tự làm (SVG, CSS)', khac: 'Nguồn khác – phải ghi bằng chứng giấy phép' };
const EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.json', '.mp3']);

const args = process.argv.slice(2); const cmd = args[0];
const opt = k => { const i = args.indexOf('--' + k); return i > 0 ? args[i + 1] : undefined; };
const load = async () => { try { return JSON.parse(await readFile(REG, 'utf8')); } catch { return { format: 'lu-asset-registry', version: 1, note: 'Asset Registry (S08). Sinh và sửa bằng tools/add-asset.mjs, không sửa tay.', assets: [] }; } };
const save = r => writeFile(REG, JSON.stringify(r, null, 1));
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function dims(buf, ext) {
  try {
    if (ext === '.png') return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (ext === '.webp' && buf.toString('ascii', 12, 16) === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
    if (ext === '.jpg' || ext === '.jpeg') { let i = 2; while (i < buf.length) { const m = buf[i + 1], len = buf.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xC3) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) }; i += 2 + len; } }
    if (ext === '.svg') { const m = buf.toString('utf8').match(/viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/); if (m) return { w: +m[1], h: +m[2] }; }
  } catch {}
  return null;
}

async function add(file, { folder, desc, source, who, note, of, slot }) {
  const reg = await load(); const ext = path.extname(file).toLowerCase();
  if (!EXT.has(ext)) throw new Error('Định dạng chưa hỗ trợ: ' + ext);
  const buf = await readFile(file); const sha = createHash('sha256').update(buf).digest('hex');
  const dup = reg.assets.find(a => a.sha256 === sha);
  if (dup) { console.log(`Bỏ qua ${path.basename(file)}: trùng hệt ${dup.asset_id} v${dup.version} (${dup.path}). Dùng lại tài nguyên đó (S08-R03).`); return dup; }
  let base, version = 1;
  if (of) { base = reg.assets.filter(a => a.asset_id === of).sort((a, b) => b.version - a.version)[0]; if (!base) throw new Error('Không có ' + of); folder = path.dirname(base.path).replace(/^assets\//, ''); desc = base.mo_ta; source = source || base.nguon; version = base.version + 1; }
  if (!folder || !desc || !source) throw new Error('Cần --thu-muc, --mo-ta và --nguon');
  if (!NGUON[source]) throw new Error('--nguon phải là: ' + Object.keys(NGUON).join(', '));
  const top = folder.split('/')[0]; if (!PREFIX[top]) throw new Error('Thư mục gốc phải là: ' + Object.keys(PREFIX).join(', '));
  const id = of || `${PREFIX[top]}-${String(1 + Math.max(0, ...reg.assets.filter(a => a.asset_id.startsWith(PREFIX[top] + '-')).map(a => +a.asset_id.split('-')[1]))).padStart(4, '0')}`;
  const name = `${id}_${slug(desc)}_v${String(version).padStart(2, '0')}${ext}`;
  const dest = path.join(A, folder, name); await mkdir(path.dirname(dest), { recursive: true });
  if (await stat(dest).catch(() => null)) throw new Error('Đã có tệp ' + name + ', không ghi đè');
  await copyFile(file, dest);
  if (base) base.trang_thai = base.trang_thai === 'da_duyet' ? 'thay_the' : base.trang_thai;
  const rec = { asset_id: id, version, path: path.relative(ROOT, dest).split(path.sep).join('/'), mo_ta: desc, loai: ext.slice(1), kich_thuoc: dims(buf, ext), bytes: buf.length, sha256: sha,
    nguon: source, giay_phep: NGUON[source], tep_goc: path.basename(file), nguoi_tao: who || 'tam', ngay: new Date().toISOString().slice(0, 10), trang_thai: 'cho_duyet', ghi_chu: note || '', dung_o: [], ...(slot ? { slot } : {}) };
  reg.assets.push(rec); await save(reg);
  console.log(`Đã thêm ${id} v${version} → ${rec.path}${rec.kich_thuoc ? ` (${rec.kich_thuoc.w}×${rec.kich_thuoc.h})` : ''}`);
  return rec;
}

if (cmd === 'them') await add(args[1], { folder: opt('thu-muc'), desc: opt('mo-ta'), source: opt('nguon'), who: opt('nguoi'), note: opt('ghi-chu'), slot: opt('slot') });
else if (cmd === 'phien-ban-moi') await add(args[2], { of: args[1], note: opt('ghi-chu'), who: opt('nguoi') });
else if (cmd === 'nhap-moi') {
  const dir = path.join(A, '_nhap-moi'); const files = (await readdir(dir)).filter(f => EXT.has(path.extname(f).toLowerCase()));
  for (const f of files) { await add(path.join(dir, f), { folder: opt('thu-muc'), desc: opt('mo-ta') || path.parse(f).name, source: opt('nguon'), who: opt('nguoi'), note: opt('ghi-chu') });
    await mkdir(path.join(A, '_nhap-moi/da-dang-ky'), { recursive: true }); await rename(path.join(dir, f), path.join(A, '_nhap-moi/da-dang-ky', f)); }
  if (!files.length) console.log('Thư mục _nhap-moi đang trống.');
} else if (cmd === 'duyet') { const reg = await load(); const a = reg.assets.filter(x => x.asset_id === args[1]).sort((a, b) => b.version - a.version)[0]; if (!a) throw new Error('Không có ' + args[1]); a.trang_thai = 'da_duyet'; a.ngay_duyet = new Date().toISOString().slice(0, 10); await save(reg); console.log(`${a.asset_id} v${a.version} đã duyệt`); }
else if (cmd === 'danh-sach') { const reg = await load(); reg.assets.filter(a => !args[1] || a.path.includes(args[1])).forEach(a => console.log(`${a.asset_id} v${a.version}  ${a.trang_thai.padEnd(9)} ${a.path}`)); console.log(`${reg.assets.length} tài nguyên`); }
else console.log('Lệnh: them | phien-ban-moi | duyet | nhap-moi | danh-sach (xem đầu tệp)');

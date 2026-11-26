// Cổng kiểm tra bắt buộc trước khi đưa một bài lên mạng.
// Chạy: node tools/cong-kiem-tra.mjs L001   (thoát mã 1 nếu có mục đỏ)
// Mỗi lỗi đã gặp phải có ít nhất một mục ở đây (xem SO-LOI.md).
import { danhGia } from './do-to-giua.mjs';
import { kiemCauTruc, kiemOn } from './kiem-cau-truc.mjs';
import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2] || 'L001';
const run = (args) => { const r = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }); return (r.stdout || '') + (r.stderr || ''); };
const rows = []; const check = (ten, ok, chiTiet = '') => rows.push({ ten, ok: !!ok, chiTiet });

// 1. Nội dung và đáp án (lint + 100 biến thể mỗi hoạt động)
const cd = run(['tools/check-draft.mjs', id]);
const lint = JSON.parse((cd.match(/lint (\{[\s\S]*?\n\})/) || [, '{"errors":["không đọc được lint"]}'])[1]);
check('Nội dung đúng quy chuẩn (lint)', lint.errors.length === 0, lint.errors.slice(0, 3).join('; '));
const engErr = +(cd.match(/lỗi engine (\d+)/) || [, 99])[1];
check('Đáp án đúng ở 100 biến thể mỗi hoạt động', engErr === 0, engErr ? `${engErr} hoạt động lỗi` : '');
const phut = +(cd.match(/phút ([\d.]+)/) || [, 0])[1];
check('Buổi học đủ 20 phút trở lên', phut >= 20, `${phut} phút`);

// 1b. Cấu trúc buổi như L001 (tam 26/11): 10–12 bài nhỏ, mỗi bài 3–4 bài tập, đủ 6 nhóm kỹ năng.
//     Lịch ôn (tam duyệt 26/11): mỗi lượt ôn chữ/số một cách học mới; từ L004 mỗi buổi có thẻ ôn.
{
  const dir = path.join(ROOT, 'content/drafts'); const all = [];
  for (const f of (await readdir(dir)).filter(f => /^L\d+\.json$/.test(f))) all.push(JSON.parse(await readFile(path.join(dir, f), 'utf8')));
  const pkg = all.find(p => p.lesson_id === id); const so = x => +String(x).replace(/\D/g, '');
  const ct = pkg ? kiemCauTruc(pkg) : [`không thấy ${id}`];
  check('Cấu trúc như L001: 10–12 bài nhỏ, 3–4 bài tập mỗi bài, đủ 6 nhóm kỹ năng', !ct.length, ct.slice(0, 3).join('; '));
  const ot = pkg ? kiemOn(pkg, all.filter(p => so(p.lesson_id) < so(id))) : [];
  check('Ôn chữ/số: mỗi lượt ôn một cách học mới, từ L004 có thẻ ôn', !ot.length, ot.slice(0, 3).join('; '));
}

// 2. Giọng đọc: mọi câu đều có tệp, tệp tồn tại
const vl = run(['tools/voice-lines-bai.mjs', id]);
const can = +(vl.match(/cần tạo (\d+)/) || [, 99])[1];
check('Mọi câu đều có giọng đọc', can === 0, can ? `thiếu ${can} câu` : (vl.match(/\d+ câu/) || [''])[0]);
const reg = JSON.parse(await readFile(path.join(ROOT, 'content/audio/registry.json'), 'utf8')).clips;
const miss = []; for (const f of new Set(Object.values(reg))) { try { await access(path.join(ROOT, 'content/audio', f)); } catch { miss.push(f); } }
check('Tệp giọng đọc có đủ trên đĩa', miss.length === 0, miss.length ? `thiếu ${miss.length} tệp` : '');

// 3. Ảnh: ảnh đã duyệt phải có tệp
const assets = JSON.parse(await readFile(path.join(ROOT, 'registry/assets.json'), 'utf8')).assets;
const aMiss = []; for (const a of assets.filter(a => a.trang_thai === 'da_duyet')) { try { await access(path.join(ROOT, a.path)); } catch { aMiss.push(a.asset_id); } }
check('Ảnh đã duyệt có đủ tệp', aMiss.length === 0, aMiss.join(', '));

// 3b. Quy tắc lật thẻ (tam 26/11): sai chỉ úp lại, im lặng; đúng một đôi chỉ âm báo; xong cả bài mới khen.
const e05 = await readFile(path.join(ROOT, 'engines/e05-memory.js'), 'utf8');
const mountSrc = e05.slice(e05.indexOf('export function mount'));
check('Lật thẻ: sai thì im lặng, đúng một đôi chỉ có âm báo', !/__boing|act\.no\b|okVi\(/.test(mountSrc));
check('Lật thẻ: lật đúng có tiếng "ting" vui tai', mountSrc.includes("'__dung'") && !!reg.__dung, reg.__dung ? '' : 'thiếu tệp __dung');

// 4. Chơi thật trên iPad và điện thoại (play-draft): hết buổi, không lỗi JS, chọn sai bị báo sai, ...
const pd = run(['tools/play-draft.mjs', id]);
let rep; try { rep = JSON.parse(await readFile(path.join(ROOT, 'reports', `draft-${id}.json`), 'utf8')); } catch { rep = { runs: [] }; }
check('Chơi thử chạy được', rep.runs.length === 2, rep.runs.length ? '' : pd.slice(-300));
for (const r of rep.runs) {
  const s = r.shots || [];
  check(`[${r.vp}] Chơi hết buổi`, r.done);
  check(`[${r.vp}] Không lỗi kỹ thuật (JS)`, r.errors.length === 0, r.errors.slice(0, 2).join('; '));
  check(`[${r.vp}] Chọn sai thì Lu báo sai, không khen`, r.wrongOk?.length === 0 && r.wrongChecked > 0, r.wrongOk?.length ? r.wrongOk.join('; ') : `${r.wrongChecked} màn`);
  check(`[${r.vp}] Mọi hoạt động đều ghi kết quả`, !r.noEvent?.length, (r.noEvent || []).join(', '));
  check(`[${r.vp}] Mọi màn có nền ảnh thật`, s.length > 0 && s.every(x => x.realBackdrop), `${s.filter(x => x.realBackdrop).length}/${s.length}`);
  check(`[${r.vp}] Không emoji`, s.every(x => !x.emoji));
  const minTap = Math.min(...s.map(x => x.minTap || 999));
  check(`[${r.vp}] Nút chạm từ 48px trở lên`, minTap >= 48, `${minTap}px`);
  const avg = Math.round(s.reduce((a, x) => a + x.illusPct, 0) / (s.length || 1));
  check(`[${r.vp}] Hình minh họa chiếm 65% màn hình trở lên`, avg >= 65, `${avg}%`);
  // Quy tắc 33 (tam 26/11 17:35): nội dung bé học to và nằm giữa màn hình
  const dev = r.vp === 'phone' ? 'phone' : 'ipad';
  const tg = s.flatMap(x => danhGia(x.toGiua, dev).map(e => `${x.file}: ${e}`));
  const lc = s.flatMap(x => (x.loiCu || []).map(e => `${x.file}: ${e}`));
  check(`[${r.vp}] Không lặp lỗi tam đã báo (kéo thả, chạm điểm trên ảnh, úp đồ vật…)`, !lc.length, lc.slice(0, 3).join('; '));
  check(`[${r.vp}] Nội dung học to, nằm giữa màn (quy tắc 33)`, s.length > 0 && !tg.length, tg.slice(0, 3).join('; '));
}

const red = rows.filter(r => !r.ok);
for (const r of rows) console.log(`${r.ok ? 'ĐẠT ' : 'ĐỎ  '} ${r.ten}${r.chiTiet ? ' — ' + r.chiTiet : ''}`);
console.log(red.length ? `\nCỔNG ĐÓNG: ${red.length} mục đỏ. Không được đưa ${id} lên mạng.` : `\nCỔNG MỞ: ${id} đạt ${rows.length}/${rows.length} mục.`);
process.exit(red.length ? 1 : 0);

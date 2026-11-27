// Máy soát logic (QUY-TAC-LOGIC.md, tam 27/11 11:06): bắt lỗi vô lý TRƯỚC khi vẽ ảnh và trước khi lên mạng.
// Chạy:
//   node tools/kiem-logic.mjs bai L002                 soát một buổi học
//   node tools/kiem-logic.mjs anh tools/lab/anh-x.json soát câu mô tả ảnh trước khi vẽ
//   node tools/kiem-logic.mjs bien-ban L002            kiểm biên bản agent (content/soat-logic/L002.json)
// Thoát mã 1 nếu có lỗi. "Cảnh báo" không chặn nhưng agent soát logic phải xem từng cái.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { kiemCauHanhDong } from '../core/hanh-dong.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const KB = JSON.parse(await readFile(path.join(ROOT, 'content/kien-thuc/vat.json'), 'utf8')).vat;

const SO = { 'một': 1, 'hai': 2, 'ba': 3, 'bốn': 4, 'năm': 5, 'sáu': 6, 'bảy': 7, 'tám': 8, 'chín': 9, 'mười': 10 };
const SINH = new Set(['con-vat', 'hanh-dong']);
const slotOf = o => { const e = typeof o === 'string' ? o : o?.e; const m = typeof e === 'string' && e.match(/^art:([a-z0-9-]+)$/); return m ? m[1] : null; };
const coChu = o => o && typeof o === 'object' && ['say', 'label', 't', 'text'].some(k => typeof o[k] === 'string' && o[k].trim());
const loai = s => KB[s]?.nhom;
const tuChinh = s => (KB[s]?.ten || '').split(' ').slice(-1)[0];
const has = (q, re) => re.test(q.toLowerCase());

// Câu hỏi "thứ nào không …" và "thứ nào …": [mẫu câu, thuộc tính, giá trị đúng cho đáp án]
const SU_THAT = [
  [/không phải (là )?con vật/, s => loai(s) !== 'con-vat', 'không phải con vật'],
  [/(là )?con vật( nào)?\?/, s => loai(s) === 'con-vat', 'con vật', true],
  [/không ăn được/, s => KB[s]?.an_duoc === false, 'không ăn được'],
  [/(?<!không )ăn được/, s => KB[s]?.an_duoc === true, 'ăn được'],
  [/không bay được|không biết bay/, s => !KB[s]?.bay, 'không bay được'],
  [/(?<!không )(bay được|biết bay)/, s => !!KB[s]?.bay, 'bay được'],
  [/không bơi được|không biết bơi/, s => !KB[s]?.boi, 'không bơi được'],
  [/(?<!không )(bơi được|biết bơi)/, s => !!KB[s]?.boi, 'bơi được'],
  [/sống dưới nước/, s => ['nuoc', 'ca-hai'].includes(KB[s]?.song_o), 'sống dưới nước'],
  [/(bị )?chìm/, s => KB[s]?.noi === false, 'chìm'],
  [/(?<!không )nổi( trên mặt nước)?\b/, s => KB[s]?.noi === true, 'nổi'],
  [/kêu được|phát ra tiếng|có tiếng/, s => !!KB[s]?.am_thanh, 'phát ra tiếng'],
];
const KHAC_NHOM = /không phải|không ăn được|không bay được|không biết|không bơi|khác nhóm|khác các|không cùng|không giống/;

export function kiemCau(it, where) {
  const loi = [], canh = [];
  const q = it.q || it.ask, opts = it.opts || it.options;
  if (typeof q !== 'string' || !Array.isArray(opts) || !opts.length) return { loi, canh };
  const at = `${where}: "${q}"`;
  const slots = opts.map(slotOf);
  for (const s of slots) if (s && !KB[s]) loi.push(`${at}: ảnh art:${s} chưa có trong kho kiến thức content/kien-thuc/vat.json (thêm tên, nhóm, thuộc tính trước khi dùng)`);
  // LG05 + quy tắc 38, 42: câu hỏi hành động thì ảnh đáp án phải vẽ đúng hành động (kể cả câu chọn tự do any).
  for (const x of kiemCauHanhDong(q, opts, where)) loi.push(x.replace(where + ': ', at + ': ') + ' (LG05)');
  if (it.any || opts.every(coChu)) return { loi, canh };
  const a = Number.isInteger(it.a) ? it.a : null;
  const dung = a !== null ? slots[a] : null;
  const anh = slots.map((s, i) => (s && !coChu(opts[i]) ? s : null));
  const ql = q.toLowerCase();

  // LG03: hai ô đáp án y hệt nhau (cùng hình, cùng số lượng) thì không còn một đáp án đúng.
  const key = opts.map(o => JSON.stringify([o?.e ?? o, o?.n ?? null, o?.t ?? o?.say ?? null]));
  if (new Set(key).size < key.length && !it.shadow) loi.push(`${at}: có hai đáp án giống hệt nhau (LG03)`);

  // LG01 + LG02: đáp án sai phải cùng loại, liên quan câu hỏi. Lẫn con vật/hành động với đồ vật là lỗi gốc 27/11.
  const nhom = anh.filter(Boolean).map(loai).filter(Boolean);
  const khac = KHAC_NHOM.test(ql) || it.shadow || /bóng này/.test(ql); // tìm bóng: so hình dáng, đáp án khác nhóm là chủ ý
  if (!khac && nhom.length >= 2) {
    const sinh = nhom.filter(n => SINH.has(n)).length;
    if (sinh && sinh < nhom.length && (SINH.has(loai(dung)) || sinh >= 1 && /con vật|bạn nào|chú |gà|mèo|cá |chim|ong|bướm|ếch|thỏ|vịt|ốc/.test(ql) && /làm gì|ở đâu|nào\?|ai /.test(ql)))
      loi.push(`${at}: đáp án lẫn ${[...new Set(nhom)].join(' + ')}; đáp án sai phải cùng loại với đáp án đúng (LG01, LG02)`);
    else if (new Set(nhom).size > 2) canh.push(`${at}: đáp án thuộc ${new Set(nhom).size} nhóm (${[...new Set(nhom)].join(', ')}); agent xem đáp án sai có liên quan câu hỏi không (LG01)`);
  }

  // LG07 + LG08 + LG03: câu hỏi sự thật kiểm bằng kho kiến thức.
  if (dung && KB[dung]) for (const [re, f, ten, chiNhom] of SU_THAT) {
    if (!re.test(ql)) continue;
    if (chiNhom) { const sai = anh.filter(s => s && loai(s) !== 'con-vat'); if (sai.length) loi.push(`${at}: hỏi "con vật nào" nhưng có đáp án không phải con vật: ${sai.join(', ')} (LG02)`); break; }
    if (!f(dung)) loi.push(`${at}: đáp án đúng ${KB[dung].ten} không "${ten}" theo kho kiến thức (LG07/LG08)`);
    const cungDung = anh.filter((s, i) => s && i !== a && KB[s] && f(s));
    if (cungDung.length) loi.push(`${at}: đáp án sai ${cungDung.map(s => KB[s].ten).join(', ')} cũng "${ten}", câu có nhiều đáp án đúng (LG03)`);
    break;
  }

  // LG07: "<con vật> ăn gì" thì đáp án đúng là thức ăn của con vật đó, đáp án sai không phải.
  if (dung && / ăn gì|thích ăn|thức ăn/.test(ql)) {
    const cv = Object.entries(KB).find(([, v]) => v.nhom === 'con-vat' && ql.includes(v.ten.replace(/^con /, '')));
    if (cv) { const an = cv[1].an || []; const la = s => an.some(x => (KB[s]?.ten || '').includes(x));
      if (!la(dung)) loi.push(`${at}: ${cv[1].ten} không ăn ${KB[dung]?.ten} theo kho kiến thức (LG07)`);
      const sai = anh.filter((s, i) => s && i !== a && la(s)); if (sai.length) loi.push(`${at}: ${cv[1].ten} cũng ăn ${sai.map(s => KB[s].ten).join(', ')}, nhiều đáp án đúng (LG03)`); }
  }

  // LG10: "hạt/mầm … thành gì" thì đáp án là giai đoạn kế tiếp.
  if (dung && /thành gì|lớn lên|sẽ ra/.test(ql)) {
    const g = Object.entries(KB).filter(([, v]) => Number.isInteger(v.giai_doan_cay) && ql.includes(v.ten.split(' ').slice(-1)[0] === 'đậu' ? v.ten : v.ten.split(' ').slice(-1)[0]));
    const truoc = g.map(([, v]) => v.giai_doan_cay).filter(x => x < (KB[dung]?.giai_doan_cay ?? 99));
    if (truoc.length && KB[dung]?.giai_doan_cay !== undefined && KB[dung].giai_doan_cay !== Math.max(...truoc) + 1)
      loi.push(`${at}: trình tự lớn lên sai, sau ${g.map(([, v]) => v.ten).join('/')} là giai đoạn kế tiếp, không phải ${KB[dung].ten} (LG10)`);
  }

  // LG14: số trong câu hỏi khớp số vật ở đáp án đúng.
  const m = ql.match(/\b(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|\d+)\s+(hạt|quả|con|cái|bông|chiếc|viên|củ|giọt)/);
  if (m && a !== null && opts[a]?.n !== undefined) { const so = SO[m[1]] ?? +m[1]; if (opts[a].n !== so) loi.push(`${at}: câu nói ${so} nhưng đáp án đúng có ${opts[a].n} vật (LG14)`); }

  // LG19: lời khen phải nói đúng thứ bé vừa chọn.
  if (dung && KB[dung] && typeof it.ok === 'string' && !SINH.has(loai(dung)) && !it.ok.toLowerCase().includes(tuChinh(dung)))
    canh.push(`${at}: lời khen "${it.ok}" không nhắc ${KB[dung].ten}; agent xem lời khen có đúng sự thật không (LG19)`);
  return { loi, canh };
}

export function kiemBai(pkg) {
  const loi = [], canh = [];
  const walk = (o, w) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, w));
    if (!o || typeof o !== 'object') return;
    const id = o.activity_id || o.id || w;
    if ((o.q || o.ask) && (o.opts || o.options)) { const r = kiemCau(o, id); loi.push(...r.loi); canh.push(...r.canh); }
    for (const [k, v] of Object.entries(o)) if (k !== 'checkin') walk(v, id);
  };
  walk(pkg, pkg.lesson_id || '');
  // Mọi ảnh trong bài phải có trong kho kiến thức để máy soát được.
  const dung = new Set(); const di = o => { if (typeof o === 'string') { const s = slotOf(o); if (s) dung.add(s); } else if (o && typeof o === 'object') Object.values(o).forEach(di); }; di(pkg);
  const thieu = [...dung].filter(s => !KB[s]); if (thieu.length) loi.push(`ảnh chưa có trong kho kiến thức: ${thieu.join(', ')}`);
  return { loi: [...new Set(loi)], canh: [...new Set(canh)] };
}

// Câu mô tả ảnh trước khi vẽ (LG13, LG15, LG16, LG17).
const SO_EN = /\b(two|three|four|five|six|seven|eight|nine|ten|[2-9])\s+(small |little |tiny |round |red |green |yellow |shiny |beige |brown )*(beans?|apples?|carrots?|eggs?|flowers?|leaves|stones?|pebbles?|drops?|fish|birds?|stars?|coins?|chicks?)\b/i;
export function kiemAnh(file, slotsDem = new Set()) {
  const loi = [], canh = [];
  for (const it of file.items || []) {
    const s = String(it.slot || '').replace(/^art:/, ''); const k = KB[s]; const p = String(it.prompt || ''); const at = `${it.id || s}`;
    if (!p) { loi.push(`${at}: thiếu câu mô tả`); continue; }
    if (!k) { loi.push(`${at}: slot ${s} chưa có trong kho kiến thức (thêm vào content/kien-thuc/vat.json trước khi vẽ)`); continue; }
    if (k.nhom === 'canh') continue;
    // Con vật phải vẽ bằng kiểu vẽ chung (style), không dùng kiểu đồ vật có "no animals" (soát logic 27/11, thỏ và vịt).
    if (k.nhom === 'con-vat' && /no animals?/i.test(file.style_do_vat || '') && it.kieu !== 'style') loi.push(`${at}: ảnh con vật ${k.ten} chưa ghi "kieu": "style"; ghép kiểu đồ vật sẽ thành "không con vật" (LG15)`);
    if (!k.en.some(w => p.toLowerCase().includes(w))) loi.push(`${at}: câu mô tả không nhắc "${k.en[0]}" (${k.ten}), ảnh có thể vẽ sai vật (LG15)`);
    if (k.nhom === 'hanh-dong') { const ct = KB[k.chu_the]; if (ct && !ct.en.some(w => p.toLowerCase().includes(w))) loi.push(`${at}: ảnh hành động của ${ct.ten} nhưng câu mô tả không nhắc nhân vật (LG15)`); }
    const m = p.match(SO_EN);
    if (m && slotsDem.has(s)) loi.push(`${at}: câu mô tả ghi số lượng "${m[0]}" cho ảnh dùng để đếm; số lượng phải dựng bằng mã (LG13)`);
    else if (m) canh.push(`${at}: câu mô tả có số lượng "${m[0]}"; agent xác nhận ảnh không dùng để đếm (LG13)`);
    if (['do-vat', 'do-an', 'thuc-vat', 'thien-nhien', 'noi-chon'].includes(k.nhom) && !/no animals?|no characters|no people|only the object|nothing else/i.test(p + ' ' + ((it.kieu === 'style' ? file.style : file.style_do_vat) || '')))
      loi.push(`${at}: ảnh ${k.ten} chưa dặn "chỉ vẽ vật, không thêm con vật" (LG16, tam 27/11)`);
    const khac = Object.entries(KB).filter(([x, v]) => x !== s && x !== k.chu_the && v.nhom === 'con-vat' && v.en.some(w => new RegExp(`\\b${w}s?\\b`, 'i').test(k.en.reduce((t, x) => t.split(x).join(''), p.toLowerCase()).replace(/no animals?|no characters|no people/gi, ''))));
    if (khac.length && k.nhom !== 'con-vat') canh.push(`${at}: câu mô tả có ${khac.map(([, v]) => v.ten).join(', ')}; agent xem có phải thêm nhân vật lạ không (LG16)`);
  }
  return { loi, canh };
}

export const maBam = s => createHash('sha1').update(s).digest('hex');

// Biên bản agent: content/soat-logic/<tên>.json phải khớp mã băm bản hiện tại và không còn lỗi mở.
export async function kiemBienBan(ten, noiDung) {
  let b; try { b = JSON.parse(await readFile(path.join(ROOT, 'content/soat-logic', ten + '.json'), 'utf8')); } catch { return [`chưa có biên bản agent soát logic content/soat-logic/${ten}.json (tools/kiem-logic/AGENT.md)`]; }
  const loi = [];
  if (b.ma_bam !== maBam(noiDung)) loi.push(`biên bản ${ten} soát bản cũ (mã băm lệch); chạy lại agent soát logic`);
  const mo = (b.loi || []).filter(x => x.trang_thai === 'mo');
  if (mo.length) loi.push(`biên bản ${ten} còn ${mo.length} lỗi mở: ${mo.slice(0, 2).map(x => x.ma + ' ' + x.o).join('; ')}`);
  if (!Array.isArray(b.quy_tac_da_soat) || b.quy_tac_da_soat.length < 20) loi.push(`biên bản ${ten} chưa soát đủ 20 quy tắc LG01–LG20`);
  return loi;
}

async function slotsDem() {
  const { readdir } = await import('node:fs/promises'); const s = new Set();
  for (const f of (await readdir(path.join(ROOT, 'content/drafts'))).filter(f => /^L\d+\.json$/.test(f))) {
    const di = o => { if (Array.isArray(o)) o.forEach(di); else if (o && typeof o === 'object') { if (o.n !== undefined && slotOf(o)) s.add(slotOf(o)); const m = typeof o.e === 'string' && o.e.match(/^art:([a-z0-9-]+)\*\d+/); if (m) s.add(m[1]); Object.values(o).forEach(di); } else if (typeof o === 'string') { const m = o.match(/^art:([a-z0-9-]+)\*\d+/); if (m) s.add(m[1]); } };
    di(JSON.parse(await readFile(path.join(ROOT, 'content/drafts', f), 'utf8')));
  }
  return s;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [cmd, arg] = process.argv.slice(2);
  let r;
  if (cmd === 'bai') { const f = arg.endsWith('.json') ? arg : path.join(ROOT, 'content/drafts', arg + '.json'); r = kiemBai(JSON.parse(await readFile(f, 'utf8'))); }
  else if (cmd === 'anh') r = kiemAnh(JSON.parse(await readFile(path.resolve(arg), 'utf8')), await slotsDem());
  else if (cmd === 'bien-ban') { const f = arg.startsWith('anh-') ? path.join(ROOT, 'tools/lab', arg + '.json') : path.join(ROOT, 'content/drafts', arg + '.json'); r = { loi: await kiemBienBan(arg, await readFile(f, 'utf8')), canh: [] }; }
  else { console.log('Dùng: node tools/kiem-logic.mjs bai Lxxx | anh <tệp> | bien-ban <tên>'); process.exit(2); }
  for (const x of r.loi) console.log('LỖI     ' + x);
  for (const x of r.canh) console.log('CẢNH BÁO ' + x);
  console.log(`\n${r.loi.length} lỗi, ${r.canh.length} cảnh báo`);
  process.exit(r.loi.length ? 1 : 0);
}

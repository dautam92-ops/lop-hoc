// Tiếng Anh đọc bằng giọng bản địa (tam 28/11 06:40): "phát âm tiếng Anh bằng ngữ điệu tiếng Việt là lỗi ngớ ngẩn".
// Phép thử: (1) không câu nói nào trộn từ tiếng Anh vào câu tiếng Việt (giọng Việt sẽ đọc sai từ tiếng Anh);
//            tách thành câu riêng: ["Hello!", "Đúng rồi! Mono vẫy tay chào bé."]
// (2) câu toàn tiếng Anh phải có tệp giọng tạo bằng giọng tiếng Anh bản địa (en-*), không phải giọng Việt.
// (3) từ tiếng Anh đang học (trường word) hiện chữ to trên màn (engine E01 vẽ .en-word).
// Dùng: node tools/kiem-tieng-anh.mjs M001
import { readFile } from 'node:fs/promises';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VI = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const BASE = ['hello', 'goodbye', 'bye', 'good', 'job', 'great', 'thank', 'thanks', 'please', 'sorry', 'yes', 'okay', 'well', 'done', 'chick', 'grandma', 'apple', 'banana', 'english', 'red', 'blue', 'green', 'yellow', 'one', 'two', 'three', 'four', 'five', 'cat', 'dog', 'bird', 'fish', 'duck', 'frog', 'bean', 'sun', 'rain', 'star'];
const BO_QUA = new Set(['mono', 'no', 'an', 'ten', 'me', 'to', 'bo', 'ba', 'ca', 'con', 'cho', 'tom', 'mi', 'ho', 'la', 'ma']); // tên riêng và chữ trùng tiếng Việt không dấu
const NOI = new Set(['q', 'ok', 'no', 'intro', 'done', 'end', 'word', 'task', 'say', 'again', 'more', 'empty', 'look', 'story', 'after', 'loi', 'luSays', 'inn', 'out', 'reply', 'hint']);
export async function kiemTiengAnh(id) {
  const pkg = JSON.parse(await readFile(path.join(ROOT, 'content/drafts', id + '.json'), 'utf8'));
  let hc = null; try { hc = JSON.parse(await readFile(path.join(ROOT, 'content/hoc-cung-con', id + '.json'), 'utf8')); } catch {}
  const vat = JSON.parse(await readFile(path.join(ROOT, 'content/kien-thuc/vat.json'), 'utf8')).vat;
  const reg = JSON.parse(await readFile(path.join(ROOT, 'content/audio/registry.json'), 'utf8'));
  const LEX = new Set([...BASE, ...Object.values(vat).flatMap(v => (v.en || []).flatMap(w => w.toLowerCase().split(/\s+/)))].filter(w => w.length > 2 && !BO_QUA.has(w)));
  const lines = new Map(); // câu → vị trí
  const walk = (o, at, k) => { if (typeof o === 'string') { if (NOI.has(k)) lines.set(o, at); } else if (Array.isArray(o)) o.forEach(x => walk(x, at, k)); else if (o && typeof o === 'object') { const a = o.activity_id || at; for (const [kk, v] of Object.entries(o)) walk(v, a, kk); } };
  walk(pkg, id); if (hc) walk(hc, id + ' học cùng con');
  const voice = Object.fromEntries((reg.entries || []).map(e => [e.key, e.voice || '']));
  const loi = [];
  for (const [t, at] of lines) {
    if (t.startsWith('__') || t.includes('{')) continue;
    const tok = t.toLowerCase().match(/[a-z]+/g) || [];
    const en = tok.filter(w => LEX.has(w));
    if (VI.test(t) && en.length) loi.push(`${at}: câu "${t}" trộn tiếng Anh (${[...new Set(en)].join(', ')}) vào câu tiếng Việt; tách từ tiếng Anh thành câu riêng đọc giọng bản địa`);
    else if (!VI.test(t) && en.length && reg.clips[t] && !/^en-/.test(voice[t] || '')) loi.push(`${at}: câu tiếng Anh "${t}" đang đọc bằng giọng ${voice[t] || 'không rõ'}, cần giọng tiếng Anh bản địa`);
  }
  // (4) Bé nói theo (tam 28/11 06:53 "Mono nói quả chuối đây bằng tiếng Việt thì bé sao bắt chước nói banana được"):
  //     câu cuối bé nghe trước khi tới lượt nói theo phải là chính từ tiếng Anh, giọng bản xứ.
  const items = (pkg.stages || []).flatMap(st => st.activities).flatMap(a => (a.items || []).map((it, k) => [a.activity_id + ' câu ' + (k + 1), it]));
  for (const [at, it] of items) {
    const q = [...Array(it.word ? (it.word_times ?? 1) : 0).fill(it.word), ...[].concat(it.q || [])].filter(t => t && !t.startsWith('__'));
    if (!q.some(t => /nói theo/i.test(t))) continue;
    const cuoi = q[q.length - 1];
    if (VI.test(cuoi) || !(cuoi.toLowerCase().match(/[a-z]+/g) || []).some(w => LEX.has(w) || w === String(it.word || '').toLowerCase())) loi.push(`${at}: bé được mời nói theo nhưng câu cuối bé nghe là "${cuoi}", phải là từ tiếng Anh do giọng bản xứ đọc`);
  }
  return loi;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const loi = await kiemTiengAnh(process.argv[2] || 'M001');
  console.log(loi.length ? loi.join('\n') : 'Tiếng Anh: đạt'); process.exit(loi.length ? 1 : 0);
}

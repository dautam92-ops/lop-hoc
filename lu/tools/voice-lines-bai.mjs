// Danh sách câu cần giọng đọc cho MỘT buổi nháp (vd L001): ghi content/audio/can-tao.json (chỉ buổi đó) để tools/tao_giong_doc.py tạo trên máy.
// Chạy: node tools/voice-lines-bai.mjs L001
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { ENGINES } from '../engines/index.js';
import { END_PRAISE } from '../core/runner.js';
import { normalizeLesson } from '../core/session.js';
import { OK_VI } from '../engines/common.js';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const J = async p => JSON.parse(await readFile(path.join(ROOT, p), 'utf8'));
const id = (process.argv[2] || 'L001').replace(/[^\w-]/g, '');
const audio = await J('content/audio/registry.json');
const p = normalizeLesson(await J(`content/drafts/${id}.json`));
const L = new Set();
// Học cùng con (Q4): lời Mono mời bố mẹ và lời cuối buổi tắt máy cũng cần giọng
const H = p.hoc_cung_con || await J(`content/hoc-cung-con/${id}.json`).catch(() => null);
[...(H?.moi_bo_me || []).map(m => m.loi), H?.cuoi_buoi?.loi].forEach(t => t && L.add(t));
[...(p.intro || []), ...(p.end || []), p.checkin?.q, ...(p.checkin?.opts || []).map(o => o.reply), /* quy tắc 40: không đọc đáp án hỏi cảm xúc */
 p.hub?.q, p.hub?.again, ...(p.stages || []).map(st => st.done), ...(p.stages || []).flatMap(st => st.intro || []), ...END_PRAISE, ...OK_VI].forEach(t => t && L.add(t));
for (const a of p.activities) { ENGINES[a.engine].lines(a).forEach(t => L.add(t)); if (a.story) a.story.forEach(t => L.add(t)); if (a.after) L.add(a.after);
  (a.props || []).forEach(x => { x.say && L.add(x.say); x.en && L.add(x.en); }); if (a.done) L.add(a.done); }
const all = [...L].filter(t => t && !t.startsWith('__') && !t.includes('${') && !t.includes('{'));
const need = all.filter(t => !audio.clips[t]);
// Từ tiếng Anh đọc chậm để bé nói theo (màn học từ: câu đúng bằng trường word, không dấu câu) → giọng bản xứ chậm
const CHAM = new Set(p.activities.flatMap(a => (a.items || []).filter(it => it.word).map(it => it.word)));
const VI = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const out = { format: 'lu-voice-todo', lesson: id, at: new Date().toISOString(), lines: need.map(t => ({ text: t, lang: VI.test(t) || /^(Vui|Buồn|Mệt)$/.test(t) ? 'vi' : CHAM.has(t) ? 'en-cham' : 'en' })) };
await writeFile(path.join(ROOT, 'content/audio/can-tao.json'), JSON.stringify(out, null, 1));
console.log(`${id}: ${all.length} câu, đã có giọng ${all.length - need.length}, cần tạo ${need.length} → content/audio/can-tao.json`);

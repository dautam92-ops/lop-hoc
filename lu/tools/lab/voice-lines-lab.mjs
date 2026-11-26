// Danh sách câu cần giọng Hoài My cho Phòng mẫu: ghi content/lab/can-tao-giong.json để tools/tao_giong_doc.py tạo trên máy 24H.
// Chạy: node tools/lab/voice-lines-lab.mjs   rồi trên máy 24H: python tools/tao_giong_doc.py content/lab/can-tao-giong.json
import { readFile, writeFile } from 'node:fs/promises';
import { ENGINES } from '../../engines/index.js';
import { OK_VI } from '../../engines/common.js';
const J = async p => JSON.parse(await readFile(new URL('../../' + p, import.meta.url), 'utf8'));
const D = await J('content/lab/samples.json'), audio = await J('content/audio/registry.json');
const L = new Set(OK_VI.concat(['Bé thử chạm vào chỗ đang sáng nhé.', 'Bé đi theo lối không có tường nhé.']));
for (const s of D.samples) for (const a of Object.values(s.levels)) ENGINES[a.engine].lines(a).forEach(t => L.add(t));
const all = [...L].filter(t => t && !t.startsWith('__') && !t.includes('{'));
const need = all.filter(t => !audio.clips[t]);
const VI = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
await writeFile(new URL('../../content/lab/can-tao-giong.json', import.meta.url), JSON.stringify({ format: 'lu-voice-todo', lesson: 'PHONG-MAU', at: new Date().toISOString(), lines: need.map(t => ({ text: t, lang: VI.test(t) ? 'vi' : 'en' })) }, null, 1));
console.log(`Phòng mẫu: ${all.length} câu, đã có giọng ${all.length - need.length}, cần tạo ${need.length} → content/lab/can-tao-giong.json`);

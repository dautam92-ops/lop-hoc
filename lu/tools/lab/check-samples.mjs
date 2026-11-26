// Kiểm tra nội dung Phòng mẫu không cần trình duyệt: validate + generate/verify 30 seed cho mỗi hoạt động, đủ lời thoại.
// Chạy: node tools/lab/check-samples.mjs
import { readFileSync } from 'node:fs';
import { ENGINES } from '../../engines/index.js';
import { makeRng } from '../../core/lu-core.js';
const D = JSON.parse(readFileSync(new URL('../../content/lab/samples.json', import.meta.url)));
let bad = 0, n = 0;
for (const s of D.samples) for (const [age, act] of Object.entries(s.levels)) {
  n++; const E = ENGINES[act.engine]; const errs = [];
  if (!E) errs.push('không có engine ' + act.engine);
  else {
    errs.push(...E.validate(act));
    for (let seed = 1; seed <= 30 && !errs.length; seed++) { try { const v = E.generate(act, makeRng(seed)); errs.push(...(E.verify ? E.verify(act, v) : [])); } catch (e) { errs.push(`seed ${seed}: ${e.message}`); } }
    try { const L = E.lines(act); if (!L.length) errs.push('không có lời thoại'); } catch (e) { errs.push('lines: ' + e.message); }
  }
  if (errs.length) { bad++; console.log(`LỖI ${act.activity_id}:\n  ` + [...new Set(errs)].slice(0, 6).join('\n  ')); }
}
console.log(`${n - bad}/${n} hoạt động đạt.`); process.exit(bad ? 1 : 0);

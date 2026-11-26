import { readFile } from 'node:fs/promises';
const R=new URL('../', import.meta.url).pathname;
const { lintLesson } = await import(R+'core/lint.js'); const { estimateMinutes, normalizeLesson } = await import(R+'core/session.js');
const { ENGINES } = await import(R+'engines/index.js'); const { makeRng } = await import(R+'core/lu-core.js');
const id = process.argv[2] || 'L001';
const pkg = JSON.parse(await readFile(R+`content/drafts/${id}.json`,'utf8'));
const skills = (JSON.parse(await readFile(R+'content/skills.json','utf8'))).skills;
const sk = Array.isArray(skills) ? Object.fromEntries(skills.map(s=>[s.skill_id,s])) : skills;
const r = lintLesson(pkg, sk); console.log('lint', JSON.stringify(r, null, 1));
const e = estimateMinutes(pkg); console.log('phút', e.minutes, 'chặng', e.stages, 'lượt', e.activities); e.per.forEach(x=>console.log(' ', x.id, x.step, x.sec+'s'));
const p = normalizeLesson(pkg); let bad = 0;
for (const a of p.activities) { const E = ENGINES[a.engine]; const v = E.validate(a); if (v.length) { bad++; console.log('validate', v); }
  for (let s=1;s<=100;s++){ const vv=E.verify(a,E.generate(a,makeRng(s))); if(vv.length){bad++;console.log('verify',a.activity_id,vv[0]);break;} } }
console.log('lỗi engine', bad);

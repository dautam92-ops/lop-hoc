const fs=require('fs');const h=fs.readFileSync(process.argv[2],'utf8');
const src=h.slice(h.indexOf('const LESSON ='),h.indexOf('/* ================= ÂM THANH'));
const LESSON=eval(src.replace('const LESSON =','(').replace(/;\s*$/,'')+')');
const set=new Set(["Hello! Let's learn English!"]);
for(const k of Object.values(LESSON.kids))for(const a of k.acts){
 if(a.type==='scramble')a.rounds.forEach(r=>set.add(r.w));
 if(a.type==='choice'&&a.en)a.rounds.forEach(r=>{
   if(r.say)set.add(r.say);if(r.okSay)set.add(r.okSay);
   if(a.sayOpts)r.opts.forEach(o=>typeof o==='string'&&set.add(o));
   const vi=/[ăâđêôơưàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]/i.test(r.q)||r.q.startsWith('Nghe')||r.q.startsWith('Chạm');
   if(!vi)set.add(r.q);
 });}
if(LESSON.parent)(LESSON.parent.cards||[]).forEach(c=>{if(c.en){set.add(c.front);set.add(c.back)}});
for(const k of Object.values(LESSON.kids))for(const a of k.acts)if(a.type==='explore')a.rounds.forEach(r=>r.en&&set.add(r.en));
console.log(JSON.stringify([...set]));

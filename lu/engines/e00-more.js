// E00 – Kể chuyện / giảng bài bằng tranh: chế độ "teach" – Lu giảng kiến thức về một sự vật theo quy trình V của chỉ thị:
//   1 khơi gợi tò mò (tranh bị che, Lu đố)  2 giới thiệu  3 minh họa trực quan (tranh lớn)  4 làm mẫu: Lu chỉ từng bộ phận
//   5 bé tự chạm khám phá từng bộ phận (nghe tên, công dụng, từ tiếng Anh)  6 bé thực hành: Lu hỏi, bé chạm đúng bộ phận
//   (Củng cố và vận dụng là các hoạt động E01/E10 nối tiếp trong cùng mẫu.)
import { vis, esc, sleep, setAuto, req } from './kit.js';
import { bigHen } from '../ui/art-lab.js';
export const MORE = new Set(['teach']);
const BIG = { hen: bigHen };
export function validate(act) {
  const e = req(act, ['skill_id', 'title', 'big', 'parts', 'intro', 'check', 'done']);
  if (!BIG[act.big]) e.push(`${act.activity_id}: chưa có tranh lớn "${act.big}"`);
  (act.parts || []).forEach(p => { if (!p.say || !p.name) e.push(`${act.activity_id}: bộ phận ${p.id} cần tên và lời giảng`); });
  (act.check?.ask || []).forEach(id => { if (!(act.parts || []).some(p => p.id === id)) e.push(`${act.activity_id}: câu hỏi về bộ phận không có "${id}"`); });
  return e;
}
export const generate = (act, rng) => ({ rounds: [{ ask: rng.shuffle(act.check.ask) }] });
export const verify = () => [];
export const lines = act => [...(act.hook || []), ...act.intro, act.explore, act.check.q && act.parts.map(p => act.check.q.replace('{name}', p.name)), act.check.no, act.done, ...act.parts.flatMap(p => [p.say, p.en])].flat().filter(Boolean);
export async function mount(ctx, act, v) {
  const { ui, voice } = ctx; const P = act.parts;
  ui.scene(act.title, `<div class="teach${act.hook ? ' hooked' : ''}">${BIG[act.big]()}<div class="tc-cover"><span>?</span></div><div class="tc-label"></div></div>`);
  const T = ui.stage.querySelector('.teach'), label = T.querySelector('.tc-label');
  const partEl = id => T.querySelector(`[data-part="${id}"]`);
  const on = id => { T.querySelectorAll('.part').forEach(x => x.classList.toggle('on', x.dataset.part === id)); const p = P.find(x => x.id === id); label.textContent = p ? p.name + (p.en ? ' · ' + p.en : '') : ''; };
  // 1–2: khơi gợi tò mò rồi mở tranh
  if (act.hook) { await voice.say(act.hook); T.classList.remove('hooked'); await sleep(ctx, 500); }
  await voice.say(act.intro);
  // 4: Lu làm mẫu với bộ phận đầu tiên
  on(P[0].id); await voice.say([P[0].say, P[0].en].filter(Boolean)); on('');
  // 5: bé tự chạm các bộ phận còn lại
  await new Promise(res => {
    const seen = new Set([P[0].id]); const left = () => P.filter(p => !seen.has(p.id));
    const mark = () => { const n = left()[0]; T.querySelectorAll('.part').forEach(x => x.classList.toggle('glow', n && x.dataset.part === n.id)); if (n) ctx.test.mark(partEl(n.id)); };
    T.onclick = e => { const g = e.target.closest('.part'); if (!g || voice.busy) return; const p = P.find(x => x.id === g.dataset.part); if (!p) return; seen.add(p.id); on(p.id);
      voice.say([p.say, p.en].filter(Boolean)).then(() => { mark(); if (!left().length) { T.onclick = null; res(); } }); };
    setAuto(ctx, async () => { for (const p of left()) { partEl(p.id).dispatchEvent(new MouseEvent('click', { bubbles: true })); await sleep(ctx, 80); while (voice.busy) await sleep(ctx, 60); } }, null);
    mark(); voice.say([act.explore || 'Bé chạm vào từng chỗ đang sáng để nghe Mono kể nhé.']);
  });
  ctx.record({ skill_id: act.skill_id, kind: 'participation', correct: true, first_try: true, tries: 1, hints: 0, phase: 'kham-pha' }); ctx.tick?.();
  // 6: bé thực hành – Lu hỏi, bé chạm đúng bộ phận
  on(''); T.classList.add('quiz');
  for (const id of v.rounds[0].ask) {
    const p = P.find(x => x.id === id); let wrong = 0;
    await new Promise(res => {
      const q = act.check.q.replace('{name}', p.name);
      ctx.test.mark(partEl(id));
      T.onclick = e => { const g = e.target.closest('.part'); if (!g || voice.busy) return;
        if (g.dataset.part === id) { T.onclick = null; on(id); ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0 }); voice.say(['__jingle', p.ok || `Đúng rồi, đây là ${p.name}.`]).then(res); }
        else { wrong++; g.classList.add('shake'); setTimeout(() => g.classList.remove('shake'), 400); voice.say(['__boing', act.check.no || q]); if (wrong >= 2) partEl(id).classList.add('glow'); } };
      setAuto(ctx, () => partEl(id).dispatchEvent(new MouseEvent('click', { bubbles: true })), () => T.querySelector(`.part:not([data-part="${id}"])`).dispatchEvent(new MouseEvent('click', { bubbles: true })));
      voice.say([q]);
    });
    T.querySelectorAll('.part').forEach(x => x.classList.remove('glow')); ctx.tick?.();
  }
  await voice.say([act.done]);
}

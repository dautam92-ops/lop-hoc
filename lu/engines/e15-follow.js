// E15 – Làm theo (tối thiểu, đủ cho bài mẫu 1, 2): hít thở cùng Lu, nghe rồi nói theo, việc nhỏ ngoài màn hình.
// Chỉ ghi "đã tham gia" (kind: participation). Không chấm, không khóa bài (S10-R03, D28).
import { luArt, esc } from '../core/lu-core.js';
import { vis } from '../ui/art.js';
import { need } from './common.js';

export const id = 'E15', version = '1.0.0', name = 'Làm theo';

export function validate(act) {
  const e = need(act, ['mode', 'title']);
  if (act.mode === 'breath') e.push(...need(act, ['inn', 'out', 'done']));
  if (act.mode === 'say') e.push(...need(act, ['skill_id', 'luSays', 'word']));
  if (act.mode === 'do') e.push(...need(act, ['skill_id', 'task']));
  return e;
}
export const generate = act => ({ rounds: [{}] });
export const verify = () => [];
export const lines = act => [...(act.intro || []), act.inn, act.out, act.done, act.luSays, act.task, /^EN\./.test(act.skill_id || '') ? null : 'Bé giỏi lắm!'].filter(Boolean);

export function mount(ctx, act) {
  const { ui, voice } = ctx;
  if (act.mode === 'breath') return new Promise(done => {
    ui.scene(act.title, `<div class="flower">${vis('art:hoa')}</div>`);
    const fl = ui.stage.querySelector('.flower'); let n = 0; const wait = ms => new Promise(r => setTimeout(r, ctx.fast ? 0 : ms));
    const cyc = async () => {
      if (n++ >= (act.times || 2)) { fl.className = 'flower'; await voice.say(['__jingle', act.done]); if (act.skill_id) ctx.record({ skill_id: act.skill_id, kind: 'participation', correct: true, first_try: true, tries: 1, hints: 0 }); return done(); }
      fl.className = 'flower in'; await voice.say(act.inn); await wait(1500);
      fl.className = 'flower out'; fl.innerHTML = vis('art:nen'); await voice.say(act.out); await wait(1200); fl.innerHTML = vis('art:hoa'); cyc();
    };
    voice.say(act.intro || []).then(cyc);
  });
  return new Promise(done => {
    const say = act.mode === 'say';
    ui.scene(act.title, say ? `<button class="lu-btn">${luArt('vay-tay')}</button><div class="title big-word">${esc(act.word)}</div>` : `<div class="story">${act.show ? vis(act.show) : luArt(act.lu || (act.mode === 'breath' ? 'binh-tinh' : 'nhay'))}</div>`);
    const box = ui.answers(act.label || 'Bé làm xong thì chạm nút', `<button class="big-btn done-btn">${esc(act.button || 'Xong rồi!')}</button>`);
    ctx.test.mark(box.querySelector('.done-btn'));
    if (say) ui.stage.querySelector('.lu-btn').onclick = () => { if (!voice.busy) voice.speak([act.luSays]); };
    box.querySelector('.done-btn').onclick = () => { if (voice.busy) return; ctx.record({ skill_id: act.skill_id, kind: 'participation', correct: true, first_try: true, tries: 1, hints: 0 }); voice.speak(/^EN\./.test(act.skill_id || '') ? ['__ok'] : ['__jingle', 'Bé giỏi lắm!']).then(done); };
    if (say) voice.say(act.intro || []).then(() => voice.speak([act.luSays])); else voice.say([...(act.intro || []), act.task]);
  });
}

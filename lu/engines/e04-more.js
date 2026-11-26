// E04 – Sắp xếp thứ tự: chế độ "cards" – xếp tranh theo trình tự (truyện, vòng đời, việc trong ngày).
// Bé chạm tranh theo đúng thứ tự, tranh bay vào ô 1, 2, 3…; chạm sai: tranh rung, âm nhẹ, không giải thích dài.
import { vis, esc, sleep, setAuto, req } from './kit.js';
export const MORE = new Set(['cards']);
export function validate(act) {
  const e = req(act, ['skill_id', 'title', 'sets', 'done']);
  (act.sets || []).forEach((s, k) => { if (s.items.length < 3 || s.items.length > 5) e.push(`${act.activity_id} bộ ${k + 1}: cần 3–5 tranh`); if (s.items.some(i => !i.say)) e.push(`${act.activity_id} bộ ${k + 1}: mỗi tranh cần lời kể`); });
  return e;
}
export const generate = (act, rng) => ({ rounds: rng.sample(act.sets.map((s, i) => i), act.rounds || act.sets.length).map(i => { let o; do { o = rng.shuffle(act.sets[i].items.map((x, j) => j)); } while (o.every((x, j) => x === j)); return { i, order: o }; }) });
export const verify = (act, v) => v.rounds.flatMap((r, k) => r.order.every((x, j) => x === j) ? [`${act.activity_id} vòng ${k + 1}: tranh chưa được xáo`] : []);
export const lines = act => [...(act.intro || []), act.done, act.again, ...act.sets.flatMap(s => [s.q, s.ok, ...s.items.map(i => i.say)])].filter(Boolean);
export async function mount(ctx, act, v) { for (let r = 0; r < v.rounds.length; r++) { await cards(ctx, act, v.rounds[r], r === 0); ctx.tick?.(); } }
function cards(ctx, act, R, first) {
  const { ui, voice } = ctx; const S = act.sets[R.i]; let k = 0, wrong = 0;
  return new Promise(done => {
    ui.scene(S.title || act.title, `<div class="cd-slots">${S.items.map((it, j) => `<div class="cd-slot" data-j="${j}"><b>${j + 1}</b></div>`).join('')}</div>`);
    const box = ui.answers(act.label || 'Bé chạm tranh theo thứ tự', R.order.map(j => `<button class="opt cd-card" data-j="${j}">${vis(S.items[j].e)}</button>`).join(''));
    const mark = () => ctx.test.mark(box.querySelector(`.cd-card[data-j="${k}"]`));
    const pick = b => { const j = +b.dataset.j;
      if (j === k) { const slot = ui.stage.querySelector(`.cd-slot[data-j="${k}"]`); slot.innerHTML = `<b>${k + 1}</b>${vis(S.items[j].e)}`; slot.classList.add('filled'); b.remove(); k++;
        if (k >= S.items.length) { ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0 }); voice.say(['__jingle', ...(act.retell === false ? [] : S.items.map(i => i.say)), S.ok || act.done].filter(Boolean)).then(done); }
        else { voice.speak([S.items[j].say]); mark(); } }
      else { wrong++; ui.shake(b); voice.speak(['__boing']); if (wrong >= 2) box.querySelector(`.cd-card[data-j="${k}"]`)?.classList.add('hint'); } };
    box.addEventListener('click', e => { const b = e.target.closest('.cd-card'); if (b && !voice.busy) pick(b); });
    setAuto(ctx, async () => { while (k < S.items.length) { const b = box.querySelector(`.cd-card[data-j="${k}"]`); if (!b) break; pick(b); await sleep(ctx, 60); while (voice.busy) await sleep(ctx, 50); } },
      () => { const b = box.querySelector(`.cd-card:not([data-j="${k}"])`); if (b) pick(b); });
    mark();
    voice.say(first ? [...(act.intro || []), S.q].filter(Boolean) : [act.again || S.q].filter(Boolean));
  });
}

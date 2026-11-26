// E05 – Lật thẻ trí nhớ: lật hai thẻ, giống nhau là được một đôi.
// Quy tắc tam 26/11: chỉ giải thích lúc đầu. Lật sai: chỉ úp thẻ lại, KHÔNG nói gì. Lật đúng một đôi: chỉ âm báo đúng.
// Xong cả bài mới khen (act.done).
// Cặp liên quan (5–6 tuổi): act.match = [[a, b], …] – hai thẻ khác hình nhưng là một đôi (số 3 với 3 chấm, gà mẹ với gà con).
import { need, vis, okVi, OK_VI } from './common.js';

export const id = 'E05', version = '1.0.0', name = 'Lật thẻ trí nhớ';

export function validate(act) {
  const e = need(act, ['skill_id', 'title', act.match ? 'match' : 'pool', 'pairs', 'done']);
  if ((act.match || act.pool) && act.pairs > (act.match || act.pool).length) e.push(`${act.activity_id}: không đủ hình cho ${act.pairs} đôi`);
  if (act.pairs > 8) e.push(`${act.activity_id}: quá 8 đôi, quá khó với 4–6 tuổi`);
  return e;
}
export function generate(act, rng) {
  if (act.match) { const pick = rng.sample(act.match.map((m, i) => i), act.pairs); const cards = rng.shuffle(pick.flatMap(i => [[act.match[i][0], i], [act.match[i][1], i]])); return { rounds: [{ cards: cards.map(c => c[0]), keys: cards.map(c => c[1]) }] }; }
  const pick = rng.sample(act.pool, act.pairs); return { rounds: [{ cards: rng.shuffle(pick.concat(pick)) }] };
}
const keyOf = (v, i) => v.rounds[0].keys ? v.rounds[0].keys[i] : v.rounds[0].cards[i];
export function verify(act, v) {
  const e = []; const c = v.rounds[0].cards.map((x, i) => keyOf(v, i)); const cnt = {};
  c.forEach(x => cnt[x] = (cnt[x] || 0) + 1);
  if (Object.values(cnt).some(n => n !== 2)) e.push(`${act.activity_id}: có thẻ không thành đôi`);
  if (c.length !== act.pairs * 2) e.push(`${act.activity_id}: sai số thẻ`);
  return e;
}
export const lines = act => [...(act.intro || []), act.done].filter(Boolean);

export function mount(ctx, act, v) {
  const { ui, voice } = ctx; const cards = v.rounds[0].cards; let open = [], found = 0, misses = 0, lock = false;
  return new Promise(done => {
    ui.scene(act.title, '');
    const box = ui.answers(act.label || 'Chạm để lật thẻ', cards.map((x, i) => `<button class="opt card" data-i="${i}" aria-label="thẻ ${i + 1}"><span class="back" aria-hidden="true"></span><span class="front">${vis(x)}</span></button>`).join(''));
    const markNext = () => { const rest = [...box.querySelectorAll('.card:not(.right)')]; const a = rest[0]; if (!a) return; const b = rest.find(x => x !== a && keyOf(v, +x.dataset.i) === keyOf(v, +a.dataset.i)); ctx.test.mark([a, b]); };
    markNext();
    box.addEventListener('click', e => {
      const b = e.target.closest('.card'); if (!b || voice.busy || lock || b.classList.contains('up') || open.length >= 2) return;
      b.classList.add('up'); open.push(b);
      if (open.length < 2) return;
      const [x, y] = open;
      if (keyOf(v, +x.dataset.i) === keyOf(v, +y.dataset.i)) {
        open = []; found++; x.classList.add('right'); y.classList.add('right');
        if (found === act.pairs) { ctx.record({ skill_id: act.skill_id, correct: true, first_try: misses <= (act.free_misses ?? 3), tries: misses + 1, hints: 0 }); voice.say(['__jingle', act.done]).then(done); }
        else { voice.speak(['__jingle']); markNext(); }
      } else {
        misses++; lock = true;
        setTimeout(() => { x.classList.remove('up'); y.classList.remove('up'); open = []; lock = false; }, ctx.fast ? 0 : 1100);
      }
    });
    voice.say(act.intro);
  });
}

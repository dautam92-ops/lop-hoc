// E04 – Sắp xếp thứ tự.
//   pattern : dãy quy luật hiện thành MỘT hàng, ô "?" nằm trong dãy, chọn hình điền vào (S02-R10)
//   order   : chạm các nhóm vật theo thứ tự từ ít đến nhiều
import { fill, esc } from '../core/lu-core.js';
import { optHTML, verifyChoice, need, onTap, vis, okVi, OK_VI, groupHTML } from './common.js';

export const id = 'E04', version = '1.0.0', name = 'Sắp xếp thứ tự';

export function validate(act) {
  const e = need(act, ['mode', 'skill_id', 'title', 'no']);
  if (act.mode === 'pattern') { e.push(...need(act, ['pool', 'patterns', 'ok'])); if ((act.pool || []).length < 3) e.push(`${act.activity_id}: pool cần ít nhất 3 hình`); }
  if (act.mode === 'order') { e.push(...need(act, [act.object ? 'object' : 'emoji', 'max', 'ok'])); if (act.max > 10) e.push(`${act.activity_id}: số vượt phạm vi 10`); }
  return e;
}

export function generate(act, rng) {
  const rounds = [];
  for (let r = 0; r < (act.rounds || 3); r++) {
    if (act.mode === 'pattern') {
      const pat = rng.pick(act.patterns); const letters = [...new Set(pat)];
      const units = rng.sample(act.pool.map((x, i) => i), letters.length);
      const map = Object.fromEntries(letters.map((l, i) => [l, units[i]]));
      const len = Math.max(act.length || 6, pat.length * 2);
      const seq = Array.from({ length: len + 1 }, (_, i) => map[pat[i % pat.length]]);
      const ans = seq[len];
      const others = rng.sample(act.pool.map((x, i) => i).filter(i => i !== ans), 2);
      const opts = rng.shuffle([ans, ...others]);
      rounds.push({ pat, units, seq: seq.slice(0, len), opts, a: opts.indexOf(ans) });
    } else {
      const k = act.groups || 3; const nums = rng.sample(Array.from({ length: act.max }, (_, i) => i + 1), k);
      rounds.push({ nums });
    }
  }
  return { rounds };
}

export function verify(act, v) {
  const e = [];
  v.rounds.forEach((r, k) => {
    const where = `${act.activity_id} vòng ${k + 1}`;
    if (act.mode === 'pattern') {
      e.push(...verifyChoice(r.opts.map(i => ({ e: act.pool[i].e })), r.a, where));
      // đáp án phải đúng là phần tử tiếp theo của quy luật
      const next = r.units[[...new Set(r.pat)].indexOf(r.pat[r.seq.length % r.pat.length])];
      if (r.opts[r.a] !== next) e.push(`${where}: đáp án không khớp quy luật`);
      if (r.seq.length < r.pat.length * 2) e.push(`${where}: dãy chưa lặp đủ 2 lần`);
    } else {
      if (new Set(r.nums).size !== r.nums.length) e.push(`${where}: hai nhóm bằng nhau`);
      if (r.nums.some(n => n < 1 || n > act.max)) e.push(`${where}: số ngoài phạm vi`);
    }
  });
  return e;
}

const seqWords = (act, r) => [...new Set(r.pat)].map(l => act.pool[r.units[[...new Set(r.pat)].indexOf(l)]].name).join(', ');
export function lines(act) { return [...(act.intro || []), act.q, act.no, ...OK_VI].filter(Boolean); }

export async function mount(ctx, act, v) { for (let r = 0; r < v.rounds.length; r++) { await (act.mode === 'pattern' ? pattern : order)(ctx, act, v.rounds[r], r === 0); ctx.tick?.(); } }

function pattern(ctx, act, R, first) {
  const { ui, voice } = ctx; let tries = 0, hints = 0;
  return new Promise(done => {
    ui.scene(act.title, `<div class="seq" style="--n:${R.seq.length + 1}">${R.seq.map(i => `<span class="cell">${vis(act.pool[i].e)}</span>`).join('')}<span class="cell q">?</span></div>`);
    const box = ui.answers(act.label || 'Bé chọn hình tiếp theo', R.opts.map((pi, i) => optHTML({ e: act.pool[pi].e }, i, 'face')).join(''));
    ctx.test.mark(box.querySelector(`[data-i="${R.a}"]`));
    onTap(box, '.opt', voice, b => {
      if (+b.dataset.i === R.a) {
        b.classList.add('right'); ui.stage.querySelector('.cell.q').innerHTML = vis(act.pool[R.opts[R.a]].e); ui.stage.querySelector('.cell.q').classList.add('ok');
        ctx.record({ skill_id: act.skill_id, correct: true, first_try: tries === 0, tries: tries + 1, hints });
        voice.say(['__jingle', fill(act.ok, { seq: seqWords(act, R) })]).then(done);
      } else { tries++; ui.shake(b); if (tries === 2) { hints = 1; box.querySelector(`[data-i="${R.a}"]`).classList.add('hint'); } voice.say(['__boing', act.no]); }
    });
    voice.say(first ? [...(act.intro || []), act.q] : [act.q]);
  });
}

function order(ctx, act, R, first) {
  const { ui, voice } = ctx; let tries = 0, step = 0; const sorted = R.nums.slice().sort((a, b) => a - b);
  return new Promise(done => {
    ui.scene(act.title, '');
    const box = ui.answers(act.label || 'Chạm từ ít đến nhiều', R.nums.map((n, i) => `<button class="opt plate" data-i="${i}" aria-label="nhóm ${i + 1}">${act.object ? groupHTML(act.object, n) : esc(act.emoji.repeat(n))}</button>`).join(''));
    const mark = () => ctx.test.mark(box.querySelector(`[data-i="${R.nums.indexOf(sorted[step])}"]`));
    mark();
    onTap(box, '.opt', voice, b => {
      if (b.classList.contains('right')) return;
      if (R.nums[+b.dataset.i] === sorted[step]) {
        b.classList.add('right'); b.insertAdjacentHTML('beforeend', `<span class="badge">${step + 1}</span>`); step++;
        if (step === sorted.length) { ctx.record({ skill_id: act.skill_id, correct: true, first_try: tries === 0, tries: tries + 1, hints: 0 }); voice.say(['__jingle', act.ok]).then(done); }
        else { voice.speak([okVi()]); mark(); }
      } else { tries++; ui.shake(b); voice.say(['__boing', act.no]); }
    });
    voice.say(first ? [...(act.intro || []), act.q] : [act.q]);
  });
}

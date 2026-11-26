// E12 – Âm thanh và nhịp. Âm nhạc cụ tổng hợp bằng WebAudio (không cần tệp, chạy không mạng).
//   identify : Lu cho nghe một âm sau tấm rèm, bé chạm nhạc cụ phát ra âm đó. Có bước làm quen: chạm từng nhạc cụ để nghe trước.
//   rhythm   : Lu gõ một nhịp trống, bé gõ lại. 4–5 tuổi: đúng số tiếng gõ. 5–6 tuổi: đúng cả chỗ ngắt nhanh/chậm.
//   seq      : ghi nhớ trình tự: các vật sáng lên kèm âm theo thứ tự, bé chạm lại đúng thứ tự (độ dài tăng dần).
// Không thu âm, không chấm giọng hát của bé.
import { vis, esc, sleep, setAuto, playSound, SOUND_NAMES, req } from './kit.js';
import { okVi } from './common.js';

export const id = 'E12', version = '1.0.0', name = 'Âm thanh và nhịp';

export function validate(act) {
  const e = req(act, ['mode', 'skill_id', 'title', 'done']);
  if (act.mode === 'identify') e.push(...req(act, ['sounds', 'q', 'no']));
  if (act.mode === 'rhythm') { e.push(...req(act, ['patterns', 'no'])); (act.patterns || []).forEach(p => { if (!/^[x.]+$/.test(p) || !p.startsWith('x') || !p.endsWith('x')) e.push(`${act.activity_id}: nhịp "${p}" chỉ gồm x (gõ) và . (nghỉ), bắt đầu và kết thúc bằng x`); }); }
  if (act.mode === 'seq') { e.push(...req(act, ['items', 'lengths', 'no'])); if (Math.max(...(act.lengths || [0])) > 6) e.push(`${act.activity_id}: chuỗi dài quá 6 với 4–6 tuổi`); }
  return e;
}
export function generate(act, rng) {
  if (act.mode === 'identify') return { rounds: Array.from({ length: act.rounds || 3 }, () => { const opts = rng.sample(act.sounds, Math.min(act.choices || 3, act.sounds.length)); return { opts, target: rng.pick(opts) }; }) };
  if (act.mode === 'rhythm') return { rounds: rng.sample(act.patterns, Math.min(act.rounds || 3, act.patterns.length)).map(p => ({ p })) };
  return { rounds: act.lengths.map(n => { const s = []; for (let i = 0; i < n; i++) { let x; do { x = rng.int(0, act.items.length - 1); } while (s.length && s[s.length - 1] === x); s.push(x); } return { seq: s }; }) };
}
export function verify(act, v) {
  const e = [];
  if (act.mode === 'identify') v.rounds.forEach((r, k) => { if (!r.opts.includes(r.target)) e.push(`${act.activity_id} vòng ${k + 1}: âm cần tìm không có trong lựa chọn`); });
  if (act.mode === 'seq') v.rounds.forEach((r, k) => { if (r.seq.some(i => !act.items[i])) e.push(`${act.activity_id} vòng ${k + 1}: vật không có`); });
  return e;
}
export const lines = act => [...(act.intro || []), act.q, act.no, act.done, act.listen, act.your_turn, act.explore_say, act.again, ...(act.sounds || []).map(s => act.names?.[s]).filter(Boolean),
  ...(act.oks || [])].filter(Boolean);

export async function mount(ctx, act, v) {
  if (act.mode === 'identify' && act.explore) await explore(ctx, act);
  for (let r = 0; r < v.rounds.length; r++) { await ({ identify, rhythm, seq })[act.mode](ctx, act, v.rounds[r], r === 0); ctx.tick?.(); }
}
const nm = (act, s) => act.names?.[s] || SOUND_NAMES[s] || s;

// Làm quen: chạm từng nhạc cụ để nghe (bước "minh họa trực quan" trước khi thực hành)
function explore(ctx, act) {
  const { ui, voice } = ctx;
  return new Promise(done => {
    ui.scene(act.title, '');
    const box = ui.answers('Bé chạm từng nhạc cụ để nghe', act.sounds.map(s => `<button class="opt face snd" data-s="${s}" aria-label="${esc(nm(act, s))}">${vis('art:' + s)}<small>${esc(nm(act, s))}</small></button>`).join(''));
    const seen = new Set(); ctx.test.mark(box.querySelector('.snd'));
    setAuto(ctx, async () => { for (const b of box.querySelectorAll('.snd')) { if (!seen.has(b.dataset.s)) { b.click(); await sleep(ctx, 400); while (voice.busy) await sleep(ctx, 80); } } }, null);
    box.addEventListener('click', e => { const b = e.target.closest('.snd'); if (!b || voice.busy) return; const s = b.dataset.s; b.classList.add('right'); playSound(s); seen.add(s);
      sleep(ctx, 600).then(() => voice.say([nm(act, s)])).then(() => { const nx = box.querySelector('.snd:not(.right)'); if (nx) ctx.test.mark(nx); else done(); }); });
    voice.say([...(act.intro || []), act.explore_say].filter(Boolean));
  });
}

function identify(ctx, act, R, first) {
  const { ui, voice } = ctx; let wrong = 0;
  return new Promise(done => {
    ui.scene(act.title, `<button class="curtain" aria-label="Nghe lại âm thanh"><span class="cur-l"></span><span class="cur-r"></span><span class="spk">${SPK}</span></button>`);
    const cur = ui.stage.querySelector('.curtain');
    const play = () => { cur.classList.add('play'); playSound(R.target); setTimeout(() => cur.classList.remove('play'), 700); };
    cur.onclick = () => { if (!voice.busy) play(); };
    const box = ui.answers('Bé chạm nhạc cụ vừa kêu', R.opts.map(s => `<button class="opt face snd" data-s="${s}" aria-label="${esc(nm(act, s))}">${vis('art:' + s)}</button>`).join(''));
    const ok = box.querySelector(`[data-s="${R.target}"]`); ctx.test.mark(ok);
    setAuto(ctx, () => ok.click(), () => box.querySelector(`.snd:not([data-s="${R.target}"])`)?.click());
    box.addEventListener('click', e => { const b = e.target.closest('.snd'); if (!b || voice.busy) return;
      if (b.dataset.s === R.target) { b.classList.add('right'); cur.classList.add('open'); playSound(R.target); ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0 });
        sleep(ctx, 700).then(() => voice.say(['__jingle', `Đúng rồi, đó là tiếng ${nm(act, R.target)}.`])).then(done); }
      else { wrong++; ui.shake(b); playSound(b.dataset.s); sleep(ctx, 600).then(() => voice.say(['__boing', act.no])).then(() => sleep(ctx, 300)).then(play); if (wrong >= 2) ok.classList.add('hint'); } });
    voice.say(first ? [act.q] : [act.again || act.q]).then(() => sleep(ctx, 200)).then(play);
  });
}
const SPK = `<svg viewBox="0 0 24 24" class="lu-ic" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 9.5h3l4.5-4v13l-4.5-4h-3z"/><path d="M15.5 9c1.2 1.6 1.2 4.4 0 6"/><path d="M18 6.8c2.4 2.9 2.4 7.5 0 10.4"/></svg>`;

// Nhịp: "x.x" = gõ, nghỉ, gõ. Khoảng cách gõ liền = 1 phách ngắn (0,45 giây)
const BEAT = .45;
export function judgeRhythm(p, taps, strict) {
  const want = [...p].map((c, i) => c === 'x' ? i : -1).filter(i => i >= 0);
  if (taps.length !== want.length) return { ok: false, why: taps.length < want.length ? 'it' : 'nhieu' };
  if (!strict || want.length < 3) return { ok: true };
  // So tỉ lệ khoảng nghỉ (ngắn/dài), cho phép lệch nhiều vì trẻ 5–6 tuổi
  const wg = want.slice(1).map((x, i) => x - want[i]), tg = taps.slice(1).map((x, i) => x - taps[i]); const unit = tg.reduce((a, b) => a + b, 0) / wg.reduce((a, b) => a + b, 0);
  const ok = wg.every((g, i) => Math.abs(tg[i] / unit - g) <= .6 * g);
  return { ok, why: ok ? '' : 'nhip' };
}
function rhythm(ctx, act, R, first) {
  const { ui, voice } = ctx; let wrong = 0;
  return new Promise(done => {
    const want = [...R.p];
    ui.scene(act.title, `<div class="rhy"><div class="rhy-dots">${want.map(c => `<i class="${c === 'x' ? 'b' : 'r'}"></i>`).join('')}</div><div class="rhy-you"></div></div>`);
    const dots = [...ui.stage.querySelectorAll('.rhy-dots i')], you = ui.stage.querySelector('.rhy-you');
    if (act.hide_dots) ui.stage.querySelector('.rhy-dots').classList.add('hid');
    const box = ui.answers('Bé gõ trống', `<button class="opt drum" aria-label="gõ trống">${vis('art:trong')}</button><button class="big-btn alt rhy-listen">Nghe lại</button>`);
    const drum = box.querySelector('.drum'), again = box.querySelector('.rhy-listen'); ctx.test.mark(drum);
    let taps = [], tm = null, listening = false;
    const demo = async () => { listening = true; for (let i = 0; i < want.length; i++) { if (want[i] === 'x') { dots[i].classList.add('on'); playSound('trong'); } await sleep(ctx, BEAT * 1000); dots[i].classList.remove('on'); } listening = false; taps = []; you.innerHTML = ''; };
    const check = () => {
      const r = judgeRhythm(R.p, taps, !!act.strict); taps = [];
      if (r.ok) { drum.disabled = true; ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0 }); voice.say(['__jingle', act.oks?.[wrong ? 1 : 0] || okVi()]).then(done); }
      else { wrong++; you.classList.add('bad'); voice.say(['__boing', act.no]).then(() => { you.innerHTML = ''; you.classList.remove('bad'); return demo(); }); }
    };
    drum.addEventListener('pointerdown', e => { e.preventDefault(); if (voice.busy || listening || drum.disabled) return; playSound('trong'); drum.classList.remove('hit'); void drum.offsetWidth; drum.classList.add('hit');
      taps.push(performance.now() / 1000); you.insertAdjacentHTML('beforeend', '<i></i>'); clearTimeout(tm); tm = setTimeout(check, ctx.fast ? 10 : 1300); });
    again.onclick = () => { if (!voice.busy && !listening) demo(); };
    const tapAt = async gaps => { for (const g of gaps) { await sleep(ctx, g * 1000); drum.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); } };
    const gapsOf = p => { const x = [...p].map((c, i) => c === 'x' ? i : -1).filter(i => i >= 0); return x.map((v, i) => i ? (v - x[i - 1]) * BEAT : 0); };
    setAuto(ctx, () => tapAt(gapsOf(R.p)), () => tapAt(gapsOf(R.p).slice(0, -1)));
    voice.say(first ? [...(act.intro || []), act.listen].filter(Boolean) : [act.listen].filter(Boolean)).then(demo).then(() => voice.say([act.your_turn].filter(Boolean)));
  });
}

function seq(ctx, act, R, first) {
  const { ui, voice } = ctx; let wrong = 0;
  return new Promise(done => {
    ui.scene(act.title, '');
    const box = ui.answers(act.label || 'Bé chạm lại theo đúng thứ tự', act.items.map((it, i) => `<button class="opt face sq" data-i="${i}" aria-label="${esc(it.name || '')}">${vis(it.e)}</button>`).join(''));
    const btns = [...box.querySelectorAll('.sq')]; let k = 0, showing = false;
    const show = async () => { showing = true; k = 0; await sleep(ctx, 400); for (const i of R.seq) { btns[i].classList.add('lit'); playSound(act.items[i].s || 'dan', { note: act.items[i].note }); await sleep(ctx, 650); btns[i].classList.remove('lit'); await sleep(ctx, 200); } showing = false; ctx.test.mark(btns[R.seq[0]]); };
    box.addEventListener('click', e => { const b = e.target.closest('.sq'); if (!b || voice.busy || showing) return; const i = +b.dataset.i; playSound(act.items[i].s || 'dan', { note: act.items[i].note });
      b.classList.add('lit'); setTimeout(() => b.classList.remove('lit'), 250);
      if (i === R.seq[k]) { k++; if (k < R.seq.length) return ctx.test.mark(btns[R.seq[k]]);
        ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0, length: R.seq.length }); voice.say(['__jingle', act.oks?.[0] || okVi()]).then(done); }
      else { wrong++; ui.shake(b); voice.say(['__boing', act.no]).then(show); } });
    setAuto(ctx, async () => { while (showing || voice.busy) await sleep(ctx, 80); for (let j = k; j < R.seq.length; j++) { btns[R.seq[j]].click(); await sleep(ctx, 200); } },
      async () => { while (showing || voice.busy) await sleep(ctx, 80); btns.find((b, i) => i !== R.seq[k])?.click(); });
    voice.say(first ? [...(act.intro || []), act.listen].filter(Boolean) : [act.again || act.listen].filter(Boolean)).then(show);
  });
}

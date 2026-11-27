// E17 – Trò nhanh (trò đinh, phương án 27/11): các trò ngắn có tốc độ, bất ngờ, vận động.
//   cups    : hạt đậu dưới một cái rổ, các rổ tráo chỗ, bé chạm rổ có hạt (theo dõi vật di chuyển). Cấp = số lần tráo, tốc độ.
//   tap     : nghe rồi chạm thật nhanh: Mono đọc một (hoặc hai) từ, bé chạm đúng hình (đúng thứ tự). Có thanh thời gian
//             nhẹ nhàng (time_ms); hết giờ không phạt, Mono đọc lại và cho chạm tiếp.
//   compare : nhìn nhanh hai đĩa rồi chọn đĩa nhiều hơn (hoặc ít hơn); hai đĩa hiện show_ms rồi úp lại.
//   freeze  : đông cứng khi nhạc tắt (vận động ngoài màn hình): nhạc vui, bé nhảy; nhạc tắt, bé đứng im rồi chạm nút to.
//   simon   : "Mono nói": chỉ làm khi lệnh bắt đầu bằng "Mono nói". Bé làm động tác thật rồi chạm "Bé làm rồi",
//             lệnh không có "Mono nói" thì chạm "Không làm" (rèn kiềm chế, chú ý nghe).
import { vis, esc, fill, sleep, setAuto, playSound, req, countdown } from './kit.js';
import { groupHTML } from '../ui/art.js';
import { luArt } from '../core/lu-core.js';

export const id = 'E17', version = '1.0.0', name = 'Trò nhanh';
const MODES = ['cups', 'tap', 'compare', 'freeze', 'simon'];

export function validate(act) {
  const e = req(act, ['mode', 'skill_id', 'title', 'done']);
  if (!MODES.includes(act.mode)) e.push(`${act.activity_id}: mode không hợp lệ`);
  if (act.mode === 'cups') { e.push(...req(act, ['levels', 'q', 'ok', 'no'])); (act.levels || []).forEach((l, i) => { if (!(l.swaps >= 1 && l.swaps <= 8)) e.push(`${act.activity_id} lượt ${i + 1}: số lần tráo 1–8`); if (!(l.cups >= 2 && l.cups <= 4)) e.push(`${act.activity_id} lượt ${i + 1}: 2–4 rổ`); }); }
  if (act.mode === 'tap') { e.push(...req(act, ['words', 'levels', 'no'])); (act.levels || []).forEach((l, i) => { if (!(l.opts >= 2 && l.opts <= 6)) e.push(`${act.activity_id} lượt ${i + 1}: 2–6 hình`); if (l.opts > (act.words || []).length) e.push(`${act.activity_id} lượt ${i + 1}: không đủ từ cho ${l.opts} hình`); }); }
  if (act.mode === 'compare') { e.push(...req(act, ['obj', 'pairs', 'q', 'ok', 'no'])); (act.pairs || []).forEach((p, i) => { if (p[0] === p[1]) e.push(`${act.activity_id} cặp ${i + 1}: hai đĩa bằng nhau thì không có đáp án`); if (Math.max(...p) > 10) e.push(`${act.activity_id} cặp ${i + 1}: tối đa 10 vật`); }); }
  if (act.mode === 'freeze') e.push(...req(act, ['stops', 'dance', 'freeze', 'button']));
  if (act.mode === 'simon') { e.push(...req(act, ['cmds', 'yes', 'no_btn', 'oops'])); if ((act.cmds || []).filter(c => !c.mono).length < 1) e.push(`${act.activity_id}: cần ít nhất một lệnh không có "Mono nói"`); }
  return e;
}

export function generate(act, rng) {
  if (act.mode === 'cups') return { rounds: act.levels.map(l => { let pos = rng.int(0, l.cups - 1); const swaps = []; for (let s = 0; s < l.swaps; s++) { const a = rng.int(0, l.cups - 1); let b = rng.int(0, l.cups - 2); if (b >= a) b++; swaps.push([a, b]); } return { ...l, start: pos, swaps }; }) };
  if (act.mode === 'tap') { let last = -1; return { rounds: act.levels.map(l => { const opts = rng.sample(act.words.map((w, i) => i), l.opts); let pool = opts.filter(i => i !== last); const tgt = rng.sample(pool.length >= (l.seq || 1) ? pool : opts, l.seq || 1); last = tgt.at(-1); return { ...l, opts, tgt }; }) }; }
  if (act.mode === 'compare') return { rounds: act.pairs.slice(0, act.rounds || act.pairs.length).map(p => (rng.int(0, 1) ? { a: p[0], b: p[1] } : { a: p[1], b: p[0] })) };
  if (act.mode === 'freeze') return { rounds: [{ waits: Array.from({ length: act.stops }, () => rng.int(act.min_ms || 3500, act.max_ms || 6500)) }] };
  return { rounds: [{ cmds: act.cmds.map((c, i) => i) }] };
}
export function verify(act, v) {
  const e = [];
  if (act.mode === 'tap') v.rounds.forEach((r, k) => { if (!r.tgt.every(t => r.opts.includes(t))) e.push(`${act.activity_id} lượt ${k + 1}: từ cần chạm không có trong hình`); if (new Set(r.opts.map(i => act.words[i].e)).size !== r.opts.length) e.push(`${act.activity_id} lượt ${k + 1}: hai hình giống nhau`); });
  if (act.mode === 'cups') v.rounds.forEach((r, k) => { if (r.swaps.some(([a, b]) => a === b)) e.push(`${act.activity_id} lượt ${k + 1}: tráo một rổ với chính nó`); });
  return e;
}
export function lines(act) {
  const L = [...(act.intro || []), act.q, act.again, act.ok, act.no, act.done, act.look, act.hint, act.timeout];
  if (act.mode === 'tap') act.words.forEach(w => L.push(w.w, w.ok));
  if (act.mode === 'freeze') L.push(act.dance, act.freeze, act.ok);
  if (act.mode === 'simon') act.cmds.forEach(c => L.push((c.mono ? act.prefix || 'Mono nói: ' : '') + c.t, c.ok)), L.push(act.oops, act.good_stop);
  return L.filter(Boolean);
}
export const rounds = act => act.mode === 'cups' || act.mode === 'tap' ? act.levels.length : act.mode === 'compare' ? Math.min(act.rounds || 99, act.pairs.length) : 1;

export async function mount(ctx, act, v) {
  const f = { cups, tap, compare, freeze, simon }[act.mode];
  for (let r = 0; r < v.rounds.length; r++) { await f(ctx, act, v.rounds[r], r === 0); if (rounds(act) > 1) ctx.tick?.(); }
}

const rec = (ctx, act, wrong, extra = {}) => ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: wrong >= 2 ? 1 : 0, ...extra });
const intro = (act, first, line) => (first ? [...(act.intro || []), line] : [act.again || line]).filter(Boolean);

/* ---------- Nón tráo: hạt dưới rổ nào? ---------- */
function cups(ctx, act, R, first) {
  const { ui, voice } = ctx; const n = R.cups; let wrong = 0;
  return new Promise(async done => {
    ui.scene(act.title, `<div class="cups" style="--n:${n}">${Array.from({ length: n }, (_, i) => `<button class="cup-slot" data-i="${i}" style="left:${(i + .5) * 100 / n}%" aria-label="rổ ${i + 1}"><span class="cup-obj">${vis(act.obj || 'art:hat-dau')}</span><span class="cup">${vis(act.cover || 'art:ro-tre')}</span></button>`).join('')}</div>`);
    const slots = [...ui.stage.querySelectorAll('.cup-slot')]; let where = R.start; // slot i đang đứng ở vị trí order[i]
    const order = slots.map((s, i) => i); slots.forEach((s, i) => s.querySelector('.cup-obj').style.visibility = i === R.start ? 'visible' : 'hidden');
    const put = () => slots.forEach((s, i) => { s.style.left = `${(order[i] + .5) * 100 / n}%`; });
    const box = ui.stage.querySelector('.cups'); let ready = false;
    box.addEventListener('click', async e => {
      const b = e.target.closest('.cup-slot'); if (!b || !ready || voice.busy) return; const i = +b.dataset.i;
      b.classList.add('up');
      if (i === where) { ready = false; rec(ctx, act, wrong, { swaps: R.swaps.length }); await voice.say(['__jingle', act.ok]); return done(); }
      wrong++; ui.shake(b); await voice.say(['__boing', act.no]); b.classList.remove('up');
      if (wrong >= 2) { slots[where].classList.add('hint'); ctx.test.mark(slots[where]); }
    });
    setAuto(ctx, () => slots[where].click(), () => slots.find((s, i) => i !== where).click());
    await voice.say(intro(act, first, act.look));
    slots.forEach(s => s.classList.add('up')); await sleep(ctx, 1500); slots.forEach(s => s.classList.remove('up')); await sleep(ctx, 600);
    const ms = R.speed_ms || 700; box.style.setProperty('--sp', ms + 'ms');
    for (const [a, b] of R.swaps) { const t = order[a]; order[a] = order[b]; order[b] = t; put(); playSound('cham'); await sleep(ctx, ms + 120); }
    ready = true; ctx.test.mark(slots[where]); voice.say([act.q]);
  });
}

/* ---------- Nghe và chạm nhanh ---------- */
function tap(ctx, act, R, first) {
  const { ui, voice } = ctx; let wrong = 0, k = 0, timer = null;
  return new Promise(async done => {
    ui.scene(act.title, `<div class="tap-bar"><i></i></div>`);
    const box = ui.answers('', `<div class="tap-grid" style="--n:${R.opts.length}">${R.opts.map(i => `<button class="opt face tap-o" data-w="${i}" aria-label="${esc(act.words[i].name || act.words[i].w)}">${vis(act.words[i].e)}</button>`).join('')}</div>`);
    const bar = ui.stage.querySelector('.tap-bar i'); const btn = i => box.querySelector(`[data-w="${i}"]`);
    const startTimer = () => { clearTimeout(timer); if (!R.time_ms || ctx.fast) return; bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = `width ${R.time_ms}ms linear`; bar.style.width = '0%';
      timer = setTimeout(async () => { await voice.say([act.timeout || act.no, ...R.tgt.slice(k).map(t => act.words[t].w)]); startTimer(); }, R.time_ms); };
    const ask = async () => { ctx.test.mark(btn(R.tgt[k])); await voice.say(R.tgt.map(t => act.words[t].w)); startTimer(); };
    box.addEventListener('click', async e => { const b = e.target.closest('.tap-o'); if (!b || voice.busy || b.classList.contains('right')) return; const i = +b.dataset.w;
      if (i === R.tgt[k]) { b.classList.add('right'); playSound('cham'); k++; if (k < R.tgt.length) { ctx.test.mark(btn(R.tgt[k])); return; }
        clearTimeout(timer); bar.style.transition = 'none'; rec(ctx, act, wrong); await voice.say([act.en ? '__ok' : '__jingle', R.tgt.length > 1 ? act.ok : act.words[R.tgt[0]].ok || act.ok].filter(Boolean)); return done(); }
      wrong++; ui.shake(b); clearTimeout(timer); box.querySelectorAll('.right').forEach(x => x.classList.remove('right')); k = 0;
      await voice.say([act.en ? '__no' : '__boing', act.no, ...R.tgt.map(t => act.words[t].w)]); if (wrong >= 2) btn(R.tgt[0]).classList.add('hint'); startTimer(); });
    setAuto(ctx, async () => { for (const t of R.tgt.slice(k)) { btn(t).click(); await sleep(ctx, 60); } }, () => box.querySelector(`.tap-o:not([data-w="${R.tgt[k]}"])`).click());
    await voice.say(intro(act, first, act.look)); ask();
  });
}

/* ---------- Nhìn nhanh hai đĩa: bên nào nhiều hơn? ---------- */
function compare(ctx, act, R, first) {
  const { ui, voice } = ctx; let wrong = 0; const more = act.less ? (R.a < R.b ? 0 : 1) : (R.a > R.b ? 0 : 1);
  return new Promise(async done => {
    ui.scene(act.title, `<div class="cmp">${[R.a, R.b].map((n, i) => `<button class="cmp-plate" data-i="${i}" aria-label="đĩa ${i ? 'phải' : 'trái'}"><span class="cmp-in">${groupHTML(act.obj, n)}</span><span class="fl-cover"><span>?</span></span></button>`).join('')}</div>`);
    const plates = [...ui.stage.querySelectorAll('.cmp-plate')]; let ready = false;
    const show = async () => { plates.forEach(p => p.classList.remove('hid')); await sleep(ctx, act.show_ms || 1500); plates.forEach(p => p.classList.add('hid')); };
    ui.stage.querySelector('.cmp').addEventListener('click', async e => { const b = e.target.closest('.cmp-plate'); if (!b || !ready || voice.busy) return;
      if (+b.dataset.i === more) { ready = false; plates.forEach(p => p.classList.remove('hid')); b.classList.add('right'); rec(ctx, act, wrong); await voice.say(['__jingle', fill(act.ok, { a: R.a, b: R.b })]); return done(); }
      wrong++; ui.shake(b); await voice.say(['__boing', act.no]); if (wrong >= 2) { plates.forEach(p => p.classList.remove('hid')); plates[more].classList.add('hint'); } else { ready = false; await show(); ready = true; } });
    setAuto(ctx, () => plates[more].click(), () => plates[1 - more].click());
    await voice.say(intro(act, first, act.look)); await show(); ready = true; ctx.test.mark(plates[more]); voice.say([act.q]);
  });
}

/* ---------- Đông cứng khi nhạc tắt ---------- */
const TUNE = ['C5', 'E5', 'G5', 'E5', 'F5', 'A5', 'G5', 'E5', 'D5', 'F5', 'E5', 'C5'];
function freeze(ctx, act, R, first) {
  const { ui, voice } = ctx;
  return new Promise(async done => {
    ui.scene(act.title, `<div class="frz"><div class="frz-mono">${luArt('nhay')}</div><div class="frz-say"></div></div>`);
    const el = ui.stage.querySelector('.frz'), say = el.querySelector('.frz-say'), mono = el.querySelector('.frz-mono');
    const box = ui.answers('', `<button class="big-btn frz-btn" disabled>${esc(act.button)}</button>`); const btn = box.querySelector('.frz-btn');
    ctx.test.mark(btn);
    await voice.say(intro(act, first, act.dance));
    for (let s = 0; s < R.waits.length; s++) {
      el.classList.add('dance'); mono.innerHTML = luArt('nhay'); say.textContent = ''; btn.disabled = true;
      const end = Date.now() + (ctx.fast ? 0 : R.waits[s]); let n = 0; while (Date.now() < end) { playSound('note:' + TUNE[n++ % TUNE.length], { vol: .5 }); await sleep(ctx, 260); }
      el.classList.remove('dance'); mono.innerHTML = luArt('dung'); say.textContent = act.freeze; btn.disabled = false;
      await voice.say(['__boing', act.freeze]);
      await new Promise(r => { btn.onclick = () => { if (voice.busy) return; btn.onclick = null; r(); }; setAuto(ctx, () => btn.click(), () => btn.click()); });
      if (s < R.waits.length - 1) await voice.say([act.ok || 'Giỏi quá! Nhạc lại vang lên rồi.']);
    }
    ctx.record({ skill_id: act.skill_id, kind: 'participation', correct: true, first_try: true, tries: 1, hints: 0 });
    await voice.say(['__jingle', act.done]); done();
  });
}

/* ---------- Mono nói ---------- */
function simon(ctx, act, R, first) {
  const { ui, voice } = ctx; let slips = 0;
  return new Promise(async done => {
    ui.scene(act.title, `<div class="sim"><div class="sim-mono">${luArt('chi-tay')}</div><div class="sim-card"></div></div>`);
    const card = ui.stage.querySelector('.sim-card');
    const box = ui.answers('', `<div class="row2"><button class="big-btn sim-yes">${esc(act.yes)}</button><button class="big-btn alt sim-no">${esc(act.no_btn)}</button></div>`);
    const yes = box.querySelector('.sim-yes'), no = box.querySelector('.sim-no');
    await voice.say(intro(act, first, act.look));
    for (const i of R.cmds) {
      const c = act.cmds[i]; const line = (c.mono ? act.prefix || 'Mono nói: ' : '') + c.t;
      card.innerHTML = `${c.e ? `<span class="sim-pic">${vis(c.e)}</span>` : ''}<b>${esc(line)}</b>`;
      ctx.test.mark(c.mono ? yes : no); await voice.say([line]);
      const pick = await new Promise(r => { yes.onclick = () => !voice.busy && r(true); no.onclick = () => !voice.busy && r(false); setAuto(ctx, () => (c.mono ? yes : no).click(), () => (c.mono ? no : yes).click()); });
      if (pick === c.mono) await voice.say([c.mono ? (c.ok || '__jingle') : act.good_stop || 'Đúng rồi! Mono chưa nói "Mono nói" nên bé đứng yên.']);
      else { slips++; await voice.say([c.mono ? act.missed || 'Mono có nói "Mono nói" đấy, mình làm nhé!' : act.oops]); }
    }
    ctx.record({ skill_id: act.skill_id, correct: true, first_try: slips === 0, tries: 1 + slips, hints: 0, slips });
    await voice.say(['__jingle', act.done]); done();
  });
}

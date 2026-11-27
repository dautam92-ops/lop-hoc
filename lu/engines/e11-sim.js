// E11 – Mô phỏng: bé điều khiển đồ vật, đồ vật đổi trạng thái, Lu giải thích điều vừa xảy ra.
//   sinkfloat : thí nghiệm chìm nổi. Bé ĐOÁN trước (không chấm), thả vật vào nước, QUAN SÁT kết quả thật, Lu giải thích.
//   steps     : việc hằng ngày theo trình tự (rửa tay…): chạm đúng đồ vật cho bước tiếp theo, đôi tay đổi trạng thái theo từng bước.
//   place     : nghe chỉ dẫn vị trí (trong, trên, dưới, bên cạnh) rồi đặt vật vào đúng chỗ; 5–6 tuổi nghe hai chỉ dẫn liền nhau.
//   tray      : toán trực quan thêm, bớt, tách, gộp: bé tự thêm/bớt vật trên đĩa rồi chọn kết quả.
import { vis, esc, fill, sleep, setAuto, frameHTML, numBtn, praiser, playSound, req } from './kit.js';
import { dragOrTap, luArt } from '../core/lu-core.js';
import { groupHTML } from '../ui/art.js';

export const id = 'E11', version = '1.0.0', name = 'Mô phỏng';
const MODES = ['sinkfloat', 'steps', 'place', 'tray'];

export function validate(act) {
  const e = req(act, ['mode', 'skill_id', 'title']);
  if (!MODES.includes(act.mode)) e.push(`${act.activity_id}: mode không hợp lệ`);
  if (act.mode === 'sinkfloat') { e.push(...req(act, ['items', 'predict_q', 'done'])); (act.items || []).forEach(it => { if (typeof it.floats !== 'boolean' || !it.why) e.push(`${act.activity_id}: ${it.name} cần floats và lời giải thích why (kiến thức khoa học phải kiểm duyệt)`); }); }
  if (act.mode === 'steps') { e.push(...req(act, ['steps', 'done', 'no'])); if ((act.steps || []).length < 3) e.push(`${act.activity_id}: cần ít nhất 3 bước`); }
  if (act.mode === 'place') { e.push(...req(act, ['anchor', 'tasks', 'done', 'no'])); (act.tasks || []).forEach((t, i) => { if (!ZONES[t.zone]) e.push(`${act.activity_id}: chỉ dẫn ${i + 1} có vị trí lạ "${t.zone}"`); }); }
  if (act.mode === 'tray') { e.push(...req(act, ['tasks', 'obj'])); (act.tasks || []).forEach((t, i) => { const r = trayAnswer(t); if (!(r >= 0 && r <= (act.max || 10))) e.push(`${act.activity_id}: bài ${i + 1} có kết quả ${r} ngoài phạm vi`); }); }
  return e;
}
export function generate(act, rng) {
  if (act.mode === 'sinkfloat') return { rounds: rng.sample(act.items.map((x, i) => i), act.rounds || act.items.length).map(i => ({ i })) };
  if (act.mode === 'steps') return { rounds: [{ order: rng.shuffle(act.steps.map((s, i) => i)) }] };
  if (act.mode === 'place') { const per = act.per || 1; const t = rng.sample(act.tasks.map((x, i) => i), Math.min(act.tasks.length, (act.rounds || 3) * per)); const rounds = []; for (let i = 0; i < t.length; i += per) rounds.push({ tasks: t.slice(i, i + per) }); return { rounds }; }
  const tasks = act.pick ? rng.sample(act.tasks.map((x, i) => i), act.pick) : act.tasks.map((x, i) => i);
  return { rounds: tasks.map(k => ({ k, opts: numOpts(trayAnswer(act.tasks[k]), act.max || 10, rng) })) };
}
export const trayAnswer = t => t.type === 'them' ? t.start + t.add : t.type === 'bot' ? t.start - t.take : t.type === 'gop' ? t.a + t.b : t.type === 'tach' ? t.total - t.a : NaN;
function numOpts(ans, max, rng) { const s = new Set([ans]); const cand = rng.shuffle([ans - 1, ans + 1, ans - 2, ans + 2, ans + 3].filter(x => x >= 0 && x <= max)); for (const c of cand) { if (s.size >= 3) break; s.add(c); } return [...s].sort((a, b) => a - b); }
export function verify(act, v) {
  const e = [];
  if (act.mode === 'tray') v.rounds.forEach((r, k) => { const a = trayAnswer(act.tasks[r.k]); if (!r.opts.includes(a)) e.push(`${act.activity_id} vòng ${k + 1}: đáp án không có trong lựa chọn`); if (new Set(r.opts).size !== r.opts.length) e.push(`${act.activity_id}: lựa chọn trùng`); });
  if (act.mode === 'place') v.rounds.forEach((r, k) => { if (!r.tasks.length) e.push(`${act.activity_id} vòng ${k + 1}: không có chỉ dẫn`); });
  return e;
}
export function lines(act) {
  const L = [...(act.intro || []), act.done, act.no, act.again];
  if (act.mode === 'sinkfloat') { L.push(act.predict_q, act.drop, act.guess_ok, act.guess_other, 'Chìm', 'Nổi'); act.items.forEach(it => L.push(fill(act.predict_q, { name: it.name }), it.why, fill(it.floats ? act.saw_float : act.saw_sink, { name: it.name }))); }
  if (act.mode === 'steps') act.steps.forEach(s => L.push(s.say, s.ask));
  if (act.mode === 'place') { act.tasks.forEach(t => L.push(t.say, t.ok)); if (act.both) L.push(act.both); }
  if (act.mode === 'tray') act.tasks.forEach(t => L.push(...(t.say || []), t.q, t.ok, t.no, t.act));
  return L.filter(Boolean);
}
export async function mount(ctx, act, v) {
  if (act.mode === 'steps') { await steps(ctx, act, v.rounds[0]); ctx.tick?.(); return; }
  for (let r = 0; r < v.rounds.length; r++) { await ({ sinkfloat, place, tray })[act.mode](ctx, act, v.rounds[r], r === 0); ctx.tick?.(); }
}

/* ---------- Chìm hay nổi ---------- */
function sinkfloat(ctx, act, R, first) {
  const { ui, voice } = ctx; const it = act.items[R.i];
  return new Promise(done => {
    ui.scene(act.title, `<div class="sim-lab"><div class="tank"><div class="water"></div><div class="tank-it">${vis(it.e)}</div></div><div class="sim-obj">${vis(it.e)}<b>${esc(it.name)}</b></div></div>`);
    const tank = ui.stage.querySelector('.tank'), obj = ui.stage.querySelector('.sim-obj'), ti = ui.stage.querySelector('.tank-it');
    const q = fill(act.predict_q, { name: it.name });
    const box = ui.answers('Bé đoán xem', `<button class="opt wide sf" data-f="0"><span class="em">${SINK}</span>Chìm</button><button class="opt wide sf" data-f="1"><span class="em">${FLOAT}</span>Nổi</button>`);
    let guess = null;
    const right = box.querySelector(`[data-f="${it.floats ? 1 : 0}"]`), wrong = box.querySelector(`[data-f="${it.floats ? 0 : 1}"]`);
    ctx.test.mark(right);
    const dropIt = () => {
      if (voice.busy || guess === null || tank.classList.contains('done')) return;
      obj.classList.add('gone'); tank.classList.add('done', it.floats ? 'float' : 'sink'); ti.classList.add('in'); playSound('nuoc');
      const same = guess === it.floats;
      // Dự đoán là tư duy khoa học, không phải bài kiểm tra: ghi lại, không chấm sai
      ctx.record({ skill_id: act.skill_id, kind: 'participation', correct: true, first_try: true, tries: 1, hints: 0, predicted: guess, actual: it.floats, prediction_matched: same });
      sleep(ctx, 1300).then(() => voice.say([fill(it.floats ? act.saw_float : act.saw_sink, { name: it.name }), same ? act.guess_ok : act.guess_other, it.why].filter(Boolean))).then(done);
    };
    box.addEventListener('click', e => { const b = e.target.closest('.sf'); if (!b || voice.busy || guess !== null) return; guess = b.dataset.f === '1'; b.classList.add('chosen');
      box.querySelectorAll('.sf').forEach(x => x.disabled = true); ctx.test.mark(obj); voice.say([act.drop]); });
    dragOrTap(obj, { isBusy: () => voice.busy || guess === null, targetClass: 'tank', onDrop: dropIt, onSelect: () => dropIt() });
    tank.onclick = () => dropIt();
    setAuto(ctx, async () => { if (guess === null) right.click(); await sleep(ctx, 50); const w = async () => { while (voice.busy) await sleep(ctx, 80); }; await w(); dropIt(); },
      async () => { if (guess === null) wrong.click(); });
    voice.say(first ? [...(act.intro || []), q] : [q]);
  });
}
const SINK = `<svg viewBox="0 0 40 40" class="lu-ic"><rect x="4" y="10" width="32" height="26" rx="4" fill="#bfe0ea"/><circle cx="20" cy="29" r="5" fill="#6b5232"/><path d="M20 8v12m-5-5 5 5 5-5" stroke="#6b5232" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
const FLOAT = `<svg viewBox="0 0 40 40" class="lu-ic"><rect x="4" y="10" width="32" height="26" rx="4" fill="#bfe0ea"/><circle cx="20" cy="13" r="5" fill="#6b5232"/><path d="M20 32V22m-5 5 5-5 5 5" stroke="#6b5232" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;

/* ---------- Việc hằng ngày theo trình tự ---------- */
function steps(ctx, act, R) {
  const { ui, voice } = ctx; let k = 0, wrong = 0;
  return new Promise(done => {
    const S = act.steps;
    ui.scene(act.title, `<div class="sim-steps"><div class="st-main">${vis(S[0].state0 || act.state0 || S[0].e)}</div><ol class="st-list">${S.map((s, i) => `<li data-k="${i}"><span>${i + 1}</span>${esc(s.label)}</li>`).join('')}</ol></div>`);
    const main = ui.stage.querySelector('.st-main');
    const box = ui.answers(act.label || 'Bé chạm đồ vật cho bước tiếp theo', R.order.map(i => `<button class="opt face st-opt" data-i="${i}" aria-label="${esc(S[i].label)}">${vis(S[i].e)}</button>`).join(''));
    const mark = () => ctx.test.mark(box.querySelector(`[data-i="${k}"]`));
    mark();
    const pick = b => {
      const i = +b.dataset.i;
      if (i === k) {
        b.classList.add('right'); b.disabled = true; ui.stage.querySelector(`.st-list li[data-k="${i}"]`).classList.add('done');
        if (S[i].state) main.innerHTML = vis(S[i].state); main.classList.remove('pulse'); void main.offsetWidth; main.classList.add('pulse');
        ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0, step: i });
        wrong = 0; k++;
        if (k >= S.length) voice.say([S[i].say, '__jingle', act.done]).then(done);
        else { voice.say([S[i].say, S[k].ask].filter(Boolean)); mark(); }
      } else { wrong++; ui.shake(b); voice.say(['__boing', act.no, S[k].ask].filter(Boolean)); if (wrong >= 2) box.querySelector(`[data-i="${k}"]`).classList.add('hint'); }
    };
    box.addEventListener('click', e => { const b = e.target.closest('.st-opt'); if (!b || voice.busy || b.disabled) return; pick(b); });
    setAuto(ctx, () => box.querySelector(`[data-i="${k}"]`)?.click(), () => box.querySelector(`.st-opt:not([data-i="${k}"]):not(:disabled)`)?.click());
    voice.say([...(act.intro || []), S[0].ask].filter(Boolean));
  });
}

/* ---------- Nghe chỉ dẫn vị trí ---------- */
// Vùng đích quanh vật mốc, theo % khung tranh (vật mốc đứng giữa, rộng 34%)
const ZONES = { trong: [50, 64, 22, 16], tren: [50, 28, 22, 18], duoi: [50, 92, 30, 12], trai: [18, 66, 18, 26], phai: [82, 66, 18, 26] };
export const ZONE_NAMES = { trong: 'trong', tren: 'trên', duoi: 'dưới', trai: 'bên trái', phai: 'bên phải' };
function place(ctx, act, R, first) {
  const { ui, voice } = ctx; const tasks = R.tasks.map(i => act.tasks[i]); let k = 0, wrong = 0, sel = null;
  return new Promise(done => {
    ui.scene(act.title, `<div class="place-sc"><div class="pl-anchor">${vis(act.anchor)}</div>${Object.entries(ZONES).map(([z, [x, y, w, h]]) => `<div class="pl-zone" data-z="${z}" style="left:${x - w / 2}%;top:${y - h / 2}%;width:${w}%;height:${h}%"></div>`).join('')}</div>`);
    const sc = ui.stage.querySelector('.place-sc');
    const pieces = [...new Set(tasks.map(t => t.e).concat(act.extra || []))];
    const tray = ui.answers(act.label || 'Kéo đồ vật vào đúng chỗ Mono nói', pieces.map(e => `<div class="piece pl-piece" data-e="${esc(e)}">${vis(e)}</div>`).join('')); tray.classList.add('tray');
    const mark = () => { const t = tasks[k]; if (t) ctx.test.mark([tray.querySelector(`.pl-piece[data-e="${CSS.escape(t.e)}"]`), sc.querySelector(`.pl-zone[data-z="${t.zone}"]`)]); };
    const say = () => tasks.length > 1 && act.both ? [act.both, ...tasks.map(t => t.say)] : [tasks[k].say];
    const drop = (p, z) => {
      const t = tasks[k]; if (!t) return;
      if (p.dataset.e === t.e && z.dataset.z === t.zone) {
        z.classList.add('filled'); z.innerHTML = vis(t.e); p.remove();
        ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0 }); wrong = 0; k++;
        if (k >= tasks.length) voice.say(['__jingle', t.ok || act.done]).then(done); else { voice.say([t.ok].filter(Boolean)); mark(); }
      } else { wrong++; ui.shake(p); voice.say(['__boing', act.no, tasks[k].say]); if (wrong >= 2) sc.querySelector(`.pl-zone[data-z="${t.zone}"]`).classList.add('hint'); }
    };
    tray.querySelectorAll('.pl-piece').forEach(p => dragOrTap(p, { isBusy: () => voice.busy, targetClass: 'pl-zone', onDrop: drop,
      onSelect: x => { tray.querySelectorAll('.piece.sel').forEach(y => y.classList.remove('sel')); sel = x; x.classList.add('sel'); } }));
    sc.querySelectorAll('.pl-zone').forEach(z => z.onclick = () => { if (voice.busy || !sel || !sel.isConnected) return; const p = sel; p.classList.remove('sel'); sel = null; drop(p, z); });
    setAuto(ctx, () => { const t = tasks[k]; if (!t) return; drop(tray.querySelector(`.pl-piece[data-e="${CSS.escape(t.e)}"]`), sc.querySelector(`.pl-zone[data-z="${t.zone}"]`)); },
      () => { const t = tasks[k]; if (!t) return; const z = Object.keys(ZONES).find(x => x !== t.zone); drop(tray.querySelector(`.pl-piece[data-e="${CSS.escape(t.e)}"]`), sc.querySelector(`.pl-zone[data-z="${z}"]`)); });
    mark();
    voice.say(first ? [...(act.intro || []), ...say()] : say());
  });
}

/* ---------- Toán trực quan: thêm, bớt, gộp, tách ---------- */
function tray(ctx, act, R, first) {
  const { ui, voice } = ctx; const t = act.tasks[R.k]; const ans = trayAnswer(t); const obj = t.obj || act.obj;
  return new Promise(done => {
    let phase = 'act', wrong = 0;
    const plate = n => `<div class="tr-plate">${Array.from({ length: n }, (_, i) => `<button class="tr-it" data-i="${i}">${vis(obj)}</button>`).join('')}</div>`;
    let body = '';
    if (t.type === 'them') body = `<div class="tray-sc">${plate(t.start)}<button class="tr-src ro" aria-label="lấy thêm"><span class="ro-sau"></span><span class="tr-src-in">${Array.from({ length: Math.min(t.add + 1, 6) }, () => `<span class="tr-sv">${vis(obj)}</span>`).join('')}</span><span class="ro-truoc"></span><b>+</b></button></div>`;
    if (t.type === 'bot') body = `<div class="tray-sc">${plate(t.start)}</div>`;
    if (t.type === 'gop') body = `<div class="tray-sc two"><div class="tr-plate a">${groupHTML(obj, t.a)}</div><div class="tr-plate b">${groupHTML(obj, t.b)}</div><button class="tr-join big-btn alt">Gộp lại</button></div>`;
    if (t.type === 'tach') body = `<div class="tray-sc two"><div class="tr-plate a">${Array.from({ length: t.a }, () => `<span class="tr-it fixed">${vis(obj)}</span>`).join('')}<i>${esc(t.la || '')}</i></div><div class="tr-plate b cover"><span class="tr-cover">?</span><i>${esc(t.lb || '')}</i></div></div>`;
    ui.scene(t.title || act.title, body);
    const sc = ui.stage.querySelector('.tray-sc');
    let count = t.type === 'them' ? t.start : t.type === 'bot' ? t.start : 0, moved = 0;
    const askNumber = () => {
      phase = 'num';
      const box = ui.answers(act.label || 'Bé chọn số', R.opts.map((v, i) => numBtn(v, i)).join(''));
      const ok = box.querySelector(`[data-i="${R.opts.indexOf(ans)}"]`); ctx.test.mark(ok);
      setAuto(ctx, () => ok.click(), () => box.querySelector(`.num:not([data-i="${R.opts.indexOf(ans)}"])`)?.click());
      box.addEventListener('click', e => { const b = e.target.closest('.num'); if (!b || voice.busy) return; const v = R.opts[+b.dataset.i];
        if (v === ans) { b.classList.add('right'); ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0 }); voice.say(['__jingle', fill(t.ok, { n: ans })]).then(done); }
        else { wrong++; ui.shake(b); voice.say(['__boing', t.no || act.no]); if (wrong >= 2) ok.classList.add('hint'); } });
      voice.say([t.q]);
    };
    if (t.type === 'them') {
      const src = sc.querySelector('.tr-src'), pl = sc.querySelector('.tr-plate'); ctx.test.mark(src);
      src.onclick = () => { if (voice.busy || phase !== 'act' || moved >= t.add) return; moved++; count++; const sv = [...src.querySelectorAll('.tr-src-in > .tr-sv')].pop(); sv?.remove(); pl.insertAdjacentHTML('beforeend', `<span class="tr-it new">${vis(obj)}</span>`); playSound('cham');
        if (moved >= t.add) { src.disabled = true; askNumber(); } };
      setAuto(ctx, async () => { while (phase === 'act') { src.click(); await sleep(ctx, 150); } }, null);
    } else if (t.type === 'bot') {
      const its = [...sc.querySelectorAll('.tr-it')]; ctx.test.mark(its[0]);
      its.forEach(b => b.onclick = () => { if (voice.busy || phase !== 'act' || b.classList.contains('out')) return; b.classList.add('out'); moved++; playSound('cham'); if (moved >= t.take) askNumber(); else ctx.test.mark(its.find(x => !x.classList.contains('out'))); });
      setAuto(ctx, async () => { for (const b of its) { if (phase !== 'act') break; b.click(); await sleep(ctx, 150); } }, null);
    } else if (t.type === 'gop') {
      const j = sc.querySelector('.tr-join'); ctx.test.mark(j);
      j.onclick = () => { if (voice.busy) return; sc.classList.add('joined'); j.remove(); sc.querySelector('.tr-plate.a').innerHTML = groupHTML(obj, t.a + t.b); sc.querySelector('.tr-plate.b').remove(); askNumber(); };
      setAuto(ctx, () => j.click(), null);
    }
    const intro = [...(first ? act.intro || [] : []), ...(t.say || []), t.type === 'tach' ? null : t.act].filter(Boolean);
    if (t.type === 'tach') { voice.say(intro).then(() => { if (phase === 'act') askNumber(); }); return; }
    voice.say(intro);
  });
}

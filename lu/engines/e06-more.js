// E06 – Tìm và phát hiện: các chế độ mở rộng cho Phòng mẫu (engine E06 chuyển sang đây khi có act.mode).
//   diff   : tìm điểm khác nhau giữa hai tranh (mất vật, đổi màu, thêm vật). Sinh khác biệt theo seed, đáp án chính xác theo cách dựng.
//   scene  : tìm đồ vật ẩn trong tranh lớn (vật nhỏ, bị bụi cỏ che một phần).
//   vanish : nhìn rồi nhớ: khăn che lại, một (hoặc hai) vật biến mất, bé chọn vật đã biến mất. Có nút "Xem lại" (không áp lực).
//   multi  : tìm tất cả đối tượng thỏa NHIỀU điều kiện cùng lúc (loại + màu, + kích thước, hoặc "không phải màu…").
// Chạm sai: chỉ âm nhẹ, không giải thích dài (tam 26/11); từ lần sai thứ 3 Lu mới gợi ý.
import { vis, esc, fill, sleep, setAuto, frameHTML, req } from './kit.js';
import { okVi } from './common.js';
import { LAB_COLORS } from '../ui/art-lab.js';
import * as MT from './e06-mt.js';

export const MORE = new Set(['diff', 'scene', 'vanish', 'multi', ...MT.MODES]);
const COLOR_NAMES = { do: 'đỏ', xanh: 'xanh dương', vang: 'vàng', la: 'xanh lá', tim: 'tím', hong: 'hồng', cam: 'cam' };

export function validate(act) {
  if (MT.MODES.has(act.mode)) return MT.validate(act);
  const e = req(act, ['skill_id', 'title', 'done']);
  if (act.mode === 'diff') { e.push(...req(act, ['scenes', 'n'])); (act.scenes || []).forEach((s, i) => { const able = s.objs.filter(o => o.change !== false).length; if (able < act.n) e.push(`${act.activity_id}: tranh ${i + 1} không đủ vật để tạo ${act.n} điểm khác`); }); }
  if (act.mode === 'scene') e.push(...req(act, ['bg', 'targets', 'decoys', 'q']));
  if (act.mode === 'vanish') { e.push(...req(act, ['pool', 'show', 'q'])); if ((act.pool || []).length < act.show + 2) e.push(`${act.activity_id}: pool cần nhiều hơn số vật hiện ít nhất 2`); }
  if (act.mode === 'multi') e.push(...req(act, ['kinds', 'colors', 'rules']));
  return e;
}

export function generate(act, rng) {
  if (MT.MODES.has(act.mode)) return MT.generate(act, rng);
  const rounds = [], n = act.rounds || 1;
  for (let r = 0; r < n; r++) {
    if (act.mode === 'diff') {
      const sc = act.scenes[r % act.scenes.length]; const able = sc.objs.map((o, i) => i).filter(i => sc.objs[i].change !== false);
      const pick = rng.sample(able, act.n); const changes = pick.map(i => { const o = sc.objs[i]; const kinds = [...(o.recolor ? ['mau'] : []), 'mat']; const kind = rng.pick(kinds);
        return { i, kind, to: kind === 'mau' ? rng.pick(o.recolor) : null }; });
      rounds.push({ s: r % act.scenes.length, changes });
    }
    if (act.mode === 'scene') {
      const ts = rng.sample(act.targets.map((t, i) => i), act.find || 3);
      // Đặt vật theo lưới 4×3 để không chồng lên nhau, rồi lệch ngẫu nhiên trong ô
      const cells = rng.shuffle(Array.from({ length: 12 }, (_, i) => i)); let c = 0;
      const place = v => { const k = cells[c++ % 12]; return { v, x: 12 + (k % 4) * 25 + rng.int(-5, 5), y: 34 + Math.floor(k / 4) * 24 + rng.int(-3, 3) }; };
      const objs = [...ts.map(t => ({ ...place(act.targets[t].e), t })), ...rng.sample(act.decoys, Math.min(act.decoys.length, 12 - ts.length - 1)).map(d => place(d))];
      rounds.push({ ts, objs, cover: objs.filter(o => o.t !== undefined).map(o => ({ x: o.x + rng.int(-4, 4), y: o.y + 6 })) });
    }
    if (act.mode === 'vanish') {
      const show = rng.sample(act.pool, act.show); const k = act.missing || 1; const gone = rng.sample(show.map((x, i) => i), k);
      const others = rng.sample(act.pool.filter(x => !show.includes(x)), Math.max(0, (act.choices || 3) - k - 1)); const stay = rng.sample(show.filter((x, i) => !gone.includes(i)), 1);
      rounds.push({ show, gone, opts: rng.shuffle([...gone.map(i => show[i]), ...stay, ...others]) });
    }
    if (act.mode === 'multi') {
      const rule = act.rules[r % act.rules.length];
      const cells = act.cells || 12; const items = [];
      const want = { kind: rng.pick(act.kinds), color: rng.pick(act.colors), big: rng.pick([true, false]) };
      const match = it => it.kind === want.kind.k && (rule === 'kind-notcolor' ? it.color !== want.color : it.color === want.color) && (rule === 'kind-color-size' ? it.big === want.big : true);
      const nT = rng.int(2, 3);
      while (items.filter(match).length < nT) { const it = { kind: want.kind.k, color: rule === 'kind-notcolor' ? rng.pick(act.colors.filter(c => c !== want.color)) : want.color, big: rule === 'kind-color-size' ? want.big : rng.pick([true, false]) }; items.push(it); }
      // Vật gây nhiễu: chỉ sai MỘT điều kiện (cùng loại khác màu, cùng màu khác loại…) để bé phải xét đủ các điều kiện
      let guard = 0;
      while (items.length < cells && guard++ < 500) { const it = { kind: rng.pick(act.kinds).k, color: rng.pick(act.colors), big: rng.pick([true, false]) };
        const near = (it.kind === want.kind.k) + (it.color === want.color) >= 1; if (!match(it) && near) items.push(it); }
      rounds.push({ rule, want: { kind: want.kind.k, color: want.color, big: want.big }, items: rng.shuffle(items) });
    }
  }
  return { rounds };
}
const multiMatch = (R, it) => it.kind === R.want.kind && (R.rule === 'kind-notcolor' ? it.color !== R.want.color : it.color === R.want.color) && (R.rule === 'kind-color-size' ? it.big === R.want.big : true);
export function verify(act, v) {
  if (MT.MODES.has(act.mode)) return MT.verify(act, v);
  const e = [];
  v.rounds.forEach((R, k) => {
    const w = `${act.activity_id} vòng ${k + 1}`;
    if (act.mode === 'diff' && new Set(R.changes.map(c => c.i)).size !== act.n) e.push(`${w}: số điểm khác không đúng`);
    if (act.mode === 'diff') R.changes.forEach(c => { const o = act.scenes[R.s].objs[c.i]; if (c.kind === 'mau' && (c.to === colorOf(o.v))) e.push(`${w}: đổi màu trùng màu cũ`); });
    if (act.mode === 'scene' && R.objs.filter(o => o.t !== undefined).length !== R.ts.length) e.push(`${w}: thiếu vật cần tìm`);
    if (act.mode === 'scene') { const tv = new Set(R.ts.map(t => act.targets[t].e)); if (R.objs.some(o => o.t === undefined && tv.has(o.v))) e.push(`${w}: vật gây nhiễu trùng vật cần tìm`); }
    if (act.mode === 'vanish') { if (new Set(R.opts).size !== R.opts.length) e.push(`${w}: lựa chọn trùng`); R.gone.forEach(g => { if (!R.opts.includes(R.show[g])) e.push(`${w}: vật biến mất không có trong lựa chọn`); }); }
    if (act.mode === 'multi') { const n = R.items.filter(it => multiMatch(R, it)).length; if (n < 1) e.push(`${w}: không có vật thỏa điều kiện`); }
  });
  return e;
}
const colorOf = v => v.split(':')[2] || '';
const recolor = (v, c) => { const p = v.split(':'); p[2] = c; return p.join(':'); };
export const lines = act => MT.MODES.has(act.mode) ? MT.lines(act) : [...(act.intro || []), act.q, act.done, act.hint, act.look_again, act.again, act.each,
  ...(act.mode === 'scene' ? act.targets.flatMap(t => [fill(act.q, { name: t.name }), t.found]) : []),
  ...(act.mode === 'multi' ? multiLines(act) : []), okVi()].filter(Boolean);
function multiLines(act) { const L = []; for (const r of act.rules) for (const k of act.kinds) for (const c of act.colors) for (const b of r === 'kind-color-size' ? [true, false] : [null]) L.push(multiQ(act, r, k.k, c, b)); return L; }
export const multiQ = (act, rule, kind, color, big) => { const k = act.kinds.find(x => x.k === kind).name; const c = COLOR_NAMES[color] || color;
  return rule === 'kind-notcolor' ? `Bé chạm tất cả ${k} KHÔNG phải màu ${c}.` : rule === 'kind-color-size' ? `Bé chạm tất cả ${k} màu ${c} loại ${big ? 'to' : 'nhỏ'}.` : `Bé chạm tất cả ${k} màu ${c}.`; };

export async function mount(ctx, act, v) {
  if (MT.MODES.has(act.mode)) return MT.mount(ctx, act, v);
  for (let r = 0; r < v.rounds.length; r++) { await ({ diff, scene, vanish, multi })[act.mode](ctx, act, v.rounds[r], r === 0); ctx.tick?.(); }
}

/* ---------- Tìm điểm khác nhau ---------- */
function diff(ctx, act, R, first) {
  const { ui, voice } = ctx; const sc = act.scenes[R.s]; let found = new Set(), misses = 0;
  return new Promise(done => {
    const itemsL = sc.objs.map(o => ({ ...o, w: o.w || 16 }));
    const itemsR = sc.objs.map((o, i) => { const c = R.changes.find(c => c.i === i); if (!c) return { ...o, w: o.w || 16 }; if (c.kind === 'mat') return { ...o, v: '', w: o.w || 16 }; return { ...o, v: recolor(o.v, c.to), w: o.w || 16 }; });
    ui.scene(act.title, `<div class="diff"><div class="df-pic" data-p="L">${frameHTML({ bg: sc.bg, items: itemsL })}</div><div class="df-pic" data-p="R">${frameHTML({ bg: sc.bg, items: itemsR })}</div></div>
      <div class="df-count">${R.changes.map(() => '<i></i>').join('')}</div>`);
    const pics = [...ui.stage.querySelectorAll('.df-pic')], dots = [...ui.stage.querySelectorAll('.df-count i')];
    // Vùng chạm lấy từ vị trí THẬT của vật trên màn (không ước lượng), rộng hơn vật một lề để bé chạm gần cũng nhận;
    // vòng đánh dấu đặt đúng tâm vật (tam 26/11 18:35: vòng lệch khỏi mặt trời, con mèo; chạm đúng vật không ăn).
    const hits = R.changes.map(c => ({ c }));
    const geo = (p, h) => { const fr = p.querySelector('.frame').getBoundingClientRect(); const el = p.querySelectorAll('.fr-it')[h.c.i]; const r = el.getBoundingClientRect();
      const W = Math.max(r.width, r.height), pad = Math.max(28, W * .35);
      return { fr, cx: r.left + r.width / 2 - fr.left, cy: r.top + r.height / 2 - fr.top, hw: r.width / 2 + pad, hh: r.height / 2 + pad, d: W * 1.3 }; };
    const ring = (h, ok) => pics.forEach(p => { const g = geo(p, h); p.querySelector('.frame').insertAdjacentHTML('beforeend', `<span class="df-ring${ok ? '' : ' x'}" style="left:${g.cx / g.fr.width * 100}%;top:${g.cy / g.fr.height * 100}%;width:${g.d / g.fr.width * 100}%;"></span>`); });
    const tap = (p, x, y) => {
      const hit = hits.map(h => ({ h, g: geo(p, h) })).filter(({ h }) => !found.has(h.c.i))
        .map(o => ({ ...o, dx: Math.abs(x / 100 * o.g.fr.width - o.g.cx), dy: Math.abs(y / 100 * o.g.fr.height - o.g.cy) }))
        .filter(o => o.dx <= o.g.hw && o.dy <= o.g.hh).sort((a, b) => Math.hypot(a.dx, a.dy) - Math.hypot(b.dx, b.dy))[0]?.h;
      if (hit) { found.add(hit.c.i); ring(hit, true); dots[found.size - 1].classList.add('on');
        ctx.record({ skill_id: act.skill_id, correct: true, first_try: misses === 0, tries: misses + 1, hints: 0 }); misses = 0;
        if (found.size === hits.length) voice.say(['__jingle', act.done]).then(done); else { voice.speak(['__jingle']); mark(); } }
      else { misses++; const xx = p.querySelector('.frame'); xx.insertAdjacentHTML('beforeend', `<span class="df-miss" style="left:${x}%;top:${y}%"></span>`); setTimeout(() => ui.stage.querySelectorAll('.df-miss').forEach(m => m.remove()), 600);
        voice.speak(['__boing']); if (misses === 3 && act.hint) voice.say([act.hint]); }
    };
    globalThis.__luHit = () => hits.map(h => ({ i: h.c.i, found: found.has(h.c.i), pics: pics.map(p => { const g = geo(p, h); return { cx: g.cx + g.fr.left, cy: g.cy + g.fr.top, hw: g.hw, hh: g.hh }; }) }));
    pics.forEach(p => p.addEventListener('click', e => { if (voice.busy) return; const r = p.getBoundingClientRect(); tap(p, (e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100); }));
    const mark = () => { const h = hits.find(h => !found.has(h.c.i)); if (!h) return; const el = pics[1]; ctx.test.mark([el]); };
    setAuto(ctx, async () => { for (const h of hits) if (!found.has(h.c.i)) { const g = geo(pics[1], h); tap(pics[1], g.cx / g.fr.width * 100, g.cy / g.fr.height * 100); await sleep(ctx, 120); while (voice.busy) await sleep(ctx, 60); } }, () => tap(pics[1], 2, 2));
    mark();
    voice.say(first ? [...(act.intro || []), act.q] : [act.again || act.q]);
  });
}

/* ---------- Tìm đồ vật ẩn ---------- */
function scene(ctx, act, R, first) {
  const { ui, voice } = ctx; let k = 0, misses = 0;
  return new Promise(done => {
    const items = R.objs.map((o, i) => ({ v: o.v, x: o.x, y: o.y, w: o.t !== undefined ? (act.tw || 11) : (act.dw || 12), tap: true }));
    const covers = R.cover.map(c => ({ v: act.cover || 'art:bui-co', x: c.x, y: c.y, w: 13 }));
    ui.scene(act.title, `<div class="hid">${frameHTML({ bg: act.bg, items: [...items, ...covers] })}</div><div class="hid-list">${R.ts.map(t => `<span class="hl" data-t="${t}">${vis(act.targets[t].e)}</span>`).join('')}</div>`);
    const fr = ui.stage.querySelector('.hid .frame'); const its = [...fr.querySelectorAll('.fr-it.tap')];
    fr.querySelectorAll('.fr-it:not(.tap)').forEach(c => c.classList.add('cover'));
    const cur = () => R.ts[k]; const elOf = t => its[R.objs.findIndex(o => o.t === t)];
    const ask = () => fill(act.q, { name: act.targets[cur()].name });
    const markNext = () => { ui.stage.querySelectorAll('.hl').forEach(h => h.classList.toggle('now', +h.dataset.t === cur())); ctx.test.mark([elOf(cur())]); };
    const pick = el => { const o = R.objs[+el.dataset.i];
      if (o.t === cur()) { el.classList.add('found'); ui.stage.querySelector(`.hl[data-t="${cur()}"]`).classList.add('done');
        ctx.record({ skill_id: act.skill_id, correct: true, first_try: misses === 0, tries: misses + 1, hints: 0 }); misses = 0; const f = act.targets[cur()].found; k++;
        if (k >= R.ts.length) voice.say(['__jingle', f, act.done].filter(Boolean)).then(done); else { voice.say(['__jingle', f, ask()].filter(Boolean)); markNext(); } }
      else { misses++; ui.shake(el); voice.speak(['__boing']); if (misses === 3) { elOf(cur()).classList.add('hint'); if (act.hint) voice.say([act.hint]); } } };
    its.forEach(el => el.onclick = () => { if (!voice.busy) pick(el); });
    setAuto(ctx, () => pick(elOf(cur())), () => { const w = its.find(el => R.objs[+el.dataset.i].t !== cur()); if (w) pick(w); });
    markNext();
    voice.say(first ? [...(act.intro || []), ask()] : [ask()]);
  });
}

/* ---------- Vật nào biến mất ---------- */
function vanish(ctx, act, R, first) {
  const { ui, voice } = ctx; let wrong = 0, picked = new Set();
  return new Promise(done => {
    const tray = () => `<div class="vn-tray" style="--n:${R.show.length}">${R.show.map((s, i) => `<span class="vn-it" data-i="${i}">${vis(s)}</span>`).join('')}<div class="vn-cloth"></div></div>`;
    ui.scene(act.title, tray());
    const T = ui.stage.querySelector('.vn-tray');
    const look = async () => { T.classList.remove('covered', 'after'); T.querySelectorAll('.vn-it').forEach(x => x.classList.remove('gone')); await sleep(ctx, (act.look_ms || 3500)); T.classList.add('covered'); await sleep(ctx, 900); R.gone.forEach(g => T.querySelector(`.vn-it[data-i="${g}"]`).classList.add('gone')); T.classList.remove('covered'); T.classList.add('after'); };
    const ask = () => {
      const box = ui.answers(R.gone.length > 1 ? 'Bé chọn hai vật đã biến mất' : 'Vật nào đã biến mất?', R.opts.map((o, i) => `<button class="opt face vn-opt" data-i="${i}">${vis(o)}</button>`).join('') + `<button class="big-btn alt vn-again">Xem lại</button>`);
      const goneVals = R.gone.map(g => R.show[g]);
      const okBtns = () => [...box.querySelectorAll('.vn-opt')].filter(b => goneVals.includes(R.opts[+b.dataset.i]) && !picked.has(+b.dataset.i));
      ctx.test.mark(okBtns()[0]);
      box.querySelector('.vn-again').onclick = async () => { if (voice.busy) return; box.style.visibility = 'hidden'; await look(); box.style.visibility = ''; };
      box.addEventListener('click', e => { const b = e.target.closest('.vn-opt'); if (!b || voice.busy || picked.has(+b.dataset.i)) return; const val = R.opts[+b.dataset.i];
        if (goneVals.includes(val)) { picked.add(+b.dataset.i); b.classList.add('right');
          if (picked.size === goneVals.length) { T.querySelectorAll('.vn-it.gone').forEach(x => x.classList.replace('gone', 'back')); ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0 }); voice.say(['__jingle', act.done]).then(done); }
          else { voice.speak(['__jingle']); ctx.test.mark(okBtns()[0]); } }
        else { wrong++; ui.shake(b); voice.speak(['__boing']); if (wrong === 2 && act.look_again) voice.say([act.look_again]); } });
      setAuto(ctx, async () => { for (const b of okBtns()) { b.click(); await sleep(ctx, 80); while (voice.busy) await sleep(ctx, 60); } }, () => box.querySelector('.vn-opt:not(.right)') && [...box.querySelectorAll('.vn-opt')].find(b => !goneVals.includes(R.opts[+b.dataset.i]))?.click());
      voice.say([act.q]);
    };
    voice.say(first ? [...(act.intro || [])] : [act.again].filter(Boolean)).then(look).then(ask);
  });
}

/* ---------- Tìm theo nhiều điều kiện ---------- */
function multi(ctx, act, R, first) {
  const { ui, voice } = ctx; let misses = 0;
  return new Promise(done => {
    const q = multiQ(act, R.rule, R.want.kind, R.want.color, R.want.big);
    ui.scene(act.title, '');
    const box = ui.answers(act.label || 'Chạm tất cả hình đúng', `<div class="grid mg" style="grid-template-columns:repeat(${act.cols || 4},minmax(0,1fr));--ar:${(act.cols || 4) / Math.ceil(R.items.length / (act.cols || 4))}">${R.items.map((it, i) => `<button class="opt cell-f mt${it.big ? ' big' : ' small'}" data-i="${i}">${vis(`art:${it.kind}:${encodeURIComponent(LAB_COLORS[it.color] || it.color)}`)}</button>`).join('')}</div>`);
    const btns = [...box.querySelectorAll('.mt')]; const good = btns.filter(b => multiMatch(R, R.items[+b.dataset.i]));
    let left = good.length;
    const markNext = () => ctx.test.mark(good.find(b => !b.classList.contains('right')));
    box.addEventListener('click', e => { const b = e.target.closest('.mt'); if (!b || voice.busy || b.classList.contains('right')) return;
      if (good.includes(b)) { b.classList.add('right'); left--; if (!left) { ctx.record({ skill_id: act.skill_id, correct: true, first_try: misses === 0, tries: misses + 1, hints: 0 }); voice.say(['__jingle', act.done]).then(done); } else { voice.speak(['__jingle']); markNext(); } }
      else { misses++; ui.shake(b); voice.speak(['__boing']); if (misses === 2) voice.say([q]); } });
    setAuto(ctx, async () => { for (const b of good) { if (!b.classList.contains('right')) { b.click(); await sleep(ctx, 60); while (voice.busy) await sleep(ctx, 50); } } }, () => btns.find(b => !good.includes(b))?.click());
    markNext();
    voice.say(first ? [...(act.intro || []), q] : [q]);
  });
}

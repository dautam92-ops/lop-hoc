// E01 – Chạm chọn. Ba cách sinh vòng chơi:
//   items  : danh sách câu soạn sẵn (cảm xúc, so sánh đĩa…), trộn thứ tự đáp án
//   count  : đếm vật trong cảnh rồi chọn số (chạm từng vật để đếm)
//   listen : nghe từ rồi chạm đúng hình (phần tiếng Anh)
import { fill, luArt, esc } from '../core/lu-core.js';
import { optHTML, verifyChoice, need, onTap, BAL_COLORS, balloonSVG, vis, LETTERS, letterLine, optSay, textOpts, readOptLines } from './common.js';
import * as MORE from './e01-more.js';
const showHTML = s => Array.isArray(s) ? s.map(x => `<span class="sv">${vis(x)}</span>`).join('') : vis(s || '');

export const id = 'E01', version = '1.0.0', name = 'Chạm chọn';

export function validate(act) {
  if (MORE.MORE.has(act.mode)) return MORE.validate(act);
  const e = need(act, ['mode', 'skill_id', 'title']);
  if (act.mode === 'items') { if (!act.items?.length) e.push(`${act.activity_id}: thiếu items`); act.items?.forEach((it, k) => e.push(...verifyChoice(it.opts, it.any ? 0 : it.a, `${act.activity_id} câu ${k + 1}`, !!it.word))); }
  if (act.mode === 'count') { e.push(...need(act, ['pool', 'words', 'q', 'ok', 'no'])); if (act.words && act.pool && Math.max(...act.pool) > act.words.length) e.push(`${act.activity_id}: thiếu chữ số đọc`); }
  if (act.mode === 'listen') { e.push(...need(act, ['words'])); if ((act.words || []).length < 2) e.push(`${act.activity_id}: cần ít nhất 2 từ`); }
  if (!['items', 'count', 'listen'].includes(act.mode)) e.push(`${act.activity_id}: mode không hợp lệ`);
  return e;
}

export function generate(act, rng) {
  if (MORE.MORE.has(act.mode)) return MORE.generate(act, rng);
  if (act.mode === 'items') {
    let items = act.items.map((it, k) => k);
    if (act.order !== 'fixed') items = rng.shuffle(items);
    if (act.rounds) items = items.slice(0, act.rounds);
    return { rounds: items.map(k => ({ item: k, order: rng.shuffle(act.items[k].opts.map((o, i) => i)) })) };
  }
  if (act.mode === 'count') return { rounds: rng.sample(act.pool, act.rounds || 3).map(n => ({ n, color0: rng.int(0, 4) })) };
  const words = act.words.map((w, i) => i);
  const targets = rng.sample(words, act.rounds || words.length);
  return { rounds: targets.map(t => ({ target: t, order: rng.shuffle(words) })) };
}

// Đáp án đúng của một vòng: chỉ số trong mảng phương án gốc
export function answerOf(act, round) {
  if (act.mode === 'items') return act.items[round.item].a;
  if (act.mode === 'count') return act.pool.indexOf(round.n);
  return round.target;
}

export function verify(act, variant) {
  if (MORE.MORE.has(act.mode)) return MORE.verify(act, variant);
  const e = [];
  variant.rounds.forEach((r, k) => {
    const where = `${act.activity_id} vòng ${k + 1}`;
    if (act.mode === 'items') { const it = act.items[r.item]; e.push(...verifyChoice(it.opts, it.any ? 0 : it.a, where, !!it.word)); if (it.any && it.opts.some(o => !o.say || !(o.reply || it.ok))) e.push(`${where}: câu chọn tự do cần lời đọc và lời đáp cho từng lựa chọn`); if (new Set(r.order).size !== it.opts.length) e.push(`${where}: thứ tự đáp án hỏng`); }
    if (act.mode === 'count') { if (!act.pool.includes(r.n)) e.push(`${where}: số không có trong lựa chọn`); if (r.n < 1 || r.n > (act.max || 10)) e.push(`${where}: số ngoài phạm vi tuổi`); try { fill(act.ok, { word: act.words[r.n - 1] }); } catch (x) { e.push(`${where}: ${x.message}`); } }
    if (act.mode === 'listen') { if (!(r.target >= 0 && r.target < act.words.length)) e.push(`${where}: từ đích không có`); }
  });
  if (variant.rounds.length === 0) e.push(`${act.activity_id}: không có vòng nào`);
  return e;
}

// Các câu sẽ được đọc – để kiểm tra đủ giọng (S06-R03)
export function lines(act) {
  if (MORE.MORE.has(act.mode)) return MORE.lines(act);
  const L = [...(act.intro || [])];
  if (act.mode === 'items') act.items.forEach(it => { L.push(it.word, ...[].concat(it.q), ...[].concat(it.ok), it.any ? null : (it.no || act.no)); it.opts.forEach(o => { o.say && L.push(o.say); o.reply && L.push(o.reply); }); if (textOpts(it.opts, it.style || act.style)) L.push(...LETTERS.slice(0, it.opts.length).map(letterLine), ...it.opts.map(optSay)); });
  if (act.mode === 'count') { L.push(act.hint, act.q, act.no, ...act.words); act.pool.forEach(n => L.push(fill(act.ok, { word: act.words[n - 1] }))); }
  if (act.mode === 'listen') act.words.forEach(w => L.push(w.w, w.ok));
  return L.filter(Boolean);
}

export async function mount(ctx, act, variant) {
  if (MORE.MORE.has(act.mode)) return MORE.mount(ctx, act, variant);
  for (let r = 0; r < variant.rounds.length; r++) { await round(ctx, act, variant.rounds[r], r === 0); ctx.tick?.(); }
}

// Chọn đáp án để hoàn thiện hình: đáp án tự bay từ ô chọn vào ô trống trong tranh (tam 26/11 19:57, quy tắc 34)
function bayVao(ctx, btn, dich) {
  dich.dataset.filled = '1';
  const src = btn.querySelector('.sym') || btn.firstElementChild || btn;
  const dat = () => { if (src.classList.contains('sym') && dich.classList.contains('sym')) { dich.innerHTML = src.innerHTML; dich.classList.remove('q'); } else dich.innerHTML = src.outerHTML; dich.classList.add('da-ghep'); };
  if (ctx.fast) return dat();
  const a = src.getBoundingClientRect(), z = dich.getBoundingClientRect();
  const g = src.cloneNode(true); g.classList.add('bay'); Object.assign(g.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', margin: 0, zIndex: 60, pointerEvents: 'none', transformOrigin: '0 0', transition: 'transform .6s cubic-bezier(.3,.7,.3,1)' });
  (btn.closest('.lu-lesson') || document.body).appendChild(g); g.getBoundingClientRect();
  g.style.transform = `translate(${z.left - a.left}px, ${z.top - a.top}px) scale(${z.width / a.width}, ${z.height / a.height})`;
  setTimeout(() => { dat(); g.remove(); }, 620);
}

function round(ctx, act, R, first) {
  const { ui, voice } = ctx; let tries = 0, hints = 0;
  return new Promise(done => {
    let opts, order, ans, style, q, okKeys, noKeys, label;
    if (act.mode === 'items') {
      const it = act.items[R.item]; opts = it.opts; order = R.order; ans = it.any ? -1 : it.a; R._any = it.any ? it : null; style = it.style || act.style || 'face'; q = [...Array(it.word ? (it.word_times ?? 1) : 0).fill(it.word), ...[].concat(it.q)].filter(Boolean); /* q có thể là chuỗi câu: "__sang" làm chữ tiếng Anh sáng lên, "__cho3" chờ 3 giây cho bé nói theo */ /* word: từ tiếng Anh đọc riêng bằng giọng bản địa, hiện chữ to (tam 28/11) */
      okKeys = i => [opts[i].say, '__jingle', ...[].concat(it.ok)]; noKeys = i => [opts[i].say, '__boing', it.no || act.no];
      label = it.label || act.label || 'Bé chọn một đáp án';
      ui.scene(it.title || act.title, act.scene === 'lu' ? luArt(it.lu || act.lu || 'to-mo') : `<div class="story${it.shadow || act.shadow ? ' bong-den' : ''}">${it.word && it.opts.length > 1 ? `<div class="en-word" lang="en">${esc(it.word)}</div>` : ''}${showHTML(it.show)}</div>`);
    } else if (act.mode === 'count') {
      opts = act.pool.map(v => ({ v })); order = opts.map((o, i) => i); ans = act.pool.indexOf(R.n); style = 'number'; q = [act.q];
      okKeys = () => ['__jingle', fill(act.ok, { word: act.words[R.n - 1] })]; noKeys = () => ['__boing', act.no, act.hint];
      label = act.label || 'Bé chọn số';
      ui.scene(act.title, `<div class="balloons">${Array.from({ length: R.n }, (_, i) => `<button class="bal" aria-label="vật ${i + 1}">${act.object === 'emoji' ? `<span class="obj">${esc(act.emoji)}</span>` : act.object ? `<span class="obj art">${vis(act.object)}</span>` : balloonSVG(BAL_COLORS[(i + R.color0) % 5])}<b></b></button>`).join('')}</div>`);
      let counted = 0;
      onTap(ui.stage.querySelector('.balloons'), '.bal', voice, b => { if (b.dataset.c) return; counted++; b.dataset.c = counted; b.querySelector('b').textContent = counted; voice.say(act.words[counted - 1]); });
      R._reset = () => { counted = 0; ui.stage.querySelectorAll('.bal').forEach(x => { delete x.dataset.c; x.querySelector('b').textContent = ''; }); };
    } else {
      opts = act.words.map(w => ({ e: w.e, c: w.c, w: w.w })); order = R.order; ans = R.target; style = act.words[0].c ? 'color' : 'face';
      const w = act.words[R.target]; q = [w.w];
      okKeys = () => ['__ok', w.ok]; noKeys = () => ['__no', w.w];
      label = act.label || 'Listen and touch';
      ui.scene(act.title, luArt('vay-tay'));
    }
    // D43 (chị tam 26/11 02:26): đáp án là chữ cần đọc hiểu → gắn nhãn A, B, C và Lu đọc "Đáp án A…" bằng tiếng Việt, cho mọi bài.
    const readOpts = act.mode === 'items' && textOpts(opts, style);
    const box = ui.answers(label, order.map((i, k) => optHTML(opts[i], i, style, readOpts ? LETTERS[k] : '')).join(''));
    if (R._any) box.dataset.any = '1';
    // Màn học từ (tam 28/11): một ảnh thật to, chữ tiếng Anh to ngay dưới ảnh, bé chạm vào ảnh để nghe lại và nói theo
    if (act.mode === 'items' && act.items[R.item].word && opts.length === 1) { box.classList.add('hoc-tu'); const o = box.querySelector('.opt'); o.classList.add('hoc-tu'); o.insertAdjacentHTML('beforeend', `<span class="en-word" lang="en">${esc(act.items[R.item].word)}</span>`); }
    if (readOpts) q = [...q, ...readOptLines(order.map(i => opts[i]))];
    ctx.test.mark(box.querySelector(ans < 0 ? '.opt' : `[data-i="${ans}"]`));
    const en = act.mode === 'listen';
    onTap(box, '.opt', voice, b => {
      const i = +b.dataset.i;
      // Câu tình huống EQ: mọi lựa chọn đều được đáp lại tôn trọng, không chấm đúng sai (S01-R07)
      if (R._any) { b.classList.add('right'); ctx.record({ skill_id: act.skill_id, kind: 'participation', choice: i, correct: true, first_try: true, tries: 1, hints: 0 }); voice.say([opts[i].say, opts[i].reply || R._any.ok].filter(Boolean)).then(done); return; }
      if (i === ans) {
        const dich = ui.stage.querySelector('.story [data-dich], .story .sym.q'); if (dich) bayVao(ctx, b, dich);
        b.classList.add('right');
        ctx.record({ skill_id: act.skill_id, correct: true, first_try: tries === 0, tries: tries + 1, hints });
        (en ? voice.speak(okKeys(i)) : voice.say(okKeys(i))).then(done);
      } else {
        tries++; if (!(act.mode === 'items' && (style === 'face' || style === 'wide'))) ui.shake(b);
        if (R._reset) R._reset();
        // Gợi ý tăng dần: từ lần sai thứ 2 mới làm sáng nhẹ ô đúng (S02-R07, S02-R11)
        if (tries === 2 && act.hint_glow !== false) { hints = 1; box.querySelector(`[data-i="${ans}"]`).classList.add('hint'); }
        en ? voice.speak(noKeys(i)) : voice.say(noKeys(i));
      }
    });
    const qAll = first ? [...(act.intro || []), ...(act.mode === 'count' ? [act.hint] : []), ...q] : q; const iS = qAll.indexOf('__sang');
    if (iS < 0) voice.say(qAll); else voice.say(qAll.slice(0, iS)).then(() => { ui.stage.querySelectorAll('.en-word').forEach(w => w.classList.add('sang')); return voice.say(qAll.slice(iS + 1)); }).then(() => ui.stage.querySelectorAll('.en-word').forEach(w => w.classList.remove('sang')));
  });
}

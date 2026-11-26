// E10 – Truyện tương tác rẽ nhánh và hội thoại.
// Một hoạt động là đồ thị các cảnh (nodes). Mỗi cảnh: khung tranh, lời kể, có thể có câu hỏi.
// Ba loại lựa chọn:
//   "mo"     : tình huống EQ / sáng tạo, mọi lựa chọn đều được Lu đáp lại tôn trọng và dẫn sang hệ quả riêng (S01-R07, không chấm đúng sai)
//   "du-doan": bé đoán chuyện gì xảy ra tiếp; đoán nào cũng được, rồi truyện kể tiếp và Lu nói kết quả thật
//   "hieu"   : câu hỏi hiểu truyện có một đáp án đúng (a); chọn sai thì Lu nhắc lại chi tiết và cho chọn lại
import { vis, esc, sleep, setAuto, frameHTML, req } from './kit.js';
import { LETTERS, letterLine } from './common.js';

export const id = 'E10', version = '1.0.0', name = 'Truyện tương tác rẽ nhánh';

export function validate(act) {
  const e = req(act, ['skill_id', 'title', 'nodes', 'start']);
  const N = act.nodes || {};
  if (!N[act.start]) e.push(`${act.activity_id}: thiếu cảnh bắt đầu "${act.start}"`);
  for (const [k, n] of Object.entries(N)) {
    if (!n.say?.length && !n.q) e.push(`${act.activity_id} cảnh ${k}: cần lời kể hoặc câu hỏi`);
    (n.choices || []).forEach((c, i) => { if (c.next && !N[c.next]) e.push(`${act.activity_id} cảnh ${k}: lựa chọn ${i + 1} dẫn tới cảnh không có "${c.next}"`); if (!c.say) e.push(`${act.activity_id} cảnh ${k}: lựa chọn ${i + 1} cần lời đọc`); });
    if (n.kind === 'hieu' && !(n.a >= 0 && n.a < (n.choices || []).length)) e.push(`${act.activity_id} cảnh ${k}: câu hỏi hiểu truyện thiếu đáp án`);
    if (n.choices && n.next) e.push(`${act.activity_id} cảnh ${k}: cảnh có lựa chọn thì không dùng next chung`);
  }
  return e;
}
export const generate = (act, rng) => ({ rounds: [{ shuffle: Object.fromEntries(Object.entries(act.nodes).filter(([, n]) => n.choices).map(([k, n]) => [k, act.fixed ? n.choices.map((c, i) => i) : rng.shuffle(n.choices.map((c, i) => i))])) }] });
export function verify(act) {
  // Mọi cảnh phải tới được kết thúc (không có vòng lặp chết)
  const e = [], N = act.nodes, ok = new Set();
  const ends = k => { if (ok.has(k)) return true; const n = N[k]; if (!n) return false; const nx = n.choices ? n.choices.map(c => c.next).filter(Boolean) : [n.next].filter(Boolean); if (!nx.length) { ok.add(k); return true; } ok.add(k); return nx.every(ends); };
  if (!ends(act.start)) e.push(`${act.activity_id}: có nhánh không tới được kết thúc`);
  return e;
}
export const lines = act => Object.values(act.nodes).flatMap(n => [...(n.say || []), n.q, n.no, ...(n.choices || []).flatMap((c, i) => [c.say, ...(c.reply || []), letterLine(LETTERS[i])])]).concat(act.intro || []).filter(Boolean);

export async function mount(ctx, act, v) {
  const { voice } = ctx; let k = act.start, first = true, steps = 0;
  if (act.intro?.length) await voice.say(act.intro);
  while (k && steps++ < 40) { k = await scene(ctx, act, act.nodes[k], k, v.rounds[0].shuffle[k], first); first = false; }
}

function scene(ctx, act, n, key, order, first) {
  const { ui, voice } = ctx;
  return new Promise(resolve => {
    ui.scene(n.title || act.title, frameHTML({ bg: n.bg || act.bg, items: n.items || [] , cls: n.big ? 'big' : '' }));
    const go = () => {
      if (!n.choices) {
        if (n.end || !n.next) { ctx.record({ skill_id: act.skill_id, kind: 'participation', correct: true, first_try: true, tries: 1, hints: 0, node: key }); return resolve(null); }
        const box = ui.answers(n.label || 'Bé chạm để nghe tiếp', `<button class="big-btn done-btn">${esc(n.button || 'Tiếp nào')}</button>`);
        const b = box.querySelector('.done-btn'); ctx.test.mark(b); setAuto(ctx, null, null);
        b.onclick = () => { if (!voice.busy) resolve(n.next); }; return;
      }
      const ch = order.map(i => [i, n.choices[i]]);
      const style = n.style || (ch.some(([, c]) => c.t) ? 'wide' : 'face');
      const box = ui.answers(n.label || (n.kind === 'hieu' ? 'Bé chọn câu trả lời' : 'Bé chọn một cách'), ch.map(([i, c], j) =>
        `<button class="opt ${style} br-opt" data-i="${i}" aria-label="Đáp án ${LETTERS[j]}">${style === 'wide' ? `<span class="opt-letter" aria-hidden="true">${LETTERS[j]}</span>` : ''}${c.e ? `<span class="em">${vis(c.e)}</span>` : ''}${c.t ? esc(c.t) : ''}</button>`).join(''));
      const good = n.kind === 'hieu' ? n.a : (n.choices.findIndex(c => c.tot) >= 0 ? n.choices.findIndex(c => c.tot) : order[0]);
      const bad = n.kind === 'hieu' ? order.find(i => i !== n.a) : n.choices.findIndex(c => c.tot === false);
      ctx.test.mark(box.querySelector(`[data-i="${good}"]`));
      setAuto(ctx, () => box.querySelector(`[data-i="${good}"]`)?.click(), bad >= 0 ? () => box.querySelector(`[data-i="${bad}"]`)?.click() : null);
      let tries = 0;
      box.addEventListener('click', e => {
        const b = e.target.closest('.br-opt'); if (!b || voice.busy) return; const i = +b.dataset.i, c = n.choices[i];
        if (n.kind === 'hieu') {
          if (i !== n.a) { tries++; ui.shake(b); voice.say([c.say, '__boing', ...(c.reply || []), n.no].filter(Boolean)); if (tries >= 2) box.querySelector(`[data-i="${n.a}"]`).classList.add('hint'); return; }
          b.classList.add('right'); ctx.record({ skill_id: act.skill_id, correct: true, first_try: tries === 0, tries: tries + 1, hints: tries >= 2 ? 1 : 0, node: key });
          voice.say([c.say, '__jingle', ...(c.reply || [])]).then(() => resolve(c.next || null)); return;
        }
        // Lựa chọn mở / dự đoán: không chấm, ghi lại lựa chọn để bố mẹ trò chuyện cùng bé
        box.querySelectorAll('.br-opt').forEach(x => x.disabled = true); b.classList.add('chosen');
        ctx.record({ skill_id: act.skill_id, kind: 'participation', correct: true, first_try: true, tries: 1, hints: 0, node: key, choice: i, tag: c.tag || n.kind || 'mo' });
        voice.say([c.say, ...(c.reply || [])]).then(() => resolve(c.next || null));
      });
      // Đáp án dạng chữ: đọc "Đáp án A…" (D43)
      if (style === 'wide') return voice.say([n.q, ...ch.flatMap(([, c], j) => [letterLine(LETTERS[j]), c.say])].filter(Boolean));
      voice.say([n.q].filter(Boolean));
    };
    voice.say(n.say || []).then(go);
  });
}

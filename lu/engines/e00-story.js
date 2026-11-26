// E00 – Chặng kể chuyện bằng tranh (D42, S02-R03): Lu và đồ vật đứng trên bối cảnh, giọng kể từng câu,
// bé chạm vào đồ vật (hoặc nút "Tiếp") để đi tiếp. Không chấm; ghi "đã tham gia" nếu có skill_id.
import { luArt, esc } from '../core/lu-core.js';
import { vis } from '../ui/art.js';
import { need } from './common.js';
import * as MORE from './e00-more.js';

export const id = 'E00', version = '1.0.0', name = 'Kể chuyện bằng tranh';

export function validate(act) {
  if (MORE.MORE.has(act.mode)) return MORE.validate(act);
  const e = need(act, ['title', 'story']);
  if (act.story && !Array.isArray(act.story)) e.push(`${act.activity_id}: story phải là danh sách câu`);
  if ((act.tap || act.explore) && !act.props?.length) e.push(`${act.activity_id}: tap/explore cần có props để chạm`);
  if (act.explore) (act.props || []).forEach((p, i) => { if (!p.say) e.push(`${act.activity_id}: đồ vật ${i + 1} cần lời đọc "say" khi chạm`); });
  return e;
}
export const generate = (act, rng) => MORE.MORE.has(act.mode) ? MORE.generate(act, rng) : ({ rounds: [{}] });
export const verify = () => [];
export const lines = act => MORE.MORE.has(act.mode) ? MORE.lines(act) : [...(act.intro || []), ...(act.story || []), act.after, ...(act.props || []).flatMap(p => [p.say, p.en])].filter(Boolean);

export function mount(ctx, act, v) {
  if (MORE.MORE.has(act.mode)) return MORE.mount(ctx, act, v);
  const { ui, voice } = ctx;
  return new Promise(done => {
    const props = (act.props || []).map((p, i) => `<button class="prop" data-i="${i}" aria-label="${esc(p.name || 'đồ vật')}">${vis(p.e)}</button>`).join('');
    const sc = ui.scene(act.title, `${act.lu === false ? '' : luArt(act.lu || 'vui')}${props ? `<div class="props">${props}</div>` : ''}`);
    sc.classList.add('story');
    const finish = () => { ctx.record({ skill_id: act.skill_id || null, kind: 'participation', correct: true, first_try: true, tries: 1, hints: 0 }); done(); };
    voice.say([...(act.intro || []), ...act.story]).then(() => {
      if (act.explore) {
        // Chạm và nghe (D46): mỗi đồ vật đọc tên tiếng Việt, rồi từ tiếng Anh tách đoạn riêng; chạm đủ mới đi tiếp
        const ps = [...sc.querySelectorAll('.prop')], seen = new Set(); ctx.test.mark(ps[0]);
        ps.forEach(b => b.onclick = () => { if (voice.busy) return; const p = act.props[+b.dataset.i]; b.classList.add('right'); seen.add(b.dataset.i);
          voice.say([p.say, p.en].filter(Boolean)).then(() => { const nx = ps.find(x => !seen.has(x.dataset.i)); if (nx) ctx.test.mark(nx); if (seen.size === ps.length) voice.say([act.after].filter(Boolean)).then(finish); }); });
      } else if (act.tap) {
        const ps = [...sc.querySelectorAll('.prop')]; ctx.test.mark(ps[0]);
        ps.forEach(b => b.onclick = () => { if (voice.busy) return; b.classList.add('right'); voice.say([act.after].filter(Boolean)).then(finish); });
      } else {
        const box = ui.answers(act.label || 'Bé chạm để đi tiếp', `<button class="big-btn done-btn">${esc(act.button || 'Đi tiếp')}</button>`);
        const b = box.querySelector('.done-btn'); ctx.test.mark(b);
        b.onclick = () => { if (voice.busy) return; voice.say([act.after].filter(Boolean)).then(finish); };
      }
    });
  });
}

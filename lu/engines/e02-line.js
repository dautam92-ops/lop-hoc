// E02 – Ghép cặp: chế độ "line" – nối hai cột bằng nét kéo tay (cách học 17). Kéo từ hình bên trái sang hình bên phải;
// cũng có thể chạm hình trái rồi chạm hình phải. Nối đúng: nét ở lại; nối sai: nét co về, âm nhẹ.
import { vis, sleep, setAuto, req } from './kit.js';
export const MORE = new Set(['line']);
export function validate(act) { const e = req(act, ['skill_id', 'title', 'sets', 'done']); (act.sets || []).forEach((s, i) => { if (s.length < 2 || s.length > 5) e.push(`${act.activity_id} bộ ${i + 1}: cần 2–5 cặp`); if (new Set(s.map(p => p.target)).size !== s.length) e.push(`${act.activity_id} bộ ${i + 1}: hai đích trùng nhau`); }); return e; }
// Hai cột luôn lệch nhau (không để cặp nào nằm thẳng hàng hết cả bảng)
export const generate = (act, rng) => ({ rounds: rng.sample(act.sets.map((s, i) => i), act.rounds || act.sets.length).map(i => { const ix = act.sets[i].map((p, j) => j); const L = rng.shuffle(ix); let R, g = 0; do { R = rng.shuffle(ix); } while (R.every((x, j) => x === L[j]) && g++ < 50); return { i, L, R }; }) });
export const verify = (act, v) => v.rounds.flatMap((r, k) => r.L.every((x, j) => x === r.R[j]) ? [`${act.activity_id} vòng ${k + 1}: hai cột đang thẳng hàng, chưa xáo`] : []);
export const lines = act => [...(act.intro || []), act.again, act.done, ...act.sets.flat().map(p => p.ok)].filter(Boolean);
export async function mount(ctx, act, v) { for (let r = 0; r < v.rounds.length; r++) { await round(ctx, act, v.rounds[r], r === 0); ctx.tick?.(); } }
function round(ctx, act, R, first) {
  const { ui, voice } = ctx; const S = act.sets[R.i]; let left = S.length, wrong = 0, from = null;
  return new Promise(done => {
    ui.scene(act.title, `<div class="lines"><svg class="ln-svg"></svg><div class="ln-col l">${R.L.map(j => `<button class="opt face ln-a" data-j="${j}">${vis(S[j].piece)}<i class="dot"></i></button>`).join('')}</div>
      <div class="ln-col r">${R.R.map(j => `<button class="opt face ln-b" data-j="${j}"><i class="dot"></i>${vis(S[j].target)}</button>`).join('')}</div></div>`);
    const box = ui.stage.querySelector('.lines'), svg = box.querySelector('.ln-svg');
    const pt = (el, side) => { const b = box.getBoundingClientRect(), r = el.getBoundingClientRect(); return [side === 'l' ? r.right - b.left : r.left - b.left, r.top + r.height / 2 - b.top]; };
    let tmp = null;
    const line = (a, b, cls) => { const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', b[0]); l.setAttribute('y2', b[1]); l.setAttribute('class', cls); svg.appendChild(l); return l; };
    const markNext = () => { const a = box.querySelector('.ln-a:not(.right)'); if (a) ctx.test.mark([a, box.querySelector(`.ln-b[data-j="${a.dataset.j}"]`)]); };
    const connect = (a, b) => {
      if (!a || !b || a.classList.contains('right')) return;
      if (a.dataset.j === b.dataset.j) { a.classList.add('right'); b.classList.add('right'); line(pt(a, 'l'), pt(b, 'r'), 'ln ok'); left--;
        ctx.record({ skill_id: act.skill_id, correct: true, first_try: wrong === 0, tries: wrong + 1, hints: 0 }); wrong = 0;
        const ok = S[+a.dataset.j].ok; if (!left) voice.say(['__jingle', ok, act.done].filter(Boolean)).then(done); else { voice.say(['__jingle', ok].filter(Boolean)); markNext(); } }
      else { wrong++; const l = line(pt(a, 'l'), pt(b, 'r'), 'ln bad'); setTimeout(() => l.remove(), 450); ui.shake(b); voice.speak(['__boing']); if (wrong >= 2) box.querySelector(`.ln-b[data-j="${a.dataset.j}"]`).classList.add('hint'); }
    };
    box.addEventListener('pointerdown', e => { const a = e.target.closest('.ln-a'); if (!a || voice.busy || a.classList.contains('right')) return; e.preventDefault(); from = a; box.querySelectorAll('.ln-a').forEach(x => x.classList.toggle('sel', x === a));
      const p0 = pt(a, 'l'); tmp = line(p0, p0, 'ln tmp');
      const mv = ev => { const b = box.getBoundingClientRect(); tmp.setAttribute('x2', ev.clientX - b.left); tmp.setAttribute('y2', ev.clientY - b.top); };
      const up = ev => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); tmp.remove(); const t = document.elementsFromPoint(ev.clientX, ev.clientY).find(x => x.classList?.contains('ln-b')); if (t) { connect(from, t); from = null; box.querySelectorAll('.ln-a').forEach(x => x.classList.remove('sel')); } };
      addEventListener('pointermove', mv); addEventListener('pointerup', up); });
    box.addEventListener('click', e => { const b = e.target.closest('.ln-b'); if (!b || voice.busy || !from) return; connect(from, b); from = null; box.querySelectorAll('.ln-a').forEach(x => x.classList.remove('sel')); });
    setAuto(ctx, async () => { for (const a of box.querySelectorAll('.ln-a:not(.right)')) { connect(a, box.querySelector(`.ln-b[data-j="${a.dataset.j}"]`)); await sleep(ctx, 60); while (voice.busy) await sleep(ctx, 50); } },
      () => { const a = box.querySelector('.ln-a:not(.right)'); if (a) connect(a, box.querySelector(`.ln-b:not([data-j="${a.dataset.j}"]):not(.right)`)); });
    markNext();
    voice.say(first ? act.intro || [] : [act.again || act.intro?.[0]].filter(Boolean));
  });
}

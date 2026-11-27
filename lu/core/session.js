// Buổi học nhiều chặng (D42, S02-R02): trải phẳng chặng và ước tính thời lượng.
// Không phụ thuộc DOM: dùng được trong trình duyệt, lint, Quality Gate.

// Gói bài có `stages` (mỗi chặng: title, backdrop {id, kind}, activities) → thêm `activities` phẳng.
export function normalizeLesson(pkg) {
  if (!pkg?.stages || pkg.activities) return pkg;
  const activities = pkg.stages.flatMap((st, i) => (st.activities || []).map(a => ({ ...a, step: st.title, _stage: i, _bd: st.backdrop || null })));
  return { ...pkg, activities };
}

// Ước tính thời lượng (phút). Giọng đọc khoảng 12 ký tự/giây + 0,8 giây nghỉ mỗi câu;
// thời gian bé nghĩ và thao tác theo từng dạng bài. Đo lại bằng phiên thật khi thử với trẻ.
const say = t => (typeof t === 'string' && !t.startsWith('__') ? t.length / 12 + 0.8 : 0);
const sayAll = a => (a || []).reduce((s, t) => s + say(t), 0);
// Hoạt động có chấm đúng sai cộng thêm 25% cho lượt thử lại và gợi ý (S02-R11). Hệ số này là giả định,
// sẽ hiệu chỉnh bằng thời gian thật đo được khi thử với trẻ (V4.0, giai đoạn 7).
export const RETRY_FACTOR = 1.25;
const GRADED = a => !['E00', 'E15'].includes(a.engine) && !(a.engine === 'E01' && a.mode === 'items' && a.items?.every(it => it.any));
export function estimateSeconds(act) { return Math.round(rawSeconds(act) * (GRADED(act) ? RETRY_FACTOR : 1)); }
function rawSeconds(act) {
  const r = act.rounds || 1; let sec = sayAll(act.intro);
  switch (act.engine) {
    case 'E00': sec += sayAll(act.story) + say(act.after) + 5 + (act.explore ? (act.props || []).reduce((x, p) => x + say(p.say) + say(p.en) + 3, 0) : 0); break;
    case 'E01':
      if (act.mode === 'count') sec += say(act.hint) + r * (say(act.q) + say(act.ok) + 16);
      else if (act.mode === 'listen') sec += r * (4 + 8);
      else { const its = (act.items || []).slice(0, act.rounds || act.items.length); sec += its.reduce((s, it) => s + say(it.q) + say(it.ok) + (it.opts || []).reduce((x, o) => x + say(o.say) * 0.6 + say(o.reply) * 0.5, 0) + 9, 0); }
      break;
    case 'E02': { const n = (act.sets?.[0] || []).length || 3; sec += r * (n * 9 + say(act.done) + 3); break; }
    case 'E03': sec += r * ((act.per_round || 4) * 7 + 4); break;
    case 'E04': sec += r * (say(act.q) + say(act.ok) + 22); break;
    case 'E05': { const p = act.pairs || 4; sec += p * 12 + say(act.done) + 6; break; }
    case 'E06': sec += r * (say(act.q) + (act.max || 3) * 7 + say(act.done) + 4); break;
    case 'E15': sec += act.mode === 'breath' ? (act.times || 2) * (say(act.inn) + say(act.out) + 3) + say(act.done) : act.mode === 'say' ? say(act.luSays) * 2 + 14 : say(act.task) + (act.seconds || 45); break;
    case 'E16': sec += (act.puzzles || []).slice(0, act.rounds || 99).reduce((x, p) => x + 22 + p.max * 5, 0) + say(act.q); break;
    case 'E17': sec += act.mode === 'freeze' ? (act.stops || 4) * 9 + 10 : act.mode === 'simon' ? (act.cmds || []).length * 8 : act.mode === 'compare' ? Math.min(act.rounds || 99, (act.pairs || []).length) * 12 : (act.levels || []).reduce((x, l) => x + (act.mode === 'cups' ? 8 + l.swaps * 1.2 : 9 + (l.seq || 1) * 3), 0); break;
    default: sec += 30;
  }
  return sec;
}
export function estimateMinutes(pkg) {
  const p = normalizeLesson(pkg);
  const base = sayAll(p.intro) + (p.checkin ? say(p.checkin.q) + 12 : 0) + sayAll(p.end) + 10 + (p.stages || []).reduce((s, st) => s + sayAll(st.intro) + say(st.done) + 4, 0);
  const per = (p.activities || []).map(a => ({ id: a.activity_id, step: a.step, sec: estimateSeconds(a) }));
  return { minutes: Math.round((base + per.reduce((s, x) => s + x.sec, 0)) / 6) / 10, per, stages: p.stages?.length || 0, activities: per.length };
}

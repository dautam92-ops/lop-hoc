// Tính mức vững từ sự kiện học tập – MỘT hàm dùng chung cho Hành trình, Sân chơi, báo cáo (S10-R06).
// Mức: 0 chưa gặp, 1 đang làm quen, 2 đang tiến bộ (S10 v1.1, D33), 3 tự làm được, 4 vận dụng được trong game.
// Mức tối đa theo loại kỹ năng: G 4, GT 3, T 2 (S10-R03). Quan sát của bố mẹ KHÔNG cộng vào đây (S10-R04).

export const MAX_BY_CLASS = { G: 4, GT: 3, T: 2 };
export const LEVEL_NAMES = ['Chưa gặp', 'Đang làm quen', 'Đang tiến bộ', 'Tự làm được', 'Vận dụng được trong game'];
export const LEVEL_NAMES_GT = { 3: 'Hiểu cách làm' };
export const LEVEL_NAMES_T = { 2: 'Đã làm quen' };

const day = ts => new Date(ts).toISOString().slice(0, 10);

export function levelName(level, cls) {
  if (cls === 'T' && LEVEL_NAMES_T[level]) return LEVEL_NAMES_T[level];
  if (cls === 'GT' && LEVEL_NAMES_GT[level]) return LEVEL_NAMES_GT[level];
  return LEVEL_NAMES[level];
}

export function computeSkillState(events, cls = 'G') {
  const max = MAX_BY_CLASS[cls] ?? 4;
  const evs = events.slice().sort((a, b) => a.ts - b.ts);
  let level = 0; const cleanDays = new Set(); const cleanMechs = new Set(); let observations = 0; const days = new Set();
  for (const e of evs) {
    days.add(day(e.ts));
    if (e.kind === 'participation') { level = Math.max(level, 1); continue; }
    observations++;
    const clean = e.correct && e.first_try && !(e.hints > 0);
    if (level >= 3 && !e.first_try) { level -= 1; cleanDays.clear(); continue; } // sai khi ôn: hạ đúng 1 bậc (S10-R10)
    level = Math.max(level, 1);
    if (e.correct && !clean) level = Math.max(level, 2);
    if (clean) {
      level = Math.max(level, 2);
      cleanDays.add(day(e.ts)); cleanMechs.add(e.mechanic || e.engine);
      if (cleanDays.size >= 2) level = Math.max(level, 3);
      if (level >= 3 && cleanMechs.size >= 2) level = 4;
    }
  }
  level = Math.min(level, max);
  const nd = days.size;
  const confidence = observations >= 6 && nd >= 3 ? 'cao' : observations >= 3 && nd >= 2 ? 'vừa' : 'thấp';
  return { level, name: levelName(level, cls), confidence, observations, days: nd, max };
}

// Quy tắc 43 (tam 27/11 12:53): lời khen theo giọng cô giáo mầm non: cổ vũ, dễ thương, đa dạng,
// nói rõ bé vừa làm được gì và, khi hợp, gắn với thói quen tốt ("Từ nay bé nhớ rửa tay thật sạch trước khi ăn cơm nhé").
// Phép thử: (1) mỗi lời kết thúc bài (done) có từ khen/cổ vũ; (2) không hai bài trong buổi dùng y hệt một lời kết;
// (3) lời khen khi đúng (ok) không lặp một câu mở đầu quá 40% số câu; (4) gọi trẻ là "bé" (lint đã chặn "con").
const KHEN = /(giỏi|tuyệt|hoan hô|tài|tinh mắt|khéo|cảm ơn|đẹp quá|phục|xuất sắc|chính xác|đúng rồi)/i;
export function kiemLoiKhen(pkg) {
  const loi = [], done = [], ok = [];
  const walk = (o, w) => {
    if (Array.isArray(o)) return o.forEach(x => walk(x, w));
    if (!o || typeof o !== 'object') return;
    const id = o.activity_id || w;
    if (typeof o.done === 'string') done.push([id, o.done]);
    if (typeof o.ok === 'string' && !o.any && !/^(Yes|Great|Good|Well|Excellent)/.test(o.ok)) ok.push(o.ok);
    for (const [k, v] of Object.entries(o)) if (k !== 'checkin') walk(v, id);
  };
  walk(pkg.stages || [], pkg.lesson_id);
  for (const [id, t] of done) if (!KHEN.test(t)) loi.push(`${id}: lời kết "${t}" chưa khen, cổ vũ bé (quy tắc 43)`);
  const dem = {}; for (const [, t] of done) dem[t] = (dem[t] || 0) + 1;
  for (const [t, n] of Object.entries(dem)) if (n > 1) loi.push(`lời kết "${t}" lặp ${n} lần trong buổi; mỗi bài một lời khen riêng (quy tắc 43)`);
  const mo = {}; for (const t of ok) { const m = t.split(/[!.]/)[0]; mo[m] = (mo[m] || 0) + 1; }
  for (const [m, n] of Object.entries(mo)) if (ok.length >= 5 && n / ok.length > 0.4) loi.push(`lời khen mở đầu "${m}!" dùng ${n}/${ok.length} lần, nhàm chán; đổi cách khen (quy tắc 43)`);
  return loi;
}

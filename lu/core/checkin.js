// Quy tắc 40 (tam 27/11 09:51, "Hôm nay bé thấy thế nào?"): chỉ đọc câu hỏi, không đọc đáp án, không nói "Bé chọn một khuôn mặt".
// Bé chọn Vui: Lu nói CHECKIN_VUI. Chọn mặt khác: Lu nói CHECKIN_KHAC. Áp dụng cho mọi buổi.
export const CHECKIN_Q = 'Hôm nay bé thấy thế nào?';
export const CHECKIN_VUI = 'Tuyệt quá, chúng mình cùng nhau khám phá nhé.';
export const CHECKIN_KHAC = 'Không sao, có Mono ở đây rồi. Bé cùng Mono khám phá nhiều thứ mới mẻ nhé.';
export const checkinReply = o => (o.e === 'face:vui' ? CHECKIN_VUI : CHECKIN_KHAC);
export function kiemCheckin(c) {
  if (!c) return [];
  const loi = [];
  if (c.q !== CHECKIN_Q) loi.push(`Câu hỏi cảm xúc đầu buổi phải đúng "${CHECKIN_Q}", đang là "${c.q}" (quy tắc 40, tam 27/11)`);
  if (c.thanks) loi.push('Câu hỏi cảm xúc đầu buổi không nói thêm lời cảm ơn chung; Lu chỉ đáp theo mặt bé chọn (quy tắc 40)');
  for (const o of c.opts || []) {
    if (o.say) loi.push(`Đáp án cảm xúc "${o.t}" có câu đọc đáp án; bỏ, bé chọn ngay sau câu hỏi (quy tắc 40)`);
    if (o.reply !== checkinReply(o)) loi.push(`Chọn "${o.t}" thì Lu phải nói "${checkinReply(o)}" (quy tắc 40)`);
  }
  return loi;
}

// Quy tắc 39 (tam 27/11 09:52, bài tìm bóng L002 "Hạt đậu nấp sau gì?"): giữa màn chỉ có ảnh Lu, không thấy cái bóng.
// Bài tìm bóng phải: (1) hiện ẢNH BÓNG to giữa màn (it.show + shadow, không dùng cảnh Lu), (2) hỏi đúng câu chuẩn,
// (3) ảnh bóng là một trong các đáp án.
export const CAU_BONG = 'Cái bóng này là của ảnh nào dưới đây?';
const LA_BONG = /(^|[^\p{L}])bóng([^\p{L}]|$)/iu;
const NHAC_BONG = /bóng (này|của)/iu; // câu hỏi tìm bóng (không tính "quả bóng")

export function kiemTimBong(activities) {
  const loi = [];
  for (const a of activities || []) for (const it of a.items || []) {
    const q = it.q || '';
    const laBong = it.shadow || a.shadow || (LA_BONG.test(q) && NHAC_BONG.test(q));
    if (!laBong) continue;
    const at = `${a.activity_id}: bài tìm bóng`;
    if (a.scene === 'lu' || it.scene === 'lu') loi.push(`${at} đang hiện ảnh Lu giữa màn, không thấy cái bóng (quy tắc 39, tam 27/11)`);
    if (!(it.shadow || a.shadow)) loi.push(`${at} chưa bật shadow nên ảnh hiện màu thật, không phải bóng (quy tắc 39)`);
    if (!it.show) loi.push(`${at} thiếu ảnh bóng (show) (quy tắc 39)`);
    else if (!(it.opts || []).some(o => (o.e || o) === it.show)) loi.push(`${at}: ảnh bóng ${it.show} không có trong các đáp án (quy tắc 39)`);
    if (q !== CAU_BONG) loi.push(`${at} phải hỏi đúng câu "${CAU_BONG}", đang là "${q}" (quy tắc 39)`);
  }
  return loi;
}

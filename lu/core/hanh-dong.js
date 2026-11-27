// Quy tắc 38 (tam 27/11 10:03, bài "Bé đoán xem" L002): câu hỏi về HÀNH ĐỘNG ("… làm gì?", "… đang làm gì?")
// thì mọi ảnh đáp án phải là ảnh hành động, và đều là hành động của CHÍNH nhân vật được hỏi.
// Sai đã gặp: "Chú gà thấy hạt đậu. Chú gà sẽ làm gì?" với đáp án gà con đứng yên, chìa khóa, áo đỏ.
// Đúng: gà con mổ hạt đậu (đúng), gà con ngủ, gà con chạy (sai nhưng bé phải suy nghĩ).
// Không cần cầu kì (tam 27/11 10:31): chỉ cần đáp án sai là hành động KHÁC của nhân vật, chọn hành động dễ vẽ.
// Quy tắc 42 (tam 27/11 12:50, L001 "Quả đậu trên cao"): câu "Lu nên làm gì?" mà hai đáp án chỉ là ảnh Lu đứng/nhảy
// thì bé không hình dung được việc làm. Đáp án CÓ ẢNH thì ảnh phải vẽ đúng hành động, kể cả khi có lời đọc (say).
// Chỉ đáp án KHÔNG có ảnh (chỉ chữ) mới được miễn. Ảnh tư thế chung của Lu (lu:nhay, lu:chi-tay…) không phải ảnh hành động.

// Danh mục ảnh hành động: slot → nhân vật làm hành động (chu_the), tên gọi nhân vật trong câu hỏi, hành động.
export const HANH_DONG = {
  'art:ga-con-mo-dau': { chu_the: 'ga-con', goi: ['gà'], hanh_dong: 'mổ hạt đậu dưới đất' },
  'art:ga-con-ngu': { chu_the: 'ga-con', goi: ['gà'], hanh_dong: 'nằm ngủ' },
  'art:ga-con-chay': { chu_the: 'ga-con', goi: ['gà'], hanh_dong: 'chạy' },
  'art:ga-con-uong-nuoc': { chu_the: 'ga-con', goi: ['gà'], hanh_dong: 'uống nước' },
  // L001-B24 (quy tắc 42): Mono (thay Lu 27/11) vẽ bằng Qwen-Image trên máy 24H (tam 27/11 14:53), chờ tam duyệt
  'art:mono-treo-gian-dau': { chu_the: 'mono', goi: ['mono'], hanh_dong: 'trèo lên giàn đậu để hái quả (việc nguy hiểm)' },
  'art:mono-nho-ba-hai-qua': { chu_the: 'mono', goi: ['mono'], hanh_dong: 'nhờ bà hái quả đậu trên cao' },
  'art:mono-treo-lay-mu': { chu_the: 'mono', goi: ['mono'], hanh_dong: 'trèo lên mái chuồng gà lấy mũ (việc nguy hiểm)' },
  'art:mono-nho-ba-lay-mu': { chu_the: 'mono', goi: ['mono'], hanh_dong: 'nhờ bà lấy mũ trên nóc chuồng gà' },
  // Bản Lu cũ (bỏ 27/11, giữ để đọc tệp cũ): Lu vẽ bằng Qwen-Image trên máy 24H, chờ tam duyệt
  'art:lu-nhay-voi-qua': { chu_the: 'lu', goi: ['lu'], hanh_dong: 'nhảy với quả đậu trên giàn cao' },
  'art:lu-nho-ba-hai-qua': { chu_the: 'lu', goi: ['lu'], hanh_dong: 'nhờ bà hái quả đậu trên cao' },
  'art:lu-nhay-lay-mu': { chu_the: 'lu', goi: ['lu'], hanh_dong: 'nhảy lấy mũ trên nóc chuồng gà' },
  'art:lu-nho-ba-lay-mu': { chu_the: 'lu', goi: ['lu'], hanh_dong: 'nhờ bà lấy mũ trên nóc chuồng gà' },
};

export const HOI_HANH_DONG = /(^|[^\p{L}])(làm gì|đang làm|sẽ làm|làm sao|làm thế nào)([^\p{L}]|$)/iu;
const coChu = o => o && typeof o === 'object' && ['say', 'label', 't', 'text'].some(k => typeof o[k] === 'string' && o[k].trim());
// Đáp án được miễn ảnh hành động chỉ khi không có ảnh nào (chỉ chữ). Mặt cảm xúc (face:*) không dùng cho câu hỏi hành động.
const chiChu = o => coChu(o) && !(typeof o.e === 'string' && o.e.trim());

// Trả về danh sách lỗi cho một câu hỏi { q, opts: [{e}] }.
export function kiemCauHanhDong(q, opts, where = '') {
  if (typeof q !== 'string' || !HOI_HANH_DONG.test(q) || !Array.isArray(opts) || !opts.length) return [];
  if (opts.every(chiChu)) return [];
  const loi = [], at = where ? `${where}: ` : '';
  const hinh = opts.map(o => (typeof o === 'string' ? o : o?.e) || '');
  const khong = hinh.filter((e, i) => !chiChu(opts[i]) && !HANH_DONG[e]);
  if (khong.length) loi.push(`${at}câu hỏi hành động "${q}" nhưng đáp án ${khong.join(', ')} không phải ảnh vẽ đúng hành động; bé không hình dung được việc làm (quy tắc 38, 42, tam 27/11)`);
  const chu = new Set(hinh.map(e => HANH_DONG[e]?.chu_the).filter(Boolean));
  if (chu.size > 1) loi.push(`${at}các đáp án của "${q}" là hành động của nhiều nhân vật khác nhau; đáp án sai phải là hành động khác của chính nhân vật được hỏi (quy tắc 38)`);
  for (const e of hinh) { const h = HANH_DONG[e]; if (h && !h.goi.some(g => q.toLowerCase().includes(g))) loi.push(`${at}đáp án ${e} là hành động của ${h.chu_the}, không phải nhân vật trong câu "${q}" (quy tắc 38)`); }
  return loi;
}

// Duyệt mọi câu hỏi trong một gói bài hoặc mẫu (mọi object có q/ask và opts/options).
export function kiemHanhDong(obj, where = '') {
  const loi = [];
  const walk = (o, w) => {
    if (Array.isArray(o)) return o.forEach(x => walk(x, w));
    if (!o || typeof o !== 'object') return;
    const id = o.activity_id || o.id || w;
    const q = o.q || o.ask, opts = o.opts || o.options;
    if (q && opts) loi.push(...kiemCauHanhDong(q, opts, id));
    for (const v of Object.values(o)) walk(v, id);
  };
  walk(obj, where);
  return [...new Set(loi)];
}

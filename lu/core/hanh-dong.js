// Quy tắc 38 (tam 27/11 10:03, bài "Bé đoán xem" L002): câu hỏi về HÀNH ĐỘNG ("… làm gì?", "… đang làm gì?")
// thì mọi ảnh đáp án phải là ảnh hành động, và đều là hành động của CHÍNH nhân vật được hỏi.
// Sai đã gặp: "Chú gà thấy hạt đậu. Chú gà sẽ làm gì?" với đáp án gà con đứng yên, chìa khóa, áo đỏ.
// Đúng: gà con mổ hạt đậu (đúng), gà con ngủ, gà con chạy (sai nhưng bé phải suy nghĩ).
// Không cần cầu kì (tam 27/11 10:31): chỉ cần đáp án sai là hành động KHÁC của nhân vật, chọn hành động dễ vẽ.
// Đáp án có chữ (say/label/t) tự mô tả hành động nên không cần ảnh hành động.

// Danh mục ảnh hành động: slot → nhân vật làm hành động (chu_the), tên gọi nhân vật trong câu hỏi, hành động.
export const HANH_DONG = {
  'art:ga-con-mo-dau': { chu_the: 'ga-con', goi: ['gà'], hanh_dong: 'mổ hạt đậu dưới đất' },
  'art:ga-con-ngu': { chu_the: 'ga-con', goi: ['gà'], hanh_dong: 'nằm ngủ' },
  'art:ga-con-chay': { chu_the: 'ga-con', goi: ['gà'], hanh_dong: 'chạy' },
};

export const HOI_HANH_DONG = /(^|[^\p{L}])(làm gì|đang làm|sẽ làm|làm sao|làm thế nào)([^\p{L}]|$)/iu;
const coChu = o => o && typeof o === 'object' && ['say', 'label', 't', 'text'].some(k => typeof o[k] === 'string' && o[k].trim());

// Trả về danh sách lỗi cho một câu hỏi { q, opts: [{e}] }.
export function kiemCauHanhDong(q, opts, where = '') {
  if (typeof q !== 'string' || !HOI_HANH_DONG.test(q) || !Array.isArray(opts) || !opts.length) return [];
  if (opts.every(coChu)) return [];
  const loi = [], at = where ? `${where}: ` : '';
  const hinh = opts.map(o => (typeof o === 'string' ? o : o?.e) || '');
  const khong = hinh.filter((e, i) => !coChu(opts[i]) && !HANH_DONG[e]);
  if (khong.length) loi.push(`${at}câu hỏi hành động "${q}" nhưng đáp án ${khong.join(', ')} không phải ảnh hành động (quy tắc 38, tam 27/11)`);
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

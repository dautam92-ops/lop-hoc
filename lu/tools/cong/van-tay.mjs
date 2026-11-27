// Dấu vân tay bài tập (Blueprint V4 L04: Semantic Signature) dùng cho cổng luyện tập.
// Một hoạt động có thể gồm nhiều bài tập (nhiều câu, nhiều bộ ghép): mỗi bài tập là một "đơn vị".
// Vân tay chỉ dựa vào NỘI DUNG: dạng bài, đồ vật, con số, đáp án. Bỏ qua thứ tự đáp án, vị trí, màu, lời dẫn,
// và cả mã kỹ năng (đổi nhãn kỹ năng không làm thành bài mới).
import { createHash } from 'node:crypto';

const DANG = (a) => {
  const k = `${a.engine}:${a.mode || ''}`;
  return { 'E01:count': 'dem', 'E01:items': 'chon', 'E01:listen': 'nghe-chon', 'E02:': 'ghep', 'E04:order': 'xep' }[k] || k;
};
// "art:tao*3" → vật "tao", số 3; "art:coc:4" → vật "coc", số 4; "face:vui" → "face:vui"
function tach(x, vat, so) {
  if (typeof x !== 'string') return;
  let m = x.match(/^art:([^*:]+)\*(\d+)$/); if (m) { vat.add(m[1]); so.push(+m[2]); return; }
  m = x.match(/^art:([^*:]+):(\d+)$/); if (m) { vat.add(m[1]); so.push(+m[2]); return; }
  m = x.match(/^art:([^*:]+)/); if (m) { vat.add(m[1]); return; }
  if (/^face:/.test(x)) { vat.add(x); return; }
}
const optKey = o => { const vat = new Set(), so = []; tach(o.e, vat, so); if (o.n) so.push(o.n); if (o.v != null) so.push(o.v); return [...vat].join('+') + '#' + so.join('+') + (o.t ? '~' + o.t : ''); };
const sach = s => String(s || '').toLowerCase().replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim();

export function donVi(a) {
  const dang = DANG(a), out = [];
  const push = (vat, so, da, extra = '') => out.push({ dang, vat: [...vat].sort(), so: [...so].sort((x, y) => x - y), da: String(da), extra });
  if (a.engine === 'E01' && a.mode === 'count') {
    for (const n of (a.n ? [a.n] : a.pool || [])) push(new Set([String(a.object || a.emoji || 'bong-bay').replace(/^art:/, '')]), [n], n, (a.pool || []).join('+'));
  } else if (a.engine === 'E01' && a.mode === 'items') {
    for (const it of a.items || []) {
      const vat = new Set(), so = []; [].concat(it.show || []).forEach(x => tach(x, vat, so));
      it.opts.forEach(o => { tach(o.e, vat, so); if (o.n) so.push(o.n); if (o.v != null) so.push(o.v); });
      // câu tự do (EQ) không có đáp án đúng: dùng chính câu hỏi làm nội dung
      push(vat, so, it.any ? 'tu-do' : optKey(it.opts[it.a]), it.any || !vat.size ? sach(it.q) : '');
    }
  } else if (a.engine === 'E01' && a.mode === 'listen') {
    for (const w of a.words || []) { const vat = new Set(), so = []; tach(w.e, vat, so); push(vat, so, sach(w.w)); }
  } else if (a.engine === 'E02' && !a.mode) {
    for (const s of a.sets || []) { const vat = new Set(), so = []; const pairs = s.map(p => typeof p === 'string' ? p : `${p.piece}>${p.target}`).sort();
      s.forEach(p => { if (typeof p === 'string') tach(p, vat, so); else { tach(p.piece, vat, so); tach(p.target, vat, so); } }); push(vat, so, pairs.join('|')); }
  } else {
    // Dạng khác: toàn bộ nội dung trừ lời thoại và mã
    const bo = new Set(['activity_id', 'title', 'intro', 'again', 'ok', 'no', 'done', 'hint', 'label', 'q', 'skill_id', 'evidence', 'mechanic', 'lu', 'story', 'after', 'step', '_stage', '_bd']);
    const vat = new Set(), so = []; JSON.stringify(a, (k, v) => { if (typeof v === 'string') tach(v, vat, so); return v; });
    push(vat, so, createHash('sha1').update(JSON.stringify(Object.fromEntries(Object.entries(a).filter(([k]) => !bo.has(k))))).digest('hex').slice(0, 12));
  }
  return out.map(u => ({ ...u, fp: vanTay(u), dac_diem: dacDiem(u) }));
}
export const vanTay = u => createHash('sha1').update(JSON.stringify([u.dang, u.vat, u.so, u.da, u.extra])).digest('hex').slice(0, 16);
// Đặc điểm để đo "giống gần": vật, từng con số (kể cả số lặp), đáp án
export function dacDiem(u) { const c = {}; return [...u.vat.map(v => 'v:' + v), ...u.so.map(n => 's:' + n + '#' + (c[n] = (c[n] || 0) + 1)), 'd:' + u.da]; }
export function jaccard(a, b) { const A = new Set(a), B = new Set(b); let i = 0; for (const x of A) if (B.has(x)) i++; return i / (A.size + B.size - i || 1); }
export const NGUONG_GAN = 0.8;
// Trả về lý do trùng (hoặc null) của đơn vị u so với sổ (Map fp → nguồn, và danh sách theo dạng)
export function kiemTrung(u, so) {
  if (so.fp.has(u.fp)) return { loai: 'trung-y-het', voi: so.fp.get(u.fp) };
  for (const v of so.theoDang.get(u.dang) || []) { const j = jaccard(u.dac_diem, v.dac_diem); if (j >= NGUONG_GAN) return { loai: 'giong-gan', voi: v.nguon, j: +j.toFixed(2) }; }
  return null;
}
export function taoSo(list = []) { const so = { fp: new Map(), theoDang: new Map() }; list.forEach(x => themVaoSo(so, x)); return so; }
export function themVaoSo(so, x) { so.fp.set(x.fp, x.nguon); if (!so.theoDang.has(x.dang)) so.theoDang.set(x.dang, []); so.theoDang.get(x.dang).push(x); }

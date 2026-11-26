// Bộ sinh bài từ Thư viện dạng bài (V4.0 mục K, S09-R02): pattern + seed → hoạt động hoàn chỉnh, tái hiện được.
// Chạy hoàn toàn trên máy, không gọi AI trong phiên học (D18).
export const GENERATOR_VERSION = '0.1.0';
const NAME = { 'art:hat-dau': 'hạt đậu', 'art:tao': 'quả táo', 'art:hoa': 'bông hoa', 'art:la': 'chiếc lá', 'art:mam-dau': 'mầm đậu', 'art:qua-dau': 'quả đậu', 'art:sao': 'ngôi sao' };
const UNIT = { 'art:hat-dau': 'hạt đậu', 'art:tao': 'quả táo', 'art:hoa': 'bông hoa', 'art:la': 'chiếc lá', 'art:mam-dau': 'mầm đậu', 'art:qua-dau': 'quả đậu', 'art:sao': 'ngôi sao' };
const W = ['một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười'];

export function buildActivity(p, rng, level = 0) {
  const d = p.do_kho, id = `${p.pattern_id}#${GENERATOR_VERSION}`; const base = { activity_id: id, engine: p.engine, skill_id: p.skill_id, title: p.ten, pattern_id: p.pattern_id };
  const lv = (arr) => arr[Math.min(level, arr.length - 1)];
  switch (p.pattern_id) {
    case 'PT-DEM-01': { const o = rng.pick(d.object), pool = lv(d.pool); return { ...base, ...p.mau, object: o, pool, max: Math.max(...pool), words: W.slice(0, Math.max(...pool)), q: p.mau.q.replace('{ten}', NAME[o]), ok: p.mau.ok.replace('{ten}', UNIT[o]) }; }
    case 'PT-DEM-02': { const o = rng.pick(d.object), nmax = lv(d.n_max); const ns = rng.sample(Array.from({ length: nmax }, (_, i) => i + 1), 3).sort((a, b) => a - b);
      const items = ns.map((n, k) => ({ q: `Bé tìm đĩa có ${W[n - 1]} ${UNIT[o]}.`, a: k, style: 'plate', ok: `Đúng rồi! Đĩa này có ${W[n - 1]} ${UNIT[o]}.`, no: 'Bé đếm từng vật trong đĩa xem.', opts: ns.map(m => ({ e: o, n: m })) }));
      return { ...base, mode: 'items', style: 'plate', items, rounds: 3 }; }
    case 'PT-DEM-03': { const o = rng.pick(d.object), nmax = lv(d.n_max); const ns = rng.sample(Array.from({ length: nmax }, (_, i) => i + 1), 3);
      return { ...base, target_style: 'pair', sets: [ns.map(n => ({ piece: `${o}*${n}`, target: `art:coc:${n}` }))], rounds: 1, no: 'Bé đếm số vật, rồi tìm cọc có số giống vậy.', done: 'Ghép xong rồi!', intro: [`Bé kéo nhóm ${UNIT[o]} về đúng cọc số nhé.`] }; }
    case 'PT-SX-01': { const o = rng.pick(d.object); return { ...base, ...p.mau, object: o, max: lv(d.max), q: 'Bé chạm nhóm ít nhất trước, rồi tới nhóm nhiều hơn.', no: 'Bé đếm từng nhóm xem.', ok: 'Đã xếp từ ít đến nhiều.' }; }
    case 'PT-QS-01': { const t = rng.pick(d.target); const nh = rng.sample(d.target.filter(x => x !== t), lv(d.nhieu));
      return { ...base, ...p.mau, q: 'Bé chạm vào từng {name} nhé.', targets: [{ e: t, name: NAME[t] }], distractors: nh, cells: lv(d.cells), no: `Bé nhìn kỹ hình ${NAME[t]}.`, done: `Bé tìm đủ ${NAME[t]} rồi!` }; }
    case 'PT-QS-02': { const s = rng.sample(d.object, 3); return { ...base, target_style: 'shadow', sets: [s], rounds: 1, intro: ['Bé kéo mỗi hình về đúng cái bóng.'], no: 'Mình so lại hình dáng của cái bóng.', done: 'Hình nào cũng về đúng bóng rồi!' }; }
    case 'PT-TN-01': { const n = lv(d.pairs); return { ...base, pool: rng.sample(d.pool, n), pairs: n, no: 'Chưa giống nhau. Bé nhớ chỗ nhé.', done: 'Bé tìm đủ các đôi rồi!' }; }
    case 'PT-EN-01': { const tu = d.tu[0]; const IMG = { 'Hello!': 'lu:vay-tay', 'Goodbye!': 'lu:di-bo', 'Yes!': 'art:yes', 'No!': 'art:no' };
      const words = rng.sample(tu, rng.int(2, tu.length)).map(w => ({ w, e: IMG[w], ok: `Yes! ${w}` })); return { ...base, mode: 'listen', words, rounds: words.length, intro: ['Bé nghe rồi chạm đúng tranh nhé.'] }; }
  }
  throw new Error('Dạng bài chưa có bộ sinh: ' + p.pattern_id);
}

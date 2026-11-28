// Ba lượt trong một bài con phải là ba nội dung KHÁC NHAU (tam 28/11 21:47, M030 "Đánh răng buổi tối":
// "sao lại lặp đi lặp lại hỏi quy trình đánh răng trong cả 3 màn. Lỗi ngớ ngẩn"). Quy tắc 49.
//  - Bài xếp thứ tự (E04 sets): hai lượt không được dùng lại cùng một chuỗi (chung từ 2 tranh trở lên theo cùng thứ tự),
//    kể cả kiểu lượt sau chỉ thêm tranh vào chuỗi lượt trước (3 tranh rồi 4 tranh của cùng một quy trình).
//  - Bài chọn đáp án (items, levels, words): hai lượt không được giống hệt nhau (cùng câu hỏi, cùng hình, cùng đáp án).
// Dùng: kiemLapLuot(pkg) → danh sách lỗi; chạy riêng: node tools/kiem-lap-luot.mjs content/drafts/M030.json …
const anh = o => (o && (o.e || o.slot || o.t)) || JSON.stringify(o);
const cap = arr => { const s = new Set(); for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) s.add(arr[i] + ' → ' + arr[j]); return s; };
export function kiemLapLuot(pkg) {
  const loi = [];
  for (const st of pkg.stages || []) for (const a of st.activities || []) {
    const ten = `${a.activity_id} "${a.title}"`;
    if (Array.isArray(a.sets) && a.sets.length > 1) {
      const S = a.sets.map(s => (s.items || []).map(anh));
      for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) {
        const A = cap(S[i]), chung = [...cap(S[j])].filter(x => A.has(x));
        if (chung.length) loi.push(`${ten}: lượt ${i + 1} và lượt ${j + 1} lặp cùng một chuỗi (${chung[0]}), mỗi lượt phải là một việc khác`);
      }
    }
    for (const k of ['items', 'levels', 'words']) {
      const L = a[k]; if (!Array.isArray(L) || L.length < 2 || !L.every(x => x && typeof x === 'object') || a.engine === 'E03') continue;
      // Câu hỏi giống nhau với hình khác (đếm hạt, tìm bóng) là bình thường; lỗi khi lượt sau lặp lại y hệt lượt trước:
      // cùng câu hỏi, cùng đáp án đúng và cùng bộ hình.
      const seen = new Map();
      L.forEach((x, i) => {
        // bỏ lời dẫn, lời khen (đổi chữ không làm lượt khác đi); còn lại câu hỏi, hình, đáp án, số
        const key = JSON.stringify(x, (k, v) => ['ok', 'no', 'look', 'say', 'hint', 'again'].includes(k) ? undefined : v);
        if (seen.has(key)) loi.push(`${ten}: lượt ${seen.get(key) + 1} và lượt ${i + 1} giống hệt nhau (cùng câu hỏi, cùng hình, cùng đáp án)`); else seen.set(key, i);
      });
    }
  }
  return loi;
}

// ---- Soát sâu 28/11 (tam 21:53: "việc soát lỗi chưa triệt để, nghiên cứu sâu để ra thêm quy tắc") ----
const giongHet = x => JSON.stringify(x, (k, v) => ['ok', 'no', 'look', 'say', 'hint', 'again'].includes(k) ? undefined : v);
const coChe = st => { const a = (st.activities || [])[0] || {}; return `${a.engine}${a.mode ? ':' + a.mode : ''}`; };
const TEN_CO_CHE = { 'E01:items': 'chọn tranh' };
const MAT_TOT = new Set(['face:vui', 'face:yeu', 'face:tu-hao']);

// Quy tắc 50: đáp án không được lộ qua hình phụ. Câu chọn lời nói/cách cư xử mà đáp án đúng là ô DUY NHẤT có mặt cười
// (sai thì mặt giận, mặt buồn) thì bé chỉ cần chọn mặt cười, không phải nghĩ (6/6 câu như vậy ở M020, M030, M050).
export function kiemLoDapAn(pkg) {
  const loi = [];
  for (const st of pkg.stages || []) for (const a of st.activities || []) for (const it of [].concat(a.items || [])) {
    if (!it || !Array.isArray(it.opts) || !Number.isInteger(it.a) || it.opts.length < 2) continue;
    const mat = it.opts.map(o => (o && typeof o.e === 'string' && o.e.startsWith('face:') && (o.t || o.say)) ? o.e : null);
    if (mat.some(m => !m)) continue; // chỉ xét đáp án là lời nói kèm mặt (câu hỏi cảm xúc thuần thì mặt chính là đáp án)
    const d = mat[it.a];
    if (MAT_TOT.has(d) && mat.filter(m => m === d).length === 1 && mat.every((m, i) => i === it.a || !MAT_TOT.has(m)))
      loi.push(`${a.activity_id} "${it.q || a.title}": chỉ đáp án đúng có mặt cười (${d}), bé chọn theo mặt là đúng, không cần hiểu`);
  }
  return loi;
}
// Quy tắc 51: một buổi không lặp một kiểu chơi. Không quá 2 bài con liền nhau cùng cơ chế; "chọn tranh" (E01 items)
// không quá một nửa số bài con (không tính bài nghỉ vận động); không có hai bài con hỏi cùng một câu.
export function kiemNhamChan(pkg) {
  const loi = [], T = pkg.stages || [], S = T.filter(st => st.kind !== 'nghi');
  // bài nghỉ vận động xen giữa thì tính là đổi kiểu chơi
  for (let i = 0, S2 = T; i < S2.length;) { const S = S2; let j = i; while (j + 1 < S.length && coChe(S[j + 1]) === coChe(S[i])) j++;
    if (j - i + 1 >= 3) loi.push(`${j - i + 1} bài con liền nhau cùng kiểu ${TEN_CO_CHE[coChe(S[i])] || coChe(S[i])}: ${S.slice(i, j + 1).map(s => '"' + s.title + '"').join(', ')}`); i = j + 1; }
  const chon = S.filter(st => coChe(st) === 'E01:items').length;
  if (S.length && chon / S.length > 0.5) loi.push(`${chon}/${S.length} bài con là kiểu chọn tranh (quá một nửa), buổi dễ nhàm`);
  const q = new Map();
  for (const st of pkg.stages || []) for (const a of st.activities || []) for (const it of [].concat(a.items || [])) {
    if (!it || typeof it.q !== 'string') continue; const k = it.q.trim();
    if (q.has(k) && q.get(k) !== st.title) loi.push(`câu hỏi "${k}" lặp ở hai bài con "${q.get(k)}" và "${st.title}"`); else q.set(k, st.title);
  }
  return [...new Set(loi)];
}
// Quy tắc 52: không lặp nguyên lượt của buổi khác (200 buổi phải mới). Ôn tập thì đổi cách hỏi, đổi hình (lịch ôn).
export function kiemTrungBuoi(pkg, khac) {
  const loi = [], cu = new Map();
  for (const o of khac) for (const st of o.stages || []) for (const a of st.activities || []) for (const k of ['items', 'sets', 'levels', 'words'])
    for (const x of [].concat(a[k] || [])) if (x && typeof x === 'object' && (x.q || x.items || x.opts)) cu.set(giongHet(x), `${o.lesson_id} "${st.title}"`);
  for (const st of pkg.stages || []) for (const a of st.activities || []) for (const k of ['items', 'sets', 'levels', 'words'])
    for (const x of [].concat(a[k] || [])) { const w = x && typeof x === 'object' && cu.get(giongHet(x)); if (w) loi.push(`${a.activity_id} "${st.title}": lượt "${x.q || ''}" chép y nguyên từ ${w}`); }
  return [...new Set(loi)];
}
// Quy tắc 53: chỉ thị của sếp cho giáo trình 200 buổi (27/11 22:18): không hỏi cảm xúc đầu buổi, không có bước Mono dạy mẫu.
const CAU_CAM = [[/cảm thấy thế nào/i, 'hỏi "bé cảm thấy thế nào"'], [/Mono (làm|tô|vẽ|dạy) mẫu|Bé xem Mono (làm|tô|vẽ)/i, 'bước Mono dạy mẫu']];
export function kiemChiThi(pkg) {
  if (!/^M\d/.test(pkg.lesson_id || '')) return [];
  const s = JSON.stringify(pkg), loi = CAU_CAM.filter(([re]) => re.test(s)).map(([, t]) => `buổi còn ${t} (sếp đã bỏ 27/11)`);
  for (const st of pkg.stages || []) for (const a of st.activities || []) if ((a.phases || []).includes('mau')) loi.push(`${a.activity_id}: còn pha Mono tô mẫu`);
  return loi;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync } = await import('node:fs'); let n = 0;
  const P = process.argv.slice(2).map(f => [f, JSON.parse(readFileSync(f, 'utf8'))]);
  for (const [f, p] of P) { const l = [...kiemLapLuot(p), ...kiemLoDapAn(p), ...kiemNhamChan(p), ...kiemTrungBuoi(p, P.filter(x => x[1] !== p).map(x => x[1])), ...kiemChiThi(p)]; n += l.length; console.log(`${l.length ? 'LỖI' : ' ok '} ${f}${l.length ? '\n  ' + l.join('\n  ') : ''}`); }
  process.exit(n ? 1 : 0);
}

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
if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync } = await import('node:fs'); let n = 0;
  for (const f of process.argv.slice(2)) { const l = kiemLapLuot(JSON.parse(readFileSync(f, 'utf8'))); n += l.length; console.log(`${l.length ? 'LỖI' : ' ok '} ${f}${l.length ? '\n  ' + l.join('\n  ') : ''}`); }
  process.exit(n ? 1 : 0);
}

// Kiểm tra tự động câu hỏi và đáp án trong LESSON của bai-hoc-ipad.html.
// Chạy: node kiem_tra_dap_an.js bai-hoc-ipad.html   (thoát mã 1 nếu có lỗi)
const fs = require('fs');
const h = fs.readFileSync(process.argv[2], 'utf8');
const src = h.slice(h.indexOf('const LESSON ='), h.indexOf('/* ================= ÂM THANH'));
const LESSON = eval(src.replace('const LESSON =', '(').replace(/;\s*$/, '') + ')');
const glyphSrc = h.includes('const GLYPHS=') ? h.slice(h.indexOf('const GLYPHS='), h.indexOf('};', h.indexOf('const GLYPHS=')) + 2) : '';
const errors = [], notes = [];
const EN = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
const num = s => { s = String(s).trim().toLowerCase(); if (EN[s] != null) return EN[s]; const m = s.match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : null; };
const graphemes = s => [...new Intl.Segmenter('vi', { granularity: 'grapheme' }).segment(s)].map(x => x.segment).filter(g => /\p{Extended_Pictographic}/u.test(g));

function seqNext(terms, holeIdx) {
  // Tìm quy luật: cộng đều, nhân đều, Fibonacci. Trả về giá trị ô trống hoặc null.
  const known = terms.map((t, i) => [i, t]).filter(([, t]) => t != null);
  const rules = [];
  for (let d = -50; d <= 50; d++) rules.push(i => known[0][1] + (i - known[0][0]) * d);
  for (let r = 2; r <= 5; r++) rules.push(i => known[0][1] * Math.pow(r, i - known[0][0]));
  const fits = rules.filter(f => known.every(([i, t]) => f(i) === t)).map(f => f(holeIdx));
  if (known.length === terms.length - 1 && holeIdx === terms.length - 1) {
    const t = terms.slice(0, -1); let fib = t.length >= 3;
    for (let i = 2; i < t.length; i++) if (t[i] !== t[i - 1] + t[i - 2]) fib = false;
    if (fib) fits.push(t[t.length - 1] + t[t.length - 2]);
  }
  const uniq = [...new Set(fits)];
  return uniq.length === 1 ? uniq[0] : (uniq.length ? 'mơ hồ:' + uniq.join('/') : null);
}

for (const [kid, K] of Object.entries(LESSON.kids)) K.acts.forEach((a, ai) => {
  const where = `${kid} bài ${ai + 1} "${a.title}"`;
  if (a.type === 'choice') a.rounds.forEach((R, ri) => {
    const w = `${where} câu ${ri + 1}`;
    const ans = Array.isArray(R.a) ? R.a : [R.a];
    if (!ans.every(x => Number.isInteger(x) && x >= 0 && x < R.opts.length)) errors.push(`${w}: chỉ số đáp án ngoài danh sách lựa chọn`);
    const texts = R.opts.map(o => typeof o === 'string' ? o : (o.say || o.e || o.h || ''));
    if (new Set(texts).size !== texts.length && !/không giống|khác/.test(R.q)) errors.push(`${w}: có lựa chọn trùng nhau`);
    // Toán có biểu thức kiểm tra
    if (R.check) {
      const v = eval(R.check);
      if (!Number.isInteger(v)) errors.push(`${w}: phép tính ${R.check} = ${v} không ra số nguyên (chia không hết)`);
      if (num(R.opts[R.a]) !== v) errors.push(`${w}: đáp án "${R.opts[R.a]}" khác kết quả ${R.check} = ${v}`);
      if (R.opts.filter(o => num(o) === v).length !== 1) errors.push(`${w}: có ${R.opts.filter(o => num(o) === v).length} lựa chọn bằng ${v}`);
    } else if (/chia|nhân|cộng|trừ|\bdư\b/.test(R.q)) errors.push(`${w}: câu toán đố chưa có biểu thức check để tự kiểm tra`);
    // Đếm hình
    if (/^(Có mấy|How many)/i.test(R.q) && R.show) {
      const n = graphemes(R.show).length;
      if (n > 10 || new Set(graphemes(R.show)).size !== 1) errors.push(`${w}: nhóm đếm phải là 1 loại vật, tối đa 10 cái để xếp gọn (quy tắc 30)`);
      if (num(R.opts[R.a]) !== n) errors.push(`${w}: hình có ${n} cái nhưng đáp án là "${R.opts[R.a]}"`);
    }
    // Dãy số có dấu ?
    if (/^[\d\s,?]+$/.test(R.q) && R.q.includes('?')) {
      const parts = R.q.split(',').map(x => x.trim()); const hole = parts.indexOf('?');
      const want = seqNext(parts.map(x => x === '?' ? null : Number(x)), hole);
      if (want == null || typeof want === 'string') errors.push(`${w}: không tìm được quy luật duy nhất cho dãy ${R.q} (${want})`);
      else if (num(R.opts[R.a]) !== want) errors.push(`${w}: dãy ${R.q} phải là ${want}, đáp án lại là ${R.opts[R.a]}`);
    }
  });
  if (a.type === 'sudoku') {
    const P = a.puz.split('|'), S = a.sol.split('|');
    const ok = g => { for (let i = 0; i < 6; i++) { if (new Set(g[i]).size !== 6) return false; if (new Set(g.map(r => r[i])).size !== 6) return false; }
      for (let br = 0; br < 6; br += 2) for (let bc = 0; bc < 6; bc += 3) { const s = new Set(); for (let r = br; r < br + 2; r++) for (let c = bc; c < bc + 3; c++) s.add(g[r][c]); if (s.size !== 6) return false; } return true; };
    if (!ok(S)) errors.push(`${where}: lời giải sudoku sai luật`);
    P.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '_' && c !== S[y][x]) errors.push(`${where}: ô gợi ý (${y + 1},${x + 1}) khác lời giải`); }));
    // đếm số lời giải
    const g = P.map(r => [...r].map(c => c === '_' ? 0 : +c)); let cnt = 0;
    const solve = () => { for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) if (!g[r][c]) { for (let v = 1; v <= 6; v++) { if (g[r].includes(v) || g.some(row => row[c] === v)) continue; const br = r - r % 2, bc = c - c % 3; let bad = false; for (let i = br; i < br + 2; i++) for (let j = bc; j < bc + 3; j++) if (g[i][j] === v) bad = true; if (bad) continue; g[r][c] = v; solve(); g[r][c] = 0; if (cnt > 1) return; } return; } cnt++; };
    solve(); if (cnt !== 1) errors.push(`${where}: sudoku có ${cnt} lời giải (phải đúng 1)`);
  }
  if (a.type === 'scramble') a.rounds.forEach(R => { if (!/^[a-z]+$/.test(R.w)) errors.push(`${where}: từ "${R.w}" có ký tự lạ`); });
  if (a.type === 'trace') a.rounds.forEach(R => { if (!glyphSrc.includes(`'${R.t}':`)) errors.push(`${where}: chưa có nét mẫu GLYPHS cho "${R.t}"`); });
  if (a.type === 'code') a.rounds.forEach((R, ri) => { // lập trình nhí: phải đi được tới đích
    const rock = (y, x) => (R.rocks || []).some(p => p[0] === y && p[1] === x); const seen = new Set([R.s.join()]); let q = [[...R.s, 0]], best = -1;
    if (rock(...R.g) || rock(...R.s)) errors.push(`${where} câu ${ri + 1}: đích hoặc điểm xuất phát nằm trên đá`);
    while (q.length) { const [y, x, d] = q.shift(); if (y === R.g[0] && x === R.g[1]) { best = d; break; }
      for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ny = y + dy, nx = x + dx; if (ny < 0 || nx < 0 || ny >= R.n || nx >= R.n || rock(ny, nx) || seen.has(ny + ',' + nx)) continue; seen.add(ny + ',' + nx); q.push([ny, nx, d + 1]); } }
    if (best < 0) errors.push(`${where} câu ${ri + 1}: không có đường tới đích`); else if (best > 12) errors.push(`${where} câu ${ri + 1}: cần ${best} bước, quá 12 nút`);
    else notes.push(`${where} câu ${ri + 1}: ngắn nhất ${best} bước`); });
  if (a.type === 'maze' && !(a.n >= 4)) errors.push(`${where}: mê cung quá nhỏ`);
});
// Câu tiếng Việt chưa có giọng Hoài My (cả lời đọc từng đáp án opts[].say)
for (const K of Object.values(LESSON.kids)) for (const a of K.acts) (a.rounds || []).forEach(R => { if (/thấy thế nào/.test(R.q) && !(R.opts || []).every(o => o && o.say)) errors.push(`${a.title}: câu cảm xúc phải có lời đọc cho từng đáp án (opts:[{e,say}]) vì bé chưa đọc được`); });
const clipsStart = h.indexOf('const CLIPS=');
if (clipsStart > 0) {
  const isVi = t => /[ăâđêôơưàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]/i.test(t);
  const need = new Set();
  for (const K of Object.values(LESSON.kids)) for (const a of K.acts) { if (a.q && isVi(a.q)) need.add(a.q); (a.rounds || []).forEach(R => { for (const t of [R.q, R.ok, R.no, R.hint, R.say, ...(R.opts || []).map(o => o && o.say)]) if (t && isVi(t)) need.add(t); }); if (a.seq && (a.rounds || []).some(R => !R.show)) need.add('Số nào điền vào ô trống?');
    if (a.type === 'choice' && a.txt) (a.rounds || []).forEach(R => { if (R.opts.some(o => typeof o === 'string' && /\p{L}/u.test(o))) { R.opts.forEach((o, j) => { need.add('Đáp án ' + 'ABCDE'[j]); if (!a.en && typeof o === 'string' && /\p{L}/u.test(o)) need.add(o); }); } }); }
  const missing = [...need].filter(t => !h.includes(JSON.stringify(t).slice(0, -1) + '":'));
  if (missing.length) notes.push(`${missing.length} câu tiếng Việt chưa có giọng Hoài My: ` + missing.join(' | '));
}
notes.forEach(n => console.log('LƯU Ý:', n));
if (errors.length) { console.log('LỖI:\n- ' + errors.join('\n- ')); process.exit(1); }
console.log('OK: mọi đáp án đã kiểm tra đều đúng.');

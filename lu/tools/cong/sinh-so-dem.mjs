// Bộ sinh bài cổng "Số và đếm" (tam duyệt 26/11 20:35). Sinh theo quy tắc, có seed (tái hiện được), chỉ dùng ảnh vẽ tay đã duyệt.
// Ba lớp lọc: (1) trùng y hệt sổ 300 buổi, (2) giống gần (≥80% đồ vật, số, đáp án), (3) trùng trong chính kho cổng.
// Chạy: node tools/cong/sinh-so-dem.mjs   → content/cong/so-dem.json, content/cong/can-tao-giong.json
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { makeRng } from '../../core/lu-core.js';
import { ENGINES } from '../../engines/index.js';
import { donVi, kiemTrung, taoSo, themVaoSo } from './van-tay.mjs';
import { lapSo } from './so-bai-300.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const J = async p => JSON.parse(await readFile(path.join(ROOT, p), 'utf8'));

// Đồ vật đếm được, đều có ảnh vẽ tay đã duyệt (registry/assets.json). Tên kèm loại từ để Lu đọc tự nhiên.
export const VAT = { tao: 'quả táo', 'ca-rot': 'củ cà rốt', chim: 'con chim', ca: 'con cá', 'ga-con': 'chú gà con', trung: 'quả trứng', hoa: 'bông hoa',
  la: 'chiếc lá', ong: 'con ong', buom: 'con bướm', ech: 'con ếch', meo: 'con mèo', oc: 'con ốc sên', 'hat-dau': 'hạt đậu', 'qua-dau': 'quả đậu',
  'dong-xu': 'đồng xu', soi: 'viên sỏi', 'giot-nuoc': 'giọt nước', 'khuc-go': 'khúc gỗ', bong: 'quả bóng', ga: 'con gà mái', 'mam-dau': 'mầm đậu',
  ao: 'chiếc áo', khan: 'cái khăn', 'chia-khoa': 'chiếc chìa khóa', 'binh-tuoi': 'bình tưới', chao: 'cái chảo', 'xa-phong': 'bánh xà phòng', rau: 'cây rau', nha: 'ngôi nhà' };
const SO = ['một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười'];

// Phòng: mỗi phòng một kỹ năng, mở khi bé học xong buổi dạy kỹ năng đó trên lộ trình (tam chọn 26/11).
export const PHONG = [
  { id: 'R01', ten: 'Đếm 1 đến 3', the: '1–3', skill: 'TO.DEM.01', mo_sau: 'L001', so: [1, 3], dang: ['dem', 'tim-dia'] },
  { id: 'R02', ten: 'Số 1, 2, 3', the: '1 2 3', skill: 'TO.SO.01', mo_sau: 'L010', so: [1, 3], dang: ['so-ra-dia', 'ghep-so'] },
  { id: 'R03', ten: 'Nhiều hơn, ít hơn', the: '3 · 5', skill: 'TO.SS.01', mo_sau: 'L014', so: [1, 5], dang: ['nhieu-hon', 'it-hon'] },
  { id: 'R04', ten: 'Đếm đến 5', the: '4–5', skill: 'TO.DEM.02', mo_sau: 'L026', so: [1, 5], chinh: [4, 5], dang: ['dem', 'tim-dia'] },
  { id: 'R05', ten: 'Số 4, 5', the: '4 5', skill: 'TO.SO.02', mo_sau: 'L031', so: [1, 5], chinh: [4, 5], dang: ['so-ra-dia', 'ghep-so'] },
  { id: 'R06', ten: 'Đếm đến 7', the: '6–7', skill: 'TO.DEM.03', mo_sau: 'L061', so: [1, 7], chinh: [6, 7], dang: ['dem', 'tim-dia'] },
  { id: 'R07', ten: 'Bằng nhau', the: '4 = 4', skill: 'TO.SS.02', mo_sau: 'L070', so: [1, 7], dang: ['bang-nhau'] },
  { id: 'R08', ten: 'Số 6, 7, 8', the: '6 7 8', skill: 'TO.SO.03', mo_sau: 'L086', so: [1, 8], chinh: [6, 8], dang: ['so-ra-dia', 'ghep-so'] },
  { id: 'R09', ten: 'Đếm đến 10', the: '8–10', skill: 'TO.DEM.04', mo_sau: 'L091', so: [1, 10], chinh: [8, 10], dang: ['dem', 'tim-dia'] },
  { id: 'R10', ten: 'Số 9 và 10', the: '9 10', skill: 'TO.SO.04', mo_sau: 'L101', so: [1, 10], chinh: [9, 10], dang: ['so-ra-dia', 'ghep-so'] },
];
const MOI_PHONG = 60; // kho đầu: 60 bài mỗi phòng × 10 phòng = 600 bài

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
// Ba lựa chọn liền nhau có chứa n, nằm trong khoảng của phòng
function ba(n, lo, hi) { let a = Math.max(lo, Math.min(n - 1, hi - 2)); if (a + 2 > hi) a = hi - 2; return [a, a + 1, a + 2]; }

function sinh(p, dang, vat, n, rng, id) {
  const T = VAT[vat], [lo, hi] = p.so, base = { activity_id: id, skill_id: p.skill, phong: p.id, dang };
  if (dang === 'dem') {
    const pool = ba(n, Math.max(1, lo), hi);
    return { ...base, engine: 'E01', mode: 'count', mechanic: 'M01', title: `Có mấy ${T}?`, object: 'art:' + vat, n, pool, max: hi, rounds: 1, words: SO.slice(0, Math.max(...pool)),
      hint: 'Bé chạm từng hình và đếm nhé.', q: `Có mấy ${T}?`, ok: `Đúng rồi! Có {word} ${T}.`, no: 'Bé đếm lại nhé.', hint_glow: false };
  }
  const plate = ns => ns.map(k => ({ e: 'art:' + vat, n: k }));
  const items = (q, opts, a, ok, no, show) => ({ ...base, engine: 'E01', mode: 'items', mechanic: 'M02', title: q.replace(/\.$/, ''), style: 'plate', order: 'fixed', rounds: 1,
    ...(show ? {} : { scene: 'lu', lu: 'chi-tay' }), items: [{ q, a, ok, no, opts, style: 'plate', ...(show ? { show } : {}) }] });
  if (dang === 'tim-dia') { const ns = rng.shuffle(ba(n, Math.max(1, lo), hi)); return items(`Bé tìm đĩa có ${SO[n - 1]} ${T}.`, plate(ns), ns.indexOf(n), `Đúng rồi! Đĩa này có ${SO[n - 1]} ${T}.`, 'Bé đếm lại từng đĩa xem.'); }
  if (dang === 'so-ra-dia') { const ns = rng.shuffle(ba(n, Math.max(1, lo), hi)); return items(`Bé tìm đĩa có số ${T} bằng số trên cọc.`, plate(ns), ns.indexOf(n), `Đúng rồi! Số ${SO[n - 1]}, ${SO[n - 1]} ${T}.`, 'Bé nhìn số trên cọc rồi đếm lại nhé.', `art:coc:${n}`); }
  if (dang === 'nhieu-hon' || dang === 'it-hon') {
    let m; do { m = rng.int(Math.max(1, lo), hi); } while (Math.abs(m - n) < 2);
    const ns = rng.shuffle([n, m]); const want = dang === 'nhieu-hon' ? Math.max(n, m) : Math.min(n, m);
    return items(`Đĩa nào có ${dang === 'nhieu-hon' ? 'nhiều' : 'ít'} ${T} hơn?`, plate(ns), ns.indexOf(want), `Đúng rồi! Đĩa này có ${SO[want - 1]} ${T}, ${dang === 'nhieu-hon' ? 'nhiều' : 'ít'} hơn.`, 'Bé đếm từng đĩa rồi so nhé.');
  }
  if (dang === 'bang-nhau') { const ns = rng.shuffle(ba(n, Math.max(1, lo), hi)); return items(`Bé tìm đĩa có số ${T} bằng đĩa của Lu.`, plate(ns), ns.indexOf(n), `Đúng rồi! Hai đĩa đều có ${SO[n - 1]} ${T}.`, 'Bé đếm đĩa của Lu, rồi đếm từng đĩa nhé.', `art:${vat}*${n}`); }
  if (dang === 'ghep-so') {
    const ns = rng.sample(range(Math.max(1, lo), hi), 3); if (!ns.includes(n)) ns[0] = n;
    return { ...base, engine: 'E02', mechanic: 'M10', target_style: 'pair', title: `Kéo ${T} về đúng cọc`, label: `Kéo ${T} về đúng cọc`, rounds: 1,
      sets: [ns.map(k => ({ piece: `art:${vat}*${k}`, target: `art:coc:${k}` }))], no: 'Bé đếm rồi tìm cọc có số giống vậy.', done: 'Bé ghép đúng hết rồi!' };
  }
  throw new Error('dạng lạ ' + dang);
}

export async function sinhKho({ seed = 2611 } = {}) {
  const ok = new Set((await J('registry/assets.json')).assets.filter(a => a.trang_thai === 'da_duyet').map(a => a.slot));
  const vats = Object.keys(VAT).filter(k => ok.has('art:' + k));
  const so300 = await lapSo(); const s300 = taoSo(so300.muc); const sKho = taoSo();
  const rng = makeRng(seed); const kho = []; const loai = { 'trung-y-het': 0, 'giong-gan': 0, 'trung-trong-kho': 0, 'loi-dap-an': 0 }; const viDu = [];
  for (const p of PHONG) {
    const ns = range(...(p.chinh || p.so)); let k = 0, thu = 0;
    while (k < MOI_PHONG && thu++ < 5000) {
      const dang = p.dang[thu % p.dang.length], vat = rng.pick(vats), n = rng.pick(ns);
      const a = sinh(p, dang, vat, n, rng, `SD-${p.id}-${String(k + 1).padStart(3, '0')}`);
      const E = ENGINES[a.engine]; const err = [...E.validate(a), ...E.verify(a, E.generate(a, makeRng(1)))];
      if (err.length) { loai['loi-dap-an']++; continue; }
      const us = donVi(a); let ly = null;
      for (const u of us) { ly = kiemTrung(u, s300); if (ly) break; const t = kiemTrung(u, sKho); if (t) { ly = { ...t, loai: 'trung-trong-kho' }; break; } }
      if (ly) { loai[ly.loai]++; if (viDu.length < 6 && ly.loai !== 'trung-trong-kho') viDu.push({ bai: `${a.title} (${n})`, ...ly }); continue; }
      us.forEach(u => themVaoSo(sKho, { ...u, nguon: a.activity_id }));
      a.van_tay = us.map(u => u.fp); kho.push(a); k++;
    }
  }
  return { kho, loai, viDu, so300 };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { kho, loai, viDu, so300 } = await sinhKho();
  const out = { format: 'lu-cong', version: 1, cong: 'so-dem', ten: 'Số và đếm', seed: 2611, sinh_luc: new Date().toISOString(),
    so_300: { buoi: so300.buoi, so_bai_tap: so300.so_bai_tap }, loai_bo: loai, phong: PHONG.map(({ dang, chinh, ...p }) => ({ ...p, so_bai: kho.filter(a => a.phong === p.id).length })), bai: kho };
  await writeFile(path.join(ROOT, 'content/cong/so-dem.json'), JSON.stringify(out));
  // Câu cần giọng đọc (tạo trên máy 24H bằng tools/tao_giong_doc.py như buổi học)
  const reg = (await J('content/audio/registry.json')).clips; const L = new Set();
  kho.forEach(a => ENGINES[a.engine].lines(a).forEach(t => t && !t.startsWith('__') && L.add(t)));
  ['Bé luyện xong một lượt!', 'Hôm nay bé luyện nhiều rồi. Mình nghỉ mắt một chút nhé.', 'Bé chọn một phòng để luyện nhé.'].forEach(t => L.add(t));
  const need = [...L].filter(t => !reg[t]);
  await writeFile(path.join(ROOT, 'content/cong/can-tao-giong.json'), JSON.stringify({ format: 'lu-voice-todo', lesson: 'cong-so-dem', at: new Date().toISOString(), lines: need.map(text => ({ text, lang: 'vi' })) }, null, 1));
  console.log(`Cổng Số và đếm: ${kho.length} bài trong ${PHONG.length} phòng. Loại bỏ: ${JSON.stringify(loai)}`);
  viDu.forEach(v => console.log('  loại:', v.bai, '→', v.loai, 'với', v.voi, v.j ?? ''));
  console.log(`Câu cần giọng đọc: ${need.length}/${L.size} → content/cong/can-tao-giong.json`);
}

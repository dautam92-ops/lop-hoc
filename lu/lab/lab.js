// Phòng mẫu Lu: danh mục mẫu theo 26 cơ chế, chơi thử trong khung iPad / điện thoại, thử đúng / sai / không trả lời,
// nghe toàn bộ lời thoại, biến thể theo seed, nhận xét và trạng thái kiểm duyệt (lưu trên máy của người duyệt).
// Không tự phê duyệt: trạng thái gốc của mọi mẫu là "Chờ duyệt"; chỉ người duyệt đổi trạng thái.
import { ENGINES } from '../engines/index.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const get = u => fetch(u).then(r => (r.ok ? r.json() : null)).catch(() => null);
const [D, LIB, ENG, AUD] = await Promise.all([get('../content/lab/samples.json'), get('../content/lab/library.json'), get('../registry/engines.json'), get('../content/audio/registry.json')]);
const MET = await get('../content/lab/methodology.json');
const LOI = (await get('../content/lab/loi-da-bao.json'))?.loi || [];
const PPN = Object.fromEntries((MET?.methods || []).map(m => [m.id, m.ten])); const NLN = Object.fromEntries((MET?.abilities || []).map(a => [a.id, a.ten]));
const CLIPS = AUD?.clips || {};
const STATUS = { draft: 'Bản nháp', ready_for_review: 'Chờ duyệt', needs_revision: 'Cần sửa', approved: 'Đã duyệt', deprecated: 'Ngừng dùng' };
const AGE = { '4-5': '4–5 tuổi', '5-6': '5–6 tuổi' };
const byId = Object.fromEntries(D.samples.map(s => [s.id, s]));

/* ---------- Nhận xét lưu trên máy người duyệt ---------- */
const RKEY = 'lu-lab-review';
const loadR = () => { try { return JSON.parse(localStorage.getItem(RKEY) || '{}'); } catch { return {}; } };
const saveR = r => { try { localStorage.setItem(RKEY, JSON.stringify(r)); } catch {} };
let REV = loadR();
const statusOf = id => REV[id]?.status || byId[id]?.status || 'ready_for_review';
const tagSt = id => `<span class="tag st-${statusOf(id)}">${STATUS[statusOf(id)]}</span>`;

/* ---------- Trạng thái trang ---------- */
const P = new URLSearchParams(location.hash.slice(1));
const st = { tab: P.get('tab') || 'd1', id: P.get('s') || null, age: P.get('age') || '4-5', dev: P.get('dev') || 'ipad', seed: Number(P.get('seed')) || 7, idle: 0, anh: P.get('anh') || 'cho' };
const saveHash = () => { const h = new URLSearchParams({ tab: st.tab, ...(st.id ? { s: st.id, age: st.age, dev: st.dev, seed: st.seed } : {}) }); history.replaceState(null, '', '#' + h); };

/* ---------- Danh sách ---------- */
const card = (s, k) => `<button class="item${s.id === st.id ? ' on' : ''}" data-id="${s.id}"><div class="k">${esc(k || s.id)} · ${esc(s.engine)}${s.mode ? ' ' + esc(s.mode) : ''}</div>
  <div class="t">${esc(s.title)}</div><div class="m">${esc(s.program)}</div>${tagSt(s.id)}</button>`;
function renderList() {
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === st.tab));
  const F = $('#filters'), I = $('#items'); F.hidden = st.tab !== 'all';
  if (st.tab === 'cc') I.innerHTML = D.mechanics.map(m => { const s = D.samples.find(x => x.cc.includes(m.id)); return s ? card(s, `${m.id} ${m.name}`) : `<div class="item"><div class="k">${m.id}</div><div class="t">${esc(m.name)}</div><div class="m">Chưa có mẫu</div></div>`; }).join('');
  if (st.tab === 'd1') I.innerHTML = D.samples.filter(s => s.dot === 1).map(s => card(s, `${s.cc.join(', ')} · 10 bài hoàn chỉnh`)).join('');
  if (st.tab === 'pp20') I.innerHTML = (D.rep20 || []).map(r => r.ids.map(id => byId[id] ? card(byId[id], `${r.n}. ${r.name}${byId[id].id.startsWith('MT') ? ' · mẫu mới' : ' · dùng lại'}`) : '').join('')).join('');
  if (st.tab === 'x30') I.innerHTML = D.x30.map(x => { const ss = D.samples.filter(s => s.x.includes(x.n)); return ss.map(s => card(s, `Mẫu ${x.n}. ${x.name}`)).join(''); }).join('');
  // Lỗi tam đã báo: bấm để mở đúng bài, đúng tuổi, đúng máy
  if (st.tab === 'loi') I.innerHTML = LOI.map(l => byId[l.s] ? `<button class="item" data-id="${l.s}" data-age="${esc(l.age)}" data-dev="${esc(l.dev)}"><div class="k">${esc(l.ngay)} · ${esc(l.s)} · ${l.dev === 'phone' ? 'điện thoại' : 'iPad'}</div><div class="t">${esc(l.loi)}</div><div class="m">${l.cho ? 'Đang chờ' : 'Đã sửa'}: ${esc(l.sua)}</div></button>` : '').join('');
  if (st.tab === 'all') {
    const v = id => $(id).value;
    I.innerHTML = D.samples.filter(s => (!v('#f-group') || s.group === v('#f-group')) && (!v('#f-prog') || s.program === v('#f-prog')) && (!v('#f-eng') || s.engine === v('#f-eng')) && (!v('#f-status') || statusOf(s.id) === v('#f-status'))).map(s => card(s)).join('') || '<div class="empty">Không có mẫu khớp bộ lọc.</div>';
  }
  if (['pt', 'eng', 'rv', 'kb'].includes(st.tab)) I.innerHTML = '<div class="empty">Bảng ở khung bên phải.</div>';
  I.querySelectorAll('.item[data-id]').forEach(b => b.onclick = () => { st.id = b.dataset.id; if (b.dataset.age) st.age = b.dataset.age; if (b.dataset.dev) st.dev = b.dataset.dev; if (['pt', 'eng', 'rv', 'kb'].includes(st.tab)) st.tab = 'cc'; renderList(); renderDetail(); if (innerWidth < 900) $('#detail').scrollIntoView({ behavior: 'smooth' }); });
}
const fill = (sel, vals, lab = x => x) => { const e = $(sel); vals.forEach(v => e.insertAdjacentHTML('beforeend', `<option value="${esc(v)}">${esc(lab(v))}</option>`)); e.onchange = renderList; };
fill('#f-group', [...new Set(D.samples.map(s => s.group))].sort());
fill('#f-prog', D.programs.filter(p => D.samples.some(s => s.program === p)));
fill('#f-eng', [...new Set(D.samples.map(s => s.engine))].sort(), e => `${e} ${ENG?.engines?.find(x => x.engine_id === e || x.id === e)?.ten || ''}`.trim());
fill('#f-status', Object.keys(STATUS), k => STATUS[k]);
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { st.tab = b.dataset.tab; renderList(); if (['pt', 'eng', 'rv', 'kb'].includes(st.tab)) renderTable(); else renderDetail(); saveHash(); });

/* ---------- Bảng: phương thức, engine, nhận xét ---------- */
function renderTable() {
  const box = $('#detail');
  if (st.tab === 'pt') {
    if (!LIB) { box.innerHTML = '<div class="empty">Chưa có thư viện phương thức.</div>'; return; }
    box.innerHTML = `<h2>Thư viện phương thức</h2><p class="meta">${LIB.methods.length} phương thức đã hợp nhất từ ${LIB.refs_total} mã tham chiếu M001–M100. Mã MECH M01–M58 đang dùng được giữ nguyên.</p>
      <div style="overflow:auto;max-height:75vh"><table><thead><tr><th>Mã</th><th>Tên</th><th>Nhóm</th><th>Mã tham chiếu</th><th>Cơ chế</th><th>Engine</th><th>Mẫu chơi thử</th><th>Tình trạng</th></tr></thead><tbody>
      ${LIB.methods.map(m => `<tr><td><b>${m.id}</b></td><td>${esc(m.name_vi)}<br><small>${esc(m.name_en)}</small></td><td>${esc(m.group)}</td><td>${esc(m.refs.join(', '))}</td><td>${esc(m.mechanics.join(', '))}</td><td>${esc(m.engines.join(', '))}</td>
        <td>${m.demo.map(d => `<a href="#" data-go="${d}">${d}</a>`).join(' ')}</td><td>${esc(m.support)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  if (st.tab === 'eng') {
    const rows = LIB?.mechanics || [];
    box.innerHTML = `<h2>26 cơ chế và engine</h2><div style="overflow:auto;max-height:75vh"><table><thead><tr><th>Cơ chế</th><th>Engine</th><th>Đánh giá</th><th>Đã có trước</th><th>Bổ sung lần này</th><th>Mẫu</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td><b>${r.id}</b> ${esc(r.name)}</td><td>${esc(r.engine)}</td><td>${esc(r.verdict)}</td><td>${esc(r.before)}</td><td>${esc(r.added)}</td><td><a href="#" data-go="${r.demo}">${r.demo}</a></td></tr>`).join('')}</tbody></table></div>
      <h3>Engine</h3><table><thead><tr><th>Mã</th><th>Tên</th><th>Chế độ</th><th>Trạng thái</th></tr></thead><tbody>${(ENG?.engines || []).map(e => `<tr><td>${esc(e.engine_id || e.id)}</td><td>${esc(e.ten || e.name)}</td><td>${esc((e.modes || []).join(', '))}</td><td>${esc(e.trang_thai || '')}</td></tr>`).join('')}</tbody></table>`;
  }
  if (st.tab === 'kb') {
    if (!MET) { box.innerHTML = '<div class="empty">Chưa có khung phương pháp.</div>'; return; }
    const go = ids => (ids || []).map(d => byId[d] ? `<a href="#" data-go="${d}">${d}</a>` : esc(d)).join(' ');
    const src = m => m.nguon.map(n => n.url ? `<a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.t)}</a>` : esc(n.t)).join('<br>');
    box.innerHTML = `<h2>Khung phương pháp giáo dục</h2><p class="meta">Đã duyệt (tam 26/11 18:28), áp dụng vào chương trình · ${MET.methods.length} phương pháp · ${MET.abilities.length} năng lực · ${MET.montessori.reduce((a, v) => a + v.hoat_dong.length, 0)} hoạt động Montessori (A ${MET.montessori_abc.A}, B ${MET.montessori_abc.B}, C ${MET.montessori_abc.C}) · ${MET.offscreen.length} hoạt động ngoài màn hình · ${MET.new_skills.length} kỹ năng mới trong Skill Tree v0.4</p>
      <div class="note">${MET.nguyen_tac.map(esc).join(' · ')}</div>
      <h3>Phương pháp và mức bằng chứng</h3><div style="overflow:auto;max-height:60vh"><table><thead><tr><th>Mã</th><th>Phương pháp</th><th>Bằng chứng</th><th>4–5 / 5–6</th><th>Số hóa</th><th>Giới hạn</th><th>Nguồn</th><th>Mức nghiên cứu</th><th>Mẫu</th></tr></thead><tbody>
      ${MET.methods.map(m => `<tr><td><b>${m.id}</b></td><td>${esc(m.ten)}<br><small>${esc(m.ten_en)}</small></td><td><b>${m.chung_cu}</b> ${esc(m.chung_cu_ghi)}</td><td>${esc(m.tuoi['4-5'])}<br>${esc(m.tuoi['5-6'])}</td><td>${esc(m.so_hoa)}</td><td>${esc(m.gioi_han.join('; '))}</td><td><small>${src(m)}</small></td><td>${m.nghien_cuu === 'doi-chieu' ? 'Đã đối chiếu nguồn' : 'Tổng quan'}</td><td>${go(m.mau)}</td></tr>`).join('')}</tbody></table></div>
      <h3>18 năng lực nhận thức và Skill Tree</h3><table><thead><tr><th>Năng lực</th><th>Kỹ năng hiện có</th><th>Mức</th><th>Kỹ năng mới</th><th>Mẫu</th></tr></thead><tbody>
      ${MET.abilities.map(a => `<tr><td><b>${a.id}</b> ${esc(a.ten)}<br><small>${esc(a.mo_ta)}</small></td><td>${a.so_ky_nang}</td><td>${esc(a.muc)}</td><td>${esc(a.de_xuat.join(', '))}</td><td>${go(a.mau)}</td></tr>`).join('')}</tbody></table>
      <h3>13 kỹ năng mới (đã thêm vào Skill Tree v0.4)</h3><table><thead><tr><th>Mã</th><th>Tên</th><th>Tuổi</th><th>Mục tiêu</th><th>Lý do</th></tr></thead><tbody>${MET.new_skills.map(n => `<tr><td>${n.id}</td><td>${esc(n.ten)}</td><td>${esc(n.tuoi)}</td><td>${esc(n.muc_tieu)}</td><td>${esc(n.ly_do)}</td></tr>`).join('')}</tbody></table>
      <h3>Montessori 5 vùng (A làm đủ trên app · B mô phỏng + làm thật · C cần đồ thật)</h3>${MET.montessori.map(v => `<h4>${esc(v.vung)} <small>${esc(v.en)}</small></h4><table><thead><tr><th>#</th><th>Hoạt động</th><th>Giáo cụ</th><th>Tự sửa lỗi</th><th>Tuổi</th><th>Loại</th><th>Mẫu</th></tr></thead><tbody>${v.hoat_dong.map(a => `<tr><td>${a.thu_tu}</td><td>${esc(a.ten)}<br><small>${esc(a.huong_dan)}</small></td><td>${esc(a.giao_cu)}</td><td>${esc(a.tu_sua_loi)}</td><td>${esc(a.tuoi)}</td><td><b>${a.loai}</b></td><td>${go([a.mau].filter(Boolean))}</td></tr>`).join('')}</tbody></table>`).join('')}
      <h3>Hoạt động ngoài màn hình</h3><table><thead><tr><th>Mã</th><th>Hoạt động</th><th>Vật liệu rẻ</th><th>Hướng dẫn bố mẹ</th><th>An toàn</th></tr></thead><tbody>${MET.offscreen.map(o => `<tr><td>${o.id}</td><td>${esc(o.ten)}<br><small>${esc(o.tuoi)} · ${o.phut} phút</small></td><td>${esc(o.vat_lieu.join(', '))}</td><td>${esc(o.huong_dan_bo_me.join('. '))}</td><td>${esc(o.an_toan)}</td></tr>`).join('')}</tbody></table>
      <h3>Tích hợp 300 buổi</h3><ul>${MET.plan_rules.map(r => `<li>${esc(r)}</li>`).join('')}</ul><table><thead><tr><th>Vùng</th><th>Buổi</th><th>Trọng tâm</th><th>Phương pháp nhấn mạnh</th><th>Montessori</th><th>Ngoài màn hình</th><th>Mẫu</th></tr></thead><tbody>${MET.plan.map(r => `<tr><td>${r.vung}</td><td>${r.bai}<br><small>${esc(r.tuoi)}</small></td><td>${esc(r.trong_tam)}</td><td>${r.pp.map(p => esc(PPN[p] || p)).join(', ')}</td><td>${esc(r.montessori.join('; '))}</td><td>${esc(r.ngoai_man_hinh.join(', '))}</td><td>${go(r.mau)}</td></tr>`).join('')}</tbody></table>`;
  }
  if (st.tab === 'rv') {
    const ids = Object.keys(REV).filter(k => byId[k]);
    box.innerHTML = `<h2>Nhận xét của tôi</h2><p class="meta">Nhận xét lưu trên trình duyệt này. Bấm "Sao chép" rồi dán vào trò chuyện để Claude sửa.</p>
      <div class="bar"><button class="btn ok" id="cp">Sao chép tất cả nhận xét</button><button class="btn" id="dl">Tải tệp nhận xét</button></div>
      ${ids.length ? `<table><thead><tr><th>Mẫu</th><th>Trạng thái</th><th>Nhận xét</th></tr></thead><tbody>${ids.map(k => `<tr><td><a href="#" data-go="${k}">${k}</a> ${esc(byId[k].title)}</td><td>${tagSt(k)}</td><td>${(REV[k].notes || []).map(n => `<div>${esc(n.at.slice(0, 16).replace('T', ' '))} · ${esc(AGE[n.age] || '')}: ${esc(n.text)}</div>`).join('')}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">Chưa có nhận xét.</div>'}`;
    $('#cp').onclick = () => navigator.clipboard?.writeText(reviewText()).then(() => { $('#cp').textContent = 'Đã sao chép'; });
    $('#dl').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(REV, null, 1)], { type: 'application/json' })); a.download = 'nhan-xet-phong-mau.json'; a.click(); };
  }
  box.querySelectorAll('[data-go]').forEach(a => a.onclick = e => { e.preventDefault(); st.id = a.dataset.go; st.tab = 'cc'; renderList(); renderDetail(); });
}
const reviewText = () => Object.entries(REV).filter(([k]) => byId[k]).map(([k, r]) => `${k} ${byId[k].title}: ${STATUS[r.status || 'ready_for_review']}\n${(r.notes || []).map(n => `- (${AGE[n.age] || ''}) ${n.text}`).join('\n')}`).join('\n\n');

/* ---------- Chi tiết + chơi thử ---------- */
let frame = null;
function renderDetail() {
  saveHash();
  const box = $('#detail'); const s = byId[st.id];
  if (!s) { box.innerHTML = '<div class="empty">Chọn một mẫu ở bên trái để chơi thử.</div>'; return; }
  const act = s.levels[st.age]; const E = ENGINES[act.engine];
  let lines = []; try { lines = [...new Set(E.lines(act))]; } catch {}
  const mech = s.cc.map(c => D.mechanics.find(m => m.id === c)).filter(Boolean).map(m => `${m.id} ${m.name}`).join(', ');
  const xs = s.x.map(n => `${n}. ${D.x30[n - 1].name}`).join('; ');
  box.innerHTML = `<div class="d-head"><h2>${esc(s.title)}</h2><div class="meta">${s.id} · ${esc(s.engine)}${s.mode ? ' / ' + esc(s.mode) : ''} · ${esc(s.program)} · phiên bản ${esc(s.version)} ${tagSt(s.id)}</div></div>
    <div class="d-grid"><div><b>Mục tiêu giáo dục</b>${esc(s.goal)}</div><div><b>Hai mức tuổi</b>${esc(s.diff)}</div>
      <div><b>Cơ chế tương tác</b>${esc(mech || 'Mẫu nghiệm thu')}</div><div><b>Mẫu nghiệm thu</b>${esc(xs || '–')}</div>
      <div><b>Kỹ năng (${esc(AGE[st.age])})</b>${esc(act.skill_id)}</div><div><b>Phương thức tham chiếu</b>${esc(s.methods.join(', '))}</div>${s.pp?.length ? `<div><b>Phương pháp giáo dục</b>${esc(s.pp.map(p => PPN[p] || p).join(', '))}</div><div><b>Năng lực nhận thức</b>${esc((s.nl || []).map(n => NLN[n] || n).join(', '))}${s.mon ? ` · Montessori: ${esc(s.mon[0])}, loại ${esc(s.mon[1])}` : ''}</div>` : ''}</div>
    ${s.note ? `<div class="note">${esc(s.note)}</div>` : ''}
    <div class="bar"><span class="seg" id="age">${Object.keys(s.levels).map(a => `<button data-v="${a}" class="${a === st.age ? 'on' : ''}">${AGE[a]}</button>`).join('')}</span>
      <span class="seg" id="dev"><button data-v="ipad" class="${st.dev === 'ipad' ? 'on' : ''}">iPad</button><button data-v="phone" class="${st.dev === 'phone' ? 'on' : ''}">Điện thoại</button></span>
      <span class="seg" id="anh" title="Ảnh vẽ tay mới chỉ dùng trong bài sau khi tam duyệt. Chọn 'Xem ảnh chờ duyệt' để xem trước ảnh trong bài."><button data-v="cho" class="${st.anh === 'cho' ? 'on' : ''}">Xem ảnh chờ duyệt</button><button data-v="duyet" class="${st.anh === 'duyet' ? 'on' : ''}">Chỉ ảnh đã duyệt</button></span>
      <label>Biến thể <input class="seed" id="seed" type="number" value="${st.seed}"></label><button class="btn" id="other">Biến thể khác</button></div>
    <div class="bar"><button class="btn" id="restart">Chơi lại</button><button class="btn ok" id="right">Thử đúng</button><button class="btn warn" id="wrong">Thử sai</button>
      <button class="btn" id="idle">Thử không trả lời</button><button class="btn" id="replay">Nghe lại</button><button class="btn" id="pause">Tạm dừng</button><button class="btn" id="skip">Bỏ qua câu</button></div>
    <div class="stagebox" id="stagebox"></div>
    <div class="cols">
      <div class="panel"><h3>Diễn biến</h3><div class="log" id="log"><div class="sys">Bấm Bắt đầu trong khung để chơi.</div></div></div>
      <div class="panel"><h3>Toàn bộ lời thoại (${lines.length})</h3><ul class="lines">${lines.map((l, i) => `<li><button data-l="${i}" aria-label="Nghe">Nghe</button><span>${esc(l)}</span>${CLIPS[l] ? '<span class="has">giọng Hoài My</span>' : '<span class="no">chưa có giọng</span>'}</li>`).join('')}</ul></div>
      <div class="panel full"><h3>Nhận xét và kiểm duyệt</h3>
        <textarea id="note" placeholder="Ví dụ: hình con vịt chưa giống, câu khen lặp lại, nút quá nhỏ trên điện thoại…"></textarea>
        <div class="bar"><button class="btn" id="send">Lưu nhận xét</button><button class="btn warn" id="rev">Yêu cầu chỉnh sửa</button><button class="btn ok" id="ok">Phê duyệt</button><button class="btn bad" id="no">Từ chối</button>
          <select id="stsel">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}"${statusOf(s.id) === k ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
        <div class="hist">${(REV[s.id]?.notes || []).map(n => `<div>${esc(n.at.slice(0, 16).replace('T', ' '))} · ${esc(AGE[n.age] || '')} · ${esc(n.text)}</div>`).join('')}</div></div>
    </div>`;
  // Khung thiết bị
  const W = st.dev === 'ipad' ? 1180 : 390, H = st.dev === 'ipad' ? 820 : 844;
  const sb = $('#stagebox'); sb.innerHTML = `<div class="dwrap"><div class="device ${st.dev}"><iframe id="frame" width="${W}" height="${H}" title="Chơi thử" allow="autoplay"></iframe></div></div>`;
  frame = $('#frame'); const wr = sb.firstElementChild, dv = wr.firstElementChild; const pad = st.dev === 'ipad' ? 28 : 24;
  const fit = () => { const k = Math.min(1, (sb.clientWidth - 24) / (W + pad), (innerHeight - 40) / (H + pad)); dv.style.transform = `scale(${k})`; wr.style.width = (W + pad) * k + 'px'; wr.style.height = (H + pad) * k + 'px'; };
  fit(); addEventListener('resize', fit);
  load();
  // Điều khiển
  box.querySelectorAll('#age button').forEach(b => b.onclick = () => { st.age = b.dataset.v; renderDetail(); });
  box.querySelectorAll('#anh button').forEach(b => b.onclick = () => { st.anh = b.dataset.v; renderDetail(); });
  box.querySelectorAll('#dev button').forEach(b => b.onclick = () => { st.dev = b.dataset.v; renderDetail(); });
  $('#seed').onchange = e => { st.seed = Number(e.target.value) || 1; st.idle = 0; load(); };
  $('#other').onclick = () => { st.seed = Math.floor(Math.random() * 99999) + 1; $('#seed').value = st.seed; st.idle = 0; load(); };
  $('#restart').onclick = () => { st.idle = 0; load(); };
  $('#idle').onclick = () => { st.idle = 5000; load(true); log('sys', 'Thử không trả lời: đừng chạm gì. Sau khi Lu nói xong 5 giây, Lu nhắc lại câu hỏi; lần sau Lu làm sáng chỗ cần chạm.'); };
  const cmd = c => frame.contentWindow?.postMessage({ type: 'lu-lab-cmd', cmd: c }, '*');
  $('#right').onclick = () => cmd('right'); $('#wrong').onclick = () => cmd('wrong'); $('#replay').onclick = () => cmd('replay'); $('#skip').onclick = () => cmd('skip');
  $('#pause').onclick = e => { const p = e.target.textContent === 'Tạm dừng'; cmd(p ? 'pause' : 'resume'); e.target.textContent = p ? 'Tiếp tục' : 'Tạm dừng'; };
  box.querySelectorAll('[data-l]').forEach(b => b.onclick = () => sayLine(lines[+b.dataset.l]));
  // Nhận xét
  const rec = (status, text) => { const r = REV[s.id] ||= { notes: [] }; if (text) r.notes.push({ at: new Date().toISOString(), age: st.age, seed: st.seed, text }); if (status) r.status = status; saveR(REV); renderList(); renderDetail(); };
  $('#send').onclick = () => { const t = $('#note').value.trim(); if (t) rec(null, t); };
  $('#rev').onclick = () => rec('needs_revision', $('#note').value.trim() || 'Yêu cầu chỉnh sửa');
  $('#ok').onclick = () => rec('approved', $('#note').value.trim());
  $('#no').onclick = () => rec('deprecated', $('#note').value.trim() || 'Từ chối');
  $('#stsel').onchange = e => rec(e.target.value, '');
}
function load(auto = false) {
  saveHash(); $('#log').innerHTML = '';
  frame.src = `play.html?s=${encodeURIComponent(st.id)}&age=${st.age}&seed=${st.seed}${st.idle ? `&idle=${st.idle}` : ''}${auto ? '&auto=1' : ''}${st.anh === 'cho' ? '&anh=cho' : ''}`;
}
const log = (cls, t) => { const l = $('#log'); if (!l) return; l.insertAdjacentHTML('beforeend', `<div class="${cls}">${esc(t)}</div>`); l.scrollTop = l.scrollHeight; };
const SFX = { __jingle: '[âm báo đúng]', __dung: '[tiếng "ting"]', __boing: '[âm nhẹ: chưa đúng]', __ok: '[Excellent!]', __no: '[Oops!]' };
addEventListener('message', e => {
  const m = e.data; if (!m || m.type !== 'lu-lab' || m.sid !== st.id) return;
  if (m.ev === 'speak') m.keys.forEach(k => log('say', SFX[k] || 'Lu: ' + k));
  if (m.ev === 'event') { const v = m.evt; log(v.kind === 'participation' ? 'ev-ok' : v.correct ? 'ev-ok' : 'ev-no', `Ghi kết quả: ${v.kind === 'participation' ? 'đã tham gia' : v.correct ? 'đúng' : 'chưa đúng'}${v.tries ? `, ${v.tries} lần thử` : ''}${v.hints ? ', có gợi ý' : ''}`); }
  if (m.ev === 'idle') log('sys', m.step === 1 ? 'Bé chưa trả lời: Lu nhắc lại câu hỏi.' : 'Bé vẫn chưa trả lời: Lu làm sáng chỗ cần chạm.');
  if (m.ev === 'cmd' && !m.ok) log('sys', m.cmd === 'wrong' ? 'Hoạt động này không có lựa chọn sai (hoạt động mở hoặc tham gia).' : 'Chưa thực hiện được lúc này.');
  if (m.ev === 'done') log('sys', 'Xong hoạt động.');
  if (m.ev === 'error') log('ev-no', 'Lỗi: ' + m.msg);
});
// Nghe một câu: file giọng Hoài My nếu có, không thì giọng tạm của trình duyệt
const player = new Audio();
function sayLine(t) {
  if (CLIPS[t]) { player.src = '../content/audio/' + CLIPS[t]; player.play().catch(() => {}); return; }
  if (!('speechSynthesis' in window)) return; speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t); const vi = /[^\x00-\x7f]/.test(t); u.lang = vi ? 'vi-VN' : 'en-US'; speechSynthesis.speak(u);
}

renderList(); if (['pt', 'eng', 'rv', 'kb'].includes(st.tab)) renderTable(); else renderDetail();

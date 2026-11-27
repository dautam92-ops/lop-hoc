// Cổng luyện tập (tam duyệt 26/11 20:35): 12 cổng bên cạnh lộ trình 300 buổi, mỗi cổng nhiều phòng, mỗi phòng một kỹ năng.
// Một lượt luyện = 8 bài tập có chấm tiến độ, xong nhận sao rồi về cổng. Sau 3 lượt trong ngày Lu rủ nghỉ, bố mẹ giữ 2 giây để mở thêm.
// Phòng chỉ mở khi bé đã học buổi dạy kỹ năng đó trên lộ trình. Một bài không quay lại trong 30 ngày.
// Kho bài sinh sẵn bằng tools/cong/sinh-*.mjs, đã lọc trùng với 300 buổi (tools/cong/van-tay.mjs).
import { createVoice, createUI, makeRng, subSeed, newSeed, uid, esc, luArt, holdButton, CORE_VERSION } from './lu-core.js';
import { vis } from '../ui/art.js';
import { sceneHTML } from '../ui/scenes.js';
import { ENGINES } from '../engines/index.js';

const STAR = `<svg viewBox="0 0 100 100" class="lu-star" aria-hidden="true"><path d="M50 8l11 24 26 3-19 18 5 26-23-13-23 13 5-26L13 35l26-3z" fill="#f6c85f" stroke="#6b5232" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
const BD = { hall: ['L001-BG-02', 'san'], cong: ['L001-BG-03', 'vuon'], luot: ['L001-BG-01', 'nha-sang'] };
const NGAY = 864e5;
const homNay = () => new Date().toLocaleDateString('sv');
const IC_BACK = `<svg class="lu-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>`;

export async function runCong(root, opts = {}) {
  const { storage, fast = false } = opts;
  const DS = await (await fetch('content/cong/cong.json')).json();
  const voice = createVoice({ clips: opts.clips || {}, base: opts.audioBase || '', fast });
  const ui = createUI(root, voice);
  const T = window.__luTest = { current: [], events: [], done: false, man: '' };
  const kho = {};
  const napKho = async c => kho[c.id] ??= await (await fetch(c.kho)).json();
  const setBd = k => { const [id, kind] = BD[k]; const r = sceneHTML(id, kind); ui.setBackdrop(id, r.html, r.real); };
  const kv = (k, v) => { if (!storage) return v; if (v === undefined) return storage.getSession(k); storage.setSession(k, v); return v; };
  let moHet = !!opts.moHet; let unlocked = false;
  const phongMo = ph => moHet || !!kv('done:' + ph.mo_sau);
  const mark = el => { T.current = [].concat(el).filter(Boolean); };
  const back = (label, fn) => { const b = document.createElement('button'); b.className = 'corner-btn exit'; b.setAttribute('aria-label', label); b.innerHTML = IC_BACK; b.onclick = () => { voice.stop(); fn(); }; ui.stage.appendChild(b); return b; };

  // Màn 1: sảnh 12 cổng
  const sanh = () => {
    T.man = 'sanh'; T.done = false; ui.setSteps([]); ui.setStep(-1); setBd('hall');
    const the = DS.cong.map(c => {
      const hinh = c.hinh ? vis(c.hinh) : `<span class="cg-chu${c.chu.length > 1 ? ' dai' : ''}">${esc(c.chu)}</span>`;
      return `<button class="hub-card cg-card${c.trang_thai === 'mo' ? ' next' : ' sap'}" data-id="${c.id}" ${c.trang_thai === 'mo' ? '' : 'aria-disabled="true"'}>
        <span class="hc-art">${hinh}</span><span class="hc-t">${esc(c.ten)}</span>${c.trang_thai === 'mo' ? '' : '<span class="hc-n">Sắp mở</span>'}</button>`;
    }).join('');
    ui.stage.innerHTML = `<div class="scene hub cg"><div class="hub-head">${luArt('chi-tay')}<div><h1 class="title">Cổng luyện tập</h1></div></div>
      <div class="hub-grid cg-grid">${the}</div><div class="cap"></div></div>`;
    voice.caption = ui.stage.querySelector('.cap');
    back('Về lộ trình', () => { location.href = 'index.html'; });
    ui.stage.querySelectorAll('.cg-card').forEach(b => b.onclick = () => { const c = DS.cong.find(x => x.id === b.dataset.id); if (c.trang_thai === 'mo') vaoCong(c); });
    mark(ui.stage.querySelector('.cg-card.next'));
  };

  // Màn 2: trong một cổng, các phòng
  const vaoCong = async (c, loiChao = true) => {
    const K = await napKho(c); T.man = 'cong'; T.done = false; ui.setSteps([]); ui.setStep(-1); setBd('cong');
    const sao = kv('cong:sao') || {};
    const the = K.phong.map(ph => { const mo = phongMo(ph), s = Math.min(3, sao[ph.id] || 0);
      return `<button class="hub-card cg-phong${mo ? '' : ' khoa'}" data-id="${ph.id}"${mo ? '' : ' aria-disabled="true"'}>
        <span class="hc-art cg-so">${esc(mo ? ph.the : '?')}</span><span class="hc-t">${esc(mo ? ph.ten : 'Lu chưa dạy')}</span>
        ${mo ? `<span class="cg-sao">${[0, 1, 2].map(i => `<i class="${i < s ? 'co' : ''}"></i>`).join('')}</span>` : ''}</button>`; }).join('');
    const coMo = K.phong.some(phongMo);
    ui.stage.innerHTML = `<div class="scene hub cg"><div class="hub-head">${vis(c.hinh || '')}<div><h1 class="title">${esc(c.ten)}</h1>
      <div class="hub-prog">${K.bai.length} bài luyện</div></div></div>
      <div class="hub-grid cg-grid cg-phongs">${the}</div><div class="cap"></div>
      <div class="row2">${coMo ? '<button class="big-btn cg-ngaunhien">Luyện ngẫu nhiên</button>' : ''}</div>
      ${moHet ? '' : '<div class="row2"><button class="link-btn hold cg-bome">Bố mẹ xem mọi phòng (giữ 2 giây)<span class="bar"></span></button></div>'}</div>`;
    voice.caption = ui.stage.querySelector('.cap');
    back('Về các cổng', sanh);
    if (loiChao) voice.say(['Bé chọn một phòng để luyện nhé.']);
    ui.stage.querySelectorAll('.cg-phong').forEach(b => b.onclick = () => { const ph = K.phong.find(x => x.id === b.dataset.id); if (phongMo(ph)) batDau(c, [ph]); else voice.say(['Lu chưa dạy phần này. Bé học trên lộ trình trước nhé.']); });
    const nn = ui.stage.querySelector('.cg-ngaunhien'); if (nn) nn.onclick = () => batDau(c, K.phong.filter(phongMo));
    const bm = ui.stage.querySelector('.cg-bome'); if (bm) holdButton(bm, () => { moHet = true; vaoCong(c, false); }, fast);
    mark(nn || ui.stage.querySelector('.cg-phong:not(.khoa)'));
  };

  // Chọn 8 bài: chưa làm trong 30 ngày trước, thiếu thì lấy bài làm lâu nhất
  const chonBai = (K, phongs, seed) => {
    const ls = kv('cong:lich-su') || {}, now = Date.now(), ids = new Set(phongs.map(p => p.id));
    const rng = makeRng(seed); const ung = rng.shuffle(K.bai.filter(a => ids.has(a.phong)));
    const moi = ung.filter(a => !ls[a.activity_id] || now - ls[a.activity_id] > DS.luot.khong_lap_ngay * NGAY);
    const cu = ung.filter(a => !moi.includes(a)).sort((a, b) => ls[a.activity_id] - ls[b.activity_id]);
    return [...moi, ...cu].slice(0, DS.luot.so_bai);
  };

  // Màn 3: một lượt luyện
  const batDau = async (c, phongs) => {
    voice.unlock?.(); const K = await napKho(c);
    const seed = opts.seed ?? newSeed(); const bai = chonBai(K, phongs, seed);
    T.man = 'luot'; T.done = false; T.seed = seed; setBd('luot');
    const session = { session_id: uid(), lesson_id: 'CONG-' + c.id, content_version: `cong-${c.id}-v${K.version}-${K.seed}`, seed, mode: 'cong', core_version: CORE_VERSION, start: Date.now(), events: [] };
    ui.setSteps(bai.map((a, i) => `Bài tập ${i + 1}`)); let ex = 0; ui.setStep(0);
    let thoat = false;
    const ctx = { ui, voice, fast, test: { mark }, tick: () => { ex++; ui.setStep(ex); } };
    const ls = kv('cong:lich-su') || {};
    for (let k = 0; k < bai.length && !thoat; k++) {
      const act = bai[k], E = ENGINES[act.engine];
      ctx.record = r => { const evt = { event_id: uid(), ts: Date.now(), child_id: 'be-1', session_id: session.session_id, lesson_id: session.lesson_id, activity_id: act.activity_id,
        content_version: session.content_version, engine: act.engine, engine_version: E.version, mechanic: act.mechanic || act.engine, seed: subSeed(seed, k), mode: 'cong', kind: 'answer', ...r };
        session.events.push(evt); T.events.push(evt); storage?.appendEvents([evt]); };
      const truoc = ex;
      await E.mount(ctx, act, E.generate(act, makeRng(subSeed(seed, k))));
      if (ex === truoc) ctx.tick();
      ls[act.activity_id] = Date.now(); kv('cong:lich-su', ls);
    }
    // Sao của phòng: mỗi lượt xong cộng một sao, tối đa 3
    const sao = kv('cong:sao') || {}; phongs.forEach(p => { sao[p.id] = Math.min(3, (sao[p.id] || 0) + 1); }); kv('cong:sao', sao);
    const dem = kv('cong:luot') || {}; dem[homNay()] = (dem[homNay()] || 0) + 1; kv('cong:luot', dem);
    xong(c, phongs, dem[homNay()]);
  };

  const xong = (c, phongs, soLuot) => {
    T.man = 'xong'; const nghi = soLuot >= DS.luot.luot_moi_ngay && !unlocked;
    ui.stage.innerHTML = `<div class="scene finish">${luArt(nghi ? 'vui' : 'an-mung')}<h1 class="title">Bé luyện xong một lượt!</h1>
      <div class="stars">${[0, 1, 2].map(i => `<span style="animation-delay:${200 + i * 220}ms">${STAR}</span>`).join('')}</div><div class="cap"></div>
      <div class="row2"><button class="big-btn cg-ve">Về cổng</button>${nghi ? '' : '<button class="big-btn alt cg-them">Luyện thêm</button>'}</div>
      ${nghi ? '<button class="link-btn hold cg-mo-them">Bố mẹ cho luyện thêm (giữ 2 giây)<span class="bar"></span></button>' : ''}</div>`;
    voice.caption = ui.stage.querySelector('.cap');
    ui.stage.querySelector('.cg-ve').onclick = () => { voice.stop(); vaoCong(c, false); };
    const th = ui.stage.querySelector('.cg-them'); if (th) th.onclick = () => { voice.stop(); batDau(c, phongs); };
    const mt = ui.stage.querySelector('.cg-mo-them'); if (mt) holdButton(mt, () => { unlocked = true; voice.stop(); batDau(c, phongs); }, fast);
    voice.say(nghi ? ['Bé luyện xong một lượt!', 'Hôm nay bé luyện nhiều rồi. Mình nghỉ mắt một chút nhé.'] : ['Bé luyện xong một lượt!']).then(() => { T.done = true; T.current = []; });
  };

  const c0 = DS.cong.find(c => c.id === opts.cong && c.trang_thai === 'mo');
  if (c0 && opts.phong) { const K = await napKho(c0); const ph = K.phong.find(p => p.id === opts.phong); if (ph && phongMo(ph)) batDau(c0, [ph]); else vaoCong(c0); }
  else if (c0) vaoCong(c0); else sanh();
  return { voice, ui, sanh, vaoCong };
}

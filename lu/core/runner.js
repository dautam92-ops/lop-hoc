// Chạy một gói bài (Hành trình) hoặc một hoạt động lẻ (Sân chơi, xem trước trong Admin).
// Engine không biết mình đang ở chế độ nào; runner gắn chế độ, phiên, seed, phiên bản vào sự kiện.
import { createVoice, createUI, makeRng, subSeed, newSeed, uid, esc, luArt, holdButton, CORE_VERSION } from './lu-core.js';
import { vis, ART } from '../ui/art.js';

// Lời khen xoay vòng, không lặp lại một câu (LU_PRODUCT_QUALITY_STANDARD mục 9)
export const END_PRAISE = ['Bé đi hết chặng này rồi!', 'Xong một chặng đường rồi!', 'Bé giỏi lắm, đi hết chặng rồi!', 'Chặng hôm nay đã xong!'];
const STAR = `<svg viewBox="0 0 100 100" class="lu-star" aria-hidden="true"><g filter="url(#lu-wc)"><path d="M50 8l11 24 26 3-19 18 5 26-23-13-23 13 5-26L13 35l26-3z" fill="#f6c85f"/></g><path d="M50 8l11 24 26 3-19 18 5 26-23-13-23 13 5-26L13 35l26-3z" fill="none" stroke="#6b5232" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
import { computeSkillState } from './mastery.js';
import { ENGINES } from '../engines/index.js';
import { sceneHTML } from '../ui/scenes.js';
import { LETTERS, readOptLines } from '../engines/common.js';

import { normalizeLesson } from './session.js';
export { normalizeLesson };

export function validateLesson(pkg) {
  const errs = [];
  for (const f of ['lesson_id', 'content_version', 'title', 'skills', 'activities', 'review_status']) if (!pkg[f]) errs.push(`Gói bài thiếu "${f}"`);
  const skills = new Set((pkg.skills || []).map(s => s.skill_id));
  (pkg.activities || []).forEach(a => {
    const E = ENGINES[a.engine]; if (!E) return errs.push(`${a.activity_id}: engine ${a.engine} chưa có`);
    errs.push(...E.validate(a));
    if (a.skill_id && !skills.has(a.skill_id)) errs.push(`${a.activity_id}: skill ${a.skill_id} không khai báo trong gói`);
  });
  return errs;
}

// Biến thể của hoạt động thứ k được xác định bởi seed phiên + k (tái hiện được)
export function variantOf(act, seed, k) { const E = ENGINES[act.engine]; return E.generate(act, makeRng(subSeed(seed, k))); }

// Số bài tập của một hoạt động: mỗi lượt là một bài tập; truyện kể (E00 không chạm) không tính.
const ROUNDED = new Set(['E01', 'E02', 'E03', 'E04', 'E06']);
export function exCount(act, variant) {
  if (act.engine === 'E00') return act.explore || act.tap ? 1 : 0;
  if (ROUNDED.has(act.engine)) return variant?.rounds?.length ?? (act.mode === 'items' ? Math.min(act.rounds || 99, act.items.length) : act.mode === 'listen' ? (act.rounds || act.words.length) : (act.rounds || (act.engine === 'E01' && act.mode === 'count' ? 3 : 1)));
  return 1;
}

export async function runLesson(root, pkg, opts = {}) {
  pkg = normalizeLesson(pkg);
  const fast = !!opts.fast, mode = opts.mode || 'adventure', storage = opts.storage;
  const errs = validateLesson(pkg); if (errs.length) { root.innerHTML = `<pre class="err">${esc(errs.join('\n'))}</pre>`; throw new Error(errs.join('; ')); }
  const missing = new Set();
  const voice = createVoice({ clips: opts.clips || {}, base: opts.audioBase || '', fast, onMissing: k => missing.add(k) });
  const ui = createUI(root, voice);
  const stepNames = ['Chào', ...[...new Set(pkg.activities.map(a => a.step))], 'Xong'];
  const setBd = bd => { if (!bd) return ui.setBackdrop('', ''); const r = sceneHTML(bd.id, bd.kind); ui.setBackdrop(bd.id, r.html, r.real); };
  ui.setSteps(stepNames);
  const T = window.__luTest = { current: [], events: [], missing, done: false, seed: null };
  const skillCls = Object.fromEntries(pkg.skills.map(s => [s.skill_id, s.cls || 'G']));
  const child_id = opts.child_id || 'be-1';

  const start = () => {
    ui.setStep(-1); T.done = false; setBd(pkg.stages?.[0]?.backdrop || pkg.backdrop || null);
    const resume = storage && opts.resume !== false ? storage.getSession('resume:' + pkg.lesson_id) : null;
    ui.stage.innerHTML = `<div class="scene start">${luArt('vay-tay')}<h1 class="title">${esc(pkg.title)}</h1>
      <div class="row2">${resume ? `<button class="big-btn go-resume">Học tiếp</button>` : ''}<button class="big-btn go${resume ? ' alt' : ''}">${resume ? 'Học lại từ đầu' : 'Bắt đầu'}</button></div></div>
      ${opts.onExit ? `<button class="corner-btn exit" aria-label="Về bản đồ"><svg class="lu-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg></button>` : ''}
      ${opts.hideParent ? '' : `<div class="row2"><button class="big-btn alt hold parent-btn">Dành cho bố mẹ (giữ 2 giây)<span class="bar"></span></button></div>`}`;
    ui.stage.querySelector('.go').onclick = () => { voice.unlock(); if (storage) storage.setSession('resume:' + pkg.lesson_id, null); play(); };
    const gr = ui.stage.querySelector('.go-resume'); if (gr) gr.onclick = () => { voice.unlock(); play(resume); };
    const ex = ui.stage.querySelector('.exit'); if (ex) ex.onclick = () => { voice.stop(); opts.onExit(); };
    if (!opts.hideParent) holdButton(ui.stage.querySelector('.parent-btn'), () => report(null), fast);
    T.current = [ui.stage.querySelector('.go')];
  };

  const play = async (resume) => {
    const seed = resume?.seed ?? opts.seed ?? newSeed(); T.seed = seed;
    const session = { session_id: resume?.session_id || uid(), lesson_id: pkg.lesson_id, content_version: pkg.content_version, seed, mode, core_version: CORE_VERSION, start: Date.now(), mood: null, events: [] };
    const ctx = { ui, voice, fast, test: { mark: el => { T.current = [].concat(el).filter(Boolean); } } };
    if (!resume) { ui.setStep(0); setBd(pkg.backdrop || pkg.stages?.[0]?.backdrop); ui.scene('Xin chào!', luArt('vay-tay')); await voice.say(pkg.intro || []);
    if (pkg.checkin) session.mood = await checkin(ui, voice, pkg.checkin, T); }
    const runAct = async k => {
      const act = pkg.activities[k], E = ENGINES[act.engine];
      ui.setStep(stepNames.indexOf(act.step)); setBd(act._bd || pkg.backdrop);
      const variant = variantOf(act, seed, k);
      ctx.record = r => {
        const evt = { event_id: uid(), ts: Date.now(), child_id, session_id: session.session_id, lesson_id: pkg.lesson_id, activity_id: act.activity_id,
          content_version: pkg.content_version, engine: act.engine, engine_version: E.version, mechanic: act.mechanic || act.engine, generator_version: E.version,
          seed: subSeed(seed, k), mode, kind: 'answer', difficulty: act.difficulty || null, ...r };
        // Hoạt động "tiếp xúc" (kỹ năng chưa đến buổi dạy chính, D45): chỉ ghi đã tham gia, không tính mức vững S10
        if (act.evidence === 'tiep-xuc' && evt.kind === 'answer') evt.kind = 'participation';
        session.events.push(evt); T.events.push(evt); if (storage) storage.appendEvents([evt]);
      };
      if (pkg.layout === 'hub') { ui.setStep(ex.i); ex.ticks = 0; }
      await E.mount(ctx, act, variant);
      // Bài tập không tự báo từng lượt (E05, E15, E00 chạm) tính là một bài tập khi xong
      if (pkg.layout === 'hub' && !ex.ticks && exCount(act, variant) > 0) ctx.tick();
    };
    // Chấm tiến độ trong một bài nhỏ (tam 26/11 08:13): mỗi chấm là một bài tập, như mẫu "Cái bóng của ai?"
    const ex = { i: 0, ticks: 0 };
    ctx.tick = () => { if (pkg.layout !== 'hub') return; ex.ticks++; ex.i++; ui.setStep(ex.i); };
    if (pkg.layout === 'hub') {
      // Buổi học dạng nhiều bài nhỏ (D46, chị tam 26/11 02:32): bé tự chọn từng bài nhỏ trên trang buổi học, học xong quay lại,
      // có thể nghỉ và học tiếp đúng chỗ (V4 I02). Đủ các bài thì sang màn kết thúc.
      const done = new Set(resume?.done || []);
      const save = () => storage && storage.setSession('resume:' + pkg.lesson_id, { hub: true, done: [...done], seed, session_id: session.session_id, at: Date.now() });
      let firstHub = !resume;
      while (done.size < pkg.stages.length) {
        const pick = await hub(pkg, done, firstHub); firstHub = false;
        if (pick === 'pause') { save(); voice.stop(); return start(); }
        const ks = pkg.activities.map((a, k) => a._stage === pick ? k : -1).filter(k => k >= 0);
        const n = ks.reduce((s, k) => s + exCount(pkg.activities[k], variantOf(pkg.activities[k], seed, k)), 0);
        ui.setSteps(Array.from({ length: n }, (_, j) => `Bài tập ${j + 1}`)); ex.i = 0; ui.setStep(0);
        const st = pkg.stages[pick];
        if (st.intro?.length) { setBd(st.backdrop); ui.scene(st.title, luArt(st.lu || 'vay-tay')); await voice.say(st.intro); }
        for (const k of ks) await runAct(k);
        done.add(pick); save();
        await stageDone(pkg.stages[pick], done.size, pkg.stages.length);
      }
    } else {
      for (let k = resume?.k || 0; k < pkg.activities.length; k++) {
        if (storage) storage.setSession('resume:' + pkg.lesson_id, { k, seed, session_id: session.session_id, at: Date.now() });
        await runAct(k);
      }
    }
    session.end = Date.now();
    if (storage) storage.setSession('resume:' + pkg.lesson_id, null);
    if (storage) storage.setSession('done:' + pkg.lesson_id, { at: session.end, session_id: session.session_id });
    if (storage) storage.setSession('last:' + pkg.lesson_id, { ...session, events: undefined, n: session.events.length });
    end(session);
  };

  const stageCount = st => (st.activities || []).reduce((s, a) => s + exCount(a, null), 0);
  const NHOM_TEN = { TD: 'Tư duy', QS: 'Quan sát', CY: 'Chú ý', GN: 'Ghi nhớ', NT: 'Nhận thức', TTg: 'Tưởng tượng', EN: 'Tiếng Anh', TV: 'Tiếng Việt',
    TO: 'Toán', EQ: 'Cảm xúc', KT: 'Thế giới quanh bé', KS: 'Kỹ năng sống', ST: 'Sáng tạo', AN: 'Âm nhạc', VD: 'Vận động' };
  const hub = (pkg, done, first) => new Promise(resolve => {
    ui.setStep(-1); setBd(pkg.hub?.backdrop || pkg.stages[0].backdrop);
    const next = pkg.stages.findIndex((st, i) => !done.has(i));
    const cards = pkg.stages.map((st, i) => `<button class="hub-card${done.has(i) ? ' done' : ''}${i === next ? ' next' : ''}" data-i="${i}" aria-label="${esc(st.title)}">
      <span class="hc-art">${vis(String(st.icon || 'art:sao').replace(/\*\d+$/, ''))}</span><span class="hc-t">${esc(st.title)}</span>
      <span class="hc-tags">${(st.nhom || []).slice(0, 2).map(c => `<i>${esc(NHOM_TEN[c] || c)}</i>`).join('')}</span>
      <span class="hc-n">${stageCount(st)} bài tập</span>
      ${done.has(i) ? `<span class="hc-star">${STAR}</span>` : ''}</button>`).join('');
    ui.stage.innerHTML = `<div class="scene hub"><div class="hub-head">${luArt('chi-tay')}<div><h1 class="title">${esc(pkg.title)}</h1>
      <div class="hub-prog">Bé đã học ${done.size}/${pkg.stages.length} bài</div></div></div>
      <div class="hub-grid">${cards}</div><div class="cap"></div>
      <div class="row2"><button class="big-btn alt pause-btn">Nghỉ, lát học tiếp</button></div></div>`;
    voice.caption = ui.stage.querySelector('.cap');
    const say = first ? pkg.hub?.q : pkg.hub?.again; if (say) voice.say([say]);
    T.current = [ui.stage.querySelector(`.hub-card[data-i="${next}"]`)];
    ui.stage.querySelectorAll('.hub-card').forEach(b => b.onclick = () => { if (voice.busy) return; voice.stop(); resolve(+b.dataset.i); });
    ui.stage.querySelector('.pause-btn').onclick = () => resolve('pause');
  });
  const stageDone = (st, n, total) => new Promise(resolve => {
    ui.stage.innerHTML = `<div class="scene finish small"><div class="stars"><span>${STAR}</span></div><h1 class="title">${esc(st.done_title || 'Xong bài ' + st.title + '!')}</h1><div class="cap"></div></div>`;
    voice.caption = ui.stage.querySelector('.cap');
    voice.say([st.done || END_PRAISE[n % END_PRAISE.length]]).then(resolve);
  });

  const end = session => {
    ui.setStep(stepNames.length - 1); setBd(pkg.end_backdrop || pkg.stages?.at(-1)?.backdrop || null);
    const praise = END_PRAISE[(storage ? Object.keys(storage.d?.kv || {}).filter(k => k.startsWith('done:')).length : 0) % END_PRAISE.length];
    const rw = opts.reward;
    ui.stage.innerHTML = `<div class="scene finish"><div class="burst" aria-hidden="true"></div>${luArt('an-mung')}<h1 class="title">${esc(praise)}</h1>
      <div class="stars">${[0, 1, 2].map(i => `<span style="animation-delay:${200 + i * 220}ms">${STAR}</span>`).join('')}</div>
      ${rw ? `<div class="reward"><div class="rw-art">${rw.art || ''}</div><div class="rw-t">${esc(rw.title)}</div></div>` : ''}
      <div class="cap"></div>
      <div class="row2">${opts.onExit ? `<button class="big-btn to-map">Về bản đồ</button>` : ''}<button class="big-btn alt again">Chơi lại</button></div>
      ${opts.hideParent ? '' : `<button class="link-btn hold parent-btn">Bố mẹ giữ 2 giây để xem kết quả<span class="bar"></span></button>`}</div>`;
    voice.caption = ui.stage.querySelector('.cap');
    ui.stage.querySelector('.again').onclick = () => { if (!voice.busy) start(); };
    const tm = ui.stage.querySelector('.to-map'); if (tm) tm.onclick = () => { voice.stop(); opts.onExit(session); };
    if (!opts.hideParent) holdButton(ui.stage.querySelector('.parent-btn'), () => report(session), fast);
    if (opts.onFinish) opts.onFinish(session);
    voice.say(pkg.end || []).then(() => { T.done = true; T.current = []; });
  };

  // Báo cáo bố mẹ: mức vững tính từ toàn bộ sự kiện (S10), quan sát của bố mẹ hiển thị RIÊNG (S10-R04)
  const report = session => {
    voice.stop();
    const all = storage ? storage.listEvents({ child_id }) : (session ? session.events : []);
    const rows = pkg.skills.map(s => {
      const evs = all.filter(e => e.skill_id === s.skill_id);
      const st = computeSkillState(evs, s.cls);
      const now = session ? session.events.filter(e => e.skill_id === s.skill_id && e.kind === 'answer') : [];
      const note = !evs.length ? 'Con chưa làm phần này.' : now.length ? `Lần này: đúng ngay lần đầu ${now.filter(e => e.first_try).length}/${now.length} câu.` : 'Con đã tham gia.';
      const obs = storage ? storage.listObservations({ child_id, skill_id: s.skill_id }) : [];
      return `<div class="row"><span class="s">${esc(s.name)}</span><span class="pill p${Math.min(st.level, 3)}">${esc(st.name)}</span>
        <span class="n">${esc(note)} Mức chắc chắn: ${st.confidence}.</span>
        <span class="n obs">Quan sát của bố mẹ: ${obs.length ? `đã thấy con làm ngoài đời (${obs.length} lần)` : 'chưa ghi'} <button class="mini obs-btn" data-s="${esc(s.skill_id)}">Tôi đã thấy con làm</button></span></div>`;
    }).join('');
    const P = pkg.parent || {};
    const play = P.play ? `<div><h3>Chơi cùng bố mẹ (không bắt buộc)</h3><div class="tip"><b>${esc(P.play.ten)}</b> · ${esc(P.play.phut)} phút<br>${esc(P.play.cach_choi)}${P.play.an_toan ? `<br><i>An toàn: ${esc(P.play.an_toan)}</i>` : ''}</div></div>` : '';
    ui.stage.innerHTML = `<div class="parent"><h2>Kết quả · ${esc(pkg.title)}</h2>
      ${session ? `<div>Thời gian học: ${Math.max(1, Math.round((session.end - session.start) / 60000))} phút.${session.mood ? ` Đầu bài con nói con thấy <b>${esc(session.mood.toLowerCase())}</b>.` : ''}</div>` : ''}
      ${P.goal ? `<div class="tip">${esc(P.goal)}</div>` : ''}
      <div><h3>Từng kỹ năng</h3><div class="rows">${rows}</div></div>
      ${P.why ? `<div><h3>Hỏi con</h3><div class="tip">${esc(P.why)}</div></div>` : ''}
      ${P.tonight ? `<div><h3>Tối nay bố mẹ thử nhé</h3><div class="rows">${P.tonight.map(t => `<div class="row"><span>${esc(t)}</span></div>`).join('')}</div></div>` : ''}
      ${play}
      <div class="hist">Kết quả trong game và quan sát của bố mẹ được lưu riêng. Đây không phải bài kiểm tra trí tuệ; không dùng để chấm IQ, EQ, thể chất hay thẩm mỹ.</div>
      <div class="row2"><button class="big-btn back">Về đầu bài</button><button class="big-btn alt backup">Sao lưu dữ liệu</button><label class="big-btn alt">Khôi phục<input type="file" accept=".json" class="restore" hidden></label></div></div>`;
    ui.stage.querySelectorAll('.obs-btn').forEach(b => b.onclick = () => { if (!storage) return; storage.appendObservation({ obs_id: uid(), child_id, skill_id: b.dataset.s, ts: Date.now(), source: 'parent', lesson_id: pkg.lesson_id }); report(session); });
    ui.stage.querySelector('.back').onclick = start;
    ui.stage.querySelector('.backup').onclick = () => { if (!storage) return; const blob = new Blob([JSON.stringify(storage.exportAll())], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `lu-sao-luu-${new Date().toISOString().slice(0, 10)}.json`; a.click(); };
    ui.stage.querySelector('.restore').onchange = async e => { const f = e.target.files[0]; if (!f || !storage) return;
      try { storage.importAll(JSON.parse(await f.text())); report(session); } catch (x) { alert('Không khôi phục được: ' + x.message); } };
    T.report = true;
  };
  start();
  return { start, voice, ui };
}

function checkin(ui, voice, C, T) {
  return new Promise(done => {
    ui.scene('Hôm nay bé thấy thế nào?', luArt('to-mo'));
    const box = ui.answers('Bé chọn một khuôn mặt', C.opts.map((o, i) => `<button class="opt face" data-i="${i}" aria-label="Đáp án ${LETTERS[i]}: ${esc(o.t)}"><span class="opt-letter" aria-hidden="true">${LETTERS[i]}</span>${vis(o.e)}<small>${esc(o.t)}</small></button>`).join(''));
    T.current = [box.querySelector('.opt')];
    box.addEventListener('click', e => { const b = e.target.closest('.opt'); if (!b || voice.busy) return; const o = C.opts[+b.dataset.i]; voice.say([o.say, C.thanks]).then(() => done(o.t)); });
    // D43: đáp án có chữ → đọc "Đáp án A…" bằng tiếng Việt
    voice.say([C.q, ...readOptLines(C.opts.map(o => ({ say: o.t })))]);
  });
}

// Xem trước MỘT hoạt động (Admin, Sân chơi): không cần gói bài đầy đủ
export async function runActivity(root, act, opts = {}) {
  const voice = createVoice({ clips: opts.clips || {}, base: opts.audioBase || '', fast: !!opts.fast, onMissing: k => opts.onMissing && opts.onMissing(k) });
  const ui = createUI(root, voice); ui.setSteps([act.step || act.engine]); ui.setStep(0);
  const E = ENGINES[act.engine]; const seed = opts.seed ?? newSeed();
  const variant = E.generate(act, makeRng(seed));
  const T = window.__luTest = { current: [], events: [], done: false, seed };
  const ctx = { ui, voice, fast: !!opts.fast, test: { mark: el => { T.current = [].concat(el).filter(Boolean); } },
    record: r => { const evt = { event_id: uid(), ts: Date.now(), activity_id: act.activity_id, engine: act.engine, seed, mode: opts.mode || 'preview', kind: 'answer', ...r }; T.events.push(evt); opts.onEvent && opts.onEvent(evt); } };
  await E.mount(ctx, act, variant);
  T.done = true; ui.scene('Xong!', luArt('an-mung'));
  return { variant, seed };
}

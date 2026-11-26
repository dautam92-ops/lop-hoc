// Phòng mẫu – chơi thử MỘT hoạt động mẫu.
// play.html?s=CC-08&age=4-5[&seed=7][&fast=1][&auto=1][&idle=9000][&tts=0]
// Trang mẹ (lab/index.html) điều khiển qua postMessage: right | wrong | restart | replay | pause | resume | skip.
// Mọi lời thoại đi qua Audio State Machine (createVoice): không phát chồng, có tạm dừng, bỏ qua, nghe lại.
// Câu chưa có file giọng Hoài My: dùng giọng tạm của trình duyệt (chỉ trong Phòng mẫu, có nhãn "Giọng tạm").
import { createVoice, createUI, makeRng, newSeed, uid, setLuArt, luArt, esc, idleHelp } from '../core/lu-core.js';
import { ENGINES } from '../engines/index.js';
import { setSceneAssets, sceneHTML } from '../ui/scenes.js';
import { setVisAssets } from '../ui/art.js';
import '../ui/art-lab.js';

const p = new URLSearchParams(location.search);
const sid = p.get('s'), age = p.get('age') || '4-5', fast = p.get('fast') === '1';
let seed = p.has('seed') ? Number(p.get('seed')) : newSeed();
const root = document.getElementById('lu');
const post = (ev, data = {}) => { try { parent.postMessage({ type: 'lu-lab', ev, sid, age, ...data }, '*'); } catch {} };

const [chars, areg, audio, lab] = await Promise.all(['../registry/characters.json', '../registry/assets.json', '../content/audio/registry.json', '../content/lab/samples.json'].map(u => fetch(u).then(r => r.json())));
const LU = {}; for (const g of ['bieu_cam', 'tu_the', 'goc_nhin']) for (const [k, v] of Object.entries(chars.LU[g] || {})) LU[k] ??= '../' + v.webp;
setLuArt(expr => `<img class="lu" src="${LU[expr] || LU.vui}" alt="" draggable="false">`);
// &anh=cho: xem trước cả ảnh chờ duyệt (chỉ trong Phòng mẫu, để tam duyệt ảnh ngay trong bài). Mặc định chỉ ảnh đã duyệt.
const ok = areg.assets.filter(a => a.trang_thai === 'da_duyet' || (p.get('anh') === 'cho' && a.trang_thai === 'cho_duyet'));
setSceneAssets(Object.fromEntries(ok.filter(a => a.slot).map(a => [a.slot, '../' + a.path])));
setVisAssets(Object.fromEntries(ok.flatMap(a => [[a.asset_id, '../' + a.path], ...(String(a.slot || '').startsWith('art:') ? [[a.slot, '../' + a.path]] : [])])));

const S = lab.samples.find(x => x.id === sid);
if (!S) { root.innerHTML = `<pre class="err">Không có mẫu ${esc(sid || '')}</pre>`; throw new Error('no sample'); }
const act = S.levels[age] || Object.values(S.levels)[0];
const E = ENGINES[act.engine];

/* ---------- Giọng tạm của trình duyệt (chỉ Phòng mẫu) ---------- */
const VI = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const synth = 'speechSynthesis' in window && p.get('tts') !== '0' && !fast ? speechSynthesis : null;
let voices = []; const loadV = () => { voices = synth ? synth.getVoices() : []; }; loadV(); if (synth) synth.onvoiceschanged = loadV;
const pickVoice = lang => voices.find(v => v.lang?.toLowerCase().startsWith(lang)) || null;
let usedTmp = false;
const tts = synth && {
  ok: () => true,
  speak: text => new Promise(res => {
    const en = !VI.test(text) && /^[\x20-\x7e]+$/.test(text) && (S.group === 'Tiếng Anh' || /^(Yes|Great|Well|Put|Listen|Cat|Fish|Bird|Duck|Chicken|Rabbit|Butterfly|Frog|One|Two|Three)\b/.test(text));
    const u = new SpeechSynthesisUtterance(text); u.lang = en ? 'en-US' : 'vi-VN'; const v = pickVoice(en ? 'en' : 'vi'); if (v) u.voice = v; u.rate = en ? .85 : .95;
    u.onend = u.onerror = () => res(); usedTmp = true; badge(); synth.speak(u);
  }),
  cancel: () => synth.cancel(),
  unlock: () => { try { synth.speak(new SpeechSynthesisUtterance('')); } catch {} },
};
const missing = new Set();
const voice = createVoice({ clips: audio.clips, base: '../content/audio/', fast, tts, onMissing: k => { missing.add(k); post('missing', { key: k }); } });
const ui = createUI(root, voice, { controls: true });
ui.setSteps([S.title]); ui.setStep(0);
const bd = sceneHTML(S.bd || 'L001-BG-02'); ui.setBackdrop(S.bd || 'L001-BG-02', bd.html, bd.real);
const badge = () => { if (!usedTmp || document.querySelector('.lab-tmp')) return; document.body.insertAdjacentHTML('beforeend', '<div class="lab-tmp">Giọng tạm của trình duyệt: câu này chưa có file giọng Hoài My</div>'); };

/* ---------- Ghi lời thoại đã phát để kiểm tra "sai thì không khen" ---------- */
const T = window.__labTest = { sid, age, seed, current: [], events: [], spoken: [], done: false, right: null, wrong: null, idle: [] };
const speak0 = voice.speak;
voice.speak = keys => { const ks = [].concat(keys).filter(Boolean); T.spoken.push(...ks.map(k => ({ k, t: performance.now() }))); post('speak', { keys: ks }); return speak0(keys); };
const sfx0 = voice.sfx; if (sfx0) voice.sfx = k => { T.sfx = (T.sfx || []).concat({ k, t: performance.now() }); return sfx0(k); };
voice.onState = st => post('state', { state: st });

const ctx = {
  ui, voice, fast,
  test: { mark: el => { T.current = [].concat(el).filter(Boolean); }, setAuto: (r, w) => { T.right = r || null; T.wrong = w || null; post('auto', { right: !!r, wrong: !!w }); } },
  record: r => { const evt = { event_id: uid(), ts: Date.now(), activity_id: act.activity_id, engine: act.engine, seed, mode: 'lab', kind: 'answer', ...r }; if (act.evidence === 'tiep-xuc' && evt.kind === 'answer') evt.kind = 'participation'; T.events.push(evt); post('event', { evt }); },
  tick: () => {},
};
// Không trả lời: sau khi Lu nói xong và bé không chạm, Lu nhắc lại câu hỏi; lần sau làm sáng chỗ cần chạm.
// Lật thẻ (quy tắc tam): chỉ giải thích lúc đầu, không nhắc lại khi bé dừng tay.
if (act.engine !== 'E05') idleHelp(root, voice, { delay: Number(p.get('idle') || 9000), getTargets: () => T.current, onIdle: step => { T.idle.push(step); post('idle', { step }); } });

// Bé chạm vào nút "chạm" đầu tiên (T.current) – dùng cho "Thử đúng" với hoạt động chỉ cần chạm một nút
const clickEl = el => { if (!el) return false; el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); el.click(); return true; };
const waitIdle = async () => { while (voice.busy) await new Promise(r => setTimeout(r, 60)); };
window.__labCmd = async cmd => {
  if (cmd === 'replay') return voice.replay();
  if (cmd === 'pause') return voice.pause();
  if (cmd === 'resume') return voice.resume();
  if (cmd === 'skip') return voice.skip();
  if (cmd === 'restart') return location.reload();
  if (cmd === 'right' || cmd === 'wrong') {
    await waitIdle();
    const f = cmd === 'right' ? T.right : T.wrong;
    if (f) { await f(); return true; }
    // Kéo thả: chạm chọn mảnh rồi chạm vào đích (T.current = [mảnh, đích])
    if (cmd === 'right') { const [a, b] = T.current; const r = clickEl(a); if (b) { await new Promise(r => setTimeout(r, 30)); clickEl(b); } return r; }
    return false;
  }
};
addEventListener('message', e => { if (e.data && e.data.type === 'lu-lab-cmd') window.__labCmd(e.data.cmd).then(r => post('cmd', { cmd: e.data.cmd, ok: r !== false })); });

/* ---------- Chạy ---------- */
async function play() {
  T.seed = seed; post('start', { seed });
  const variant = E.generate(act, makeRng(seed));
  T.variant = variant;
  try { await E.mount(ctx, act, variant); }
  catch (e) { T.error = String(e && e.stack || e); post('error', { msg: String(e) }); throw e; }
  T.done = true; post('done', { events: T.events.length });
  ui.scene('Xong rồi!', `<div class="lab-start">${luArt('an-mung')}<div class="row2"><button class="big-btn again">Chơi lại</button><button class="big-btn alt other">Biến thể khác</button></div></div>`);
  ui.stage.querySelector('.again').onclick = () => { const u = new URL(location.href); u.searchParams.set('seed', seed); u.searchParams.set('auto', '1'); location.href = u; };
  ui.stage.querySelector('.other').onclick = () => { const u = new URL(location.href); u.searchParams.set('seed', newSeed()); u.searchParams.set('auto', '1'); location.href = u; };
}
if (p.get('auto') === '1') play();
else {
  ui.scene(S.title, `<div class="lab-start">${luArt('vay-tay')}<button class="big-btn go">Bắt đầu</button></div>`);
  const go = ui.stage.querySelector('.go'); T.current = [go];
  go.onclick = () => { voice.unlock(); play(); };
}

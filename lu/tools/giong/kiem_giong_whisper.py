# Kiểm tra giọng đọc gián tiếp (Claude không nghe được âm thanh): cho máy nghe lại từng mp3 rồi so với câu gốc.
# Chạy TRÊN MÁY 24H (có card RTX 3070):
#   pip install faster-whisper
#   python kiem_giong_whisper.py <thư-mục-mp3> <danh-sách-câu.json> [--model large-v3-turbo]
# danh-sách-câu.json: {"lines":[{"text":"...", "file":"abc.mp3"}]}  (thiếu "file" thì lấy sha1(text)[:12].mp3 như tao_giong_doc.py)
#   hoặc registry.json của app ({"clips": {"câu": "tệp.mp3"}}).
# Kết quả: bao-cao-giong.json + bao-cao-giong.md cạnh danh sách câu.
# Mỗi câu đo: chữ máy nghe được, tỉ lệ sai từ (WER, có dấu), tốc độ (âm tiết/giây), độ to (dBFS), độ lên xuống giọng (cao độ, nửa cung).
import hashlib, json, os, re, sys, unicodedata, wave, subprocess, tempfile, math

args = [a for a in sys.argv[1:] if not a.startswith('--')]
MODEL = 'large-v3-turbo'
if '--model' in sys.argv: MODEL = sys.argv[sys.argv.index('--model') + 1]; args = [a for a in args if a != MODEL]
if len(args) < 2: sys.exit(__doc__ or 'Cách dùng: python kiem_giong_whisper.py <thư-mục-mp3> <danh-sách-câu.json>')
AUD, LIST = args[0], args[1]
data = json.load(open(LIST, encoding='utf8'))
if 'clips' in data: items = [{'text': t, 'file': f} for t, f in data['clips'].items()]
else: items = data['lines']
for it in items: it.setdefault('file', hashlib.sha1(it['text'].encode('utf8')).hexdigest()[:12] + '.mp3')
items = [it for it in items if it.get('lang', 'vi') == 'vi' and re.search(r'[a-zà-ỹđ]', it['text'], re.I)]

from faster_whisper import WhisperModel
try: model = WhisperModel(MODEL, device='cuda', compute_type='float16')
except Exception: model = WhisperModel(MODEL, device='cpu', compute_type='int8')

def norm(s):
    s = unicodedata.normalize('NFC', s.lower())
    s = re.sub(r'\{[^}]*\}', '', s)
    return re.sub(r'[^\wà-ỹđ ]+', ' ', s).split()

def wer(ref, hyp):
    d = list(range(len(hyp) + 1))
    for i, r in enumerate(ref, 1):
        prev, d[0] = d[0], i
        for j, h in enumerate(hyp, 1):
            prev, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, prev + (r != h))
    return d[len(hyp)] / max(1, len(ref))

def pcm(path):
    """Giải mã mp3 → mảng mẫu 16 kHz đơn kênh (dùng PyAV đi kèm faster-whisper)."""
    from faster_whisper.audio import decode_audio
    return decode_audio(path, sampling_rate=16000)

def do_am(x):
    import numpy as np
    sr = 16000; fr = 640  # khung 40 ms
    n = len(x) // fr
    if n == 0: return None
    f = x[:n * fr].reshape(n, fr)
    rms = np.sqrt((f ** 2).mean(1) + 1e-12)
    voiced = rms > rms.max() * 0.1
    db = 20 * math.log10(float(np.sqrt((x ** 2).mean())) + 1e-9)
    # cao độ thô bằng tự tương quan trên các khung có tiếng (giọng nữ 150–500 Hz)
    pit = []
    for k in np.where(voiced)[0]:
        s = f[k] - f[k].mean()
        ac = np.correlate(s, s, 'full')[fr - 1:]
        lo, hi = sr // 500, sr // 150
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.3 * ac[0]: pit.append(sr / lag)
    st = 0.0
    if len(pit) > 5:
        p = 12 * np.log2(np.array(pit) / np.median(pit))
        st = float(np.percentile(p, 90) - np.percentile(p, 10))
    speech_s = voiced.sum() * fr / sr
    return {'giay': round(len(x) / sr, 2), 'giay_co_tieng': round(float(speech_s), 2), 'dBFS': round(db, 1), 'len_xuong_nua_cung': round(st, 1)}

out = []
for it in items:
    p = os.path.join(AUD, it['file'])
    if not os.path.exists(p): out.append({**it, 'loi': 'THIẾU TỆP'}); continue
    segs, _ = model.transcribe(p, language='vi', beam_size=5, vad_filter=False)
    hyp = ' '.join(s.text.strip() for s in segs)
    ref_w, hyp_w = norm(it['text']), norm(hyp)
    m = do_am(pcm(p)) or {}
    am_tiet = len(ref_w)
    toc_do = round(am_tiet / m['giay_co_tieng'], 1) if m.get('giay_co_tieng') else None
    r = {'text': it['text'], 'file': it['file'], 'may_nghe': hyp, 'wer': round(wer(ref_w, hyp_w), 2), 'am_tiet_moi_giay': toc_do, **m}
    canh = []
    if r['wer'] > 0.15: canh.append('đọc lệch chữ')
    if toc_do and toc_do > 5.2: canh.append('nhanh quá với bé')
    if toc_do and toc_do < 2.5: canh.append('chậm, kéo dài')
    if m.get('dBFS', 0) < -26: canh.append('nhỏ')
    if m.get('len_xuong_nua_cung') is not None and m['len_xuong_nua_cung'] < 3: canh.append('đều đều, ít lên xuống')
    r['canh_bao'] = canh
    out.append(r); print(('⚠ ' if canh else 'OK ') + it['text'][:50], canh)

base = os.path.splitext(LIST)[0]
json.dump(out, open(os.path.join(os.path.dirname(LIST), 'bao-cao-giong.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
lech = [r for r in out if r.get('canh_bao') or r.get('loi')]
md = [f'# Báo cáo kiểm tra giọng ({len(out)} câu, {len(lech)} câu cần nghe lại)', '',
      'Máy nghe lại bằng Whisper ' + MODEL + '. Ngưỡng: lệch chữ > 15%, nhanh > 5,2 âm tiết/giây, nhỏ < -26 dBFS, lên xuống < 3 nửa cung.', '',
      '| Câu gốc | Máy nghe được | Lệch chữ | Âm tiết/giây | dBFS | Lên xuống | Cảnh báo |', '|---|---|---|---|---|---|---|']
for r in sorted(out, key=lambda r: -len(r.get('canh_bao', [])) - (9 if r.get('loi') else 0)):
    if r.get('loi'): md.append(f"| {r['text']} | {r['loi']} | | | | | |"); continue
    md.append(f"| {r['text']} | {r['may_nghe']} | {int(r['wer']*100)}% | {r['am_tiet_moi_giay']} | {r['dBFS']} | {r['len_xuong_nua_cung']} | {', '.join(r['canh_bao'])} |")
open(os.path.join(os.path.dirname(LIST), 'bao-cao-giong.md'), 'w', encoding='utf8').write('\n'.join(md))
print(f'XONG: {len(out)} câu, {len(lech)} câu cần nghe lại → bao-cao-giong.md')

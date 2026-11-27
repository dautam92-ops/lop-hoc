# Thử giọng ElevenLabs v3 (tiếng Việt, có chỉ dẫn cảm xúc) cạnh giọng Hoài My, để tam nghe so sánh.
# Chạy TRÊN MÁY 24H. Không cần cài thêm gì (chỉ dùng Python có sẵn).
#
# 1) tam tự tạo tài khoản ElevenLabs, lấy khóa API (Profile → API Keys), dán vào tệp
#    elevenlabs-key.txt đặt cạnh tệp này (hoặc biến môi trường ELEVENLABS_API_KEY). Không đưa tệp khóa lên GitHub.
# 2) python tao_giong_elevenlabs.py --tim-giong            (chỉ liệt kê giọng nữ tiếng Việt trong thư viện, không tốn lượt)
# 3) python tao_giong_elevenlabs.py --chay [--giong id1,id2,id3] [--hoaimy <thư-mục-mp3-Hoài-My>] [--cau cau-thu-elevenlabs.json]
#    Không có --giong thì tự chọn 3 giọng nữ tiếng Việt được dùng nhiều nhất.
#    Trước khi gọi, in số ký tự sẽ tốn và số lượt còn lại; vượt thì dừng, không mua thêm.
# Kết quả: thư mục so-sanh-giong/ gồm index.html (bảng nghe so sánh) và các mp3, mỗi giọng một thư mục con.
# Tên mp3 = sha1(câu bé nghe)[:12].mp3, giống tao_giong_doc.py, nên chọn được giọng nào thì chép thẳng vào content/audio.
# Lưu ý: gói miễn phí KHÔNG được dùng cho sản phẩm bán; bản bán cần gói trả phí có quyền thương mại.
import hashlib, html, json, os, shutil, sys, urllib.request, urllib.parse, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
API = 'https://api.elevenlabs.io'
MODEL = 'eleven_v3'

def opt(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default

def key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    f = os.path.join(HERE, 'elevenlabs-key.txt')
    if not k and os.path.exists(f): k = open(f, encoding='utf8').read().strip()
    if not k: sys.exit('Chưa có khóa API. Dán khóa vào ' + f)
    return k

def call(method, path, body=None, raw=False):
    req = urllib.request.Request(API + path, method=method, headers={'xi-api-key': key(), 'Content-Type': 'application/json'},
                                 data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            b = r.read()
            return b if raw else json.loads(b)
    except urllib.error.HTTPError as e:
        sys.exit(f'ElevenLabs báo lỗi {e.code} ở {path}: {e.read().decode(errors="ignore")[:400]}')
    except urllib.error.URLError as e:
        sys.exit(f'Không kết nối được ElevenLabs ({e.reason}). Kiểm tra mạng rồi chạy lại.')

def tim_giong(n=12):
    q = urllib.parse.urlencode({'language': 'vi', 'gender': 'female', 'page_size': 50, 'sort': 'usage_character_count_1y'})
    vs = call('GET', '/v1/shared-voices?' + q).get('voices', [])
    vs = [v for v in vs if v.get('language') == 'vi' or any(l.get('language') == 'vi' for l in v.get('verified_languages', []))]
    return vs[:n]

def so_luot_con():
    s = call('GET', '/v1/user/subscription')
    return s.get('character_limit', 0) - s.get('character_count', 0), s.get('tier')

def ten_tep(text):
    return hashlib.sha1(text.encode('utf8')).hexdigest()[:12] + '.mp3'

if '--tim-giong' in sys.argv:
    for v in tim_giong():
        print(f"{v['voice_id']}  {v.get('name')}  | tuổi: {v.get('age')} | {v.get('accent') or ''} | {(v.get('description') or '')[:80]}")
    sys.exit()

if '--chay' not in sys.argv: sys.exit('Thêm --tim-giong hoặc --chay. Xem hướng dẫn ở đầu tệp.')

lines = json.load(open(opt('--cau', os.path.join(HERE, 'cau-thu-elevenlabs.json')), encoding='utf8'))['lines']
if opt('--giong'):
    giong = [{'voice_id': g, 'name': g} for g in opt('--giong').split(',')]
else:
    giong = tim_giong(3)
    if not giong: sys.exit('Không tìm thấy giọng nữ tiếng Việt trong thư viện. Chạy --tim-giong rồi chọn bằng --giong.')

can = sum(len(l.get('v3', l['text'])) for l in lines) * len(giong)
con, tier = so_luot_con()
print(f'Gói: {tier}. Sẽ dùng khoảng {can} ký tự cho {len(lines)} câu × {len(giong)} giọng. Còn {con} ký tự.')
if can > con: sys.exit('Không đủ lượt. Dừng, không tạo (không tự mua thêm).')

OUT = os.path.join(HERE, 'so-sanh-giong')
os.makedirs(OUT, exist_ok=True)
# Giọng trong thư viện chung phải thêm vào tài khoản trước khi dùng
mine = {v['voice_id'] for v in call('GET', '/v1/voices').get('voices', [])}
for g in giong:
    if g['voice_id'] not in mine and g.get('public_owner_id'):
        r = call('POST', f"/v1/voices/add/{g['public_owner_id']}/{g['voice_id']}", {'new_name': 'Lu thu - ' + (g.get('name') or '')[:30]})
        g['voice_id'] = r.get('voice_id', g['voice_id'])

for i, g in enumerate(giong):
    d = os.path.join(OUT, f'giong-{i+1}'); os.makedirs(d, exist_ok=True)
    for l in lines:
        f = os.path.join(d, ten_tep(l['text']))
        if os.path.exists(f) and os.path.getsize(f) > 500: continue
        body = {'text': l.get('v3', l['text']), 'model_id': MODEL, 'language_code': 'vi',
                'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75}}
        audio = call('POST', f"/v1/text-to-speech/{g['voice_id']}?output_format=mp3_44100_128", body, raw=True)
        open(f, 'wb').write(audio); print('OK', g.get('name'), '|', l['text'][:50])

hm = opt('--hoaimy')
if hm:
    d = os.path.join(OUT, 'hoai-my'); os.makedirs(d, exist_ok=True)
    for l in lines:
        s = os.path.join(hm, ten_tep(l['text']))
        if os.path.exists(s): shutil.copy(s, d)

cols = (['hoai-my'] if hm else []) + [f'giong-{i+1}' for i in range(len(giong))]
names = (['Hoài My (hiện tại)'] if hm else []) + [f'Giọng {i+1}: {html.escape(g.get("name") or "")}' for i, g in enumerate(giong)]
rows = []
for n, l in enumerate(lines, 1):
    tds = []
    for c in cols:
        p = f'{c}/{ten_tep(l["text"])}'
        tds.append(f'<td><audio controls preload="none" src="{p}"></audio></td>' if os.path.exists(os.path.join(OUT, p)) else '<td>chưa có</td>')
    rows.append(f'<tr><td>{n}. {html.escape(l["text"])}</td>{"".join(tds)}</tr>')
page = f'''<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>So sánh giọng Lu</title>
<style>body{{font-family:system-ui,sans-serif;margin:16px;background:#fffdf6;color:#2b2b2b}}table{{border-collapse:collapse;width:100%}}
td,th{{border:1px solid #e5dcc3;padding:8px;vertical-align:middle}}th{{background:#f3ead2}}audio{{width:180px}}
@media(max-width:700px){{td,th{{display:block}}}}</style>
<h1>So sánh giọng Lu</h1><p>Mỗi hàng là một câu. Bấm nghe từng cột, chọn giọng giống cô mầm non nhất.</p>
<table><tr><th>Câu</th>{"".join(f"<th>{x}</th>" for x in names)}</tr>{"".join(rows)}</table>'''
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf8').write(page)
json.dump([{'thu_muc': f'giong-{i+1}', 'voice_id': g['voice_id'], 'name': g.get('name')} for i, g in enumerate(giong)],
          open(os.path.join(OUT, 'giong.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('XONG →', os.path.join(OUT, 'index.html'))

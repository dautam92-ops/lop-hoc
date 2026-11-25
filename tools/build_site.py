# Dựng web lop-hoc: index.html = bài mới nhất, bai/<ngày>/index.html = mọi bài (không xóa bài cũ), bai/index.html = thư viện.
# Bài soạn trước (ngày trong tương lai) chỉ hiện từ đúng ngày đó: trang chủ và thư viện tự chọn theo ngày hôm nay giờ Việt Nam (VN_TODAY).
# Dùng: python3 build_site.py /home/user/lop-hoc  (đọc /mnt/project-files/bai-hoc/<ngày>/bai-hoc-ipad.html)
import sys,os,re,glob,html
repo=sys.argv[1]; src_root='/mnt/project-files/bai-hoc'
old=open(os.path.join(repo,'index.html'),encoding='utf8').read()
head=old[:old.index('<title>')]
head=re.sub(r'<script>\(function\(\)\{var t=new Date.*?</script>\n','',head)  # bỏ script chuyển ngày cũ
extra=old[old.index('<style>body{margin:0}'):old.index('<body>')+len('<body>')]+'\n'
def wrap(src): i=src.index('</style>')+len('</style>\n'); return head+src[:i]+extra+src[i:]+'\n</body>\n</html>\n'
days=sorted(d for d in os.listdir(src_root) if re.fullmatch(r'\d{4}-\d{2}-\d{2}',d) and os.path.exists(f'{src_root}/{d}/bai-hoc-ipad.html'))
items=[]
for d in days:
    src=open(f'{src_root}/{d}/bai-hoc-ipad.html',encoding='utf8').read()
    os.makedirs(f'{repo}/bai/{d}',exist_ok=True); open(f'{repo}/bai/{d}/index.html','w',encoding='utf8').write(wrap(src))
    g=lambda k: re.search(k+r":\s*'([^']*)'",src).group(1)
    items.append((d,g('date'),g('theme')))
import datetime
today=(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(hours=7)).strftime('%Y-%m-%d')
cur=[d for d in days if d<=today][-1]
VN_TODAY="var t=new Date(Date.now()+7*36e5).toISOString().slice(0,10);"
jump='<script>(function(){'+VN_TODAY+'var d='+repr(days).replace("'",'"')+',b=null;d.forEach(function(x){if(x<=t)b=x});if(b&&b!=="'+cur+'")location.replace("bai/"+b+"/")})()</script>\n'
idx=wrap(open(f'{src_root}/{cur}/bai-hoc-ipad.html',encoding='utf8').read())
open(f'{repo}/index.html','w',encoding='utf8').write(idx.replace('<head>','<head>'+jump,1) if '<head>' in idx else jump+idx)
cards=''.join(f'<a class="card" data-d="{d}" href="{d}/"><b>{html.escape(t)}</b><span>{html.escape(dt)}</span></a>' for d,dt,t in reversed(items))
open(f'{repo}/bai/index.html','w',encoding='utf8').write(f'''<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bài đã học</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@700;800&display=swap">
<style>:root{{color-scheme:light}}body{{margin:0;background:#fff7ec;color:#2b2340;font-family:Nunito,system-ui,sans-serif;padding:20px 16px}}h1{{font-family:'Baloo 2',sans-serif;font-size:36px;text-align:center;margin:6px 0 18px}}
.list{{max-width:720px;margin:0 auto;display:grid;gap:14px}}.card{{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#fff;border-radius:22px;padding:18px 20px;text-decoration:none;color:inherit;box-shadow:0 5px 0 #eee3d3;font-size:22px}}
.card b{{font-family:'Baloo 2',sans-serif;font-size:26px}}.card span{{color:#6f6787;font-size:19px;white-space:nowrap}}.home{{display:block;width:max-content;margin:22px auto 0;background:#22b07d;color:#fff;border-radius:22px;padding:14px 30px;font-family:'Baloo 2',sans-serif;font-size:24px;text-decoration:none;box-shadow:0 5px 0 #168a61}}</style></head>
<body><h1>📚 Bài đã học</h1><div class="list">{cards}</div><a class="home" href="../">🏠 Bài hôm nay</a><script>(function(){{var t=new Date(Date.now()+7*36e5).toISOString().slice(0,10);document.querySelectorAll('.card').forEach(function(c){{if(c.dataset.d>t)c.remove()}})}})()</script></body></html>''')
print(days)

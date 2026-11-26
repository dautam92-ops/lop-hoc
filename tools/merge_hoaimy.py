import json,sys,re
import glob
vi={}
for fn in sorted(glob.glob('/home/user/lop-hoc/audio/vi_clips*.json')): vi.update(json.load(open(fn)))
for f in sys.argv[1:]:
    h=open(f,encoding='utf8').read()
    i=h.index('const CLIPS=')+len('const CLIPS=')
    obj,end=json.JSONDecoder().raw_decode(h,i)
    add=0
    for k,v in vi.items():
        if (k in h or k.startswith('Đáp án ')) and k not in obj: obj[k]=v; add+=1
    h=h[:i]+json.dumps(obj,ensure_ascii=False)+h[end:]
    open(f,'w',encoding='utf8').write(h); print(f,'thêm',add)

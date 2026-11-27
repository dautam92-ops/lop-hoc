import json,collections
C='/home/user/lop-hoc/lu/content/'
sk=json.load(open(C+'skills.json'))['skills']
lib=json.load(open(C+'lab/library.json')); met=json.load(open(C+'lab/methodology.json'))
dm=json.load(open('/mnt/project-files/san-pham-500-bai/giao-trinh-2.0/data/chuong-trinh/danh-muc.json'))['chuong_trinh']
al=json.load(open('alloc2.json'))
CTMAP={'TD.LG':'CT01','TD.CD':'CT01','TD.NQ':'CT01','TD.QH':'CT01','TD.GQ':'CT01','TD.VDg':'CT01','TD.QS':'CT02','TD.TT':'CT03','TD.CY':'CT03','TD.TN':'CT04','TD.GN':'CT04','TD.KG':'CT05','TD.TTg':'CT06',
 'TO.DEM':'CT08','TO.SO':'CT08','TV.CC':'CT09','TV.AM':'CT09','TV.VT':'CT10','TV.NG':'CT12','TV.TU':'CT12','EN.EN':'CT13','EQ.CX':'CT14','EQ.XH':'CT14','EQ.AT':'CT18',
 'KP.KH':'CT15','KP.TG':'CT16','KP.ST':'CT19','KP.AN':'CT21','KP.VD':'CT22'}
def ct(k):
  p='.'.join(k.split('.')[:2])
  if p in CTMAP: return CTMAP[p]
  if p.startswith('TO.'): return 'CT07'
  if p.startswith('KS.'): return 'CT17'
  return '?'
G13={'CT01':'Tư duy','CT02':'Quan sát','CT03':'Chú ý','CT04':'Ghi nhớ','CT05':'Nhận thức','CT06':'Tưởng tượng','CT07':'Toán','CT08':'Toán','CT11':'Toán','CT09':'Tiếng Việt','CT10':'Tiếng Việt','CT12':'Tiếng Việt','CT13':'Tiếng Anh','CT14':'Cảm xúc, xã hội (EQ)','CT15':'Kiến thức thế giới','CT16':'Kiến thức thế giới','CT17':'Kỹ năng sống','CT18':'Kỹ năng sống','CT19':'Sáng tạo','CT20':'Sáng tạo','CT21':'Sáng tạo','CT22':'Vận động (tích hợp)','CT23':'Xuyên suốt'}
ORDER=['Tư duy','Quan sát','Chú ý','Ghi nhớ','Nhận thức','Tưởng tượng','Tiếng Anh','Tiếng Việt','Toán','Cảm xúc, xã hội (EQ)','Kiến thức thế giới','Kỹ năng sống','Sáng tạo']
MOTA={'Tư duy':'Phân loại, quy luật, nếu thì, nguyên nhân kết quả, lập trình mũi tên, giải quyết vấn đề','Quan sát':'Tìm vật ẩn, tìm điểm khác, ghép bóng, chi tiết nhỏ','Chú ý':'Nghe lệnh, chỉ chạm khi đúng tín hiệu, theo dõi vật di chuyển','Ghi nhớ':'Nhớ vật vừa thấy, lật thẻ, nhớ chuỗi, nhớ vị trí, nhớ lời dặn','Nhận thức':'Vị trí trong không gian, mê cung, bản đồ, bộ phận và toàn thể','Tưởng tượng':'Xoay hình trong đầu, kể tiếp chuyện, một hình thành nhiều vật','Tiếng Anh':'Từ vựng theo chủ đề, nghe và làm theo, bài hát','Tiếng Việt':'Nghe hiểu, vốn từ, âm và tiếng, 29 chữ cái, tập tô','Toán':'Đếm, chữ số 0–20, so sánh, thêm bớt, hình, đo lường, thời gian, tiền','Cảm xúc, xã hội (EQ)':'Gọi tên cảm xúc, bình tĩnh, chia sẻ, làm bạn, giải quyết mâu thuẫn','Kiến thức thế giới':'Khoa học đơn giản, con vật, cây cối, thời tiết, nghề, nơi chốn, lễ hội','Kỹ năng sống':'Tự phục vụ, vệ sinh, nề nếp, lịch sự, an toàn cá nhân','Sáng tạo':'Trang trí, tạo nhân vật, xếp hình tự do, âm nhạc, mỹ thuật'}
S=[]
for k,v in sk.items():
  c=ct(k); S.append(dict(id=k,ten=v['ten'].replace('Lu','Mono'),mt=v.get('muc_tieu','').replace('Lu','Mono'),nhanh=v.get('nhanh',''),tuoi=v['tuoi'],cls=v['cls'],ct=c,g=G13.get(c,'?'),buoi=al.get(k)))
cnt=collections.Counter(s['g'] for s in S)
CTS=[dict(ma=c['ma'],ten=c['ten'],nhanh=', '.join(c['nhanh_skill_tree']),so=sum(1 for s in S if s['ct']==c['ma']),g=G13[c['ma']]) for c in dm]
PP=[dict(id=x['id'],ten=x['ten'],en=x.get('ten_en',''),nt=' '.join((x.get('nguyen_tac') or [])[:2])) for x in met['methods']]
NL=[dict(id=x['id'],ten=x['ten'],mt=x.get('mo_ta',''),so=x.get('so_ky_nang')) for x in met['abilities']]
PT=[dict(id=x['id'],ten=x['name_vi'],g=x['group'],goal=x.get('goal',''),cc=', '.join(x.get('mechanics',[]))) for x in lib['methods']]
CC=[dict(id=x['id'],ten=x['name'],e=x['engine']) for x in lib['mechanics']]
NG=[dict(id=x['id'],ten=x['ten'],tuoi=x.get('tuoi',''),phut=x.get('phut','')) for x in met['offscreen']]
MON=[dict(v=x['vung'],n=len(x['hoat_dong']),hd=', '.join(h['ten'] for h in x['hoat_dong'])) for x in met['montessori']]
G=[dict(ten=g,mt=MOTA[g],so=cnt.get(g,0)) for g in ORDER]
data=dict(G=G,CTS=CTS,S=S,PP=PP,NL=NL,PT=PT,CC=CC,NG=NG,MON=MON,vd=cnt.get('Vận động (tích hợp)',0),unk=cnt.get('?',0))
print(cnt)
json.dump(data,open('ht.json','w'),ensure_ascii=False)

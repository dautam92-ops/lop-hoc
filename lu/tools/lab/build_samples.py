# -*- coding: utf-8 -*-
"""Phòng mẫu (Demo Lab): sinh content/lab/samples.json.

Mỗi mẫu là MỘT bài giảng mẫu chơi được cho một cơ chế tương tác của trẻ (26 cơ chế, mục IV chỉ thị
Teaching Method Library) hoặc một mẫu nghiệm thu ưu tiên (mục X). Mỗi mẫu có hai mức tuổi 4–5 và 5–6.
Nội dung soạn tay ở đây; engine sinh biến thể vô hạn theo seed, không gọi AI khi bé học.

Chạy:  python3 tools/lab/build_samples.py
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SKILLS = json.load(open(os.path.join(ROOT, 'content/skills.json'), encoding='utf-8'))['skills']

PROGRAMS = ['Tư duy logic', 'Quan sát', 'Chú ý', 'Ghi nhớ', 'Nhận thức', 'Tưởng tượng', 'Toán tư duy', 'Chữ số',
            'Chữ cái tiếng Việt', 'Tập tô chữ cái', 'Tập tô chữ số và đường nét', 'Phát triển ngôn ngữ tiếng Việt',
            'Tiếng Anh', 'EQ và cảm xúc xã hội', 'Khoa học', 'Kiến thức thế giới', 'Kỹ năng sống', 'An toàn cá nhân',
            'Sáng tạo', 'Nghệ thuật', 'Âm nhạc', 'Vận động và phối hợp tay mắt', 'Chuẩn bị vào lớp 1']

MECHANICS = [  # (mã, tên theo chỉ thị mục IV)
    ('CC-01', 'Chạm chọn một đáp án'), ('CC-02', 'Chạm chọn nhiều đối tượng'), ('CC-03', 'Kéo thả'),
    ('CC-04', 'Ghép cặp'), ('CC-05', 'Nối đường'), ('CC-06', 'Phân loại vào nhóm'), ('CC-07', 'Sắp xếp trình tự'),
    ('CC-08', 'Lật thẻ'), ('CC-09', 'Tìm kiếm trong tranh'), ('CC-10', 'Kéo đồ vật vào vùng đích'),
    ('CC-11', 'Xoay hình'), ('CC-12', 'Ghép mảnh'), ('CC-13', 'Di chuyển qua mê cung'), ('CC-14', 'Tô theo nét'),
    ('CC-15', 'Vẽ tự do'), ('CC-16', 'Tô màu'), ('CC-17', 'Chạm từng đối tượng để đếm'),
    ('CC-18', 'Thay đổi trạng thái đồ vật'), ('CC-19', 'Điều khiển mô phỏng'), ('CC-20', 'Tương tác âm thanh'),
    ('CC-21', 'Gõ theo nhịp'), ('CC-22', 'Hội thoại phân nhánh'), ('CC-23', 'Lựa chọn diễn biến'),
    ('CC-24', 'Tạo sản phẩm sáng tạo'), ('CC-25', 'Hoạt động mở không có đáp án duy nhất'),
    ('CC-26', 'Hoạt động ngoài màn hình'),
]

X30 = ['Lu giảng kiến thức về một con vật', 'Kể chuyện tương tác', 'Tìm điểm khác biệt', 'Tìm đồ vật ẩn',
       'Tìm đối tượng theo nhiều điều kiện', 'Nghe và thực hiện chỉ dẫn', 'Lật thẻ ghi nhớ', 'Tìm đồ vật biến mất',
       'Ghi nhớ trình tự', 'Hoàn thiện quy luật', 'Phân loại đồ vật', 'Suy luận từ manh mối', 'Giải mê cung',
       'Ghép hình', 'Ghép đồ vật với công dụng', 'Hoàn thiện hình vẽ bằng trí tưởng tượng', 'Đếm số lượng',
       'Ghép chữ số với số lượng', 'Tách gộp và thêm bớt trực quan', 'Nhận biết chữ cái tiếng Việt',
       'Tập tô chữ cái', 'Tập tô chữ số', 'Nghe chuyện và kể lại bằng tiếng Việt', 'Nghe từ tiếng Anh và chọn hình',
       'Nghe câu tiếng Anh và thực hiện hành động', 'Tình huống EQ có nhiều hướng phản hồi',
       'Mô phỏng thí nghiệm khoa học', 'Mô phỏng kỹ năng sống', 'Nhận diện âm thanh hoặc gõ theo nhịp',
       'Tô màu và sáng tạo tự do']

VI_NUM = ['một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười', 'mười một', 'mười hai', 'mười ba',
          'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín', 'hai mươi']

def G(ch):  # chữ cái hiển thị to trên thẻ
    return f'<b class="glyph">{ch}</b>'

SAMPLES = []

# Nền theo nội dung từng bài (tam 26/11: cùng một nền thì bé nhanh chán). Mã L001-BG-xx = ảnh đã duyệt; còn lại là cảnh vẽ mã trong ui/scenes.js.
# 10 bài hoàn chỉnh trước (tam 26/11 14:22): giọng Hoài My đủ + ảnh vẽ tay
DOT1 = {'CC-01','CC-03','CC-07','CC-08','CC-09','CC-12','CC-13','CC-17','CC-18','CC-19'}
BD = {'CC-01': 'phong', 'CC-02': 'L001-BG-05', 'CC-03': 'L001-BG-04', 'CC-04': 'L001-BG-01', 'CC-05': 'L001-BG-02', 'CC-06': 'nha-sang', 'CC-07': 'L001-BG-03', 'CC-08': 'hien', 'CC-09': 'vuon', 'CC-10': 'phong', 'CC-11': 'san', 'CC-12': 'cay-cao', 'CC-13': 'L001-BG-02', 'CC-14': 'phong', 'CC-15': 'hien', 'CC-16': 'vuon-gio', 'CC-17': 'vuon', 'CC-18': 'bep', 'CC-19': 'bo-ao', 'CC-20': 'san', 'CC-21': 'L001-BG-05', 'CC-22': 'phong', 'CC-23': 'mua', 'CC-24': 'vuon-gio', 'CC-25': 'L001-BG-01', 'CC-26': 'nha-sang', 'MX-01': 'L001-BG-02', 'MX-02': 'san', 'MX-03': 'phong', 'MX-04': 'vuon', 'MX-05': 'hien', 'MX-06': 'bo-ao', 'MX-07': 'bep', 'MX-08': 'phong', 'MX-09': 'san', 'MX-10': 'nha-sang', 'MX-11': 'L001-BG-04',
      'MT-01': 'phong', 'MT-02': 'hien', 'MT-03': 'nha-sang', 'MT-04': 'L001-BG-04', 'MT-05': 'san', 'MT-06': 'L001-BG-01', 'MT-07': 'vuon-gio', 'MT-08': 'phong', 'MT-09': 'L001-BG-02', 'MT-10': 'luong', 'MT-11': 'vuon', 'MT-12': 'nha-sang'}

def S(id, title, *, cc=(), x=(), program, group, goal, engine, mode=None, l45, l56, methods=(), diff='', note='', pp=(), nl=(), mon=None, rep=()):
    for age, a in (('4-5', l45), ('5-6', l56)):
        a.setdefault('engine', engine)
        if mode and 'mode' not in a: a['mode'] = mode
        a['activity_id'] = f'LAB-{id}-{age}'
        a.setdefault('title', title)
    SAMPLES.append(dict(id=id, title=title, cc=list(cc), x=list(x), program=program, group=group, goal=goal,
                        engine=engine, mode=mode, methods=list(methods), diff=diff, note=note, pp=list(pp), nl=list(nl), mon=mon, rep=list(rep),
                        bd=BD[id], dot=(1 if id in DOT1 else 0), status='ready_for_review', version='1.0.0', levels={'4-5': l45, '5-6': l56}))

# ===================================================================== 26 cơ chế
S('CC-01', 'Chữ nào Lu gọi?', cc=['CC-01'], x=[20], program='Chữ cái tiếng Việt', group='Tiếng Việt', engine='E01', mode='items',
  methods=['M056', 'M059'], goal='Nghe tên chữ và chạm đúng chữ; 5–6 tuổi phân biệt nhóm chữ dễ nhầm o, ô, ơ.',
  diff='4–5: làm quen o, a, e với 3 thẻ. 5–6: phân biệt o, ô, ơ và c với 4 thẻ.',
  l45=dict(skill_id='TV.CC.02', style='face', intro=['Lu có mấy tấm thẻ chữ. Lu gọi tên chữ nào, bé chạm vào chữ đó nhé.'],
           items=[dict(q='Bé chạm vào chữ o.', a=0, ok='Đúng rồi, đây là chữ o. Chữ o tròn như quả trứng.', no='Chữ o tròn xoe như quả trứng đó.', opts=[{'e': G('o')}, {'e': G('a')}, {'e': G('e')}]),
                  dict(q='Bé chạm vào chữ a.', a=1, ok='Đúng rồi, đây là chữ a.', no='Chữ a có một vòng tròn và một nét thẳng bên phải.', opts=[{'e': G('o')}, {'e': G('a')}, {'e': G('e')}]),
                  dict(q='Bé chạm vào chữ e.', a=2, ok='Đúng rồi, đây là chữ e.', no='Chữ e có một nét ngang ở giữa.', opts=[{'e': G('o')}, {'e': G('a')}, {'e': G('e')}])],
           no='Bé nhìn kỹ lại nhé.'),
  l56=dict(skill_id='TV.CC.02', style='face', intro=['Ba chữ o, ô, ơ trông gần giống nhau. Bé nhìn kỹ cái mũ và cái râu nhé.'],
           items=[dict(q='Bé chạm vào chữ ô.', a=1, ok='Đúng rồi, chữ ô đội mũ.', no='Chữ ô có cái mũ trên đầu.', opts=[{'e': G('o')}, {'e': G('ô')}, {'e': G('ơ')}, {'e': G('c')}]),
                  dict(q='Bé chạm vào chữ ơ.', a=2, ok='Đúng rồi, chữ ơ có râu.', no='Chữ ơ có cái râu nhỏ bên phải.', opts=[{'e': G('o')}, {'e': G('ô')}, {'e': G('ơ')}, {'e': G('c')}]),
                  dict(q='Bé chạm vào chữ o.', a=0, ok='Đúng rồi, chữ o không có mũ, không có râu.', no='Chữ o tròn xoe, không có mũ, không có râu.', opts=[{'e': G('o')}, {'e': G('ô')}, {'e': G('ơ')}, {'e': G('c')}]),
                  dict(q='Bé chạm vào chữ c.', a=3, ok='Đúng rồi, chữ c hở một bên.', no='Chữ c giống chữ o bị hở một bên.', opts=[{'e': G('o')}, {'e': G('ô')}, {'e': G('ơ')}, {'e': G('c')}])],
           no='Bé nhìn kỹ lại nhé.'))

S('CC-02', 'Tìm đúng đồ chơi', cc=['CC-02'], x=[5], program='Chú ý', group='Tư duy', engine='E06', mode='multi',
  methods=['M016', 'M018', 'M028'], goal='Tìm tất cả đối tượng thỏa hai hoặc ba điều kiện cùng lúc.',
  diff='4–5: loại + màu, 9 ô. 5–6: thêm kích thước hoặc điều kiện phủ định "không phải màu…", 12 ô.',
  l45=dict(skill_id='TD.LG.09', intro=['Đồ chơi của Lu lẫn lộn hết rồi. Bé giúp Lu tìm nhé.'], kinds=[{'k': 'bong', 'name': 'quả bóng'}, {'k': 'mu', 'name': 'chiếc mũ'}, {'k': 'o', 'name': 'chiếc ô'}],
           colors=['do', 'xanh', 'vang'], rules=['kind-color'], cells=9, cols=3, rounds=2, done='Bé tìm đủ rồi!'),
  l56=dict(skill_id='TD.LG.09', intro=['Lần này có thêm điều kiện. Bé nghe hết lời Lu rồi mới chạm nhé.'], kinds=[{'k': 'bong', 'name': 'quả bóng'}, {'k': 'mu', 'name': 'chiếc mũ'}, {'k': 'o', 'name': 'chiếc ô'}, {'k': 'giay', 'name': 'chiếc giày'}],
           colors=['do', 'xanh', 'vang', 'la'], rules=['kind-color-size', 'kind-notcolor'], cells=12, cols=4, rounds=2, done='Bé tìm đủ rồi, không sót cái nào!'))

S('CC-03', 'Gieo hạt theo số', cc=['CC-03'], x=[18], program='Chữ số', group='Toán', engine='E02',
  methods=['M048', 'M049'], goal='Kéo nhóm vật về cọc có chữ số bằng số lượng.',
  diff='4–5: số 1–3. 5–6: số 4–8, bốn cọc mỗi lượt.',
  l45=dict(skill_id='TO.SO.01', target_style='pair', intro=['Mỗi luống có một cọc ghi số. Bé kéo rổ cà rốt về đúng cọc nhé.'], label='Kéo rổ về đúng cọc',
           sets=[[{'piece': 'art:ca-rot*1', 'target': 'art:coc:1'}, {'piece': 'art:ca-rot*2', 'target': 'art:coc:2'}, {'piece': 'art:ca-rot*3', 'target': 'art:coc:3'}],
                 [{'piece': 'art:tao*1', 'target': 'art:coc:1'}, {'piece': 'art:tao*2', 'target': 'art:coc:2'}, {'piece': 'art:tao*3', 'target': 'art:coc:3'}]],
           rounds=2, again='Mình làm thêm một lượt nữa.', no='Bé đếm lại số vật rồi tìm cọc có số giống vậy nhé.', done='Rổ nào cũng về đúng cọc rồi!'),
  l56=dict(skill_id='TO.SO.02', target_style='pair', intro=['Lần này số lớn hơn. Bé đếm thật kỹ rồi kéo về đúng cọc nhé.'], label='Kéo rổ về đúng cọc',
           sets=[[{'piece': 'art:ca-rot*4', 'target': 'art:coc:4'}, {'piece': 'art:ca-rot*5', 'target': 'art:coc:5'}, {'piece': 'art:ca-rot*6', 'target': 'art:coc:6'}, {'piece': 'art:ca-rot*8', 'target': 'art:coc:8'}],
                 [{'piece': 'art:tao*5', 'target': 'art:coc:5'}, {'piece': 'art:tao*6', 'target': 'art:coc:6'}, {'piece': 'art:tao*7', 'target': 'art:coc:7'}, {'piece': 'art:tao*4', 'target': 'art:coc:4'}]],
           rounds=2, again='Mình làm thêm một lượt nữa.', no='Bé đếm lại số vật rồi tìm cọc có số giống vậy nhé.', done='Rổ nào cũng về đúng cọc rồi!'))

S('CC-04', 'Đồ vật này để làm gì?', cc=['CC-04'], x=[15], program='Kiến thức thế giới', group='Khám phá', engine='E02',
  methods=['M037'], goal='Ghép đồ vật với việc nó dùng để làm.',
  diff='4–5: 3 cặp quen thuộc. 5–6: 4 cặp, có đồ vật ít gặp hơn.',
  l45=dict(skill_id='KP.TG.02', target_style='pair', intro=['Mỗi đồ vật có một công dụng. Bé kéo đồ vật đến chỗ cần dùng nó nhé.'], label='Kéo đồ vật đến chỗ dùng nó',
           sets=[[{'piece': 'art:ban-chai', 'target': 'art:rang'}, {'piece': 'art:luoc', 'target': 'art:toc'}, {'piece': 'art:o', 'target': 'art:mua'}]],
           rounds=1, no='Bé nghĩ xem mình dùng đồ vật này lúc nào nhé.', done='Bàn chải để đánh răng, lược để chải tóc, ô để che mưa.'),
  l56=dict(skill_id='KP.TG.02', target_style='pair', intro=['Mỗi đồ vật có một công dụng. Bé kéo đồ vật đến chỗ cần dùng nó nhé.'], label='Kéo đồ vật đến chỗ dùng nó',
           sets=[[{'piece': 'art:ban-chai', 'target': 'art:rang'}, {'piece': 'art:luoc', 'target': 'art:toc'}, {'piece': 'art:o', 'target': 'art:mua'}, {'piece': 'art:keo', 'target': 'art:giay-to'}],
                 [{'piece': 'art:binh-tuoi', 'target': 'art:chau-cay'}, {'piece': 'art:thia', 'target': 'art:bat-com'}, {'piece': 'art:khan', 'target': 'art:ban-tay'}, {'piece': 'art:keo', 'target': 'art:giay-to'}]],
           rounds=2, again='Thêm một lượt nữa nhé.', no='Bé nghĩ xem mình dùng đồ vật này lúc nào nhé.', done='Đồ vật nào cũng về đúng chỗ rồi!'))

S('CC-05', 'Ai ở đâu, ai dùng gì?', cc=['CC-05'], x=[], program='Nhận thức', group='Khám phá', engine='E02', mode='line',
  methods=['M036', 'M038'], goal='Nối con vật với nơi sống; 5–6 tuổi nối nghề với dụng cụ.',
  diff='4–5: nối 3 con vật với nơi sống. 5–6: nối 3 nghề với dụng cụ, rồi 4 con vật với nơi sống.',
  l45=dict(skill_id='KP.TG.03', intro=['Bé kéo một đường từ con vật đến nơi nó sống nhé.'],
           sets=[[{'piece': 'art:ca', 'target': 'art:ao-nuoc', 'ok': 'Cá sống dưới ao.'}, {'piece': 'art:ong', 'target': 'art:to-ong', 'ok': 'Ong sống trong tổ ong.'}, {'piece': 'art:ga', 'target': 'art:nha-ga', 'ok': 'Gà ngủ trong chuồng gà.'}]],
           rounds=1, done='Con vật nào cũng về đúng nhà rồi!'),
  l56=dict(skill_id='KP.TG.07', intro=['Mỗi cô chú làm một nghề và dùng một dụng cụ. Bé nối mũ với dụng cụ của nghề đó nhé.'],
           sets=[[{'piece': 'art:mu-dau-bep', 'target': 'art:chao', 'ok': 'Đầu bếp nấu ăn bằng chảo.'}, {'piece': 'art:mu-tho-xay', 'target': 'art:bua', 'ok': 'Chú thợ xây dùng búa.'}, {'piece': 'art:mu-cuu-hoa', 'target': 'art:voi-cuu-hoa', 'ok': 'Chú lính cứu hỏa dùng vòi phun nước.'}],
                 [{'piece': 'art:ca', 'target': 'art:ao-nuoc', 'ok': 'Cá sống dưới ao.'}, {'piece': 'art:ong', 'target': 'art:to-ong', 'ok': 'Ong sống trong tổ ong.'}, {'piece': 'art:ga', 'target': 'art:nha-ga', 'ok': 'Gà ngủ trong chuồng gà.'}, {'piece': 'art:chim', 'target': 'art:cay', 'ok': 'Chim làm tổ trên cây.'}]],
           rounds=2, again='Giờ mình nối thêm một bảng nữa nhé.', done='Bé nối đúng hết rồi!'))

S('CC-06', 'Xếp đồ về đúng chỗ', cc=['CC-06'], x=[11], program='Tư duy logic', group='Tư duy', engine='E03',
  methods=['M027', 'M028'], goal='Phân loại đồ vật, con vật vào nhóm theo một đặc điểm chung.',
  diff='4–5: 2 nhóm (đồ vệ sinh và đồ ăn). 5–6: 3 nhóm (dưới nước, trên trời, trên cạn), 6 vật mỗi lượt.',
  l45=dict(skill_id='TD.LG.04', intro=['Đồ dùng vệ sinh và đồ ăn bị lẫn vào nhau. Bé xếp mỗi thứ về đúng giỏ nhé.'], again='Bé xếp tiếp nhé.',
           groups=[{'id': 've-sinh', 'label': 'Đồ vệ sinh', 'e': 'art:xa-phong', 'say': 'Giỏ đồ vệ sinh.'}, {'id': 'an', 'label': 'Đồ ăn', 'e': 'art:bat-com', 'say': 'Giỏ đồ ăn.'}],
           items=[{'e': 'art:ban-chai', 'g': 've-sinh'}, {'e': 'art:khan', 'g': 've-sinh'}, {'e': 'art:luoc', 'g': 've-sinh'}, {'e': 'art:xa-phong', 'g': 've-sinh'},
                  {'e': 'art:banh-mi', 'g': 'an'}, {'e': 'art:tao', 'g': 'an'}, {'e': 'art:ca-rot', 'g': 'an'}, {'e': 'art:rau', 'g': 'an'}],
           per_round=4, rounds=2, no='Bé nghĩ xem mình dùng thứ này để làm gì nhé.', done='Đồ nào cũng về đúng giỏ rồi!'),
  l56=dict(skill_id='TD.LG.05', intro=['Các con vật đi lạc rồi. Bé đưa con vật về chỗ của nó nhé: dưới nước, trên trời hay trên cạn.'], again='Bé xếp tiếp nhé.',
           groups=[{'id': 'nuoc', 'label': 'Dưới nước', 'e': 'art:ao-nuoc', 'say': 'Dưới nước.'}, {'id': 'troi', 'label': 'Trên trời', 'e': 'art:bau-troi', 'say': 'Trên trời.'}, {'id': 'can', 'label': 'Trên cạn', 'e': 'art:mat-dat', 'say': 'Trên cạn.'}],
           items=[{'e': 'art:ca', 'g': 'nuoc'}, {'e': 'art:ech', 'g': 'nuoc'}, {'e': 'art:vit', 'g': 'nuoc'}, {'e': 'art:chim', 'g': 'troi'}, {'e': 'art:buom', 'g': 'troi'}, {'e': 'art:ong', 'g': 'troi'},
                  {'e': 'art:meo', 'g': 'can'}, {'e': 'art:tho', 'g': 'can'}, {'e': 'art:ga', 'g': 'can'}, {'e': 'art:oc', 'g': 'can'}],
           per_round=5, rounds=2, no='Bé nghĩ xem con vật này bơi, bay hay đi trên mặt đất nhé.', done='Con vật nào cũng về đúng chỗ rồi!'),
  note='Ếch và vịt sống được cả trên cạn; mẫu xếp theo nơi chúng kiếm ăn chính (dưới nước). Cần chuyên môn xác nhận.')

S('CC-07', 'Lu trồng đậu', cc=['CC-07'], x=[23], program='Phát triển ngôn ngữ tiếng Việt', group='Tiếng Việt', engine='E04', mode='cards',
  methods=['M068', 'M066', 'M040'], goal='Nghe chuyện, xếp tranh đúng thứ tự rồi nghe kể lại.',
  diff='4–5: 3 tranh. 5–6: 4 tranh, thêm một truyện vòng đời gà.',
  l45=dict(skill_id='TV.NG.01', intro=['Lu kể chuyện trồng đậu. Bé xếp tranh theo đúng thứ tự nhé.'], label='Bé chạm tranh theo thứ tự',
           sets=[dict(q='Chuyện gì xảy ra trước tiên?', items=[{'e': 'art:hat-dau', 'say': 'Đầu tiên, Lu gieo hạt đậu.'}, {'e': 'art:mam-dau', 'say': 'Rồi hạt nảy mầm.'}, {'e': 'art:qua-dau', 'say': 'Cuối cùng, cây ra quả đậu.'}], ok='Bé kể lại giỏi lắm!')],
           rounds=1, done='Câu chuyện đã xếp xong!'),
  l56=dict(skill_id='TV.NG.01', intro=['Lu có hai câu chuyện. Bé xếp tranh theo đúng thứ tự nhé.'], label='Bé chạm tranh theo thứ tự', again='Câu chuyện thứ hai nhé.',
           sets=[dict(q='Chuyện gì xảy ra trước tiên?', items=[{'e': 'art:hat-dau', 'say': 'Đầu tiên, Lu gieo hạt đậu.'}, {'e': 'art:binh-tuoi', 'say': 'Lu tưới nước mỗi ngày.'}, {'e': 'art:mam-dau', 'say': 'Hạt nảy mầm xanh.'}, {'e': 'art:qua-dau', 'say': 'Cây lớn lên và ra quả đậu.'}], ok='Bé kể lại giỏi lắm!'),
                 dict(q='Chú gà bắt đầu từ đâu?', items=[{'e': 'art:trung', 'say': 'Đầu tiên là quả trứng.'}, {'e': 'art:ga-con', 'say': 'Trứng nở ra gà con.'}, {'e': 'art:ga', 'say': 'Gà con lớn lên thành gà mái.'}], ok='Đúng là vòng đời của gà rồi!')],
           rounds=2, done='Hai câu chuyện đã xếp xong!'))

S('CC-08', 'Lật thẻ tìm đôi', cc=['CC-08'], x=[7], program='Ghi nhớ', group='Tư duy', engine='E05',
  methods=['M021', 'M022'], goal='Nhớ vị trí thẻ để tìm các đôi giống nhau; 5–6 tuổi ghép đôi có liên quan (gà và trứng, ong và tổ).',
  diff='4–5: 3 đôi giống hệt nhau. 5–6: 4 đôi có liên quan, hai thẻ khác hình.',
  l45=dict(skill_id='TD.TN.02', intro=['Bé lật hai thẻ. Hai thẻ giống nhau là được một đôi nhé.'], pool=['art:meo', 'art:ga', 'art:ca', 'art:buom', 'art:ech'], pairs=3, done='Bé giỏi quá! Đôi nào cũng tìm ra rồi.'),
  l56=dict(skill_id='TD.TN.02', intro=['Lần này hai thẻ của một đôi không giống hệt nhau mà có liên quan với nhau, như con gà và quả trứng. Bé lật và nhớ thật kỹ nhé.'],
           match=[['art:ga', 'art:ga-con'], ['art:ga-con', 'art:trung'], ['art:ong', 'art:to-ong'], ['art:ca', 'art:ao-nuoc'], ['art:chim', 'art:cay'], ['art:meo', 'art:ca-rot']][:5], pairs=4, done='Bé giỏi quá! Đôi nào cũng tìm ra rồi.'),
  note='Theo quy tắc tam: chỉ giải thích lúc đầu, lật sai úp lại im lặng, đôi đúng có tiếng "ting", xong cả bài mới khen.')
# Sửa cặp 5–6: mỗi hình chỉ thuộc một đôi để không mơ hồ
SAMPLES[-1]['levels']['5-6']['match'] = [['art:ga', 'art:trung'], ['art:ong', 'art:to-ong'], ['art:ca', 'art:ao-nuoc'], ['art:chim', 'art:cay'], ['art:mu-dau-bep', 'art:chao']]

S('CC-09', 'Ai trốn trong vườn đậu?', cc=['CC-09'], x=[4], program='Quan sát', group='Tư duy', engine='E06', mode='scene',
  methods=['M012', 'M018'], goal='Tìm con vật nhỏ ẩn trong tranh vườn, bị bụi cỏ che một phần.',
  diff='4–5: tìm 2 con, hình to. 5–6: tìm 4 con, hình nhỏ hơn, nhiều vật gây nhiễu.',
  l45=dict(skill_id='TD.QS.07', bg='asset:BC-0003', intro=['Trong vườn đậu có mấy bạn nhỏ đang trốn.'], q='Bé tìm {name} nhé.', find=2, tw=13, dw=12,
           targets=[{'e': 'art:oc', 'name': 'chú ốc sên', 'found': 'A, chú ốc sên đây rồi.'}, {'e': 'art:buom', 'name': 'bạn bướm', 'found': 'Bạn bướm đây rồi.'}, {'e': 'art:ech', 'name': 'chú ếch', 'found': 'Chú ếch đây rồi.'}],
           decoys=['art:la', 'art:hoa', 'art:soi', 'art:la-cay'], hint='Bé nhìn kỹ dưới các bụi cỏ nhé.', done='Bé tìm thấy hết các bạn rồi!'),
  l56=dict(skill_id='TD.QS.07', bg='asset:BC-0003', intro=['Trong vườn đậu có nhiều bạn nhỏ đang trốn kỹ lắm.'], q='Bé tìm {name} nhé.', find=4, tw=9, dw=10,
           targets=[{'e': 'art:oc', 'name': 'chú ốc sên', 'found': 'A, chú ốc sên đây rồi.'}, {'e': 'art:buom', 'name': 'bạn bướm', 'found': 'Bạn bướm đây rồi.'}, {'e': 'art:ech', 'name': 'chú ếch', 'found': 'Chú ếch đây rồi.'}, {'e': 'art:ong', 'name': 'bạn ong', 'found': 'Bạn ong đây rồi.'}, {'e': 'art:chim', 'name': 'chú chim', 'found': 'Chú chim đây rồi.'}],
           decoys=['art:la', 'art:hoa', 'art:soi', 'art:la-cay', 'art:mam-dau', 'art:hat-dau', 'art:rau'], hint='Bé nhìn kỹ dưới các bụi cỏ nhé.', done='Bé tìm thấy hết các bạn rồi!'))

S('CC-10', 'Đặt đồ chơi theo lời Lu', cc=['CC-10'], x=[6], program='Chú ý', group='Tư duy', engine='E11', mode='place',
  methods=['M017', 'M034'], goal='Nghe chỉ dẫn vị trí (trong, trên, dưới, bên trái, bên phải) và đặt vật đúng chỗ.',
  diff='4–5: một chỉ dẫn mỗi lần, trong, trên, dưới. 5–6: nghe hai chỉ dẫn liền nhau rồi mới làm, thêm trái và phải.',
  l45=dict(skill_id='TD.KG.01', anchor='art:hop', intro=['Lu có một cái hộp. Bé nghe Lu nói rồi đặt đồ chơi vào đúng chỗ nhé.'], rounds=3,
           tasks=[{'e': 'art:meo', 'zone': 'trong', 'say': 'Bé đặt chú mèo vào trong hộp.', 'ok': 'Mèo đã ở trong hộp.'}, {'e': 'art:bong', 'zone': 'tren', 'say': 'Bé đặt quả bóng lên trên hộp.', 'ok': 'Quả bóng ở trên hộp rồi.'},
                  {'e': 'art:giay', 'zone': 'duoi', 'say': 'Bé đặt chiếc giày ở dưới hộp.', 'ok': 'Chiếc giày ở dưới hộp rồi.'}, {'e': 'art:sach', 'zone': 'tren', 'say': 'Bé đặt quyển sách lên trên hộp.', 'ok': 'Quyển sách ở trên hộp rồi.'}],
           no='Bé nghe lại lời Lu nhé.', done='Bé đặt đúng hết rồi!'),
  l56=dict(skill_id='TD.TT.05', anchor='art:hop', intro=['Lần này Lu nói hai việc liền nhau. Bé nghe hết rồi mới làm nhé.'], rounds=2, per=2, both='Bé nhớ cả hai việc nhé.',
           tasks=[{'e': 'art:meo', 'zone': 'trong', 'say': 'Đặt chú mèo vào trong hộp.'}, {'e': 'art:bong', 'zone': 'tren', 'say': 'Đặt quả bóng lên trên hộp.'}, {'e': 'art:giay', 'zone': 'duoi', 'say': 'Đặt chiếc giày ở dưới hộp.'},
                  {'e': 'art:sach', 'zone': 'trai', 'say': 'Đặt quyển sách ở bên trái hộp.'}, {'e': 'art:ly', 'zone': 'phai', 'say': 'Đặt cái cốc ở bên phải hộp.'}],
           no='Bé nghe lại lời Lu nhé.', done='Bé nhớ và làm đúng cả hai việc rồi!'),
  note='Trái, phải tính theo phía bé nhìn vào màn hình.')

S('CC-11', 'Xoay tranh cho thẳng', cc=['CC-11'], x=[14], program='Tư duy logic', group='Tư duy', engine='E08', mode='rotate',
  methods=['M032'], goal='Xoay từng mảnh tranh bị nghiêng cho đến khi tranh thẳng lại.',
  diff='4–5: 4 mảnh vuông. 5–6: 9 mảnh vuông.',
  l45=dict(skill_id='TD.TTg.01', pictures=[{'v': 'lu:vay-tay', 'name': 'Lu vẫy tay'}], cols=2, rows=2, aspect='1/1', intro=['Gió thổi làm ảnh của Lu bị xoay lung tung. Bé chạm vào mảnh nghiêng để xoay nó lại nhé.'], done='Ảnh của Lu thẳng lại rồi!'),
  l56=dict(skill_id='TD.TTg.01', pictures=[{'v': 'lu:an-mung', 'name': 'Lu ăn mừng'}, {'v': 'lu:kham-pha', 'name': 'Lu khám phá'}], cols=3, rows=3, aspect='1/1', rounds=1, intro=['Gió thổi làm ảnh của Lu bị xoay lung tung. Bé chạm vào mảnh nghiêng để xoay nó lại nhé.'], done='Ảnh của Lu thẳng lại rồi!'))

S('CC-12', 'Ghép tranh vườn đậu', cc=['CC-12'], x=[14], program='Tư duy logic', group='Tư duy', engine='E08', mode='jigsaw',
  methods=['M033', 'M035'], goal='Ghép các mảnh tranh vào đúng chỗ.',
  diff='4–5: 4 mảnh, có tranh mờ làm mẫu. 5–6: 9 mảnh, không có tranh mẫu.',
  l45=dict(skill_id='TD.KG.10', pictures=[{'v': 'asset:BC-0003', 'name': 'vườn đậu'}], cols=2, rows=2, ghost=True, intro=['Tranh vườn đậu bị rơi ra thành mảnh. Bé kéo từng mảnh vào đúng chỗ nhé.'],
           no='Bé nhìn tranh mờ phía sau để tìm chỗ nhé.', done='Tranh vườn đậu đã ghép xong!'),
  l56=dict(skill_id='TD.KG.10', pictures=[{'v': 'asset:BC-0003', 'name': 'vườn đậu'}, {'v': 'asset:BC-0001', 'name': 'nhà Lu buổi sáng'}], cols=3, rows=3, intro=['Tranh bị rơi ra thành chín mảnh. Bé kéo từng mảnh vào đúng chỗ nhé.'],
           no='Bé nhìn màu và đường nét ở mép mảnh nhé.', look='Bầu trời ở trên, mặt đất ở dưới đó.', done='Tranh đã ghép xong!'))

S('CC-13', 'Đường về nhà của Lu', cc=['CC-13'], x=[13], program='Vận động và phối hợp tay mắt', group='Tư duy', engine='E07',
  methods=['M031'], goal='Tìm đường đi trong mê cung; 5–6 tuổi nhặt đủ vật trên đường.',
  diff='4–5: mê cung 4×3. 5–6: 6×5 và nhặt 3 hạt đậu trước khi về nhà.',
  l45=dict(skill_id='TD.KG.02', cols=4, rows=3, goal='art:nha', intro=['Lu muốn về nhà. Bé kéo Lu đi theo lối trống nhé.'], hint='Bé đi theo lối không có tường nhé.', bump='Ở đây có tường rồi.', done='Lu về tới nhà rồi!'),
  l56=dict(skill_id='TD.KG.02', cols=6, rows=5, goal='art:nha', collect={'e': 'art:hat-dau', 'n': 3, 'ok': 'Nhặt được một hạt.', 'need': 'Lu còn thiếu hạt đậu. Bé nhặt đủ rồi mới về nhé.'},
           intro=['Trên đường về, Lu muốn nhặt ba hạt đậu. Bé dẫn Lu nhặt đủ rồi về nhà nhé.'], hint='Bé nhìn trước đường đi rồi mới kéo nhé.', bump='Ở đây có tường rồi.', done='Lu nhặt đủ hạt và về tới nhà rồi!'))

S('CC-14', 'Tập tô cùng Lu', cc=['CC-14'], x=[21], program='Tập tô chữ cái', group='Tiếng Việt', engine='E13', mode='trace',
  methods=['M061', 'M062'], goal='Tô theo nét chấm đúng điểm bắt đầu và chiều nét: xem mẫu, tô có hỗ trợ, tự tô.',
  diff='4–5: nét cơ bản (thẳng, ngang, cong), có mẫu và hỗ trợ. 5–6: chữ o, ô, ơ, thêm bước tự tô với độ chính xác cao hơn.',
  l45=dict(skill_id='TV.VT.01', glyphs=['net-thang', 'net-ngang', 'net-cong-trai'], phases=['mau', 'ho-tro'], intro=['Mình cùng tập tô nhé. Bé xem Lu tô trước.'], done='Bé tô {name} đẹp lắm!'),
  l56=dict(skill_id='TV.VT.02', glyphs=['o', 'ô', 'ơ'], phases=['mau', 'ho-tro', 'doc-lap'], intro=['Hôm nay mình tô chữ o, ô, ơ. Bé xem Lu tô trước, rồi tô cùng Lu, rồi tự tô nhé.'], done='Bé tô {name} đẹp lắm!'),
  note='Dữ liệu nét chữ là bản nháp, cần chuyên môn tiểu học kiểm tra điểm bắt đầu và chiều nét trước khi dùng thật.')

S('CC-15', 'Bé vẽ tranh', cc=['CC-15'], x=[30], program='Nghệ thuật', group='Nghệ thuật', engine='E14', mode='draw',
  methods=['M097', 'M096'], goal='Cầm bút sáp tô theo nét đứt của tranh cho sẵn (tập kiểm soát nét), rồi vẽ thêm tùy thích. Không hỏi lại bé đã vẽ gì (tam 26/11).',
  diff='4–5: ông mặt trời, nét tròn và nét thẳng. 5–6: con cá và sóng nước, nét cong, cần nhiều nét hơn.',
  l45=dict(skill_id='KP.ST.D01', trace='<circle cx="200" cy="150" r="55"/><path d="M200 70 V40 M200 230 V260 M120 150 H90 M280 150 H310 M143 93 L122 72 M257 93 L278 72 M143 207 L122 228 M257 207 L278 228"/>', intro=['Bé chọn màu bút sáp rồi tô theo nét đứt để vẽ ông mặt trời nhé. Vẽ xong bé bấm Vẽ xong.'], min_strokes=2,
           done='Ông mặt trời của bé thật ấm áp! Lu cất tranh vào tủ tranh rồi.'),
  l56=dict(skill_id='KP.ST.D01', trace='<path d="M110 150 Q180 80 260 150 Q180 220 110 150 Z"/><path d="M260 150 L320 110 L320 190 Z"/><circle cx="150" cy="140" r="8"/><path d="M185 115 Q200 95 220 112"/><path d="M70 240 Q95 225 120 240 T170 240 M230 240 Q255 225 280 240 T330 240"/>', intro=['Bé tô theo nét đứt để vẽ chú cá đang bơi nhé. Tô xong bé vẽ thêm gì cũng được, rồi bấm Vẽ xong.'], min_strokes=4,
           done='Chú cá của bé bơi thật vui! Lu cất tranh vào tủ tranh rồi.'))

S('CC-16', 'Tô màu bướm và hoa', cc=['CC-16'], x=[30], program='Nghệ thuật', group='Nghệ thuật', engine='E13', mode='color',
  methods=['M096'], goal='Chọn màu và tô vào tranh; 5–6 tuổi tô theo số (số nào màu nấy).',
  diff='4–5: tô tự do, tô ít nhất nửa tranh. 5–6: tô theo số, phải đúng màu từng vùng.',
  l45=dict(skill_id='KP.ST.D01', picture='buom-hoa', style='tu-do', intro=['Bé chọn màu bút sáp rồi chạm vào tranh để tô nhé. Tô xong bé bấm Xong rồi.'],
           palette=[{'n': 1, 'c': '#e98b9a', 'name': 'hồng', 'say': 'Màu hồng.'}, {'n': 2, 'c': '#a58bc9', 'name': 'tím', 'say': 'Màu tím.'}, {'n': 3, 'c': '#6b5232', 'name': 'nâu', 'say': 'Màu nâu.'}, {'n': 4, 'c': '#f6c85f', 'name': 'vàng', 'say': 'Màu vàng.'}, {'n': 5, 'c': '#e0705a', 'name': 'đỏ', 'say': 'Màu đỏ.'}, {'n': 6, 'c': '#8fae3e', 'name': 'xanh lá', 'say': 'Màu xanh lá.'}],
           done='Tranh của bé nhiều màu thật đẹp!'),
  l56=dict(skill_id='KP.ST.D01', picture='buom-hoa', style='theo-so', intro=['Mỗi vùng có một con số. Số nào thì tô màu nấy nhé, nhìn bảng màu ở dưới.'],
           palette=[{'n': 1, 'c': '#e98b9a', 'name': 'hồng', 'say': 'Số một, màu hồng.'}, {'n': 2, 'c': '#a58bc9', 'name': 'tím', 'say': 'Số hai, màu tím.'}, {'n': 3, 'c': '#6b5232', 'name': 'nâu', 'say': 'Số ba, màu nâu.'}, {'n': 4, 'c': '#f6c85f', 'name': 'vàng', 'say': 'Số bốn, màu vàng.'}, {'n': 5, 'c': '#e0705a', 'name': 'đỏ', 'say': 'Số năm, màu đỏ.'}, {'n': 6, 'c': '#8fae3e', 'name': 'xanh lá', 'say': 'Số sáu, màu xanh lá.'}],
           wrong_color='Vùng số {n} tô màu {c} nhé.', done='Bé tô đúng hết các số rồi!'))

S('CC-17', 'Đếm táo trong rổ', cc=['CC-17'], x=[17], program='Chữ số', group='Toán', engine='E01', mode='count',
  methods=['M047', 'M046'], goal='Chạm từng vật để đếm rồi chọn số.',
  diff='4–5: đếm 1–5. 5–6: đếm 6–10.',
  l45=dict(skill_id='TO.DEM.01', object='art:tao', intro=['Bé chạm từng quả táo và đếm cùng Lu nhé.'], hint='Bé chạm từng quả, mỗi quả đếm một tiếng.', q='Trong rổ có mấy quả táo?', pool=[1, 2, 3, 4, 5], max=5, rounds=3,
           words=VI_NUM[:5], ok='Đúng rồi! Có {word} quả táo.', no='Bé đếm lại nhé.'),
  l56=dict(skill_id='TO.SO.02', object='art:tao', intro=['Lần này nhiều táo hơn. Bé chạm từng quả và đếm thật chậm nhé.'], hint='Bé chạm từng quả, mỗi quả đếm một tiếng.', q='Trong rổ có mấy quả táo?', pool=[6, 7, 8, 9, 10], max=10, rounds=3,
           words=VI_NUM[:10], ok='Đúng rồi! Có {word} quả táo.', no='Bé đếm lại nhé.'))

HAND = lambda c: f'art:ban-tay:{c}'
S('CC-18', 'Rửa tay cùng Lu', cc=['CC-18'], x=[28], program='Kỹ năng sống', group='Kỹ năng sống', engine='E11', mode='steps',
  methods=['M086', 'M087'], goal='Chọn đúng đồ vật cho từng bước rửa tay; đôi tay đổi trạng thái theo từng bước.',
  diff='4–5: 4 bước. 5–6: 5 bước, thêm bước xắn tay áo.',
  l45=dict(skill_id='KS.VS.01', state0=HAND('#c9a27a'), intro=['Tay Lu bẩn rồi. Bé giúp Lu rửa tay nhé.'],
           steps=[{'e': 'art:voi-nuoc', 'label': 'Làm ướt tay', 'ask': 'Đầu tiên, bé chạm vào thứ gì?', 'say': 'Mở vòi, làm ướt hai bàn tay.', 'state': HAND('#cfe3ea')},
                  {'e': 'art:xa-phong', 'label': 'Xoa xà phòng', 'ask': 'Tiếp theo là gì nhỉ?', 'say': 'Xoa xà phòng thật đều, kẽ ngón tay nữa.', 'state': HAND('#ffffff')},
                  {'e': 'art:giot-nuoc', 'label': 'Xả sạch', 'ask': 'Rồi mình làm gì?', 'say': 'Xả nước cho sạch hết bọt.', 'state': HAND('#e3f1f5')},
                  {'e': 'art:khan', 'label': 'Lau khô', 'ask': 'Bước cuối cùng là gì?', 'say': 'Lau khô tay bằng khăn sạch.', 'state': HAND('#fbe3bf')}],
           no='Chưa đến bước đó đâu.', done='Tay Lu sạch thơm rồi!'),
  l56=dict(skill_id='KS.VS.01', state0=HAND('#c9a27a'), intro=['Tay Lu bẩn rồi. Bé giúp Lu rửa tay đúng các bước nhé.'],
           steps=[{'e': 'art:ao', 'label': 'Xắn tay áo', 'ask': 'Trước khi rửa tay, mình làm gì?', 'say': 'Xắn tay áo lên cho khỏi ướt.', 'state': HAND('#c9a27a')},
                  {'e': 'art:voi-nuoc', 'label': 'Làm ướt tay', 'ask': 'Tiếp theo là gì?', 'say': 'Mở vòi, làm ướt hai bàn tay.', 'state': HAND('#cfe3ea')},
                  {'e': 'art:xa-phong', 'label': 'Xoa xà phòng', 'ask': 'Rồi sao nữa?', 'say': 'Xoa xà phòng lòng bàn tay, mu bàn tay, kẽ ngón tay.', 'state': HAND('#ffffff')},
                  {'e': 'art:giot-nuoc', 'label': 'Xả sạch', 'ask': 'Tiếp theo là gì?', 'say': 'Xả nước cho sạch hết bọt.', 'state': HAND('#e3f1f5')},
                  {'e': 'art:khan', 'label': 'Lau khô', 'ask': 'Bước cuối cùng là gì?', 'say': 'Lau khô tay bằng khăn sạch.', 'state': HAND('#fbe3bf')}],
           no='Chưa đến bước đó đâu.', done='Tay Lu sạch thơm rồi! Bé nhớ rửa tay trước khi ăn nhé.'),
  note='Hình đôi tay đổi màu là hình vẽ mã tạm; bản chính cần ảnh vẽ tay từng trạng thái (bẩn, ướt, có bọt, sạch).')

SF = [{'e': 'art:la', 'name': 'chiếc lá', 'floats': True, 'why': 'Chiếc lá nhẹ và mỏng nên nổi trên mặt nước.'},
      {'e': 'art:soi', 'name': 'viên sỏi', 'floats': False, 'why': 'Viên sỏi nặng so với độ lớn của nó nên chìm xuống đáy.'},
      {'e': 'art:khuc-go', 'name': 'khúc gỗ', 'floats': True, 'why': 'Gỗ nhẹ hơn nước nên khúc gỗ nổi.'},
      {'e': 'art:chia-khoa', 'name': 'chiếc chìa khóa', 'floats': False, 'why': 'Chìa khóa làm bằng kim loại, nặng nên chìm.'},
      {'e': 'art:bong', 'name': 'quả bóng', 'floats': True, 'why': 'Trong quả bóng có không khí nên bóng nổi.'},
      {'e': 'art:dong-xu', 'name': 'đồng xu', 'floats': False, 'why': 'Đồng xu bằng kim loại, nặng nên chìm xuống.'}]
SFT = dict(predict_q='Bé đoán xem {name} sẽ chìm hay nổi?', drop='Giờ bé thả vào chậu nước xem nhé.', saw_float='Nhìn kìa, {name} nổi trên mặt nước.', saw_sink='Nhìn kìa, {name} chìm xuống đáy.',
           guess_ok='Kết quả giống điều bé đoán.', guess_other='Kết quả khác điều bé đoán. Nhà khoa học cũng hay gặp như vậy đó.')
S('CC-19', 'Chìm hay nổi?', cc=['CC-19'], x=[27], program='Khoa học', group='Khám phá', engine='E11', mode='sinkfloat',
  methods=['M081', 'M082', 'M030'], goal='Đoán trước, thả vật vào nước, quan sát kết quả thật và nghe giải thích.',
  diff='4–5: 3 vật quen thuộc. 5–6: 5 vật, có vật dễ đoán nhầm (khúc gỗ to vẫn nổi).',
  l45=dict(skill_id='KP.KH.03', items=SF, rounds=3, intro=['Hôm nay mình làm nhà khoa học nhé.'], done='Bé làm thí nghiệm giỏi lắm!', **SFT),
  l56=dict(skill_id='KP.KH.03', items=SF, rounds=5, intro=['Hôm nay mình làm nhà khoa học. Bé đoán trước, rồi thả vào nước để xem kết quả nhé.'], done='Bé làm thí nghiệm giỏi lắm!', **SFT),
  note='Dự đoán không chấm đúng sai. Lời giải thích khoa học cần chuyên môn kiểm duyệt.')

S('CC-20', 'Tiếng gì sau tấm rèm?', cc=['CC-20'], x=[29], program='Âm nhạc', group='Âm nhạc', engine='E12', mode='identify',
  methods=['M091', 'M092'], goal='Nghe âm thanh và chọn đúng nhạc cụ.',
  diff='4–5: làm quen từng nhạc cụ trước, chọn 1 trong 2. 5–6: chọn 1 trong 4, không làm quen trước.',
  l45=dict(skill_id='KP.AN.D01', sounds=['trong', 'chuong', 'dan', 'xac-xo'], choices=2, rounds=3, explore=True, explore_say='Bé chạm từng nhạc cụ để nghe tiếng nhé.',
           names={'trong': 'cái trống', 'chuong': 'cái chuông', 'dan': 'đàn', 'xac-xo': 'cái xắc xô'}, q='Bé nghe xem tiếng gì sau tấm rèm nhé.', again='Bé nghe tiếp nhé.', no='Bé nghe lại nhé.', done='Bé có đôi tai thật tinh!'),
  l56=dict(skill_id='KP.AN.D01', sounds=['trong', 'chuong', 'dan', 'xac-xo'], choices=4, rounds=4,
           names={'trong': 'cái trống', 'chuong': 'cái chuông', 'dan': 'đàn', 'xac-xo': 'cái xắc xô'}, q='Bé nghe xem tiếng gì sau tấm rèm nhé.', again='Bé nghe tiếp nhé.', no='Bé nghe lại nhé.', done='Bé có đôi tai thật tinh!'),
  note='Âm nhạc cụ đang tổng hợp bằng trình duyệt; bản chính nên thu âm nhạc cụ thật.')

S('CC-21', 'Gõ trống theo Lu', cc=['CC-21'], x=[29], program='Âm nhạc', group='Âm nhạc', engine='E12', mode='rhythm',
  methods=['M093', 'M094'], goal='Nghe tiết tấu rồi gõ lại đúng số tiếng; 5–6 tuổi đúng cả nhịp ngắn dài.',
  diff='4–5: 2–3 tiếng, chỉ cần đúng số tiếng, có chấm nhìn. 5–6: có nghỉ, phải đúng nhịp ngắn dài, ẩn chấm.',
  l45=dict(skill_id='KP.AN.D05', patterns=['xx', 'xxx', 'x.x'], rounds=3, listen='Bé nghe Lu gõ nhé.', your_turn='Đến lượt bé gõ.', no='Mình nghe lại rồi gõ nhé.', oks=['Bé gõ giống Lu rồi!', 'Lần này bé gõ đúng rồi!'], done='Bé gõ trống hay lắm!'),
  l56=dict(skill_id='KP.AN.D05', patterns=['x.xx', 'xx.x', 'x.x.xx', 'xx.xx'], rounds=3, strict=True, hide_dots=True, listen='Bé nghe kỹ chỗ nghỉ nhé.', your_turn='Đến lượt bé gõ.', no='Mình nghe lại rồi gõ nhé.', oks=['Bé gõ đúng nhịp rồi!', 'Lần này bé gõ đúng nhịp rồi!'], done='Bé gõ trống hay lắm!'))

S('CC-22', 'Bạn Mi làm đổ tháp', cc=['CC-22'], x=[26], program='EQ và cảm xúc xã hội', group='EQ', engine='E10',
  methods=['M076', 'M077', 'M078', 'M079'], goal='Nhận ra cảm xúc của bạn và chọn cách phản hồi; nhiều cách đều được đón nhận.',
  diff='4–5: nhận ra cảm xúc (có đáp án) rồi chọn cách làm. 5–6: thêm câu hỏi vì sao bạn buồn và một lượt thứ hai.',
  l45=dict(skill_id='EQ.XH.04', bg='asset:BC-0002', start='a',
           nodes={'a': {'say': ['Lu và bạn Mi xếp tháp khối. Bạn Mi lỡ tay làm đổ tháp của Lu.'], 'items': [{'v': 'lu:buon', 'x': 50, 'y': 92, 'w': 34}], 'kind': 'hieu', 'q': 'Lu đang cảm thấy thế nào?', 'a': 0,
                         'choices': [{'e': 'face:buon', 'say': 'Lu buồn.', 'reply': ['Đúng rồi, Lu buồn vì tháp bị đổ.'], 'next': 'b'}, {'e': 'face:vui', 'say': 'Lu vui.'}], 'no': 'Bé nhìn khuôn mặt Lu nhé.'},
                  'b': {'say': ['Bạn Mi cũng lo lắng lắm.'], 'q': 'Nếu là bé, bé sẽ nói gì với bạn Mi?', 'style': 'wide',
                        'choices': [{'t': 'Không sao, mình xếp lại nhé.', 'say': 'Không sao, mình xếp lại nhé.', 'reply': ['Lu thấy nhẹ lòng hơn. Hai bạn cùng xếp lại tháp.'], 'tot': True, 'next': 'end'},
                                    {'t': 'Lần sau bạn cẩn thận nhé.', 'say': 'Lần sau bạn cẩn thận nhé.', 'reply': ['Bạn Mi gật đầu: mình sẽ cẩn thận hơn.'], 'next': 'end'}]},
                  'end': {'say': ['Khi bạn lỡ làm sai, mình nói nhẹ nhàng thì cả hai đều vui hơn.'], 'end': True}}),
  l56=dict(skill_id='EQ.CX.13', bg='asset:BC-0002', start='a',
           nodes={'a': {'say': ['Lu và bạn Mi xếp tháp khối. Bạn Mi lỡ tay làm đổ tháp của Lu.'], 'items': [{'v': 'lu:buon', 'x': 50, 'y': 92, 'w': 34}], 'kind': 'hieu', 'q': 'Vì sao Lu buồn?', 'a': 1, 'style': 'wide',
                         'choices': [{'t': 'Vì Lu đói bụng.', 'say': 'Vì Lu đói bụng.'}, {'t': 'Vì tháp Lu xếp bị đổ.', 'say': 'Vì tháp Lu xếp bị đổ.', 'reply': ['Đúng rồi. Lu xếp lâu lắm mới được cái tháp.'], 'next': 'b'}, {'t': 'Vì trời mưa.', 'say': 'Vì trời mưa.'}], 'no': 'Bé nghe lại câu chuyện nhé.'},
                  'b': {'say': ['Bạn Mi đứng im, mặt đỏ lên vì lo.'], 'q': 'Bé sẽ làm gì?', 'style': 'wide',
                        'choices': [{'t': 'Rủ bạn Mi cùng xếp lại.', 'say': 'Rủ bạn Mi cùng xếp lại.', 'reply': ['Hai bạn cùng xếp, tháp mới còn cao hơn.'], 'tot': True, 'next': 'c'},
                                    {'t': 'Nói cho bạn biết mình buồn.', 'say': 'Nói cho bạn biết mình buồn.', 'reply': ['Bạn Mi xin lỗi Lu. Nói ra cảm xúc giúp bạn hiểu mình.'], 'next': 'c'},
                                    {'t': 'Hít thở thật sâu cho bình tĩnh.', 'say': 'Hít thở thật sâu cho bình tĩnh.', 'reply': ['Lu thấy dễ chịu hơn rồi.'], 'next': 'c'}]},
                  'c': {'say': ['Hôm sau, bạn Bin làm rơi bút chì của Lu.'], 'q': 'Lần này Lu nên nói gì?', 'style': 'wide',
                        'choices': [{'t': 'Không sao, bạn nhặt giúp mình nhé.', 'say': 'Không sao, bạn nhặt giúp mình nhé.', 'reply': ['Bạn Bin nhặt bút và cảm ơn Lu.'], 'tot': True, 'next': 'end'},
                                    {'t': 'Bạn hư quá!', 'say': 'Bạn hư quá!', 'reply': ['Bạn Bin buồn lắm. Mình thử nói nhẹ nhàng hơn nhé.'], 'tot': False, 'next': 'end'}]},
                  'end': {'say': ['Hiểu cảm xúc của bạn và nói nhẹ nhàng giúp mọi người vui vẻ bên nhau.'], 'end': True}}),
  note='Câu hỏi cảm xúc có đáp án; câu hỏi cách làm là lựa chọn mở, mọi lựa chọn đều được Lu đón nhận và giải thích.')

S('CC-23', 'Lu đi chơi gặp mưa', cc=['CC-23'], x=[2], program='Phát triển ngôn ngữ tiếng Việt', group='Tiếng Việt', engine='E10',
  methods=['M007', 'M008', 'M009'], goal='Nghe chuyện từng cảnh, chọn diễn biến và đoán chuyện tiếp theo.',
  diff='4–5: một lựa chọn, hai kết thúc. 5–6: thêm câu đoán và câu hỏi hiểu chuyện.',
  l45=dict(skill_id='TD.NQ.02', bg='asset:BC-0002', start='a',
           nodes={'a': {'say': ['Lu chuẩn bị sang nhà bà chơi. Bầu trời có nhiều mây đen.'], 'items': [{'v': 'lu:nhin-xa', 'x': 50, 'y': 92, 'w': 34}], 'q': 'Lu nên mang theo gì?',
                         'choices': [{'e': 'art:o', 'say': 'Mang chiếc ô.', 'reply': ['Lu cầm chiếc ô rồi lên đường.'], 'next': 'o'}, {'e': 'art:bong', 'say': 'Mang quả bóng.', 'reply': ['Lu ôm quả bóng rồi lên đường.'], 'next': 'b'}]},
                  'o': {'say': ['Đi được một đoạn thì trời đổ mưa. Lu bung ô ra, không bị ướt chút nào.', 'Lu tới nhà bà, vừa khô ráo vừa vui.'], 'items': [{'v': 'art:o', 'x': 50, 'y': 88, 'w': 30}], 'end': True},
                  'b': {'say': ['Đi được một đoạn thì trời đổ mưa. Lu ướt hết cả áo.', 'Bà lấy khăn lau cho Lu. Lần sau trời có mây đen, Lu sẽ nhớ mang ô.'], 'items': [{'v': 'art:mua', 'x': 50, 'y': 80, 'w': 34}], 'end': True}}),
  l56=dict(skill_id='TD.NQ.02', bg='asset:BC-0002', start='a',
           nodes={'a': {'say': ['Lu chuẩn bị sang nhà bà chơi. Bầu trời có nhiều mây đen.'], 'items': [{'v': 'lu:nhin-xa', 'x': 50, 'y': 92, 'w': 34}], 'kind': 'du-doan', 'q': 'Bé đoán xem chuyện gì sắp xảy ra?', 'style': 'wide',
                         'choices': [{'t': 'Trời sắp mưa.', 'say': 'Trời sắp mưa.', 'reply': ['Bé đoán theo đám mây đen. Mình xem tiếp nhé.'], 'next': 'b'}, {'t': 'Trời sắp nắng to.', 'say': 'Trời sắp nắng to.', 'reply': ['Mình xem tiếp nhé.'], 'next': 'b'}]},
                  'b': {'say': ['Lu nhìn đám mây đen và nghĩ một lúc.'], 'q': 'Lu nên mang theo gì?',
                        'choices': [{'e': 'art:o', 'say': 'Mang chiếc ô.', 'reply': ['Lu cầm chiếc ô rồi lên đường.'], 'next': 'o'}, {'e': 'art:bong', 'say': 'Mang quả bóng.', 'reply': ['Lu ôm quả bóng rồi lên đường.'], 'next': 'x'}]},
                  'o': {'say': ['Trời đổ mưa. Lu bung ô ra, không bị ướt chút nào.'], 'next': 'q', 'button': 'Nghe tiếp'},
                  'x': {'say': ['Trời đổ mưa. Lu ướt hết cả áo. Bà lấy khăn lau cho Lu.'], 'next': 'q', 'button': 'Nghe tiếp'},
                  'q': {'say': ['Mình cùng nhớ lại câu chuyện nhé.'], 'kind': 'hieu', 'q': 'Vì sao Lu biết trời sắp mưa?', 'a': 0, 'style': 'wide', 'no': 'Bé nhớ lại bầu trời lúc đầu nhé.',
                        'choices': [{'t': 'Vì có nhiều mây đen.', 'say': 'Vì có nhiều mây đen.', 'reply': ['Đúng rồi. Mây đen là dấu hiệu trời sắp mưa.'], 'next': 'end'}, {'t': 'Vì Lu đói bụng.', 'say': 'Vì Lu đói bụng.'}, {'t': 'Vì bà gọi điện.', 'say': 'Vì bà gọi điện.'}]},
                  'end': {'say': ['Trước khi ra ngoài, mình nhìn bầu trời để chuẩn bị nhé.'], 'end': True}}))

S('CC-24', 'Trang trí vườn hoa', cc=['CC-24'], x=[30], program='Sáng tạo', group='Nghệ thuật', engine='E14', mode='sticker',
  methods=['M043', 'M098'], goal='Kéo hình dán để tự trang trí khu vườn theo ý mình.',
  diff='4–5: dán ít nhất 3 hình. 5–6: dán ít nhất 5 hình, nhiều lựa chọn hơn.',
  l45=dict(skill_id='KP.ST.D01', bg='asset:BC-0003', stickers=['art:hoa', 'art:buom', 'art:ong', 'art:mat-troi', 'art:may'], min=3, intro=['Vườn đậu còn trống. Bé kéo hình dán để trang trí vườn nhé. Xong bé bấm Xong rồi.'], done='Khu vườn của bé thật đẹp! Lu cất vào tủ tranh rồi.'),
  l56=dict(skill_id='KP.ST.D01', bg='asset:BC-0003', stickers=['art:hoa', 'art:buom', 'art:ong', 'art:mat-troi', 'art:may', 'art:chim', 'art:cau-vong', 'art:cay', 'art:oc'], min=5, intro=['Bé hãy làm khu vườn trong mơ của bé. Kéo thật nhiều hình dán vào nhé. Xong bé bấm Xong rồi.'], done='Khu vườn trong mơ của bé thật đẹp! Lu cất vào tủ tranh rồi.'))

S('CC-25', 'Vòng tròn biến thành gì?', cc=['CC-25'], x=[16], program='Tưởng tượng', group='Nghệ thuật', engine='E14', mode='draw',
  methods=['M041', 'M045', 'M042'], goal='Hình có sẵn biến thành tranh khi bé tô theo nét đứt; tô xong bé vẽ thêm tùy thích. Không hỏi lại bé đã vẽ gì (tam 26/11).',
  diff='4–5: vòng tròn thành ông mặt trời. 5–6: hình tam giác thành ngôi nhà, nhiều nét hơn.',
  l45=dict(skill_id='TD.TTg.02', base='<circle cx="200" cy="150" r="70"/>', trace='<path d="M200 60 V35 M200 240 V265 M110 150 H85 M290 150 H315 M137 87 L118 68 M263 87 L282 68 M137 213 L118 232 M263 213 L282 232"/><circle cx="175" cy="135" r="6"/><circle cx="225" cy="135" r="6"/><path d="M170 170 Q200 195 230 170"/>', intro=['Lu vẽ một vòng tròn. Bé tô theo nét đứt để vòng tròn biến thành ông mặt trời nhé.'], min_strokes=2,
           done='Vòng tròn đã thành ông mặt trời rồi! Bé giỏi quá.'),
  l56=dict(skill_id='TD.TTg.02', base='<path d="M200 70 L270 200 L130 200 Z"/>', trace='<path d="M145 200 V265 H255 V200"/><path d="M185 265 V225 H215 V265"/><path d="M225 215 h22 v20 h-22 Z"/><path d="M60 265 H340"/><path d="M235 105 V75 H255 V140"/>', intro=['Lu vẽ một hình tam giác. Bé tô theo nét đứt để biến nó thành ngôi nhà nhé. Tô xong bé vẽ thêm gì cũng được.'], min_strokes=4,
           done='Hình tam giác đã thành ngôi nhà xinh rồi! Bé giỏi quá.'),
  note='Không chấm đúng sai; nét đứt chỉ để bé tập tô, tô lệch vẫn được.')

S('CC-26', 'Đi tìm quanh nhà', cc=['CC-26'], x=[25], program='Vận động và phối hợp tay mắt', group='Vận động', engine='E15', mode='do',
  methods=['M090', 'M100', 'M099'], goal='Rời màn hình, tìm đồ vật thật trong nhà cùng bố mẹ rồi quay lại báo Lu.',
  diff='4–5: tìm 3 đồ vật màu đỏ. 5–6: tìm 3 đồ vật hình tròn và xếp từ nhỏ đến lớn.',
  l45=dict(skill_id='KP.VD.01', lu='kham-pha', intro=['Mình rời màn hình một chút nhé.'], task='Bé đi tìm trong nhà ba đồ vật màu đỏ, mang lại cho bố mẹ xem. Xong rồi bé bấm nút nhé.', button='Bé tìm xong rồi!', seconds=60, evidence='tiep-xuc'),
  l56=dict(skill_id='KP.VD.01', lu='kham-pha', intro=['Mình rời màn hình một chút nhé.'], task='Bé đi tìm trong nhà ba đồ vật hình tròn, rồi xếp chúng từ nhỏ đến lớn. Bố mẹ xem giúp bé nhé. Xong rồi bé bấm nút.', button='Bé xếp xong rồi!', seconds=90, evidence='tiep-xuc'),
  note='Hoạt động ngoài màn hình chỉ ghi đã tham gia; bố mẹ xác nhận.')

# ===================================================================== Mẫu nghiệm thu bổ sung (mục X)
HEN_PARTS = [
    {'id': 'mao', 'name': 'cái mào', 'en': 'comb', 'say': 'Đây là cái mào đỏ trên đầu gà.'},
    {'id': 'mo', 'name': 'cái mỏ', 'en': 'beak', 'say': 'Đây là cái mỏ. Gà dùng mỏ để mổ thóc.'},
    {'id': 'canh', 'name': 'đôi cánh', 'en': 'wing', 'say': 'Đây là đôi cánh. Gà vỗ cánh khi chạy nhanh.'},
    {'id': 'chan', 'name': 'đôi chân', 'en': 'leg', 'say': 'Đây là đôi chân. Gà dùng chân để bới đất tìm sâu.'},
    {'id': 'mat', 'name': 'con mắt', 'en': 'eye', 'say': 'Đây là con mắt. Gà nhìn thấy hạt thóc rất nhỏ.'},
    {'id': 'duoi', 'name': 'cái đuôi', 'en': 'tail', 'say': 'Đây là cái đuôi có nhiều lông.'},
]
S('MX-01', 'Lu kể về gà mái', x=[1], program='Kiến thức thế giới', group='Khám phá', engine='E00', mode='teach',
  methods=['M001', 'M003', 'M005', 'M039'], goal='Nghe Lu giảng về các bộ phận của con gà, tự chạm khám phá, rồi trả lời câu hỏi.',
  diff='4–5: 4 bộ phận, hỏi 2 câu. 5–6: 6 bộ phận kèm từ tiếng Anh, hỏi 4 câu.',
  l45=dict(skill_id='TD.QH.02', big='hen', hook=['Ai đang kêu cục ta cục tác sau tấm vải nhỉ?'], intro=['Đây là cô gà mái. Lu chỉ cho bé cái mào trước nhé.'], explore='Giờ bé chạm vào từng chỗ sáng để nghe Lu kể nhé.',
           parts=[p for p in HEN_PARTS if p['id'] in ('mao', 'mo', 'canh', 'chan')], check={'q': 'Bé chạm vào {name} của gà mái.', 'ask': ['mo', 'chan'], 'no': 'Bé nhìn lại con gà nhé.'}, done='Bé đã biết nhiều về cô gà mái rồi!'),
  l56=dict(skill_id='TD.QH.02', big='hen', hook=['Ai đang kêu cục ta cục tác sau tấm vải nhỉ?'], intro=['Đây là cô gà mái. Lu chỉ cho bé cái mào trước nhé.'], explore='Giờ bé chạm vào từng chỗ sáng để nghe Lu kể nhé.',
           parts=HEN_PARTS, check={'q': 'Bé chạm vào {name} của gà mái.', 'ask': ['mo', 'canh', 'mat', 'duoi'], 'no': 'Bé nhìn lại con gà nhé.'}, done='Bé đã biết nhiều về cô gà mái rồi!'))

DIFF_OBJS = [{'v': 'art:bong:do', 'x': 18, 'y': 92, 'w': 13, 'recolor': ['xanh', 'vang']}, {'v': 'art:meo:#f0a050', 'x': 40, 'y': 90, 'w': 17, 'recolor': ['#9a9a9a', '#fbf3e6']},
             {'v': 'art:hoa:#e48a76', 'x': 62, 'y': 84, 'w': 11, 'recolor': ['#f6c85f', '#a58bc9']}, {'v': 'art:mu:vang', 'x': 80, 'y': 90, 'w': 13, 'recolor': ['do', 'xanh']},
             {'v': 'art:chim:#e98b9a', 'x': 30, 'y': 34, 'w': 10, 'recolor': ['#6aa6c8', '#f6c85f']}, {'v': 'art:mat-troi', 'x': 84, 'y': 26, 'w': 12}, {'v': 'art:dieu:#e98b9a', 'x': 58, 'y': 30, 'w': 11, 'recolor': ['#6aa6c8', '#8fae3e']}]
S('MX-02', 'Hai bức tranh sân nhà', x=[3], program='Quan sát', group='Tư duy', engine='E06', mode='diff',
  methods=['M011', 'M015'], goal='So sánh hai tranh và chạm vào chỗ khác nhau (mất vật, đổi màu).',
  diff='4–5: 2 điểm khác. 5–6: 4 điểm khác.',
  l45=dict(skill_id='TD.QS.03', n=2, rounds=1, scenes=[{'bg': 'asset:BC-0002', 'objs': DIFF_OBJS}], intro=['Hai bức tranh này gần giống nhau.'], q='Bé tìm hai chỗ khác nhau và chạm vào nhé.', hint='Bé nhìn từng đồ vật ở hai tranh nhé.', done='Bé tìm ra hết chỗ khác nhau rồi!'),
  l56=dict(skill_id='TD.QS.03', n=4, rounds=1, scenes=[{'bg': 'asset:BC-0002', 'objs': DIFF_OBJS}], intro=['Hai bức tranh này gần giống nhau.'], q='Bé tìm bốn chỗ khác nhau và chạm vào nhé.', hint='Bé nhìn từng đồ vật ở hai tranh nhé.', done='Bé tìm ra hết chỗ khác nhau rồi!'))

S('MX-03', 'Vật nào biến mất?', x=[8], program='Ghi nhớ', group='Tư duy', engine='E06', mode='vanish',
  methods=['M023', 'M022'], goal='Nhìn và nhớ các vật, sau khi khăn che lại thì tìm vật đã biến mất.',
  diff='4–5: 3 vật, mất 1. 5–6: 5 vật, mất 2.',
  l45=dict(skill_id='TD.TN.05', pool=['art:tao', 'art:ca-rot', 'art:la', 'art:hoa', 'art:sao', 'art:bong-bay', 'art:mu', 'art:giay'], show=3, missing=1, choices=3, look_ms=4000, rounds=2,
           intro=['Bé nhìn thật kỹ các đồ vật trên khay nhé. Lu sẽ che khăn lại.'], q='Vật nào đã biến mất?', again='Mình chơi thêm lượt nữa. Bé nhìn kỹ nhé.', look_again='Bé có thể bấm Xem lại.', done='Bé nhớ giỏi lắm!'),
  l56=dict(skill_id='TD.TN.05', pool=['art:tao', 'art:ca-rot', 'art:la', 'art:hoa', 'art:sao', 'art:bong-bay', 'art:mu', 'art:giay', 'art:sach', 'art:ly'], show=5, missing=2, choices=4, look_ms=5000, rounds=2,
           intro=['Bé nhìn thật kỹ các đồ vật trên khay nhé. Lần này có hai vật biến mất.'], q='Hai vật nào đã biến mất?', again='Mình chơi thêm lượt nữa. Bé nhìn kỹ nhé.', look_again='Bé có thể bấm Xem lại.', done='Bé nhớ giỏi lắm!'))

S('MX-04', 'Bông hoa biết hát', x=[9], program='Ghi nhớ', group='Tư duy', engine='E12', mode='seq',
  methods=['M024', 'M025'], goal='Xem và nghe chuỗi hoa sáng lên kèm nốt nhạc, rồi chạm lại đúng thứ tự.',
  diff='4–5: chuỗi 2–3, 3 bông hoa. 5–6: chuỗi 3–5, 4 bông hoa.',
  l45=dict(skill_id='TD.TN.08', items=[{'e': 'art:hoa:#e48a76', 'name': 'hoa đỏ', 's': 'note:C5'}, {'e': 'art:hoa:#f6c85f', 'name': 'hoa vàng', 's': 'note:E5'}, {'e': 'art:hoa:#a58bc9', 'name': 'hoa tím', 's': 'note:G5'}],
           lengths=[2, 3], intro=['Mỗi bông hoa hát một nốt nhạc.'], listen='Bé xem hoa nào sáng lên nhé.', again='Chuỗi dài hơn rồi. Bé xem nhé.', no='Mình xem lại nhé.', oks=['Bé nhớ đúng rồi!'], done='Bé nhớ giỏi lắm!'),
  l56=dict(skill_id='TD.TN.08', items=[{'e': 'art:hoa:#e48a76', 'name': 'hoa đỏ', 's': 'note:C5'}, {'e': 'art:hoa:#f6c85f', 'name': 'hoa vàng', 's': 'note:E5'}, {'e': 'art:hoa:#a58bc9', 'name': 'hoa tím', 's': 'note:G5'}, {'e': 'art:hoa:#6aa6c8', 'name': 'hoa xanh', 's': 'note:C6'}],
           lengths=[3, 4, 5], intro=['Mỗi bông hoa hát một nốt nhạc.'], listen='Bé xem hoa nào sáng lên nhé.', again='Chuỗi dài hơn rồi. Bé xem nhé.', no='Mình xem lại nhé.', oks=['Bé nhớ đúng rồi!'], done='Bé nhớ giỏi lắm!'))

BEADS = [{'e': 'art:hinh-tron:#e0705a', 'name': 'đỏ'}, {'e': 'art:hinh-tron:#6aa6c8', 'name': 'xanh dương'}, {'e': 'art:hinh-tron:#f6c85f', 'name': 'vàng'}, {'e': 'art:hinh-tron:#8fae3e', 'name': 'xanh lá'}]
S('MX-05', 'Chuỗi hạt của Lu', x=[10], program='Tư duy logic', group='Tư duy', engine='E04', mode='pattern',
  methods=['M026'], goal='Nhìn quy luật lặp lại và chọn hình tiếp theo.',
  diff='4–5: quy luật AB, AAB. 5–6: ABC, ABB, AABB, hình khác nhau cả màu và dạng.',
  l45=dict(skill_id='TD.LG.03', pool=BEADS, patterns=['AB', 'AAB'], length=6, rounds=3, intro=['Lu xâu chuỗi hạt theo quy luật.'], q='Hạt tiếp theo là hạt nào?', no='Bé nhìn lại cả hàng hạt nhé.', ok='Đúng rồi! Quy luật là {seq}, rồi lặp lại.'),
  l56=dict(skill_id='TD.LG.03', pool=BEADS + [{'e': 'art:hinh-vuong:#e0705a', 'name': 'vuông đỏ'}, {'e': 'art:hinh-tam-giac:#6aa6c8', 'name': 'tam giác xanh'}], patterns=['ABC', 'ABB', 'AABB'], length=7, rounds=3,
           intro=['Lu xâu chuỗi hạt theo quy luật khó hơn.'], q='Hạt tiếp theo là hạt nào?', no='Bé nhìn lại cả hàng hạt nhé.', ok='Đúng rồi! Quy luật là {seq}, rồi lặp lại.'))

def CL(e, say, *tags): return {'e': e, 'say': say, 'tags': list(tags)}
S('MX-06', 'Đoán xem Lu nghĩ con gì', x=[12], program='Tư duy logic', group='Tư duy', engine='E01', mode='clue',
  methods=['M029'], goal='Nghe từng manh mối, loại dần hình không khớp để tìm ra đáp án duy nhất.',
  diff='4–5: 2 manh mối, 3 hình. 5–6: 3 manh mối, 5 hình.',
  l45=dict(skill_id='TD.LG.13', intro=['Lu đang nghĩ về một con vật. Mỗi lần Lu nói một manh mối, bé chạm vào con vật KHÔNG đúng để loại nó nhé.'],
           puzzles=[{'q': 'Con vật Lu nghĩ là con gì?', 'opts': [CL('art:ca', 'Con cá.', 'nuoc'), CL('art:chim', 'Con chim.', 'bay', 'canh'), CL('art:meo', 'Con mèo.', 'bon-chan')],
                     'clues': [{'not': 'nuoc', 'say': 'Con vật này không sống dưới nước.'}, {'has': 'canh', 'say': 'Con vật này có cánh.'}], 'ok': 'Đúng rồi, Lu nghĩ về con chim.'},
                    {'q': 'Lần này Lu nghĩ về con gì?', 'opts': [CL('art:ga', 'Con gà.', 'canh', 'hai-chan'), CL('art:ech', 'Con ếch.', 'nuoc', 'nhay'), CL('art:tho', 'Con thỏ.', 'bon-chan', 'nhay')],
                     'clues': [{'has': 'nhay', 'say': 'Con vật này nhảy rất giỏi.'}, {'not': 'nuoc', 'say': 'Con vật này không sống dưới nước.'}], 'ok': 'Đúng rồi, Lu nghĩ về con thỏ.'}],
           rounds=2, done='Bé suy luận giỏi lắm!'),
  l56=dict(skill_id='TD.LG.13', intro=['Lu đang nghĩ về một con vật. Mỗi lần Lu nói một manh mối, bé chạm vào con vật KHÔNG đúng để loại nó nhé.'],
           puzzles=[{'q': 'Con vật Lu nghĩ là con gì?', 'opts': [CL('art:ca', 'Con cá.', 'nuoc'), CL('art:chim', 'Con chim.', 'bay', 'canh', 'hai-chan'), CL('art:meo', 'Con mèo.', 'bon-chan'), CL('art:ga', 'Con gà.', 'canh', 'hai-chan'), CL('art:buom', 'Con bướm.', 'bay', 'canh')],
                     'clues': [{'has': 'canh', 'say': 'Con vật này có cánh.'}, {'has': 'hai-chan', 'say': 'Con vật này có hai chân.'}, {'not': 'bay', 'say': 'Con vật này không bay cao được.'}], 'ok': 'Đúng rồi, Lu nghĩ về con gà.'},
                    {'q': 'Lần này Lu nghĩ về con gì?', 'opts': [CL('art:ech', 'Con ếch.', 'nuoc', 'nhay'), CL('art:tho', 'Con thỏ.', 'bon-chan', 'nhay'), CL('art:vit', 'Con vịt.', 'nuoc', 'canh'), CL('art:ong', 'Con ong.', 'canh', 'bay'), CL('art:oc', 'Con ốc sên.', 'cham')],
                     'clues': [{'not': 'canh', 'say': 'Con vật này không có cánh.'}, {'has': 'nhay', 'say': 'Con vật này nhảy rất giỏi.'}, {'has': 'nuoc', 'say': 'Con vật này thích sống gần nước.'}], 'ok': 'Đúng rồi, Lu nghĩ về con ếch.'}],
           rounds=2, done='Bé suy luận giỏi lắm!'))

S('MX-07', 'Đĩa táo của Lu', x=[19], program='Toán tư duy', group='Toán', engine='E11', mode='tray',
  methods=['M052', 'M053', 'M055'], goal='Tự tay thêm, bớt, gộp, tách đồ vật trên đĩa rồi chọn kết quả.',
  diff='4–5: thêm và bớt trong phạm vi 5. 5–6: gộp và tách trong phạm vi 10.',
  l45=dict(skill_id='TO.TG.05', obj='art:tao', src='art:gio', max=5, intro=['Lu có một đĩa táo.'],
           tasks=[{'type': 'them', 'start': 2, 'add': 1, 'say': ['Trên đĩa có hai quả táo.'], 'act': 'Bé chạm vào giỏ để lấy thêm một quả.', 'q': 'Bây giờ trên đĩa có mấy quả táo?', 'ok': 'Đúng rồi, hai thêm một là ba.'},
                  {'type': 'them', 'start': 3, 'add': 2, 'say': ['Trên đĩa có ba quả táo.'], 'act': 'Bé chạm vào giỏ để lấy thêm hai quả.', 'q': 'Bây giờ trên đĩa có mấy quả táo?', 'ok': 'Đúng rồi, ba thêm hai là năm.'},
                  {'type': 'bot', 'start': 4, 'take': 1, 'say': ['Trên đĩa có bốn quả táo.'], 'act': 'Lu ăn một quả. Bé chạm vào một quả để Lu ăn nhé.', 'q': 'Trên đĩa còn mấy quả táo?', 'ok': 'Đúng rồi, bốn bớt một còn ba.'}],
           no='Bé đếm lại số táo trên đĩa nhé.'),
  l56=dict(skill_id='TO.TG.04', obj='art:tao', max=10, intro=['Lu có mấy đĩa táo.'],
           tasks=[{'type': 'gop', 'a': 4, 'b': 3, 'say': ['Đĩa này có bốn quả, đĩa kia có ba quả.'], 'act': 'Bé bấm Gộp lại để dồn hai đĩa nhé.', 'q': 'Gộp lại có tất cả mấy quả?', 'ok': 'Đúng rồi, bốn và ba là bảy.'},
                  {'type': 'tach', 'total': 10, 'a': 6, 'la': 'ngoài', 'lb': 'trong hộp', 'say': ['Lu có mười quả táo. Sáu quả ở ngoài, còn lại Lu cất vào hộp.'], 'q': 'Trong hộp có mấy quả táo?', 'ok': 'Đúng rồi, mười tách ra sáu và bốn.'},
                  {'type': 'bot', 'start': 8, 'take': 3, 'say': ['Trên đĩa có tám quả táo.'], 'act': 'Lu chia cho bạn ba quả. Bé chạm vào ba quả nhé.', 'q': 'Trên đĩa còn mấy quả táo?', 'ok': 'Đúng rồi, tám bớt ba còn năm.'}],
           no='Bé đếm lại thật kỹ nhé.'))

S('MX-08', 'Tập tô chữ số', x=[22], program='Tập tô chữ số và đường nét', group='Toán', engine='E13', mode='trace',
  methods=['M063'], goal='Tô chữ số theo nét chấm đúng điểm bắt đầu và chiều nét.',
  diff='4–5: số 1, 2, 3 có mẫu và hỗ trợ. 5–6: số 5, 8, 9 thêm bước tự tô.',
  l45=dict(skill_id='TO.SO.01', glyphs=['1', '2', '3'], phases=['mau', 'ho-tro'], intro=['Mình cùng tô số nhé. Bé xem Lu tô trước.'], done='Bé tô {name} đẹp lắm!'),
  l56=dict(skill_id='TO.SO.02', glyphs=['5', '8', '9'], phases=['mau', 'ho-tro', 'doc-lap'], intro=['Hôm nay mình tô số năm, số tám và số chín. Bé xem Lu tô, tô cùng Lu, rồi tự tô nhé.'], done='Bé tô {name} đẹp lắm!'),
  note='Dữ liệu nét số là bản nháp, cần chuyên môn kiểm tra.')

S('MX-09', 'Listen and touch', x=[24], program='Tiếng Anh', group='Tiếng Anh', engine='E01', mode='listen',
  methods=['M071'], goal='Nghe từ tiếng Anh và chạm đúng hình.',
  diff='4–5: 3 con vật quen thuộc. 5–6: 5 con vật, có từ dài hơn.',
  l45=dict(skill_id='EN.EN.07', rounds=3, words=[{'w': 'Cat.', 'e': 'art:meo', 'ok': 'Yes! Cat!'}, {'w': 'Fish.', 'e': 'art:ca', 'ok': 'Yes! Fish!'}, {'w': 'Bird.', 'e': 'art:chim', 'ok': 'Yes! Bird!'}]),
  l56=dict(skill_id='EN.EN.37', rounds=5, words=[{'w': 'Cat.', 'e': 'art:meo', 'ok': 'Yes! Cat!'}, {'w': 'Duck.', 'e': 'art:vit', 'ok': 'Yes! Duck!'}, {'w': 'Chicken.', 'e': 'art:ga', 'ok': 'Yes! Chicken!'},
                                             {'w': 'Rabbit.', 'e': 'art:tho', 'ok': 'Yes! Rabbit!'}, {'w': 'Butterfly.', 'e': 'art:buom', 'ok': 'Yes! Butterfly!'}, {'w': 'Frog.', 'e': 'art:ech', 'ok': 'Yes! Frog!'}]))

S('MX-10', 'Put the cat in the box', x=[25], program='Tiếng Anh', group='Tiếng Anh', engine='E11', mode='place',
  methods=['M072'], goal='Nghe câu tiếng Anh và làm đúng hành động (đặt vật vào, lên, dưới).',
  diff='4–5: in và on. 5–6: in, on, under, nghe hai câu liền nhau.',
  l45=dict(skill_id='EN.EN.50', anchor='art:hop', intro=['Mình nghe tiếng Anh và làm theo nhé.'], rounds=3,
           tasks=[{'e': 'art:meo', 'zone': 'trong', 'say': 'Put the cat in the box.', 'ok': 'Great! The cat is in the box.'}, {'e': 'art:bong', 'zone': 'tren', 'say': 'Put the ball on the box.', 'ok': 'Great! The ball is on the box.'},
                  {'e': 'art:sach', 'zone': 'tren', 'say': 'Put the book on the box.', 'ok': 'Great! The book is on the box.'}, {'e': 'art:giay', 'zone': 'trong', 'say': 'Put the shoe in the box.', 'ok': 'Great! The shoe is in the box.'}],
           no='Bé nghe lại nhé.', done='Well done!'),
  l56=dict(skill_id='EN.EN.50', anchor='art:hop', intro=['Mình nghe tiếng Anh và làm theo nhé. Lần này có hai câu liền nhau.'], rounds=2, per=2, both='Listen to both.',
           tasks=[{'e': 'art:meo', 'zone': 'trong', 'say': 'Put the cat in the box.'}, {'e': 'art:bong', 'zone': 'tren', 'say': 'Put the ball on the box.'}, {'e': 'art:giay', 'zone': 'duoi', 'say': 'Put the shoe under the box.'}, {'e': 'art:sach', 'zone': 'duoi', 'say': 'Put the book under the box.'}],
           no='Bé nghe lại nhé.', done='Well done!'))

S('MX-11', 'Nhìn nhanh, nhớ số', x=[17], program='Chữ số', group='Toán', engine='E01', mode='flash',
  methods=['M047', 'M046'], goal='Nhìn nhóm vật trong chốc lát rồi chọn số lượng theo trí nhớ (cách 45, có nút Xem lại).',
  diff='4–5: 2–5 vật, xem 2,5 giây. 5–6: 11–20 trên khung mười, xem 3,5 giây.',
  l45=dict(skill_id='TO.DEM.01', objs=['art:tao', 'art:hoa', 'art:sao'], pool=[2, 3, 4, 5], words=VI_NUM[:6], rounds=3, show_ms=2500, intro=['Lu cho bé nhìn thật nhanh rồi che lại nhé.'], look='Bé nhìn kỹ nhé.', q='Có mấy cái?', ok='Đúng rồi! Có {word} cái.', no='Bé có thể bấm Xem lại.'),
  l56=dict(skill_id='TO.SO.05', objs=['art:tao'], ten_frame=True, pool=[11, 12, 13, 14, 15, 16, 17, 18, 19, 20], words=VI_NUM, rounds=3, show_ms=3500, intro=['Mỗi khung có mười ô. Bé nhìn nhanh rồi đoán số nhé.'], look='Bé nhìn kỹ nhé.', q='Có tất cả mấy chấm?', ok='Đúng rồi! Có {word} chấm.', no='Một khung đầy là mười. Bé có thể bấm Xem lại.'))

# ===================================================================== Mở rộng phương pháp giáo dục (tam 26/11 16:26)
# 12 mẫu mới MT-01..MT-12 bù chỗ còn thiếu trong 20 mẫu đại diện; 8 mẫu còn lại dùng lại mẫu đã có (REP20 bên dưới).
# pp = mã phương pháp (content/lab/methodology.json), nl = năng lực nhận thức NL01–NL18, mon = vùng Montessori và loại A/B/C.
# Không gắn nhãn não trái/não phải; không hứa tăng IQ. Montessori ở đây là "lấy cảm hứng", không phải chương trình Montessori chuẩn.
def BLK(s, nau=False): return f'<span class="blk{" nau" if nau else ""}" style="--s:{s}"></span>'
def SW(c): return f'<span class="sw" style="background:{c}"></span>'
def ROD(n, u=16): return f'<span class="rod" style="--n:{n};--u:{u}px"></span>'
def RODS(*ns, u=16): return '<span class="rods">' + ''.join(ROD(n, u) for n in ns) + '</span>'
def TF(n, cells=10): return '<span class="tf">' + ''.join(f'<i class="{"on" if i < n else ""}"></i>' for i in range(cells)) + '</span>'
def SYMG(on, rows, cols, q=False): return f'<span class="sym{" q" if q else ""}" style="--c:{cols}">' + ''.join(f'<i class="{"on" if (r, c) in on else ""}"></i>' for r in range(rows) for c in range(cols)) + '</span>'
def SYM_ITEM(left, rows, cols, other, q, ok):
    """Nửa trái + đường gương + nửa phải trống; đáp án đúng là hình lật gương, nhiễu là hình chép y nguyên (không lật) và một hình khác."""
    mirror = {(r, cols - 1 - c) for r, c in left}
    assert mirror != set(left), 'nửa trái phải không tự đối xứng, nếu không hình chép trùng đáp án'
    show = f'<span class="sym-wrap">{SYMG(left, rows, cols)}<span class="mid"></span>{SYMG(set(), rows, cols, True)}</span>'
    return dict(q=q, show=show, a=0, ok=ok, no='Bé nhìn đường gạch đỏ như tấm gương nhé. Bên phải phải giống bên trái lật lại.',
                opts=[{'e': SYMG(mirror, rows, cols)}, {'e': SYMG(set(left), rows, cols)}, {'e': SYMG(set(other), rows, cols)}])

S('MT-01', 'Tháp hồng và cầu thang nâu', cc=['CC-07'], program='Toán tư duy', group='Toán', engine='E04', mode='cards',
  pp=['PP-MON', 'PP-MULTI', 'PP-SCAF'], nl=['NL04', 'NL05', 'NL02'], mon=('Cảm quan', 'B'), methods=['M026', 'M052'],
  goal='Xếp khối theo kích thước từ nhỏ đến lớn (lấy cảm hứng từ tháp hồng, cầu thang nâu Montessori); sau đó làm với đồ vật thật.',
  diff='4–5: 3 khối, to nhỏ rõ. 5–6: 5 khối chênh nhau ít hơn, thêm cầu thang nâu (dày mỏng).',
  l45=dict(skill_id='TD.LG.02', intro=['Lu có mấy khối hồng to nhỏ khác nhau. Bé xếp từ khối nhỏ nhất đến khối to nhất nhé.'], label='Bé chạm từ nhỏ đến to',
           sets=[dict(q='Khối nào nhỏ nhất?', items=[{'e': BLK(0.45), 'say': 'Khối nhỏ nhất.'}, {'e': BLK(0.85), 'say': 'Khối to hơn.'}, {'e': BLK(1.25), 'say': 'Khối to nhất.'}], ok='Bé xếp thành một cái tháp rồi!')],
           rounds=1, done='Bé xếp từ nhỏ đến to giỏi lắm! Ở nhà bé thử xếp ba cái cốc lồng vào nhau nhé.'),
  l56=dict(skill_id='TO.DO.07', intro=['Lần này các khối chỉ hơn nhau một chút thôi. Bé nhìn thật kỹ nhé.'], label='Bé chạm từ nhỏ đến to', again='Giờ đến cầu thang nâu. Bé xếp từ thanh mỏng nhất nhé.',
           sets=[dict(q='Khối nào nhỏ nhất?', items=[{'e': BLK(0.4), 'say': 'Khối thứ nhất.'}, {'e': BLK(0.6), 'say': 'Khối thứ hai.'}, {'e': BLK(0.8), 'say': 'Khối thứ ba.'}, {'e': BLK(1.0), 'say': 'Khối thứ tư.'}, {'e': BLK(1.2), 'say': 'Khối to nhất.'}], ok='Tháp hồng đã xong!'),
                 dict(q='Thanh nào mỏng nhất?', items=[{'e': BLK(0.5, True), 'say': 'Thanh ngắn nhất.'}, {'e': BLK(0.75, True), 'say': 'Thanh dài hơn.'}, {'e': BLK(1.0, True), 'say': 'Thanh dài hơn nữa.'}, {'e': BLK(1.25, True), 'say': 'Thanh dài nhất.'}], ok='Cầu thang nâu đã xong!')],
           rounds=2, done='Bé so sánh rất tinh mắt! Ở nhà bé thử xếp đũa hoặc bút từ ngắn đến dài nhé.'),
  note='Loại B: mô phỏng trên app, bố mẹ cho bé xếp đồ thật (cốc, hộp, đũa). Chơi xong game không có nghĩa là đã thành thạo ngoài đời.')

S('MT-02', 'Hộp màu đậm nhạt', cc=['CC-07'], program='Quan sát', group='Tư duy', engine='E04', mode='cards',
  pp=['PP-MON', 'PP-MULTI'], nl=['NL15', 'NL04', 'NL05'], mon=('Cảm quan', 'B'), methods=['M011'],
  goal='Xếp các ô màu từ nhạt đến đậm (lấy cảm hứng từ hộp màu số 3 Montessori).',
  diff='4–5: 3 sắc độ xanh, chênh rõ. 5–6: 5 sắc độ đỏ rồi 4 sắc độ xanh lá, chênh ít.',
  l45=dict(skill_id='TD.QS.12', intro=['Ba ô màu xanh này có ô nhạt, có ô đậm. Bé xếp từ ô nhạt nhất đến ô đậm nhất nhé.'], label='Bé chạm từ nhạt đến đậm',
           sets=[dict(q='Ô nào nhạt nhất?', items=[{'e': SW('#d6e8f5'), 'say': 'Xanh nhạt nhất.'}, {'e': SW('#8ebfe0'), 'say': 'Xanh vừa.'}, {'e': SW('#2f6aa8'), 'say': 'Xanh đậm nhất.'}], ok='Từ nhạt đến đậm rồi!')],
           rounds=1, done='Đôi mắt bé tinh quá! Ra ngoài, bé thử tìm những chiếc lá xanh nhạt và xanh đậm nhé.'),
  l56=dict(skill_id='TD.QS.12', intro=['Các ô màu này chỉ khác nhau một chút. Bé xếp từ nhạt nhất đến đậm nhất nhé.'], label='Bé chạm từ nhạt đến đậm', again='Giờ đến màu xanh lá.',
           sets=[dict(q='Ô đỏ nào nhạt nhất?', items=[{'e': SW('#fbe0dc'), 'say': 'Ô nhạt nhất.'}, {'e': SW('#f4b3a9'), 'say': 'Ô thứ hai.'}, {'e': SW('#e98173'), 'say': 'Ô thứ ba.'}, {'e': SW('#d9544a'), 'say': 'Ô thứ tư.'}, {'e': SW('#a8352c'), 'say': 'Ô đậm nhất.'}], ok='Màu đỏ đã xếp xong!'),
                 dict(q='Ô xanh lá nào nhạt nhất?', items=[{'e': SW('#e3efc9'), 'say': 'Ô nhạt nhất.'}, {'e': SW('#bcd88c'), 'say': 'Ô thứ hai.'}, {'e': SW('#8fae3e'), 'say': 'Ô thứ ba.'}, {'e': SW('#5b7a22'), 'say': 'Ô đậm nhất.'}], ok='Màu xanh lá đã xếp xong!')],
           rounds=2, done='Bé phân biệt màu đậm nhạt rất giỏi! Ra vườn bé thử xếp lá từ nhạt đến đậm nhé.'),
  note='Kỹ năng "Phân biệt sắc độ" chưa có trong Skill Tree; tạm gắn kỹ năng gần nhất, đề xuất thêm kỹ năng mới (chờ tam duyệt).')

S('MT-03', 'Thanh số đỏ xanh', cc=['CC-01'], program='Toán tư duy', group='Toán', engine='E01', mode='items',
  pp=['PP-MON', 'PP-MULTI', 'PP-SCAF'], nl=['NL02', 'NL06', 'NL01'], mon=('Toán', 'B'), methods=['M046', 'M052'],
  goal='Đếm đoạn trên thanh số để biết độ dài ứng với con số; 5–6 tuổi ghép hai thanh thành thanh dài hơn.',
  diff='4–5: thanh 1–5, đếm đoạn. 5–6: thanh 6–10 và ghép hai thanh bằng một thanh dài.',
  l45=dict(skill_id='TO.SO.07', style='face', intro=['Mỗi thanh có các đoạn đỏ và xanh xen nhau. Bé đếm số đoạn để biết thanh số mấy nhé.'],
           items=[dict(q='Thanh này là số mấy?', show=ROD(3, 34), a=0, ok='Đúng rồi, ba đoạn là thanh số ba.', opts=[{'e': G('3')}, {'e': G('2')}, {'e': G('5')}]),
                  dict(q='Thanh này là số mấy?', show=ROD(5, 34), a=0, ok='Đúng rồi, năm đoạn là thanh số năm.', opts=[{'e': G('5')}, {'e': G('4')}, {'e': G('3')}]),
                  dict(q='Thanh này là số mấy?', show=ROD(4, 34), a=0, ok='Đúng rồi, bốn đoạn là thanh số bốn.', opts=[{'e': G('4')}, {'e': G('5')}, {'e': G('2')}])],
           no='Bé chạm theo từng đoạn và đếm nhé.'),
  l56=dict(skill_id='TO.SO.07', style='face', intro=['Các thanh số dài hơn rồi. Bé đếm đoạn, rồi thử ghép hai thanh nhé.'],
           items=[dict(q='Thanh này là số mấy?', show=ROD(8, 30), a=0, ok='Đúng rồi, thanh số tám.', opts=[{'e': G('8')}, {'e': G('7')}, {'e': G('9')}]),
                  dict(q='Thanh ba ghép với thanh nào thì dài bằng thanh năm?', show=RODS(5, 3, u=34), a=0, ok='Đúng rồi, ba với hai là năm.', opts=[{'e': ROD(2, 34)}, {'e': ROD(1, 34)}, {'e': ROD(4, 34)}]),
                  dict(q='Thanh sáu ghép với thanh nào thì dài bằng thanh mười?', show=RODS(10, 6, u=26), a=0, ok='Đúng rồi, sáu với bốn là mười.', opts=[{'e': ROD(4, 26)}, {'e': ROD(3, 26)}, {'e': ROD(5, 26)}])],
           no='Bé so phần còn thiếu với từng thanh nhé.'),
  note='Loại B: ở nhà dùng que, đũa hoặc giấy cắt thành thanh 1–10 để bé ghép thật.')

S('MT-04', 'Khung năm, khung mười', cc=['CC-01'], program='Chữ số', group='Toán', engine='E01', mode='items',
  pp=['PP-MON', 'PP-SCAF', 'PP-RETR'], nl=['NL02', 'NL09'], mon=('Toán', 'A'), methods=['M047', 'M053'],
  goal='Nhìn khung có sẵn chấm và tìm số còn thiếu để đủ năm (4–5) hoặc đủ mười, nhận ra một chục và mấy đơn vị (5–6).',
  diff='4–5: khung năm ô. 5–6: khung mười ô, số 11–20 bằng một khung đầy và một khung lẻ.',
  l45=dict(skill_id='TO.TG.01', style='face', intro=['Khung này có năm ô. Bé xem còn mấy ô trống thì đủ năm nhé.'],
           items=[dict(q='Cần thêm mấy chấm nữa cho đủ năm?', show=TF(3, 5), a=0, ok='Đúng rồi, ba thêm hai là năm.', opts=[{'e': G('2')}, {'e': G('1')}, {'e': G('3')}]),
                  dict(q='Cần thêm mấy chấm nữa cho đủ năm?', show=TF(4, 5), a=0, ok='Đúng rồi, bốn thêm một là năm.', opts=[{'e': G('1')}, {'e': G('2')}, {'e': G('3')}]),
                  dict(q='Cần thêm mấy chấm nữa cho đủ năm?', show=TF(1, 5), a=0, ok='Đúng rồi, một thêm bốn là năm.', opts=[{'e': G('4')}, {'e': G('3')}, {'e': G('2')}])],
           no='Bé đếm các ô còn trống nhé.'),
  l56=dict(skill_id='TO.SO.06', style='face', intro=['Một khung đầy là mười, gọi là một chục. Bé nhìn khung rồi trả lời nhé.'],
           items=[dict(q='Cần thêm mấy chấm nữa cho đủ mười?', show=TF(7), a=0, ok='Đúng rồi, bảy thêm ba là mười.', opts=[{'e': G('3')}, {'e': G('2')}, {'e': G('4')}]),
                  dict(q='Có tất cả mấy chấm?', show=[TF(10), TF(4)], a=0, ok='Đúng rồi, một chục và bốn là mười bốn.', opts=[{'e': G('14')}, {'e': G('41')}, {'e': G('10')}]),
                  dict(q='Có tất cả mấy chấm?', show=[TF(10), TF(8)], a=0, ok='Đúng rồi, một chục và tám là mười tám.', opts=[{'e': G('18')}, {'e': G('16')}, {'e': G('81')}])],
           no='Một khung đầy là mười. Bé đếm tiếp khung thứ hai nhé.'))

S('MT-05', 'Nửa kia của hình', cc=['CC-01'], program='Nhận thức', group='Tư duy', engine='E01', mode='items',
  pp=['PP-MULTI', 'PP-SCAF'], nl=['NL06', 'NL13', 'NL04'], methods=['M031'],
  goal='Chọn nửa bên phải để hình đối xứng qua đường gương; hình chép y nguyên (không lật) là đáp án nhiễu.',
  diff='4–5: lưới 3 hàng 2 cột, ít ô. 5–6: lưới 4 hàng 3 cột, nhiều ô hơn.',
  l45=dict(skill_id='TD.KG.15', style='face', intro=['Đường gạch đỏ giống như một tấm gương. Bé chọn nửa bên phải để hình giống hệt khi soi gương nhé.'],
           items=[SYM_ITEM({(0, 0), (1, 0), (1, 1), (2, 0)}, 3, 2, {(0, 1), (2, 1)}, 'Nửa nào ghép vào thì hai bên giống nhau như soi gương?', 'Đúng rồi, hai bên giống hệt nhau qua tấm gương.'),
                  SYM_ITEM({(0, 1), (1, 0), (2, 1)}, 3, 2, {(1, 0), (1, 1)}, 'Nửa nào ghép vào thì hai bên giống nhau như soi gương?', 'Đúng rồi, hình đã đối xứng.')],
           no='Bé nhìn tấm gương đỏ nhé.'),
  l56=dict(skill_id='TD.KG.12', style='face', intro=['Đường gạch đỏ giống như một tấm gương. Bé chọn nửa bên phải để hình đối xứng nhé.'],
           items=[SYM_ITEM({(0, 2), (1, 1), (1, 2), (2, 0), (2, 1), (2, 2), (3, 1)}, 4, 3, {(0, 0), (1, 0), (2, 2), (3, 2)}, 'Nửa nào làm cho hình đối xứng?', 'Đúng rồi, như một cánh bướm.'),
                  SYM_ITEM({(0, 0), (0, 1), (1, 1), (2, 1), (2, 2), (3, 0)}, 4, 3, {(0, 2), (1, 2), (3, 2)}, 'Nửa nào làm cho hình đối xứng?', 'Đúng rồi, hai bên giống nhau qua tấm gương.'),
                  SYM_ITEM({(0, 2), (1, 0), (1, 2), (2, 2), (3, 0), (3, 1)}, 4, 3, {(0, 0), (2, 0), (2, 1)}, 'Nửa nào làm cho hình đối xứng?', 'Đúng rồi, bé nhìn rất kỹ.')],
           no='Bé nhìn tấm gương đỏ nhé.'),
  note='Ở nhà: gấp đôi tờ giấy, chấm màu một bên rồi ép lại để thấy hình đối xứng.')

S('MT-06', 'Ai trốn sau tấm bìa?', cc=['CC-01'], program='Quan sát', group='Tư duy', engine='E01', mode='items',
  pp=['PP-INQ', 'PP-PLAY'], nl=['NL13', 'NL04', 'NL10'], methods=['M011', 'M015'],
  goal='Chỉ thấy vài mảnh nhỏ qua lỗ tấm bìa, bé ghép trong đầu thành cả con vật (nhận diện toàn cảnh từ chi tiết).',
  diff='4–5: lỗ to, 3 lựa chọn. 5–6: ít lỗ hơn, 4 lựa chọn có con vật gần giống.',
  l45=dict(skill_id='TD.QH.03', style='face', 
           items=[dict(q='Sau tấm bìa là con gì?', show='peek:1:art:meo', a=0, ok='Đúng rồi, con mèo.', opts=[{'e': 'art:meo', 'say': 'Con mèo.'}, {'e': 'art:ca', 'say': 'Con cá.'}, {'e': 'art:chim', 'say': 'Con chim.'}]),
                  dict(q='Sau tấm bìa là con gì?', show='peek:1:art:ga', a=0, ok='Đúng rồi, con gà.', opts=[{'e': 'art:ga', 'say': 'Con gà.'}, {'e': 'art:ech', 'say': 'Con ếch.'}, {'e': 'art:oc', 'say': 'Con ốc sên.'}]),
                  dict(q='Sau tấm bìa là con gì?', show='peek:1:art:buom', a=0, ok='Đúng rồi, con bướm.', opts=[{'e': 'art:buom', 'say': 'Con bướm.'}, {'e': 'art:tho', 'say': 'Con thỏ.'}, {'e': 'art:ca', 'say': 'Con cá.'}])],
           no='Bé đoán lại nhé.'),
  l56=dict(skill_id='TD.QH.03', style='face', 
           items=[dict(q='Sau tấm bìa là con gì?', show='peek:2:art:ech', a=0, ok='Đúng rồi, con ếch.', opts=[{'e': 'art:ech', 'say': 'Con ếch.'}, {'e': 'art:ca', 'say': 'Con cá.'}, {'e': 'art:oc', 'say': 'Con ốc sên.'}, {'e': 'art:meo', 'say': 'Con mèo.'}]),
                  dict(q='Sau tấm bìa là con gì?', show='peek:2:art:chim', a=0, ok='Đúng rồi, con chim.', opts=[{'e': 'art:chim', 'say': 'Con chim.'}, {'e': 'art:ga', 'say': 'Con gà.'}, {'e': 'art:buom', 'say': 'Con bướm.'}, {'e': 'art:ong', 'say': 'Con ong.'}]),
                  dict(q='Sau tấm bìa là con gì?', show='peek:2:art:oc', a=0, ok='Đúng rồi, con ốc sên.', opts=[{'e': 'art:oc', 'say': 'Con ốc sên.'}, {'e': 'art:ech', 'say': 'Con ếch.'}, {'e': 'art:ca', 'say': 'Con cá.'}, {'e': 'art:ong', 'say': 'Con ong.'}])],
           no='Bé đoán lại nhé.'))

WH = [{'e': 'art:meo', 'name': 'bạn mèo', 'found': 'Bạn mèo ở đây.'}, {'e': 'art:tao', 'name': 'quả táo', 'found': 'Quả táo ở đây.'}, {'e': 'art:bong', 'name': 'quả bóng', 'found': 'Quả bóng ở đây.'},
      {'e': 'art:hoa', 'name': 'bông hoa', 'found': 'Bông hoa ở đây.'}, {'e': 'art:sao', 'name': 'ngôi sao', 'found': 'Ngôi sao ở đây.'}, {'e': 'art:ca', 'name': 'con cá', 'found': 'Con cá ở đây.'},
      {'e': 'art:mu', 'name': 'cái mũ', 'found': 'Cái mũ ở đây.'}, {'e': 'art:la', 'name': 'chiếc lá', 'found': 'Chiếc lá ở đây.'}]
S('MT-07', 'Đồ vật nằm ở ô nào?', cc=['CC-09'], program='Ghi nhớ', group='Tư duy', engine='E06', mode='where',
  pp=['PP-RETR', 'PP-PLAY'], nl=['NL07', 'NL09', 'NL06'], methods=['M023', 'M022'],
  goal='Nhìn các đồ vật trên lưới ô, Lu úp lại, rồi bé chạm đúng ô của vật Lu gọi (ghi nhớ vị trí). Có nút Xem lại.',
  diff='4–5: 6 ô, 3 vật, hỏi 1 vật mỗi lượt. 5–6: 8 ô, 4 vật, hỏi 2 vật mỗi lượt.',
  l45=dict(skill_id='TD.TN.13', objs=WH, cols=3, cells=6, show=3, asks=1, look_ms=4000, rounds=3,
           intro=['Lu đặt đồ vật vào các ô. Bé nhớ vật nào nằm ở đâu nhé.'], look='Bé nhìn thật kỹ nhé.', q='{name} nằm ở ô nào?', hint='Ô sáng lên đó, bé thử chạm nhé.', done='Bé nhớ chỗ rất giỏi!'),
  l56=dict(skill_id='TD.TN.11', objs=WH, cols=4, cells=8, show=4, asks=2, look_ms=4500, rounds=3,
           intro=['Lu đặt bốn đồ vật vào các ô. Lần này Lu hỏi hai vật liền nhau.'], look='Bé nhìn thật kỹ nhé.', q='{name} nằm ở ô nào?', hint='Ô sáng lên đó, bé thử chạm nhé.', done='Bé nhớ chỗ rất giỏi!'))

S('MT-08', 'Xếp theo mẫu của Lu', cc=['CC-02'], program='Nhận thức', group='Tư duy', engine='E06', mode='copy',
  pp=['PP-MON', 'PP-SCAF'], nl=['NL06', 'NL04', 'NL09'], mon=('Cảm quan', 'B'), methods=['M031', 'M034'],
  goal='Nhìn mẫu và tô lại đúng ô trên lưới trống (tái tạo mô hình). Ô không có trong mẫu thì không tô được, bé tự nhìn lại mẫu.',
  diff='4–5: lưới 3×3, một màu, 3–4 ô. 5–6: lưới 4×4, hai màu, 5–6 ô.',
  l45=dict(skill_id='TD.KG.16', size=3, colors=['#3f7fc1'], models=[[{'c': 0}, {'c': 3}, {'c': 6}, {'c': 7}], [{'c': 1}, {'c': 3}, {'c': 4}, {'c': 5}], [{'c': 2}, {'c': 4}, {'c': 6}]], rounds=2,
           intro=['Bên trái là mẫu của Lu. Bé chạm vào lưới bên phải để xếp giống hệt mẫu nhé.'], q='Bé xếp giống mẫu nhé.', again='Mẫu mới đây. Bé xếp tiếp nhé.', hint='Bé đếm xem ô xanh nằm ở hàng nào nhé.', done='Giống hệt mẫu rồi!'),
  l56=dict(skill_id='TD.KG.11', size=4, colors=['#d9544a', '#3f7fc1'], color_names=['đỏ', 'xanh'], pick='Bé chọn màu rồi chạm ô', pick_color='Ô này màu {name}, bé chọn màu {name} nhé.',
           models=[[{'c': 0, 'k': 0}, {'c': 1, 'k': 0}, {'c': 5, 'k': 1}, {'c': 9, 'k': 1}, {'c': 13, 'k': 0}], [{'c': 3, 'k': 1}, {'c': 6, 'k': 0}, {'c': 9, 'k': 0}, {'c': 12, 'k': 1}, {'c': 10, 'k': 1}, {'c': 5, 'k': 0}],
                   [{'c': 4, 'k': 0}, {'c': 5, 'k': 1}, {'c': 6, 'k': 1}, {'c': 7, 'k': 0}, {'c': 1, 'k': 1}, {'c': 14, 'k': 1}]], rounds=2,
           intro=['Mẫu của Lu có hai màu. Bé chọn màu rồi chạm ô cho giống mẫu nhé.'], q='Bé xếp giống mẫu nhé.', again='Mẫu mới đây. Bé xếp tiếp nhé.', hint='Bé đếm hàng và cột nhé.', done='Giống hệt mẫu rồi!'),
  note='Ở nhà: bố mẹ xếp 3–5 khối hoặc nắp chai theo hình, bé xếp lại giống hệt bên cạnh.')

def W(e, name): return {'e': e, 'say': name}
S('MT-09', 'Âm đầu của từ', cc=['CC-01'], program='Chữ cái tiếng Việt', group='Tiếng Việt', engine='E01', mode='items',
  pp=['PP-PHON', 'PP-MULTI'], nl=['NL08', 'NL03'], methods=['M056', 'M059'],
  goal='Nghe tên ba bốn hình rồi chọn hình có âm đầu Lu nói (âm vị học, chưa cần biết chữ).',
  diff='4–5: âm bờ, mờ, cờ; 3 hình khác âm rõ. 5–6: âm gần nhau tờ và thờ, chờ và giờ; 4 hình.',
  l45=dict(skill_id='TV.AM.02', style='face', intro=['Lu đọc tên từng hình. Bé nghe tiếng đầu tiên rồi chọn hình đúng nhé.'],
           items=[dict(q='Bóng, cá, mèo. Hình nào bắt đầu bằng âm bờ?', a=0, ok='Đúng rồi, bờ, bóng.', opts=[W('art:bong', 'Bóng.'), W('art:ca', 'Cá.'), W('art:meo', 'Mèo.')]),
                  dict(q='Mèo, gà, thỏ. Hình nào bắt đầu bằng âm mờ?', a=0, ok='Đúng rồi, mờ, mèo.', opts=[W('art:meo', 'Mèo.'), W('art:ga', 'Gà.'), W('art:tho', 'Thỏ.')]),
                  dict(q='Cá, vịt, lá. Hình nào bắt đầu bằng âm cờ?', a=0, ok='Đúng rồi, cờ, cá.', opts=[W('art:ca', 'Cá.'), W('art:vit', 'Vịt.'), W('art:la', 'Lá.')])],
           no='Bé nghe Lu đọc lại nhé.'),
  l56=dict(skill_id='TV.AM.04', style='face', intro=['Lần này có những âm nghe gần giống nhau. Bé nghe thật kỹ nhé.'],
           items=[dict(q='Táo, thỏ, lá, mèo. Hình nào bắt đầu bằng âm tờ?', a=0, ok='Đúng rồi, tờ, táo. Còn thỏ là âm thờ.', opts=[W('art:tao', 'Táo.'), W('art:tho', 'Thỏ.'), W('art:la', 'Lá.'), W('art:meo', 'Mèo.')]),
                  dict(q='Chim, giày, cá, sao. Hình nào bắt đầu bằng âm chờ?', a=0, ok='Đúng rồi, chờ, chim.', opts=[W('art:chim', 'Chim.'), W('art:giay', 'Giày.'), W('art:ca', 'Cá.'), W('art:sao', 'Sao.')]),
                  dict(q='Sách, ếch, hoa, vịt. Hình nào bắt đầu bằng âm sờ?', a=0, ok='Đúng rồi, sờ, sách.', opts=[W('art:sach', 'Sách.'), W('art:ech', 'Ếch.'), W('art:hoa', 'Hoa.'), W('art:vit', 'Vịt.')])],
           no='Bé nghe Lu đọc lại nhé.'))

def CH(e, say, reply, nxt): return {'e': e, 'say': say, 'reply': [reply], 'next': nxt}
S('MT-10', 'Bé làm tác giả', cc=['CC-23', 'CC-25'], program='Tưởng tượng', group='Nghệ thuật', engine='E10',
  pp=['PP-STORY', 'PP-PLAY', 'PP-SEL'], nl=['NL11', 'NL12', 'NL03'], methods=['M007', 'M041'],
  goal='Bé chọn nhân vật, nơi chốn và sự việc để cùng Lu tạo câu chuyện mới; mọi lựa chọn đều đúng. 5–6 tuổi tự kể cái kết cho bố mẹ nghe.',
  diff='4–5: chọn nhân vật và nơi chốn. 5–6: thêm sự việc, rồi tự kể cái kết ngoài màn hình.',
  l45=dict(skill_id='TD.TTg.02', start='a',
           nodes={'a': {'say': ['Mình cùng làm một câu chuyện mới nhé. Bé chọn, Lu kể.'], 'q': 'Nhân vật chính là ai?',
                        'choices': [CH('art:meo', 'Bạn mèo.', 'Ngày xưa có một bạn mèo nhỏ rất tò mò.', 'b'), CH('art:tho', 'Bạn thỏ.', 'Ngày xưa có một bạn thỏ nhỏ rất nhanh nhẹn.', 'b'), CH('art:ga', 'Bạn gà con.', 'Ngày xưa có một bạn gà con rất chăm chỉ.', 'b')]},
                  'b': {'say': ['Một buổi sáng đẹp trời, bạn ấy muốn đi chơi.'], 'q': 'Bạn ấy đi đâu?',
                        'choices': [CH('art:cay', 'Vào khu rừng.', 'Bạn ấy đi vào khu rừng xanh mát.', 'c'), CH('art:nha', 'Sang nhà bà.', 'Bạn ấy sang nhà bà chơi.', 'c'), CH('art:cau-vong', 'Lên cầu vồng.', 'Bạn ấy leo lên chiếc cầu vồng bảy màu.', 'c')]},
                  'c': {'say': ['Ở đó bạn ấy gặp một người bạn mới, hai bạn chơi với nhau thật vui.', 'Câu chuyện của bé thật hay! Bé kể lại cho bố mẹ nghe nhé.'], 'end': True}},
           done='Câu chuyện của bé thật hay!'),
  l56=dict(skill_id='TD.TTg.03', start='a',
           nodes={'a': {'say': ['Hôm nay bé là tác giả. Bé chọn, Lu kể.'], 'q': 'Nhân vật chính là ai?',
                        'choices': [CH('art:meo', 'Bạn mèo.', 'Ngày xưa có một bạn mèo nhỏ rất tò mò.', 'b'), CH('art:tho', 'Bạn thỏ.', 'Ngày xưa có một bạn thỏ nhỏ rất nhanh nhẹn.', 'b'), CH('art:ga', 'Bạn gà con.', 'Ngày xưa có một bạn gà con rất chăm chỉ.', 'b')]},
                  'b': {'say': ['Một buổi sáng đẹp trời, bạn ấy muốn đi chơi.'], 'q': 'Bạn ấy đi đâu?',
                        'choices': [CH('art:cay', 'Vào khu rừng.', 'Bạn ấy đi vào khu rừng xanh mát.', 'c'), CH('art:nha', 'Sang nhà bà.', 'Bạn ấy sang nhà bà chơi.', 'c'), CH('art:cau-vong', 'Lên cầu vồng.', 'Bạn ấy leo lên chiếc cầu vồng bảy màu.', 'c')]},
                  'c': {'say': ['Đang đi thì có chuyện xảy ra.'], 'q': 'Chuyện gì xảy ra?',
                        'choices': [CH('art:mua', 'Trời đổ mưa.', 'Bỗng trời đổ mưa to.', 'k'), CH('art:chim', 'Gặp chú chim bị lạc.', 'Bạn ấy gặp một chú chim nhỏ bị lạc mẹ.', 'k'), CH('art:bong', 'Tìm thấy quả bóng lạ.', 'Bạn ấy tìm thấy một quả bóng biết nói.', 'k')]},
                  'k': {'say': ['Rồi chuyện gì xảy ra tiếp theo? Bé tự nghĩ cái kết nhé.', 'Bé kể cả câu chuyện cho bố mẹ nghe. Kể xong bé bấm nút.'], 'next': 'end', 'button': 'Bé kể xong rồi'},
                  'end': {'say': ['Câu chuyện của bé thật hay. Lu thích lắm!'], 'end': True}},
           done='Câu chuyện của bé thật hay!'),
  note='Hoạt động mở: không chấm đúng sai. Phần kể cái kết là ngoài màn hình, bố mẹ lắng nghe.')

S('MT-11', 'Bé chăm cây', cc=['CC-18'], program='Kỹ năng sống', group='Kỹ năng sống', engine='E11', mode='steps',
  pp=['PP-MON', 'PP-EXP', 'PP-INQ'], nl=['NL05', 'NL18'], mon=('Thực hành cuộc sống', 'B'), methods=['M086', 'M087'],
  goal='Chọn đúng đồ dùng cho từng bước chăm cây, chậu cây đổi theo từng bước; sau đó bé chăm một cây thật ở nhà.',
  diff='4–5: 3 bước. 5–6: 5 bước từ gieo hạt tới lau lá.',
  l45=dict(skill_id='KS.CS.02', state0='art:chau-cay', intro=['Cây của Lu đang khát nước. Bé giúp Lu chăm cây nhé.'],
           steps=[{'e': 'art:binh-tuoi', 'label': 'Tưới nước', 'ask': 'Đầu tiên, cây cần gì?', 'say': 'Tưới nước nhẹ nhàng vào gốc cây.', 'state': 'art:chau-cay'},
                  {'e': 'art:mat-troi', 'label': 'Đặt chỗ có nắng', 'ask': 'Tiếp theo, mình để cây ở đâu?', 'say': 'Đặt cây ở chỗ có nắng.', 'state': 'art:chau-cay'},
                  {'e': 'art:la', 'label': 'Ngắm lá mới', 'ask': 'Vài ngày sau, mình xem gì nhé?', 'say': 'Cây ra lá mới xanh tươi.', 'state': 'art:hoa'}],
           no='Chưa đến bước đó đâu.', done='Cây của Lu xanh tốt rồi! Ở nhà bé thử tưới một chậu cây thật cùng bố mẹ nhé.'),
  l56=dict(skill_id='KS.CS.02', state0='art:hat-dau', intro=['Mình trồng và chăm một cây đậu từ hạt nhé.'],
           steps=[{'e': 'art:chau-cay', 'label': 'Gieo hạt vào chậu', 'ask': 'Đầu tiên, mình gieo hạt vào đâu?', 'say': 'Gieo hạt vào chậu đất.', 'state': 'art:chau-cay'},
                  {'e': 'art:binh-tuoi', 'label': 'Tưới nước', 'ask': 'Tiếp theo là gì?', 'say': 'Tưới một chút nước cho đất ẩm.', 'state': 'art:chau-cay'},
                  {'e': 'art:mat-troi', 'label': 'Đặt chỗ có nắng', 'ask': 'Hạt cần gì để nảy mầm?', 'say': 'Đặt chậu ở chỗ có nắng.', 'state': 'art:mam-dau'},
                  {'e': 'art:khan', 'label': 'Lau lá bụi', 'ask': 'Lá bị bụi thì làm gì?', 'say': 'Lau lá nhẹ nhàng bằng khăn ẩm.', 'state': 'art:mam-dau'},
                  {'e': 'art:qua-dau', 'label': 'Thu quả đậu', 'ask': 'Cây lớn rồi, mình được gì?', 'say': 'Cây ra quả đậu.', 'state': 'art:qua-dau'}],
           no='Chưa đến bước đó đâu.', done='Bé chăm cây giỏi lắm! Ở nhà bé nhận chăm một chậu cây mỗi ngày nhé.'),
  note='Loại B: game chỉ là bước làm quen. Việc thật: bé tưới và quan sát cây ở nhà trong một tuần, bố mẹ ghi nhận.')

S('MT-12', 'Hai tay cùng làm', cc=['CC-26'], program='Vận động và phối hợp tay mắt', group='Vận động', engine='E15', mode='do',
  pp=['PP-EXP', 'PP-MON'], nl=['NL17', 'NL16'], mon=('Thực hành cuộc sống', 'C'), methods=['M090', 'M100'],
  goal='Rời màn hình làm việc cần hai tay phối hợp với đồ thật; bố mẹ xác nhận.',
  diff='4–5: gấp khăn tay làm đôi hai lần. 5–6: một tay giữ dây, một tay xâu 5 hạt hoặc ống hút cắt khúc.',
  l45=dict(skill_id='KP.VD.04', lu='kham-pha', intro=['Mình rời màn hình một chút nhé. Bé cần dùng cả hai tay.'], task='Bé lấy một chiếc khăn tay. Hai tay cầm hai góc, gấp đôi lại, rồi gấp đôi lần nữa cho vuông. Bố mẹ xem giúp bé nhé. Xong rồi bé bấm nút.', button='Bé gấp xong rồi!', seconds=60, evidence='tiep-xuc'),
  l56=dict(skill_id='KP.VD.04', lu='kham-pha', intro=['Mình rời màn hình một chút nhé. Bé cần dùng cả hai tay.'], task='Bố mẹ đưa bé một sợi dây và năm khúc ống hút. Một tay bé giữ dây, tay kia xâu từng khúc vào thành vòng tay. Xong rồi bé bấm nút.', button='Bé xâu xong rồi!', seconds=120, evidence='tiep-xuc'),
  note='Loại C: cần đồ thật. App chỉ hướng dẫn và ghi đã tham gia; bố mẹ xác nhận. Không coi bấm nút là đã thành thạo.')

# 20 mẫu đại diện theo chỉ thị mục 6 → mẫu trong Phòng mẫu (dùng lại mẫu đã có, chỉ làm mới khi thiếu)
REP20 = [('Ghi nhớ hình ảnh', ['MX-03', 'CC-08']), ('Ghi nhớ vị trí', ['MT-07']), ('Ghi nhớ trình tự', ['MX-04']),
         ('Liên tưởng hình ảnh', ['CC-08', 'CC-05']), ('Hoàn thiện hình đối xứng', ['MT-05']), ('Xoay hình', ['CC-11']),
         ('Tái tạo mô hình', ['MT-08']), ('Nhận diện toàn cảnh', ['MT-06']), ('Tưởng tượng từ hình khối', ['CC-25']),
         ('Sáng tạo câu chuyện', ['MT-10']), ('Xếp vật theo kích thước', ['MT-01']), ('Phân biệt sắc độ màu', ['MT-02']),
         ('Thanh số Montessori', ['MT-03']), ('Ghép số với số lượng', ['CC-03', 'CC-17']), ('Tạo nhóm mười', ['MT-04']),
         ('Nhận diện âm đầu', ['MT-09']), ('Tập tô chữ cái', ['CC-14']), ('Mô phỏng sắp xếp đồ dùng', ['CC-06']),
         ('Thực hành chăm sóc cây', ['MT-11']), ('Phối hợp hai tay và vận động ngoài màn hình', ['MT-12'])]


# Mẫu cũ dùng lại cho 20 mẫu đại diện: gắn thêm phương pháp và năng lực (không đổi nội dung mẫu)
TAGS = {'MX-03': (['PP-RETR', 'PP-PLAY'], ['NL07', 'NL09']), 'CC-08': (['PP-PLAY', 'PP-RETR'], ['NL07', 'NL10']), 'MX-04': (['PP-MULTI', 'PP-RETR'], ['NL08', 'NL05', 'NL09']),
        'CC-05': (['PP-PLAY'], ['NL10', 'NL04']), 'CC-11': (['PP-STEM', 'PP-SCAF'], ['NL06']), 'CC-25': (['PP-PLAY'], ['NL11', 'NL12']), 'CC-03': (['PP-MON', 'PP-STEM'], ['NL02', 'NL16']),
        'CC-17': (['PP-STEM', 'PP-MULTI'], ['NL02', 'NL16']), 'CC-14': (['PP-SCAF', 'PP-MULTI', 'PP-PHON'], ['NL16', 'NL03']), 'CC-06': (['PP-EXP', 'PP-MON'], ['NL01', 'NL10']),
        'CC-21': (['PP-MULTI', 'PP-PLAY'], ['NL14', 'NL08'])}
for _s in SAMPLES:
    if _s['id'] in TAGS: _s['pp'], _s['nl'] = map(list, TAGS[_s['id']])

# ===================================================================== kiểm tra và ghi
def check():
    errs = []
    ids = set()
    for s in SAMPLES:
        if s['id'] in ids: errs.append('trùng ' + s['id'])
        ids.add(s['id'])
        for age, a in s['levels'].items():
            if a.get('skill_id') and a['skill_id'] not in SKILLS: errs.append(f"{a['activity_id']}: kỹ năng {a['skill_id']} không có trong skills.json")
        if s['program'] not in PROGRAMS: errs.append(f"{s['id']}: chương trình lạ {s['program']}")
    covered = {c for s in SAMPLES for c in s['cc']}
    for m, n in MECHANICS:
        if m not in covered: errs.append(f'thiếu mẫu cho cơ chế {m} {n}')
    xs = {x for s in SAMPLES for x in s['x']}
    for i, n in enumerate(X30, 1):
        if i not in xs: errs.append(f'thiếu mẫu nghiệm thu {i}. {n}')
    if len(REP20) != 20: errs.append('REP20 phải đủ 20 mẫu đại diện')
    for n, l in REP20:
        for i in l:
            if i not in ids: errs.append(f'mẫu đại diện "{n}" trỏ tới {i} không có')
    return errs

if __name__ == '__main__':
    e = check()
    if e: print('\n'.join(e)); sys.exit(1)
    out = dict(format='lu-lab-samples', version='1.0.0', mechanics=[dict(id=m, name=n) for m, n in MECHANICS],
               x30=[dict(n=i, name=n) for i, n in enumerate(X30, 1)], programs=PROGRAMS, rep20=[dict(n=i, name=n, ids=l) for i, (n, l) in enumerate(REP20, 1)], samples=SAMPLES)
    os.makedirs(os.path.join(ROOT, 'content/lab'), exist_ok=True)
    p = os.path.join(ROOT, 'content/lab/samples.json')
    json.dump(out, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{len(SAMPLES)} mẫu, {sum(len(s["levels"]) for s in SAMPLES)} hoạt động -> {p}')

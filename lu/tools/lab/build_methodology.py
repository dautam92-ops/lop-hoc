# -*- coding: utf-8 -*-
"""Khung phương pháp giáo dục của Lu (LU EDUCATIONAL METHODOLOGY EXPANSION, tam 26/11 16:26).
Sinh content/lab/methodology.json. Chạy sau build_samples.py:  python3 tools/lab/build_methodology.py

Nguyên tắc:
- Chỉ BỔ SUNG vào Lu, không thay giáo trình 300 buổi, không lập chương trình Montessori / "não bộ" / Chim Đa Đa riêng.
- Không gắn nhãn trẻ "não trái / não phải"; không hứa kích hoạt bán cầu não, tăng IQ, tạo thiên tài.
- Lu "lấy cảm hứng từ Montessori", không tự nhận là chương trình Montessori chuẩn (AMI/AMS).
- Kỹ năng mới chỉ là ĐỀ XUẤT, chưa ghi vào content/skills.json cho tới khi tam duyệt.
- Mức nghiên cứu ghi trung thực: 'doi-chieu' = đã tra và xác nhận nguồn tồn tại, nội dung khớp tóm tắt;
  'tong-quan' = tổng hợp từ hiểu biết chung về tài liệu, chưa tra lại; cần chuyên gia mầm non soát trước khi dùng cho tiếp thị.
"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SK = json.load(open(os.path.join(ROOT, 'content/skills.json'), encoding='utf-8'))['skills']
SAMPLES = json.load(open(os.path.join(ROOT, 'content/lab/samples.json'), encoding='utf-8'))
SID = {s['id']: s for s in SAMPLES['samples']}

EVIDENCE = {'A': 'Mạnh: nhiều nghiên cứu và phân tích tổng hợp, kết quả khá nhất quán',
            'B': 'Trung bình: có phân tích tổng hợp hoặc thử nghiệm tốt nhưng hiệu quả phụ thuộc cách làm',
            'C': 'Hạn chế: ít nghiên cứu chặt chẽ ở trẻ 4–6 tuổi hoặc kết quả trái chiều',
            'D': 'Chủ yếu lý thuyết và kinh nghiệm thực hành'}

# ---- Nguồn: v = đã tra (đường dẫn), còn lại là tổng quan
def SRC(t, kind, url=None): return {'t': t, 'loai': kind, 'url': url, 'da_tra': bool(url)}
SKENE = SRC('Skene và cộng sự (2022). Can guidance during play enhance children\'s learning and development in educational contexts? A systematic review and meta-analysis. Child Development 93(4).', 'Phân tích tổng hợp', 'https://pubmed.ncbi.nlm.nih.gov/35018635/')
ZOSH = SRC('Zosh và cộng sự (2017). Learning through play: a review of the evidence. LEGO Foundation.', 'Tổng quan')
ALFIERI = SRC('Alfieri và cộng sự (2011). Does discovery-based instruction enhance learning? Journal of Educational Psychology 103(1).', 'Phân tích tổng hợp', 'https://www.fisme.science.uu.nl/publicaties/literatuur/2011_alfieri_discovery_learning.pdf')
MOL = SRC('Mol, Bus và de Jong (2009). Interactive book reading in early education: a tool to stimulate print knowledge as well as oral language. Review of Educational Research 79(2).', 'Phân tích tổng hợp', 'https://searchworks.jioinstitute.edu.in/articles/eric__EJ879465')
VLACH = SRC('Vlach và Sandhofer (2012). Distributing learning over time: the spacing effect in children\'s acquisition and generalization of science concepts. Child Development 83(4).', 'Thực nghiệm với trẻ mầm non', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3399982')
CEPEDA = SRC('Cepeda và cộng sự (2006). Distributed practice in verbal recall tasks: a review and quantitative synthesis. Psychological Bulletin 132(3).', 'Phân tích tổng hợp')
DUNLOSKY = SRC('Dunlosky và cộng sự (2013). Improving students\' learning with effective learning techniques. Psychological Science in the Public Interest 14(1).', 'Tổng quan')
ROEDIGER = SRC('Roediger và Karpicke (2006). Test-enhanced learning. Psychological Science 17(3).', 'Thực nghiệm')
WBR = SRC('Wood, Bruner và Ross (1976). The role of tutoring in problem solving. Journal of Child Psychology and Psychiatry 17(2).', 'Nghiên cứu gốc')
VYG = SRC('Vygotsky (1978). Mind in Society (vùng phát triển gần).', 'Sách gốc')
SHAMS = SRC('Shams và Seitz (2008). Benefits of multisensory learning. Trends in Cognitive Sciences 12(11).', 'Tổng quan')
PASHLER = SRC('Pashler và cộng sự (2008). Learning styles: concepts and evidence. Psychological Science in the Public Interest 9(3). (Không có bằng chứng cho "phong cách học" theo giác quan.)', 'Tổng quan')
KOLB = SRC('Kolb (1984). Experiential Learning; Dewey (1938). Experience and Education.', 'Sách gốc')
CASEL = SRC('CASEL. Khung năng lực SEL 5 nhóm (tự nhận thức, tự quản lý, nhận thức xã hội, kỹ năng quan hệ, ra quyết định có trách nhiệm).', 'Tổ chức chuyên môn')
DURLAK = SRC('Durlak và cộng sự (2011). The impact of enhancing students\' social and emotional learning. Child Development 82(1). (Chủ yếu học sinh phổ thông.)', 'Phân tích tổng hợp')
BIERMAN = SRC('Bierman và cộng sự (2008). Promoting academic and social-emotional school readiness: the Head Start REDI program. Child Development 79(6).', 'Thử nghiệm ngẫu nhiên')
NRC = SRC('National Research Council (2009). Mathematics Learning in Early Childhood: Paths Toward Excellence and Equity.', 'Báo cáo chính thức')
CLEMENTS = SRC('Clements và Sarama (2008, 2011). Building Blocks: thử nghiệm chương trình toán mầm non.', 'Thử nghiệm ngẫu nhiên')
UTTAL = SRC('Uttal và cộng sự (2013). The malleability of spatial skills: a meta-analysis of training studies. Psychological Bulletin 139(2).', 'Phân tích tổng hợp')
NELP = SRC('National Early Literacy Panel (2008). Developing Early Literacy (nhận thức âm vị dự báo khả năng đọc).', 'Báo cáo chính thức')
NRP = SRC('National Reading Panel (2000). Teaching Children to Read (dạy âm vần có hệ thống).', 'Báo cáo chính thức')
KATZ = SRC('Katz và Chard (2000). Engaging Children\'s Minds: The Project Approach.', 'Sách chuyên môn')
MONT = SRC('Maria Montessori (1912). The Montessori Method; (1967) The Discovery of the Child.', 'Sách gốc')
LILLARD = SRC('Lillard (2017). Montessori: The Science Behind the Genius (bản 3).', 'Sách chuyên môn')
LILLARD18 = SRC('Marshall (2017). Montessori education: a review of the evidence base. npj Science of Learning 2.', 'Tổng quan', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6161506/')
RANDOLPH = SRC('Randolph và cộng sự (2023). Montessori education\'s impact on academic and nonacademic outcomes: a systematic review. Campbell Systematic Reviews 19(3).', 'Phân tích tổng hợp', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10406168/')
DIAMOND = SRC('Diamond và Lee (2011). Interventions shown to aid executive function development in children 4 to 12 years old. Science 333.', 'Tổng quan', 'https://pubmed.ncbi.nlm.nih.gov/21852486/')
HARVARD = SRC('Center on the Developing Child, Harvard. How Early Experiences Shape the Development of Executive Function.', 'Tổ chức chuyên môn', 'https://developingchild.harvard.edu/wp-content/uploads/2024/10/How-Early-Experiences-Shape-the-Development-of-Executive-Function.pdf')
NIELSEN = SRC('Nielsen và cộng sự (2013). An evaluation of the left-brain vs. right-brain hypothesis with resting state functional connectivity MRI. PLOS ONE 8(8). (Không có người "thuận não trái/phải".)', 'Nghiên cứu', 'https://pubmed.ncbi.nlm.nih.gov/23967180/')
MELBY = SRC('Melby-Lervåg và Hulme (2013). Is working memory training effective? A meta-analytic review. Developmental Psychology 49(2). (Luyện trí nhớ làm việc ít chuyển sang năng lực khác.)', 'Phân tích tổng hợp', 'https://pubmed.ncbi.nlm.nih.gov/22612437/')
SALA = SRC('Sala và Gobet (2017). When the music\'s over: does music skill transfer to children\'s and young adolescents\' cognitive and academic skills? Educational Research Review 20.', 'Phân tích tổng hợp')
GDMN = SRC('Bộ GD&ĐT. Chương trình Giáo dục mầm non, Văn bản hợp nhất 01/VBHN-BGDĐT ngày 13/4/2021.', 'Văn bản chính thức', 'https://luatvietnam.vn/giao-duc/van-ban-hop-nhat-01-vbhn-bgddt-bo-giao-duc-va-dao-tao-150202-d5.html')

def M(id, vi, en, *, src, nguyen_tac, chung_cu, chung_cu_ghi, muc_tieu, tuoi45, tuoi56, dang_hd, cach, gioi_han, so_hoa, thuc_te, skills, kn, engines, mau, nghien_cuu):
    return dict(id=id, ten=vi, ten_en=en, nguon=src, nguyen_tac=nguyen_tac, chung_cu=chung_cu, chung_cu_ghi=chung_cu_ghi, muc_tieu=muc_tieu,
                tuoi={'4-5': tuoi45, '5-6': tuoi56}, dang_hoat_dong=dang_hd, cach_truyen_dat=cach, gioi_han=gioi_han, so_hoa=so_hoa,
                hoat_dong_thuc_te=thuc_te, skill_ids=skills, knowledge_ids=kn, engines=engines, mau=mau, nghien_cuu=nghien_cuu)

APP, OFF, PAR = 'Trên app', 'Ngoài màn hình', 'Cùng bố mẹ'
METHODS = [
 M('PP-PLAY', 'Học qua chơi có dẫn dắt', 'Play-based / guided play', src=[SKENE, ZOSH],
   nguyen_tac=['Bé chủ động, vui, có ý nghĩa; người lớn đặt mục tiêu học nhưng để bé dẫn cuộc chơi', 'Chơi có dẫn dắt (guided play) hiệu quả hơn chơi tự do khi cần học một kiến thức cụ thể'],
   chung_cu='B', chung_cu_ghi='Phân tích tổng hợp 2022: chơi có dẫn dắt cho kết quả toán sớm và một số kỹ năng tốt hơn so với dạy trực tiếp; nhiều kết quả khác chưa đủ chắc.',
   muc_tieu=['Hứng thú học', 'Toán sớm', 'Ngôn ngữ', 'Chức năng điều hành'], tuoi45='Rất phù hợp, là cách chính', tuoi56='Rất phù hợp, thêm luật chơi phức tạp hơn',
   dang_hd=['Trò chơi có mục tiêu', 'Nhập vai', 'Sân chơi Discovery'], cach=[APP, OFF, PAR],
   gioi_han=['Chơi tự do không dẫn dắt ít hiệu quả cho mục tiêu học cụ thể', 'Phần thưởng ảo không phải là chơi'], so_hoa='Cao',
   thuc_te=['Chơi bán hàng đếm xu', 'Trốn tìm đồ vật theo màu'], skills=['TO.TIEN.01', 'TD.QS.01', 'KP.ST.D04'], kn=['KN.PP.CHOI'], engines=['E01', 'E05', 'E06', 'E14'], mau=['CC-08', 'MT-06', 'MT-07'], nghien_cuu='doi-chieu'),
 M('PP-INQ', 'Học qua khám phá có dẫn dắt', 'Inquiry-based (guided discovery)', src=[ALFIERI],
   nguyen_tac=['Đặt câu hỏi, dự đoán, thử, quan sát, nói lại', 'Khám phá có hỗ trợ (gợi ý, phản hồi, yêu cầu giải thích) chứ không để bé tự mò'],
   chung_cu='B', chung_cu_ghi='Phân tích tổng hợp 2011: khám phá không hướng dẫn kém dạy trực tiếp; khám phá có hướng dẫn tốt hơn các cách khác.',
   muc_tieu=['Tư duy khoa học', 'Nhân quả', 'Đặt câu hỏi'], tuoi45='Phù hợp với câu hỏi đơn giản, một biến', tuoi56='Phù hợp, thêm dự đoán và so sánh hai lần thử',
   dang_hd=['Dự đoán rồi quan sát', 'Mô phỏng thí nghiệm', 'Câu đố manh mối'], cach=[APP, OFF],
   gioi_han=['Không để bé đoán mò quá lâu, sau 2 lần sai phải có gợi ý', 'Mô phỏng không thay trải nghiệm thật'], so_hoa='Vừa',
   thuc_te=['Thả đồ vào chậu nước xem chìm nổi', 'Soi bóng đèn pin'], skills=['KP.KH.03', 'KP.TG.06', 'TD.LG.13', 'TD.NQ.01'], kn=['KN.KH.CHIM-NOI', 'KN.KH.ANH-SANG'], engines=['E11', 'E10', 'E01'], mau=['CC-19', 'MX-06', 'MT-06'], nghien_cuu='doi-chieu'),
 M('PP-EXP', 'Học qua trải nghiệm', 'Experiential learning', src=[KOLB],
   nguyen_tac=['Làm thật, cảm nhận, nghĩ lại, làm lại', 'Gắn với việc hằng ngày của bé'],
   chung_cu='D', chung_cu_ghi='Nền lý thuyết vững; bằng chứng định lượng riêng cho mầm non còn ít.',
   muc_tieu=['Kỹ năng sống', 'Tự lập', 'Vận dụng ngoài đời'], tuoi45='Phù hợp, việc ngắn 3–5 phút', tuoi56='Phù hợp, việc dài hơn, bé tự kể lại',
   dang_hd=['Hoạt động ngoài màn hình', 'Mô phỏng việc nhà rồi làm thật'], cach=[OFF, PAR],
   gioi_han=['App chỉ hướng dẫn và ghi đã tham gia; bố mẹ xác nhận', 'Hoàn thành game không phải đã thành thạo (D24)'], so_hoa='Thấp',
   thuc_te=['Rót nước', 'Gấp khăn', 'Chăm cây'], skills=['KS.TP.01', 'KS.TN.01', 'TD.VDg.01'], kn=['KN.KS.VIEC-NHA'], engines=['E15', 'E11'], mau=['CC-26', 'MT-11', 'MT-12'], nghien_cuu='tong-quan'),
 M('PP-MULTI', 'Đa giác quan', 'Multisensory learning', src=[SHAMS, PASHLER],
   nguyen_tac=['Cùng một kiến thức đi qua mắt, tai, tay (nhìn, nghe Lu đọc, chạm và kéo)', 'Không chia trẻ theo "phong cách học"'],
   chung_cu='B', chung_cu_ghi='Kết hợp nhiều giác quan giúp nhận biết và ghi nhớ tốt hơn trong nhiều thí nghiệm; ý tưởng "mỗi trẻ một phong cách học" không có bằng chứng.',
   muc_tieu=['Nhận biết chữ, số', 'Ghi nhớ', 'Cảm quan'], tuoi45='Rất phù hợp', tuoi56='Rất phù hợp',
   dang_hd=['Chạm và nghe', 'Tô theo nét có lời đọc', 'Ghép âm thanh với hình'], cach=[APP, OFF],
   gioi_han=['Màn hình chỉ có nhìn, nghe, chạm; xúc giác, khứu giác cần đồ thật', 'Quá nhiều hiệu ứng gây phân tán'], so_hoa='Vừa',
   thuc_te=['Sờ chữ cắt bằng giấy nhám', 'Đoán đồ vật trong túi kín'], skills=['TV.CC.02', 'TO.SO.01', 'KP.AN.D01'], kn=['KN.TV.CHU-CAI'], engines=['E01', 'E13', 'E12'], mau=['CC-01', 'CC-14', 'MT-02'], nghien_cuu='tong-quan'),
 M('PP-SCAF', 'Giàn giáo (hỗ trợ giảm dần)', 'Scaffolding', src=[WBR, VYG],
   nguyen_tac=['Làm mẫu, làm cùng, tự làm', 'Gợi ý tăng dần theo số lần sai, rút bớt khi bé làm được'],
   chung_cu='B', chung_cu_ghi='Nền lý thuyết mạnh và được dùng rộng rãi; hiệu quả phụ thuộc chất lượng gợi ý.',
   muc_tieu=['Tự lập trong học', 'Vượt mức hiện tại vừa sức'], tuoi45='Rất phù hợp', tuoi56='Rất phù hợp',
   dang_hd=['Tô chữ 3 bước mẫu, hỗ trợ, độc lập', 'Gợi ý sau 2 lần sai', 'Hai mức tuổi'], cach=[APP, PAR],
   gioi_han=['Gợi ý quá sớm làm bé ỷ lại', 'Cần dữ liệu lần thử để giảm hỗ trợ'], so_hoa='Cao',
   thuc_te=['Bố mẹ cầm tay tập tô rồi buông dần'], skills=['TV.VT.01', 'TO.SO.02', 'TD.KG.11'], kn=['KN.PP.GIAN-GIAO'], engines=['E13', 'E01', 'E06'], mau=['MX-08', 'MT-03', 'MT-08'], nghien_cuu='tong-quan'),
 M('PP-SPACE', 'Lặp lại cách quãng', 'Spaced repetition', src=[VLACH, CEPEDA],
   nguyen_tac=['Ôn lại kiến thức sau vài ngày thay vì dồn một lần', 'Mỗi lần ôn đổi bối cảnh một chút'],
   chung_cu='A', chung_cu_ghi='Hiệu ứng cách quãng rất vững ở người lớn; thực nghiệm 2012 cho thấy trẻ mầm non nhớ và khái quát tốt hơn khi học cách quãng.',
   muc_tieu=['Nhớ lâu', 'Khái quát kiến thức'], tuoi45='Phù hợp, do hệ thống tự xếp lịch', tuoi56='Phù hợp',
   dang_hd=['Thẻ ôn trong buổi sau 1, 3, 7 buổi', 'Ngân hàng luyện tập không giới hạn'], cach=[APP],
   gioi_han=['Cần luật lịch ôn trong ngân hàng luyện tập (luật đơn giản theo D07)', 'Không biến ôn thành kiểm tra áp lực (D06)'], so_hoa='Cao',
   thuc_te=['Bố mẹ hỏi lại chữ đã học khi đi đường'], skills=['TO.SO.05', 'TV.CC.02', 'EN.EN.07'], kn=['KN.PP.ON-TAP'], engines=['Tất cả engine qua seed biến thể'], mau=['MX-11'], nghien_cuu='doi-chieu'),
 M('PP-RETR', 'Luyện nhớ lại (truy xuất)', 'Retrieval practice', src=[ROEDIGER, DUNLOSKY],
   nguyen_tac=['Bé tự nhớ lại khi không nhìn thấy, thay vì xem lại', 'Luôn có phản hồi đúng sau khi nhớ lại'],
   chung_cu='B', chung_cu_ghi='Rất mạnh ở học sinh và người lớn; nghiên cứu ở trẻ 4–6 tuổi ít hơn nên xếp mức B cho Lu.',
   muc_tieu=['Ghi nhớ', 'Tự tin'], tuoi45='Phù hợp ở dạng trò chơi (che lại rồi hỏi)', tuoi56='Phù hợp',
   dang_hd=['Vật nào biến mất', 'Nhìn nhanh nhớ số', 'Ghi nhớ vị trí', 'Câu hỏi nhớ lại cuối buổi'], cach=[APP, PAR],
   gioi_han=['Có nút Xem lại để không gây căng thẳng', 'Không chấm điểm trí nhớ'], so_hoa='Cao',
   thuc_te=['Kim\'s game: che khay đồ, hỏi món nào mất'], skills=['TD.TN.05', 'TD.TN.11', 'TD.TN.01'], kn=['KN.PP.NHO-LAI'], engines=['E06', 'E01', 'E05'], mau=['MX-03', 'MX-11', 'MT-07'], nghien_cuu='tong-quan'),
 M('PP-STORY', 'Học qua câu chuyện', 'Story-based / dialogic reading', src=[MOL],
   nguyen_tac=['Đọc truyện có hỏi đáp (đọc đối thoại)', 'Bé đoán, chọn diễn biến, kể lại'],
   chung_cu='A', chung_cu_ghi='Phân tích tổng hợp 2009: đọc sách tương tác cải thiện ngôn ngữ nói và hiểu biết về chữ ở trẻ mầm non.',
   muc_tieu=['Ngôn ngữ', 'Nghe hiểu', 'Tưởng tượng', 'Cảm xúc'], tuoi45='Rất phù hợp, truyện 3–4 cảnh', tuoi56='Rất phù hợp, thêm câu hỏi hiểu và tự kể',
   dang_hd=['Truyện rẽ nhánh', 'Xếp tranh kể chuyện', 'Bé làm tác giả'], cach=[APP, PAR],
   gioi_han=['Lựa chọn diễn biến không chấm đúng sai', 'Bé kể lại cần người lớn lắng nghe'], so_hoa='Cao',
   thuc_te=['Bố mẹ đọc sách giấy và hỏi "theo con chuyện gì xảy ra tiếp?"'], skills=['TV.NG.01', 'TD.NQ.02', 'TD.TTg.03'], kn=['KN.TV.TRUYEN'], engines=['E10', 'E04', 'E00'], mau=['CC-23', 'CC-07', 'MT-10'], nghien_cuu='doi-chieu'),
 M('PP-SEL', 'Học cảm xúc xã hội', 'Social-emotional learning (SEL)', src=[CASEL, DURLAK, BIERMAN],
   nguyen_tac=['Nhận biết, gọi tên, điều chỉnh cảm xúc; thấu cảm; giải quyết xung đột', 'Không chấm điểm đạo đức (D04)'],
   chung_cu='B', chung_cu_ghi='Rất mạnh ở học sinh phổ thông (2011); ở mầm non có thử nghiệm tốt (Head Start REDI) với chương trình có giáo viên.',
   muc_tieu=['EQ', 'Kỹ năng xã hội', 'Tự điều chỉnh'], tuoi45='Phù hợp, cảm xúc cơ bản', tuoi56='Phù hợp, nguyên nhân cảm xúc và nhiều cách xử lý',
   dang_hd=['Truyện EQ rẽ nhánh', 'Hỏi cảm xúc đầu buổi', 'Nhập vai'], cach=[APP, PAR],
   gioi_han=['App không thay tương tác thật với người', 'Giữ chương trình EQ riêng như tam yêu cầu'], so_hoa='Vừa',
   thuc_te=['Gọi tên cảm xúc trong bữa tối', 'Thở bóng bay khi giận'], skills=['EQ.CX.01', 'EQ.XH.01', 'EQ.CX.05'], kn=['KN.EQ.CAM-XUC'], engines=['E10', 'E01'], mau=['CC-22'], nghien_cuu='tong-quan'),
 M('PP-STEM', 'STEM sớm', 'Early STEM', src=[NRC, CLEMENTS, UTTAL],
   nguyen_tac=['Toán sớm theo lộ trình phát triển (đếm, số, hình, đo, quy luật)', 'Không gian và hình khối luyện được; liên hệ với toán'],
   chung_cu='A', chung_cu_ghi='Báo cáo NRC 2009 và thử nghiệm Building Blocks cho thấy toán mầm non có lộ trình cải thiện kết quả; phân tích tổng hợp 2013: kỹ năng không gian luyện được.',
   muc_tieu=['Toán', 'Không gian', 'Khoa học', 'Tư duy máy tính (lệnh tuần tự)'], tuoi45='Phù hợp, số 1–10', tuoi56='Phù hợp, số 11–20, đo, thời gian',
   dang_hd=['Đếm chạm', 'Khung mười', 'Xếp hình', 'Thẻ lệnh', 'Mô phỏng khoa học'], cach=[APP, OFF],
   gioi_han=['Không đẩy phép tính viết trước tuổi', 'Hình học cần đồ thật để xoay, ghép'], so_hoa='Cao',
   thuc_te=['Đếm đồ vật thật', 'Đo bằng gang tay'], skills=['TO.DEM.02', 'TO.SO.06', 'TD.KG.10', 'TD.CD.01'], kn=['KN.TO.SO', 'KN.TO.HINH'], engines=['E01', 'E02', 'E07', 'E08', 'E11'], mau=['CC-17', 'MT-04', 'CC-11'], nghien_cuu='tong-quan'),
 M('PP-PHON', 'Âm vị học và âm vần', 'Phonics / phonological awareness', src=[NELP, NRP, GDMN],
   nguyen_tac=['4–5 tuổi: nghe tiếng, vần, âm đầu bằng tai (chưa cần chữ)', '5–6 tuổi: làm quen 29 chữ cái, âm đầu gắn với chữ; tập tô từ 5 tuổi'],
   chung_cu='A', chung_cu_ghi='Nhận thức âm vị là yếu tố dự báo mạnh khả năng đọc (NELP 2008); dạy âm vần có hệ thống hiệu quả (NRP 2000). Các nghiên cứu chủ yếu bằng tiếng Anh; tiếng Việt cần đối chiếu Chương trình GDMN.',
   muc_tieu=['Chuẩn bị đọc', 'Chữ cái tiếng Việt'], tuoi45='Phù hợp ở dạng nghe, vỗ tay tiếng', tuoi56='Rất phù hợp, chuẩn bị lớp 1',
   dang_hd=['Vỗ tay đếm tiếng', 'Âm đầu', 'Tìm chữ', 'Tập tô'], cach=[APP, OFF, PAR],
   gioi_han=['Không dạy đánh vần ép buộc trước tuổi', 'Tiếng Anh dạy riêng, không trộn (D44)'], so_hoa='Cao',
   thuc_te=['Đi chợ tìm đồ bắt đầu bằng âm bờ'], skills=['TV.AM.01', 'TV.AM.04', 'TV.CC.02'], kn=['KN.TV.AM-DAU'], engines=['E01', 'E13', 'E12'], mau=['MT-09', 'CC-01', 'CC-14'], nghien_cuu='tong-quan'),
 M('PP-PROJ', 'Học theo dự án nhỏ', 'Project-based (project approach)', src=[KATZ],
   nguyen_tac=['Một chủ đề kéo dài nhiều buổi, bé hỏi, tìm hiểu, làm sản phẩm, trình bày', 'Gắn với 10 vùng đất của Lu'],
   chung_cu='C', chung_cu_ghi='Được dùng rộng rãi (Reggio Emilia, Project Approach); nghiên cứu định lượng ở mầm non còn ít.',
   muc_tieu=['Tự lập', 'Sáng tạo', 'Ngôn ngữ', 'Hợp tác'], tuoi45='Phù hợp với dự án 2–3 buổi', tuoi56='Phù hợp với dự án 1–2 tuần',
   dang_hd=['Dự án cuối vùng (lễ hội)', 'Sản phẩm thật cùng bố mẹ'], cach=[OFF, PAR, APP],
   gioi_han=['Cần người lớn đồng hành', 'App chỉ khởi động và lưu ảnh sản phẩm'], so_hoa='Thấp',
   thuc_te=['Làm đèn lồng', 'Trồng đậu và vẽ nhật ký'], skills=['KP.ST.02', 'KP.ST.05', 'KS.TN.01'], kn=['KN.PP.DU-AN'], engines=['E15', 'E14'], mau=['MT-11'], nghien_cuu='tong-quan'),
]
# Hai khung bổ sung theo chỉ thị mục 1, 2
METHODS += [
 M('PP-MON', 'Lấy cảm hứng từ Montessori', 'Montessori-inspired', src=[MONT, LILLARD, LILLARD18, RANDOLPH],
   nguyen_tac=['Đồ dùng tự sửa lỗi (bé tự thấy chỗ sai)', 'Tách một khó khăn mỗi lần', 'Đi từ cụ thể đến trừu tượng', 'Thực hành cuộc sống, tự lập, tôn trọng nhịp của bé'],
   chung_cu='B', chung_cu_ghi='Tổng quan hệ thống 2023 (Campbell): giáo dục Montessori có tác động dương ở nhiều kết quả học tập và phi học tập, chất lượng bằng chứng còn khác nhau. Các kết quả này là của lớp Montessori đầy đủ với giáo viên được đào tạo, không phải của app.',
   muc_tieu=['Cảm quan', 'Toán cụ thể', 'Tự lập', 'Tập trung'], tuoi45='Rất phù hợp (cảm quan, thực hành cuộc sống)', tuoi56='Rất phù hợp (toán, ngôn ngữ)',
   dang_hd=['Xếp theo kích thước, sắc độ', 'Thanh số', 'Tái tạo mô hình', 'Việc nhà thật'], cach=[APP, OFF, PAR],
   gioi_han=['Lu không phải chương trình Montessori chuẩn', 'Montessori cốt lõi là đồ thật và môi trường chuẩn bị; app chỉ mô phỏng phần nhìn được', 'Không số hóa mọi hoạt động'], so_hoa='Vừa (A/B/C từng hoạt động)',
   thuc_te=['Rót nước', 'Gấp khăn', 'Xếp cốc lồng'], skills=['TD.LG.02', 'TO.SO.02', 'KS.TP.01'], kn=['KN.MON.CAM-QUAN'], engines=['E04', 'E01', 'E06', 'E11', 'E15'], mau=['MT-01', 'MT-02', 'MT-03', 'MT-08'], nghien_cuu='doi-chieu'),
 M('PP-COG', 'Phát triển nhận thức toàn diện', 'Whole-brain cognitive development (18 năng lực)', src=[DIAMOND, HARVARD, NIELSEN, MELBY, SALA],
   nguyen_tac=['Luyện nhiều năng lực nhận thức qua hoạt động có nội dung thật (toán, chữ, khoa học), không luyện "não" tách rời', 'Hai bán cầu não luôn làm việc cùng nhau; không gắn nhãn trẻ', 'Vận động, nghệ thuật, chơi giả vờ hỗ trợ chức năng điều hành'],
   chung_cu='B', chung_cu_ghi='Chức năng điều hành cải thiện được qua chương trình có luyện tập và tăng độ khó (Diamond và Lee 2011). Không có người "thuận não trái/phải" (Nielsen 2013). Luyện trí nhớ làm việc hay học nhạc ít chuyển sang IQ hay năng lực khác (2013, 2017).',
   muc_tieu=['18 năng lực ở mục năng lực'], tuoi45='Phù hợp', tuoi56='Phù hợp',
   dang_hd=['Toàn bộ 26 cơ chế và 20 mẫu đại diện'], cach=[APP, OFF, PAR],
   gioi_han=['Không hứa tăng IQ, kích hoạt não phải, tạo thiên tài', 'Không đo IQ; chỉ ghi tiến bộ theo kỹ năng'], so_hoa='Cao (trừ vận động)',
   thuc_te=['Vận động hai tay', 'Chơi giả vờ'], skills=['TD.TT.05', 'TD.TN.D01', 'TD.CY.01'], kn=['KN.NT.DIEU-HANH'], engines=['Tất cả'], mau=['MX-04', 'MT-05', 'MT-07'], nghien_cuu='doi-chieu'),
]

# ---- 18 năng lực nhận thức (mục 1). Kỹ năng hiện có tính theo tiền tố Skill ID + danh sách bổ sung.
def pick(*pfx, extra=(), only=()):
    ks = [k for k in SK if any(k.startswith(p) for p in pfx)] + [k for k in extra if k in SK]
    return sorted(set(ks) - set(only))
AB = [
 ('NL01', 'Tư duy logic', 'Phân loại, quy luật, suy luận, nếu thì', pick('TD.LG', 'TD.NQ'), []),
 ('NL02', 'Toán học', 'Đếm, số, tách gộp, đo, hình', pick('TO.'), []),
 ('NL03', 'Ngôn ngữ', 'Nghe hiểu, từ, câu, kể chuyện (tiếng Việt; tiếng Anh tách riêng)', pick('TV.NG', 'TV.TU'), []),
 ('NL04', 'Phân tích', 'So sánh, tìm điểm khác, tách bộ phận', pick('TD.QS', 'TD.QH', 'KP.TG.04'), []),
 ('NL05', 'Tư duy tuần tự', 'Theo bước, trình tự, lệnh nối tiếp', pick('TD.CD', 'TO.TGIAN', 'KS.SH', extra=['KP.TG.05', 'TD.TN.03', 'TD.TN.08', 'KS.VS.01']), []),
 ('NL06', 'Tư duy không gian', 'Vị trí, hướng, xoay, đối xứng, ghép hình', pick('TD.KG', 'TO.HINH', extra=['TD.TTg.01']), ['TD.KG.15', 'TD.KG.16']),
 ('NL07', 'Trí nhớ hình ảnh', 'Nhớ hình, màu, vị trí đã thấy', pick(extra=['TD.TN.01', 'TD.TN.02', 'TD.TN.04', 'TD.TN.05', 'TD.TN.07', 'TD.TN.11']), ['TD.TN.13']),
 ('NL08', 'Trí nhớ thính giác', 'Nhớ lời, âm, chuỗi âm thanh', pick(extra=['TD.TN.06', 'TD.GN.01', 'TD.TN.10', 'TD.TN.12']), []),
 ('NL09', 'Trí nhớ làm việc', 'Giữ thông tin trong đầu để làm việc', pick(extra=['TD.TN.D01', 'TD.TN.08', 'TD.TN.09', 'TD.TT.05', 'TD.CY.01']), []),
 ('NL10', 'Liên tưởng', 'Nối sự vật theo quan hệ, công dụng, nơi sống', pick(extra=['TD.QH.01', 'KP.TG.03', 'KP.TG.07', 'TD.LG.04', 'TD.LG.05']), []),
 ('NL11', 'Tưởng tượng', 'Hình dung điều chưa thấy, giả vờ', pick('TD.TTg'), []),
 ('NL12', 'Sáng tạo', 'Tạo sản phẩm, nhiều cách giải quyết', pick('KP.ST', extra=['TD.GQ.01']), []),
 ('NL13', 'Tư duy tổng thể', 'Nhìn chi tiết nhận ra toàn cảnh, bộ phận và toàn thể', pick(extra=['TD.QH.02', 'TD.KG.04', 'TD.KG.08']), ['TD.QH.03']),
 ('NL14', 'Cảm thụ âm nhạc', 'Nhịp, to nhỏ, cao thấp, cảm xúc của nhạc', pick('KP.AN', only=['KP.AN.P01']), []),
 ('NL15', 'Cảm thụ mỹ thuật', 'Màu, sắc độ, bố cục, giữ gìn sản phẩm', pick(extra=['KP.ST.D01', 'KP.ST.D02', 'KP.AN.P01', 'KP.ST.01']), ['TD.QS.12']),
 ('NL16', 'Phối hợp tay mắt', 'Tô, nối, kéo chính xác', pick('TV.VT', extra=['TO.SO.01']), ['KP.VD.05']),
 ('NL17', 'Phối hợp hai bên cơ thể', 'Hai tay, hai chân phối hợp', pick(extra=['KP.VD.02', 'KP.VD.03', 'KP.VD.P02']), ['KP.VD.04']),
 ('NL18', 'Giải quyết vấn đề', 'Tìm cách, chọn công cụ, sửa lỗi', pick('TD.GQ', extra=['TD.CD.05', 'TD.LG.13', 'TD.VDg.01']), []),
]
def depth(n): return 'Đủ' if n >= 6 else 'Mỏng' if n >= 3 else 'Thiếu'

# ---- Kỹ năng đề xuất (CHƯA ghi vào skills.json; chờ tam duyệt). Không trùng kỹ năng cũ.
NEW_SKILLS = [
 ('TD.QS.12', 'Phân biệt sắc độ màu', 'Tư duy', 'Quan sát', '4–6', 'Xếp 3–5 sắc độ một màu từ nhạt đến đậm.', 'MT-02', 'Chưa có kỹ năng sắc độ; MT-02 tạm gắn TD.LG.01, TD.QS.09'),
 ('TO.DO.07', 'Xếp theo kích thước nhiều bậc', 'Toán', 'Đo lường', '5–6', 'Xếp 5 vật chênh nhau ít theo kích thước, dày mỏng.', 'MT-01', 'TD.LG.02 chỉ 3 vật, 4–5 tuổi'),
 ('TO.SO.07', 'Độ dài ứng với số (thanh số)', 'Toán', 'Nhận biết số', '4–6', 'Đếm đoạn trên thanh để biết số; ghép hai thanh thành thanh dài hơn.', 'MT-03', 'Chưa có cách biểu diễn số bằng độ dài'),
 ('TD.KG.15', 'Hoàn thiện hình đối xứng đơn giản', 'Tư duy', 'Không gian', '4–5', 'Chọn nửa còn lại của hình đối xứng ít ô.', 'MT-05', 'TD.KG.12 chỉ cho 5–6 tuổi'),
 ('TD.KG.16', 'Tái tạo mô hình theo mẫu', 'Tư duy', 'Không gian', '4–5', 'Xếp lại 3–4 khối hoặc ô giống hệt mẫu.', 'MT-08', 'TD.KG.11 là 5–6 tuổi, sơ đồ 3x3'),
 ('TD.TN.13', 'Ghi nhớ vị trí đồ vật', 'Tư duy', 'Trí nhớ', '4–5', 'Nhớ chỗ của 3 đồ vật sau khi bị che.', 'MT-07', 'TD.TN.11 (bản đồ) là 5–6 tuổi'),
 ('TD.QH.03', 'Nhận ra toàn thể từ chi tiết', 'Tư duy', 'Quan hệ', '4–6', 'Nhìn vài mảnh nhỏ đoán ra con vật, đồ vật.', 'MT-06', 'Tư duy tổng thể chỉ có ghép tranh'),
 ('KP.VD.04', 'Phối hợp hai tay', 'Khám phá', 'Vận động', '4–6', 'Một tay giữ, tay kia làm: gấp, xâu, vặn nắp (bố mẹ quan sát).', 'MT-12', 'Chưa có phối hợp hai bên cơ thể'),
 ('KP.VD.05', 'Vận động tinh của ngón tay', 'Khám phá', 'Vận động', '4–6', 'Nhặt, gắp, cài nút, xé dán (bố mẹ quan sát).', '–', 'Chỉ có tập tô trên màn hình'),
 ('KS.TP.02', 'Rót và chuyển đồ', 'Kỹ năng sống', 'Tự phục vụ', '4–6', 'Rót nước, xúc hạt từ bát này sang bát khác không đổ (Thực hành cuộc sống).', '–', 'Thiếu nhóm Thực hành cuộc sống Montessori'),
 ('KS.TP.03', 'Gấp quần áo, khăn', 'Kỹ năng sống', 'Tự phục vụ', '4–6', 'Gấp khăn, áo đơn giản và cất vào ngăn.', 'MT-12', 'KS.TP.01 chỉ có mặc, cởi'),
 ('KS.CS.02', 'Chăm sóc cây và con vật nuôi', 'Kỹ năng sống', 'Chăm sóc', '4–6', 'Tưới cây, cho vật nuôi ăn theo lịch cùng bố mẹ.', 'MT-11', 'KP.KH.01 là kiến thức, chưa có kỹ năng chăm sóc thật'),
 ('KP.TG.16', 'Đất, nước và địa cầu', 'Khám phá', 'Thế giới quanh bé', '5–6', 'Phân biệt đất liền và biển trên quả địa cầu, bản đồ đơn giản (Văn hóa Montessori).', '–', 'Vùng Văn hóa của Montessori còn mỏng'),
]

# ---- Montessori 5 vùng. Loại: A = làm đầy đủ trên app; B = mô phỏng trên app + thực hành ngoài đời; C = cần đồ thật.
def MA(ten, giao_cu, huong_dan, muc_tieu, tuoi, thu_tu, tu_sua, loai, skills, mau=''):
    return dict(ten=ten, giao_cu=giao_cu, huong_dan=huong_dan, muc_tieu=muc_tieu, tuoi=tuoi, thu_tu=thu_tu, tu_sua_loi=tu_sua, loai=loai, skill_ids=skills, mau=mau)
MONTESSORI = [
 dict(vung='Thực hành cuộc sống', en='Practical Life', muc_dich='Tự lập, phối hợp, tập trung, trật tự', hoat_dong=[
  MA('Rót nước từ bình sang cốc', 'Bình nhỏ có quai, 2 cốc, khay, khăn', 'Làm mẫu chậm, không nói nhiều; bé làm lại; đổ thì lau bằng khăn', 'Phối hợp tay mắt, tập trung', '4–5', 1, 'Nước tràn là bé tự thấy', 'C', ['KS.TP.02']),
  MA('Xúc hạt bằng thìa', 'Hai bát, hạt đậu to, thìa', 'Xúc từ trái sang phải', 'Vận động tinh', '4–5', 2, 'Hạt rơi ra khay', 'C', ['KP.VD.05']),
  MA('Gấp khăn', 'Khăn vuông có đường may chỉ dẫn', 'Gấp đôi theo đường, rồi gấp đôi lần nữa', 'Phối hợp hai tay, trật tự', '4–5', 3, 'Mép khăn không khớp', 'C', ['KS.TP.03', 'KP.VD.04'], 'MT-12'),
  MA('Rửa tay theo bước', 'Chậu, xà phòng, khăn', 'Từng bước có thứ tự', 'Vệ sinh, tuần tự', '4–5', 4, 'Tay còn bọt', 'B', ['KS.VS.01'], 'CC-18'),
  MA('Sắp xếp, cất đồ chơi', 'Khay, kệ có hình dán chỗ cất', 'Lấy ra, chơi, cất đúng chỗ', 'Trật tự, trách nhiệm', '4–6', 5, 'Hình dán trên kệ không khớp đồ', 'B', ['KS.SX.01', 'KS.NN.01'], 'CC-06'),
  MA('Chăm sóc cây', 'Bình tưới nhỏ, khăn lau lá', 'Tưới gốc, lau lá, quan sát', 'Trách nhiệm, khoa học', '4–6', 6, 'Đất khô hoặc đọng nước', 'B', ['KS.CS.02', 'KP.KH.01'], 'MT-11'),
  MA('Cài nút, kéo khóa (khung mặc đồ)', 'Áo có nút to, khóa kéo', 'Từng nút từ trên xuống', 'Tự phục vụ, vận động tinh', '4–6', 7, 'Nút lệch hàng', 'C', ['KS.TP.01', 'KP.VD.05']),
  MA('Ứng xử lịch sự', 'Không cần đồ', 'Nhập vai chào hỏi, xin phép, cảm ơn', 'Giao tiếp', '4–6', 8, 'Người lớn phản hồi', 'B', ['KS.GT.01'], 'CC-22')]),
 dict(vung='Cảm quan', en='Sensorial', muc_dich='Tinh chỉnh giác quan, so sánh, sắp thứ tự, chuẩn bị cho toán', hoat_dong=[
  MA('Tháp hồng (kích thước)', '10 khối hồng 1–10 cm', 'Xếp từ to đến nhỏ thành tháp', 'Phân biệt kích thước', '4–5', 1, 'Tháp đổ hoặc lệch thấy ngay', 'B', ['TD.LG.02', 'TO.DO.07'], 'MT-01'),
  MA('Cầu thang nâu (dày mỏng)', '10 thanh nâu cùng dài, dày khác nhau', 'Xếp thành cầu thang', 'Phân biệt độ dày', '4–6', 2, 'Bậc không đều', 'B', ['TO.DO.07'], 'MT-01'),
  MA('Thanh đỏ (dài ngắn)', '10 thanh đỏ 10–100 cm', 'Xếp từ ngắn đến dài', 'Độ dài, chuẩn bị thanh số', '4–6', 3, 'Mép phải không thành bậc', 'B', ['TO.DO.04', 'TO.DO.01']),
  MA('Hộp màu 2 (ghép đôi màu)', '11 cặp thẻ màu', 'Ghép hai thẻ cùng màu', 'Nhận biết màu', '4–5', 4, 'Còn thừa thẻ lẻ', 'A', ['TD.LG.01'], 'CC-08'),
  MA('Hộp màu 3 (sắc độ)', '9 màu × 7 sắc độ', 'Xếp từ nhạt đến đậm', 'Phân biệt sắc độ', '4–6', 5, 'Bé so cạnh nhau thấy lệch', 'B', ['TD.QS.12'], 'MT-02'),
  MA('Trụ âm thanh', '2 bộ 6 trụ lắc ra tiếng khác nhau', 'Ghép đôi trụ cùng tiếng', 'Phân biệt âm thanh', '4–6', 6, 'Còn trụ lẻ', 'B', ['KP.AN.D02', 'KP.KH.D02']),
  MA('Túi bí mật (xúc giác)', 'Túi vải, đồ vật quen', 'Sờ và đoán, rồi lấy ra xem', 'Xúc giác, ngôn ngữ', '4–6', 7, 'Lấy ra là thấy đúng sai', 'C', ['KP.TG.01']),
  MA('Hình học đặt khuôn và tái tạo mô hình', 'Khay hình, khối màu', 'Xếp khối giống thẻ mẫu', 'Không gian', '4–6', 8, 'So với thẻ mẫu', 'A', ['TD.KG.16', 'TD.KG.11'], 'MT-08'),
  MA('Tam giác cấu tạo, đối xứng', 'Các tam giác màu ghép thành hình', 'Ghép hai nửa thành hình', 'Đối xứng, hình học', '5–6', 9, 'Đường viền mẫu', 'A', ['TD.KG.12', 'TD.KG.15'], 'MT-05')]),
 dict(vung='Toán', en='Mathematics', muc_dich='Từ cụ thể đến trừu tượng: số lượng, ký hiệu, hệ thập phân', hoat_dong=[
  MA('Thanh số', '10 thanh đỏ xanh 1–10 đoạn', 'Đếm đoạn, gắn thẻ số', 'Số ứng độ dài', '4–6', 1, 'Thanh xếp thành bậc', 'B', ['TO.SO.07', 'TO.SO.02'], 'MT-03'),
  MA('Chữ số nhám', 'Thẻ chữ số giấy nhám', 'Tô theo chiều viết bằng ngón tay, nói tên số', 'Ký hiệu số, chuẩn bị viết', '4–6', 2, 'Ngón tay cảm thấy nhám', 'B', ['TO.SO.01', 'TV.VT.01'], 'MX-08'),
  MA('Hộp que (số lượng và số)', 'Hộp 0–9, 45 que', 'Đặt đúng số que vào ô', 'Số lượng, số 0', '4–5', 3, 'Đủ 45 que là đúng hết', 'A', ['TO.DEM.02', 'TO.SO.04'], 'CC-03'),
  MA('Thẻ số và hạt đếm (chẵn lẻ)', 'Thẻ 1–10, hạt đếm', 'Xếp hạt thành cặp dưới số', 'Số lượng', '5–6', 4, 'Hạt còn thừa', 'A', ['TO.DEM.05'], 'CC-17'),
  MA('Khung mười, nhóm mười', 'Khung 10 ô, hạt', 'Lấp đủ mười, đếm tiếp', 'Hệ thập phân sớm', '5–6', 5, 'Ô trống thấy ngay', 'A', ['TO.SO.06', 'TO.SO.05'], 'MT-04'),
  MA('Hạt vàng (đơn vị, chục, trăm)', 'Hạt lẻ, thanh 10, tấm 100', 'Đổi 10 hạt lẻ lấy một thanh', 'Hệ thập phân', '5–6 trở lên', 6, 'Đếm lại thanh', 'C', ['TO.SO.06'])]),
 dict(vung='Ngôn ngữ', en='Language', muc_dich='Nghe, nói, âm vị, chuẩn bị viết rồi đọc', hoat_dong=[
  MA('Trò chơi "Tôi thấy" (âm đầu)', 'Đồ vật quanh nhà', 'Người lớn nói âm đầu, bé tìm vật', 'Nhận thức âm vị', '4–6', 1, 'Người lớn đọc lại tên vật', 'B', ['TV.AM.02', 'TV.AM.04'], 'MT-09'),
  MA('Chữ cái nhám', 'Thẻ chữ giấy nhám', 'Tô chữ bằng ngón tay theo chiều viết, nói âm', 'Gắn âm với chữ', '5–6', 2, 'Cảm giác nhám', 'B', ['TV.CC.02', 'TV.VT.02'], 'CC-14'),
  MA('Bảng chữ di động', 'Hộp chữ cái rời', 'Ghép tiếng bằng chữ rời', 'Ghép âm', '5–6', 3, 'Người lớn đọc lại', 'B', ['TV.AM.08']),
  MA('Thẻ phân loại (từ vựng)', 'Thẻ tranh theo chủ đề', 'Gọi tên, phân nhóm', 'Từ vựng', '4–6', 4, 'Thẻ có hình mẫu', 'A', ['TV.TU.01', 'KP.TG.01'], 'CC-06'),
  MA('Khuôn kim loại (tiền viết)', 'Khuôn hình, bút chì', 'Tô quanh khuôn, tô kín bằng nét song song', 'Cầm bút, điều khiển nét', '5–6', 5, 'Nét ra ngoài viền', 'C', ['TV.VT.01', 'KP.VD.05'])]),
 dict(vung='Văn hóa', en='Cultural', muc_dich='Địa lý, khoa học, thực vật, động vật, nghệ thuật, âm nhạc', hoat_dong=[
  MA('Quả địa cầu đất và nước', 'Quả địa cầu nhám', 'Sờ phần đất nhám, phần nước nhẵn', 'Địa lý sớm', '5–6', 1, 'Cảm giác nhám, nhẵn', 'B', ['KP.TG.16']),
  MA('Bộ phận của cây, con vật', 'Tranh ghép bộ phận', 'Gọi tên từng bộ phận', 'Khoa học, từ vựng', '4–6', 2, 'Mảnh chỉ khớp một chỗ', 'A', ['TD.QH.02'], 'MX-01'),
  MA('Vòng đời', 'Thẻ tranh các giai đoạn', 'Xếp theo thứ tự', 'Tuần tự, khoa học', '5–6', 3, 'Thẻ có số mặt sau', 'A', ['KP.KH.05', 'KP.TG.05'], 'CC-07'),
  MA('Vật chìm, vật nổi', 'Chậu nước, đồ vật', 'Dự đoán rồi thả', 'Khám phá khoa học', '4–6', 4, 'Kết quả thật', 'B', ['KP.KH.03'], 'CC-19'),
  MA('Quan sát thiên nhiên', 'Kính lúp, sổ vẽ', 'Đi dạo, nhặt lá, vẽ lại', 'Quan sát', '4–6', 5, 'Không cần', 'C', ['TD.QS.01', 'KP.KH.02']),
  MA('Âm nhạc và nghệ thuật dân gian', 'Nhạc cụ đơn giản, tranh Đông Hồ', 'Nghe, gõ nhịp, xem tranh', 'Cảm thụ', '4–6', 6, 'Không cần', 'B', ['KP.AN.01', 'KP.TG.11'], 'CC-21')]),
]

# ---- Thư viện hoạt động ngoài màn hình (mục 7)
def OF(id, ten, tuoi, phut, vat_lieu, buoc, an_toan, quan_sat, skills, pp, mau=''):
    return dict(id=id, ten=ten, tuoi=tuoi, phut=phut, vat_lieu=vat_lieu, huong_dan_bo_me=buoc, an_toan=an_toan, cau_hoi_quan_sat=quan_sat, skill_ids=skills, pp=pp, mau=mau,
                luu_y='Hoàn thành trên app không có nghĩa là bé đã thành thạo việc thật. Bố mẹ ghi nhận bằng quan sát của mình.')
OFFSCREEN = [
 OF('NG-01', 'Rót nước', '4–6', 5, ['Bình nhựa nhỏ có quai', '2 cốc nhựa', 'Khay', 'Khăn lau'], ['Bố mẹ rót mẫu thật chậm, không nói', 'Bé rót từ bình sang cốc, rồi đổ lại', 'Đổ ra khay thì bé tự lấy khăn lau', 'Tăng dần: thêm vạch dừng trên cốc'], 'Dùng đồ nhựa, nước nguội', ['Bé có giữ bình bằng hai tay không?', 'Bé có dừng đúng vạch không?'], ['KS.TP.02', 'KP.VD.04'], ['PP-MON', 'PP-EXP']),
 OF('NG-02', 'Gấp quần áo', '4–6', 5, ['Khăn tay', 'Áo phông của bé'], ['Bắt đầu với khăn vuông: gấp đôi, gấp đôi lần nữa', 'Rồi áo phông: trải phẳng, gấp hai tay áo vào, gấp đôi', 'Bé cất vào ngăn của mình'], 'Không có', ['Bé có vuốt phẳng trước khi gấp không?'], ['KS.TP.03', 'KP.VD.04'], ['PP-MON', 'PP-EXP'], 'MT-12'),
 OF('NG-03', 'Sắp xếp đồ chơi', '4–6', 10, ['Hộp hoặc rổ', 'Hình dán lên hộp'], ['Dán hình lên mỗi hộp (khối, xe, búp bê)', 'Sau giờ chơi bé cất đúng hộp', 'Bố mẹ khen việc làm, không khen chung chung'], 'Không có', ['Bé tự cất khi chưa được nhắc không?'], ['KS.SX.01', 'KS.NN.01'], ['PP-EXP', 'PP-MON'], 'CC-06'),
 OF('NG-04', 'Phân loại đồ dùng', '4–6', 10, ['Thìa, đũa, nắp chai, kẹp', 'Khay chia ngăn hoặc bát'], ['Bé chia đồ theo loại', 'Rồi chia lại theo màu hoặc kích thước', '5–6 tuổi: bé tự nghĩ cách chia mới và nói lý do'], 'Không dùng đồ nhỏ dưới 3 cm với trẻ hay cho vào miệng', ['Bé có đổi được tiêu chí khi bố mẹ đổi luật không?'], ['TD.LG.01', 'TD.LG.09', 'TD.CY.01'], ['PP-PLAY', 'PP-COG'], 'CC-06'),
 OF('NG-05', 'Chăm sóc cây', '4–6', 5, ['Một chậu cây hoặc hạt đậu trong cốc bông ẩm', 'Bình tưới nhỏ'], ['Bé nhận chăm một cây', 'Mỗi ngày tưới một chút, xem lá', 'Vẽ hoặc chụp ảnh cây mỗi 2 ngày'], 'Rửa tay sau khi chạm đất', ['Bé có nhớ tưới mà không cần nhắc không?', 'Bé kể được cây thay đổi thế nào không?'], ['KS.CS.02', 'KP.KH.01', 'KS.TN.01'], ['PP-EXP', 'PP-INQ', 'PP-PROJ'], 'MT-11'),
 OF('NG-06', 'Quan sát thiên nhiên', '4–6', 15, ['Túi nhỏ', 'Kính lúp (nếu có)'], ['Đi dạo, nhặt 5 chiếc lá khác nhau', 'Về nhà xếp lá từ nhỏ đến to, nhạt đến đậm', 'Bé kể chiếc lá bé thích'], 'Không nhặt quả lạ, không cho vào miệng', ['Bé thấy điểm khác nào giữa các lá?'], ['TD.QS.01', 'KP.KH.02', 'TD.QS.12'], ['PP-INQ', 'PP-MON'], 'MT-02'),
 OF('NG-07', 'Vẽ tranh', '4–6', 15, ['Giấy A4', 'Bút sáp'], ['Bé vẽ tự do theo chủ đề buổi học', 'Bố mẹ hỏi "con kể cho mẹ nghe về tranh nhé"', 'Treo tranh hoặc cất vào hộp tranh'], 'Không có', ['Bé dùng mấy màu? Bé kể được gì?'], ['KP.ST.01', 'KP.AN.P01', 'TD.TTg.02'], ['PP-PLAY', 'PP-STORY']),
 OF('NG-08', 'Tập tô trên giấy', '5–6', 10, ['Giấy in nét chấm', 'Bút chì 2B ngắn'], ['Chỉ bắt đầu từ 5 tuổi', 'Tô nét cơ bản trước, rồi chữ cái đã học trên app', 'Ngồi đúng tư thế, cầm bút ba ngón', 'Dừng khi bé mỏi tay'], 'Không ép tô lâu quá 10 phút', ['Bé bắt đầu đúng điểm và đúng chiều nét không?'], ['TV.VT.01', 'TV.VT.02', 'TO.SO.02'], ['PP-SCAF', 'PP-MULTI'], 'CC-14'),
 OF('NG-09', 'Đếm đồ vật thật', '4–6', 5, ['Hạt đậu, cúc áo, thìa'], ['4–5 tuổi: đếm đến 10, chạm từng vật', '5–6 tuổi: đếm đến 20, bó mỗi 10 vật thành nhóm', 'Hỏi "có tất cả bao nhiêu?"'], 'Đồ nhỏ phải có người lớn trông', ['Bé có chạm mỗi vật một lần không?', 'Bé nói số cuối là tổng không?'], ['TO.DEM.02', 'TO.DEM.05', 'TO.SO.06'], ['PP-STEM', 'PP-MON'], 'CC-17'),
 OF('NG-10', 'Vận động phối hợp', '4–6', 10, ['Bóng nhẹ', 'Băng dính kẻ vạch'], ['Ném bắt bóng bằng hai tay', 'Đi trên vạch thẳng', 'Vỗ tay chéo: tay phải chạm gối trái'], 'Chỗ rộng, sàn không trơn', ['Bé giữ thăng bằng được bao lâu?'], ['KP.VD.02', 'KP.VD.03', 'KP.VD.04'], ['PP-COG', 'PP-EXP'], 'MT-12'),
 OF('NG-11', 'Giao tiếp', '4–6', 5, ['Không cần'], ['Bữa tối: mỗi người kể một điều vui, một điều buồn trong ngày', 'Tập chào, xin phép, cảm ơn khi đi chơi', 'Gọi tên cảm xúc khi bé giận'], 'Không có', ['Bé gọi tên được cảm xúc của mình không?'], ['EQ.CX.01', 'KS.GT.01', 'EQ.XH.01'], ['PP-SEL', 'PP-STORY'], 'CC-22'),
 OF('NG-12', 'Dự án nhỏ', '4–6', 20, ['Giấy màu, hộp giấy cũ, keo dán an toàn'], ['Cuối mỗi vùng đất: làm một sản phẩm (đèn lồng, nhà trên đảo, bù nhìn)', 'Bé chọn vật liệu, bố mẹ giúp phần cắt', 'Bé trình bày sản phẩm, chụp ảnh lưu vào Ngôi nhà của Lu'], 'Kéo và keo nóng do người lớn dùng', ['Bé tự nghĩ được ý tưởng nào?'], ['KP.ST.02', 'KP.ST.05', 'KP.ST.04'], ['PP-PROJ', 'PP-PLAY']),
]

# ---- Tích hợp 300 buổi (mục 8): theo vùng, không có chương trình riêng
PLAN = [
 (1, 'L001–L030', '4–5', 'Số 1–3, đếm chạm; nghe tiếng; cảm xúc cơ bản', ['PP-PLAY', 'PP-MULTI', 'PP-SCAF', 'PP-STORY'], ['Thực hành cuộc sống: rót, xúc hạt', 'Cảm quan: tháp hồng'], ['NG-01', 'NG-03', 'NG-09'], ['MT-01', 'MT-07', 'MT-11']),
 (2, 'L031–L060', '4–5', 'Số 4–5, hình; phân loại; lá cây', ['PP-INQ', 'PP-MON', 'PP-RETR', 'PP-SEL'], ['Cảm quan: sắc độ, thanh đỏ', 'Văn hóa: bộ phận cây'], ['NG-05', 'NG-06', 'NG-04'], ['MT-02', 'MT-06', 'MT-11']),
 (3, 'L061–L090', '4–5', 'Số 6–7; chìm nổi; ghép hình; âm đầu bằng tai', ['PP-INQ', 'PP-PHON', 'PP-SPACE', 'PP-PLAY'], ['Văn hóa: chìm nổi', 'Ngôn ngữ: trò chơi Tôi thấy'], ['NG-06', 'NG-10', 'NG-11'], ['MT-09', 'MT-05', 'MT-03']),
 (4, 'L091–L120', '4–5', 'Số 8–10; mê cung; thời tiết; nhớ chuỗi', ['PP-STEM', 'PP-RETR', 'PP-SCAF', 'PP-COG'], ['Toán: thanh số 1–10, hộp que', 'Cảm quan: trụ âm thanh'], ['NG-09', 'NG-10', 'NG-02'], ['MT-03', 'MT-04', 'MT-08']),
 (5, 'L121–L150', '4–5', 'Ôn 1–10; lễ hội; dự án đèn lồng', ['PP-PROJ', 'PP-STORY', 'PP-SEL', 'PP-SPACE'], ['Thực hành cuộc sống: gấp, cài nút', 'Văn hóa: lễ hội'], ['NG-12', 'NG-07', 'NG-11'], ['MT-10', 'MT-12']),
 (6, 'L151–L180', '5–6', '29 chữ cái, tập tô từ 5 tuổi; số 11–12', ['PP-PHON', 'PP-MULTI', 'PP-SCAF', 'PP-SPACE'], ['Ngôn ngữ: chữ nhám, bảng chữ di động', 'Toán: khung mười'], ['NG-08', 'NG-04', 'NG-11'], ['MT-09', 'MT-04', 'CC-14']),
 (7, 'L181–L210', '5–6', 'Số 13–15; đo lường; vòng đời; nhân quả', ['PP-INQ', 'PP-STEM', 'PP-MON', 'PP-EXP'], ['Cảm quan: cầu thang nâu', 'Văn hóa: vòng đời'], ['NG-05', 'NG-09', 'NG-02'], ['MT-01', 'MT-11', 'MT-03']),
 (8, 'L211–L240', '5–6', 'Số 16–18; đối xứng; quy luật; trí nhớ làm việc', ['PP-COG', 'PP-RETR', 'PP-STEM', 'PP-STORY'], ['Cảm quan: tam giác cấu tạo', 'Toán: hạt vàng (giới thiệu)'], ['NG-10', 'NG-06', 'NG-07'], ['MT-05', 'MT-07', 'MT-08']),
 (9, 'L241–L270', '5–6', 'Số 19–20; bản đồ; thiết kế; giải quyết vấn đề', ['PP-PROJ', 'PP-INQ', 'PP-PLAY', 'PP-SEL'], ['Văn hóa: địa cầu đất và nước'], ['NG-12', 'NG-06', 'NG-03'], ['MT-06', 'MT-10']),
 (10, 'L271–L300', '5–6', 'Chuẩn bị lớp 1: ôn chữ, số đến 20, thời gian biểu, tự lập', ['PP-SPACE', 'PP-RETR', 'PP-EXP', 'PP-SEL'], ['Thực hành cuộc sống: tự chuẩn bị cặp, gấp quần áo'], ['NG-02', 'NG-08', 'NG-11'], ['MT-04', 'MT-09', 'MT-12']),
]
PLAN_RULES = [
 'Giữ nguyên 300 buổi, câu chuyện, mục tiêu và mẫu buổi đã duyệt (D42, D46, D47): mỗi buổi ≥ 20 phút học thật (mục tiêu 25–30), 12–16 thẻ bài nhỏ, đủ 13 nhóm năng lực.',
 'Phương pháp là CÁCH dạy gắn vào thẻ bài, không phải môn mới: mỗi thẻ ghi mã phương pháp (pp) và năng lực (nl). Không bắt buộc mọi buổi dùng mọi phương pháp; mỗi buổi dùng ít nhất 4 phương pháp khác nhau.',
 'Mỗi buổi có 1 thẻ hoạt động ngoài màn hình (loại B hoặc C) chọn từ thư viện NG-01..NG-12, không khóa bài nếu bé chưa làm.',
 'Mỗi buổi có ít nhất 1 thẻ ôn cách quãng (kiến thức của buổi trước 1, 3 và 7 buổi) lấy từ ngân hàng luyện tập không giới hạn.',
 'Giữ 6 năng lực Chim Đa Đa (Tư duy, Quan sát, Chú ý, Ghi nhớ, Nhận thức, Tưởng tượng) làm trục chính; 18 năng lực nhận thức là lớp phân tích chi tiết hơn, ánh xạ về 6 năng lực này.',
 'Số 1–10 ở năm 1 (4–5 tuổi), 11–20 ở năm 2 (5–6 tuổi). Đủ 29 chữ cái ở năm 2; tập tô chữ chỉ từ 5 tuổi (năm 2). Tiếng Anh và EQ giữ chương trình riêng.',
 'Cảm quan Montessori đi trước toán tương ứng (thanh đỏ trước thanh số, tháp hồng trước so sánh nhiều bậc).',
 'Làm theo từng đợt nhỏ như D47 (L004–L006 trước), mỗi đợt qua kiểm thử rồi mới làm tiếp.',
]

ACTIVITY_TYPES = {
 'co': ['Chạm chọn', 'Chọn nhiều', 'Kéo thả', 'Ghép cặp', 'Nối', 'Phân loại', 'Xếp trình tự (tranh, kích thước, sắc độ)', 'Lật thẻ', 'Tìm trong tranh', 'Tìm điểm khác', 'Vật biến mất', 'Xoay hình', 'Ghép mảnh', 'Mê cung', 'Tô theo nét', 'Vẽ tự do', 'Tô màu', 'Đếm chạm', 'Mô phỏng trạng thái', 'Mô phỏng thí nghiệm', 'Nhịp, chuỗi âm', 'Hội thoại, truyện rẽ nhánh', 'Hình dán sáng tạo', 'Ngoài màn hình có bố mẹ xác nhận'],
 'moi_lam': ['Ghi nhớ vị trí (E06 where)', 'Tái tạo mô hình có tự sửa lỗi (E06 copy)', 'Nhìn qua lỗ nhận ra toàn cảnh (peek)', 'Thanh số và khung năm, khung mười (hình dựng bằng mã)', 'Hoàn thiện hình đối xứng'],
 'con_thieu': ['Ghép đôi âm thanh (trụ âm thanh): làm bằng E05 với thẻ âm thanh', 'Luật lịch ôn cách quãng trong ngân hàng luyện tập', 'Đổi luật giữa chừng (PT-11, cần thêm chế độ E03)', 'Nhật ký dự án nhiều buổi (ảnh sản phẩm do bố mẹ chụp)', 'Kéo thả xây tháp (xếp chồng) thay cho chạm theo thứ tự'],
}

def build():
    ab = []
    for id, ten, mo_ta, ks, de_xuat in AB:
        mau = sorted({s['id'] for s in SAMPLES['samples'] if id in s.get('nl', [])})
        ab.append(dict(id=id, ten=ten, mo_ta=mo_ta, so_ky_nang=len(ks), muc=depth(len(ks)), skill_ids=ks, de_xuat=de_xuat, mau=mau))
    errs = []
    for m in METHODS:
        for k in m['skill_ids']:
            if k not in SK: errs.append(f"{m['id']}: kỹ năng {k} không có")
        for s in m['mau']:
            if s not in SID: errs.append(f"{m['id']}: mẫu {s} không có")
    for v in MONTESSORI:
        for a in v['hoat_dong']:
            if a['loai'] not in 'ABC': errs.append(a['ten'])
            for k in a['skill_ids']:
                if k not in SK and k not in {n[0] for n in NEW_SKILLS}: errs.append(f"Montessori {a['ten']}: kỹ năng {k} không có")
            if a['mau'] and a['mau'] not in SID: errs.append(f"Montessori {a['ten']}: mẫu {a['mau']}")
    for n in NEW_SKILLS:
        if n[0] in SK: errs.append(f'kỹ năng đề xuất {n[0]} trùng mã đã có')
    names = {v['ten'].lower() for v in SK.values()}
    for n in NEW_SKILLS:
        if n[1].lower() in names: errs.append(f'kỹ năng đề xuất trùng tên: {n[1]}')
    for o in OFFSCREEN:
        for k in o['skill_ids']:
            if k not in SK and k not in {n[0] for n in NEW_SKILLS}: errs.append(f"{o['id']}: kỹ năng {k}")
    pp_ids = {m['id'] for m in METHODS}
    for s in SAMPLES['samples']:
        for p in s.get('pp', []):
            if p not in pp_ids: errs.append(f"{s['id']}: mã phương pháp {p}")
    for r in PLAN:
        for p in r[4]:
            if p not in pp_ids: errs.append(f'vùng {r[0]}: {p}')
        for o in r[6]:
            if o not in {x['id'] for x in OFFSCREEN}: errs.append(f'vùng {r[0]}: {o}')
        for s in r[7]:
            if s not in SID: errs.append(f'vùng {r[0]}: mẫu {s}')
    if errs: print('\n'.join(errs)); sys.exit(1)
    mon_count = {k: sum(a['loai'] == k for v in MONTESSORI for a in v['hoat_dong']) for k in 'ABC'}
    return dict(format='lu-methodology', version='1.0.0', ngay='2026-11-26', trang_thai='cho_duyet',
                nguyen_tac=['Chỉ bổ sung, không thay thế giáo trình đã duyệt', 'Không gắn nhãn não trái, não phải; không hứa tăng IQ hay tạo thiên tài',
                            'Lu lấy cảm hứng từ Montessori, không phải chương trình Montessori chuẩn', 'Không số hóa mọi thứ: loại B, C cần đồ thật',
                            'Hoàn thành trò chơi không đồng nghĩa thành thạo kỹ năng thật (D24)', 'Không gọi AI khi bé học (D18)'],
                bang_chung=EVIDENCE, methods=METHODS, abilities=ab, new_skills=[dict(id=a, ten=b, nhom=c, nhanh=d, tuoi=e, muc_tieu=f, mau=g, ly_do=h) for a, b, c, d, e, f, g, h in NEW_SKILLS],
                montessori=MONTESSORI, montessori_abc=mon_count, offscreen=OFFSCREEN, activity_types=ACTIVITY_TYPES,
                plan=[dict(vung=a, bai=b, tuoi=c, trong_tam=d, pp=e, montessori=f, ngoai_man_hinh=g, mau=h) for a, b, c, d, e, f, g, h in PLAN], plan_rules=PLAN_RULES,
                rep20=SAMPLES.get('rep20', []))

if __name__ == '__main__':
    out = build()
    p = os.path.join(ROOT, 'content/lab/methodology.json')
    json.dump(out, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"{len(out['methods'])} phương pháp, {len(out['abilities'])} năng lực, {sum(len(v['hoat_dong']) for v in out['montessori'])} hoạt động Montessori {out['montessori_abc']}, {len(out['offscreen'])} hoạt động ngoài màn hình, {len(out['new_skills'])} kỹ năng đề xuất -> {p}")
    for a in out['abilities']: print(f"  {a['id']} {a['ten']}: {a['so_ky_nang']} kỹ năng ({a['muc']}), mẫu {', '.join(a['mau'])}")

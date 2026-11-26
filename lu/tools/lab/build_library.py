# -*- coding: utf-8 -*-
"""Thư viện phương thức giảng dạy (Teaching Method Library) + đánh giá 26 cơ chế tương tác.
Sinh content/lab/library.json. Chạy sau build_samples.py:  python3 tools/lab/build_library.py

Quy ước mã (không ghi đè mã đang dùng):
- M001–M100: mã tham chiếu TẠM của chỉ thị, chỉ dùng để đối chiếu.
- M01–M58: mã cơ chế (MECH) đang dùng trong giao-trinh-2.0/src/banks.py, giữ nguyên.
- E00–E15: mã engine đang dùng, giữ nguyên.
- PT-01…: phương thức đã hợp nhất (mới). CC-01…CC-26: 26 cơ chế tương tác của trẻ (mới, theo mục IV).
"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAMPLES = json.load(open(os.path.join(ROOT, 'content/lab/samples.json'), encoding='utf-8'))
SID = {s['id']: s for s in SAMPLES['samples']}

REF_NAMES = {}  # M001..M100 theo chỉ thị
_ref = """Giới thiệu kiến thức bằng hình ảnh và lời thoại|Giải thích từng bước|Giải thích cấu tạo và các bộ phận|So sánh sự vật và hiện tượng|Giảng bài kết hợp câu hỏi tương tác|Kể chuyện minh họa|Kể chuyện tương tác từng cảnh|Lựa chọn diễn biến câu chuyện|Dự đoán diễn biến tiếp theo|Khám phá kiến thức thông qua nhiệm vụ phiêu lưu|Tìm điểm khác biệt|Tìm đồ vật ẩn|Tìm hình giống nhau|Ghép hình với bóng|Tìm chi tiết còn thiếu|Tìm đối tượng theo nhiều điều kiện|Nghe và thực hiện chỉ dẫn|Tìm mục tiêu giữa yếu tố gây nhiễu|Thực hiện nhiệm vụ theo trình tự|Thay đổi quy tắc trong quá trình chơi|Lật thẻ tìm cặp|Ghi nhớ vị trí|Tìm đồ vật biến mất|Ghi nhớ và tái tạo trình tự|Ghi nhớ chuỗi âm thanh|Hoàn thiện quy luật|Tìm đối tượng khác nhóm|Phân loại theo nhiều đặc điểm|Suy luận từ manh mối|Nhận biết nguyên nhân và kết quả|Giải mê cung|Xoay hình|Ghép mảnh thành hình|Nhận biết vị trí và phương hướng|Tái tạo mô hình|Ghép động vật với môi trường sống|Ghép đồ vật với công dụng|Ghép nghề nghiệp với dụng cụ|Ghép bộ phận với sự vật|Sắp xếp các giai đoạn phát triển|Hoàn thiện hình vẽ|Tạo nhân vật|Trang trí không gian|Tưởng tượng kết thúc câu chuyện|Tìm nhiều giải pháp|Nghe và nhận diện số|Đếm bằng thao tác chạm|Ghép số với số lượng|Lấy đúng số lượng|Sắp xếp và tìm số còn thiếu|So sánh và đo lường trực quan|Tách gộp|Thêm bớt|Chia đồ vật|Toán tình huống|Nghe và nhận diện chữ|Tìm chữ trong nhóm chữ|Ghép chữ thường với chữ hoa|Phân biệt chữ dễ nhầm|Nhận diện chữ trong từ|Tô đường nét cơ bản|Tô chữ cái|Tô chữ số|Nối điểm|Vẽ theo mẫu|Nghe chuyện và trả lời|Mô tả tranh|Sắp xếp tranh và kể chuyện|Nhận biết âm thanh ngôn ngữ, tiếng và vần|Hoàn thiện câu và diễn đạt ý tưởng|Nghe từ và chọn hình|Nghe câu và thực hiện hành động|Nhìn hình và nói từ|Hội thoại nhập vai|Học qua bài hát và câu chuyện|Nhận diện cảm xúc|Hiểu nguyên nhân cảm xúc|Lựa chọn cách phản ứng|Nhập vai và thấu cảm|Thực hành điều hòa cảm xúc|Mô phỏng thí nghiệm|Dự đoán và quan sát kết quả|Khám phá vòng đời|Khám phá cấu tạo|Khám phá môi trường và hệ sinh thái|Mô phỏng công việc hằng ngày|Sắp xếp trình tự công việc|Nhận diện tình huống an toàn và nguy hiểm|Nhập vai xử lý tình huống|Thực hành ngoài màn hình|Nhận diện âm thanh|Ghép âm thanh với sự vật|Gõ theo nhịp|Ghi nhớ tiết tấu|Hát và vận động theo nhạc|Tô màu tự do|Vẽ tranh|Cắt ghép mô phỏng và tạo hình|Bắt chước tư thế và vận động|Sáng tạo thực tế cùng bố mẹ""".split('|')
assert len(_ref) == 100
for i, n in enumerate(_ref, 1): REF_NAMES[f'M{i:03d}'] = n

def R(*nums): return [f'M{n:03d}' for n in nums]
OK, EXT, NEW = 'Đã có sẵn', 'Cần mở rộng', 'Mới bổ sung'
# (mã, tên Việt, tên Anh, nhóm phương pháp, mã tham chiếu, MECH đang dùng, cơ chế CC, engine, mẫu, tình trạng, giới hạn đánh giá)
M = [
 ('PT-01', 'Lu giảng bằng hình và câu hỏi', 'Illustrated mini-lecture with checks', 'Giảng bài', R(1, 2, 3, 5, 84), [], ['CC-01', 'CC-09'], ['E00 teach'], ['MX-01'], NEW, 'Chấm phần câu hỏi cuối; phần nghe giảng và khám phá chỉ ghi tham gia.'),
 ('PT-02', 'So sánh và đo trực quan', 'Visual comparison and measuring', 'Giảng bài', R(4, 51), ['M04', 'M05', 'M08', 'M09'], ['CC-01', 'CC-07'], ['E01 items', 'E04 order'], [], OK, 'Chấm được khi có một đáp án rõ (nhiều hơn, cao hơn).'),
 ('PT-03', 'Kể chuyện tương tác, chọn diễn biến', 'Interactive branching story', 'Kể chuyện', R(6, 7, 8, 10, 44), ['M48'], ['CC-23', 'CC-25'], ['E10', 'E00'], ['CC-23'], NEW, 'Lựa chọn diễn biến không chấm đúng sai; chỉ chấm câu hỏi hiểu chuyện.'),
 ('PT-04', 'Dự đoán rồi quan sát', 'Predict, then observe', 'Kể chuyện', R(9, 82), ['M53'], ['CC-23', 'CC-19'], ['E10 du-doan', 'E11 sinkfloat'], ['CC-23', 'CC-19'], NEW, 'Dự đoán không chấm; ghi lại dự đoán khớp hay không để bố mẹ trò chuyện.'),
 ('PT-05', 'Tìm điểm khác biệt', 'Spot the difference', 'Quan sát', R(11, 15), ['M25'], ['CC-09'], ['E06 diff'], ['MX-02'], NEW, 'Chấm theo số điểm khác tìm được và số lần chạm nhầm.'),
 ('PT-06', 'Tìm đồ vật ẩn trong tranh', 'Hidden objects', 'Quan sát', R(12), ['M11', 'M26', 'M41'], ['CC-09'], ['E06 scene'], ['CC-09'], NEW, 'Chấm được; vật ẩn phải nhìn thấy được, không che quá một nửa.'),
 ('PT-07', 'Tìm hình giống, ghép hình với bóng', 'Matching shapes and shadows', 'Quan sát', R(13, 14), ['M10'], ['CC-03'], ['E02 shadow'], [], OK, 'Chấm được.'),
 ('PT-08', 'Tìm theo nhiều điều kiện giữa yếu tố nhiễu', 'Multi-condition search', 'Chú ý', R(16, 18), ['M28'], ['CC-02'], ['E06 multi', 'E06'], ['CC-02'], NEW, 'Chấm được; vật nhiễu chỉ sai một điều kiện để bé phải xét đủ.'),
 ('PT-09', 'Nghe và làm theo chỉ dẫn vị trí', 'Follow spoken directions', 'Chú ý', R(17, 34, 72), ['M30', 'M32'], ['CC-10'], ['E11 place'], ['CC-10', 'MX-10'], NEW, 'Chấm được; trái phải tính theo phía bé nhìn.'),
 ('PT-10', 'Làm việc theo trình tự', 'Step-by-step routines', 'Chú ý', R(19, 86, 87), ['M13'], ['CC-18', 'CC-07'], ['E11 steps', 'E04'], ['CC-18'], NEW, 'Chấm thứ tự bước; kỹ năng thật cần bố mẹ quan sát ngoài đời.'),
 ('PT-11', 'Đổi quy tắc giữa chừng', 'Rule switching', 'Chú ý', R(20), [], ['CC-06'], ['E03 (cần thêm chế độ đổi luật)'], [], EXT, 'Chấm được khi engine hỗ trợ đổi luật giữa lượt.'),
 ('PT-12', 'Lật thẻ tìm cặp, nhớ vị trí', 'Memory cards', 'Ghi nhớ', R(21, 22), ['M21'], ['CC-08'], ['E05'], ['CC-08'], OK, 'Chấm theo số lần lật nhầm; lật sai không báo sai (quy tắc tam).'),
 ('PT-13', 'Tìm đồ vật biến mất', 'What is missing?', 'Ghi nhớ', R(23), ['M22'], ['CC-01'], ['E06 vanish'], ['MX-03'], NEW, 'Chấm được; luôn có nút Xem lại để không gây áp lực.'),
 ('PT-14', 'Nhớ và tái tạo chuỗi hình, âm, tiết tấu', 'Sequence memory', 'Ghi nhớ', R(24, 25, 94), ['M23'], ['CC-20'], ['E12 seq'], ['MX-04'], NEW, 'Chấm theo độ dài chuỗi nhớ đúng.'),
 ('PT-15', 'Hoàn thiện quy luật', 'Complete the pattern', 'Tư duy logic', R(26), ['M17'], ['CC-01'], ['E04 pattern'], ['MX-05'], OK, 'Chấm được.'),
 ('PT-16', 'Khác nhóm và phân loại nhiều đặc điểm', 'Odd one out and sorting', 'Tư duy logic', R(27, 28), ['M18', 'M19'], ['CC-06'], ['E03', 'E01 items'], ['CC-06'], OK, 'Chấm được khi tiêu chí phân loại rõ ràng.'),
 ('PT-17', 'Suy luận từ manh mối', 'Reasoning from clues', 'Tư duy logic', R(29), ['M20'], ['CC-01'], ['E01 clue'], ['MX-06'], NEW, 'Chấm được; engine kiểm tra mỗi manh mối loại ít nhất một hình và còn đúng một đáp án.'),
 ('PT-18', 'Nguyên nhân và kết quả', 'Cause and effect', 'Tư duy logic', R(30, 77), [], ['CC-22'], ['E10 hieu'], ['CC-22'], NEW, 'Chấm câu hỏi có một đáp án rõ.'),
 ('PT-19', 'Giải mê cung', 'Maze', 'Tư duy không gian', R(31), ['M24', 'M31'], ['CC-13'], ['E07'], ['CC-13'], NEW, 'Chấm hoàn thành và số lần đụng tường; không tính giờ.'),
 ('PT-20', 'Xoay hình', 'Mental rotation', 'Tư duy không gian', R(32), ['M33'], ['CC-11'], ['E08 rotate'], ['CC-11'], NEW, 'Chấm hoàn thành và số lần xoay.'),
 ('PT-21', 'Ghép mảnh, tái tạo mô hình', 'Jigsaw and rebuild', 'Tư duy không gian', R(33, 35), ['M12', 'M27'], ['CC-12'], ['E08 jigsaw'], ['CC-12'], NEW, 'Chấm được.'),
 ('PT-22', 'Ghép theo quan hệ (nơi sống, công dụng, nghề, bộ phận)', 'Relational matching', 'Nhận thức', R(36, 37, 38, 39), ['M03'], ['CC-04', 'CC-05'], ['E02 pair', 'E02 line'], ['CC-04', 'CC-05'], NEW, 'Chấm được; quan hệ phải là kiến thức phổ biến, có chuyên môn xác nhận.'),
 ('PT-23', 'Sắp xếp giai đoạn, tranh kể lại', 'Sequencing pictures and retelling', 'Nhận thức', R(40, 68, 83), ['M09', 'M37'], ['CC-07'], ['E04 cards'], ['CC-07'], NEW, 'Chấm thứ tự tranh; phần kể lại bằng lời không chấm.'),
 ('PT-24', 'Hoàn thiện hình vẽ, tạo nhân vật, nhiều giải pháp', 'Open-ended drawing completion', 'Tưởng tượng', R(41, 42, 45), ['M54'], ['CC-25', 'CC-15'], ['E14 draw'], ['CC-25'], NEW, 'Không chấm đúng sai; ghi tham gia và ý tưởng bé chọn.'),
 ('PT-25', 'Trang trí không gian, cắt ghép tạo hình', 'Sticker scenes and decoration', 'Tưởng tượng', R(43, 98), ['M55'], ['CC-24'], ['E14 sticker'], ['CC-24'], NEW, 'Không chấm; lưu sản phẩm vào tủ tranh.'),
 ('PT-26', 'Nghe số, đếm chạm, nhìn nhanh nhớ số', 'Counting and subitizing', 'Chữ số', R(46, 47), ['M01', 'M02'], ['CC-17'], ['E01 count', 'E01 flash'], ['CC-17', 'MX-11'], OK, 'Chấm được.'),
 ('PT-27', 'Ghép số với số lượng, lấy đúng số lượng', 'Number–quantity matching', 'Chữ số', R(48, 49), ['M03'], ['CC-03'], ['E02 pair'], ['CC-03'], OK, 'Chấm được.'),
 ('PT-28', 'Sắp xếp số, tìm số còn thiếu', 'Ordering numbers', 'Chữ số', R(50), ['M09'], ['CC-07'], ['E04 order'], [], OK, 'Chấm được.'),
 ('PT-29', 'Thêm bớt, tách gộp, chia, toán tình huống', 'Hands-on add, take away, split', 'Toán tư duy', R(52, 53, 54, 55), ['M06', 'M07'], ['CC-17', 'CC-10'], ['E11 tray'], ['MX-07'], NEW, 'Chấm kết quả số; thao tác thêm bớt chỉ ghi tham gia.'),
 ('PT-30', 'Nhận diện chữ, phân biệt chữ dễ nhầm', 'Letter recognition', 'Chữ cái tiếng Việt', R(56, 57, 59), ['M41'], ['CC-01'], ['E01 items'], ['CC-01'], OK, 'Chấm được; không chấm phát âm của bé.'),
 ('PT-31', 'Chữ thường với chữ hoa, chữ trong từ', 'Upper/lower case, letters in words', 'Chữ cái tiếng Việt', R(58, 60), ['M43'], ['CC-04'], ['E02 pair'], [], OK, 'Chấm được; cần nội dung chữ hoa.'),
 ('PT-32', 'Tô nét, chữ, số; nối điểm; vẽ theo mẫu', 'Tracing strokes, letters, digits', 'Tập tô', R(61, 62, 63, 64, 65), ['M42'], ['CC-14'], ['E13 trace'], ['CC-14', 'MX-08'], NEW, 'Chỉ ghi tham gia và số lần tô lại; nối điểm và vẽ theo mẫu cần thêm chế độ.'),
 ('PT-33', 'Nghe chuyện trả lời, mô tả tranh, hoàn thiện câu', 'Listening comprehension', 'Tiếng Việt', R(66, 67, 70), ['M36', 'M38'], ['CC-22', 'CC-01'], ['E10 hieu', 'E01 items'], ['CC-23'], OK, 'Chấm câu hỏi hiểu; nói và mô tả không chấm.'),
 ('PT-34', 'Âm, tiếng và vần', 'Phonological awareness', 'Tiếng Việt', R(69), ['M39', 'M40'], ['CC-21', 'CC-04'], ['E12 rhythm', 'E02'], [], OK, 'Vỗ tay đếm tiếng chấm theo số tiếng; không chấm phát âm.'),
 ('PT-35', 'Tiếng Anh: nghe từ chọn hình, nhìn hình nói từ', 'English listen-and-touch', 'Tiếng Anh', R(71, 73), ['M44', 'M46'], ['CC-01'], ['E01 listen', 'E15 say'], ['MX-09'], OK, 'Chấm phần nghe; nói theo không chấm.'),
 ('PT-36', 'Tiếng Anh: hội thoại nhập vai, bài hát, câu chuyện', 'English role-play and songs', 'Tiếng Anh', R(74, 75), ['M45', 'M47'], ['CC-22', 'CC-26'], ['E10', 'E15'], [], OK, 'Chấm câu chọn trả lời; hát và vận động chỉ ghi tham gia.'),
 ('PT-37', 'Cảm xúc: nhận diện, chọn cách phản ứng, thấu cảm', 'Emotions and responses', 'EQ', R(76, 78, 79), ['M48', 'M49', 'M50'], ['CC-22'], ['E10'], ['CC-22'], NEW, 'Nhận diện cảm xúc chấm được; cách phản ứng là lựa chọn mở, Lu giải thích từng lựa chọn.'),
 ('PT-38', 'Điều hòa cảm xúc', 'Calming practice', 'EQ', R(80), ['M51'], ['CC-26'], ['E15 breath'], [], OK, 'Không chấm.'),
 ('PT-39', 'Mô phỏng thí nghiệm', 'Simulated experiments', 'Khoa học', R(81), ['M52'], ['CC-19'], ['E11 sinkfloat'], ['CC-19'], NEW, 'Dự đoán không chấm; lời giải thích khoa học cần chuyên môn duyệt.'),
 ('PT-40', 'Môi trường sống và hệ sinh thái', 'Habitats', 'Khoa học', R(85), [], ['CC-06', 'CC-05'], ['E03', 'E02 line'], ['CC-06', 'CC-05'], OK, 'Chấm được với các trường hợp rõ ràng.'),
 ('PT-41', 'An toàn, nguy hiểm và xử lý tình huống', 'Safety situations', 'Kỹ năng sống', R(88, 89), ['M50'], ['CC-22', 'CC-06'], ['E10', 'E03'], [], OK, 'Chấm nhận diện an toàn/nguy hiểm; nhập vai không chấm.'),
 ('PT-42', 'Thực hành ngoài màn hình cùng bố mẹ', 'Off-screen practice with parents', 'Kỹ năng sống', R(90, 100), ['M56', 'M58'], ['CC-26'], ['E15 do'], ['CC-26'], OK, 'Chỉ ghi tham gia, bố mẹ xác nhận.'),
 ('PT-43', 'Nhận diện âm thanh, ghép âm với vật', 'Sound identification', 'Âm nhạc', R(91, 92), [], ['CC-20'], ['E12 identify'], ['CC-20'], NEW, 'Chấm được.'),
 ('PT-44', 'Gõ theo nhịp', 'Rhythm tapping', 'Âm nhạc', R(93), ['M57'], ['CC-21'], ['E12 rhythm'], ['CC-21'], NEW, '4–5 tuổi chỉ chấm số tiếng; 5–6 tuổi chấm thêm ngắn dài, cho phép lệch nhiều.'),
 ('PT-45', 'Hát, vận động, bắt chước tư thế', 'Sing, move, imitate', 'Nghệ thuật và vận động', R(95, 99), ['M45', 'M56'], ['CC-26'], ['E15'], [], OK, 'Không chấm.'),
 ('PT-46', 'Tô màu và vẽ tranh', 'Colouring and drawing', 'Nghệ thuật và vận động', R(96, 97), ['M54'], ['CC-16', 'CC-15'], ['E13 color', 'E14 draw'], ['CC-16', 'CC-15'], NEW, 'Tô tự do không chấm; tô theo số chấm đúng màu từng vùng.'),
]

# Đánh giá 26 cơ chế: (CC, engine, đánh giá, đã có trước, bổ sung lần này)
CC = {
 'CC-01': ('E01', OK, 'E01 items/count/listen', 'Chế độ clue (manh mối), flash (nhìn nhanh); thẻ chữ cái lớn'),
 'CC-02': ('E06 multi', EXT, 'E06 chạm nhiều vật cùng loại', 'Chế độ multi: loại + màu + kích thước, điều kiện "không phải"'),
 'CC-03': ('E02', OK, 'E02 shadow/pair, kéo hoặc chạm-chạm', 'Chỉ thêm nội dung'),
 'CC-04': ('E02 pair', OK, 'E02 pair', 'Hình đồ vật và công dụng mới'),
 'CC-05': ('E02 line', NEW, 'Chưa có', 'Chế độ line: kéo đường nối hai cột, có chạm-chạm'),
 'CC-06': ('E03', OK, 'E03 phân loại 2–3 nhóm', 'Chưa có đổi luật giữa chừng (cần mở rộng)'),
 'CC-07': ('E04 cards', EXT, 'E04 order/pattern', 'Chế độ cards: xếp 3–5 tranh vào ô số rồi kể lại'),
 'CC-08': ('E05', OK, 'E05 lật thẻ', 'Cặp liên quan (mẹ và con) cho 5–6 tuổi; quy tắc tam: sai im lặng, đúng "ting"'),
 'CC-09': ('E06 scene', NEW, 'E06 tìm trong lưới', 'Chế độ scene: vật ẩn trên tranh nền thật, bụi cỏ che; diff: tìm điểm khác'),
 'CC-10': ('E11 place', NEW, 'Chưa có', 'Chế độ place: vùng đích trong/trên/dưới/trái/phải, nghe hai lệnh liền nhau'),
 'CC-11': ('E08 rotate', NEW, 'Chưa có (E08 chỉ có trong danh mục)', 'Engine E08 chế độ rotate'),
 'CC-12': ('E08 jigsaw', NEW, 'Chưa có', 'Engine E08 chế độ jigsaw, tranh mờ làm mẫu cho 4–5 tuổi'),
 'CC-13': ('E07', NEW, 'Chưa có', 'Engine E07: mê cung sinh theo seed, luôn có đường đi, nhặt vật'),
 'CC-14': ('E13 trace', NEW, 'Chưa có', 'Engine E13: tô theo nét ba bước (xem mẫu, có hỗ trợ, tự tô); dữ liệu nét chữ và số'),
 'CC-15': ('E14 draw', NEW, 'Chưa có', 'Engine E14 chế độ draw: bút sáp, hoàn tác, Lu hỏi bé vẽ gì'),
 'CC-16': ('E13 color', NEW, 'Chưa có', 'Chế độ color: tô tự do và tô theo số'),
 'CC-17': ('E01 count', OK, 'E01 count', 'Khung mười cho số 11–20'),
 'CC-18': ('E11 steps', NEW, 'Chưa có', 'Chế độ steps: chọn đồ vật cho từng bước, hình đổi trạng thái'),
 'CC-19': ('E11 sinkfloat', NEW, 'Chưa có (E11 chỉ có trong danh mục)', 'Chế độ sinkfloat: đoán, thả, quan sát, giải thích'),
 'CC-20': ('E12 identify', NEW, 'Chưa có', 'Engine E12: âm nhạc cụ tổng hợp trong trình duyệt, rèm che'),
 'CC-21': ('E12 rhythm', NEW, 'Chưa có', 'Chế độ rhythm: chấm tiết tấu, chấm nhịp cho 5–6 tuổi'),
 'CC-22': ('E10', NEW, 'Chưa có (E10 chỉ có trong danh mục)', 'Engine E10: cảnh nối nhau, câu hỏi có đáp án và lựa chọn mở'),
 'CC-23': ('E10', NEW, 'E00 kể chuyện tuyến tính', 'E10 rẽ nhánh nhiều kết thúc, câu đoán'),
 'CC-24': ('E14 sticker', NEW, 'Chưa có', 'Chế độ sticker: kéo hình dán vào tranh, lưu tủ tranh'),
 'CC-25': ('E14 draw (hình gợi ý)', NEW, 'Chưa có', 'Hình gợi ý có sẵn, nhiều ý tưởng đều đúng'),
 'CC-26': ('E15 do', OK, 'E15 do/say/breath', 'Chỉ thêm nội dung'),
}

STEPS = ['Khơi gợi tò mò', 'Giới thiệu kiến thức', 'Minh họa trực quan', 'Làm mẫu', 'Hướng dẫn trẻ thực hành', 'Thực hành độc lập', 'Phản hồi', 'Củng cố', 'Vận dụng']

def build():
    errs = []
    used = [r for m in M for r in m[4]]
    for k in REF_NAMES:
        if k not in used: errs.append(f'mã tham chiếu {k} chưa được xếp vào phương thức nào')
    dup = {r for r in used if used.count(r) > 1}
    if dup: errs.append('mã tham chiếu bị xếp hai lần: ' + ', '.join(sorted(dup)))
    for m in M:
        for d in m[8]:
            if d not in SID: errs.append(f'{m[0]}: mẫu {d} không có')
    if errs: print('\n'.join(errs)); sys.exit(1)
    methods = []
    for (pid, vi, en, grp, refs, mech, cc, eng, demo, sup, lim) in M:
        ages = '4–6 tuổi (hai mức 4–5 và 5–6)'
        diff = [SID[d]['diff'] for d in demo]
        skills = sorted({SID[d]['levels'][a]['skill_id'] for d in demo for a in SID[d]['levels']})
        methods.append(dict(
            id=pid, name_vi=vi, name_en=en, group=grp, refs=refs, ref_names=[REF_NAMES[r] for r in refs], mech_in_use=mech,
            goal='; '.join(dict.fromkeys(SID[d]['goal'] for d in demo)) or 'Theo các mã tham chiếu: ' + ', '.join(REF_NAMES[r].lower() for r in refs) + '.',
            ages=ages, skills=skills, knowledge=sorted({SID[d]['program'] for d in demo}), mechanics=cc, engines=eng,
            art='Hình vẽ tay đã duyệt hoặc hình vẽ mã nét bút chì màu nước; vật chính và ô đáp án to, rõ; không dùng hình tạm trong bản duyệt chính thức.',
            audio='Mọi lời thoại có giọng đọc (giọng Hoài My tạo trên máy 24H); âm báo đúng, âm nhẹ khi chưa đúng; không phát chồng âm.',
            process=STEPS, feedback='Khen cụ thể theo việc bé làm, không lặp một câu khen; chọn sai không khen, gợi ý sau 2–3 lần; gợi ý bằng làm sáng chỗ cần chạm khi bé chưa trả lời.',
            difficulty=diff or ['4–5 tuổi: ít lựa chọn, hình to, có gợi ý sớm. 5–6 tuổi: nhiều lựa chọn, thêm điều kiện, ít gợi ý.'],
            variants='Sinh biến thể không giới hạn theo seed (thứ tự, vị trí, vật được chọn, số lượng) từ nội dung đã duyệt, không gọi AI khi bé học.',
            assess=lim, demo=demo, support=sup, version='1.0.0', status='ready_for_review' if demo else 'draft'))
    mechs = []
    for m in SAMPLES['mechanics']:
        e, v, before, added = CC[m['id']]; demo = next(s['id'] for s in SAMPLES['samples'] if m['id'] in s['cc'])
        mechs.append(dict(id=m['id'], name=m['name'], engine=e, verdict=v, before=before, added=added, demo=demo,
                          methods=[x[0] for x in M if m['id'] in x[6]]))
    out = dict(format='lu-method-library', version='1.0.0', refs_total=len(REF_NAMES), methods=methods, mechanics=mechs,
               id_rules=['M001–M100 là mã tham chiếu tạm của chỉ thị, không dùng làm mã chính thức.', 'M01–M58 (MECH trong giao-trinh-2.0) đang dùng, giữ nguyên, ghi ở cột mech_in_use.',
                         'E00–E15 là mã engine đang dùng, giữ nguyên.', 'PT-01… là mã phương thức đã hợp nhất; CC-01…CC-26 là mã cơ chế tương tác của trẻ.'],
               layers=['Phương pháp giảng dạy (PT) → Mẫu bài tập → Cơ chế tương tác (CC) → Engine (E) → Hoạt động (activity_id) → Biến thể (seed)'])
    p = os.path.join(ROOT, 'content/lab/library.json'); json.dump(out, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{len(methods)} phương thức từ {len(REF_NAMES)} mã tham chiếu; {len(mechs)} cơ chế -> {p}')

if __name__ == '__main__': build()

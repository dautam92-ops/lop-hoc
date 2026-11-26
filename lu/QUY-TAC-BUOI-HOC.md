# Quy tắc buổi học Lu (bắt buộc, cổng kiểm tra tự chặn)

## Q1. Cấu trúc buổi như L001 (tam 26/11/2026)
Từ buổi 2 (L002) trở đi, mọi buổi làm theo cấu trúc mới như L001:
- 10–12 bài học nhỏ trên bảng bài; mỗi bài nhỏ một kỹ năng.
- Mỗi bài nhỏ 3–4 bài tập liền nhau, có chấm tiến độ.
- Mỗi buổi đủ 6 nhóm kỹ năng: Toán (TO), Tiếng Việt (TV), Tư duy (TD), Khám phá và vận động (KP), Cảm xúc xã hội (EQ), Tiếng Anh (EN).
- Buổi học từ 20 phút trở lên.

Phép thử: `tools/kiem-cau-truc.mjs` (`kiemCauTruc`), mục cổng "Cấu trúc như L001".

## Q2. Lịch ôn chữ cái và số (tam duyệt 26/11/2026)
- Mỗi chữ cái, mỗi số được ôn 5 lượt: sau 3, 7, 14, 30 và 60 buổi kể từ khi học xong khối giới thiệu.
- Mỗi lượt ôn dùng một cách học bé chưa dùng cho chữ hay số đó (nghe chọn, tô, ghép, lật thẻ, tìm trong tranh, xếp chữ, nhìn nhanh rồi chọn theo trí nhớ, vận động, ngoài màn hình...). Lý do: bé chỉ nhớ khi được lặp lại bằng nhiều hình thức.
- Từ L004, buổi nào cũng có ít nhất 1 thẻ ôn cách quãng.
- Cách ghi trong dữ liệu buổi: hoạt động dạy ghi `noi_dung: "chu:a"` hoặc `"so:5"`; hoạt động ôn ghi `on_tap: "chu:a"`. Cách học là `mechanic` (hoặc engine + mode).

Ví dụ chữ a (giới thiệu L167–L171): ôn bằng lật thẻ chữ a với hình con cá; tìm chữ a trong tranh chợ; Lu nói "a" thì bé giơ tay; xếp chữ thành "cá"; nghe chọn a giữa a, ă, â, o. Ngoài màn hình: tìm chữ a trên bao bì.
Ví dụ số 5 (giới thiệu L026): nhìn nhanh rồi chọn số lượng theo trí nhớ; xếp 5 quả vào giỏ; vỗ tay 5 cái; nối nhóm 5 vật với chữ số 5; tô số 5. Ngoài màn hình: lấy 5 chiếc thìa.

Phép thử: `kiemOn`, mục cổng "Ôn chữ/số: mỗi lượt ôn một cách học mới".

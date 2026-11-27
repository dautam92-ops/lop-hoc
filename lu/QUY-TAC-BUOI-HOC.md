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

## Q3. Lồng 18 năng lực vào mỗi buổi (tam duyệt 26/11/2026)
- Sáu nhóm TO, TV, TD, KP, EQ, EN là nhóm kiến thức (môn). Các bộ kỹ năng như tư duy, tưởng tượng, sáng tạo là 18 năng lực NL01–NL18 của Khung phương pháp.
- Mỗi bài tập ghi năng lực nó rèn (trường `nang_luc`, hoặc suy từ `mechanic`).
- Từ L002: mỗi buổi rèn ít nhất 8 năng lực, luôn có NL11 tưởng tượng và NL12 sáng tạo; 5 buổi liền nhau phủ đủ 18 năng lực.

Phép thử: `kiemNangLuc`, mục cổng "Năng lực: ≥ 8 mỗi buổi".

## Q4. Học cùng con (tam duyệt hướng 27/11/2026)
Điểm bán của sản phẩm: bố mẹ và bé cùng học 20 phút mỗi ngày, có sẵn bài và cách dạy. Mọi buổi có phần "Học cùng con", ghi ở `content/hoc-cung-con/<id>.json` (hoặc trường `hoc_cung_con` khi đã lồng vào bài). Mẫu: L001, L002.

1. **Dặn bố mẹ trước buổi** (`dan_bo_me`, hiện trên thẻ chữ trước khi bé bấm Bắt đầu, không đọc to, bấm qua được):
   `hom_nay` hôm nay con học gì; `chuan_bi` đồ cần để sẵn (đồ có trong nhà); `ngoi_canh` lúc nào nên ngồi cạnh con. Mỗi dòng ≤ 25 từ, lời cho bố mẹ gọi trẻ là "con".
2. **Mono mời bố mẹ** (`moi_bo_me`, 3–4 lời mỗi buổi, hiện sau khi bé xong bài nhỏ `sau_bai` (số thứ tự từ 0)):
   - Mono đọc to `loi` (≤ 12 từ, gọi "bé", phải nhắc "bố mẹ"); dưới đó chữ nhỏ `goi_y` (≤ 20 từ) cho bố mẹ biết làm gì.
   - Kiểu: `chi-cho` (bé chỉ/đếm cho bố mẹ), `hoi` (bé hỏi bố mẹ), `do-bo-me` (bé đố bố mẹ, bố mẹ cố tình sai để bé sửa), `ke` (bé kể), `lam-cung` (cùng vỗ tay, cùng làm động tác). Mỗi buổi ít nhất 2 kiểu.
   - Rải đều: hai lời mời cách nhau ít nhất 2 bài nhỏ; không lặp lời của buổi trước.
   - **Không chặn bé**: luôn có nút Tiếp to; bố mẹ bận thì bé tự bấm đi tiếp, không trừ sao, không nhắc lại.
3. **Cuối buổi tắt máy** (`cuoi_buoi`): Mono nói `loi` (≤ 12 từ, có "tắt máy"), rồi hiện hoạt động ngoài đời làm cùng bố mẹ `ten`, `phut` (1–10 phút, trùng với `parent.play`). Không gợi ý học tiếp buổi sau hay vào cổng luyện ngay sau đó.

Lời Mono ở mục 2 và 3 cần giọng đọc như mọi câu khác.
Phép thử: `tools/kiem-hoc-cung-con.mjs` (`kiemHocCungCon`), mục cổng "Học cùng con".

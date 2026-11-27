# Bộ quy tắc soát logic của Lu (LG)

tam 27/11/2026 11:06: "Việc phát hiện lỗi trước khi gen ảnh tôi cũng cần bạn làm … chạy 1 agent check lỗi trước khi gen ảnh, có bộ quy tắc riêng để check, như trọng lực, vật lý, khoa học, … tính logic, phi logic … phải tổng quát được đa số lỗi vô lý."

Lỗi gốc: câu "Chú gà thấy hạt đậu. Chú gà sẽ làm gì?" có đáp án gà con đứng yên, chìa khóa, áo đỏ. Hai đáp án sai không liên quan gà con, không ảnh nào là hành động.

## Khi nào soát

1. **Trước khi vẽ ảnh:** mọi tệp câu mô tả ảnh (`tools/lab/anh-*.json`) phải qua `node tools/kiem-logic.mjs anh <tệp>` (máy soát) và agent soát logic (biên bản `content/soat-logic/anh-<tên>.json`). Có lỗi thì sửa câu mô tả, không vẽ.
2. **Trước khi lên mạng:** mọi buổi học phải qua `node tools/kiem-logic.mjs bai Lxxx` và agent soát logic (biên bản `content/soat-logic/Lxxx.json`, khớp mã băm của bản bài hiện tại, 0 lỗi còn mở). Cổng `cong-kiem-tra.mjs` chặn nếu thiếu.
3. Sửa bài hay sửa câu mô tả xong thì soát lại (mã băm đổi thì biên bản cũ hết hiệu lực).

Máy soát những gì đo được bằng kho kiến thức (`content/kien-thuc/vat.json`). Agent soát phần cần hiểu nghĩa, theo đúng danh sách dưới đây, ghi từng lỗi kèm mã LG.

## Các quy tắc

### A. Câu hỏi và đáp án
- **LG01 Liên quan:** mọi đáp án (cả đáp án sai) phải liên quan đến nhân vật, đồ vật hoặc tình huống trong câu hỏi. Không dùng đồ vật ngẫu nhiên làm đáp án sai.
- **LG02 Cùng loại:** đáp án sai cùng loại với đáp án đúng: hỏi hành động thì toàn hành động, hỏi con vật thì toàn con vật, hỏi đồ ăn thì toàn đồ ăn. Trừ bài "thứ nào khác nhóm" (M19), nơi một vật khác nhóm là chủ ý.
- **LG03 Đúng một đáp án:** chỉ một đáp án đúng theo kiến thức thật. Đáp án sai phải sai rõ với trẻ 4–6 tuổi, không sai "tùy cách hiểu" (vd hỏi "cái gì bay được" mà có cả chim và ong).
- **LG04 Sai nhưng hợp lý:** đáp án sai vẫn là điều có thể xảy ra trong thế giới thật (gà con ngủ, gà con chạy), để bé phải suy nghĩ, không vô nghĩa. Không cầu kì: chọn thứ dễ vẽ.
- **LG05 Hình khớp lời:** hình hiện ra phải đúng thứ lời nói (hỏi bóng thì hiện bóng, hỏi hành động thì hình đang làm hành động, hỏi số lượng thì đúng số vật).
- **LG06 Câu hỏi trả lời được bằng hình:** bé không biết đọc, nên mọi đáp án phải phân biệt được chỉ bằng hình và giọng đọc.

### B. Khoa học và đời sống
- **LG07 Sinh học:** con vật ăn đúng thức ăn (gà ăn hạt, giun; mèo ăn cá), sống đúng nơi (cá dưới nước, chim trên cây), sinh ra đúng cách (gà con nở từ trứng). Cây cần nước, ánh nắng, đất.
- **LG08 Vật lý và trọng lực:** vật nặng rơi xuống, không lơ lửng; nước chảy xuống chỗ thấp, nằm phẳng trong bát; vật nổi hay chìm đúng thật (sỏi chìm, lá nổi, bóng nổi); bóng đổ ngược phía ánh sáng; vật đứng trên mặt đất có điểm tựa.
- **LG09 Kích thước và tỉ lệ:** vật to nhỏ đúng tương quan khi đứng cạnh nhau (hạt đậu nhỏ hơn gà con, gà con nhỏ hơn gà mẹ). Khi hỏi "to hơn, nhỏ hơn" phải đúng ngoài đời, không chỉ đúng trong hình.
- **LG10 Thời gian và nhân quả:** trình tự đúng (hạt → mầm → cây → hoa → quả; trứng → gà con → gà lớn), nguyên nhân đến trước kết quả, mùa và thời tiết đúng (mưa thì có mây, không có nắng gắt).
- **LG11 Thói quen an toàn:** không dạy hay khen điều nguy hiểm (trèo cao, chạm ổ điện, cho đồ vào miệng, ăn quả lạ). Tình huống an toàn luôn có đáp án "nhờ người lớn".
- **LG12 Phù hợp văn hóa Việt Nam:** đồ vật, món ăn, cảnh quen với bé Việt; tên gọi đúng tiếng Việt phổ thông.

### C. Số lượng và toán
- **LG13 Số lượng do mã dựng:** không bao giờ để AI vẽ sẵn số lượng cần đếm. Câu mô tả ảnh không ghi số lượng vật cần đếm; số lượng dựng bằng mã (`art:tao*3`).
- **LG14 Đáp án toán đúng:** phép đếm, so sánh, thêm bớt đúng; số trong lời khớp số trên hình.

### D. Ảnh (câu mô tả trước khi vẽ)
- **LG15 Đúng vai:** ảnh đáp án đúng thể hiện rõ điều được hỏi (gà con đang mổ hạt: mỏ chạm hạt). Ảnh đáp án sai thể hiện hành động hay vật khác, cùng nhân vật khi hỏi về nhân vật.
- **LG16 Không thêm thứ lạ:** ảnh đồ vật chỉ có vật đó (ghi "only the object, no animal, no people"); ảnh con vật không thêm con vật khác. Khung tròn đơn giản và mặt cười được phép (tam 27/11), nhưng không có nhiều hình người quanh vật ở ảnh đáp án.
- **LG17 Một ý một ảnh:** mỗi ảnh một hành động hoặc một vật chính, nhìn nhỏ trên ô đáp án vẫn nhận ra.
- **LG18 Tư thế làm được:** hành động phải vẽ được rõ ràng; nếu hai lần vẽ không ra (vd mỏ nhúng nước), đổi hành động dễ vẽ thay vì giữ ảnh sai.

### E. Lời nói
- **LG19 Lời khen và gợi ý đúng sự thật:** câu "ok" giải thích đúng (vd "Chú gà mổ hạt để ăn"), câu gợi ý "no" không gợi ý sai hướng.
- **LG20 Không mâu thuẫn trong bài:** cùng một vật không đổi tên, màu, tính chất giữa các màn; câu chuyện không trái với điều bài vừa dạy.

## Biên bản agent

Agent soát (prompt ở `tools/kiem-logic/AGENT.md`) đọc bài hoặc tệp câu mô tả, đối chiếu LG01–LG20, ghi `content/soat-logic/<tên>.json`:

```json
{ "doi_tuong": "L002", "ma_bam": "<sha1 tệp>", "ngay": "2026-11-27", "loi": [ { "ma": "LG01", "o": "L002-B16 câu 2", "mo_ta": "…", "sua": "…", "trang_thai": "mo|da_sua|chap_nhan" } ] }
```

Cổng chặn nếu thiếu biên bản, mã băm lệch, hoặc còn lỗi `mo`.

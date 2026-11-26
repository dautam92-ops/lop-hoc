# Sổ lỗi đã gặp

Quy tắc (tam 26/11/2026): lỗi đã gặp không được lặp lại. Mỗi lỗi tam báo phải:
1. Có phép thử tự động bắt được nó TRƯỚC khi sửa (chạy thử cho thấy phép thử báo đỏ trên bản lỗi).
2. Sửa xong, phép thử báo xanh.
3. Phép thử nằm trong `tools/cong-kiem-tra.mjs` (cổng bắt buộc trước khi lên mạng, GitHub tự chạy mỗi bản mới) và giữ mãi.

| Ngày | Lỗi | Nguyên nhân | Phép thử chặn |
|---|---|---|---|
| 26/11 | Bé chọn sai mà Lu vẫn nói "Đúng rồi!" (13 màn ở bài 1) | E01 dạng `items` coi mọi câu là câu tự do (`R._any = it`) | play-draft cố tình chọn sai ở mọi màn có đáp án; cổng mục "Chọn sai thì Lu báo sai" |
| 26/11 | Hình hạt đậu, túi hạt trống trên bảng bài nhỏ | Ảnh thật 841px không co vào khung 84px | ui/lesson.css co ảnh; cổng mục "Ảnh đã duyệt có đủ tệp" + xem ảnh chụp màn bảng bài |
| 26/11 | Hình bóng quá bé | Lớp `shadow` trùng ô đích E02, giới hạn 80px | CSS `bong-den`; cổng mục "Hình minh họa chiếm 65% trở lên" |
| 26/11 | Câu thiếu giọng đọc | Câu mới chưa tạo giọng trên máy | cổng mục "Mọi câu đều có giọng đọc" và "Tệp giọng đọc có đủ trên đĩa" |
| 26/11 | Lật thẻ sai thì Lu nói "chưa giống nhau", đúng một đôi thì nói "Đúng rồi!" làm bé mất hứng | Thiết kế cũ của E05 | Quy tắc tam: chỉ giải thích lúc đầu, sai chỉ úp lại, đúng một đôi chỉ âm báo, xong cả bài mới khen; cổng mục "Lật thẻ: sai thì im lặng" |

| 26/11 | Mẫu mới trong Phòng mẫu có thể lặp lại lỗi cũ | Mỗi engine mới tự xử lý chọn sai | `tools/lab/test-lab.mjs`: mọi mẫu × hai tuổi × iPad và điện thoại đều CỐ TÌNH CHỌN SAI TRƯỚC (không được khen, không âm báo đúng, không ghi "đúng"), lật thẻ sai hay đúng Lu không được nói, phải chơi được tới cuối |
| 26/11 | Bé không trả lời thì không có gì xảy ra | Chưa có tính năng | `idleHelp` trong lu-core: Lu nhắc lại câu hỏi, lần sau làm sáng chỗ cần chạm (lật thẻ thì không nhắc); `test-lab.mjs` mục "không trả lời" |
| 26/11 | Màn mẫu tràn khỏi màn hình iPad (khay mảnh ghép, hình dán bị cắt) | Hình chính không giới hạn chiều cao | CSS `--vis-h` co hình chính theo chiều cao màn; ảnh chụp từng mẫu trong `tools/lab/out/` để soát bằng mắt |

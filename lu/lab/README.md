# Phòng mẫu Lu (Demo Lab)

Trang: `lab/index.html` (trên máy: `node tools/serve.mjs` rồi mở http://127.0.0.1:5173/lab/index.html).

- **26 cơ chế**: mỗi cơ chế tương tác của trẻ (chỉ thị Method Library mục IV) có một bài giảng mẫu chơi được.
- **30 mẫu nghiệm thu**: mục X của chỉ thị, mẫu nào cũng trỏ tới bài chơi được.
- Mỗi mẫu có hai mức **4–5 tuổi** và **5–6 tuổi**, chơi trong khung **iPad** hoặc **điện thoại**, đổi **biến thể** (seed).
- Nút **Thử đúng / Thử sai / Thử không trả lời / Nghe lại / Tạm dừng / Bỏ qua câu**; khung **Diễn biến** ghi Lu nói gì và kết quả được ghi.
- **Toàn bộ lời thoại** của mẫu, nghe từng câu; câu chưa có giọng Hoài My đọc bằng giọng tạm của trình duyệt (có nhãn).
- **Nhận xét và kiểm duyệt**: Bản nháp, Chờ duyệt, Cần sửa, Đã duyệt, Ngừng dùng. Lưu trên trình duyệt của người duyệt; tab "Nhận xét của tôi" sao chép để gửi lại. Claude không tự phê duyệt.

## Tệp

| Tệp | Việc |
|---|---|
| `tools/lab/build_samples.py` → `content/lab/samples.json` | 37 mẫu, 74 hoạt động (nội dung soạn tay) |
| `tools/lab/build_library.py` → `content/lab/library.json` | 46 phương thức hợp nhất từ M001–M100, đánh giá 26 cơ chế |
| `tools/lab/check-samples.mjs` | Kiểm tra nội dung: validate, 30 seed sinh biến thể, đủ lời thoại |
| `tools/lab/test-lab.mjs [--shots]` | Chơi thật trên trình duyệt: chọn sai trước, chơi đến hết, không trả lời, ảnh chụp `tools/lab/out/` |
| `tools/lab/voice-lines-lab.mjs` → `content/lab/can-tao-giong.json` | Danh sách câu cần giọng; trên máy 24H: `python tools/tao_giong_doc.py content/lab/can-tao-giong.json` |
| `lab/play.html` | Chơi một mẫu: `play.html?s=CC-08&age=4-5&seed=7` |

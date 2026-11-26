# Hoàn thiện L001 (giọng + ảnh) trên máy 24H

Tải bản gốc (công khai, không cần đăng nhập): https://github.com/dautam92-ops/lop-hoc/archive/refs/heads/claude/project-thread-ch8c7y.zip
Giải nén vào thư mục MỚI `E:\Lu\lu-l001-moi\`; thư mục làm việc là `...\lop-hoc-claude-project-thread-ch8c7y\lu` (trong hướng dẫn dưới gọi là lu-app).
Không ghi đè `E:\Lu\lu-chay-thu` (bản cũ, giữ làm dự phòng). play-draft cần Playwright (npm i playwright trong thư mục lu nếu chưa có).

## 1. Giọng Hoài My (205 câu)

```
cd E:\Lu\lu-l001-moi\lu-app
node tools/voice-lines-bai.mjs L001      # ghi content/audio/can-tao.json (205 câu: 197 tiếng Việt, 8 tiếng Anh)
python tools/tao_giong_doc.py            # tạo mp3 vào content/audio, ghi content/audio/registry.json
node tools/voice-lines-bai.mjs L001      # phải báo "cần tạo 0"
```

Tiếng Việt: vi-VN-HoaiMyNeural. Tiếng Anh (One, Two, Three, Yes! One!…): giọng tiếng Anh trong tao_giong_doc.py.
Kiểm bằng nhận dạng tiếng nói theo S11 (câu tiếng Việt không được nhận ra là tiếng Anh).

## 2. Ảnh (14 ảnh ở `E:\Lu\anh\tai-nguyen-L001\`)

Đăng ký từng ảnh với `--slot` (ảnh vào trạng thái chờ duyệt, CHƯA hiện trong bài):

| Ảnh | --thu-muc | --slot |
|---|---|---|
| BG-01 nhà Lu buổi sáng | boi-canh | L001-BG-01 |
| BG-02 sân trước nhà | boi-canh | L001-BG-02 |
| BG-03 vườn đậu | boi-canh | L001-BG-03 |
| BG-04 luống đất | boi-canh | L001-BG-04 |
| BG-05 hiên nhà | boi-canh | L001-BG-05 |
| OB-01 hạt đậu | do-vat | art:hat-dau |
| OB-02 túi hạt | do-vat | art:tui |
| OB-03 giỏ mây | do-vat | art:gio |
| OB-04 mầm đậu | do-vat | art:mam-dau |
| OB-07 quả đậu | do-vat | art:qua-dau |
| OB-05 cọc gỗ, OB-06 khay, OB-08 cây đậu cao, NV-01 bà | do-vat / nhan-vat-phu | không gắn slot (bản bài nhỏ chưa dùng; cọc giữ hình vẽ mã vì có số) |

```
node tools/add-asset.mjs them E:\Lu\anh\tai-nguyen-L001\BG-01.png --thu-muc boi-canh --mo-ta "nha Lu buoi sang" --nguon comfyui --slot L001-BG-01 --ghi-chu "Z-Image, nen trong suot BiRefNet (MIT)"
```

Ảnh đồ vật phải có nền trong suốt (đã tách bằng BiRefNet). Ảnh chỉ hiện trong bài sau khi tam duyệt:
`node tools/add-asset.mjs duyet <asset_id>` (chỉ chạy khi tam nói duyệt ảnh đó).

## 3. Kiểm tra rồi gửi lại

```
node tools/check-draft.mjs L001
node tools/play-draft.mjs L001           # iPad + điện thoại, 0 lỗi JS
```

Gửi lại: `content/audio/` (mp3 + registry.json), `registry/assets.json`, `assets/boi-canh/`, `assets/do-vat/`, `assets/nhan-vat-phu/`.
Bản gốc gộp các file này rồi đưa bản hoàn chỉnh lên https://dautam92-ops.github.io/lop-hoc/lu/

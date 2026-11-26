# Kho tài nguyên của Lu

Kho này theo S08 (Asset Standard) và D25–D26. Mỗi tệp có **mã, phiên bản, nguồn, quyền dùng** trong sổ `registry/assets.json`.

## Cây thư mục

| Thư mục | Để gì |
| --- | --- |
| `_nhap-moi/` | **Chỗ thả ảnh mới.** Chưa đăng ký thì chưa được dùng trong bài |
| `lu/goc/` | Ảnh gốc của Lu đúng như lúc tạo, giữ nguyên, không sửa |
| `lu/golden-reference/` | Bộ hình chuẩn của Lu đã chọn: xoay 4 hướng, tỷ lệ, bảng màu. Mọi hình sau này phải so với bộ này |
| `lu/bieu-cam/` | Gương mặt Lu: vui, buồn, ngạc nhiên, sợ, giận, bình tĩnh, tự hào, tò mò |
| `lu/tu-the/` | Lu đứng, chạy, vẫy tay, chỉ tay, ngồi, nhảy, ôm, suy nghĩ |
| `lu/hoat-hinh/` | Khung hình, sprite, Lottie dùng cho chuyển động |
| `lu/xuat-ban/` | Bản đã tối ưu để đưa vào app: WebP tối đa 1024 px, dưới 200 KB, hoặc SVG |
| `thuong-hieu/logo/`, `bang-mau/`, `phong-chu/` | Logo, bảng màu, phông có giấy phép |
| `ban-do/tong-the/`, `ban-do/vung-01-lang-hat-dau/` | Bản đồ 10 vùng và bản đồ chi tiết từng vùng |
| `boi-canh/` | Nền cảnh trong bài |
| `nhan-vat-phu/` | Con vật, nhân vật phụ (chỉ phục vụ bài, không có bộ nhận diện riêng) |
| `do-vat/` | Đồ vật, hoa quả, đồ chơi dùng trong câu hỏi |
| `bieu-tuong/` | Biểu tượng SVG: số, chữ, hình khối, nút |
| `giao-dien/` | Khung, nút, hiệu ứng giao diện |
| `luu-tru-cu/` | Bản đã thay thế. Không xóa, để còn khôi phục |

## Đặt tên (do công cụ tự đặt)

Tên tệp có dạng `MÃ_mô-tả_vPHIÊN-BẢN.đuôi`, ví dụ `LU-0001_lu-dung-thang-vui_v01.png`.

- Tiền tố mã cho biết loại tài nguyên: LU (Lu), TH (thương hiệu), BD (bản đồ), BC (bối cảnh), NV (nhân vật phụ), DV (đồ vật), BT (biểu tượng), GD (giao diện).
- Tên viết thường, không dấu, nối bằng gạch ngang.
- **Không ghi đè.** Sửa hình thì tạo phiên bản mới (v02, v03…); bản cũ vẫn giữ.

## Cách thêm ảnh

1. Thả ảnh vào `_nhap-moi/`.
2. Chạy lệnh đăng ký:

   ```
   node tools/add-asset.mjs nhap-moi --thu-muc lu/goc --nguon chatgpt-image
   ```

   Lệnh này đặt tên chuẩn, chép ảnh vào đúng thư mục, ghi kích thước và mã băm vào sổ, rồi đưa ảnh gốc vào `_nhap-moi/da-dang-ky/`.
3. Ảnh trùng hệt ảnh đã có thì công cụ bỏ qua và báo mã ảnh cũ để dùng lại.
4. Ảnh mới có trạng thái `cho_duyet`. Admin duyệt bằng lệnh:

   ```
   node tools/add-asset.mjs duyet LU-0001
   ```

   Chỉ ảnh `da_duyet` mới được đưa vào bài.

**Nguồn hợp lệ:**

- `chatgpt-image`
- `comfyui`: ghi tên mô hình và giấy phép vào `--ghi-chu`
- `tu-ve`
- `khac`: phải có bằng chứng giấy phép

## Quy tắc nhanh

- Ảnh trong `lu/goc/` không bao giờ sửa. Muốn chỉnh thì làm bản mới trong `golden-reference/` hoặc `xuat-ban/`.
- Hình Lu đúng theo S05: một nhân vật thương hiệu, tính cách ấm áp và tò mò, không có chữ trên hình.
- Không có ảnh trẻ em thật, logo thương hiệu khác hay chữ trên hình (S08-R07).
- Chưa đăng ký thì chưa dùng.

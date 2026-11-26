// Dữ liệu nét tô (Tracing Engine E13) – dựng bằng mã, KHÔNG dùng AI vẽ chữ (chỉ thị Chương trình mục 6).
// Hệ tọa độ: rộng 100, cao 130. Kẻ ô li: dòng trên y=14, dòng giữa trên y=62, dòng kẻ chân y=110.
// Chữ thường thấp (o, a, c, e…) nằm giữa y=62 và y=110; chữ cao (b, d, l) từ y=14; chữ số từ y=30 tới y=110.
// Mẫu chữ: chữ in thường dùng ở mầm non (nhận diện và tô), thứ tự nét theo cách mô tả phổ biến trong sách mầm non
// ("chữ a gồm một nét cong tròn khép kín và một nét thẳng đứng bên phải").
// TRẠNG THÁI: BẢN NHÁP – cần chuyên môn mầm non/tiểu học kiểm tra hình chữ, thứ tự và chiều nét trước khi dùng chính thức.
// Mỗi nét: d = đường dẫn SVG (đi đúng chiều tô), say = lời Lu hướng dẫn khi làm mẫu. dot: true = chấm (chạm là xong).
const O = (cx = 50, cy = 86, r = 24) => `M${cx} ${cy - r}A${r} ${r} 0 0 0 ${cx} ${cy + r}A${r} ${r} 0 0 0 ${cx} ${cy - r}`; // tròn, ngược chiều kim đồng hồ, bắt đầu từ đỉnh
export const STROKE_STATUS = 'ban-nhap-cho-kiem-tra-chuyen-mon';
export const GLYPHS = {
  // Nét cơ bản (4–5 tuổi)
  'net-thang': { name: 'nét thẳng đứng', strokes: [{ d: 'M50 30V110', say: 'Bắt đầu từ chấm xanh, kéo thẳng xuống.' }] },
  'net-ngang': { name: 'nét ngang', strokes: [{ d: 'M18 70H82', say: 'Bắt đầu từ chấm xanh, kéo ngang sang phải.' }] },
  'net-xien-phai': { name: 'nét xiên phải', strokes: [{ d: 'M28 30L72 110', say: 'Kéo xiên từ trên xuống, sang phải.' }] },
  'net-xien-trai': { name: 'nét xiên trái', strokes: [{ d: 'M72 30L28 110', say: 'Kéo xiên từ trên xuống, sang trái.' }] },
  'net-cong-trai': { name: 'nét cong trái', strokes: [{ d: 'M70 40A34 34 0 0 0 70 104', say: 'Đi vòng sang trái rồi cong xuống dưới.' }] },
  'net-cong-phai': { name: 'nét cong phải', strokes: [{ d: 'M30 40A34 34 0 0 1 30 104', say: 'Đi vòng sang phải rồi cong xuống dưới.' }] },
  'net-cong-kin': { name: 'nét cong khép kín', strokes: [{ d: O(50, 70, 36), say: 'Đi vòng sang trái, tròn một vòng, về đúng chỗ bắt đầu.' }] },
  'net-moc': { name: 'nét móc ngược', strokes: [{ d: 'M40 36V94C40 112 62 114 68 98', say: 'Kéo thẳng xuống rồi móc lên bên phải.' }] },
  // Chữ cái (5–6 tuổi tô theo lộ trình 29 chữ; ở đây là các chữ dùng trong mẫu)
  o: { name: 'chữ o', strokes: [{ d: O(), say: 'Chữ o là một nét cong tròn khép kín. Đi vòng sang trái, về chỗ bắt đầu.' }] },
  'ô': { name: 'chữ ô', strokes: [{ d: O(), say: 'Tô nét cong tròn trước.' }, { d: 'M36 50L50 38L64 50', say: 'Rồi đội mũ cho chữ ô.' }] },
  'ơ': { name: 'chữ ơ', strokes: [{ d: O(), say: 'Tô nét cong tròn trước.' }, { d: 'M72 66C80 62 82 54 78 48', say: 'Rồi thêm cái râu bên phải.' }] },
  c: { name: 'chữ c', strokes: [{ d: 'M70 70A24 24 0 1 0 70 102', say: 'Chữ c là một nét cong hở bên phải.' }] },
  a: { name: 'chữ a', strokes: [{ d: O(46, 86, 23), say: 'Chữ a: tô nét cong tròn khép kín trước.' }, { d: 'M69 62V110', say: 'Rồi kéo nét thẳng đứng bên phải.' }] },
  'ă': { name: 'chữ ă', strokes: [{ d: O(46, 86, 23), say: 'Tô nét cong tròn khép kín.' }, { d: 'M69 62V110', say: 'Kéo nét thẳng bên phải.' }, { d: 'M34 38Q46 54 58 38', say: 'Thêm dấu á như cái thuyền nhỏ.' }] },
  'â': { name: 'chữ â', strokes: [{ d: O(46, 86, 23), say: 'Tô nét cong tròn khép kín.' }, { d: 'M69 62V110', say: 'Kéo nét thẳng bên phải.' }, { d: 'M34 50L46 38L58 50', say: 'Đội cái mũ cho chữ â.' }] },
  e: { name: 'chữ e', strokes: [{ d: 'M27 86H73', say: 'Chữ e: kéo nét ngang trước.' }, { d: 'M73 86A23 23 0 1 0 68 101', say: 'Rồi cong lên, vòng sang trái, xuống dưới.' }] },
  b: { name: 'chữ b', strokes: [{ d: 'M30 14V110', say: 'Chữ b: kéo nét thẳng dài xuống trước.' }, { d: 'M30 86A22 22 0 0 1 74 86A22 22 0 0 1 30 86', say: 'Rồi tô nét cong tròn bên phải.' }] },
  d: { name: 'chữ d', strokes: [{ d: O(46, 86, 22), say: 'Chữ d: tô nét cong tròn bên trái trước.' }, { d: 'M68 14V110', say: 'Rồi kéo nét thẳng dài bên phải.' }] },
  'đ': { name: 'chữ đ', strokes: [{ d: O(46, 86, 22), say: 'Tô nét cong tròn trước.' }, { d: 'M68 14V110', say: 'Kéo nét thẳng dài bên phải.' }, { d: 'M54 34H82', say: 'Thêm nét ngang ngắn.' }] },
  i: { name: 'chữ i', strokes: [{ d: 'M50 62V110', say: 'Chữ i: kéo nét thẳng xuống.' }, { d: 'M50 44V47', dot: true, say: 'Chấm một cái ở trên đầu.' }] },
  l: { name: 'chữ l', strokes: [{ d: 'M50 14V110', say: 'Chữ l là một nét thẳng dài.' }] },
  t: { name: 'chữ t', strokes: [{ d: 'M50 34V110', say: 'Chữ t: kéo nét thẳng xuống.' }, { d: 'M34 62H66', say: 'Rồi nét ngang ngắn.' }] },
  // Chữ số (cao từ y=30 tới y=110)
  '0': { name: 'số 0', strokes: [{ d: 'M50 30A24 40 0 0 0 50 110A24 40 0 0 0 50 30', say: 'Số không: đi vòng sang trái, tròn dài một vòng.' }] },
  '1': { name: 'số 1', strokes: [{ d: 'M34 48L56 30V110', say: 'Số một: xiên lên một chút rồi kéo thẳng xuống.' }] },
  '2': { name: 'số 2', strokes: [{ d: 'M30 50C30 22 72 22 70 50C68 68 42 86 28 110H74', say: 'Số hai: cong lên, xiên xuống, rồi kéo ngang.' }] },
  '3': { name: 'số 3', strokes: [{ d: 'M32 42C36 22 70 24 68 46C66 62 52 66 46 68C60 68 72 78 72 92C72 114 36 116 30 98', say: 'Số ba: hai nét cong nối nhau.' }] },
  '4': { name: 'số 4', strokes: [{ d: 'M58 30L26 86H78', say: 'Số bốn: xiên xuống rồi kéo ngang.' }, { d: 'M60 56V110', say: 'Rồi kéo nét thẳng xuống.' }] },
  '5': { name: 'số 5', strokes: [{ d: 'M38 32L34 66C50 56 72 62 72 84C72 108 40 114 30 98', say: 'Số năm: kéo xuống, rồi cong bụng to.' }, { d: 'M38 32H70', say: 'Rồi thêm nét ngang ở trên.' }] },
  '6': { name: 'số 6', strokes: [{ d: 'M66 34C46 30 28 56 28 82C28 104 42 110 52 110C66 110 74 98 74 86C74 72 64 64 52 64C40 64 30 72 28 84', say: 'Số sáu: cong xuống rồi cuộn tròn ở dưới.' }] },
  '7': { name: 'số 7', strokes: [{ d: 'M28 32H72L42 110', say: 'Số bảy: kéo ngang rồi xiên xuống.' }] },
  '8': { name: 'số 8', strokes: [{ d: 'M50 70C30 66 30 32 50 32C70 32 70 66 50 70C26 74 26 110 50 110C74 110 74 74 50 70', say: 'Số tám: hai vòng tròn chồng lên nhau.' }] },
  '9': { name: 'số 9', strokes: [{ d: 'M72 52C72 40 62 32 50 32C38 32 28 40 28 52C28 64 38 72 50 72C62 72 72 64 72 52', say: 'Số chín: tô vòng tròn ở trên trước.' }, { d: 'M72 50V110', say: 'Rồi kéo nét thẳng xuống.' }] },
};

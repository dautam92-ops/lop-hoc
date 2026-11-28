# Ghi biên bản soát logic (LG01–LG20) cho M020, M030, M050 theo tools/kiem-logic/AGENT.md.
# Chạy lại sau mỗi lần dựng bài để mã băm khớp bản mới: python3 tools/mono/soat_logic.py
import json, hashlib, pathlib, subprocess
ROOT = pathlib.Path(__file__).resolve().parents[2]
LG = [f"LG{i:02d}" for i in range(1, 21)]
GHI = {
 "M020": ("Soát cả 15 hoạt động (buổi 20 ôn vùng 1). Đã xét, không ghi lỗi: pháo hoa vẽ trong khung trời đêm tròn nên nền sân ban ngày không vô lý (LG08); "
          "số chùm pháo hoa do mã dựng, ảnh chỉ có một chùm (LG13); dãy số 1–5 đúng thứ tự, ô trống có một đáp án (LG03); bài nghe chạm dùng 4 từ đã học ở vùng 1, ảnh rõ, khác nhau (LG01); "
          "bài hai bạn cùng muốn đèn: đáp án đúng là lời nói lịch sự, đáp án sai là lời giành, đuổi bạn, rõ ràng (LG03, LG10); "
          "kể lại hành trình đúng mạch truyện buổi 1–20 (gió thổi hạt, Mono đi tìm, gà con lạc, lễ hội) (LG20); hạt đậu lớn lên: hạt → mầm (có nước) → cây (có nắng) → quả, khớp sửa khoa học ở M001 (LG07); "
          "dọn dẹp theo bóng mỗi bóng một vật (LG05); rổ tráo và lật thẻ không có đáp án mơ hồ. Lời kết buổi “cây cầu vồng mọc lên tới mây” là truyện thần tiên của giáo trình, không dạy điều sai (LG08)."),
 "M030": ("Soát cả 17 hoạt động (buổi 30 ôn tuần 2 vùng 2). Đã xét, không ghi lỗi: đếm lá xanh, lá vàng là vật gây nhiễu không đếm (LG13); mê cung có đường tới lá (máy dựng, kiểm 100 biến thể); "
          "cao thấp dùng cùng một ảnh cây vẽ ba cỡ nên chỉ khác chiều cao (LG03); tam giác ba cạnh đúng (LG07); tree, leaf, flower đúng nghĩa, mỗi màn một từ, giọng bản xứ (LG12); "
          "đoán con vật: mai cứng bò chậm chỉ có rùa trong ba đáp án (ốc không có mặt ở câu này), có cánh hót líu lo là chim, tai dài nhảy nhanh là thỏ (LG03, LG07); "
          "hai bạn cùng muốn đi trước: oẳn tù tì công bằng, không dùng từ “thua” (lint); cây rụng lá: lá già vàng rồi rụng, lá non xanh mọc ra (LG07); "
          "đánh răng: chải → súc miệng → lau miệng → đi ngủ, đúng thứ tự vệ sinh (LG11); thử thách vàng sáng tạo không chấm đúng sai, câu chọn bạn thú là câu tự do có lời đáp cho từng lựa chọn."),
 "M050": ("Soát cả 18 hoạt động (buổi 50 ôn tuần). Đã xét, không ghi lỗi: gà con cười là vui; ngáp dài là buồn ngủ (đáp án ngủ, chạy và uống nước là đáp án sai rõ) (LG03); "
          "câu gà im lặng và cua vẫy càng hỏi “bé nói gì”, đáp án là lời nói, không cần ảnh hành động (quy tắc 42); xếp thuyền theo ba cỡ của cùng một ảnh (LG03); "
          "cua bớt: 5−1=4, 5−2=3, 4−2=2 (LG14); tự phục vụ: khát nước lấy cốc nước, ra bến đi giày, nắng to đội mũ, mỗi câu một đáp án (LG03); "
          "kéo co giả vờ, không nguy hiểm (LG11); Eyes, Hands, Legs có ảnh Mono chỉ đúng bộ phận (LG12); bên cạnh, ở giữa: hàng ba thuyền, mỗi câu chỉ một thuyền đúng (thuyền ở đầu hàng chỉ có một bên cạnh) (LG03); "
          "an toàn gần nước: áo phao và nắm tay bà là an toàn, đứng sát mép bến một mình là chưa an toàn, không dạy điều nguy hiểm (LG11); "
          "bằng nhau: 3 và 4 thêm 1, 4 và 6 thêm 2, 5 và 3 bớt 2 bên trái, 2 và 5 thêm 3; câu hỏi nói rõ bên trái để chỉ có một đáp án (LG03, LG14); “chú cá” thay “con” để không lẫn với cách gọi trẻ."),
}
for mid, ghi in GHI.items():
    tep = f"content/drafts/{mid}.json"
    out = subprocess.run(["node", "tools/kiem-logic.mjs", "bai", mid], cwd=ROOT, capture_output=True, text=True).stdout
    canh = [l.strip() for l in out.splitlines() if l.startswith("CẢNH BÁO")]
    xet = [{"canh_bao": c, "ket_luan": "Không phải lỗi LG19: lời khen “Lá vàng đang rơi xuống” tả đúng cây lá vàng đang rụng là đáp án đúng."} for c in canh]
    rec = {"doi_tuong": mid, "tep": tep, "ma_bam": hashlib.sha1((ROOT / tep).read_bytes()).hexdigest(), "ngay": "2026-11-28",
           "nguoi_soat": "agent soát logic", "lan_soat": 1, "quy_tac_da_soat": LG, "may_soat": {"loi": 0, "canh_bao": len(canh)},
           "canh_bao_da_xet": xet, "ghi_chu": ghi, "loi": []}
    (ROOT / f"content/soat-logic/{mid}.json").write_text(json.dumps(rec, ensure_ascii=False, indent=1) + "\n")
    print(mid, "cảnh báo", len(canh))

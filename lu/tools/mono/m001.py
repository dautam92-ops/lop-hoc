# Dựng buổi M001 (giáo trình Mono 200 buổi, buổi 1) theo kịch bản từng màn đã viết 27/11:
# /mnt/project-files/san-pham-500-bai/giao-trinh-moi/kich-ban-tung-man-buoi-1-2.md
# Không có bước Mono dạy mẫu, không hỏi cảm xúc đầu buổi (tam 27/11). Chạy: python3 tools/mono/m001.py
import json, pathlib
W = ["một", "hai", "ba", "bốn", "năm"]
def A(i, engine, skill, title, **k): return dict(activity_id=f"M001-B{i:02d}", engine=engine, skill_id=skill, title=title, **k)
def it(q, opts, a, ok, no, **k): return dict(q=q, opts=[{"e": e} for e in opts], a=a, ok=ok, no=no, **k)
F = lambda n, ms, look, q, **k: dict(n=n, ms=ms, look=look, q=q, **k)
stages = [
 dict(title="Nhìn nhanh, đếm nhanh", kind="dinh", hiep=1, icon="art:hat-dau*3", nhom=["TO", "CY", "QS"], way="nhin-nhanh", backdrop={"id": "L001-BG-02", "kind": "san"},
  intro=["Hạt hiện một chút thôi. Bé nhìn nhanh nhé!"],
  activities=[A(1, "E01", "TO.DEM.01", "Nhìn nhanh, đếm nhanh", mode="flash", objs=["art:hat-dau"], opts=[1, 2, 3], words=W, rounds=4, q="Có mấy hạt?",
   levels=[F(1, 3000, "Nhìn thật nhanh nhé!", "Có mấy hạt?"), F(2, 3000, "Lá sắp che rồi!", "Có mấy hạt?"),
           F(3, 3000, "Bé nhìn kỹ nhé!", "Có mấy hạt?"), F(3, 2000, "Nhanh hơn nữa đây!", "Có mấy hạt?", distract="art:la")],
   ok="Đúng rồi! Có {word} hạt. Bé tinh mắt quá!", no="Không sao đâu! Mình nhìn lại nhé, bé bấm Xem lại.")]),
 dict(title="Túi hạt mới cho bà", hiep=1, icon="art:tui", nhom=["ST", "TTg"], way="sang-tao", backdrop={"id": "L001-BG-02", "kind": "san"},
  intro=["Mình làm túi mới cho bà nhé!"],
  activities=[A(2, "E14", "KP.ST.01", "Dán hạt cầu vồng", mode="sticker", bg="art:tui", stickers=["art:hat-dau:do", "art:hat-dau:xanh", "art:hat-dau:vang"], min=3,
   intro=["Bé dán hạt màu lên túi nhé!"], done="Nhiều hạt màu ghê! Đẹp quá!"),
   A(3, "E14", "KP.ST.01", "Dán hoa và sao", mode="sticker", bg="art:tui", keep=True, stickers=["art:hoa", "art:sao", "art:buom"], min=2,
   intro=["Thêm hoa, thêm sao nào!"], done="Bé dán khéo quá! Túi có hoa, có sao rồi."),
   A(4, "E14", "KP.ST.01", "Thêm lá cho túi", mode="sticker", bg="art:tui", keep=True, stickers=["art:la", "art:hoa", "art:sao"], min=1,
   intro=["Bé dán thêm lá xanh nhé!"], done="Túi đẹp quá! Cảm ơn bé, bà treo túi lên móc rồi.")]),
 dict(title="Apple, banana, orange", hiep=1, icon="art:tao", nhom=["EN", "CY"], way="hoc-tu", backdrop={"id": "L001-BG-02", "kind": "san"},
  intro=["Mình học tên quả bằng tiếng Anh nhé!"],
  activities=[A(5, "E01", "EN.EN.01", "Apple, banana, orange", mode="items", order="fixed", rounds=3, items=[
   it("Quả táo đây! Bé nói theo rồi chạm nhé!", ["art:tao"], 0, ["Apple!", "Bé nói hay quá!"], "", word="Apple", word_times=2),
   it("Quả chuối đây! Bé nói theo rồi chạm nhé!", ["art:chuoi"], 0, ["Banana!", "Giỏi quá! Bé nhớ cả quả chuối rồi."], "", word="Banana", word_times=2),
   it("Quả cam đây! Bé nói theo rồi chạm nhé!", ["art:cam"], 0, ["Orange!", "Tuyệt vời! Ba quả vào giỏ của bà rồi."], "", word="Orange", word_times=2)])]),
 dict(title="Chuyện hạt đậu nhỏ", hiep=1, icon="art:hat-dau", nhom=["TV", "GN", "NT"], way="nghe-truyen", backdrop={"id": "L001-BG-02", "kind": "san"},
  intro=["Bé nghe Mono kể chuyện nhé.", "Hạt đậu nhỏ nằm trong túi của bà.", "Gió thổi vù vù.", "Hạt đậu bay qua mái nhà.", "Hạt đậu rơi xuống gốc cây."],
  activities=[A(6, "E01", "TV.NG.01", "Chuyện hạt đậu nhỏ", mode="items", order="fixed", rounds=3, items=[
   it("Lúc đầu hạt đậu nằm ở đâu?", ["art:tui", "art:ro-tre", "art:chao"], 0, "Bé nhớ giỏi quá! Hạt nằm trong túi của bà.", "Mình cùng xem lại nào! Hạt đậu nằm trong túi của bà."),
   it("Cái gì thổi hạt đậu bay đi?", ["art:gio-thoi", "art:mua", "art:ga-con"], 0, "Chính xác! Gió thổi vù vù.", "Bé thử lại nào! Cái gì thổi vù vù nhỉ?"),
   it("Cuối cùng hạt đậu rơi ở đâu?", ["art:ao-nuoc", "art:nha", "art:cay"], 2, "Bé nghe chuyện giỏi lắm! Hạt rơi xuống gốc cây.", "Gần đúng rồi! Hạt bay qua mái nhà, rồi rơi xuống đâu nhỉ?")])]),
 dict(title="Bắt chước con vật", kind="nghi", icon="art:ga", nhom=["KT"], way="van-dong", backdrop={"id": "L001-BG-02", "kind": "san"},
  intro=["Mình đứng dậy vận động nhé!"],
  activities=[A(7, "E15", "KP.VD.01", "Gà vỗ cánh", mode="do", lu="vui-mung", task="Mình vỗ cánh như gà nào! Một, hai, ba!", button="Bé làm xong rồi", seconds=20, evidence="tiep-xuc"),
   A(8, "E15", "KP.VD.01", "Vịt lạch bạch", mode="do", lu="di-bo", task="Đi lạch bạch như vịt nào!", button="Bé làm xong rồi", seconds=20, evidence="tiep-xuc"),
   A(9, "E15", "KP.VD.01", "Ếch nhảy", mode="do", lu="nhay", task="Ngồi xuống, bật nhảy như ếch!", button="Bé làm xong rồi", seconds=20, evidence="tiep-xuc")]),
 dict(title="Xếp hạt theo màu", hiep=2, icon="art:hat-dau:do", nhom=["TD", "QS"], way="phan-loai", backdrop={"id": "L001-BG-02", "kind": "san"},
  intro=["Hạt màu gì thì vào giỏ màu đó."],
  activities=[A(10, "E03", "TD.LG.01", "Xếp hạt theo màu", groups=[{"id": "do", "label": "Giỏ đỏ", "e": "art:hat-dau:do", "say": "Giỏ đỏ."}, {"id": "xanh", "label": "Giỏ xanh", "e": "art:hat-dau:xanh", "say": "Giỏ xanh."}],
    items=[{"e": "art:hat-dau:do", "g": "do"}] * 3 + [{"e": "art:hat-dau:xanh", "g": "xanh"}] * 3, per_round=4, rounds=1, no="Bé thử lại nào! Hạt đỏ vào giỏ đỏ nhé.", done="Bé xếp giỏi lắm, hạt nào cũng đúng giỏ!"),
   A(11, "E03", "TD.LG.01", "Xếp tiếp nào", groups=[{"id": "do", "label": "Giỏ đỏ", "e": "art:hat-dau:do", "say": "Giỏ đỏ."}, {"id": "xanh", "label": "Giỏ xanh", "e": "art:hat-dau:xanh", "say": "Giỏ xanh."}],
    items=[{"e": "art:hat-dau:do", "g": "do"}] * 3 + [{"e": "art:hat-dau:xanh", "g": "xanh"}] * 3, per_round=6, rounds=1, intro=["Còn nhiều hạt quá! Bé xếp tiếp nhé!"], no="Bé thử lại nào! Hạt xanh vào giỏ xanh nhé.", done="Hoan hô bé, sáu hạt về đúng giỏ rồi!"),
   A(12, "E03", "TD.LG.01", "Thêm giỏ vàng", groups=[{"id": "do", "label": "Giỏ đỏ", "e": "art:hat-dau:do", "say": "Giỏ đỏ."}, {"id": "xanh", "label": "Giỏ xanh", "e": "art:hat-dau:xanh", "say": "Giỏ xanh."}, {"id": "vang", "label": "Giỏ vàng", "e": "art:hat-dau:vang", "say": "Giỏ vàng."}],
    items=[{"e": "art:hat-dau:do", "g": "do"}] * 2 + [{"e": "art:hat-dau:xanh", "g": "xanh"}] * 2 + [{"e": "art:hat-dau:vang", "g": "vang"}] * 2, per_round=6, rounds=1, intro=["Có thêm giỏ vàng rồi! Bé xếp nhé!"], no="Bé thử lại nào! Bé nhìn màu của hạt nhé.", done="Bé giỏi quá, ba giỏ đều đúng màu!")]),
 dict(title="Hạt đậu cần gì để lớn?", hiep=2, icon="art:mam-dau", nhom=["KT", "NT", "TD"], way="du-doan", backdrop={"id": "L001-BG-04", "kind": "luong"},
  intro=["Bé đoán xem hạt đậu cần gì nhé."],
  activities=[A(13, "E01", "KP.KH.01", "Hạt đậu cần gì để lớn?", mode="items", order="fixed", rounds=3, items=[
   it("Hạt đậu khát nước. Bé đưa gì?", ["art:binh-tuoi", "art:banh-mi", "art:giay"], 0, "Đúng rồi! Có nước, hạt nứt vỏ.", "Bé thử lại nào! Hạt đậu khát nước mà.", show="art:hat-dau"),
   it("Hạt cần gì nữa để lớn?", ["art:mat-troi", "art:khan", "art:banh-mi"], 0, "Giỏi quá! Có ông mặt trời, mầm lớn nhanh.", "Bé thử lại nào! Mầm cây cần ánh nắng đó.", show="art:mam-dau"),
   it("Có nước, có nắng. Cây sẽ thế nào?", ["art:cay-dau", "art:hat-dau"], 0, "Bé đoán đúng rồi! Cây đậu lớn lên.", "Gần đúng rồi! Có nước và nắng, cây sẽ lớn.", show=["art:binh-tuoi", "art:mat-troi"])])]),
 dict(title="Mono vui hay buồn?", hiep=2, icon="face:vui", nhom=["EQ", "NT"], way="doan-cam-xuc", backdrop={"id": "L001-BG-02", "kind": "san"},
  intro=["Nhìn mặt Mono, bé đoán xem."],
  activities=[A(14, "E01", "EQ.CX.01", "Mono vui hay buồn?", mode="items", order="fixed", style="face", rounds=3, items=[
   it("Mono đang vui hay buồn?", ["face:vui", "face:buon"], 1, "Tinh ý quá! Mono đang buồn.", "Mình cùng xem lại nào! Nhìn miệng Mono nhé.", show="lu:buon"),
   it("Vì sao Mono buồn nhỉ?", ["art:gio-thoi", "art:qua-tang", "art:banh-mi"], 0, "Bé hiểu Mono quá! Gió thổi bay hạt giống rồi.", "Bé thử lại nào! Hạt giống của bà đâu rồi nhỉ?", show="lu:buon"),
   it("Bây giờ Mono thấy thế nào?", ["face:vui", "face:buon"], 0, "Có bé giúp, Mono vui lắm!", "Mình cùng xem lại nào! Nhìn miệng Mono nhé.", show=["lu:vui", "art:hat-dau"])])]),
 dict(title="Cất túi hạt đúng chỗ", hiep=2, icon="art:tui", nhom=["KS", "QS"], way="keo-tha", backdrop={"id": "bep", "kind": "bep"},
  intro=["Cất đồ đúng chỗ thì không bị mất."],
  activities=[A(15, "E02", "KS.SX.01", "Cất túi hạt đúng chỗ", target_style="shadow", label="Kéo đồ vào đúng bóng", rounds=3,
   sets=[["art:tui", "art:binh-tuoi"], ["art:binh-tuoi", "art:ro-tre"], ["art:mu", "art:ro-tre", "art:chao"]],
   again="Cất tiếp đồ khác nào!", no="Bé thử lại nào! Bé nhìn hình cái bóng nhé.", done="Bé cất khéo quá! Gió không thổi bay được nữa.")]),
 dict(title="Thử thách vàng", kind="vang", hiep=2, icon="art:sao", nhom=["TO", "GN", "CY"], way="nhin-nhanh", backdrop={"id": "L001-BG-02", "kind": "san"},
  intro=["Thử thách vàng! Bé sẵn sàng chưa?"],
  activities=[A(16, "E01", "TO.DEM.01", "Thử thách vàng", mode="flash", objs=["art:hat-dau"], opts=[1, 2, 3], words=W, rounds=4, q="Có mấy hạt?",
   levels=[F(2, 2000, "Hạt nằm lộn xộn đó!", "Có mấy hạt?", scatter=True), F(3, 2000, "Nhìn thật nhanh!", "Có mấy hạt?", scatter=True),
           F(3, 2000, "Đừng đếm viên sỏi nhé!", "Mấy hạt?", distract="art:soi"), F(1, 1500, "Màn cuối đây!", "Có mấy hạt?", distract="art:la")],
   ok="Xuất sắc! Đúng {word} hạt!", no="Suýt đúng rồi! Bé bấm Xem lại nhé.")]),
]
acts = [a for s in stages for a in s["activities"]]
skills = []
for a in acts:
    if a["skill_id"] not in [s["skill_id"] for s in skills]: skills.append({"skill_id": a["skill_id"], "cls": "G" if a["skill_id"] == "TO.DEM.01" else "T"})
pkg = dict(format="lu-lesson", format_version=2, lesson_id="M001", vi_tri="M001", age="4–6 tuổi", content_version="M001-kichban-1",
  review_status="nhap", layout="hub", title="Hạt giống cầu vồng bay mất", minutes=20,
  note="Giáo trình Mono 200 buổi, buổi 1 (kịch bản từng màn 27/11). Không hỏi cảm xúc đầu buổi, không dạy mẫu. Bé dưới 4,5 tuổi học 2 hiệp, nghỉ sau bài 5.",
  skills=skills,
  intro=["Ôi! Gió thổi bay hết hạt giống của bà rồi!", "Bà có hai mươi hạt cầu vồng. Bé giúp Mono tìm nhé!"],
  backdrop={"id": "L001-BG-02", "kind": "san"},
  hub={"q": "Bé chọn bài để học nhé.", "again": "Bé chọn bài tiếp theo nhé.", "backdrop": {"id": "L001-BG-02", "kind": "san"}},
  stages=stages,
  end=["Bé tìm được hạt cầu vồng đầu tiên rồi!", "Quà của bé đây: thẻ Gà con!", "Ơ kìa, hạt đậu kia lăn đi đâu thế?"],
  reward={"title": "Thẻ sưu tập: Gà con", "e": ["art:ga-con"]},
  parent={"goal": "Con nhìn nhanh và đếm nhóm 1 đến 3 vật, nghe hiểu câu chuyện ngắn, chào bằng tiếng Anh.",
          "why": "Hỏi con: “Làm sao con biết có ba hạt?” Con có thể chỉ tay đếm lại. Bố mẹ không chấm đúng sai.",
          "tonight": ["Khi dọn bàn ăn, nhờ con đếm 3 cái thìa, chạm từng cái và đếm to."]})
out = pathlib.Path(__file__).resolve().parents[2] / "content/drafts/M001.json"
out.write_text(json.dumps(pkg, ensure_ascii=False, indent=1) + "\n")
print("ghi", out, len(acts), "hoạt động")

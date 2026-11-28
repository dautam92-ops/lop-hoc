# Dựng buổi M050 "Hội bến thuyền" (buổi 50, ôn tuần) theo kịch bản 200 buổi:
# /mnt/project-files/san-pham-500-bai/giao-trinh-moi/kich-ban-200-buoi.md (## Buổi 50). Chạy: python3 tools/mono/m050.py
from chung import mk, it, F, tu, wide, ghi, W
A = mk("M050")
BEN = {"id": "M050-BG-01", "kind": "bo-ao"}
NUM = lambda *v: [{"v": x} for x in v]
TO = {"id": "to", "label": "Bến to", "e": "co:100:art:thuyen", "say": "Bến thuyền to."}
NHO = {"id": "nho", "label": "Bến nhỏ", "e": "co:50:art:thuyen", "say": "Bến thuyền nhỏ."}
VUA = {"id": "vua", "label": "Bến vừa", "e": "co:75:art:thuyen", "say": "Bến thuyền vừa."}
th = lambda c, g: {"e": f"co:{c}:art:thuyen", "g": g}
stages = [
 dict(title="Gà muốn gì nhỉ?", kind="dinh", hiep=1, icon="art:ga-con", nhom=["EQ", "NT", "QS"], way="doan-cam-xuc", backdrop=BEN,
  intro=["Gà con theo thuyền ra đảo chơi. Bé nhìn gà con nhé!"],
  activities=[A(1, "E01", "EQ.CX.01", "Gà muốn gì nhỉ?", nl="03 13 18", mode="items", order="fixed", rounds=4, items=[
   it("Gà con cười tươi. Gà con thấy thế nào?", ["face:buon", "face:vui"], 1, "Tinh ý quá! Gà con đang vui.", "Mình cùng xem lại nào! Gà con đang cười mà.", style="face", show="art:ga-con"),
   it("Gà con ngáp dài. Gà con muốn gì?", [wide("Chạy nhảy tiếp.", "art:ga-con-chay"), wide("Đi ngủ một chút.", "art:ga-con-ngu"), wide("Uống nước.", "art:ga-con-uong-nuoc")], 1,
      "Đúng rồi! Gà con buồn ngủ rồi.", "Bé thử lại nào! Ngáp dài là buồn ngủ đó.", style="wide", show="art:ga-con-ngap"),
   it("Gà con im lặng. Bé nói gì với gà?", [wide("Gà chán ghê!", "face:gian"), wide("Đi chỗ khác đi!", "face:buon"), wide("Gà ngồi cùng mình không?", "face:vui")], 2,
      "Bé tốt bụng quá! Gà con muốn ngồi cùng.", "Bé thử lại nào! Mình hỏi ý gà con nhé.", style="wide", show="art:ga-con-im-lang"),
   it("Bạn cua vẫy càng chào. Bé nói gì?", [wide("Chào bạn cua!", "face:vui"), wide("Mình không chơi đâu.", "face:binh-tinh"), wide("Cua đi đi!", "face:gian")], 0,
      "Xuất sắc! Bạn cua vui lắm.", "Gần đúng rồi! Bạn chào thì mình chào lại.", style="wide", show="art:cua")])]),
 dict(title="Xếp thuyền vào bến", hiep=1, icon="art:thuyen", nhom=["TD", "QS"], way="phan-loai", backdrop=BEN,
  intro=["Thuyền to vào bến to, thuyền nhỏ vào bến nhỏ."],
  activities=[A(2, "E03", "TD.KG.04", "Xếp thuyền vào bến", nl="06 04 16", groups=[TO, NHO], items=[th(100, "to")] * 2 + [th(50, "nho")] * 2, per_round=4, rounds=1,
   no="Bé thử lại nào! Bé so độ to của thuyền nhé.", done="Giỏi quá! Thuyền nào cũng vào đúng bến."),
   A(3, "E03", "TD.KG.04", "Thêm nhiều thuyền", nl="06 04", groups=[TO, NHO], items=[th(100, "to")] * 3 + [th(50, "nho")] * 3, per_round=6, rounds=1, intro=["Thêm thuyền về bến rồi! Bé xếp tiếp nhé!"],
   no="Bé thử lại nào! Thuyền nhỏ vào bến nhỏ nhé.", done="Tuyệt vời! Sáu thuyền về đúng bến."),
   A(4, "E03", "TD.KG.04", "Có cả bến vừa", nl="06 04 05", groups=[TO, VUA, NHO], items=[th(100, "to")] * 2 + [th(75, "vua")] * 2 + [th(50, "nho")] * 2, per_round=6, rounds=1, intro=["Có thêm bến vừa rồi! Bé xếp nhé!"],
   no="Bé thử lại nào! Bé so ba cỡ thuyền nhé.", done="Còi tàu vang lên rồi! Bé xếp giỏi quá!")]),
 dict(title="Cua bò đi mấy con?", hiep=1, icon="art:cua", nhom=["TO", "TD"], way="tinh", backdrop=BEN,
  intro=["Trên bến có các chú cua. Vài chú bò xuống biển."],
  activities=[A(5, "E11", "TO.TG.02", "Một chú cua bò đi", nl="02 01", on_tap="so:5", mode="tray", obj="art:cua", max=5, label="Bé chọn số",
   tasks=[{"type": "bot", "start": 5, "take": 1, "say": ["Trên bến có năm chú cua."], "act": "Bé chạm một chú cua bò đi nhé.", "q": "Còn lại mấy chú cua?", "ok": "Đúng rồi! Năm bớt một còn {n}."}],
   no="Bé thử lại nào! Bé đếm số cua còn lại nhé."),
   A(6, "E11", "TO.TG.02", "Hai chú cua bò đi", nl="02 01", mode="tray", obj="art:cua", max=5, label="Bé chọn số",
   tasks=[{"type": "bot", "start": 5, "take": 2, "say": ["Lại có năm chú cua."], "act": "Bé chạm hai chú cua bò đi nhé.", "q": "Còn lại mấy chú cua?", "ok": "Giỏi quá! Năm bớt hai còn {n}."}],
   no="Bé thử lại nào! Bé đếm số cua còn lại nhé."),
   A(7, "E11", "TO.TG.02", "Bốn chú cua", nl="02 18", mode="tray", obj="art:cua", max=5, label="Bé chọn số",
   tasks=[{"type": "bot", "start": 4, "take": 2, "say": ["Giờ có bốn chú cua."], "act": "Bé chạm hai chú cua bò đi nhé.", "q": "Còn lại mấy chú cua?", "ok": "Chính xác! Bốn bớt hai còn {n}."}],
   no="Bé thử lại nào! Bé đếm số cua còn lại nhé.")]),
 dict(title="Tự phục vụ ở hội", hiep=1, icon="art:coc-nuoc", nhom=["KS", "NT"], way="chon-cach", backdrop=BEN,
  intro=["Ở hội, Mono tự làm nhiều việc lắm!"],
  activities=[A(8, "E01", "EQ.AT.D01", "Tự phục vụ ở hội", nl="04 18 03", mode="items", rounds=3, items=[
   it("Mono khát nước. Mono tự lấy gì?", ["art:coc-nuoc", "art:giay", "art:mu"], 0, "Giỏi quá! Mono tự rót nước uống.", "Bé thử lại nào! Khát nước thì cần gì nhỉ?", show="lu:suy-nghi"),
   it("Mono ra bến chơi. Mono tự đi gì?", ["art:mu", "art:giay", "art:coc-nuoc"], 1, "Đúng rồi! Mono tự đi giày.", "Bé thử lại nào! Đi gì vào chân nhỉ?", show="lu:di-bo"),
   it("Nắng to quá! Mono tự đội gì?", ["art:giay", "art:coc-nuoc", "art:mu"], 2, "Tuyệt vời! Mono tự đội mũ rồi.", "Gần đúng rồi! Đội gì lên đầu nhỉ?", show="art:mat-troi")])]),
 dict(title="Kéo co bên bến", kind="nghi", icon="lu:nhay", nhom=["KT"], way="van-dong", backdrop=BEN,
  intro=["Mình đứng dậy chơi kéo co nhé!"],
  activities=[A(9, "E15", "KP.VD.01", "Cầm dây thật chắc", nl="17 16", mode="do", lu="dang-tay", task="Hai tay cầm dây thật chắc nào!", button="Bé làm xong rồi", seconds=15, evidence="tiep-xuc"),
   A(10, "E15", "KP.VD.01", "Kéo thật mạnh", nl="17", mode="do", lu="vui-mung", task="Ngả người kéo mạnh! Một, hai, ba, kéo!", button="Bé làm xong rồi", seconds=20, evidence="tiep-xuc"),
   A(11, "E15", "KP.VD.01", "Reo hò chiến thắng", nl="17 11", mode="do", lu="an-mung", task="Thắng rồi! Giơ tay reo thật to nào!", button="Bé làm xong rồi", seconds=15, evidence="tiep-xuc")]),
 dict(title="My body", hiep=2, icon="lu:vay-tay", nhom=["EN", "CY", "GN"], way="hoc-tu", backdrop=BEN,
  intro=["Mình học tên ba bộ phận cơ thể nhé!"],
  activities=[A(12, "E01", "EN.EN.14", "My body", nl="03 08", mode="items", order="fixed", rounds=3, items=[
   tu("Đôi mắt, tiếng Anh là", "Eyes", "art:mono-chi-mat", "Bé nói hay quá!"),
   tu("Bàn tay, tiếng Anh là", "Hands", "art:mono-xoe-tay", "Giỏi quá! Bé nhớ bàn tay rồi."),
   tu("Đôi chân, tiếng Anh là", "Legs", "art:mono-chi-chan", "Tuyệt vời! Bé nhớ cả ba từ rồi.")])]),
 dict(title="Bên cạnh, ở giữa", hiep=2, icon="art:thuyen-do", nhom=["TD", "TV", "QS"], way="quan-sat", backdrop=BEN,
  intro=["Ba chiếc thuyền đậu thành hàng trên bến."],
  activities=[A(13, "E01", "TV.TU.01", "Bên cạnh, ở giữa", nl="06 03 04", mode="items", rounds=3, items=[
   it("Thuyền nào ở giữa?", ["art:thuyen-do", "art:thuyen-vang", "art:thuyen-xanh"], 1, "Đúng rồi! Thuyền vàng ở giữa.", "Bé thử lại nào! Bé nhìn thuyền giữa hàng nhé.", show=["art:thuyen-do", "art:thuyen-vang", "art:thuyen-xanh"]),
   it("Thuyền nào bên cạnh thuyền vàng?", ["art:thuyen-do", "art:thuyen-xanh", "art:thuyen-vang"], 1, "Giỏi quá! Thuyền xanh bên cạnh thuyền vàng.", "Bé thử lại nào! Thuyền nào đứng sát thuyền vàng?", show=["art:thuyen-do", "art:thuyen-xanh", "art:thuyen-vang"]),
   it("Thuyền nào bên cạnh thuyền đỏ?", ["art:thuyen-vang", "art:thuyen-do", "art:thuyen-xanh"], 0, "Chính xác! Thuyền vàng bên cạnh thuyền đỏ.", "Gần đúng rồi! Thuyền nào đứng sát thuyền đỏ?", show=["art:thuyen-xanh", "art:thuyen-vang", "art:thuyen-do"])])]),
 dict(title="Chơi gần nước an toàn", hiep=2, icon="art:mono-ao-phao", nhom=["KT", "KS", "NT"], way="dung-sai", backdrop=BEN,
  intro=["Chơi gần nước phải thật cẩn thận."],
  activities=[A(14, "E01", "EQ.AT.06", "Chơi gần nước an toàn", nl="18 04", mode="items", rounds=3, items=[
   it("Mono mặc áo phao. An toàn chưa?", ["face:vui", "face:buon"], 0, "Đúng rồi! Có áo phao là an toàn.", "Bé thử lại nào! Áo phao giữ Mono nổi mà.", style="face", show="art:mono-ao-phao"),
   it("Mono đứng sát mép bến một mình. An toàn chưa?", ["face:vui", "face:buon"], 1, "Giỏi quá! Đứng sát mép nước là nguy hiểm.", "Bé thử lại nào! Mép bến dễ trượt ngã lắm.", style="face", show="art:mono-mep-ben"),
   it("Mono nắm tay bà đi trên bến. An toàn chưa?", ["face:buon", "face:vui"], 1, "Chính xác! Nắm tay người lớn là an toàn.", "Gần đúng rồi! Có bà đi cùng mà.", style="face", show="art:mono-nam-tay-ba")])]),
 dict(title="Cờ hội cho thuyền", hiep=2, icon="art:co-hoi", nhom=["ST", "TTg"], way="sang-tao", backdrop=BEN,
  intro=["Mình làm lá cờ cho thuyền của bé nhé!"],
  activities=[A(15, "E14", "KP.ST.D01", "Dán hình lên cờ", nl="11 12 15", mode="sticker", bg="art:co-hoi", stickers=["art:sao", "art:ca", "art:mat-troi"], min=2,
   intro=["Lá cờ của bé có hình gì?"], done="Lá cờ đẹp quá! Bé chọn hình hay lắm."),
   A(16, "E14", "KP.ST.D01", "Thêm hình nữa", nl="11 12", mode="sticker", bg="art:co-hoi", keep=True, stickers=["art:hoa", "art:cua", "art:sao"], min=1,
   intro=["Bé dán thêm hình nữa nhé!"], done="Bé trang trí khéo quá!"),
   A(17, "E14", "KP.ST.D01", "Cờ tung bay", nl="12 16", mode="sticker", bg="art:co-hoi", keep=True, stickers=["art:ca", "art:mat-troi", "art:hoa"], min=1,
   intro=["Thêm một hình cuối cùng nào!"], done="Giỏi quá! Cờ của bé tung bay trên cột buồm.")]),
 dict(title="Bằng nhau chưa?", kind="vang", hiep=2, icon="art:ca", nhom=["TO", "TD", "QS"], way="tinh", backdrop=BEN,
  intro=["Thử thách vàng! Hai thuyền chở cá.", "Bé làm cho hai bên bằng nhau nhé!"],
  activities=[A(18, "E01", "TO.SS.02", "Bằng nhau chưa?", nl="02 01 18", mode="items", order="fixed", style="number", rounds=4, items=[
   it("Bên trái cần thêm mấy chú cá?", NUM(1, 2, 3), 0, "Đúng rồi! Thêm một chú cá là bằng nhau.", "Bé thử lại nào! Bé đếm cá hai thuyền nhé.", show=["art:ca*3", "art:ca*4"]),
   it("Bên trái cần thêm mấy chú cá?", NUM(1, 2, 3), 1, "Giỏi quá! Thêm hai chú cá là bằng nhau.", "Bé thử lại nào! Bé đếm cá hai thuyền nhé.", show=["art:ca*4", "art:ca*6"]),
   it("Bên trái phải bớt mấy chú cá?", NUM(1, 2, 3), 1, "Chính xác! Bớt hai chú cá là bằng nhau.", "Gần đúng rồi! Bé đếm cá bên trái nhé.", show=["art:ca*5", "art:ca*3"]),
   it("Bên trái cần thêm mấy chú cá?", NUM(2, 3, 4), 1, "Xuất sắc! Thêm ba chú cá là bằng nhau.", "Suýt đúng rồi! Bé đếm thật kỹ nhé.", show=["art:ca*2", "art:ca*5"])])]),
]
ghi("M050", "Hội bến thuyền", stages, backdrop=BEN,
  note="Giáo trình Mono 200 buổi, buổi 50 (ôn tuần: tự phục vụ, xếp thuyền, thêm bớt). Không hỏi cảm xúc đầu buổi, không dạy mẫu. Bé dưới 4,5 tuổi học 2 hiệp, nghỉ sau bài 5.",
  intro=["Đảo nhỏ mở hội bến thuyền!", "Gà con theo thuyền ra đảo chơi với Mono."],
  end=["Hội vui quá! Bé nhận vỏ sò ánh trăng thứ mười.", "Ngọn hải đăng sáng được một nửa rồi!", "Đêm về, Mono viết nhật ký… mà quên mất từ!"],
  reward={"title": "Huy hiệu: Thuyền trưởng nhí", "e": ["art:thuyen"]},
  parent={"goal": "Con nhận ra cảm xúc của bạn, xếp theo kích thước, bớt trong phạm vi 5, làm cho hai nhóm bằng nhau, tự phục vụ.",
          "why": "Hỏi con: “Làm sao con biết hai thuyền bằng nhau?” Nghe con giải thích, bố mẹ không chấm đúng sai.",
          "tonight": ["Con tự rót nước vào cốc nhỏ, uống xong tự cất cốc."]})

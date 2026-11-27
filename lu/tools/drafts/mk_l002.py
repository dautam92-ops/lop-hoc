# -*- coding: utf-8 -*-
"""L002 "Hạt đậu lăn đi đâu" theo cấu trúc L001 (tam 26/11/2026) và dàn ý đã gửi:
12 bài nhỏ, mỗi bài 3–4 bài tập, đủ 6 nhóm TO TV TD KP EQ EN, ≥ 8 năng lực (có tưởng tượng, sáng tạo).
Trọng tâm TD.QS.01 (quan sát: tìm vật ẩn trong tranh vườn). Chỉ dùng ảnh đã duyệt hoặc hình đã có ở L001.
Chạy: python3 tools/drafts/mk_l002.py → content/drafts/L002.json
"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
L1 = json.load(open(os.path.join(ROOT, "content/drafts/L001.json"), encoding="utf-8"))
TX = "tiep-xuc"
N = [0]
def aid():
    N[0] += 1; return f"L002-B{N[0]:02d}"
def items(skill, title, its, mechanic, lu="suy-nghi", **kw):
    a = {"activity_id": aid(), "engine": "E01", "mode": "items", "skill_id": skill, "title": title, "items": its, "order": "fixed",
         "scene": "lu", "lu": lu, "mechanic": mechanic}
    a.update(kw); return a
BONG = "Cái bóng này là của ảnh nào dưới đây?"  # quy tắc 39 (tam 27/11)
def q(text, a, ok, no, *opts, **kw):
    return {"q": text, "a": a, "ok": ok, "no": no, "opts": [{"e": e} for e in opts], "style": kw.pop("style", "face"), **kw}
WAY = ["quan-sat-tranh", "tim-vat", "keo-tha", "cham-dem", "ke-chuyen", "tri-nho", "phan-loai", "kham-pha", "tinh-huong-eq", "nghe-chon", "van-dong", "ky-nang-song"]
def st(title, icon, nhom, bd, intro, acts, tk, done, lu="vay-tay"):
    return {"title": title, "icon": icon, "nhom": nhom, "way": WAY[len(S)], "backdrop": {"id": bd[0], "kind": bd[1]}, "intro": [intro], "lu": lu,
            "activities": acts, "thiet_ke": tk, "done": done}

S = []
# 1 ─ Trọng tâm: tìm hạt đậu lăn trong vườn (có chấm)
S.append(st("Hạt đậu lăn đi đâu?", "art:hat-dau*3", ["QS"], ("L001-BG-03", "vuon"), "Gió thổi hạt đậu lăn khắp vườn. Bé tìm giúp Lu nhé.", [
    {"activity_id": aid(), "engine": "E06", "mechanic": "M26", "skill_id": "TD.QS.01", "title": "Hạt đậu trốn trong vườn",
     "q": "Bé chạm vào từng {name} nhé.", "targets": [{"e": "art:hat-dau", "name": "hạt đậu"}], "distractors": ["art:la", "art:soi", "art:hoa"],
     "min": 2, "max": 3, "cells": 9, "rounds": 2, "no": "Đó chưa phải hạt đậu. Hạt đậu nhỏ, màu vàng nâu.", "done": "Bé tìm thấy đủ hạt đậu rồi!"},
    items("TD.QS.01", "Hạt đậu nấp sau gì?", [
        q(BONG, 2, "Đúng rồi! Đó là cái giỏ.", "Bé nhìn kỹ: bóng có quai cầm.", "art:la", "art:tao", "art:gio", show="art:gio"),
        q(BONG, 0, "Đúng rồi! Đó là cái lá.", "Bé nhìn kỹ: bóng dài, có cuống nhỏ.", "art:la-cay", "art:ca-rot", "art:oc", show="art:la-cay")],
        "M10", lu="chi-tay", scene="story", shadow=True)],
    {"kien_thuc": "Quan sát kỹ để tìm vật nhỏ lẫn trong tranh; nhận ra vật qua hình bóng.", "bai_tap": ["Tìm hạt đậu lần 1", "Tìm hạt đậu lần 2", "Bóng cái giỏ", "Bóng chiếc lá"],
     "bang_chung": "TD.QS.01 có chấm: đúng ngay lần đầu, số lần thử."}, "Bé tinh mắt quá!"))
# 2 ─ Trọng tâm mức tiếp theo: ít gợi ý hơn, vật mới
S.append(st("Ai trốn trong vườn?", "art:ga-con", ["CY"], ("vuon", "vuon"), "Các bạn nhỏ cũng trốn trong vườn. Bé tìm nhé.", [
    {"activity_id": aid(), "engine": "E06", "mechanic": "M26", "skill_id": "TD.QS.01", "title": "Tìm gà con",
     "q": "Bé chạm vào từng {name} nhé.", "targets": [{"e": "art:ga-con", "name": "chú gà con"}], "distractors": ["art:ga", "art:chim", "art:trung"],
     "min": 2, "max": 3, "cells": 9, "rounds": 1, "no": "Đó chưa phải gà con. Gà con nhỏ, lông vàng.", "done": "Bé tìm ra hết gà con rồi!"},
    items("TD.QS.01", "Bóng của bạn nào?", [
        q(BONG, 1, "Đúng rồi! Đó là chú mèo.", "Bé nhìn kỹ: bóng có tai nhọn và đuôi dài.", "art:ga", "art:meo", "art:ech", show="art:meo"),
        q(BONG, 2, "Đúng rồi! Đó là con bướm.", "Bé nhìn kỹ: bóng có hai cánh to.", "art:ong", "art:chim", "art:buom", show="art:buom")],
        "M10", lu="to-mo", scene="story", shadow=True)],
    {"kien_thuc": "Tìm vật giống nhau giữa vật gần giống; nhận ra con vật qua bóng.", "bai_tap": ["Tìm gà con", "Bóng chú mèo", "Bóng con bướm"],
     "bang_chung": "TD.QS.01 có chấm, mức ít gợi ý."}, "Không bạn nào trốn được bé!"))
# 3 ─ Toán: số 1, 2, 3 — tương ứng một đối một, hiểu số lượng
S.append(st("Mỗi chậu một hạt", "art:coc:3", ["TO"], ("L001-BG-04", "luong"), "Mỗi cọc số cần đúng số hạt. Bé giúp Lu nhé.", [
    {"activity_id": aid(), "engine": "E02", "mechanic": "M03", "target_style": "pair", "skill_id": "TO.DEM.01", "title": "Hạt về đúng cọc",
     "intro": [], "label": "Kéo hạt về đúng cọc", "sets": [[{"piece": "art:hat-dau*2", "target": "art:coc:2"}, {"piece": "art:hat-dau*3", "target": "art:coc:3"}, {"piece": "art:hat-dau*1", "target": "art:coc:1"}]],
     "rounds": 1, "no": "Bé đếm số hạt, rồi tìm cọc có số giống vậy.", "done": "Hạt nào cũng về đúng cọc rồi!"},
    {"activity_id": aid(), "engine": "E02", "mechanic": "M03", "target_style": "pair", "skill_id": "TO.DEM.01", "title": "Quả táo về đúng cọc",
     "intro": [], "label": "Kéo táo về đúng cọc", "sets": [[{"piece": "art:tao*1", "target": "art:coc:1"}, {"piece": "art:tao*3", "target": "art:coc:3"}, {"piece": "art:tao*2", "target": "art:coc:2"}]],
     "rounds": 1, "no": "Bé đếm số quả táo trước nhé.", "done": "Táo đã về đúng cọc!"},
    items("TO.DEM.01", "Giỏ nào đúng?", [
        q("Bé tìm giỏ có một hạt đậu.", 0, "Đúng rồi! Giỏ này có một hạt đậu.", "Bé đếm từng hạt trong giỏ xem.", "art:hat-dau", "art:hat-dau", "art:hat-dau", style="plate"),
        q("Bé tìm giỏ có hai hạt đậu.", 1, "Đúng rồi! Giỏ này có hai hạt đậu.", "Bé đếm từng hạt trong giỏ xem.", "art:hat-dau", "art:hat-dau", "art:hat-dau", style="plate")],
        "M02", lu="chi-tay", style="plate")],
    {"kien_thuc": "Mỗi vật ứng với một tiếng đếm; ghép nhóm 1–3 vật với số.", "bai_tap": ["Kéo hạt về cọc", "Kéo táo về cọc", "Giỏ một hạt", "Giỏ hai hạt"],
     "bang_chung": "TO.DEM.01 có chấm."}, "Bé ghép số giỏi quá!"))
for it in S[2]["activities"][2]["items"]:
    for k, o in enumerate(it["opts"]): o["n"] = [2, 1, 3][k] if it["a"] == 0 else [1, 2, 3][k]
S[2]["activities"][2]["items"][0]["opts"] = [{"e": "art:hat-dau", "n": 1}, {"e": "art:hat-dau", "n": 2}, {"e": "art:hat-dau", "n": 3}]
S[2]["activities"][2]["items"][1]["opts"] = [{"e": "art:hat-dau", "n": 3}, {"e": "art:hat-dau", "n": 2}, {"e": "art:hat-dau", "n": 1}]
# 4 ─ Ôn đếm (TO.DEM.01) bằng cách học khác L001
S.append(st("Đếm cùng gà con", "art:ga-con*2", ["TO"], ("L001-BG-02", "san"), "Gà con chạy ra sân. Bé đếm cùng Lu nhé.", [
    {"activity_id": aid(), "engine": "E01", "mechanic": "M01", "mode": "count", "skill_id": "TO.DEM.01", "title": "Có mấy chú gà con?",
     "hint": "Bé chạm từng chú, mỗi chú đếm một tiếng.", "q": "Có mấy chú gà con trên sân?", "object": "art:ga-con", "pool": [1, 2, 3], "max": 3, "rounds": 2,
     "words": ["một", "hai", "ba"], "ok": "Bé giỏi lắm! Có {word} chú gà con.", "no": "Bé chạm đếm lại từng chú nhé.", "hint_glow": False},
    {"activity_id": aid(), "engine": "E04", "mechanic": "M09", "mode": "order", "skill_id": "TO.DEM.01", "title": "Xếp ổ trứng ít đến nhiều",
     "intro": [], "q": "Bé chạm ổ ít trứng nhất trước, rồi tới ổ nhiều hơn.", "object": "art:trung", "max": 3, "groups": 3, "rounds": 1,
     "no": "Bé đếm số trứng trong từng ổ xem.", "ok": "Một quả, hai quả, ba quả. Bé xếp đúng rồi!"}],
    {"kien_thuc": "Ôn đếm 1–3 với vật mới; so sánh ít, nhiều.", "bai_tap": ["Đếm gà lần 1", "Đếm gà lần 2", "Xếp ổ trứng"], "bang_chung": "TO.DEM.01 ôn."}, "Bé đếm giỏi quá!"))
# 5 ─ Tiếng Việt: nghe chuyện hạt đậu lăn, vỗ tay theo tiếng
S.append(st("Hạt đậu lăn tới đâu?", "art:tui", ["TV"], ("hien", "hien"), "Bé nghe Lu kể nhé.", [
    items("TV.NG.01", "Bé nhớ chuyện", [
        q("Gió thổi, hạt đậu lăn ra khỏi cái gì?", 0, "Đúng rồi! Hạt lăn ra khỏi túi.", "Bé nghe lại nhé: hạt lăn ra khỏi túi.", "art:tui", "art:nha", "art:chao"),
        q("Hạt đậu lăn tới gần con vật nào?", 1, "Đúng rồi! Hạt lăn tới chỗ gà con.", "Hạt lăn tới chỗ bạn gà con đấy.", "art:meo", "art:ga-con", "art:ca")],
        "M36", lu="suy-nghi", intro=["Gió thổi mạnh. Hạt đậu lăn ra khỏi túi, lăn tới chỗ gà con."], evidence=TX),
    {"activity_id": aid(), "engine": "E15", "mechanic": "M40", "mode": "do", "skill_id": "TV.AM.01", "title": "Vỗ tay theo tiếng",
     "lu": "an-mung", "intro": ["Mỗi tiếng, bé vỗ một cái nhé."], "task": "Hạt, vỗ một cái. Hạt đậu, vỗ hai cái. Hạt đậu lăn, vỗ ba cái.",
     "button": "Vỗ xong rồi!", "seconds": 30, "evidence": TX}],
    {"kien_thuc": "Nghe chuyện ngắn, nhớ chi tiết; vỗ tay theo số tiếng.", "bai_tap": ["Hạt lăn ra khỏi đâu", "Hạt lăn tới ai", "Vỗ tay theo tiếng"], "bang_chung": "Tiếp xúc TV.NG.01, TV.AM.01."},
    "Bé nghe chuyện giỏi lắm!", lu="vui-mung"))
# 6 ─ Tư duy: lật thẻ nhớ chỗ
S.append(st("Lật thẻ tìm đôi", "art:la", ["GN"], ("L001-BG-05", "hien"), "Bé lật hai thẻ, tìm hai thẻ giống nhau nhé.", [
    {"activity_id": aid(), "engine": "E05", "mechanic": "M21", "skill_id": "TD.TN.01", "title": "Ba đôi thẻ", "intro": [],
     "pool": ["art:ga-con", "art:trung", "art:ga"], "pairs": 3, "done": "Bé nhớ chỗ các thẻ giỏi lắm!", "evidence": TX},
    {"activity_id": aid(), "engine": "E05", "mechanic": "M21", "skill_id": "TD.TN.01", "title": "Bốn đôi thẻ", "intro": ["Thêm một đôi nữa nhé."],
     "pool": ["art:tao", "art:ca-rot", "art:rau", "art:hat-dau"], "pairs": 4, "done": "Bé giỏi lắm!", "evidence": TX},
    {"activity_id": aid(), "engine": "E05", "mechanic": "M21", "skill_id": "TD.TN.01", "title": "Thẻ bạn nhỏ", "intro": ["Lượt cuối rồi. Bé nhớ chỗ nhé."],
     "pool": ["art:buom", "art:ong", "art:oc", "art:ech"], "pairs": 4, "done": "Bé nhớ chỗ giỏi quá!", "evidence": TX}],
    {"kien_thuc": "Nhớ vị trí thẻ đã lật.", "bai_tap": ["3 đôi", "4 đôi", "4 đôi vật mới"], "bang_chung": "Tiếp xúc TD.TN.01."}, "Bé nhớ chỗ các thẻ giỏi lắm!"))
# 7 ─ Tư duy logic: thứ nào khác nhóm
S.append(st("Thứ nào khác nhóm?", "art:soi", ["TD"], ("phong", "phong"), "Lu có mấy câu đố. Bé tìm thứ khác nhóm nhé.", [
    items("TD.LG.04", "Thứ nào không giống?", [
        q("Thứ nào không phải con vật?", 2, "Đúng rồi! Quả táo không phải con vật.", "Gà, mèo, cá đều là con vật. Còn thứ nào khác?", "art:ga", "art:meo", "art:tao", "art:ca"),
        q("Thứ nào không ăn được?", 3, "Đúng rồi! Viên sỏi không ăn được.", "Táo, cà rốt, rau đều ăn được. Bé tìm thứ khác nhé.", "art:tao", "art:ca-rot", "art:rau", "art:soi"),
        q("Thứ nào không bay được?", 1, "Đúng rồi! Con ốc không bay được.", "Chim, ong, bướm đều bay được. Còn bạn nào?", "art:chim", "art:oc", "art:ong", "art:buom")],
        "M19", lu="suy-nghi")],
    {"kien_thuc": "Phân loại theo một đặc điểm.", "bai_tap": ["Không phải con vật", "Không ăn được", "Không bay được"], "bang_chung": "Tiếp xúc TD.LG.04."}, "Bé suy nghĩ giỏi quá!"))
# 8 ─ Khám phá: hạt đậu và nước
S.append(st("Hạt đậu gặp gì?", "art:giot-nuoc", ["KT", "NT"], ("L001-BG-03", "vuon"), "Hạt đậu lăn đi gặp nhiều thứ. Bé đoán xem nhé.", [
    items("KP.KH.01", "Bé đoán xem", [
        q("Hạt đậu lăn vào chỗ ướt. Hạt cần gì để nảy mầm?", 0, "Đúng rồi! Hạt cần nước để nảy mầm.", "Hạt cần nước. Bé tìm giọt nước nhé.", "art:giot-nuoc", "art:soi", "art:khan"),
        q("Chú gà thấy hạt đậu. Chú gà sẽ làm gì?", 1, "Đúng rồi! Chú gà mổ hạt để ăn.", "Chú gà thích ăn hạt đấy.", "art:ga-con-ngu", "art:ga-con-mo-dau", "art:ga-con-uong-nuoc"),
        q("Hạt đậu nằm trong đất lâu ngày. Hạt sẽ thành gì?", 2, "Đúng rồi! Hạt nảy thành mầm đậu.", "Hạt trong đất sẽ nảy mầm.", "art:qua-dau", "art:hoa", "art:mam-dau")],
        "M53", lu="kham-pha", evidence=TX)],
    {"kien_thuc": "Dự đoán điều xảy ra với hạt đậu (nhân quả đơn giản).", "bai_tap": ["Hạt cần nước", "Gà con ăn hạt", "Hạt nảy mầm"], "bang_chung": "Tiếp xúc KP.KH.01."}, "Bé đoán giỏi quá!", lu="kham-pha"))
# 9 ─ Cảm xúc
S.append(st("Lu thấy thế nào?", "face:vui", ["EQ"], ("L001-BG-03", "vuon"), "Mình cùng nghĩ về cảm xúc của Lu nhé.", [
    items("EQ.CX.01", "Gương mặt của Lu", [
        {"q": "Hạt đậu lăn mất. Lu có thể thấy thế nào?", "any": True, "style": "face", "ok": "Cảm ơn bé đã nghĩ cùng Lu.", "opts": [
            {"e": "face:buon", "say": "Lu thấy buồn.", "reply": "Ừ, mất hạt thì buồn. Mình cùng đi tìm nhé."},
            {"e": "face:so", "say": "Lu thấy lo lắng.", "reply": "Lo lắng là khi mình sợ không tìm thấy."},
            {"e": "face:binh-tinh", "say": "Lu thấy bình thường.", "reply": "Lu bình tĩnh đi tìm từng hạt."}]},
        {"q": "Bé tìm thấy hết hạt cho Lu. Lu thấy thế nào?", "any": True, "style": "face", "ok": "Bé hiểu Lu quá!", "opts": [
            {"e": "face:vui", "say": "Lu thấy vui.", "reply": "Lu vui vì có bé giúp."},
            {"e": "face:ngac-nhien", "say": "Lu thấy ngạc nhiên.", "reply": "Ồ, bé tìm nhanh quá!"}]}],
        "M49", lu="suy-nghi", evidence=TX),
    {"activity_id": aid(), "engine": "E15", "mechanic": "M51", "mode": "breath", "skill_id": "EQ.CX.02", "evidence": TX, "title": "Thở cùng Lu",
     "times": 2, "inn": "Hít vào thật chậm, như ngửi một bông hoa.", "out": "Thở ra từ từ, như thổi một ngọn nến.", "done": "Lu thấy dễ chịu hơn rồi."}],
    {"kien_thuc": "Gọi tên buồn, lo, vui qua tình huống; thở chậm cho bình tĩnh.", "bai_tap": ["Hạt lăn mất", "Tìm thấy hạt", "Thở cùng Lu"], "bang_chung": "Tiếp xúc EQ.CX.01, EQ.CX.02."}, "Bé hiểu cảm xúc của Lu rồi!", lu="suy-nghi"))
# 10 ─ Tiếng Anh: ôn one, two, three
S.append(st("One, two, three", "art:hat-dau*2", ["EN"], ("L001-BG-02", "san"), "Mình ôn đếm bằng tiếng Anh nhé.", [
    {"activity_id": aid(), "engine": "E01", "mechanic": "M44", "mode": "listen", "skill_id": "EN.EN.04", "evidence": TX, "title": "Listen and touch", "rounds": 3,
     "words": [{"w": "One.", "e": "art:hat-dau*1", "ok": "Yes! One!"}, {"w": "Two.", "e": "art:hat-dau*2", "ok": "Yes! Two!"}, {"w": "Three.", "e": "art:hat-dau*3", "ok": "Yes! Three!"}]},
    {"activity_id": aid(), "engine": "E15", "mechanic": "M45", "mode": "say", "skill_id": "EN.EN.04", "evidence": TX, "title": "Nói theo Lu",
     "luSays": "One, two, three!", "word": "One, two, three!", "intro": ["Bé muốn thì nói theo Lu nhé. Không nói cũng không sao."]}],
    {"kien_thuc": "Ôn one, two, three.", "bai_tap": ["Nghe chạm 1", "Nghe chạm 2", "Nghe chạm 3", "Nói theo"], "bang_chung": "Tiếp xúc EN.EN.04; không chấm phát âm."}, "Bé nhớ tiếng Anh giỏi quá!"))
# 11 ─ Sáng tạo, vận động, việc ở nhà
S.append(st("Vườn đậu của bé", "art:hoa", ["TTg", "ST"], ("cay-cao", "cay-cao"), "Mình cùng tưởng tượng nhé.", [
    {"activity_id": aid(), "engine": "E15", "mechanic": "M56", "mode": "do", "skill_id": "KP.VD.01", "title": "Lăn như hạt đậu", "lu": "dang-tay",
     "intro": ["Bé đứng dậy nào!"], "task": "Bé cuộn tròn như hạt đậu, lăn nhẹ một vòng, rồi đứng lên vươn cao.", "button": "Xong rồi!", "seconds": 35, "evidence": TX},
    items("KP.ST.D01", "Nếu hạt đậu biết nói", [
        {"q": "Nếu hạt đậu biết nói, hạt sẽ nói gì với Lu?", "any": True, "style": "face", "ok": "Bé tưởng tượng hay quá!", "opts": [
            {"e": "art:giot-nuoc", "say": "Lu ơi, cho mình uống nước nhé.", "reply": "Hạt đậu khát nước rồi."},
            {"e": "art:mam-dau", "say": "Mình sắp nảy mầm rồi.", "reply": "Mầm đậu sắp nhú lên đấy."},
            {"e": "art:ga-con", "say": "Lu ơi, giữ mình cẩn thận nhé.", "reply": "Lu sẽ giữ hạt thật cẩn thận."}]}],
        "M33", lu="to-mo", evidence=TX),
    {"activity_id": aid(), "engine": "E00", "mechanic": "M54", "title": "Trang trí vườn đậu", "lu": "an-mung", "tap": True, "skill_id": "KP.ST.D01",
     "story": ["Vườn đậu cần thêm một người bạn. Bé chọn một bạn nhé."],
     "props": [{"e": "art:buom", "name": "con bướm"}, {"e": "art:ong", "name": "chú ong"}, {"e": "art:hoa:%23f6c85f", "name": "hoa vàng"}],
     "after": "Vườn đậu đẹp hơn rồi! Ở nhà, bé nhờ bố mẹ giấu đồ chơi rồi đi tìm nhé."}],
    {"kien_thuc": "Tưởng tượng; tự chọn trang trí; vận động lăn, vươn.", "bai_tap": ["Lăn như hạt đậu", "Nếu hạt đậu biết nói", "Trang trí vườn"], "bang_chung": "Tiếp xúc KP.VD.01, KP.ST.D01."},
    "Vườn đậu của bé đẹp quá!", lu="an-mung"))

# 12 ─ Tự phục vụ: cất hạt gọn gàng
S.append(st("Cất hạt gọn gàng", "art:tui", ["KS"], ("phong", "phong"), "Tìm đủ hạt rồi. Mình cất đồ gọn gàng nhé.", [
    items("KS.SX.01", "Cất đồ đúng chỗ", [
        q("Hạt đậu nên cất vào đâu?", 0, "Đúng rồi! Hạt đậu cất vào túi.", "Hạt nhỏ, cất vào túi là gọn nhất.", "art:tui", "art:chao", "art:ao-nuoc"),
        q("Bình tưới xong rồi. Lu cất bình ở đâu?", 1, "Đúng rồi! Bình tưới để cạnh vòi nước.", "Bình tưới để gần vòi nước cho dễ lấy.", "art:nha", "art:voi-nuoc", "art:cay")],
        "M18", lu="chi-tay", evidence=TX),
    {"activity_id": aid(), "engine": "E15", "mechanic": "M58", "mode": "do", "skill_id": "KS.NN.01", "title": "Bé dọn góc chơi", "lu": "dang-tay",
     "task": "Bé nhặt ba món đồ chơi gần bé, cất vào hộp. Xong thì bấm nút nhé.", "button": "Dọn xong rồi!", "seconds": 40, "evidence": TX}],
    {"kien_thuc": "Cất đồ đúng chỗ, giữ góc chơi gọn.", "bai_tap": ["Cất hạt", "Cất bình tưới", "Dọn góc chơi"], "bang_chung": "Tiếp xúc KS.SX.01, KS.NN.01."}, "Nhà Lu gọn gàng quá!"))

pkg = {k: L1[k] for k in ("format", "format_version", "checkin", "layout")}
pkg.update({
    "lesson_id": "L002", "vi_tri": "L002", "age": "4–5 tuổi", "manifest": "manifests/L002.json",
    "parent": {"goal": "Con tập quan sát kỹ: tìm vật nhỏ lẫn trong tranh và nhận ra vật qua hình bóng.",
               "why": "Hỏi con: “Làm sao con tìm ra hạt đậu?” Con có thể nói màu, hình dạng. Bố mẹ không chấm đúng sai.",
               "tonight": ["Bố mẹ giấu một món đồ chơi trong phòng, con đi tìm.", "Bật đèn pin chiếu bóng bàn tay, con đoán là con vật gì."],
               "play": {"ten": "Ai giấu đồ chơi?", "phut": 5, "cach_choi": "Bố mẹ giấu 3 món đồ nhỏ trong phòng, con tìm và đếm đủ 3 món.", "an_toan": "Không giấu đồ nhỏ dễ nuốt, không giấu chỗ cao."}},
    "content_version": "L002-bainho-1", "review_status": "nhap", "title": "Hạt đậu lăn đi đâu", "minutes": 25,
    "note": "Theo cấu trúc L001 và dàn ý đợt 1: 12 bài nhỏ, mỗi bài 3–4 bài tập, đủ 6 nhóm, ≥ 8 năng lực. Trọng tâm TD.QS.01 có chấm.",
    "skills": [{"skill_id": "TD.QS.01", "name": "Quan sát, tìm vật ẩn", "cls": "G"}, {"skill_id": "TO.DEM.01", "name": "Đếm nhóm 1–3 vật (ôn)", "cls": "G"},
               {"skill_id": "TV.NG.01", "name": "Nghe chuyện, nhớ chi tiết (tiếp xúc)", "cls": "G"}, {"skill_id": "TV.AM.01", "name": "Vỗ tay theo tiếng (tiếp xúc)", "cls": "G"},
               {"skill_id": "TD.TN.01", "name": "Nhớ vị trí (tiếp xúc)", "cls": "G"}, {"skill_id": "TD.LG.04", "name": "Tìm thứ khác nhóm (tiếp xúc)", "cls": "G"},
               {"skill_id": "KP.KH.01", "name": "Hạt cần gì để lớn (tiếp xúc)", "cls": "GT"}, {"skill_id": "EQ.CX.01", "name": "Gọi tên cảm xúc (tiếp xúc)", "cls": "GT"},
               {"skill_id": "EQ.CX.02", "name": "Thở cho bình tĩnh (tiếp xúc)", "cls": "GT"}, {"skill_id": "EN.EN.04", "name": "One, two, three (ôn)", "cls": "G"},
               {"skill_id": "KP.VD.01", "name": "Vận động theo hướng dẫn", "cls": "T"}, {"skill_id": "KP.ST.D01", "name": "Tưởng tượng, trang trí (tiếp xúc)", "cls": "T"},
               {"skill_id": "KS.SX.01", "name": "Cất đồ đúng chỗ (tiếp xúc)", "cls": "T"}, {"skill_id": "KS.NN.01", "name": "Giữ góc chơi gọn gàng (tiếp xúc)", "cls": "T"}],
    "intro": ["Chào bé! Hôm nay bé là Lu.", "Sáng nay gió thổi mạnh quá.", "Túi hạt đậu của Lu bị đổ, hạt lăn khắp vườn.", "Mình cùng đi tìm hạt đậu nào!"],
    "hub": {"q": "Đây là các bài học nhỏ hôm nay. Bé chọn một bài để học nhé. Bài có viền vàng là bài Lu gợi ý.", "again": "Bé chọn bài tiếp theo nhé.",
            "backdrop": {"id": "L001-BG-03", "kind": "vuon"}},
    "stages": S,
    "end": ["Hôm nay bé đã tìm hạt đậu, đếm gà con và ôn ba từ tiếng Anh.", "Ở nhà, bé nhờ bố mẹ giấu đồ chơi rồi đi tìm nhé."],
})
for k in L1:
    if k not in pkg: pkg[k] = L1[k]
json.dump(pkg, open(os.path.join(ROOT, "content/drafts/L002.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("L002:", len(S), "bài nhỏ,", N[0], "hoạt động")

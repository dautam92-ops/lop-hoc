# Phần dùng chung khi dựng các buổi Mono (M001, M020, M030, M050…) từ kịch bản 200 buổi.
# Không có bước Mono dạy mẫu, không hỏi cảm xúc đầu buổi (tam 27/11). Học từ tiếng Anh theo thứ tự tam chốt 28/11.
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
W = ["một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín", "mười"]

def mk(mid):
    def A(i, engine, skill, title, nl="", **k):
        d = dict(activity_id=f"{mid}-B{i:02d}", engine=engine, skill_id=skill, title=title, **k)
        if nl: d["nang_luc"] = ["NL" + x for x in nl.split()]
        return d
    return A
def it(q, opts, a, ok, no, **k): return dict(q=q, opts=[o if isinstance(o, dict) else {"e": o} for o in opts], a=a, ok=ok, no=no, **k)
def F(n, ms, look, q, **k): return dict(n=n, ms=ms, look=look, q=q, **k)
def tu(vi, en, e, khen):
    """Một màn học từ: Mono giới thiệu → bản xứ đọc → đọc chậm (chữ sáng) → mời nói theo → im lặng 3 giây."""
    return it([vi, en + "!", "__sang", en, "Bé nói theo nào!", "__cho3"], [e], 0, [en + "!", khen], "", word=en, word_times=0)
def wide(t, e): return {"t": t, "e": e}

def ghi(mid, title, stages, **k):
    acts = [a for s in stages for a in s["activities"]]
    skills = []
    for a in acts:
        if a["skill_id"] not in [s["skill_id"] for s in skills]: skills.append({"skill_id": a["skill_id"], "cls": "G" if a is stages[0]["activities"][0] else "T"})
    bd = k.pop("backdrop")
    pkg = dict(format="lu-lesson", format_version=2, lesson_id=mid, vi_tri=mid, age="4–6 tuổi", content_version=f"{mid}-kichban-1",
               review_status="nhap", layout="hub", title=title, minutes=20, skills=skills, backdrop=bd,
               hub={"q": "Bé chọn bài để học nhé.", "again": "Bé chọn bài tiếp theo nhé.", "backdrop": bd}, stages=stages, **k)
    out = ROOT / f"content/drafts/{mid}.json"
    out.write_text(json.dumps(pkg, ensure_ascii=False, indent=1) + "\n")
    print("ghi", out, len(acts), "hoạt động")

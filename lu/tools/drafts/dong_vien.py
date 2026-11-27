# -*- coding: utf-8 -*-
"""Quy tắc 43 mở rộng (27/11): lời khi bé chọn sai ("no") mở đầu bằng một câu động viên ngắn, đổi nhiều kiểu.
Bỏ qua thẻ lật (E05: sai thì úp lại im lặng). Dùng chung cho L001 (sửa thẳng) và mk_l002.py."""
DONG_VIEN = ["Không sao đâu!", "Bé thử lại nào!", "Cố lên bé ơi!", "Bé làm được mà!", "Mình cùng xem lại nào!"]
def them_dong_vien(pkg):
    n = [0]
    def walk(o):
        if isinstance(o, dict):
            if o.get("engine") == "E05": return
            t = o.get("no")
            if isinstance(t, str) and t and not any(t.startswith(x) for x in DONG_VIEN):
                mo = DONG_VIEN[n[0] % len(DONG_VIEN)]
                if mo == "Bé thử lại nào!" and t.startswith("Bé "): mo = DONG_VIEN[(n[0] + 1) % len(DONG_VIEN)]
                o["no"] = mo + " " + t; n[0] += 1
            for v in o.values(): walk(v)
        elif isinstance(o, list):
            for v in o: walk(v)
    walk(pkg.get("stages", [])); return n[0]
if __name__ == "__main__":
    import json, sys
    p = sys.argv[1]; d = json.load(open(p, encoding="utf-8")); k = them_dong_vien(d)
    open(p, "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, indent=1) + "\n"); print(p, k, "câu")

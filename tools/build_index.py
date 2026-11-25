# Bọc bai-hoc-ipad.html thành index.html cho GitHub Pages (giữ phần <head> riêng của web)
import sys
src_path, idx_path = sys.argv[1], sys.argv[2]
old = open(idx_path, encoding='utf8').read(); src = open(src_path, encoding='utf8').read()
head = old[:old.index('<title>')]
extra = old[old.index('<style>body{margin:0}'):old.index('<body>') + len('<body>')] + '\n'
i = src.index('</style>') + len('</style>\n')
open(idx_path, 'w', encoding='utf8').write(head + src[:i] + extra + src[i:] + '\n</body>\n</html>\n')

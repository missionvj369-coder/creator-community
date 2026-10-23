import io
import sys
import re

with io.open('index.html', 'r', encoding='utf-8', newline='') as f:
    html = f.read()

# 1. Replace the two tab-handling lines inside switchTab with index-based toggling
old1 = 'document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));'
new1 = 'document.querySelectorAll(".tab").forEach((t, idx) => t.classList.toggle("active", idx === n - 1));'
if html.count(old1) != 1:
    print('anchor1 count =', html.count(old1)); sys.exit(1)
html = html.replace(old1, new1)

# 2. Remove the event.target line (and its surrounding blank-line padding)
m = re.search(r'[ \t]*event\.target\.classList\.add\("active"\);\r*\n(\r*\n)?', html)
if not m:
    print('event.target line not found'); sys.exit(1)
html = html[:m.start()] + html[m.end():]

with io.open('index.html', 'w', encoding='utf-8', newline='') as f:
    f.write(html)
print('switchTab patched, len =', len(html))

import io
import sys

with io.open('index.html', 'r', encoding='utf-8', newline='') as f:
    html = f.read()

def rep(old, new, count=1):
    global html
    if old not in html:
        print('NOT FOUND:', repr(old[:80]))
        sys.exit(1)
    n = html.count(old)
    if n != count:
        print('COUNT MISMATCH for', repr(old[:60]), '=', n)
        sys.exit(1)
    html = html.replace(old, new)
    print('OK replaced:', repr(old[:60]))

# --- 1. CSS additions before </style> ---
old_css = '    .prompt { background: #0c0c0c; border: 1px solid #00f0ff33; border-radius: 12px; padding: 16px; margin-top: 10px; font-family: monospace; }'
new_css = old_css + '''\r
\r
    .prompt-text { font-size: 12px; line-height: 1.6; color: #ccc; white-space: pre-wrap; margin-bottom: 12px; }\r
\r
    .trigger-box { display: flex; flex-direction: column; align-items: center; gap: 14px; z-index: 5; text-align: center; max-width: 340px; }\r
\r
    .instruction { font-size: 11px; color: #888; line-height: 1.7; letter-spacing: 1px; }\r
\r
    .squeeze-box { position: fixed; inset: 0; background: rgba(0,0,0,0.96); display: none; flex-direction: column; align-items: center; justify-content: center; z-index: 100; padding: 32px; text-align: center; }\r
\r
    .squeeze-box.active { display: flex; }\r
\r
    .squeeze-title { font-size: 16px; font-weight: bold; color: #ff0055; letter-spacing: 4px; margin-bottom: 16px; }\r
\r
    .squeeze-desc { font-size: 13px; color: #fff; line-height: 2; }\r
\r
    .completion-screen { position: fixed; inset: 0; background: rgba(0,0,0,0.97); display: none; flex-direction: column; align-items: center; justify-content: center; z-index: 90; padding: 32px; text-align: center; gap: 16px; }\r
\r
    .completion-screen.active { display: flex; }\r
\r
    .completion-label { font-size: 11px; color: #00f0ff; letter-spacing: 3px; border: 1px solid rgba(0,240,255,0.3); padding: 6px 14px; border-radius: 20px; }\r
\r
    .completion-title { font-size: 15px; font-weight: bold; color: #fff; }\r
\r
    .completion-desc { font-size: 12px; color: #888; line-height: 1.7; max-width: 320px; }\r
\r
    .next-day-btn { padding: 14px 32px; border-radius: 24px; border: 1px solid #00f0ff; background: transparent; color: #00f0ff; font-size: 12px; font-weight: bold; cursor: pointer; letter-spacing: 1px; }\r
\r
    .title { font-size: 13px; font-weight: bold; color: #fff; letter-spacing: 2px; text-align: center; }\r
\r
    .menu { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }\r
\r
    .menu button { padding: 14px 18px; background: #080808; border: 1px solid #1a1a1a; border-radius: 12px; color: #eee; font-size: 12px; text-align: left; cursor: pointer; }\r
\r
    .menu button:hover { border-color: #00f0ff; }\r
\r
    .tool-num { font-size: 9px; color: #00f0ff; letter-spacing: 2px; margin-bottom: 4px; }\r
\r
    .card-left { flex: 1; min-width: 0; }\r
\r
    .arrow { color: #00f0ff; font-size: 16px; }\r
'''
rep(old_css, new_css)

print('CSS patch done')
with io.open('index.patched.html', 'w', encoding='utf-8', newline='') as f:
    f.write(html)
print('Wrote index.patched.html', len(html))

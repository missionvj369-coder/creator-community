import io
import sys

with io.open('index.patched.html', 'r', encoding='utf-8', newline='') as f:
    html = f.read()

def rep(old, new, count=1):
    global html
    if old not in html:
        print('NOT FOUND:', repr(old[:90]))
        sys.exit(1)
    n = html.count(old)
    if n != count:
        print('COUNT MISMATCH for', repr(old[:60]), '=', n)
        sys.exit(1)
    html = html.replace(old, new)
    print('OK:', repr(old[:70]))

# --- 1. CSS: body flex + stacking fixes ---
rep('body { background: #000; color: #fff; height: 100vh; margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }',
    'body { background: #000; color: #fff; height: 100vh; margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; flex-direction: column; overflow: hidden; }')

rep('.view { display: none; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }',
    '.view { display: none; flex-direction: column; align-items: center; justify-content: center; flex: 1 1 auto; min-height: 0; width: 100%; overflow-y: auto; }')

rep('.tabs { display: flex; gap: 8px; padding: 10px 0; }',
    '.tabs { display: flex; gap: 8px; padding: 10px 0; position: relative; z-index: 10; }\r\n\r\n    header { position: relative; z-index: 10; }\r\n\r\n    .day-bar, .status, .btn, .title, .menu, .prompt { position: relative; z-index: 5; }')

rep('.trigger-box { display: flex;',
    '.trigger-box { position: relative; display: flex;')

# --- 2. HTML: wrap start button in triggerBox + instructionText ---
rep('<div class="btn" id="startBtn" onclick="startDailyProtocol()">START DAY 01</div>',
    '<div class="trigger-box" id="triggerBox">\r\n\r\n      <div class="instruction" id="instructionText">TAP START WHEN READY. HEADPHONES STRONGLY RECOMMENDED.</div>\r\n\r\n      <div class="btn" id="startBtn" onclick="startDailyProtocol()">START DAY 01</div>\r\n\r\n    </div>')

# --- 3. HTML: completion screen + tool overlay after statusBadge ---
rep('<div class="status" id="statusBadge">READY</div>',
    '''<div class="status" id="statusBadge">READY</div>

    <div class="completion-screen" id="completionScreen">

      <div class="completion-label" id="completedDayLabel">DAY 01 COMPLETE</div>

      <div class="completion-title" id="completedTitle"></div>

      <div class="completion-desc" id="completedDesc"></div>

      <button class="next-day-btn" onclick="advanceToNextDay()">NEXT DAY</button>

    </div>

    <div class="completion-screen" id="toolOverlay">

      <div class="completion-label">TOOL MODULE</div>

      <div class="completion-title" id="toolOverlayTitle"></div>

      <div class="completion-desc" id="toolOverlayDesc"></div>

      <button class="next-day-btn" onclick="document.getElementById('toolOverlay').classList.remove('active')">CLOSE</button>

    </div>''')

# --- 4. JS fix: innerText with <br> does not render ---
rep('document.getElementById("startBtn").innerText = "START<br>DAY "',
    'document.getElementById("startBtn").innerHTML = "START<br>DAY "')

with io.open('index.patched.html', 'w', encoding='utf-8', newline='') as f:
    f.write(html)
print('Wrote index.patched.html', len(html), 'chars')

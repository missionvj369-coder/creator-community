# _fix_products.py — idempotent, canonical fix script for Products 13-15 wiring
import io, sys, os

BASE = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(BASE, 'index.html')
with io.open(p, 'r', encoding='utf-8', newline='') as f:
    raw = f.read()
crlf = '\r\n' in raw
t = raw.replace('\r\n', '\n') if crlf else raw


def do_replace(t, old, new, label):
    """Idempotent replacement: skip if `new` already in text, apply if `old`
    exists exactly once, otherwise warn without exiting."""
    n_new = t.count(new)
    if n_new >= 1:
        print('SKIP [%s]: already applied' % label)
        return t
    n_old = t.count(old)
    if n_old != 1:
        print('WARN [%s]: old count=%d (expected 1)' % (label, n_old))
        return t
    t = t.replace(old, new, 1)
    print('OK [%s]' % label)
    return t


# ── Fix 1: Corrupted Product 12 HTML block ─────────────────────────
D = chr(0x2014)  # em-dash
F = chr(0x26f6)  # fullscreen symbol
correct_str = (
    '    <!-- ============ SECTION 13 ' + D + ' PRODUCT 12: ONE ' + D + ' 99 THOUGHTS ============ -->\n'
    '    <section id="thoughts-panel" class="glass-card rounded-2xl p-4 sm:p-6 relative overflow-hidden is-hidden">\n'
    '      <div class="flex items-center justify-between gap-2 mb-3 flex-wrap">\n'
    '        <span class="text-[10px] font-mono tracking-widest uppercase text-gray-500">UGT // ONE ' + D + ' 99 Thoughts</span>\n'
    '        <button class="p3-hud-btn" id="thoughts-fullscreen">Fullscreen ' + F + '</button>\n'
    '      </div>\n'
    '      <iframe id="thoughts-frame" class="passage-frame" src="ONE_99_Thoughts.html" title="ONE ' + D + ' 99 Thoughts" loading="lazy" allow="autoplay; fullscreen"></iframe>\n'
    '    </section>\n'
    '\n'
    '    <!-- ============ SECTION 14 ' + D + ' PRODUCT 13: HUMAN MIRROR ' + D + ' 14 WORLDS ============ -->\n'
    '    <section id="mirror14-panel" class="glass-card rounded-2xl p-4 sm:p-6 relative overflow-hidden is-hidden">\n'
    '      <div class="flex items-center justify-between gap-2 mb-3 flex-wrap">\n'
    '        <span class="text-[10px] font-mono tracking-widest uppercase text-gray-500">UGT // Human Mirror ' + D + ' 14 Worlds</span>\n'
    '        <button class="p3-hud-btn" id="mirror14-fullscreen">Fullscreen ' + F + '</button>\n'
    '      </div>\n'
    '      <iframe id="mirror14-frame" class="passage-frame" src="The_Human_Mirror_14_Worlds.html" title="The Human Mirror ' + D + ' 14 Worlds" loading="lazy" allow="autoplay; fullscreen"></iframe>\n'
    '    </section>\n'
    '\n'
    '    <!-- ============ SECTION 15 ' + D + ' PRODUCT 14: HUMAN MIRROR ' + D + ' REIMAGINED ============ -->\n'
    '    <section id="mirrorre-panel" class="glass-card rounded-2xl p-4 sm:p-6 relative overflow-hidden is-hidden">\n'
    '      <div class="flex items-center justify-between gap-2 mb-3 flex-wrap">\n'
    '        <span class="text-[10px] font-mono tracking-widest uppercase text-gray-500">UGT // Human Mirror ' + D + ' Reimagined</span>\n'
    '        <button class="p3-hud-btn" id="mirrorre-fullscreen">Fullscreen ' + F + '</button>\n'
    '      </div>\n'
    '      <iframe id="mirrorre-frame" class="passage-frame" src="The_Human_Mirror_REIMAGINED.html" title="The Human Mirror ' + D + ' Reimagined" loading="lazy" allow="autoplay; fullscreen"></iframe>\n'
    '    </section>\n'
    '\n'
    '    <!-- ============ SECTION 16 ' + D + ' PRODUCT 15: HUMAN SANCTUARY ' + D + ' 14 SCENES ============ -->\n'
    '    <section id="sanctuary-panel" class="glass-card rounded-2xl p-4 sm:p-6 relative overflow-hidden is-hidden">\n'
    '      <div class="flex items-center justify-between gap-2 mb-3 flex-wrap">\n'
    '        <span class="text-[10px] font-mono tracking-widest uppercase text-gray-500">UGT // Human Sanctuary ' + D + ' 14 Scenes</span>\n'
    '        <button class="p3-hud-btn" id="sanctuary-fullscreen">Fullscreen ' + F + '</button>\n'
    '      </div>\n'
    '      <iframe id="sanctuary-frame" class="passage-frame" src="The_Human_Sanctuary_14_Scenes.html" title="The Human Sanctuary ' + D + ' 14 Scenes" loading="lazy" allow="autoplay; fullscreen"></iframe>\n'
    '    </section>\n'
    '\n'
    '  </main>'
)

start_marker = '    <!-- ============ SECTION 13'
if correct_str in t:
    print('SKIP [Fix 1: Corrupted Product 12 HTML block]: already applied')
elif start_marker in t:
    start_idx = t.index(start_marker)
    main_tag = '  </main>'
    last_main = t.rindex(main_tag)
    end_idx = last_main + len(main_tag)
    t = t[:start_idx] + correct_str + t[end_idx:]
    print('OK [Fix 1: Corrupted Product 12 HTML block]')
else:
    print('FAIL [Fix 1: start_marker not found]')
    sys.exit(1)


# ── Fix 2: panels map — add product13-15 ─────────────────────────────
old_map = "product11: 'clarity-panel', product12: 'thoughts-panel' };"
new_map = "product11: 'clarity-panel', product12: 'thoughts-panel', product13: 'mirror14-panel', product14: 'mirrorre-panel', product15: 'sanctuary-panel' };"
t = do_replace(t, old_map, new_map, 'Fix 2: panels map product13-15')

# ── Fix 3: Remove misplaced toggles from drawIntroVOG ───────────────
old_misplaced = (
    "      const p3Panel = document.getElementById('product3-panel');\n"
    "        document.getElementById('sec-product13').classList.toggle('active', name === 'product13');\n"
    "        document.getElementById('sec-product14').classList.toggle('active', name === 'product14');\n"
    "        document.getElementById('sec-product15').classList.toggle('active', name === 'product15');\n"
    "      const p3ContentBox = document.getElementById('p3-content-box');"
)
new_misplaced = (
    "      const p3Panel = document.getElementById('product3-panel');\n"
    "      const p3ContentBox = document.getElementById('p3-content-box');"
)
t = do_replace(t, old_misplaced, new_misplaced, 'Fix 3: Remove misplaced toggles from drawIntroVOG')

# ── Fix 4: Add sec-product13/14/15 active toggles in switchSection ───
old_toggles = (
    "        document.getElementById('sec-product12').classList.toggle('active', name === 'product12');\n"
    "        if (isP3) p3Render();"
)
new_toggles = (
    "        document.getElementById('sec-product12').classList.toggle('active', name === 'product12');\n"
    "        document.getElementById('sec-product13').classList.toggle('active', name === 'product13');\n"
    "        document.getElementById('sec-product14').classList.toggle('active', name === 'product14');\n"
    "        document.getElementById('sec-product15').classList.toggle('active', name === 'product15');\n"
    "        if (isP3) p3Render();"
)
t = do_replace(t, old_toggles, new_toggles, 'Fix 4: Add toggle calls in switchSection')

# ── Fix 5: Fix mirrorre fullscreen button ID ────────────────────────
t = do_replace(t,
    "document.getElementById('mirrorre-frame').addEventListener('click'",
    "document.getElementById('mirrorre-fullscreen').addEventListener('click'",
    'Fix 5: mirrorre fullscreen button ID')

# ── Fix 6: Fix sanctuary fullscreen button ID ────────────────────────
t = do_replace(t,
    "document.getElementById('sanctuary-frame').addEventListener('click'",
    "document.getElementById('sanctuary-fullscreen').addEventListener('click'",
    'Fix 6: sanctuary fullscreen button ID')


# ── Write output ───────────────────────────────────────────────────────
out = t.replace('\n', '\r\n') if crlf else t
with io.open(p, 'w', encoding='utf-8', newline='') as f:
    f.write(out)
print('\nAll index.html fixes applied (or skipped if already done).')

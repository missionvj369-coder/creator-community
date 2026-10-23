# _add_product12.py — wire Product 12 (ONE — 99 Thoughts) into index.html + _intro_smoke.cjs
import io, sys, os

BASE = os.path.dirname(os.path.abspath(__file__))


def edit(path, pairs):
    with io.open(path, 'r', encoding='utf-8', newline='') as f:
        raw = f.read()
    crlf = '\r\n' in raw
    text = raw.replace('\r\n', '\n') if crlf else raw
    for i, (old, new) in enumerate(pairs, 1):
        n = text.count(old)
        if n != 1:
            print('FAIL %s pair %d: count=%d (expected 1)' % (path, i, n))
            print('---- offending old text (first 300 chars) ----')
            print(old[:300])
            sys.exit(1)
        text = text.replace(old, new, 1)
    out = text.replace('\n', '\r\n') if crlf else text
    with io.open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(out)
    print('OK %s (%d edits applied)' % (path, len(pairs)))


# ---------------------------------------------------------------- index.html
TAB_OLD = """      <button class="section-tab" id="sec-product11">Product 11 // Clarity</button>
    </div>"""
TAB_NEW = """      <button class="section-tab" id="sec-product11">Product 11 // Clarity</button>
      <button class="section-tab" id="sec-product12">Product 12 // ONE 99 Thoughts</button>
    </div>"""

PANEL_OLD = """      <iframe id="clarity-frame" class="passage-frame" src="clarity-30-day-affirmations.html" title="Clarity / 30 — 30 Days of Affirmations" loading="lazy" allow="autoplay; fullscreen"></iframe>
    </section>
"""
PANEL_NEW = """      <iframe id="clarity-frame" class="passage-frame" src="clarity-30-day-affirmations.html" title="Clarity / 30 — 30 Days of Affirmations" loading="lazy" allow="autoplay; fullscreen"></iframe>
    </section>

    <!-- ============ SECTION 13 — PRODUCT 12: ONE — 99 THOUGHTS ============ -->
    <section id="thoughts-panel" class="glass-card rounded-2xl p-4 sm:p-6 relative overflow-hidden is-hidden">
      <div class="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <span class="text-[10px] font-mono tracking-widest uppercase text-gray-500">UGT // ONE — 99 Thoughts</span>
        <button class="p3-hud-btn" id="thoughts-fullscreen">Fullscreen ⛶</button>
      </div>
      <iframe id="thoughts-frame" class="passage-frame" src="ONE_99_Thoughts.html" title="ONE — 99 Thoughts" loading="lazy" allow="autoplay; fullscreen"></iframe>
    </section>
"""

MAP_OLD = "product11: 'clarity-panel' };"
MAP_NEW = "product11: 'clarity-panel', product12: 'thoughts-panel' };"

TOGGLE_OLD = """        document.getElementById('sec-product11').classList.toggle('active', name === 'product11');
        if (isP3) p3Render();"""
TOGGLE_NEW = """        document.getElementById('sec-product11').classList.toggle('active', name === 'product11');
        document.getElementById('sec-product12').classList.toggle('active', name === 'product12');
        if (isP3) p3Render();"""

LISTEN_OLD = """      // --- clarity fullscreen ---
      document.getElementById('clarity-fullscreen').addEventListener('click', () => {
        const fr = document.getElementById('clarity-frame');
        try {
          if (document.fullscreenElement) document.exitFullscreen();
          else if (fr.requestFullscreen) fr.requestFullscreen();
        } catch (e) {}
      });

      // 21 AI escape prompts (verbatim from Product 3)"""
LISTEN_NEW = """      // --- clarity fullscreen ---
      document.getElementById('clarity-fullscreen').addEventListener('click', () => {
        const fr = document.getElementById('clarity-frame');
        try {
          if (document.fullscreenElement) document.exitFullscreen();
          else if (fr.requestFullscreen) fr.requestFullscreen();
        } catch (e) {}
      });

      // --- Product 12 (ONE — 99 Thoughts) ---
      document.getElementById('sec-product12').addEventListener('click', () => window.switchSection('product12'));

      // --- thoughts fullscreen ---
      document.getElementById('thoughts-fullscreen').addEventListener('click', () => {
        const fr = document.getElementById('thoughts-frame');
        try {
          if (document.fullscreenElement) document.exitFullscreen();
          else if (fr.requestFullscreen) fr.requestFullscreen();
        } catch (e) {}
      });

      // 21 AI escape prompts (verbatim from Product 3)"""

# ------------------------------------------------------------ _intro_smoke.cjs
SMOKE_OLD = """  ok($('sec-protocol').classList.contains('active'), 'protocol tab active again');

  const scriptErrors = errors.filter(e => e.indexOf('Uncaught') > -1);"""
SMOKE_NEW = """  ok($('sec-protocol').classList.contains('active'), 'protocol tab active again');

  console.log('— section 13: Product 12 (ONE — 99 Thoughts) —');
  ok(!!$('thoughts-panel'), 'product12 panel exists');
  ok($('thoughts-panel').classList.contains('is-hidden'), 'product12 starts hidden');
  ok(!!$('sec-product12'), 'product12 tab exists');
  const thframe = $('thoughts-frame');
  ok(!!thframe && (thframe.getAttribute('src') || '') === 'ONE_99_Thoughts.html', 'iframe points at ONE_99_Thoughts.html');
  ok(require('fs').existsSync(require('path').join(__dirname, 'ONE_99_Thoughts.html')), 'ONE_99_Thoughts.html file exists in workspace');
  ok(!!$('thoughts-fullscreen'), 'product12 fullscreen button exists');

  $('sec-product12').click();
  await sleep(120);
  ok(!$('thoughts-panel').classList.contains('is-hidden'), 'switching to product12 reveals panel');
  ok($('app').classList.contains('is-hidden'), 'protocol app hidden while in product12');
  ok($('clarity-panel').classList.contains('is-hidden'), 'product11 hidden while product12 open');
  ok($('sec-product12').classList.contains('active'), 'product12 tab active');

  $('sec-protocol').click();
  await sleep(120);
  ok($('thoughts-panel').classList.contains('is-hidden'), 'product12 hidden after switching back');
  ok(!$('app').classList.contains('is-hidden'), 'protocol app visible again after product12');
  ok($('sec-protocol').classList.contains('active'), 'protocol tab active again');

  const scriptErrors = errors.filter(e => e.indexOf('Uncaught') > -1);"""

# idempotency guard — skip if already applied
with io.open(os.path.join(BASE, 'index.html'), 'r', encoding='utf-8', newline='') as f:
    if "product12: 'thoughts-panel'" in f.read():
        print('SKIP: product12 already wired into index.html')
        sys.exit(0)

edit(os.path.join(BASE, 'index.html'), [
    (TAB_OLD, TAB_NEW),
    (PANEL_OLD, PANEL_NEW),
    (MAP_OLD, MAP_NEW),
    (TOGGLE_OLD, TOGGLE_NEW),
    (LISTEN_OLD, LISTEN_NEW),
])

edit(os.path.join(BASE, '_intro_smoke.cjs'), [
    (SMOKE_OLD, SMOKE_NEW),
])

print('DONE')

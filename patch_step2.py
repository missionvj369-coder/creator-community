import io
import sys

with io.open('index.patched.html', 'r', encoding='utf-8', newline='') as f:
    html = f.read()

if html.count('  </script>') != 1:
    print('BAD anchor count:', html.count('  </script>'))
    sys.exit(1)

js = r'''
    // ============ UGT Sovereignty Vault ============

    const tools = [
      { num: "TOOL 01 / DAILY ENGINE", title: "21-Day Somatic Reset Engine", desc: "3-min daily multi-frequency audio-visual bio-reset.", target: 1 },
      { num: "TOOL 02 / CRISIS INTERRUPT", title: "30s Emergency Circuit Breaker", desc: "Single-tap acute buttons for Panic, Brain Fog, and Insomnia.", target: 0 },
      { num: "TOOL 03 / PHYSICAL RELEASE", title: "Somatic Pressure-Point Map", desc: "Targeted pressure points that release physical tension on demand.", target: 0 },
      { num: "TOOL 04 / COGNITIVE MIRROR", title: "Neural De-Clutter OS", desc: "Generate precise cognitive prompts to dissolve overthinking.", target: 3 },
      { num: "TOOL 05 / BACKGROUND ENGINE", title: "Circadian Focus Generator", desc: "Real-time binaural engine that syncs frequencies to phone clock.", target: 0 },
      { num: "TOOL 06 / PERSPECTIVE SHIFT", title: "Subconscious De-Conditioning Deck", desc: "60-second spatial audio/visual calibrations for mental clarity.", target: 0 },
      { num: "TOOL 07 / DEEP WORK", title: "Silent Distraction-Free Workspace", desc: "Minimalist text canvas with integrated sub-bass audio.", target: 0 },
      { num: "TOOL 08 / DIAGNOSTIC", title: "Biological State Self-Diagnostic", desc: "45-second test prescribing the exact frequency needed right now.", target: 0 },
      { num: "TOOL 09 / PHYSICAL HACKS", title: "Cognitive Micro-Protocol Cards", desc: "Interactive card deck for instant physical somatic hacks.", target: 0 },
      { num: "TOOL 10 / GLOBAL MOVEMENT", title: "UGT Movement Charter & Impact Hub", desc: "The collective sovereignty pledge and live impact tracker.", target: 0 }
    ];

    function buildVault() {
      const grid = document.getElementById("vaultGrid");
      grid.innerHTML = "";
      tools.forEach(function (t, i) {
        const card = document.createElement("div");
        card.className = "tool";
        card.innerHTML = '<div class="card-left"><div class="tool-num">' + t.num + '</div><div class="tool-title">' + t.title + '</div><div class="tool-desc">' + t.desc + '</div></div><div class="arrow">&rarr;</div>';
        card.onclick = function () { openTool(i); };
        grid.appendChild(card);
      });
    }

    function openTool(i) {
      const t = tools[i];
      if (t.target) {
        switchTab(t.target);
        const tabs = document.querySelectorAll(".tab");
        tabs.forEach(function (el, idx) { el.classList.toggle("active", idx === t.target - 1); });
      } else {
        document.getElementById("toolOverlayTitle").innerText = t.title;
        document.getElementById("toolOverlayDesc").innerText = t.desc + " - Standalone module: launch from the full UGT suite.";
        document.getElementById("toolOverlay").classList.add("active");
      }
    }

    buildVault();
'''

html = html.replace('  </script>', js + '\n  </script>')
with io.open('index.patched.html', 'w', encoding='utf-8', newline='') as f:
    f.write(html)
print('Wrote index.patched.html', len(html), 'chars')

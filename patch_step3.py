import io
import sys

with io.open('index.patched.html', 'r', encoding='utf-8', newline='') as f:
    html = f.read()

if html.count('  </script>') != 1:
    print('BAD anchor count:', html.count('  </script>'))
    sys.exit(1)

js = r'''
    // ============ Neural De-Clutter OS ============

    const prompts = {
      1: "You are a cognitive de-cluttering coach. I am overthinking a high-stakes decision. Interview me with one question at a time until you understand: (1) the decision itself, (2) which facts I know versus which scenarios I am imagining, (3) the worst realistic outcome and whether I could survive it, (4) what I would advise a friend in the same position. Then give me: a one-paragraph reality check, the decision stated in a single sentence, and the very next physical action I should take within 24 hours. Be blunt. No fluff.",
      2: "You are a direct, evidence-based confidence coach. I am stuck in imposter syndrome and self-doubt paralysis. Interview me one question at a time to extract: (1) concrete results I have actually produced, (2) skills people have explicitly paid me or praised me for, (3) problems I have solved that others could not, (4) the exact voice in my head and when it first appeared. Then write me: an evidence file of my real accomplishments, a counter-statement to the imposter voice, and a 60-second pre-performance ritual I can repeat before any high-stakes moment. Be blunt. No fluff.",
      3: "You are a somatic and cognitive anxiety technician. I am experiencing unexplained background anxiety with no obvious trigger. Interview me one question at a time to map: (1) where the anxiety lives in my body, (2) my last 24 hours of sleep, caffeine, screens and social input, (3) any unfinished obligation my subconscious may be holding, (4) the story I am telling myself about what this feeling means. Then give me: a one-sentence reframe that defuses the feeling, a 2-minute physiological reset protocol (breathing + movement), and a single concrete task that, once done, would silence the background loop. Be blunt. No fluff."
    };

    let activePrompt = "";

    function generatePrompt(n) {
      activePrompt = prompts[n] || "";
      document.getElementById("promptText").innerText = activePrompt;
      document.getElementById("promptBox").style.display = "block";
    }

    function copyPrompt() {
      if (!activePrompt) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(activePrompt);
      } else {
        const ta = document.createElement("textarea");
        ta.value = activePrompt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      const btn = document.querySelector("#promptBox button");
      const old = btn.innerText;
      btn.innerText = "COPIED";
      setTimeout(function () { btn.innerText = old; }, 1500);
    }
'''

html = html.replace('  </script>', js + '\n  </script>')
with io.open('index.html', 'w', encoding='utf-8', newline='') as f:
    f.write(html)
print('Wrote index.html', len(html), 'chars')

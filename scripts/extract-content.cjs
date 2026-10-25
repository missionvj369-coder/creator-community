// Extracts every data set out of the legacy HTML products into clean JSON.
const fs = require('fs'), path = require('path');
const SRC = process.argv[2] || '.';
const OUT = process.argv[3] || './public/content';
function sliceArr(t, re) {
  const m = re.exec(t); if (!m) throw new Error('no match ' + re);
  const i = m.index + m[0].length - 1; let d = 0, inS = null, esc = false, j = i;
  for (; j < t.length; j++) { const c = t[j];
    if (inS) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === inS) inS = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inS = c; continue; }
    if (c === '[') d++; if (c === ']') { d--; if (d === 0) break; } }
  return (0, eval)('(' + t.slice(i, j + 1) + ')');
}
const rd = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const out = {};
const idx = rd('index.html');
out.protocol = sliceArr(idx, /const protocol21 = \[/);
out.p3prompts = sliceArr(idx, /const P3_PROMPTS = \[/);
out.p3truths = sliceArr(idx, /const P3_TRUTHS = \[/);
out.awakening = sliceArr(idx, /const A4_DAYS = \[/);
out.onegod = sliceArr(idx, /const P5_MSGS = \[/);
out.introSteps = sliceArr(idx, /const INTRO_STEPS = \[/);
out.clarity = sliceArr(rd('clarity-30-day-affirmations.html'), /const data=\[/);
const one = rd('ONE_99_Thoughts.html');
out.oneThoughts = sliceArr(one, /const thoughts=\[/);
out.oneChapters = sliceArr(one, /const chapters=\[/);
try { out.oneBridges = sliceArr(one, /const bridges=\[/); } catch (e) {}
out.journey1 = sliceArr(rd('human-journey.html'), /const scenes = \[/);
out.journey2 = sliceArr(rd('human-journey-part2.html'), /const chapters = \[/);
out.journey3 = sliceArr(rd('human-journey-part3.html'), /const chapters = \[/);
out.rewire = sliceArr(rd('rewire-wallpaper-app.html'), /const EMBEDDED_DAYS=\[/);
out.loop = sliceArr(rd('the-loop-complete-app.html'), /const curriculum=\[/);
fs.mkdirSync(OUT, { recursive: true });
for (const [k, v] of Object.entries(out)) { fs.writeFileSync(path.join(OUT, k + '.json'), JSON.stringify(v)); console.log(k, v.length, JSON.stringify(Array.isArray(v[0]) ? v[0].map(x=>String(x).slice(0,40)) : Object.fromEntries(Object.entries(v[0]||{}).map(([a,b])=>[a, Array.isArray(b)? 'arr'+b.length : String(b).slice(0,40)]))).slice(0,700)); }

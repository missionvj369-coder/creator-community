// Aura: the living sky behind everything. Drifting stars that lean toward the current hue.
// Honors prefers-reduced-motion, pauses when hidden, adapts count to screen size.
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let canvas, ctx, W = 0, H = 0, DPR = 1, stars = [], hue = 220, targetHue = 220, raf = 0, t0 = performance.now(), energy = 0.5, targetEnergy = 0.5;

export function initAura() {
  canvas = document.getElementById('aura'); if (!canvas) return; ctx = canvas.getContext('2d');
  const resize = () => {
    DPR = Math.min(window.devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; canvas.width = W * DPR; canvas.height = H * DPR; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const n = Math.round(Math.min(150, Math.max(46, (W * H) / 11000))); stars = Array.from({ length: n }, () => spawn(true)); draw(0);
  };
  addEventListener('resize', resize); resize();
  document.addEventListener('visibilitychange', () => (document.hidden ? cancelAnimationFrame(raf) : loop()));
  reduce.addEventListener?.('change', () => (reduce.matches ? (cancelAnimationFrame(raf), draw(0)) : loop()));
  if (!reduce.matches) loop();
}
function spawn(anywhere) { return { x: Math.random() * W, y: anywhere ? Math.random() * H : H + 10, z: 0.25 + Math.random() * 0.9, tw: Math.random() * 6.28, hs: (Math.random() - 0.5) * 70 }; }
function loop() { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
function tick(now) { const dt = Math.min(0.05, (now - t0) / 1000); t0 = now; draw(dt); raf = requestAnimationFrame(tick); }
function draw(dt) {
  if (!ctx) return; hue += ((((targetHue - hue + 540) % 360) - 180) * Math.min(1, dt * 1.6)); energy += (targetEnergy - energy) * Math.min(1, dt * 2);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  // soft nebula glow that follows the hue
  const g = ctx.createRadialGradient(W * 0.5, H * 0.28, 0, W * 0.5, H * 0.28, Math.max(W, H) * 0.7);
  g.addColorStop(0, `hsla(${hue},80%,50%,${0.16 + energy * 0.08})`); g.addColorStop(1, `hsla(${hue},80%,50%,0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const speed = reduce.matches ? 0 : 5 + energy * 10;
  for (const s of stars) {
    s.y -= speed * s.z * dt; s.x += Math.sin(s.tw + s.y / 140) * 3 * dt; s.tw += dt * (0.6 + s.z);
    if (s.y < -10) Object.assign(s, spawn(false));
    const a = (0.25 + 0.55 * s.z) * (0.65 + 0.35 * Math.sin(s.tw * 2)); const r = 0.5 + s.z * 1.3;
    ctx.beginPath(); ctx.fillStyle = `hsla(${hue + s.hs},85%,${78 + s.z * 12}%,${a})`; ctx.arc(s.x, s.y, r, 0, 6.283); ctx.fill();
    if (s.z > 1) { ctx.fillStyle = `hsla(${hue + s.hs},90%,80%,${a * 0.18})`; ctx.beginPath(); ctx.arc(s.x, s.y, r * 4, 0, 6.283); ctx.fill(); }
  }
}
export const setAura = (h, e = 0.5) => { targetHue = ((h % 360) + 360) % 360; targetEnergy = e; document.documentElement.style.setProperty('--hue', Math.round(targetHue)); };

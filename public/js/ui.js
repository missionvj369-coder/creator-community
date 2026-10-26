// Tiny UI toolkit — no framework. Text is always inserted as text nodes (no XSS).
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') for (const [prop,value] of Object.entries(v)) { if (prop.startsWith('--')) el.style.setProperty(prop,value); else el.style[prop]=value; }
    else if (k === 'html') el.innerHTML = v; // only ever used with our own static SVG strings
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  const add = c => { if (c == null || c === false) return; if (Array.isArray(c)) return c.forEach(add); el.append(c instanceof Node ? c : document.createTextNode(String(c))); };
  kids.forEach(add); return el;
}
export const clear = el => { while (el.firstChild) el.removeChild(el.firstChild); return el; };
export const mount = (el, ...kids) => { clear(el); kids.flat(Infinity).forEach(k => k && el.append(k)); return el; };
export const svgEl = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

/* ───────── formatting ───────── */
export const pad = n => String(n).padStart(2, '0');
export const mmss = s => `${pad(Math.floor(s / 60))}:${pad(Math.floor(s % 60))}`;
export function countdown(ms) { const s = Math.max(0, Math.floor(ms / 1000)); const hh = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return hh ? `${hh}h ${pad(m)}m` : `${m}m ${pad(s % 60)}s`; }
export function greeting(hour) { return hour < 5 ? 'Still awake' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : 'Good night'; }
export const skyOf = hour => (hour >= 5 && hour < 8 ? 'dawn' : hour >= 8 && hour < 17 ? 'day' : hour >= 17 && hour < 20 ? 'dusk' : 'night');
export function prettyDate(key) { const [y, m, d] = key.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }); }
export const titleCase = s => s.toLowerCase().replace(/(^|[\s—-])([a-z])/g, (m, a, b) => a + b.toUpperCase()).replace(/\b(Of|The|And|In|To|A|An|For|On)\b(?!$)/g, w => w.toLowerCase()).replace(/^./, c => c.toUpperCase());
const PROPER = ['God', 'Allah', 'Jesus', 'Christ', 'Krishna', 'Buddha', 'Muhammad', 'Moses', 'Lord', 'Quran', 'Bible', 'Gita', 'Hindu', 'Muslim', 'Christian', 'Jew', 'Buddhist'];
export function sentenceCase(s) {
  let t = String(s).toLowerCase().replace(/(^|[.!?]\s+|\n)([a-z])/g, (m, a, b) => a + b.toUpperCase());
  t = t.replace(/\bi\b/g, 'I').replace(/\bi(?=['’](m|ll|ve|d)\b)/g, 'I');
  for (const p of PROPER) t = t.replace(new RegExp(`\\b${p.toLowerCase()}\\b`, 'g'), p);
  return t;
}
export const wordCount = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;

/* ───────── icons (inline, currentColor) ───────── */
const P = {
  upload:'<path d="M12 17V3M7 8l5-5 5 5M4 16v5h16v-5"/>',
  bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
  home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
  book:'<path d="M12 6c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V5c-3-1-7-1-10 1v15"/>',
  wallpaper:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="m7 16 4-5 3 3 3-4M10 5h4"/>',
  search:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  expand:'<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/>',
  external:'<path d="M14 3h7v7M21 3l-11 11M10 4H4v16h16v-6"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.5 10.5 7-4m-7 7 7 4"/>',
  today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  path: '<path d="M5 20c0-6 14-4 14-10S9 7 9 3"/><circle cx="5" cy="20" r="1.6"/><circle cx="9" cy="3.5" r="1.6"/>',
  realms: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="4.2" ry="10"/>',
  you: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 21c.8-4.6 4-6.6 7.5-6.6s6.7 2 7.5 6.6"/>',
  close: '<path d="M5 5l14 14M19 5 5 19"/>', check: '<path d="M4 12.5 9.5 18 20 6.5"/>', lock: '<rect x="5" y="11" width="14" height="9" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  shuffle: '<path d="M3 7h3.5c5 0 5 10 10 10H21M3 17h3.5c1.8 0 3-.9 3.9-2.2M21 7h-4.5c-1.8 0-3 .9-3.9 2.2"/><path d="m18.5 14.5 2.5 2.5-2.5 2.5M18.5 4.5 21 7l-2.5 2.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', back: '<path d="M19 12H5M11 6l-6 6 6 6"/>', play: '<path d="M7 4.5v15l12-7.5z"/>', pause: '<path d="M8 5v14M16 5v14"/>',
  sound: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>', mute: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
  flame: '<path d="M12 21c4 0 6.5-2.8 6.5-6.2 0-3.4-2.4-5-3.4-8.3-2 1.2-3.1 3-3.3 5-.9-.7-1.4-1.8-1.5-3C8.2 9.6 5.5 11.700 5.500 15 5.500 18.200 8 21 12 21z"/>',
  star: '<path d="m12 3 2.6 5.8 6.4.7-4.8 4.300 1.400 6.300L12 17l-5.600 3.100 1.400-6.300L3 9.500l6.400-.7z"/>', copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
  download: '<path d="M12 3v12M7 10.500l5 5 5-5M4 20h16"/>', moon: '<path d="M20 14.500A8.500 8.500 0 1 1 9.500 4 7 7 0 0 0 20 14.500z"/>', sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.500 2.500M15.500 15.500 18 18M18 6l-2.500 2.500M8.500 15.500 6 18"/>',
  headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.500" height="7" rx="1.800"/><rect x="16.500" y="14" width="4.500" height="7" rx="1.800"/>',
};
export const icon = (name, size = 22) => svgEl(`<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`);

/* ───────── toast ───────── */
let toastTimer;
export function toast(msg, ms = 2800) {
  let t = $('#toast'); if (!t) { t = h('div', { id: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.append(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ───────── sheet / dialog ───────── */
export function sheet(content, { onClose, label = 'Details' } = {}) {
  const prevFocus = document.activeElement;
  const back = h('div', { class: 'sheet-back' });
  const box = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': label }, h('button', { class: 'sheet-x', 'aria-label': 'Close', onclick: () => close() }, icon('close', 20)), h('div', { class: 'sheet-body' }, content));
  back.append(box); document.body.append(back); requestAnimationFrame(() => back.classList.add('open'));
  const key = e => { if (e.key === 'Escape') close(); };
  function close() { document.removeEventListener('keydown', key); back.classList.remove('open'); setTimeout(() => back.remove(), 220); prevFocus && prevFocus.focus && prevFocus.focus(); onClose && onClose(); }
  back.addEventListener('click', e => { if (e.target === back) close(); }); document.addEventListener('keydown', key);
  setTimeout(() => (box.querySelector('[autofocus]') || box.querySelector('button, a, input, textarea'))?.focus(), 60);
  return { close, el: box };
}

/* ───────── generative emblems (every realm & unit gets its own glyph) ───────── */
const FAMILY = {
  rings: ['cosmos', 'galaxy', 'mind', 'identity', 'reflection', 'mirror', 'threshold', 'protocol', 'clarity'],
  orbit: ['stars', 'planet', 'observatory', 'ai', 'womb', 'birth', 'return', 'passage', 'mirror2'],
  wave: ['ocean', 'microbes', 'play', 'connection', 'community', 'care', 'loss', 'sleep', 'frequency'],
  branch: ['tree', 'ancestors', 'agriculture', 'learning', 'legacy', 'aging', 'child', 'awakening', 'thoughts', 'sanctuary'],
  spiral: ['hominin', 'migration', 'fire', 'departure', 'work', 'baby', 'future', 'onegod', 'rewire', 'journey'],
  grid: ['city', 'industry', 'borders', 'temple', 'responsibility', 'death', 'escape', 'loop', 'earth'],
};
function famOf(key) { for (const [f, l] of Object.entries(FAMILY)) if (l.includes(key)) return f; let s = 0; for (const c of String(key)) s += c.charCodeAt(0); return Object.keys(FAMILY)[s % 6]; }
function prng(seed) { let a = 0; for (const c of String(seed)) a = (Math.imul(a, 31) + c.charCodeAt(0)) | 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function emblemSVG(motif, hue, seed = motif, size = 120, bg = true) {
  const R = prng(seed + motif); const fam = famOf(motif); const c = (l, a = 1, dh = 0) => `hsla(${(hue + dh + 360) % 360},80%,${l}%,${a})`;
  let g = '';
  if (bg) g += `<defs><radialGradient id="g${hue}${size}" cx="50%" cy="45%" r="65%"><stop offset="0" stop-color="${c(32, 0.75)}"/><stop offset="1" stop-color="${c(9, 0.0)}"/></radialGradient></defs><circle cx="60" cy="60" r="58" fill="url(#g${hue}${size})"/>`;
  if (fam === 'rings') { for (let i = 0; i < 5; i++) g += `<circle cx="60" cy="60" r="${10 + i * 9 + R() * 3}" fill="none" stroke="${c(70 - i * 6, 0.85 - i * 0.12, i * 6)}" stroke-width="${1.2 + R()}" stroke-dasharray="${R() < 0.5 ? '0' : `${2 + R() * 8} ${3 + R() * 6}`}"/>`; g += `<circle cx="60" cy="60" r="4" fill="${c(85)}"/>`; }
  else if (fam === 'orbit') { for (let i = 0; i < 3; i++) { const rot = i * 60 + R() * 20; g += `<ellipse cx="60" cy="60" rx="46" ry="${14 + i * 5}" transform="rotate(${rot} 60 60)" fill="none" stroke="${c(66, 0.55, i * 8)}" stroke-width="1.2"/>`; const a = R() * 6.28; g += `<circle cx="${60 + Math.cos(a) * 46}" cy="${60 + Math.sin(a) * (14 + i * 5)}" r="3" transform="rotate(${rot} 60 60)" fill="${c(86)}"/>`; } g += `<circle cx="60" cy="60" r="7" fill="${c(78)}"/>`; }
  else if (fam === 'wave') { for (let i = 0; i < 6; i++) { const y = 26 + i * 13; const a = 6 + R() * 8; const ph = R() * 6; let d = `M 10 ${y}`; for (let x = 10; x <= 110; x += 4) d += ` L ${x} ${y + Math.sin(x / 11 + ph) * a * (1 - i * 0.08)}`; g += `<path d="${d}" fill="none" stroke="${c(72 - i * 4, 0.9 - i * 0.1, i * 7)}" stroke-width="1.5" stroke-linecap="round"/>`; } }
  else if (fam === 'branch') { const grow = (x, y, ang, len, depth) => { if (depth > 5 || len < 4) return ''; const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len; let s = `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${c(78 - depth * 5, 0.95 - depth * 0.1, depth * 5)}" stroke-width="${Math.max(0.6, 2.6 - depth * 0.45)}" stroke-linecap="round"/>`; if (depth >= 4) s += `<circle cx="${x2}" cy="${y2}" r="1.8" fill="${c(86)}"/>`; const sp = 0.42 + R() * 0.3; return s + grow(x2, y2, ang - sp, len * (0.7 + R() * 0.08), depth + 1) + grow(x2, y2, ang + sp, len * (0.7 + R() * 0.08), depth + 1); }; g += grow(60, 108, -Math.PI / 2, 24, 0); }
  else if (fam === 'spiral') { let d = ''; for (let t = 0; t < 22; t += 0.25) { const r = 3 + t * 2.4, a = t + R() * 0.02; d += `${t ? 'L' : 'M'} ${60 + Math.cos(a) * r} ${60 + Math.sin(a) * r} `; } g += `<path d="${d}" fill="none" stroke="${c(74, 0.9)}" stroke-width="1.8" stroke-linecap="round"/>`; for (let i = 0; i < 9; i++) { const t = 3 + i * 2.3, r = 3 + t * 2.4; g += `<circle cx="${60 + Math.cos(t) * r}" cy="${60 + Math.sin(t) * r}" r="${1.2 + R() * 2}" fill="${c(86, 0.9, i * 5)}"/>`; } }
  else { const n = 5; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const on = R() < 0.62; const x = 22 + i * 19, y = 22 + j * 19; g += on ? `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" rx="2.5" fill="${c(56 + R() * 26, 0.85, (i + j) * 4)}"/>` : `<circle cx="${x}" cy="${y}" r="1.6" fill="${c(70, 0.6)}"/>`; } }
  return `<svg class="emblem" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-hidden="true">${g}</svg>`;
}
export const emblem = (motif, hue, seed, size, bg) => svgEl(emblemSVG(motif, hue, seed, size, bg));

/** Rewire's daily wallpaper — generated, downloadable, always works (no image files needed). */
export function wallpaperSVG(unit, w = 1080, hgt = 2340) {
  const hue = unit.hue; const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wrap = (txt, n) => { const out = []; let line = ''; for (const wd of String(txt).split(' ')) { if ((line + ' ' + wd).trim().length > n) { out.push(line.trim()); line = wd; } else line += ' ' + wd; } if (line.trim()) out.push(line.trim()); return out; };
  const lines = wrap(unit.lead, 20);
  const em = emblemSVG(unit.motif, hue, unit.title, 600, false).replace(/<svg[^>]*>|<\/svg>/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${hgt}" viewBox="0 0 ${w} ${hgt}"><defs><linearGradient id="b" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="hsl(${hue},55%,16%)"/><stop offset="0.6" stop-color="hsl(${(hue + 40) % 360},50%,9%)"/><stop offset="1" stop-color="hsl(${(hue + 80) % 360},60%,5%)"/></linearGradient><radialGradient id="r" cx="50%" cy="34%" r="55%"><stop offset="0" stop-color="hsl(${hue},85%,45%)" stop-opacity="0.45"/><stop offset="1" stop-color="hsl(${hue},85%,45%)" stop-opacity="0"/></radialGradient></defs><rect width="${w}" height="${hgt}" fill="url(#b)"/><rect width="${w}" height="${hgt}" fill="url(#r)"/><svg x="${w / 2 - 330}" y="430" width="660" height="660" viewBox="0 0 120 120">${em}</svg><text x="${w / 2}" y="1290" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="30" letter-spacing="9" fill="hsl(${hue},70%,80%)" opacity="0.85">${esc(String(unit.category || '').toUpperCase())}</text>${lines.map((l, i) => `<text x="${w / 2}" y="${1420 + i * 92}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="78" fill="#f6f1ea">${esc(l)}</text>`).join('')}<text x="${w / 2}" y="${hgt - 150}" text-anchor="middle" font-family="Georgia, serif" font-size="28" letter-spacing="8" fill="#f6f1ea" opacity="0.4">UGT PATH</text></svg>`;
}
export async function downloadWallpaper(unit, name) {
  const href=`/wallpapers/human-within-${String(unit.idx+1).padStart(2,'0')}.png`;
  const a = h('a', { href, download: name || `human-within-day-${unit.idx+1}.png` }); document.body.append(a); a.click(); a.remove();
}

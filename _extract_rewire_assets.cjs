// _extract_rewire_assets.cjs
// Extracts embedded base64 images from rewire-wallpaper-app.html into real files
// under assets/rewire/ and rewrites EMBEDDED_DAYS to reference them by relative path.
// Rationale: the original file inlines ~34MB of base64 (30 JPEGs x2 + 30 WebP thumbs),
// forcing the browser to download/parse all of it before render. image === download for
// every day, so we store one JPEG per day and point both fields at it.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const htmlPath = path.join(ROOT, 'rewire-wallpaper-app.html');
const outDir = path.join(ROOT, 'assets', 'rewire');
const urlPrefix = 'assets/rewire/';

fs.mkdirSync(outDir, { recursive: true });

let src = fs.readFileSync(htmlPath, 'utf8');

// Safety guard: only run on the pristine embedded version. If the images have already
// been extracted (no data: URIs remain), re-running would decode path strings as base64
// and overwrite the real asset files with garbage. Refuse instead.
if (!src.includes('data:image')) {
  throw new Error('rewire-wallpaper-app.html already has extracted assets (no data: URIs found). Restore the embedded original before re-running.');
}

// Grab the array literal (starts with [ and ends with ] before the trailing ;)
const startMarker = 'const EMBEDDED_DAYS=';
const startIdx = src.indexOf(startMarker);
if (startIdx < 0) throw new Error('EMBEDDED_DAYS not found');
const arrStart = startIdx + startMarker.length;
if (src[arrStart] !== '[') throw new Error('EMBEDDED_DAYS is not an array');
// Find the closing bracket for the array (the array is terminated by ]; on line 11)
const endMarker = src.indexOf('];', arrStart);
const arrText = src.slice(arrStart, endMarker + 1);

const arr = JSON.parse(arrText);
if (arr.length !== 30) throw new Error('Expected 30 days, got ' + arr.length);

function decode(dataUri) {
  const comma = dataUri.indexOf(',');
  const meta = dataUri.slice(0, comma);      // data:image/jpeg;base64
  const b64 = dataUri.slice(comma + 1);
  const mime = meta.slice(5).split(';')[0];  // image/jpeg
  const ext = mime === 'image/webp' ? 'webp' : mime === 'image/png' ? 'png' : 'jpg';
  return { buf: Buffer.from(b64, 'base64'), ext };
}

let jpgBytes = 0, webpBytes = 0;
const rewritten = arr.map(d => {
  const day = String(d.day).padStart(2, '0');

  // Full-size JPEG (used by both image and download — identical bytes)
  const jpg = decode(d.image);
  const jpgName = `day-${day}.${jpg.ext}`;
  fs.writeFileSync(path.join(outDir, jpgName), jpg.buf);
  jpgBytes += jpg.buf.length;

  // Thumbnail WebP
  const th = decode(d.thumbnail);
  const thName = `day-${day}-thumb.${th.ext}`;
  fs.writeFileSync(path.join(outDir, thName), th.buf);
  webpBytes += th.buf.length;

  return {
    day: d.day,
    title: d.title,
    cue: d.cue,
    category: d.category,
    explanation: d.explanation,
    action: d.action,
    image: urlPrefix + jpgName,
    download: urlPrefix + jpgName,
    thumbnail: urlPrefix + thName
  };
});

// Rebuild the line with relative paths (compact JSON — now tiny).
// endMarker points at the array's closing ']' (from the '];' terminator), so we must
// skip that original ']' when splicing in newArrText (which already ends with ']').
const newArrText = JSON.stringify(rewritten);
src = src.slice(0, arrStart) + newArrText + src.slice(endMarker + 1);

// Add native lazy loading to the main wallpaper <img> in the "today" view.
// It is rendered once per view; lazy lets offscreen/collection images defer while the
// primary visible image still loads immediately when in the viewport.
src = src.replace(
  '<img class="wallpaper-full" src="${d.image}" alt="${d.title} wallpaper: ${d.cue}">',
  '<img class="wallpaper-full" src="${d.image}" alt="${d.title} wallpaper: ${d.cue}" loading="lazy" decoding="async">'
);
// Modal preview + save-panel images are user-triggered; make them async-decode too.
src = src.replace(
  '<img class="modal-image" src="${d.image}" alt="${d.title}">',
  '<img class="modal-image" src="${d.image}" alt="${d.title}" decoding="async">'
);
src = src.replace(
  '<img id="saveImage" class="modal-image" src="${d.download}" alt="${d.title}">',
  '<img id="saveImage" class="modal-image" src="${d.download}" alt="${d.title}" decoding="async">'
);

fs.writeFileSync(htmlPath, src);

const newSize = Buffer.byteLength(src);
console.log('Extracted 30 JPEGs (' + (jpgBytes / 1024 / 1024).toFixed(1) + ' MB) + 30 WebP thumbs (' + (webpBytes / 1024).toFixed(0) + ' KB)');
console.log('assets written to: ' + outDir);
console.log('rewire-wallpaper-app.html now: ' + (newSize / 1024).toFixed(1) + ' KB (was ~34 MB)');

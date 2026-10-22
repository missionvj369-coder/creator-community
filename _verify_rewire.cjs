const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const s = fs.readFileSync(path.join(ROOT, 'rewire-wallpaper-app.html'), 'utf8');
const m = s.match(/const EMBEDDED_DAYS=(\[[\s\S]*?\]);/);
const arr = JSON.parse(m[1]);
console.log('days parsed:', arr.length);
console.log('day1.image   :', arr[0].image);
console.log('day1.download:', arr[0].download);
console.log('day1.thumbnail:', arr[0].thumbnail);
console.log('any data:image left in file?', s.includes('data:image'));
console.log('loading="lazy" present?', s.includes('loading="lazy"'));
console.log('decoding="async" present?', s.includes('decoding="async"'));
console.log('file size KB:', (Buffer.byteLength(s) / 1024).toFixed(1));
// Verify every referenced asset exists on disk
let missing = 0;
arr.forEach(d => {
  ['image', 'download', 'thumbnail'].forEach(k => {
    if (!fs.existsSync(path.join(ROOT, d[k]))) { missing++; console.log('MISSING:', d[k]); }
  });
});
console.log('missing asset files:', missing);

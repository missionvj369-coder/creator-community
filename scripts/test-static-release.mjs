import assert from 'node:assert/strict';
import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const walk=(dir,prefix='')=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name),prefix+e.name+'/'):[prefix+e.name]);
const files=walk('dist'),modules=new Set(files.filter(f=>f.startsWith('js/')&&f.endsWith('.js'))),{version}=JSON.parse(readFileSync('dist/release.json'));
assert.match(version,/^[a-f0-9]{16}$/);assert.ok(!files.some(f=>/^qa-.*\.html$/.test(f)));
const index=readFileSync('dist/index.html','utf8');assert.ok(index.includes(`/js/main.js?v=${version}`));assert.ok(index.includes(`/css/studios.css?v=${version}`));assert.ok(index.includes(`/css/discovery.css?v=${version}`));
let imports=0;
for(const file of modules){const source=readFileSync(path.join('dist',file),'utf8');execFileSync('node',['--check',path.join('dist',file)]);const matches=[...source.matchAll(/\b(?:import|export)\s+(?:[^'";]*?\s+from\s*)?['"]([^'"]+)['"]/g),...source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]/g)];for(const m of matches){const [name,query='']=m[1].split('?'),target=name.startsWith('/')?name.slice(1):path.posix.normalize(path.posix.join(path.posix.dirname(file),name));if(modules.has(target)){assert.equal(new URLSearchParams(query).get('v'),version,`${file}: cached application import ${m[1]}`);imports++;}}}
assert.ok(imports>100);for(const file of files.filter(f=>f.startsWith('books/'))){assert.deepEqual(readFileSync(path.join('dist',file)),readFileSync(path.join('public',file)),`Original ebook changed: ${file}`);}
assert.ok(existsSync('dist/js/views/studios.js'));for(const file of ['discovery-meta.js','discovery-model.js','discovery-canvas.js','discovery-stage.js','discovery-video.js','views/discovery.js','views/discovery-shelf.js'])assert.ok(existsSync('dist/js/'+file));console.log(`release: versioned entry, styles and ${imports} app imports, valid JS, unchanged original ebooks and no QA pages passed`);

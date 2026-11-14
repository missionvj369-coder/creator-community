import {cpSync,mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
const walk=(dir,prefix='')=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name),prefix+e.name+'/'):[prefix+e.name]);
const files=walk('public').filter(f=>!/^qa-.*\.html$/.test(f)),modules=new Set(files.filter(f=>f.startsWith('js/')&&f.endsWith('.js'))),styles=new Set(files.filter(f=>f.startsWith('css/')&&f.endsWith('.css')));
const hash=createHash('sha256');for(const file of [...files].sort())if(/\.(?:html|js|css)$/.test(file)){hash.update(file);hash.update(readFileSync(path.join('public',file)));}
const version=hash.digest('hex').slice(0,16);
mkdirSync('dist',{recursive:true});cpSync('public','dist',{recursive:true,filter:src=>!/^qa-.*\.html$/.test(path.basename(src))});
function versioned(spec,file){const [name,query='']=spec.split('?'),target=name.startsWith('/')?name.slice(1):path.posix.normalize(path.posix.join(path.posix.dirname(file),name));if(!modules.has(target)&&!styles.has(target))return spec;const params=new URLSearchParams(query);params.set('v',version);return name+'?'+params;}
for(const file of modules){let source=readFileSync(path.join('dist',file),'utf8');source=source.replace(/(\b(?:import|export)\s+(?:[^'";]*?\s+from\s*)?)(['"])([^'"]+)\2/g,(all,p,q,spec)=>p+q+versioned(spec,file)+q).replace(/(\bimport\s*\(\s*)(['"])([^'"]+)\2/g,(all,p,q,spec)=>p+q+versioned(spec,file)+q);writeFileSync(path.join('dist',file),source);}
// Keep original ebook bytes intact; their exact contents are used by offline packs.
for(const file of files.filter(f=>f==='index.html'||/^(?:realms|tools)\/.*\.html$/.test(f))){let source=readFileSync(path.join('dist',file),'utf8');source=source.replace(/((?:src|href)=)(['"])(\/(?:js|css)\/[^'"?#]+\.(?:js|css))\2/g,(all,p,q,spec)=>p+q+versioned(spec,file)+q);if(file==='index.html')source=source.replace('</head>',`<meta name="app-version" content="${version}">\n</head>`);writeFileSync(path.join('dist',file),source);}
writeFileSync('dist/release.json',JSON.stringify({version}));
console.log(`Static app prepared · asset version ${version}.`);

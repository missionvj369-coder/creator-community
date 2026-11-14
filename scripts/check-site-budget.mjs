import {readdirSync,statSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
let total=0,count=0,largest=0;
function scan(folder){for(const name of readdirSync(folder)){const file=path.join(folder,name),s=statSync(file);if(s.isDirectory())scan(file);else{total+=s.size;count++;largest=Math.max(largest,s.size);assert.ok(s.size<25*1024*1024,`Asset exceeds file budget: ${file}`);}}}
scan('dist');assert.ok(total<255*1024*1024,'Static assets exceed the expanded hosting budget');
console.log(`Hosting budget: ${count} files, ${(total/1048576).toFixed(2)} MiB expanded, largest ${(largest/1048576).toFixed(2)} MiB.`);

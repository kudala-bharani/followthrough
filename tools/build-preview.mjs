// Optional one-file convenience preview; the canonical app runs with node server.mjs.
import {readFile,writeFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
let html=await read('index.html');
const css=await read('styles.css');
const code=(await Promise.all(['src/model.mjs','src/storage.mjs','src/app.mjs'].map(read))).map(source=>source.replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
html=html.replace('<link rel="stylesheet" href="./styles.css">',`<style>${css}</style>`).replace('<script type="module" src="./src/app.mjs"></script>','').replace('href="./"','href="#main"').replace('</body>',`<script>${code.replaceAll('</script','<\\/script')}</script></body>`);
await writeFile(new URL('../FollowThrough-preview.html',import.meta.url),html);
console.log('Built FollowThrough-preview.html; file:// storage behavior depends on browser.');

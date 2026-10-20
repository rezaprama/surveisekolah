import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { gzipSync } from 'node:zlib';
const root=resolve('dist');
const headerText=await readFile(resolve(root,'_headers'),'utf8');
const commonHeaders=Object.fromEntries(headerText.split('/assets/')[0].split('\n').filter(l=>l.startsWith('  ')).map(l=>{const colon=l.indexOf(':');return [l.slice(0,colon).trim(),l.slice(colon+1).trim()];}));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.avif':'image/avif','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.xml':'application/xml','.json':'application/json','.md':'text/markdown; charset=utf-8'};
http.createServer(async(req,res)=>{
  try {
    let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let target=resolve(root,'.'+path);
    if(target!==root&&!target.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    let code=200;
    try {if((await stat(target)).isDirectory())target=resolve(target,'index.html');await stat(target);}
    catch {target=resolve(root,'404.html');code=404;}
    const source=await readFile(target);
    const compress=/\.(html|js|css|svg|xml|json|md|txt)$/.test(target)&&req.headers['accept-encoding']?.includes('gzip');
    const data=compress?gzipSync(source):source;
    res.writeHead(code,{...commonHeaders,'Content-Type':mime[extname(target)]||'application/octet-stream','Content-Length':data.length,...compress?{'Content-Encoding':'gzip','Vary':'Accept-Encoding'}:{},'Cache-Control':path.startsWith('/assets/')?'public, max-age=31536000':'no-cache'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch {res.writeHead(400);res.end('Bad request');}
}).listen(Number(process.env.PORT||8787),'127.0.0.1',()=>console.log('Preview ready: http://127.0.0.1:8787'));

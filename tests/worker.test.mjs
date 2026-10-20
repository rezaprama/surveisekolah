import test from 'node:test';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import worker,{acceptsGzip} from '../src/worker.js';

test('gzip negotiation respects explicit support and q=0',()=>{
  for(const h of ['gzip','br, gzip, deflate','GZip; q=0.5'])assert.equal(acceptsGzip(h),true);
  for(const h of [null,'br','gzip;q=0','*','gzip;q=invalid'])assert.equal(acceptsGzip(h),false);
});
test('HTML compression preserves bytes, privacy, CSP, and cache negotiation',async()=>{
  const html='<!doctype html><html lang="id"><p>Belajar dengan aman.</p></html>'.repeat(50);
  const env={ASSETS:{fetch:async()=>new Response(html,{headers:{'Content-Type':'text/html','Content-Length':String(Buffer.byteLength(html)),'Cache-Control':'public, no-transform','Content-Security-Policy':"default-src 'self'",'ETag':'"abc"','Vary':'Accept-Language'}})}};
  const response=await worker.fetch(new Request('https://example.invalid/',{headers:{'Accept-Encoding':'gzip, br'}}),env);
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.equal(gunzipSync(bytes).toString(),html);assert.ok(bytes.length<Buffer.byteLength(html)/2);
  assert.equal(response.headers.get('Content-Encoding'),'gzip');assert.equal(response.headers.get('Content-Length'),null);
  assert.equal(response.headers.get('Cache-Control'),'public, no-transform');assert.equal(response.headers.get('Content-Security-Policy'),"default-src 'self'");
  assert.equal(response.headers.get('Vary'),'Accept-Language, Accept-Encoding');assert.equal(response.headers.get('ETag'),'W/"abc"');
});
test('identity, existing encodings, non-HTML, and error responses pass through',async()=>{
  for(const [encoding,status,type,existing] of [['br',200,'text/html',null],['gzip',200,'image/svg+xml',null],['gzip',404,'text/html',null],['gzip',200,'text/html','br']]) {
    const original=new Response('body',{status,headers:{'Content-Type':type,...existing?{'Content-Encoding':existing}:{}}});
    const response=await worker.fetch(new Request('https://example.invalid/',{headers:{'Accept-Encoding':encoding}}),{ASSETS:{fetch:async()=>original}});
    assert.equal(response,original);
  }
});

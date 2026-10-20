import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const hash=s=>`'sha256-${createHash('sha256').update(s).digest('base64')}'`;
test('deployed CSP permits every inline stylesheet and data script',async()=>{
  const headers=await readFile('dist/_headers','utf8');
  const policy=headers.match(/Content-Security-Policy: (.+)/)[1];
  const directives=Object.fromEntries(policy.split(';').map(d=>{const [key,...values]=d.trim().split(/\s+/);return [key,values];}));
  assert.ok(directives['default-src'].includes("'self'"));
  assert.ok(directives['object-src'].includes("'none'"));
  assert.ok(headers.includes('no-transform'));
  for(const path of ['dist/index.html','dist/en/index.html']) {
    const html=await readFile(path,'utf8');
    for(const m of html.matchAll(/<style>([\s\S]*?)<\/style>/g)) assert.ok(directives['style-src'].includes(hash(m[1])),`Blocked inline CSS in ${path}`);
    for(const m of html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)) assert.ok(directives['script-src'].includes(hash(m[1])),`Blocked inline data in ${path}`);
    assert.equal((html.match(/class="question"/g)||[]).length,36);
    assert.ok(html.includes('hreflang="id"')&&html.includes('hreflang="en"'));
  }
});

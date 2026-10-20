// Static HTML stays unchanged. Compression keeps no-transform privacy protection
// without transferring uncompressed pages. Images and other assets bypass this handler.
export function acceptsGzip(header) {
  return (header || '').split(',').some(part => {
    const [encoding, ...params] = part.trim().toLowerCase().split(';');
    const quality = params.find(p => p.trim().startsWith('q='));
    return encoding === 'gzip' && (!quality || Number(quality.trim().slice(2)) > 0);
  });
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (!['GET','HEAD'].includes(request.method) || response.status !== 200 ||
        !response.headers.get('content-type')?.includes('text/html') ||
        response.headers.has('content-encoding') || !acceptsGzip(request.headers.get('accept-encoding'))) return response;

    const headers = new Headers(response.headers);
    headers.set('Content-Encoding','gzip');
    headers.delete('Content-Length');
    const vary = (headers.get('Vary') || '').split(',').map(s=>s.trim()).filter(Boolean);
    if (!vary.some(s=>s.toLowerCase()==='accept-encoding')) vary.push('Accept-Encoding');
    headers.set('Vary',vary.join(', '));
    const etag=headers.get('ETag');
    if(etag&&!etag.startsWith('W/'))headers.set('ETag',`W/${etag}`);
    const body=request.method==='HEAD'||!response.body?null:response.body.pipeThrough(new CompressionStream('gzip'));
    return new Response(body,{status:response.status,statusText:response.statusText,headers,encodeBody:'manual'});
  },
};

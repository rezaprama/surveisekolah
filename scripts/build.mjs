import { mkdir, readFile, writeFile, copyFile, readdir, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { transform, build } from 'esbuild';
import sharp from 'sharp';
import { questions, categories } from '../src/questions.mjs';
import { copy, references } from '../src/copy.mjs';

const site = 'https://surveisekolah.rezaprama.com';
const repo = 'https://github.com/rezaprama/surveisekolah';
const out = new URL('../dist/', import.meta.url);
const root = new URL('../', import.meta.url);
await mkdir(new URL('assets/', out), { recursive: true });
await mkdir(new URL('en/', out), { recursive: true });
await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
for (const name of await readdir(new URL('assets/', out))) {
  if (/^(app|style)\.[a-f0-9]+\.(js|css)$/.test(name) || ['dm-sans.woff2','LICENSE-DM-Sans.txt'].includes(name)) await unlink(new URL(`assets/${name}`, out));
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = s => JSON.stringify(s).replace(/</g, '\\u003c');
const hash = s => createHash('sha256').update(s).digest('hex').slice(0, 10);
const cspHash = s => `'sha256-${createHash('sha256').update(s).digest('base64')}'`;
const style = await transform(await readFile(new URL('src/style.css', root), 'utf8'), { loader: 'css', minify: true });
const bundled = await build({ entryPoints: [fileURLToPath(new URL('src/app.js', root))], bundle:true, write:false, minify:true, target:'es2022' });
const script = { code: bundled.outputFiles[0].text };
const cssName = `style.${hash(style.code)}.css`;
const jsName = `app.${hash(script.code)}.js`;
await writeFile(new URL(`assets/${cssName}`, out), style.code);
await writeFile(new URL(`assets/${jsName}`, out), script.code);
await copyFile(new URL('node_modules/@phosphor-icons/core/LICENSE', root), new URL('assets/LICENSE-Phosphor.txt', out));
const icons = {};
const names = ['book-open','arrow-right','arrow-up-right','check','shield-check','chalkboard-teacher','sun','users','wallet','moon','magnifying-glass','plus','printer','download-simple','upload-simple','star','x','clipboard-text','chat-circle-text','scales','lock-simple','github-logo','caret-right'];
for (const name of names) {
  const raw = await readFile(new URL(`node_modules/@phosphor-icons/core/assets/regular/${name}.svg`, root), 'utf8');
  icons[name] = raw.replace(/<svg[^>]*>/, '<svg class="icon" viewBox="0 0 256 256" aria-hidden="true" focusable="false">').replace(/<title>.*?<\/title>/s, '');
}
const icon = n => icons[n];
await writeFile(new URL('assets/favicon.svg', out), (await readFile(new URL('node_modules/@phosphor-icons/core/assets/regular/book-open.svg', root), 'utf8')).replace('<svg ', '<svg style="color:#275a43" '));
// Compressed generated assets are tracked. Original generation files stay outside the deploy output.
for (const name of ['kelas','koridor','catatan']) {
  const source = new URL(`assets/original/${name}.png`, root);
  try {
    for (const width of name === 'kelas' ? [400, 640, 800, 1100] : [700]) {
      const target = `assets/${name}-${width}.webp`;
      await sharp(fileURLToPath(source)).resize({ width, withoutEnlargement: true }).webp({ quality: 78, effort: 6 }).toFile(fileURLToPath(new URL(target, root)));
      if(name === 'kelas') await sharp(fileURLToPath(source)).resize({width,withoutEnlargement:true}).avif({quality:38,effort:5}).toFile(fileURLToPath(new URL(`assets/${name}-${width}.avif`,root)));
    }
  } catch (e) {
    if (e.code !== 'ENOENT' && !e.message.includes('Input file is missing')) throw e;
  }
}
for (const n of (await readdir(new URL('assets/', root))).filter(n => /\.(webp|avif)$/.test(n))) {
  await copyFile(new URL(`assets/${n}`, root), new URL(`assets/${n}`, out));
}
const og = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#eef2eb"/><rect x="70" y="80" width="70" height="12" rx="6" fill="#275a43"/><text x="70" y="155" font-family="Arial,sans-serif" font-size="30" fill="#275a43">Survei Sekolah</text><text x="70" y="280" font-family="Arial,sans-serif" font-weight="bold" font-size="64" fill="#203c32">Sekolah yang pas,</text><text x="70" y="360" font-family="Arial,sans-serif" font-weight="bold" font-size="64" fill="#203c32">dimulai dari bertanya.</text><text x="70" y="480" font-family="Arial,sans-serif" font-size="27" fill="#53665c">36 pertanyaan untuk kunjungan sekolah di Indonesia</text><text x="70" y="560" font-family="Arial,sans-serif" font-size="24" fill="#53665c">surveisekolah.rezaprama.com</text></svg>`;
await sharp(Buffer.from(og)).png().toFile(fileURLToPath(new URL('assets/og.png', out)));
const inlineHashes = [];

for (const lang of ['id','en']) {
  const t = copy[lang];
  const key = lang === 'id' ? 'idText' : 'enText';
  const catName = cat => categories.find(c => c.id === cat)[key];
  const path = lang === 'id' ? '' : 'en/';
  const docsPath = lang === 'id' ? 'docs/pertanyaan.md' : 'docs/questions.md';
  const config = json({ lang, t, categories: categories.map(c => ({ id: c.id, name: c[key] })) });
  const schema = json({ '@context':'https://schema.org', '@graph': [
    { '@type':'WebSite', '@id':`${site}/#site`, name:'Survei Sekolah', url:`${site}/`, inLanguage:['id','en'] },
    { '@type':'CollectionPage', '@id':`${site}/${path}#page`, url:`${site}/${path}`, name:t.title, description:t.description, inLanguage:lang, isPartOf:{'@id':`${site}/#site`}, author:{'@type':'Person',name:'Reza Prama',url:'https://rezaprama.com'}, dateModified:'2026-10-20', mainEntity:{'@type':'ItemList',numberOfItems:36,itemListElement:questions.map((q,i)=>({'@type':'ListItem',position:i+1,name:q[key].question,url:`${site}/${path}#${q.id}`}))} },
  ] });
  inlineHashes.push(cspHash(config), cspHash(schema));
  const questionHtml = questions.map(q => {
    const text = q[key];
    return `<details class="question" id="${q.id}" data-category="${q.category}" data-core="${q.essential}" data-status="unasked">
      <summary><div><div class="q-meta"><span>${esc(catName(q.category))}</span>${q.essential ? `<span class="core">${t.core}</span>` : ''}</div><h3>${esc(text.question)}</h3></div></summary>
      <div class="q-body"><h4>${t.why}</h4><p>${esc(text.why)}</p><h4>${t.evidence}</h4><p>${esc(text.evidence)}</p>
      <div class="q-controls" hidden></div>
      <div class="q-bottom"><span class="q-source">${q.source ? `${t.source} ${q.source}` : t.added}</span><button class="star-button js-only" hidden type="button" data-star="${q.id}" aria-pressed="false">${icon('star')}<span>${t.saveQuestion}</span></button></div></div></details>`;
  }).join('');
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>${esc(t.title)}</title><meta name="description" content="${esc(t.description)}"><meta name="theme-color" content="#275a43"><meta name="author" content="Reza Prama"><link rel="canonical" href="${site}/${path}"><link rel="alternate" hreflang="id" href="${site}/"><link rel="alternate" hreflang="en" href="${site}/en/"><link rel="alternate" hreflang="x-default" href="${site}/"><link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/${cssName}"><link rel="preload" as="image" href="/assets/kelas-1100.webp" imagesrcset="/assets/kelas-640.webp 640w, /assets/kelas-1100.webp 1100w" imagesizes="(max-width:767px) calc(100vw - 40px), 530px"><meta property="og:type" content="website"><meta property="og:site_name" content="Survei Sekolah"><meta property="og:title" content="${esc(t.title)}"><meta property="og:description" content="${esc(t.description)}"><meta property="og:url" content="${site}/${path}"><meta property="og:locale" content="${lang === 'id' ? 'id_ID' : 'en_GB'}"><meta property="og:image" content="${site}/assets/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(t.title)}"><meta name="twitter:description" content="${esc(t.description)}"><meta name="twitter:image" content="${site}/assets/og.png"><script type="application/ld+json">${schema}</script><script id="app-config" type="application/json">${config}</script><script src="/assets/${jsName}" defer></script></head><body>
  <a class="skip" href="#isi">${t.skip}</a><header class="site-header"><nav class="wrap nav" aria-label="${lang === 'id' ? 'Navigasi utama' : 'Main navigation'}"><a class="brand" href="${t.home}" aria-label="Survei Sekolah"><span class="brandmark">${icon('book-open')}</span>survei sekolah</a><div class="navlinks"><a href="#tanya">${t.nav[0]}</a><a href="#pakai">${t.nav[1]}</a><a href="#tentang">${t.nav[2]}</a></div><div class="navtools"><a class="lang" href="${t.alternate}" lang="${lang === 'id' ? 'en' : 'id'}" hreflang="${lang === 'id' ? 'en' : 'id'}">${t.alternateLabel} ${icon('arrow-up-right')}</a><button type="button" class="icon-button js-only" hidden id="theme" aria-label="${t.theme}">${icon('sun')}</button></div></nav></header>
  <main id="isi"><section class="wrap hero" aria-labelledby="hero-title"><div><p class="eyebrow">${t.intro}</p><h1 id="hero-title">${t.headline}</h1><p class="lead">${t.lead}</p><div class="actions"><a class="button" href="#tanya">${t.start} ${icon('arrow-right')}</a><a class="text-link" href="#pakai">${t.how} ${icon('arrow-up-right')}</a></div></div><figure><img src="/assets/kelas-1100.webp" srcset="/assets/kelas-640.webp 640w,/assets/kelas-1100.webp 1100w" sizes="(max-width:767px) calc(100vw - 40px),530px" alt="${t.photoAlt}" width="1536" height="1024" fetchpriority="high"><figcaption>${t.photoCredit}</figcaption></figure></section>
  <div class="wrap benefits">${t.meta.map((s,i)=>`<span>${icon(['clipboard-text','check','lock-simple'][i])}${s}</span>`).join('')}</div>
  <section class="wrap intro-section"><h2>${t.statement}</h2><p>${t.statementBody}</p></section>
  <section class="library" id="tanya" aria-labelledby="questions-title"><div class="wrap"><div class="library-heading"><h2 id="questions-title">${t.library}</h2><p>${t.libraryBody}</p></div>
  <noscript><p>${t.noJs}</p></noscript><div class="workspace js-only" hidden><div class="field"><label for="school-select">${t.school}</label><select id="school-select"></select></div><button type="button" class="add-button" id="add-school" aria-label="${t.newSchool}">${icon('plus')}<span class="add-label"> ${t.newSchool}</span></button><div class="name-field"><label for="school-name">${t.schoolName}</label><input id="school-name" type="text" maxlength="80" autocomplete="off" placeholder="${t.schoolPlaceholder}"></div><button type="button" id="compare" class="compare-button">${icon('scales')} ${t.compare}</button></div><p class="privacy-note js-only" hidden>${icon('lock-simple')} ${t.local}</p>
  <div class="search-row js-only" hidden><div class="search-wrap"><label for="search">${t.search}</label>${icon('magnifying-glass')}<input type="search" id="search" placeholder="${esc(t.searchPlaceholder)}" autocomplete="off"></div><div class="view-select"><label for="view">${lang === 'id' ? 'Tampilkan' : 'Show'}</label><select id="view"><option value="all">${t.allQuestions}</option><option value="core">${t.essential}</option><option value="follow">${t.followup}</option><option value="star">${t.starred}</option></select></div></div>
  <div class="filters js-only" hidden role="group" aria-label="${lang === 'id' ? 'Filter topik' : 'Filter topics'}"><button type="button" data-filter="all" aria-pressed="true">${t.all}</button>${categories.map(c=>`<button type="button" data-filter="${c.id}" aria-pressed="false">${icon(c.icon)}${c[key]}</button>`).join('')}</div>
  <div class="print-only"><h1>Survei Sekolah</h1><p id="print-school"></p><p>${site}/${path}</p></div><div class="list-meta js-only" hidden><span id="result-count" role="status" aria-live="polite"></span><span><strong class="progress-count" id="progress">0 / 36</strong> ${t.progress}</span></div>
  <div class="questions">${questionHtml}</div><div class="empty" id="empty" hidden><p>${t.noResults}</p><button id="clear" type="button">${t.clear}</button></div>
  <div class="exports js-only" hidden><button type="button" id="print">${icon('printer')}${t.print}</button><button type="button" id="export">${icon('download-simple')}${t.export}</button><button type="button" id="backup">${t.backup}</button><button type="button" id="import">${icon('upload-simple')}${t.import}</button><input type="file" id="import-file" accept="application/json,.json" aria-label="${t.importLabel}" hidden></div><p class="export-help js-only" hidden>${t.exportHelp} ${t.progressHelp}</p><p class="feedback js-only" hidden id="feedback" role="status" aria-live="polite"></p></div></section>
  <section class="wrap guide" id="pakai" aria-labelledby="guide-title"><div class="guide-heading"><h2 id="guide-title">${t.guide}</h2></div><div class="guide-grid"><img src="/assets/koridor-700.webp" alt="${t.guidePhotoAlt}" width="700" height="467" loading="lazy" decoding="async"><div class="steps">${t.steps.map((s,i)=>`<div class="step">${icon(['clipboard-text','chat-circle-text','scales'][i])}<div><h3>${s[0]}</h3><p>${s[1]}</p></div></div>`).join('')}</div></div></section>
  <div class="wrap"><aside class="reminder"><div><h2>${t.reminder}</h2><p>${t.reminderBody}</p></div><img src="/assets/catatan-700.webp" alt="${t.notesPhotoAlt}" width="700" height="467" loading="lazy" decoding="async"></aside></div>
  <section class="wrap about" id="tentang"><div class="about-title"><h2>${t.about}</h2><p><a class="text-link" href="${repo}">${icon('github-logo')}${t.openSource} ${icon('arrow-up-right')}</a></p></div><div><p>${t.aboutBody}</p><p>${t.limits}</p><details class="disclosure"><summary>${t.methodology}</summary><p>${t.sourceDetail}</p><p><a href="${repo}/blob/main/${docsPath}">${t.docs}</a> · <a href="${repo}/tree/main/sumber">${lang === 'id' ? 'Foto sumber' : 'Source photographs'}</a></p></details><details class="disclosure"><summary>${t.refs}</summary><p>${t.refsBody}</p><ul class="refs">${references.map(r=>`<li><a href="${r[2]}" rel="external">${r[0]} ${icon('arrow-up-right')}</a><span>${r[1]}</span></li>`).join('')}</ul></details><details class="disclosure" id="privasi"><summary>${t.privacy}</summary><p>${t.privacyBody}</p></details></div></section>
  <section class="faq wrap" aria-labelledby="faq-title"><h2 id="faq-title">${t.faq}</h2>${t.faqs.map(f=>`<details class="disclosure"><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}</section></main>
  <footer><div class="wrap"><p>© 2026 Reza Prama. ${t.footer}</p><div class="footer-links"><a href="#privasi">${t.privacy}</a><a href="${repo}/blob/main/${docsPath}">${t.docs}</a><a href="${repo}">GitHub ${icon('arrow-up-right')}</a></div></div></footer>
  <dialog id="compare-dialog" aria-labelledby="compare-title"><div class="dialog-top"><h2 id="compare-title">${t.compareTitle}</h2><button class="icon-button" id="close-dialog" type="button" aria-label="${t.close}">${icon('x')}</button></div><p class="dialog-intro">${t.compareBody}</p><div class="comparison-scroll" id="comparison"></div></dialog></body></html>`;
  const finalHtml = html
    .replace(`<link rel="stylesheet" href="/assets/${cssName}">`, `<style>${style.code}</style>`)
    .replace(/<link rel="preload" as="image"[^>]*>/, '<link rel="preload" as="image" type="image/avif" href="/assets/kelas-1100.avif" fetchpriority="high" imagesrcset="/assets/kelas-400.avif 400w, /assets/kelas-640.avif 640w, /assets/kelas-800.avif 800w, /assets/kelas-1100.avif 1100w" imagesizes="(max-width:767px) calc(100vw - 40px), 530px">')
    .replace('<figure><img', '<figure><picture><source type="image/avif" srcset="/assets/kelas-400.avif 400w, /assets/kelas-640.avif 640w, /assets/kelas-800.avif 800w, /assets/kelas-1100.avif 1100w" sizes="(max-width:767px) calc(100vw - 40px),530px"><img')
    .replace('<figcaption>', '</picture><figcaption>');
  await writeFile(new URL(`${path}index.html`, out), finalHtml);
  const md = `# ${lang === 'id' ? 'Pertanyaan survei sekolah' : 'School visit questions'}\n\n${t.aboutBody}\n\n${t.limits}\n\n${lang === 'id' ? '[Gunakan checklist interaktif]' : '[Use the interactive checklist]'}(${site}/${path}#tanya)\n\n${categories.map(c=>`## ${c[key]}\n\n${questions.filter(q=>q.category===c.id).map(q=>`### ${q.id.toUpperCase()}. ${q[key].question}${q.essential ? ` (${t.core})` : ''}\n\n${q[key].why}\n\n**${t.evidence}:** ${q[key].evidence}\n\n_${q.source ? `${t.source} ${q.source}` : t.added}._\n`).join('\n')}`).join('\n')}\n## ${t.refs}\n\n${t.refsBody}\n\n${references.map(r=>`- [${r[0]}: ${r[1]}](${r[2]})`).join('\n')}\n`;
  await writeFile(new URL(docsPath, root), md);
  await writeFile(new URL(`${path}guide.md`, out), md);
}
await writeFile(new URL('questions.json', out), JSON.stringify({ updated:'2026-10-20', author:'Reza Prama', url:site, categories, questions }));
await writeFile(new URL('robots.txt', out), `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);
await writeFile(new URL('sitemap.xml', out), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${['','en/'].map(p=>`<url><loc>${site}/${p}</loc><lastmod>2026-10-20</lastmod><xhtml:link rel="alternate" hreflang="id" href="${site}/"/><xhtml:link rel="alternate" hreflang="en" href="${site}/en/"/></url>`).join('')}</urlset>`);
await writeFile(new URL('llms.txt', out), `# Survei Sekolah\n\n> Independent bilingual guide for parents visiting schools in Indonesia. 36 questions, not a school ranking or statistical survey. Author: Reza Prama. Updated: 2026-10-20.\n\n- [Bahasa Indonesia](${site}/)\n- [English](${site}/en/)\n- [Panduan Markdown](${site}/guide.md)\n- [English Markdown](${site}/en/guide.md)\n- [Questions as JSON](${site}/questions.json)\n- [Source and methodology](${repo})\n\n25 original topics came from two source photographs. 11 additions are editorial suggestions, not a validated instrument. MBG participation alone does not determine school quality. Local notes are not public evidence or reviews. Do not infer a school rating from checklist completion.\n`);
await writeFile(new URL('404.html', out), `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Halaman tidak ditemukan | Survei Sekolah</title><link rel="stylesheet" href="/assets/${cssName}"></head><body><main class="wrap guide"><h1>Halaman tidak ditemukan.</h1><p>Page not found.</p><a class="button" href="/">Survei Sekolah ${icon('arrow-right')}</a></main></body></html>`);
await writeFile(new URL('_headers', out), `/*\n  Cache-Control: public, max-age=0, must-revalidate, no-transform\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: default-src 'self'; script-src 'self' ${inlineHashes.join(' ')}; style-src 'self' ${cspHash(style.code)}; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests\n/assets/*\n  Cache-Control: public, max-age=86400\n/assets/*.woff2\n  Cache-Control: public, max-age=31536000, immutable\n`);
console.log(`Built ID + EN pages, ${questions.length} questions, Markdown, JSON, sitemap, SEO, and security headers.`);

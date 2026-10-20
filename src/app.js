import { validateState, initialState, STATUSES } from './state.mjs';

const { lang, t, categories } = JSON.parse(document.getElementById('app-config').textContent);
const $ = id => document.getElementById(id);
const cards = [...document.querySelectorAll('.question')];
const key = 'surveisekolah:v1';
let state = initialState(t.initialSchool, crypto.randomUUID());
let storageFailed = false;
try { const raw = localStorage.getItem(key); if (raw) state = validateState(JSON.parse(raw)); } catch { storageFailed = true; }
const active = () => state.schools.find(s => s.id === state.activeId);
const answer = id => active().answers[id] ?? {status:'unasked', note:'', star:false};
const persist = () => {
  try { localStorage.setItem(key, JSON.stringify(state)); storageFailed = false; }
  catch { storageFailed = true; }
  if (storageFailed) announce(t.storageError, true);
};
let saveTimer;
function queueSave() { clearTimeout(saveTimer); saveTimer = setTimeout(persist, 250); }
addEventListener('pagehide', () => { clearTimeout(saveTimer); persist(); });
function announce(message, error = false) { $('feedback').textContent = message; $('feedback').classList.toggle('error', error); }
function setAnswer(id, patch) { active().answers[id] = {...answer(id), ...patch}; queueSave(); }

document.querySelectorAll('.js-only:not(.q-controls):not(.star-button)').forEach(el => el.hidden = false);
let topic = 'all';
const params = new URLSearchParams(location.search);
$('view').value='core';
if (categories.some(c => c.id === params.get('topic'))) topic = params.get('topic');
if (['all','core','follow','star'].includes(params.get('view'))) $('view').value = params.get('view');
let searchTimer;
const searchText = new Map(cards.map(c => [c.id, normalise(c.querySelector('summary').textContent + ' ' + [...c.querySelectorAll('.q-body > p')].map(p=>p.textContent).join(' '))]));
function normalise(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase(lang).trim(); }
function filter(updateUrl = false) {
  const words = normalise($('search').value).split(/\s+/).filter(Boolean);
  const view = $('view').value;
  let count = 0;
  for (const c of cards) {
    const a = answer(c.id);
    const show = (topic === 'all' || c.dataset.category === topic) && words.every(w => searchText.get(c.id).includes(w)) && (view === 'all' || view === 'core' && c.dataset.core === 'true' || view === 'follow' && a.status === 'follow' || view === 'star' && a.star);
    c.hidden = !show;
    if (show) count++;
  }
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === topic)));
  $('result-count').textContent = `${count} / ${cards.length} ${t.visible}`;
  $('empty').hidden = count !== 0;
  $('progress').textContent = `${Object.values(active().answers).filter(a=>a.status==='clear').length} / ${cards.length}`;
  if (updateUrl) {
    const url = new URL(location.href);
    topic === 'all' ? url.searchParams.delete('topic') : url.searchParams.set('topic',topic);
    view === 'all' ? url.searchParams.delete('view') : url.searchParams.set('view',view);
    history.replaceState(null, '', url);
  }
}
function renderSchools() {
  const opts = state.schools.map(s => { const o = document.createElement('option'); o.value=s.id; o.textContent=s.name || t.schoolName; return o; });
  $('school-select').replaceChildren(...opts);
  $('school-select').value = state.activeId;
  $('school-name').value = active().name;
}
function renderAnswers() {
  for (const card of cards) {
    const a = answer(card.id);
    card.dataset.status = a.status;
    if(card.open) renderCard(card);
  }
  filter();
}
function renderCard(card) {
  const a=answer(card.id);
  const controls=card.querySelector('.q-controls');
  if(!controls.dataset.ready) {
    const statusLabel=el('label',t.status);statusLabel.htmlFor=`status-${card.id}`;
    const select=el('select');select.id=statusLabel.htmlFor;select.dataset.answer=card.id;
    STATUSES.forEach((status,i)=>{const option=el('option',t.statuses[i]);option.value=status;select.append(option);});
    const noteLabel=el('label',t.note);noteLabel.htmlFor=`note-${card.id}`;
    const textarea=el('textarea');textarea.id=noteLabel.htmlFor;textarea.dataset.note=card.id;textarea.rows=3;textarea.maxLength=4000;textarea.placeholder=t.notePlaceholder;
    const printed=el('p',undefined,'printed-answer print-only');printed.dataset.print=card.id;
    controls.append(statusLabel,select,noteLabel,textarea,printed);controls.dataset.ready='true';
  }
  controls.hidden=false;
  card.querySelector('select').value=a.status;
  card.querySelector('textarea').value=a.note;
  const b=card.querySelector('[data-star]');b.hidden=false;
  b.setAttribute('aria-pressed',String(a.star));b.querySelector('span').textContent=a.star?t.savedQuestion:t.saveQuestion;
}
cards.forEach(card=>card.addEventListener('toggle',()=>{if(card.open)renderCard(card);}));
$('school-select').addEventListener('change', e => { state.activeId=e.target.value; persist(); renderSchools(); renderAnswers(); });
$('school-name').addEventListener('input', e => { active().name=e.target.value; $('school-select').selectedOptions[0].textContent=e.target.value || t.schoolName; queueSave(); });
$('add-school').addEventListener('click', () => {
  if (state.schools.length >= 3) { announce(t.maxSchools); return; }
  const id = crypto.randomUUID(); state.schools.push({id,name:`${t.newSchoolName} ${state.schools.length+1}`,answers:{}}); state.activeId=id;
  persist(); renderSchools(); renderAnswers(); $('school-name').focus(); $('school-name').select();
});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click', ()=>{topic=b.dataset.filter; filter(true);}));
$('view').addEventListener('change', ()=>filter(true));
$('search').addEventListener('input', ()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>filter(),100);});
$('clear').addEventListener('click', ()=>{topic='all';$('search').value='';$('view').value='all';filter(true);$('search').focus();});
document.querySelector('.questions').addEventListener('change', e=>{
  if(e.target.matches('[data-answer]')) { const id=e.target.dataset.answer; setAnswer(id,{status:e.target.value}); $(id).dataset.status=e.target.value; filter(); }
});
document.querySelector('.questions').addEventListener('input', e=>{if(e.target.matches('[data-note]')) setAnswer(e.target.dataset.note,{note:e.target.value});});
document.querySelectorAll('[data-star]').forEach(b=>b.addEventListener('click', ()=>{
  const id=b.dataset.star; const star=!answer(id).star; setAnswer(id,{star}); b.setAttribute('aria-pressed',String(star));b.querySelector('span').textContent=star?t.savedQuestion:t.saveQuestion;filter();
}));

function download(content, extension, mime) {
  const blob = new Blob([content], {type:mime}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`survei-sekolah-${new Date().toISOString().slice(0,10)}.${extension}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const markdown = s => String(s).replace(/([\\`*_{}\[\]<>#|])/g,'\\$1').replace(/\r/g,'');
$('export').addEventListener('click', ()=>{
  const text = `# Survei Sekolah\n\n${t.progressHelp}\n\n${state.schools.map(s=>`## ${markdown(s.name)}\n\n${cards.filter(c=>{const a=s.answers[c.id];return a && (a.status!=='unasked'||a.note||a.star);}).map(c=>{const a=s.answers[c.id];return `### ${markdown(c.querySelector('h3').textContent)}\n\n${t.status}: ${t.statuses[STATUSES.indexOf(a.status)]}\n\n${markdown(a.note) || '('+t.statuses[0]+')'}\n`;}).join('\n')}`).join('\n')}\nhttps://surveisekolah.rezaprama.com/${lang==='en'?'en/':''}\n`;
  download(text,'md','text/markdown;charset=utf-8');
});
$('backup').addEventListener('click', ()=>download(JSON.stringify(state,null,2),'json','application/json'));
$('import').addEventListener('click', ()=>$('import-file').click());
$('import-file').addEventListener('change', async e=>{
  const file=e.target.files[0]; if(!file)return;
  try {
    if(file.size>1_000_000)throw new Error('Too large');
    const next=validateState(JSON.parse(await file.text()));
    if(!confirm(t.importConfirm))return;
    clearTimeout(saveTimer);state=next;persist();renderSchools();renderAnswers();announce(storageFailed?t.storageError:t.importSuccess,storageFailed);
  } catch {announce(t.importError,true);} finally {e.target.value='';}
});
let openBeforePrint;
addEventListener('beforeprint',()=>{
  openBeforePrint=new Set(cards.filter(c=>c.open).map(c=>c.id));
  $('print-school').textContent=active().name;
  for(const c of cards) {
    if(!c.hidden){c.open=true;renderCard(c);const a=answer(c.id);c.querySelector('[data-print]').textContent=`${t.status}: ${t.statuses[STATUSES.indexOf(a.status)]}\n${a.note || '\n\n'}`;}
  }
});
addEventListener('afterprint',()=>{if(openBeforePrint) cards.forEach(c=>c.open=openBeforePrint.has(c.id));});
$('print').addEventListener('click',()=>window.print());
function el(tag,text,cls) {const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
$('compare').addEventListener('click',()=>{
  const host=$('comparison');host.replaceChildren();
  if(state.schools.length<2)host.append(el('p',t.emptyCompare));
  else {
    const table=el('table',undefined,'comparison');table.append(el('caption',t.progressHelp));
    const head=el('thead'), tr=el('tr');tr.append(el('th',lang==='id'?'Topik':'Topic'));state.schools.forEach(s=>tr.append(el('th',s.name)));head.append(tr);table.append(head);
    const body=el('tbody');
    categories.forEach(cat=>{
      const row=el('tr');const heading=el('th',cat.name);heading.scope='row';row.append(heading);
      const group=cards.filter(c=>c.dataset.category===cat.id);
      state.schools.forEach(s=>{const cell=el('td');const items=group.map(c=>({c,a:s.answers[c.id]}));
        cell.append(el('strong',`${items.filter(i=>i.a?.status==='clear').length} / ${group.length} ${t.statuses[1].toLowerCase()}`));
        for(const {c,a} of items.filter(i=>i.a && (i.a.status!=='unasked'||i.a.note))) {
          const d=el('details',undefined,'disclosure');d.append(el('summary',c.querySelector('h3').textContent));d.append(el('small',t.statuses[STATUSES.indexOf(a.status)]));if(a.note)d.append(el('p',a.note));cell.append(d);
        }
        row.append(cell);
      });body.append(row);
    });table.append(body);host.append(table);
  }
  $('compare-dialog').showModal();
});
$('close-dialog').addEventListener('click',()=>$('compare-dialog').close());
$('compare-dialog').addEventListener('click',e=>{if(e.target===$('compare-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
function applyTheme(dark) {document.documentElement.dataset.theme=dark?'dark':'light';$('theme').setAttribute('aria-pressed',String(dark));}
try {const theme=localStorage.getItem('surveisekolah:theme');if(theme==='dark'||theme==='light')applyTheme(theme==='dark');}catch{}
$('theme').addEventListener('click',()=>{
  const dark=document.documentElement.dataset.theme ? document.documentElement.dataset.theme!=='dark' : !matchMedia('(prefers-color-scheme:dark)').matches;
  applyTheme(dark);try{localStorage.setItem('surveisekolah:theme',dark?'dark':'light');}catch{}
});
renderSchools();renderAnswers();if(storageFailed)announce(t.storageError,true);
function openAnchor() {const id=location.hash.slice(1);const card=cards.find(c=>c.id===id);if(card){topic='all';$('view').value='all';$('search').value='';filter();card.open=true;card.scrollIntoView();}else if(id==='privasi')$('privasi').open=true;}
addEventListener('hashchange',openAnchor);openAnchor();

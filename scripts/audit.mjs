import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.AUDIT_URL || 'http://127.0.0.1:8787';
const results=[];
await mkdir('reports',{recursive:true});
for(const lang of ['id','en']) for(const device of ['mobile','desktop']) {
  const chrome=await chromeLauncher.launch({chromePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',chromeFlags:['--headless=new','--no-first-run','--disable-dev-shm-usage']});
  try {
    const result=await lighthouse(base+(lang==='en'?'/en/':'/'), {port:chrome.port,output:['json','html'],onlyCategories:['performance','accessibility','best-practices','seo'],logLevel:'error'}, device==='desktop'?{extends:'lighthouse:default',settings:{formFactor:'desktop',screenEmulation:{mobile:false,width:1350,height:940,deviceScaleFactor:1,disabled:false},throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1,requestLatencyMs:0,downloadThroughputKbps:0,uploadThroughputKbps:0}}}:undefined);
    const lhr=result.lhr;
    await writeFile(`reports/${lang}-${device}.json`,result.report[0]);await writeFile(`reports/${lang}-${device}.html`,result.report[1]);
    const row={lang,device,url:lhr.finalDisplayedUrl,date:lhr.fetchTime,scores:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(id=>[id,lhr.audits[id].numericValue])),issues:Object.values(lhr.audits).filter(a=>a.score!==null&&a.score<1&&a.scoreDisplayMode!=='informative'&&a.scoreDisplayMode!=='manual').map(a=>({id:a.id,title:a.title,score:a.score,display:a.displayValue}))};
    results.push(row);console.log(JSON.stringify(row));
  } finally {await chrome.kill();}
}
await writeFile('reports/summary.json',JSON.stringify({tool:'Lighthouse',version:(await import('lighthouse/package.json',{with:{type:'json'}})).default.version,results},null,2));

import { test, expect } from '@playwright/test';

test('notes, filters, school isolation, comparison, bilingual persistence, and backup',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/');
  await expect(page.locator('.question')).toHaveCount(36);
  await page.locator('#view').selectOption('core');
  await expect(page.locator('.question:visible')).toHaveCount(12);
  await page.locator('#view').selectOption('all');
  await page.locator('#search').fill('alergi');
  await expect(page.locator('.question:visible')).not.toHaveCount(0);
  await page.locator('#search').fill('xyz-no-result');
  await expect(page.locator('#empty')).toBeVisible();
  await page.locator('#clear').click();
  await page.locator('#school-name').fill('Sekolah Melati');
  await page.locator('#q03 summary').click();
  await page.locator('#status-q03').selectOption('follow');
  await page.locator('#note-q03').fill('Minta SOP tertulis. <script>alert(1)</script>');
  await page.locator('[data-star=q03]').click();
  await page.waitForTimeout(350);
  await page.reload();
  await page.locator('#q03 summary').click();
  await expect(page.locator('#note-q03')).toHaveValue('Minta SOP tertulis. <script>alert(1)</script>');
  await page.locator('#add-school').click();
  await page.locator('#school-name').fill('Sekolah Kenanga');
  await expect(page.locator('#note-q03')).toHaveValue('');
  await page.locator('#status-q03').selectOption('clear');
  await page.locator('#compare').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#comparison')).toContainText('Sekolah Melati');
  await expect(page.locator('#comparison')).toContainText('Sekolah Kenanga');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.locator('.lang').click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.locator('#school-name')).toHaveValue('Sekolah Kenanga');
  await page.locator('#school-select').selectOption({label:'Sekolah Melati'});
  await page.locator('#q03 summary').click();
  await expect(page.locator('#note-q03')).toHaveValue('Minta SOP tertulis. <script>alert(1)</script>');
  const downloaded=page.waitForEvent('download');await page.locator('#backup').click();
  const dl=await downloaded;await dl.saveAs('test-results/backup.json');
  await page.locator('#note-q03').fill('Changed');
  page.once('dialog',d=>d.accept());
  await page.locator('#import-file').setInputFiles('test-results/backup.json');
  await expect(page.locator('#note-q03')).toHaveValue('Minta SOP tertulis. <script>alert(1)</script>');
  await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"bad":true}')});
  await expect(page.locator('#feedback')).toContainText('invalid');
  expect(errors).toEqual([]);
});

for(const width of [360,390,768,1440]) test(`layout, images, dark mode, and print at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.goto('/');
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const bad=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src));
  // Below-fold images may still be lazy; force their loading before verification.
  await page.locator('.reminder img').scrollIntoViewIfNeeded();await page.waitForTimeout(250);
  await expect.poll(()=>page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
  await page.locator('#theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('#theme').click();
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:`test-results/home-${width}.png`,fullPage:width===1440});
  await page.locator('#view').selectOption('core');
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>dispatchEvent(new Event('beforeprint')));
  await expect(page.locator('.question[open]:visible')).toHaveCount(12);
  expect(await page.locator('.question[open]:visible .q-body').first().isVisible()).toBe(true);
});

test('content remains usable with JavaScript disabled',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:8787');
  await expect(page.locator('.question:visible')).toHaveCount(36);
  await page.locator('#q24 summary').click();await expect(page.locator('#q24 .q-body')).toBeVisible();
  await expect(page.locator('.workspace')).toBeHidden();await context.close();
});

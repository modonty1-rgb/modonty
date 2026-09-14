import { chromium } from '@playwright/test';
const base='http://localhost:3001';
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1280,height:1000}})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,110)));
p.on('console',m=>m.type()==='error'&&!/MaxListeners/.test(m.text())&&errs.push(m.text().slice(0,110)));
await p.goto(`${base}/login`,{waitUntil:'networkidle'});
await p.fill('input[type="email"]','claude-check@modonty.local');
await p.fill('input[type="password"]','Mdnty-Local-Check-2026!');
await p.click('button[type="submit"]'); await p.waitForTimeout(5000);
for(const r of ['/playbook','/playbook/sales']){
  const res=await p.goto(base+r,{waitUntil:'networkidle'}); await p.waitForTimeout(1200);
  const t=await p.locator('main').innerText();
  console.log(`${res?.status()}  ${r}  chars=${t.length}  errs=${errs.length} ${errs[0]||''}`);
  if(r==='/playbook') console.log('  الأقسام:', JSON.stringify(await p.locator('main section[id] h2, main section[id] > div > div > h2').evaluateAll(e=>e.map(x=>x.innerText))));
  if(r==='/playbook/sales') console.log('  جملة البيع موجودة:', t.includes('نحوّل خبرتك'));
  errs.length=0;
}
await b.close();

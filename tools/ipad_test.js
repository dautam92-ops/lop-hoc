const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:820,height:1180}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+__dirname+'/bai-hoc-ipad.html',{waitUntil:'networkidle'});
await p.screenshot({path:__dirname+'/s1.png'});
await p.click('.kid[data-k="k5"]');await p.screenshot({path:__dirname+'/s2.png'});
await p.click('.act[data-i="0"]');await p.click('.opt[data-j="2"]');await p.waitForTimeout(300);await p.screenshot({path:__dirname+'/s3.png'});
await p.click('#bk');await p.click('.act[data-i="3"]');await p.click('.pad .d');await p.screenshot({path:__dirname+'/s4.png'});
await p.click('#bk');await p.click('#bk');await p.click('.kid[data-k="k8"]');
for(const i of [1,5,8,9]){await p.click(`.act[data-i="${i}"]`);await p.screenshot({path:__dirname+`/k8_${i}.png`});await p.click('#bk');}
// solve sudoku fully
await p.click('.act[data-i="1"]');
const sol='265431|431265|654312|312654|543126|126543'.split('|');
for(let y=0;y<6;y++)for(let x=0;x<6;x++){const sel=`.sud button[data-y="${y}"][data-x="${x}"].u`;if(await p.$(sel)){await p.$eval(sel,e=>e.click());await p.$eval(`.nums button[data-n="${sol[y][x]}"]`,e=>e.click());}}
await p.waitForTimeout(700);console.log(await p.$$eval('.sud button',bs=>bs.map(b=>b.textContent||'.').join('')), await p.$eval('#fb',e=>e.textContent).catch(()=>'nofb'));console.log('sud win', await p.$('.win')!==null);
console.log('errors',errs);await b.close();})();

// Mở mọi màn hình bài trên web (điện thoại dọc 390px), báo lỗi nếu chữ trên trang có mã thô (${, undefined, NaN, [object) hoặc lỗi JS, hoặc trang tràn ngang.
// Chạy: node kiem_tra_giao_dien.js bai-hoc-ipad.html   (thoát mã 1 nếu có lỗi)
const {chromium}=require('playwright');const path=require('path');
(async()=>{const f='file://'+path.resolve(process.argv[2]);const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
const bad=[];p.on('pageerror',e=>bad.push('Lỗi JS: '+e.message));
const check=async where=>{const t=await p.evaluate(()=>document.body.innerText);const m=t.match(/\$\{|\bundefined\b|\bNaN\b|\[object/);if(m)bad.push(`${where}: có mã thô "${m[0]}"`);
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth);if(sw>392)bad.push(`${where}: tràn ngang ${sw}px`)};
await p.goto(f);await check('Trang chủ');const L=await p.evaluate(()=>LESSON);
for(const k of Object.keys(L.kids)){await p.goto(f);await p.click(`.kid[data-k="${k}"]`);await check(k+' bản đồ');
  for(let i=0;i<L.kids[k].acts.length;i++){await p.goto(f);await p.click(`.kid[data-k="${k}"]`);await p.$eval(`.act[data-i="${i}"]`,e=>e.click());await p.waitForTimeout(150);await check(`${k} bài ${i+1} "${L.kids[k].acts[i].title}"`)}}
await b.close();if(bad.length){console.log('LỖI GIAO DIỆN:\n- '+bad.join('\n- '));process.exit(1)}console.log('OK: giao diện không có mã thô, không tràn ngang.')})();

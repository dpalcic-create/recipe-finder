const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DIETS=[['vegetarian','Vegetarian'],['vegan','Vegan'],['pescatarian','Pescatarian'],['gluten-free','Gluten-free'],['dairy-free','Dairy-free'],['nut-free','Nut-free'],['low-carb','Low-carb / keto'],['high-protein','High-protein']];
const ALT={'spaghetti':['pasta'],'pasta shells':['pasta'],'lasagna noodles':['pasta'],'pasta':['spaghetti','pasta shells'],'cherry tomatoes':['tomato'],'tomato':['cherry tomatoes'],'cheddar':['cheese'],'mozzarella':['cheese'],'parmesan':['cheese'],'feta':['cheese'],'romaine lettuce':['lettuce'],'lettuce':['romaine lettuce'],'corn tortillas':['tortillas'],'tortillas':['corn tortillas'],'red onion':['onion'],'onion':['red onion'],'baguette':['bread'],'bread':['baguette'],'cream':['heavy cream'],'yogurt':['greek yogurt'],'greek yogurt':['yogurt'],'noodles':['rice noodles'],'canned tuna':['tuna'],'chicken breast':['chicken'],'chicken thighs':['chicken'],'ground chicken':['chicken'],'beef steak':['steak','beef'],'ground beef':['beef'],'vinegar':['balsamic vinegar','rice vinegar']};
const ALL=[...new Set([...INGREDIENTS,'cheese','chicken','beef','yogurt','tuna','heavy cream'])].sort();
const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem('rf-'+k))??d}catch(e){return d}},sv=(k,v)=>localStorage.setItem('rf-'+k,JSON.stringify(v));
let S={kitchen:ld('kitchen',[]),diets:ld('diets',[]),avoid:ld('avoid',''),staples:ld('staples',true),favs:ld('favs',[]),shop:ld('shop',[]),only:ld('only',false),meal:ld('meal',''),time:ld('time',0)};
const save=()=>Object.keys(S).forEach(k=>sv(k,S[k]));
const norm=s=>s.trim().toLowerCase().replace(/\s+/g,' ');
const isStaple=n=>STAPLES.includes(n);
function owns(n){const k=S.kitchen;if(k.includes(n))return true;if(S.staples&&isStaple(n))return true;return (ALT[n]||[]).some(a=>k.includes(a))}
function avoidList(){return S.avoid.split(',').map(norm).filter(Boolean)}
function fits(r){if(!S.diets.every(d=>r.diet.includes(d)))return false;const a=avoidList();return !r.ing.some(i=>a.some(x=>i.n.includes(x)))}
function score(r){const need=r.ing.filter(i=>!(S.staples&&isStaple(i.n)));const have=need.filter(i=>owns(i.n));return{need:need.length,have:have.length,miss:need.filter(i=>!owns(i.n)).map(i=>i.n)}}
function card(r,sc){const p=sc.need?sc.have/sc.need:1;return `<div class="card rc" data-id="${r.id}"><div class="emo">${r.emoji}</div><div class="grow"><div class="name">${esc(r.name)}${S.favs.includes(r.id)?' ❤️':''}</div><div class="meta">${r.time} min · serves ${r.servings} · ${r.meal}</div>${S.kitchen.length?`<div class="have ${p<.6?'mid':''}">You have ${sc.have}/${sc.need} ingredients</div>${sc.miss.length?`<div class="miss">Missing: ${esc(sc.miss.slice(0,4).join(', '))}${sc.miss.length>4?` +${sc.miss.length-4} more`:''}</div>`:'<div class="have">✓ Ready to cook</div>'}<div class="bar"><i style="width:${p*100}%"></i></div>`:''}</div></div>`}
function renderIdeas(){
 $('#fMeal').value=S.meal;$('#fTime').value=S.time;$('#only').checked=S.only;
 $('#dietNote').textContent=(S.diets.length?'Diet: '+S.diets.map(d=>DIETS.find(x=>x[0]==d)[1]).join(', '):'No diet filters')+(avoidList().length?' · avoiding '+avoidList().join(', '):'')+' · '+S.kitchen.length+' ingredients in kitchen';
 let rs=RECIPES.filter(fits).filter(r=>!S.meal||r.meal==S.meal).filter(r=>!+S.time||r.time<=+S.time).map(r=>[r,score(r)]);
 if(S.kitchen.length){rs=rs.filter(([r,s])=>s.have>0);if(S.only)rs=rs.filter(([r,s])=>!s.miss.length);rs.sort((a,b)=>((b[1].have-1.5*b[1].miss.length)-(a[1].have-1.5*a[1].miss.length))||(b[1].have-a[1].have)||a[0].time-b[0].time)}
 const intro=S.kitchen.length?'':`<div class="banner">Add what's in your kitchen (🧺 tab) and your diet (🥦 tab), and the best matches will rise to the top.</div>`;
 $('#list').innerHTML=intro+(rs.length?`<div class="meta" style="margin:0 4px 8px">${rs.length} recipe${rs.length>1?'s':''}</div>`+rs.map(([r,s])=>card(r,s)).join(''):`<div class="empty">No matching recipes.<br>${S.only?'Try turning off “Cook with what I have only”, or add':'Try loosening the filters or adding'} more ingredients.</div>`);
}
function renderKitchen(){$('#mine').innerHTML=S.kitchen.length?S.kitchen.map(k=>`<button class="chip on x" data-k="${esc(k)}">${esc(k)}</button>`).join(''):'<div class="meta">Nothing yet. Start typing above.</div>';$('#staples').checked=S.staples}
function renderDiet(){$('#diets').innerHTML=DIETS.map(([k,l])=>`<button class="chip ${S.diets.includes(k)?'on':''}" data-d="${k}">${S.diets.includes(k)?'✓ ':''}${l}</button>`).join('');$('#avoid').value=S.avoid}
function renderFavs(){const f=RECIPES.filter(r=>S.favs.includes(r.id));$('#favs').innerHTML=f.length?f.map(r=>card(r,score(r))).join(''):'<div class="empty">Tap ♡ on a recipe to save it here.</div>'}
function renderShop(){$('#shop').innerHTML=S.shop.length?S.shop.map((s,i)=>`<li class="${s.d?'done':''}"><input type="checkbox" data-i="${i}" ${s.d?'checked':''}><span class="grow">${esc(s.n)}</span></li>`).join(''):'<li class="meta">Your list is empty.</li>'}
function renderAll(){renderIdeas();renderKitchen();renderDiet();renderFavs();renderShop();const n=S.shop.filter(s=>!s.d).length;document.querySelector('nav [data-v=shop]').innerHTML=`<b>🛒</b>List${n?' ('+n+')':''}`}
function addIng(v){v=norm(v);if(v&&!S.kitchen.includes(v)){S.kitchen.push(v);save();renderAll()}$('#addIng').value='';$('#ac').classList.add('hide')}
function openR(id){const r=RECIPES[id],sc=score(r),fav=S.favs.includes(id);$('#dT').textContent=r.emoji+' '+r.name;
 $('#dB').innerHTML=`<div class="meta">⏱ ${r.time} min · 🍽 serves ${r.servings} · ${r.meal}</div><div class="tags">${r.diet.map(d=>`<span>${DIETS.find(x=>x[0]==d)[1]}</span>`).join('')}</div>
 ${S.kitchen.length?`<div class="have">You have ${sc.have}/${sc.need} ingredients</div>`:''}
 <h2>Ingredients</h2><ul class="ing">${r.ing.map(i=>`<li class="${owns(i.n)?'own':''}"><span>${owns(i.n)?'✅':'⬜'}</span><span class="grow">${esc(i.q)} ${esc(i.n)}${isStaple(i.n)?' <span class="meta">(staple)</span>':''}</span></li>`).join('')}</ul>
 <div class="row" style="margin-top:12px;gap:8px"><button class="sec grow" id="favB">${fav?'❤️ Saved':'♡ Save'}</button>${sc.miss.length?`<button class="pri grow" id="shopB">🛒 Add ${sc.miss.length} missing</button>`:''}</div>
 <h2 style="margin-top:16px">Steps</h2><ol>${r.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`;
 $('#favB').onclick=()=>{S.favs=fav?S.favs.filter(x=>x!=id):[...S.favs,id];save();renderAll();openR(id)};
 if($('#shopB'))$('#shopB').onclick=()=>{sc.miss.forEach(n=>{if(!S.shop.some(s=>s.n==n&&!s.d))S.shop.push({n,d:false})});save();renderAll();$('#shopB').textContent='✓ Added to list';$('#shopB').disabled=true};
 if(!$('#dlg').open)$('#dlg').showModal();$('#dlg').scrollTop=0}
// online (TheMealDB)
const MDB='https://www.themealdb.com/api/json/v1/1/';
async function mealdb(){const o=$('#olist');if(!navigator.onLine){o.innerHTML='<div class="meta">You are offline.</div>';return}
 o.innerHTML='<div class="meta">Searching…</div>';
 try{let url;if(S.diets.includes('vegan'))url=MDB+'filter.php?c=Vegan';else if(S.diets.includes('vegetarian'))url=MDB+'filter.php?c=Vegetarian';else{const m=S.kitchen.find(k=>!isStaple(k))||'chicken';url=MDB+'filter.php?i='+encodeURIComponent(m.replace(/ /g,'_'))}
  const j=await (await fetch(url)).json();const ms=(j.meals||[]).slice(0,12);
  o.innerHTML=ms.length?ms.map(m=>`<div class="card rc" data-m="${esc(m.idMeal)}" style="box-shadow:none;border:1px solid #fed7aa"><img src="${esc(m.strMealThumb)}/preview" alt="" loading="lazy"><div class="grow"><div class="name">${esc(m.strMeal)}</div><div class="meta">TheMealDB · not diet-checked</div></div></div>`).join(''):'<div class="meta">No online ideas found.</div>'}
 catch(e){o.innerHTML='<div class="meta">Couldn\'t reach TheMealDB right now.</div>'}}
async function openM(id){try{const m=(await (await fetch(MDB+'lookup.php?i='+encodeURIComponent(id))).json()).meals[0];const ing=[];for(let i=1;i<=20;i++){const n=(m['strIngredient'+i]||'').trim();if(n)ing.push([(m['strMeasure'+i]||'').trim(),n])}
 $('#dT').textContent=m.strMeal;$('#dB').innerHTML=`<div class="banner">From TheMealDB. Not checked for your diet, so read the ingredients carefully.</div><div class="meta">${esc(m.strCategory||'')} · ${esc(m.strArea||'')}</div><h2>Ingredients</h2><ul class="ing">${ing.map(([q,n])=>{const o=owns(norm(n));return `<li class="${o?'own':''}"><span>${o?'✅':'⬜'}</span><span class="grow">${esc(q)} ${esc(n)}</span></li>`}).join('')}</ul><h2>Steps</h2><ol>${(m.strInstructions||'').split(/\r?\n+/).map(s=>s.trim()).filter(s=>s&&!/^step \d+$/i.test(s)).map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`;
 if(!$('#dlg').open)$('#dlg').showModal()}catch(e){alert("Couldn't load that recipe.")}}
// events
document.querySelector('nav').onclick=e=>{const b=e.target.closest('button');if(!b)return;document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));document.querySelectorAll('main section').forEach(s=>s.classList.toggle('hide',s.id!='v-'+b.dataset.v));renderAll();scrollTo(0,0)};
document.body.addEventListener('click',e=>{const c=e.target.closest('.rc');if(!c)return;if(c.dataset.m)openM(c.dataset.m);else openR(+c.dataset.id)});
$('#dX').onclick=()=>$('#dlg').close();$('#dlg').addEventListener('click',e=>{if(e.target==$('#dlg'))$('#dlg').close()});
$('#fMeal').onchange=e=>{S.meal=e.target.value;save();renderIdeas()};$('#fTime').onchange=e=>{S.time=+e.target.value;save();renderIdeas()};
$('#only').onchange=e=>{S.only=e.target.checked;save();renderIdeas()};$('#staples').onchange=e=>{S.staples=e.target.checked;save();renderAll()};
$('#mealdb').onclick=mealdb;
const inp=$('#addIng');inp.oninput=()=>{const v=norm(inp.value);const ac=$('#ac');if(!v){ac.classList.add('hide');return}
 const m=ALL.filter(x=>x.includes(v)&&!S.kitchen.includes(x)).sort((a,b)=>a.indexOf(v)-b.indexOf(v)).slice(0,8);if(!ALL.includes(v))m.push(v);
 ac.innerHTML=m.map(x=>`<div data-a="${esc(x)}">${esc(x)}${ALL.includes(x)?'':' <span class="meta">(add as typed)</span>'}</div>`).join('');ac.classList.remove('hide')};
inp.onkeydown=e=>{if(e.key=='Enter'){e.preventDefault();const f=$('#ac div');addIng(f&&!$('#ac').classList.contains('hide')?f.dataset.a:inp.value)}};
$('#ac').onclick=e=>{const d=e.target.closest('[data-a]');if(d){addIng(d.dataset.a);inp.focus()}};
$('#mine').onclick=e=>{const b=e.target.closest('[data-k]');if(b){S.kitchen=S.kitchen.filter(x=>x!=b.dataset.k);save();renderAll()}};
$('#clearK').onclick=()=>{if(confirm('Remove all ingredients?')){S.kitchen=[];save();renderAll()}};
$('#diets').onclick=e=>{const b=e.target.closest('[data-d]');if(!b)return;const d=b.dataset.d;S.diets=S.diets.includes(d)?S.diets.filter(x=>x!=d):[...S.diets,d];save();renderAll()};
$('#avoid').oninput=e=>{S.avoid=e.target.value;save();renderIdeas()};
$('#shop').onchange=e=>{const i=e.target.dataset.i;if(i!=null){S.shop[i].d=e.target.checked;save();renderAll()}};
const addShop=()=>{const v=$('#shopAdd').value.trim();if(v){S.shop.push({n:v,d:false});save();renderAll()}$('#shopAdd').value=''};$('#shopBtn').onclick=addShop;$('#shopAdd').onkeydown=e=>{if(e.key=='Enter')addShop()};
$('#shopClr').onclick=()=>{S.shop=S.shop.filter(s=>!s.d);save();renderAll()};
$('#shopKit').onclick=()=>{S.shop.filter(s=>s.d).forEach(s=>{const n=norm(s.n);if(!S.kitchen.includes(n))S.kitchen.push(n)});S.shop=S.shop.filter(s=>!s.d);save();renderAll()};
renderAll();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');

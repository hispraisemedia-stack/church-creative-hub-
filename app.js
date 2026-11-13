const categoryData = [
  ["Photography","Church moments, worship & faith","▧"],
  ["Videos","Intros, countdowns & motion","▶"],
  ["Backgrounds","Beautiful service visuals","◈"],
  ["Templates","Ready-to-edit ministry designs","▤"],
  ["Graphics","Logos, overlays & PNG elements","✧"],
  ["Motion Graphics","Animated visual elements","✦"],
  ["Fonts","Typography for every message","Aa"],
  ["Other","More creative ministry resources","＋"]
];
const gradients = [
  "linear-gradient(135deg,#29174d,#8b5cf6 55%,#d8b4fe)",
  "linear-gradient(135deg,#102c3c,#287b92 55%,#9be7e5)",
  "linear-gradient(135deg,#3a1c2e,#a23e67 55%,#f6a6bd)",
  "linear-gradient(135deg,#352814,#a9792e 55%,#f4d28c)",
  "linear-gradient(135deg,#171d3c,#4c5bb7 55%,#b9c4ff)",
  "linear-gradient(135deg,#1b342c,#3f8969 55%,#b4e6c8)"
];
let resources = [
 {id:"starter-1",title:"Purple Worship Atmosphere",category:"Backgrounds",description:"A rich purple abstract visual for worship screens, sermon slides and service announcements.",tags:["purple","worship","background"],symbol:"✦",gradient:0,date:6},
 {id:"starter-2",title:"Sunday Service Visual",category:"Templates",description:"A clean starter concept for your weekly Sunday service announcement.",tags:["sunday","service","church"],symbol:"✝",gradient:1,date:5},
 {id:"starter-3",title:"Golden Light Texture",category:"Backgrounds",description:"Warm golden tones for celebration, thanksgiving and special church events.",tags:["gold","light","texture"],symbol:"✧",gradient:3,date:4},
 {id:"starter-4",title:"Worship Night Motion",category:"Videos",description:"A visual placeholder for worship-night video resources and motion backgrounds.",tags:["worship","video","motion"],symbol:"▶",gradient:4,date:3},
 {id:"starter-5",title:"Church Creative Elements",category:"Graphics",description:"Decorative visual elements and design inspiration for church media creators.",tags:["graphics","elements","design"],symbol:"❖",gradient:2,date:2},
 {id:"starter-6",title:"Faith & Hope Typography",category:"Fonts",description:"Typography inspiration for scripture graphics, titles and social media posts.",tags:["font","typography","scripture"],symbol:"Aa",gradient:5,date:1}
];
let activeFilter = "All", searchTerm = "", saved = new Set(JSON.parse(localStorage.getItem("cch-saved")||"[]"));
const $ = id => document.getElementById(id);
const dbPromise = new Promise((resolve,reject)=>{
 const req=indexedDB.open("church-creative-hub-db",1);
 req.onupgradeneeded=()=>req.result.createObjectStore("uploads",{keyPath:"id"});
 req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
});
async function dbGetAll(){try{const db=await dbPromise;return await new Promise((res,rej)=>{const r=db.transaction("uploads").objectStore("uploads").getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}catch(e){return[]}}
async function dbPut(item){const db=await dbPromise;return new Promise((res,rej)=>{const tx=db.transaction("uploads","readwrite");tx.objectStore("uploads").put(item);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
async function dbDelete(id){const db=await dbPromise;return new Promise((res,rej)=>{const tx=db.transaction("uploads","readwrite");tx.objectStore("uploads").delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderCategories(){$("categoryGrid").innerHTML=categoryData.map(([name,desc,icon])=>`<button class="category-card" data-category="${name}"><span class="category-icon">${icon}</span><b>${name}</b><small>${desc}</small></button>`).join("");document.querySelectorAll(".category-card").forEach(b=>b.onclick=()=>{setFilter(b.dataset.category);$("explore").scrollIntoView({behavior:"smooth"})})}
function getVisible(){let list=resources.filter(r=>(activeFilter==="All"||r.category===activeFilter)&&(savedOnly? saved.has(r.id):true));if(searchTerm){const q=searchTerm.toLowerCase();list=list.filter(r=>(r.title+" "+r.category+" "+r.description+" "+(r.tags||[]).join(" ")).toLowerCase().includes(q))}if($("sortSelect").value==="az")list.sort((a,b)=>a.title.localeCompare(b.title));else list.sort((a,b)=>(b.date||0)-(a.date||0));return list}
let savedOnly=false;
function renderResources(){const list=getVisible();$("resourceGrid").innerHTML=list.map(r=>`<article class="resource-card"><div class="resource-visual" style="background:${r.gradient!==undefined?gradients[r.gradient%gradients.length]:"linear-gradient(135deg,#34204f,#8b5cf6)"}" data-preview="${esc(r.id)}"><span class="visual-tag">${esc(r.category.toUpperCase())}</span><button class="save-card" data-save="${esc(r.id)}" title="Save resource">${saved.has(r.id)?"♥":"♡"}</button><span class="visual-symbol">${esc(r.symbol||"✦")}</span><span class="visual-caption">${esc(r.title.toUpperCase())}</span></div><div class="resource-info"><h3>${esc(r.title)}</h3><p>${esc(r.description||"Creative resource for your ministry.")}</p><div class="resource-bottom"><span>${esc(r.category)} · ${r.fileName?esc(formatSize(r.size)):"Starter concept"}</span><button data-preview="${esc(r.id)}">VIEW RESOURCE ↗</button></div></div></article>`).join("");$("emptyState").classList.toggle("hidden",list.length>0);$("resourceGrid").classList.toggle("hidden",list.length===0);$("resultCount").textContent=`Showing ${list.length} resource${list.length===1?"":"s"}`;$("resourceCount").textContent=String(resources.length).padStart(2,"0");document.querySelectorAll("[data-preview]").forEach(el=>el.onclick=()=>preview(el.dataset.preview));document.querySelectorAll("[data-save]").forEach(el=>el.onclick=e=>{e.stopPropagation();toggleSave(el.dataset.save)})}
function formatSize(n=0){if(n<1024)return n+" B";if(n<1048576)return(n/1024).toFixed(1)+" KB";return(n/1048576).toFixed(1)+" MB"}
function setFilter(filter){activeFilter=filter;savedOnly=false;document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===filter));renderResources()}
function toggleSave(id){saved.has(id)?saved.delete(id):saved.add(id);localStorage.setItem("cch-saved",JSON.stringify([...saved]));renderResources();toast(saved.has(id)?"Added to saved resources":"Removed from saved resources")}
function openModal(id){$(id).classList.remove("hidden");document.body.style.overflow="hidden"}
function closeModal(id){$(id).classList.add("hidden");document.body.style.overflow=""}
let currentPreview=null;
function preview(id){const r=resources.find(x=>x.id===id);if(!r)return;currentPreview=r;$("previewCategory").textContent=r.category.toUpperCase();$("previewTitle").textContent=r.title;$("previewDescription").textContent=r.description||"A creative resource for your church media team.";$("previewMeta").textContent=r.fileName?`${r.fileName} · ${formatSize(r.size)}`:"Starter resource concept";$("previewVisual").style.background=r.gradient!==undefined?gradients[r.gradient%gradients.length]:"linear-gradient(135deg,#34204f,#8b5cf6)";$("previewVisual").textContent=r.symbol||"✦";$("previewSave").textContent=saved.has(id)?"♥ Saved":"♡ Save";const link=$("downloadLink");if(r.blob){link.href=URL.createObjectURL(r.blob);link.download=r.fileName||r.title}else{link.removeAttribute("href");link.onclick=e=>{e.preventDefault();toast("This is a starter preview. Upload a file to enable downloads.")}}openModal("previewModal")}
async function loadUploads(){const uploads=await dbGetAll();resources=[...resources.filter(r=>!r.uploaded),...uploads.map((u,i)=>({...u,uploaded:true,gradient:i%gradients.length,symbol:u.kind==="image"?"▧":u.kind==="video"?"▶":"✦",date:Date.now()+i}))];renderResources()}
$("fileInput").addEventListener("change",e=>{const f=e.target.files[0];$("fileName").textContent=f?`${f.name} · ${formatSize(f.size)}`:"Browse files from your device";if(f&&!$("titleInput").value)$("titleInput").value=f.name.replace(/\.[^.]+$/,"").replace(/[-_]/g," ")});
$("uploadForm").addEventListener("submit",async e=>{e.preventDefault();const file=$("fileInput").files[0];if(!file)return toast("Please choose a file first");const id="upload-"+Date.now()+"-"+Math.random().toString(36).slice(2,7);const item={id,title:$("titleInput").value.trim(),category:$("categoryInput").value,description:$("descriptionInput").value.trim(),tags:$("tagsInput").value.split(",").map(x=>x.trim()).filter(Boolean),fileName:file.name,size:file.size,mime:file.type,blob:file,kind:file.type.startsWith("image/")?"image":file.type.startsWith("video/")?"video":"file",date:Date.now()};try{await dbPut(item);await loadUploads();$("uploadForm").reset();$("fileName").textContent="Browse files from your device";closeModal("adminModal");setFilter("All");toast("Resource uploaded to this browser")}catch(err){console.error(err);toast("Upload failed. The file may be too large for browser storage.")}});
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));document.querySelectorAll(".modal-backdrop").forEach(b=>b.addEventListener("click",e=>{if(e.target===b)closeModal(b.id)}));
function showAdmin(){openModal("adminModal")}
$("adminBtn").onclick=showAdmin;$("ctaAdmin").onclick=showAdmin;$("searchInput").addEventListener("input",e=>{searchTerm=e.target.value.trim();renderResources()});$("searchBtn").onclick=()=>{searchTerm=$("searchInput").value.trim();renderResources();$("explore").scrollIntoView({behavior:"smooth"})};$("sortSelect").onchange=renderResources;$("filterTabs").querySelectorAll(".filter").forEach(b=>b.onclick=()=>setFilter(b.dataset.filter));$("clearFilters").onclick=()=>{searchTerm="";$("searchInput").value="";setFilter("All")};$("savedBtn").onclick=()=>{savedOnly=!savedOnly;activeFilter="All";document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter==="All"));renderResources();$("explore").scrollIntoView({behavior:"smooth"});toast(savedOnly?"Showing saved resources":"Showing all resources")};$("previewSave").onclick=()=>currentPreview&&toggleSave(currentPreview.id);$("year").textContent=new Date().getFullYear();renderCategories();loadUploads();

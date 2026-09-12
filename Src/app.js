
let DATA = [];

const $ = s => document.querySelector(s);
const norm = s => (s || "").toLocaleLowerCase("uz-UZ").replace(/[’‘ʻ`]/g,"'").trim();

function opt(sel, values){
  const base = sel.innerHTML;
  sel.innerHTML = base + [...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b,"uz")).map(v =>
    `<option value="${esc(v)}">${esc(v)}</option>`).join("");
}
function esc(s){
  return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function render(){
  const q=norm($("#q").value), t=$("#type").value, ma=$("#macro").value, mi=$("#micro").value;
  const out=DATA.filter(r=>{
    const hay=norm([r.word,r.type,r.macro,r.micro,r.meaning,r.page].join(" "));
    return (!q||hay.includes(q))&&(!t||r.type===t)&&(!ma||r.macro===ma)&&(!mi||r.micro===mi);
  });
  $("#count").textContent=out.length;
  $("#rows").innerHTML=out.map(r=>`<tr>
    <td>${r.id}</td><td>${esc(r.word)}</td><td><span class="badge">${esc(r.type)}</span></td>
    <td>${esc(r.macro)}</td><td>${esc(r.micro)}</td><td>${esc(r.meaning)}</td><td>${esc(r.page)}</td>
  </tr>`).join("");
  $("#cards").innerHTML=out.map(r=>`<article class="card">
    <h4>${esc(r.word)}</h4><span class="badge">${esc(r.type)}</span>
    <p>${esc(r.meaning)}</p>
    <div class="meta">${esc(r.macro)} · ${esc(r.micro)} · ${esc(r.page)}-sahifa</div>
  </article>`).join("");
}

async function start(){
  DATA=await fetch("data.json",{cache:"no-store"}).then(r=>{
    if(!r.ok) throw new Error("data.json topilmadi");
    return r.json();
  });
  $("#total").textContent=DATA.length;
  $("#hist").textContent=DATA.filter(r=>norm(r.type).includes("istorizm")).length;
  $("#arch").textContent=DATA.filter(r=>norm(r.type).includes("arxaizm")).length;
  $("#macros").textContent=new Set(DATA.map(r=>r.macro)).size;

  opt($("#type"),DATA.map(r=>r.type));
  opt($("#macro"),DATA.map(r=>r.macro));
  opt($("#micro"),DATA.map(r=>r.micro));

  ["q","type","macro","micro"].forEach(id=>{
    $("#"+id).addEventListener(id==="q"?"input":"change",render);
  });
  render();
}
start().catch(e=>{
  document.body.innerHTML=`<main class="wrap"><section class="hero"><h2>Ma’lumotlar yuklanmadi</h2><p>${esc(e.message)}</p></section></main>`;
});

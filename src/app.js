let DATA=[];

const $=s=>document.querySelector(s);

const norm=s=>(s||"")
  .toLocaleLowerCase("uz-UZ")
  .replace(/[’‘ʻ`]/g,"'")
  .trim();

const esc=s=>String(s??"").replace(
  /[&<>"']/g,
  c=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c])
);

/* Istorizm va Arxaizm uchun alohida rang sinfi */
const typeClass=type=>{
  const normalizedType=norm(type);

  if(normalizedType.includes("istorizm")){
    return "badge badge-history";
  }

  if(normalizedType.includes("arxaizm")){
    return "badge badge-archaic";
  }

  return "badge";
};

function opt(sel,values){
  const base=sel.innerHTML;

  sel.innerHTML=base+[...new Set(values.filter(Boolean))]
    .sort((a,b)=>a.localeCompare(b,"uz"))
    .map(v=>`<option value="${esc(v)}">${esc(v)}</option>`)
    .join("");
}

function render(){
  const q=norm($("#q").value);
  const t=$("#type").value;
  const ma=$("#macro").value;
  const mi=$("#micro").value;

  const out=DATA.filter(r=>{
    const hay=norm([
      r.headword,
      r.type,
      r.lexicalField,
      r.microfield,
      r.modernMeaning,
      r.pages
    ].join(" "));

    return(!q||hay.includes(q))&&
      (!t||r.type===t)&&
      (!ma||r.lexicalField===ma)&&
      (!mi||r.microfield===mi);
  });

  $("#count").textContent=out.length;

  $("#rows").innerHTML=out.map(r=>`
    <tr>
      <td>${r.id}</td>
      <td>${esc(r.headword)}</td>
      <td>
        <span class="${typeClass(r.type)}">
          ${esc(r.type)}
        </span>
      </td>
      <td>${esc(r.lexicalField)}</td>
      <td>${esc(r.microfield)}</td>
      <td>${esc(r.modernMeaning)}</td>
      <td>${esc(r.firstPage)}</td>
    </tr>
  `).join("");

  $("#cards").innerHTML=out.map(r=>`
    <article class="card">
      <h4>${esc(r.headword)}</h4>

      <span class="${typeClass(r.type)}">
        ${esc(r.type)}
      </span>

      <p>${esc(r.modernMeaning)}</p>

      <div class="meta">
        ${esc(r.lexicalField)} ·
        ${esc(r.microfield)} ·
        ${esc(r.firstPage)}-sahifa
      </div>
    </article>
  `).join("");
}

async function getData(){
  try{
    const response=await fetch(
      "/.netlify/functions/dictionary",
      {cache:"no-store"}
    );

    if(response.ok){
      const current=await response.json();

      if(Array.isArray(current)&&current.length){
        return current;
      }
    }
  }catch{}

  const seed=await fetch("data.json",{cache:"no-store"});

  if(!seed.ok){
    throw new Error("Lug‘at ma’lumotlari topilmadi.");
  }

  return seed.json();
}

async function start(){
  DATA=await getData();

  $("#total").textContent=DATA.length;

  $("#hist").textContent=DATA.filter(
    r=>norm(r.type).includes("istorizm")
  ).length;

  $("#arch").textContent=DATA.filter(
    r=>norm(r.type).includes("arxaizm")
  ).length;

  $("#macros").textContent=
    new Set(DATA.map(r=>r.lexicalField)).size;

  opt($("#type"),DATA.map(r=>r.type));
  opt($("#macro"),DATA.map(r=>r.lexicalField));
  opt($("#micro"),DATA.map(r=>r.microfield));

  ["q","type","macro","micro"].forEach(id=>
    $("#"+id).addEventListener(
      id==="q"?"input":"change",
      render
    )
  );

  render();
}

start().catch(e=>{
  document.body.innerHTML=`
    <main class="wrap">
      <section class="hero">
        <h2>Ma’lumotlar yuklanmadi</h2>
        <p>${esc(e.message)}</p>
      </section>
    </main>
  `;
});

let DATA=[];

const $=selector=>document.querySelector(selector);

const norm=value=>String(value??"")
  .toLocaleLowerCase("uz-UZ")
  .replace(/[’‘ʻ`]/g,"'")
  .trim();

const esc=value=>String(value??"").replace(
  /[&<>"']/g,
  character=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[character])
);

const show=value=>{
  const text=String(value??"").trim();
  return text ? esc(text) : "—";
};

const typeClass=type=>{
  const value=norm(type);

  if(value.includes("istorizm")){
    return "badge badge-history";
  }

  if(value.includes("arxaizm")){
    return "badge badge-archaic";
  }

  return "badge";
};

function addOptions(select,values){
  const firstOption=select.innerHTML;

  const options=[...new Set(values.filter(Boolean))]
    .sort((a,b)=>a.localeCompare(b,"uz"))
    .map(value=>`
      <option value="${esc(value)}">${esc(value)}</option>
    `)
    .join("");

  select.innerHTML=firstOption+options;
}

function detailRow(label,value,wide=false){
  return `
    <div class="detail-item${wide?" detail-wide":""}">
      <span>${label}</span>
      <p>${show(value)}</p>
    </div>
  `;
}

function openDetails(id){
  const item=DATA.find(entry=>String(entry.id)===String(id));

  if(!item){
    return;
  }

  $("#detailsContent").innerHTML=`
    <span class="${typeClass(item.type)}">${show(item.type)}</span>
    <h2 class="detail-title">${show(item.headword)}</h2>

    <div class="details-grid">
      ${detailRow("Hozirgi ma’nosi",item.modernMeaning,true)}
      ${detailRow("Makromaydon",item.lexicalField)}
      ${detailRow("Mikromaydon",item.microfield)}
      ${detailRow("Asardagi kontekst",item.context,true)}
      ${detailRow("Kitob qismi",item.book)}
      ${detailRow("Birinchi sahifa",item.firstPage)}
      ${detailRow("Uchrash sahifalari",item.pages,true)}
      ${detailRow("Tasniflash asosi",item.classificationBasis,true)}
      ${detailRow("Ishonchlilik",item.confidence)}
      ${detailRow("Izoh",item.note,true)}
    </div>
  `;

  $("#details").showModal();
}

function render(){
  const query=norm($("#q").value);
  const selectedType=$("#type").value;
  const selectedMacro=$("#macro").value;
  const selectedMicro=$("#micro").value;

  const output=DATA.filter(item=>{
    const searchable=norm([
      item.headword,
      item.type,
      item.lexicalField,
      item.microfield,
      item.modernMeaning,
      item.context,
      item.pages,
      item.note
    ].join(" "));

    return(!query||searchable.includes(query))&&
      (!selectedType||item.type===selectedType)&&
      (!selectedMacro||item.lexicalField===selectedMacro)&&
      (!selectedMicro||item.microfield===selectedMicro);
  });

  $("#count").textContent=output.length;

  $("#rows").innerHTML=output.map(item=>`
    <tr class="word-row" data-open="${item.id}" tabindex="0">
      <td>${show(item.id)}</td>
      <td>${show(item.headword)}</td>
      <td>
        <span class="${typeClass(item.type)}">${show(item.type)}</span>
      </td>
      <td>${show(item.lexicalField)}</td>
      <td>${show(item.microfield)}</td>
      <td>${show(item.modernMeaning)}</td>
      <td>${show(item.firstPage)}</td>
    </tr>
  `).join("");

  $("#cards").innerHTML=output.map(item=>`
    <article class="card word-card" data-open="${item.id}" tabindex="0" role="button">
      <h4>${show(item.headword)}</h4>
      <span class="${typeClass(item.type)}">${show(item.type)}</span>
      <p>${show(item.modernMeaning)}</p>
      <div class="meta">
        ${show(item.lexicalField)} ·
        ${show(item.microfield)} ·
        ${show(item.firstPage)}-sahifa
      </div>
      <div class="open-hint">Batafsil ko‘rish →</div>
    </article>
  `).join("");
}

function handleOpen(event){
  const target=event.target.closest("[data-open]");

  if(target){
    openDetails(target.dataset.open);
  }
}

function handleKeyboard(event){
  if(event.key!=="Enter"&&event.key!==" "){
    return;
  }

  const target=event.target.closest("[data-open]");

  if(target){
    event.preventDefault();
    openDetails(target.dataset.open);
  }
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
    item=>norm(item.type).includes("istorizm")
  ).length;

  $("#arch").textContent=DATA.filter(
    item=>norm(item.type).includes("arxaizm")
  ).length;

  $("#macros").textContent=
    new Set(DATA.map(item=>item.lexicalField).filter(Boolean)).size;

  addOptions($("#type"),DATA.map(item=>item.type));
  addOptions($("#macro"),DATA.map(item=>item.lexicalField));
  addOptions($("#micro"),DATA.map(item=>item.microfield));

  ["q","type","macro","micro"].forEach(id=>{
    $("#"+id).addEventListener(
      id==="q" ? "input" : "change",
      render
    );
  });

  $("#rows").addEventListener("click",handleOpen);
  $("#cards").addEventListener("click",handleOpen);
  $("#rows").addEventListener("keydown",handleKeyboard);
  $("#cards").addEventListener("keydown",handleKeyboard);

  $("#closeDetails").addEventListener("click",()=>{
    $("#details").close();
  });

  $("#details").addEventListener("click",event=>{
    if(event.target===$("#details")){
      $("#details").close();
    }
  });

  render();
}

start().catch(error=>{
  document.body.innerHTML=`
    <main class="wrap">
      <section class="hero">
        <h2>Ma’lumotlar yuklanmadi</h2>
        <p>${esc(error.message)}</p>
      </section>
    </main>
  `;
});

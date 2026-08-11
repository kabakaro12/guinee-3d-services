const $=s=>document.querySelector(s);
const API="/api";
let token=localStorage.getItem("g3d_token")||"";

const toast=t=>{
  const e=$("#toast");
  e.textContent=t;
  e.style.display="block";
  setTimeout(()=>e.style.display="none",2600);
};

async function api(path,opts={}){
  const r=await fetch(API+path,{
    ...opts,
    headers:{
      "Content-Type":"application/json",
      ...(token?{Authorization:`Bearer ${token}`}:{})
    }
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(d.error||"Erreur");
  return d;
}

const auth=$("#authDialog");
const client=$("#clientDialog");
const admin=$("#adminDialog");

document.querySelectorAll("[data-close]").forEach(b=>{
  b.onclick=()=>b.closest("dialog").close();
});

$("#registerBtn").onclick=()=>auth.showModal();

$("#accountBtn").onclick=async()=>{
  if(!token) return auth.showModal();
  await openAccount();
};

document.querySelectorAll("[data-show]").forEach(b=>{
  b.onclick=()=>{
    const reg=b.dataset.show==="register";
    $("#registerForm").hidden=!reg;
    $("#loginForm").hidden=reg;
  };
});

$("#registerForm").onsubmit=async e=>{
  e.preventDefault();
  try{
    const d=Object.fromEntries(new FormData(e.target));
    const r=await api("/register",{method:"POST",body:JSON.stringify(d)});
    token=r.token;
    localStorage.setItem("g3d_token",token);
    auth.close();
    toast("Compte créé");
    await openAccount();
  }catch(x){toast(x.message)}
};

$("#loginForm").onsubmit=async e=>{
  e.preventDefault();
  try{
    const d=Object.fromEntries(new FormData(e.target));
    const r=await api("/login",{method:"POST",body:JSON.stringify(d)});
    token=r.token;
    localStorage.setItem("g3d_token",token);
    auth.close();
    toast("Connexion réussie");
    if(r.user.role==="admin") await openAdmin();
    else await openAccount();
  }catch(x){toast(x.message)}
};

$("#requestForm").onsubmit=async e=>{
  e.preventDefault();
  if(!token) return auth.showModal();
  try{
    const d=Object.fromEntries(new FormData(e.target));
    await api("/requests",{method:"POST",body:JSON.stringify(d)});
    e.target.reset();
    toast("Demande enregistrée");
    await openAccount();
  }catch(x){toast(x.message)}
};

async function openAccount(){
  try{
    const me=await api("/me");
    if(me.user.role==="admin") return openAdmin();

    const data=await api("/requests");

    $("#clientContent").innerHTML=`
      <h2>Bonjour ${me.user.name}</h2>
      <p>${me.user.email} • ${me.user.phone}</p>
      <h3>Mes demandes</h3>
      ${data.requests.length?data.requests.map(renderRequest).join(""):"<p>Aucune demande.</p>"}
      <button class="secondary" id="logout">Se déconnecter</button>
    `;

    client.showModal();
    $("#logout").onclick=logout;
  }catch{
    logout();
    auth.showModal();
  }
}

function renderRequest(r){
  return `
    <div class="request">
      <b>${r.service}</b>
      <p>${r.location} • ${String(r.requested_date).slice(0,10)}</p>
      <p>Statut : ${r.status}</p>
      ${
        r.quote_amount
        ? `<div class="price">${Number(r.quote_amount).toLocaleString("fr-FR")} GNF</div>
           <button class="primary" onclick="pay('${r.id}','Orange Money')">Orange Money</button>
           <button class="secondary" onclick="pay('${r.id}','MTN MoMo')">MTN MoMo</button>`
        : "<small>Devis en préparation</small>"
      }
    </div>
  `;
}

window.pay=async(id,provider)=>{
  try{
    const r=await api(`/pay/${id}`,{
      method:"POST",
      body:JSON.stringify({provider})
    });
    toast(r.message||"Paiement lancé");
  }catch(x){toast(x.message)}
};

async function openAdmin(){
  try{
    const me=await api("/me");
    if(me.user.role!=="admin") throw new Error("Accès refusé");

    const data=await api("/admin/requests");

    $("#adminContent").innerHTML=`
      <h2>Administration</h2>
      <p>${data.requests.length} demande(s)</p>
      ${data.requests.map(renderAdmin).join("")}
      <button class="secondary" id="logoutAdmin">Se déconnecter</button>
    `;

    admin.showModal();
    $("#logoutAdmin").onclick=logout;
  }catch(x){toast(x.message)}
}

function renderAdmin(r){
  return `
    <div class="admin-item">
      <b>${r.service}</b>
      <p>
        ${r.customer_name}<br>
        ${r.customer_phone}<br>
        ${r.customer_email}<br>
        ${r.location} • ${String(r.requested_date).slice(0,10)}
      </p>
      <div class="admin-tools">
        <input type="number" min="0" step="1000" id="a-${r.id}" value="${r.quote_amount||""}" placeholder="Montant GNF">
        <select id="s-${r.id}">
          ${["Demande reçue","Devis en préparation","Devis prêt","Intervention planifiée","Intervention terminée"].map(s=>`<option ${s===r.status?"selected":""}>${s}</option>`).join("")}
        </select>
        <button class="primary" onclick="saveQuote('${r.id}')">Enregistrer le devis</button>
      </div>
    </div>
  `;
}

window.saveQuote=async id=>{
  try{
    const quoteAmount=$("#a-"+id).value;
    const status=$("#s-"+id).value;
    await api(`/admin/requests/${id}`,{
      method:"PATCH",
      body:JSON.stringify({quoteAmount,status})
    });
    toast("Devis mis à jour");
    await openAdmin();
  }catch(x){toast(x.message)}
};

function logout(){
  token="";
  localStorage.removeItem("g3d_token");
  client.close();
  admin.close();
  toast("Déconnecté");
}

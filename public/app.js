const $=s=>document.querySelector(s);const API='/api';let token=localStorage.getItem('g3d_token')||'';const toast=t=>{const e=$('#toast');e.textContent=t;e.style.display='block';setTimeout(()=>e.style.display='none',2500)};async function api(path,opts={}){const r=await fetch(API+path,{...opts,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Erreur');return d}

const services={
desinfection:{
 title:'Désinfection professionnelle',icon:'🧴',form:'Désinfection',
 intro:'Nous vous proposons des solutions de désinfection professionnelles avec des produits de qualité et une méthode adaptée à chaque environnement.',
 offers:['Diagnostic de la zone à traiter','Désinfection des surfaces et points de contact','Maisons, bureaux, commerces et locaux professionnels','Intervention ponctuelle ou régulière','Conseils d’hygiène après intervention'],
 equipment:[['Produits désinfectants professionnels','Adaptés au type de surface et au besoin'],['Pulvérisateurs','Pour une application homogène et maîtrisée'],['Équipements de protection','Pour sécuriser l’intervention et l’équipe']],
 steps:['Diagnostic du site','Préparation des zones','Traitement et désinfection','Contrôle et conseils'],
 reviews:['Équipe ponctuelle et intervention bien organisée.','Service sérieux et explications claires.','Bonne réactivité et suivi professionnel.']
},
desinsectisation:{
 title:'Désinsectisation',icon:'🪳',form:'Désinsectisation',
 intro:'Traitement ciblé contre les insectes nuisibles dans les habitations et locaux professionnels.',
 offers:['Cafards et blattes','Moustiques','Punaises et autres insectes','Traitement des zones sensibles','Conseils de prévention'],
 equipment:[['Produits anti-insectes adaptés','Sélectionnés selon le nuisible identifié'],['Pulvérisation ciblée','Application sur les zones utiles'],['Matériel de protection','Pour une intervention organisée']],
 steps:['Identification du nuisible','Repérage des zones touchées','Traitement ciblé','Conseils de prévention'],
 reviews:['Intervention rapide et professionnelle.','Bonne organisation du traitement.','Suivi sérieux après intervention.']
},
deratisation:{
 title:'Dératisation',icon:'🐀',form:'Dératisation',
 intro:'Prévention, contrôle et traitement de la présence de rats et souris.',
 offers:['Inspection du site','Identification des points de passage','Plan de traitement','Prévention du retour','Suivi selon les besoins'],
 equipment:[['Postes et dispositifs adaptés','Selon la configuration du site'],['Matériel de contrôle','Pour repérer les zones de passage'],['Protection des zones sensibles','Organisation sécurisée de l’intervention']],
 steps:['Inspection','Repérage des accès','Mise en place du traitement','Suivi et prévention'],
 reviews:['Diagnostic clair et professionnel.','Très bonne prise en charge.','Conseils utiles pour sécuriser les zones sensibles.']
},
nettoyage:{
 title:'Nettoyage des locaux',icon:'🧹',form:'Nettoyage des locaux',
 intro:'Prestations adaptées aux bureaux, commerces, maisons et fins de chantier.',
 offers:['Bureaux et commerces','Sols et surfaces','Maisons et appartements','Remise en état après travaux','Prestations régulières'],
 equipment:[['Produits de nettoyage adaptés','Choisis selon les surfaces'],['Matériel professionnel','Balais, raclettes, équipements adaptés'],['Organisation par zone','Pour un travail clair et efficace']],
 steps:['Évaluation des locaux','Organisation des tâches','Nettoyage complet','Contrôle final'],
 reviews:['Locaux propres et équipe organisée.','Très satisfait du nettoyage.','Travail soigné et bonne disponibilité.']
},
espaces:{
 title:'Pulvérisation des espaces verts',icon:'🌿',form:'Pulvérisation espaces verts',
 intro:'Traitement et pulvérisation des jardins, cours et espaces extérieurs.',
 offers:['Jardins et cours','Zones autour des bâtiments','Traitement ciblé','Pulvérisation des extérieurs','Programme d’entretien'],
 equipment:[['Pulvérisateurs adaptés','Pour les espaces extérieurs'],['Produits selon le besoin','Choisis en fonction de la zone'],['Équipement de protection','Pour une intervention maîtrisée']],
 steps:['Évaluation de la zone','Préparation','Pulvérisation ciblée','Conseils d’entretien'],
 reviews:['Intervention bien organisée.','Équipe sérieuse et ponctuelle.','Bonne coordination avec notre équipe.']
},
pulverisation:{
 title:'Pulvérisation professionnelle',icon:'💨',form:'Pulvérisation professionnelle',
 intro:'Solutions de pulvérisation pour entrepôts, grandes surfaces et sites professionnels.',
 offers:['Étude de la zone à traiter','Pulvérisation de surfaces étendues','Entrepôts et sites professionnels','Organisation par zones','Suivi après intervention'],
 equipment:[['Pulvérisateurs professionnels','Adaptés aux grandes surfaces'],['Produits selon le traitement','Choisis en fonction du site'],['Protection et balisage','Pour organiser l’intervention']],
 steps:['Étude du site','Préparation et balisage','Pulvérisation','Contrôle final'],
 reviews:['Bonne préparation de l’intervention.','Prestation professionnelle.','Suivi sérieux du début à la fin.']
}
};

const sd=$('#serviceDialog'),details=$('#serviceDetails');
function openService(k){
 const s=services[k];if(!s)return;
 details.innerHTML=`<div class="service-hero"><div style="font-size:2.5rem">${s.icon}</div><h2>${s.title}</h2><p>${s.intro}</p></div>
 <div class="service-body">
   <div class="detail-grid">
     <div class="detail-box"><h3>Ce que nous vous proposons</h3><ul class="checks">${s.offers.map(x=>`<li>${x}</li>`).join('')}</ul></div>
     <div class="detail-box"><h3>Pourquoi nous choisir</h3><ul class="checks"><li>Devis clair en GNF</li><li>Intervention organisée</li><li>Suivi depuis votre compte</li><li>Solutions adaptées à votre besoin</li></ul></div>
   </div>
   <h3 class="section-title-small">Nos produits & équipements</h3>
   <div class="equipment-grid">${s.equipment.map(x=>`<div class="equipment"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div>
   <h3 class="section-title-small">Notre méthode d’intervention</h3>
   <div class="steps">${s.steps.map((x,i)=>`<div class="step"><div class="step-number">${i+1}</div><b>${x}</b></div>`).join('')}</div>
   <h3 class="section-title-small">Réactions de nos clients et partenaires</h3>
   <div class="reviews">${s.reviews.map(x=>`<div class="review"><div class="stars">★★★★★</div><b>Client / partenaire</b><p>“${x}”</p><small>Exemple de présentation</small></div>`).join('')}</div>
   <p class="review-note">Ces témoignages sont des exemples de mise en page. Remplacez-les par de vrais avis lorsque vous en disposez.</p>
   <div class="detail-actions"><button class="primary" onclick="book('${s.form}')">Demander cette intervention</button><a class="secondary" href="tel:+224624033989">Appeler maintenant</a></div>
 </div>`;
 sd.showModal();
}
document.querySelectorAll('.service-card').forEach(c=>c.onclick=()=>openService(c.dataset.service));
$('#closeService').onclick=()=>sd.close();
window.book=s=>{sd.close();$('#serviceSelect').value=s;$('#reservation').scrollIntoView({behavior:'smooth'})};

const auth=$('#authDialog'),client=$('#clientDialog'),admin=$('#adminDialog');
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('#registerBtn').onclick=()=>auth.showModal();
$('#accountBtn').onclick=async()=>{if(!token)return auth.showModal();await openAccount()};
document.querySelectorAll('[data-show]').forEach(b=>b.onclick=()=>{const reg=b.dataset.show==='register';$('#registerForm').hidden=!reg;$('#loginForm').hidden=reg});
$('#registerForm').onsubmit=async e=>{e.preventDefault();try{const d=Object.fromEntries(new FormData(e.target));const r=await api('/register',{method:'POST',body:JSON.stringify(d)});token=r.token;localStorage.setItem('g3d_token',token);auth.close();toast('Compte créé');await openAccount()}catch(x){toast(x.message)}};
$('#loginForm').onsubmit=async e=>{e.preventDefault();try{const d=Object.fromEntries(new FormData(e.target));const r=await api('/login',{method:'POST',body:JSON.stringify(d)});token=r.token;localStorage.setItem('g3d_token',token);auth.close();if(r.user.role==='admin')await openAdmin();else await openAccount()}catch(x){toast(x.message)}};
$('#requestForm').onsubmit=async e=>{e.preventDefault();if(!token)return auth.showModal();try{const d=Object.fromEntries(new FormData(e.target));if(d.location==='Autre'&&d.otherLocation){d.location='Hors Conakry — '+d.otherLocation;}delete d.otherLocation;await api('/requests',{method:'POST',body:JSON.stringify(d)});e.target.reset();toast('Demande enregistrée');await openAccount()}catch(x){toast(x.message)}};
async function openAccount(){try{const me=await api('/me');if(me.user.role==='admin')return openAdmin();const data=await api('/requests');$('#clientContent').innerHTML=`<h2>Bonjour ${me.user.name}</h2><p>${me.user.email} • ${me.user.phone}</p><h3>Mes demandes</h3>${data.requests.length?data.requests.map(r=>`<div class="request"><b>${r.service}</b><p>${r.location} • ${String(r.requested_date).slice(0,10)}</p><p>Statut : ${r.status}</p>${r.quote_amount?`<div class="price">${Number(r.quote_amount).toLocaleString('fr-FR')} GNF</div><button class="primary" onclick="pay('${r.id}','Orange Money')">Orange Money</button><button class="secondary" onclick="pay('${r.id}','MTN MoMo')">MTN MoMo</button>`:'<small>Devis en préparation</small>'}<button class="secondary bon-btn" onclick="downloadBon('${encodeURIComponent(JSON.stringify(r))}')">📄 Télécharger mon bon</button></div>`).join(''):'<p>Aucune demande.</p>'}<button class="secondary" id="logout">Se déconnecter</button>`;client.showModal();$('#logout').onclick=logout}catch{logout();auth.showModal()}}
window.pay=async(id,provider)=>{try{const r=await api(`/pay/${id}`,{method:'POST',body:JSON.stringify({provider})});toast(r.message||'Paiement lancé')}catch(x){toast(x.message)}};
async function openAdmin(){try{const me=await api('/me');if(me.user.role!=='admin')throw new Error('Accès refusé');const data=await api('/admin/requests');$('#adminContent').innerHTML=`<h2>Administration</h2>${data.requests.map(r=>`<div class="admin-item"><b>${r.service}</b><p>${r.customer_name}<br>${r.customer_phone}<br>${r.customer_email}<br>${r.location}</p><div class="admin-tools"><input type="number" id="a-${r.id}" value="${r.quote_amount||''}" placeholder="Montant GNF"><select id="s-${r.id}">${['Demande reçue','Devis en préparation','Devis prêt','Intervention planifiée','Intervention terminée'].map(s=>`<option ${s===r.status?'selected':''}>${s}</option>`).join('')}</select><button class="primary" onclick="saveQuote('${r.id}')">Enregistrer le devis</button></div></div>`).join('')}<button class="secondary" id="logoutAdmin">Se déconnecter</button>`;admin.showModal();$('#logoutAdmin').onclick=logout}catch(x){toast(x.message)}}
window.saveQuote=async id=>{try{await api(`/admin/requests/${id}`,{method:'PATCH',body:JSON.stringify({quoteAmount:$('#a-'+id).value,status:$('#s-'+id).value})});toast('Devis mis à jour');await openAdmin()}catch(x){toast(x.message)}};function logout(){token='';localStorage.removeItem('g3d_token');client.close();admin.close();toast('Déconnecté')}


function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
window.downloadBon=function(encoded){
  const r=JSON.parse(decodeURIComponent(encoded));
  const amount=r.quote_amount?Number(r.quote_amount).toLocaleString('fr-FR')+' GNF':'En attente';
  const doc=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Bon d'intervention</title>
  <style>body{font-family:Arial,sans-serif;padding:40px;color:#17231c}.head{border-bottom:3px solid #0e6b3f;padding-bottom:18px;margin-bottom:25px}.brand{font-size:25px;font-weight:800;color:#0e6b3f}.box{border:1px solid #dce7df;border-radius:12px;padding:20px;margin:20px 0}.row{margin:10px 0}.amount{font-size:24px;font-weight:800;color:#0e6b3f}.foot{margin-top:40px;font-size:13px;color:#66746c}@media print{button{display:none}}</style></head>
  <body><div class="head"><div class="brand">Guinée 3D Services</div><div>Bon d'intervention / devis</div></div>
  <div class="box"><div class="row"><b>Référence :</b> ${esc(r.id)}</div><div class="row"><b>Service :</b> ${esc(r.service)}</div>
  <div class="row"><b>Lieu :</b> ${esc(r.location)}</div><div class="row"><b>Date demandée :</b> ${esc(String(r.requested_date||'').slice(0,10))}</div>
  <div class="row"><b>Statut :</b> ${esc(r.status)}</div><div class="row amount">${amount}</div></div>
  <p>Contact : +224 624 03 39 89 • 3services.gn@gmail.com</p>
  <p class="foot">© 2026 Guinée 3D Services. Tous droits réservés.</p>
  <button onclick="window.print()">Télécharger / enregistrer en PDF</button></body></html>`;
  const w=window.open('','_blank');w.document.open();w.document.write(doc);w.document.close();
  setTimeout(()=>w.print(),400);
}

const locationSelect=document.querySelector('#locationSelect');
const otherLocation=document.querySelector('#otherLocation');
if(locationSelect&&otherLocation){
  locationSelect.addEventListener('change',()=>{
    const outside=locationSelect.value==='Autre';
    otherLocation.hidden=!outside;
    otherLocation.required=outside;
    if(!outside) otherLocation.value='';
  });
}

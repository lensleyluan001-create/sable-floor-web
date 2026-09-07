if(typeof seedStaff==="function") S.users=seedStaff(S.users);
if(navigator.serviceWorker){
  navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})}).catch(function(){});
}

function wantDoor(){
  const path=(location.pathname||"/").replace(/\/+$/, "")||"/";
  const q=location.search||"";
  return path==="/login" || /[?&](door|desk|login)=/.test(q) || /(?:^|#)login/.test(location.hash||"");
}
const _draw=draw;
draw=function(){
  const root=document.getElementById("root");
  if(!root) return;
  if(!S.session&&!wantDoor()){
    location.replace("/want");
    return;
  }
  try{ _draw(); }
  catch(e){
    try{
      if(!S.session){ root.innerHTML=Gate(); hookGate(); }
    }catch(err){}
  }
  if(typeof showRoot==="function") showRoot();
  else {
    root.classList.add("is-on");
    document.body.classList.add("js-on");
    const door=document.getElementById("door");
    if(door) door.hidden=true;
  }
};

if(typeof viewPerson==="function"){
  const _viewPerson=viewPerson;
  viewPerson=function(){
    return '<button class="ghost desk-back" type="button" data-tab="todo">← Back</button>'+_viewPerson();
  };
}

if(typeof viewInvoice==="function"){
  const _viewInvoice=viewInvoice;
  viewInvoice=function(){
    return String(_viewInvoice()).replace(/\s·\s+helped by [^<]+/g,"");
  };
}

if(typeof firstMsg==="function"){
  const _firstMsg=firstMsg;
  firstMsg=function(l){
    return String(_firstMsg(l)).replace(/\b(Luan|Dylan)\b/gi,"Sable");
  };
}
if(typeof invMsg==="function"){
  const _invMsg=invMsg;
  invMsg=function(l){
    return String(_invMsg(l)).replace(/\b(Luan|Dylan)\b/gi,"Sable");
  };
}
if(typeof payMsg==="function"){
  const _payMsg=payMsg;
  payMsg=function(l){
    return String(_payMsg(l)).replace(/\b(Luan|Dylan)\b/gi,"Sable");
  };
}
if(typeof sizeMsg==="function"){
  const _sizeMsg=sizeMsg;
  sizeMsg=function(l){
    return String(_sizeMsg(l)).replace(/\b(Luan|Dylan)\b/gi,"Sable");
  };
}
if(typeof followMsg==="function"){
  const _followMsg=followMsg;
  followMsg=function(l){
    return String(_followMsg(l)).replace(/\b(Luan|Dylan)\b/gi,"Sable");
  };
}

if(!S.session) draw();
else if(typeof showRoot==="function") showRoot();
else {
  const root=document.getElementById("root");
  if(root) root.classList.add("is-on");
  document.body.classList.add("js-on");
  document.body.classList.add("has-desk");
  const door=document.getElementById("door");
  if(door) door.hidden=true;
}

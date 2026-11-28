/* Velora UI V4 — Studio, dashboard layouts, workspace templates, activity and playground.
   Loaded inside the V3 demo scope by the V4 builder. */
const vuStore={
 get(key,fallback){try{const raw=localStorage.getItem('velora-ui.v4.'+key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}},
 set(key,value){try{localStorage.setItem('velora-ui.v4.'+key,JSON.stringify(value));return true}catch{return false}}
};
const vuRoot=document.documentElement;
const vuPalettes=[['light','Light','#f1dac0','#dfebdd'],['dark','Dark','#29231b','#182c22'],['ivory','Ivory','#f7ecdb','#e5e3d8'],['mist','Mist','#e0e9f4','#dcece7']];
const vuDefaults={palette:isDark()?'dark':'light',density:'comfortable',radius:24,glass:18,alpha:.7,motion:'system'};
function vuPrefs(raw){raw=raw&&typeof raw==='object'?raw:{};return {palette:vuPalettes.some(x=>x[0]===raw.palette)?raw.palette:vuDefaults.palette,density:['compact','comfortable','spacious'].includes(raw.density)?raw.density:'comfortable',radius:[12,18,24,30].includes(raw.radius)?raw.radius:24,glass:[0,8,18,26].includes(raw.glass)?raw.glass:18,alpha:[.55,.7,.85,1].includes(raw.alpha)?raw.alpha:.7,motion:['system','subtle','off'].includes(raw.motion)?raw.motion:'system'}}
let vuSettings=vuPrefs(vuStore.get('preferences',null));
const vuReduced=matchMedia('(prefers-reduced-motion: reduce)');
function vuApply(){
 vuRoot.dataset.theme=vuSettings.palette==='dark'?'dark':'light';
 vuRoot.dataset.veloraPalette=vuSettings.palette;vuRoot.dataset.veloraDensity=vuSettings.density;vuRoot.dataset.veloraMotion=vuSettings.motion;
 vuRoot.style.setProperty('--velora-radius',vuSettings.radius+'px');vuRoot.style.setProperty('--velora-glass',vuSettings.glass+'px');vuRoot.style.setProperty('--velora-surface-alpha',vuSettings.alpha);
 RM=vuReduced.matches||vuSettings.motion==='off';
 Object.assign(TK,{exit:tok('--motion-exit'),morph:tok('--motion-morph'),count:tok('--motion-count'),chart:tok('--motion-chart'),stagger:tok('--stagger'),tilt:tok('--tilt-max')});
 setThemeIcon();if(S.route)redrawCharts();
}
function vuSavePrefs(){const saved=vuStore.set('preferences',vuSettings);vuApply();const status=$('[data-vu-status]');if(status)status.textContent=saved?'Changes saved on this device.':'Storage unavailable; changes apply for this session only.'}
function v4ToggleTheme(){vuSettings.palette=vuSettings.palette==='dark'?'light':'dark';vuSavePrefs()}
vuReduced.addEventListener('change',vuApply);
function vuOptions(values,current){return values.map(([v,l])=>'<option value="'+esc(v)+'"'+(String(v)===String(current)?' selected':'')+'>'+esc(l)+'</option>').join('')}
function vuPanel(label,content){
 const old=$('dialog.vu-panel');if(old)old.close();
 const dialog=document.createElement('dialog');dialog.className='vu-panel';dialog.setAttribute('aria-label',label);
 dialog.innerHTML='<header class="vu-heading"><div><h2>'+esc(label)+'</h2></div><button type="button" class="ib" data-vu-close aria-label="Close">'+I.x+'</button></header>'+content;
 const origin=document.activeElement;document.body.appendChild(dialog);
 dialog.querySelector('[data-vu-close]').onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close()}});
 dialog.addEventListener('close',()=>{dialog.remove();if(origin&&origin.isConnected)origin.focus({preventScroll:true})},{once:true});
 dialog.showModal();return dialog;
}
function vuStudio(){
 const d=vuPanel('Velora Studio','<p class="vu-note">Make this workspace yours. Preferences are stored on this device.</p><div data-vu-studio></div>');
 const body=d.querySelector('[data-vu-studio]');
 function renderStudio(){
 const swatches=vuPalettes.map(([id,label,a,b])=>'<button type="button" class="vu-palette" data-palette="'+id+'" aria-pressed="'+(vuSettings.palette===id)+'"><span class="vu-swatch" style="background:linear-gradient(120deg,'+a+','+b+')"><i></i><i></i><i></i></span>'+label+'</button>').join('');
 const field=(key,label,values,current)=>'<div class="vu-field"><label for="vu-pref-'+key+'">'+label+'</label><select id="vu-pref-'+key+'" data-pref="'+key+'">'+vuOptions(values,current)+'</select></div>';
 body.innerHTML='<fieldset class="vu-group"><legend>Palette</legend><div class="vu-palette-grid">'+swatches+'</div></fieldset>'+
 field('density','Density',[['compact','Compact'],['comfortable','Comfortable'],['spacious','Spacious']],vuSettings.density)+
 field('radius','Corner radius',[[12,'12 px · crisp'],[18,'18 px'],[24,'24 px · signature'],[30,'30 px · soft']],vuSettings.radius)+
 field('glass','Surface blur',[[0,'None'],[8,'Subtle'],[18,'Signature'],[26,'Deep']],vuSettings.glass)+
 field('alpha','Surface opacity',[[.55,'55%'],[.7,'70%'],[.85,'85%'],[1,'Opaque']],vuSettings.alpha)+
 field('motion','Animations',[['system','Signature · respect device preferences'],['subtle','Subtle · faster transitions'],['off','Reduced / instant']],vuSettings.motion)+
 field('rail','Sidebar',[['collapsed','Icons only'],['expanded','Always open'],['auto','Automatic']],railMode)+
 '<div class="vu-divider"></div><div class="vu-actions"><button class="btn lt" data-vu-reset>Reset appearance</button><button class="btn dk" data-vu-done>Done</button></div><p class="vu-note" role="status" data-vu-status>Changes apply immediately.</p>';
 }
 renderStudio();
 body.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.palette){vuSettings.palette=b.dataset.palette;vuSavePrefs();body.querySelectorAll('[data-palette]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.palette===vuSettings.palette)))}
 if(b.hasAttribute('data-vu-reset')){vuSettings=vuPrefs({palette:'light'});setRailMode('collapsed');vuSavePrefs();renderStudio();body.querySelector('[data-vu-reset]').focus()}
 if(b.hasAttribute('data-vu-done'))d.close();
 });
 body.addEventListener('change',e=>{const key=e.target.dataset.pref;if(!key)return;if(key==='rail')setRailMode(e.target.value);else{vuSettings=vuPrefs({...vuSettings,[key]:['radius','glass','alpha'].includes(key)?Number(e.target.value):e.target.value});vuSavePrefs()}});
}
let vuActivity=vuStore.get('activity',[]);
if(!Array.isArray(vuActivity))vuActivity=[];
vuActivity=vuActivity.filter(x=>x&&typeof x.message==='string'&&typeof x.time==='number').slice(0,80);
function vuActivityBadge(){const b=$('#bellBtn');if(b){const count=vuActivity.filter(x=>!x.read).length;b.classList.toggle('dot',count>0);b.setAttribute('aria-label',count?'Notifications, '+count+' unread':'Notifications')}}
function vuLog(message,kind='Workspace'){vuActivity.unshift({message:String(message).slice(0,200),kind,time:Date.now(),read:false});vuActivity=vuActivity.slice(0,80);vuStore.set('activity',vuActivity);vuActivityBadge()}
function vuOpenActivity(onlyUnread=false){
 const d=vuPanel('Activity center','<div class="vu-actions"><button class="btn lt" data-vu-filter>Show unread</button><button class="btn lt" data-vu-read>Mark all read</button></div><ul class="vu-feed" data-vu-feed></ul>');
 const feed=$('[data-vu-feed]',d),filter=$('[data-vu-filter]',d);
 function draw(){filter.textContent=onlyUnread?'Show all':'Show unread';filter.setAttribute('aria-pressed',String(onlyUnread));const rows=vuActivity.filter(x=>!onlyUnread||!x.read);feed.innerHTML=rows.length?rows.map(x=>'<li><div><b>'+esc(x.message)+'</b><small>'+esc(x.kind||'Workspace')+' · '+esc(new Date(x.time).toLocaleString())+(x.read?'':' · Unread')+'</small></div></li>').join(''):'<li><div>No activity to show.</div></li>'}
 filter.onclick=()=>{onlyUnread=!onlyUnread;draw()};$('[data-vu-read]',d).onclick=()=>{vuActivity.forEach(x=>x.read=true);vuStore.set('activity',vuActivity);vuActivityBadge();draw()};draw();
}
function vuMobileClose(){rail.classList.remove('vu-mobile-open');const b=$('#vuMobile');if(b)b.setAttribute('aria-expanded','false')}
function vuMobileSetup(){
 const top=$('.top'),b=document.createElement('button');b.type='button';b.id='vuMobile';b.className='ib vu-mobile';b.setAttribute('aria-label','Quick actions');b.setAttribute('aria-controls','rail');b.setAttribute('aria-expanded','false');b.innerHTML=P('<path d="M4 6h16M4 12h16M4 18h16"/>');top.prepend(b);
 b.onclick=()=>{const open=rail.classList.toggle('vu-mobile-open');b.setAttribute('aria-expanded',String(open));if(open)rail.querySelector('[data-i]').focus();else b.focus()};
 document.addEventListener('pointerdown',e=>{if(rail.classList.contains('vu-mobile-open')&&!rail.contains(e.target)&&!b.contains(e.target))vuMobileClose()});
 rail.addEventListener('click',e=>{if(e.target.closest('[data-i]'))vuMobileClose()});
 addEventListener('keydown',e=>{if(e.key==='Escape'&&rail.classList.contains('vu-mobile-open')){vuMobileClose();b.focus()}});
 addEventListener('resize',()=>{if(innerWidth>760)vuMobileClose()});
}
const vuWidgets=['rev','hot','quo','mix'],vuDefaultSpans={rev:8,hot:12,quo:4,mix:4};
function vuLayout(raw){raw=raw&&typeof raw==='object'?raw:{};const order=Array.isArray(raw.order)?raw.order.filter((x,i,a)=>vuWidgets.includes(x)&&a.indexOf(x)===i):[];const spans={};for(const id of vuWidgets)spans[id]=[4,6,8,12].includes(raw.spans?.[id])?raw.spans[id]:vuDefaultSpans[id];return {custom:raw.custom===true,order:[...order,...vuWidgets.filter(x=>!order.includes(x))],spans}}
let vuDash=vuLayout(vuStore.get('dashboard',null)),vuEdit=false;
function vuDashboard(v){
 const grid=$('.ov',v);if(!grid)return;
 const head=$('.ph',v),bar=document.createElement('div');bar.className='vu-actions';bar.style.margin='0 0 14px';
 bar.innerHTML='<button class="btn lt" data-vu-edit aria-pressed="false">Customize dashboard</button><button class="btn lt" data-vu-reset-layout hidden>Reset layout</button>';head.after(bar);
 const cards=new Map([...grid.children].map(c=>[c.style.gridArea,c]));let drag=null;
 function apply(){
 grid.classList.toggle('vu-layout',vuDash.custom);
 const order=vuDash.custom?vuDash.order:vuWidgets;
 for(const id of order){const c=cards.get(id);if(!c)continue;grid.append(c);c.style.setProperty('--vu-span',vuDash.spans[id]);c.querySelector('.vu-edit-bar')?.remove();if(!vuEdit)continue;
 const ctr=document.createElement('div');ctr.className='vu-edit-bar';ctr.innerHTML='<button type="button" draggable="true" data-vu-grip aria-label="Drag '+id+' widget">⠿ Move</button><button type="button" data-vu-move="-1" aria-label="Move widget earlier"'+(order.indexOf(id)===0?' disabled':'')+'>↑</button><button type="button" data-vu-move="1" aria-label="Move widget later"'+(order.indexOf(id)===order.length-1?' disabled':'')+'>↓</button><button type="button" data-vu-width aria-label="Change widget width">'+vuDash.spans[id]+'/12 ↔</button>';
 c.prepend(ctr);
 ctr.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.vuMove){const arr=vuDash.order,idx=arr.indexOf(id),to=idx+Number(b.dataset.vuMove);if(to>=0&&to<arr.length){[arr[idx],arr[to]]=[arr[to],arr[idx]];save();cards.get(id).querySelector('[data-vu-grip]').focus()}}if(b.hasAttribute('data-vu-width')){const sizes=[4,6,8,12];vuDash.spans[id]=sizes[(sizes.indexOf(vuDash.spans[id])+1)%4];save();cards.get(id).querySelector('[data-vu-width]').focus()}};
 ctr.querySelector('[data-vu-grip]').addEventListener('dragstart',e=>{drag=id;e.dataTransfer.setData('text/plain',id);e.dataTransfer.effectAllowed='move'});
 }
 const edit=$('[data-vu-edit]',bar);edit.textContent=vuEdit?'Finish editing':'Customize dashboard';edit.setAttribute('aria-pressed',String(vuEdit));$('[data-vu-reset-layout]',bar).hidden=!vuEdit;
 }
 function save(){vuDash.custom=true;vuStore.set('dashboard',vuDash);apply();requestAnimationFrame(()=>redrawCharts())}
 grid.addEventListener('dragover',e=>{if(!vuEdit||!drag)return;const c=e.target.closest('.card');if(c&&[...cards.values()].includes(c)){e.preventDefault();c.classList.add('vu-drop')}});
 grid.addEventListener('dragleave',e=>{const c=e.target.closest('.card');if(c&&!c.contains(e.relatedTarget))c.classList.remove('vu-drop')});
 grid.addEventListener('drop',e=>{if(!drag||!vuEdit)return;e.preventDefault();const c=e.target.closest('.card'),id=[...cards].find(x=>x[1]===c)?.[0];if(id&&id!==drag){const from=vuDash.order.indexOf(drag),to=vuDash.order.indexOf(id);vuDash.order.splice(from,1);vuDash.order.splice(to,0,drag);save()}drag=null;grid.querySelectorAll('.vu-drop').forEach(x=>x.classList.remove('vu-drop'))});
 grid.addEventListener('dragend',()=>{drag=null;grid.querySelectorAll('.vu-drop').forEach(x=>x.classList.remove('vu-drop'))});
 $('[data-vu-edit]',bar).onclick=()=>{vuEdit=!vuEdit;if(vuEdit&&!vuDash.custom){vuDash.custom=true;vuStore.set('dashboard',vuDash)}if(!vuEdit)vuLog('Dashboard layout saved','Dashboard');apply();requestAnimationFrame(()=>redrawCharts())};
 $('[data-vu-reset-layout]',bar).onclick=()=>{vuDash=vuLayout(null);vuEdit=false;vuStore.set('dashboard',vuDash);apply();requestAnimationFrame(()=>redrawCharts());$('[data-vu-edit]',bar).focus()};apply();
}
const vuProfiles={
 crm:{label:'CRM',heading:'Sales workspace',unit:'Deal',seed:[['Annual renewal','Tidewater Freight','active'],['Analytics add-on','Lumio Solar','open'],['Security review','Quillon Analytics','blocked'],['Cloud migration','Kumo Retail','done']]},
 itsm:{label:'ITSM',heading:'Service desk',unit:'Ticket',seed:[['VPN access request','Support','open'],['Network outage investigation','Network','active'],['Replacement laptop','Workplace','blocked'],['Password reset','Support','done']]},
 admin:{label:'Administration',heading:'Administration',unit:'Request',seed:[['New employee onboarding','People','active'],['Access review','Security','open'],['Policy approval','Operations','blocked'],['Quarterly review','Finance','done']]},
 monitoring:{label:'Monitoring',heading:'Infrastructure monitoring',unit:'Event',seed:[['Core switch availability','Network','done'],['Storage capacity alert','Platform','active'],['Backup verification','Operations','open'],['WAN packet loss','Network','blocked']]},
 analytics:{label:'Analytics',heading:'Analytics workspace',unit:'Report',seed:[['Conversion analysis','Growth','active'],['Monthly performance','Finance','done'],['Cohort retention','Product','open'],['Data quality check','Platform','blocked']]}
};
const vuStatus={open:'Open',active:'In progress',blocked:'Blocked',done:'Done'};
const vuColumns=[['title','Title'],['owner','Owner / team'],['status','Status'],['date','Updated']];
function vuDate(){return new Date().toISOString().slice(0,10)}
function vuData(profile){
 const raw=vuStore.get('records.'+profile,null);if(Array.isArray(raw)&&raw.every(r=>r&&typeof r.id==='string'&&typeof r.title==='string'&&typeof r.owner==='string'&&Object.hasOwn(vuStatus,r.status)&&typeof r.date==='string'))return raw;
 return vuProfiles[profile].seed.map(([title,owner,status],i)=>({id:profile+'-'+(i+1),title,owner,status,date:vuDate(),note:''}));
}
function vuView(raw){raw=raw&&typeof raw==='object'?raw:{};return {query:typeof raw.query==='string'?raw.query:'',status:Object.hasOwn(vuStatus,raw.status)?raw.status:'all',sort:vuColumns.some(x=>x[0]===raw.sort)?raw.sort:'title',desc:raw.desc===true,columns:vuColumns.filter(([k])=>k==='title'||!Array.isArray(raw.columns)||raw.columns.includes(k)).map(x=>x[0])}}
let vuProfile=new URLSearchParams(location.search).get('template')||vuStore.get('profile','crm');if(!Object.hasOwn(vuProfiles,vuProfile))vuProfile='crm';
let vuRecords=[],vuTableView=vuView(null),vuSaved=[],vuSelected='';
function vuLoadWorkspace(profile){vuProfile=profile;vuStore.set('profile',profile);vuRecords=vuData(profile);vuTableView=vuView(vuStore.get('table.'+profile,null));const raw=vuStore.get('views.'+profile,[]);vuSaved=Array.isArray(raw)?raw.filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string').slice(0,30).map(x=>({id:x.id,name:x.name,view:vuView(x.view)})):[];vuSelected=''}
function vuSaveRecords(){vuStore.set('records.'+vuProfile,vuRecords)}
function vuSaveTable(){vuStore.set('table.'+vuProfile,vuTableView)}
function vuWorkspaceHTML(){return '<section class="ph"><h1>'+title('Workspace\\nTemplates'.replace('\\n','\n'))+'</h1><p class="mute">Five domain profiles · sample data · shared component system</p></section><div class="card"><div class="vu-workspace-toolbar"><div class="vu-field"><label for="vu-profile">Template</label><select id="vu-profile">'+vuOptions(Object.entries(vuProfiles).map(([id,p])=>[id,p.label]),vuProfile)+'</select></div><button class="btn dk" data-vu-add>New record</button><button class="btn lt" data-vu-columns>Columns</button></div><h2 data-vu-workspace-title></h2><div class="vu-kpis" data-vu-kpis></div><div class="vu-workspace-toolbar"><div class="vu-field"><label for="vu-query">Search records</label><input id="vu-query" type="search" placeholder="Search title or team"></div><div class="vu-field"><label for="vu-status">Status</label><select id="vu-status">'+vuOptions([['all','All statuses'],...Object.entries(vuStatus)],'all')+'</select></div><div class="vu-field"><label for="vu-view">Saved view</label><select id="vu-view"></select></div><button class="btn lt" data-vu-save-view>Save view</button><button class="btn lt" data-vu-delete-view disabled>Delete view</button></div><p class="vu-note" role="status" data-vu-results></p><div class="tw" data-vu-table></div></div>'}
function vuInspector(record,onSave){
 const isNew=!record,r=record||{title:'',owner:'',status:'open',note:''};
 const d=vuPanel(isNew?'New '+vuProfiles[vuProfile].unit.toLowerCase():'Record details','<form data-vu-record><p class="vu-note">'+(isNew?'Create a local demo record.':'Edit the record without leaving your current view.')+'</p><div class="vu-field"><label for="vu-title">Title</label><input id="vu-title" name="title" maxlength="160" required value="'+esc(r.title)+'"></div><div class="vu-field"><label for="vu-owner">Owner / team</label><input id="vu-owner" name="owner" maxlength="100" required value="'+esc(r.owner)+'"></div><div class="vu-field"><label for="vu-edit-status">Status</label><select id="vu-edit-status" name="status">'+vuOptions(Object.entries(vuStatus),r.status)+'</select></div><div class="vu-field"><label for="vu-note">Notes</label><textarea id="vu-note" name="note" rows="5" maxlength="2000">'+esc(r.note||'')+'</textarea></div><div class="vu-actions"><button class="btn dk" type="submit">Save record</button><button class="btn lt" type="button" data-vu-cancel>Cancel</button></div></form>');
 $('[data-vu-cancel]',d).onclick=()=>d.close();
 $('form',d).onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));if(!f.title.trim()||!f.owner.trim()){toast('Title and owner are required');return}const data={...r,...f,title:f.title.trim(),owner:f.owner.trim(),id:r.id||'v-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),date:vuDate()};if(isNew)vuRecords.unshift(data);else Object.assign(record,data);vuSaveRecords();vuLog((isNew?'Created: ':'Updated: ')+data.title,vuProfiles[vuProfile].label);d.close();onSave()};
}
function vuWorkspace(v){
 vuLoadWorkspace(vuProfile);
 const query=$('#vu-query',v),status=$('#vu-status',v),viewSelect=$('#vu-view',v),table=$('[data-vu-table]',v),del=$('[data-vu-delete-view]',v);
 function views(){viewSelect.innerHTML=vuOptions([['','Current view'],...vuSaved.map(x=>[x.id,x.name])],vuSelected);del.disabled=!vuSelected}
 function draw(){
 const p=vuProfiles[vuProfile];$('[data-vu-workspace-title]',v).textContent=p.heading;
 const counts=[['Total',vuRecords.length],['In progress',vuRecords.filter(x=>x.status==='active').length],['Blocked',vuRecords.filter(x=>x.status==='blocked').length]];
 $('[data-vu-kpis]',v).innerHTML=counts.map(([l,n])=>'<div class="card vu-kpi"><small>'+l+'</small><b class="num">'+n+'</b></div>').join('');
 const q=vuTableView.query.trim().toLowerCase(),rows=vuRecords.filter(r=>(vuTableView.status==='all'||r.status===vuTableView.status)&&(!q||(r.title+' '+r.owner).toLowerCase().includes(q))).sort((a,b)=>String(a[vuTableView.sort]).localeCompare(String(b[vuTableView.sort]),undefined,{numeric:true})*(vuTableView.desc?-1:1));
 $('[data-vu-results]',v).textContent=rows.length+' of '+vuRecords.length+' records · local demonstration';
 const cols=vuColumns.filter(([k])=>vuTableView.columns.includes(k));
 table.innerHTML=rows.length?'<table class="vu-table"><thead><tr>'+cols.map(([k,l])=>'<th scope="col" aria-sort="'+(vuTableView.sort===k?(vuTableView.desc?'descending':'ascending'):'none')+'"><button data-vu-sort="'+k+'">'+esc(l)+(vuTableView.sort===k?(vuTableView.desc?' ↓':' ↑'):'')+'</button></th>').join('')+'<th scope="col">Actions</th></tr></thead><tbody>'+rows.map(r=>'<tr data-vu-record-id="'+esc(r.id)+'">'+cols.map(([k])=>'<td>'+(k==='title'?'<button class="vu-link" data-vu-inspect>'+esc(r.title)+'</button>':k==='status'?'<select data-vu-inline="status" aria-label="Status for '+esc(r.title)+'">'+vuOptions(Object.entries(vuStatus),r.status)+'</select>':k==='owner'?'<input data-vu-inline="owner" aria-label="Owner for '+esc(r.title)+'" maxlength="100" value="'+esc(r.owner)+'">':esc(r.date))+'</td>').join('')+'<td><button class="btn lt" data-vu-inspect>Edit</button></td></tr>').join('')+'</tbody></table>':'<div class="vu-empty"><strong>No matching records</strong><span>Try a different search or reset your filters.</span><button class="btn lt" data-vu-clear>Reset filters</button></div>';
 }
 function sync(){query.value=vuTableView.query;status.value=vuTableView.status;views();draw()}
 function changed(){vuSelected='';vuSaveTable();views();draw()}
 $('#vu-profile',v).onchange=e=>{vuLoadWorkspace(e.target.value);sync()};
 query.oninput=()=>{vuTableView.query=query.value;changed()};status.onchange=()=>{vuTableView.status=status.value;changed()};
 viewSelect.onchange=()=>{const item=vuSaved.find(x=>x.id===viewSelect.value);if(item){vuSelected=item.id;vuTableView=vuView(item.view);vuSaveTable();sync()}else{vuSelected='';views()}};
 $('[data-vu-add]',v).onclick=()=>vuInspector(null,draw);
 $('[data-vu-columns]',v).onclick=()=>{const d=vuPanel('Table columns','<p class="vu-note">Choose what is visible. Title always remains available.</p>'+vuColumns.map(([k,l])=>'<label class="vu-check"><input type="checkbox" value="'+k+'" '+(vuTableView.columns.includes(k)?'checked ':'')+(k==='title'?'disabled ':'')+'> '+esc(l)+'</label>').join(''));d.onchange=()=>{vuTableView.columns=vuColumns.filter(([k])=>k==='title'||$('input[value="'+k+'"]',d).checked).map(x=>x[0]);changed()}};
 $('[data-vu-save-view]',v).onclick=()=>{const d=vuPanel('Save view','<form><div class="vu-field"><label for="vu-view-name">View name</label><input id="vu-view-name" maxlength="60" required></div><button class="btn dk">Save view</button></form>');$('form',d).onsubmit=e=>{e.preventDefault();const name=$('#vu-view-name',d).value.trim();if(!name)return;const existing=vuSaved.find(x=>x.name===name);if(!existing&&vuSaved.length>=30){toast('Maximum 30 saved views');return}const id=existing?.id||'view-'+Date.now();if(existing)existing.view=vuView(vuTableView);else vuSaved.push({id,name,view:vuView(vuTableView)});vuSelected=id;vuStore.set('views.'+vuProfile,vuSaved);d.close();views();vuLog('Saved view: '+name,'Workspace')}};
 del.onclick=()=>{const item=vuSaved.find(x=>x.id===vuSelected);if(!item)return;vuSaved=vuSaved.filter(x=>x.id!==vuSelected);vuStore.set('views.'+vuProfile,vuSaved);vuSelected='';views();vuLog('Removed view: '+item.name,'Workspace')};
 table.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.vuSort){vuTableView.desc=vuTableView.sort===b.dataset.vuSort?!vuTableView.desc:false;vuTableView.sort=b.dataset.vuSort;changed();table.querySelector('[data-vu-sort="'+vuTableView.sort+'"]')?.focus()}else if(b.hasAttribute('data-vu-clear')){vuTableView.query='';vuTableView.status='all';vuSaveTable();sync();query.focus()}else if(b.hasAttribute('data-vu-inspect')){const r=vuRecords.find(x=>x.id===b.closest('tr').dataset.vuRecordId);if(r)vuInspector(r,()=>{draw();query.focus()})}});
 table.addEventListener('change',e=>{const key=e.target.dataset.vuInline;if(!key)return;const r=vuRecords.find(x=>x.id===e.target.closest('tr').dataset.vuRecordId);if(!r)return;const value=e.target.value.trim();if(!value||(key==='status'&&!Object.hasOwn(vuStatus,value))){e.target.value=r[key];return}r[key]=value;r.date=vuDate();vuSaveRecords();vuLog('Updated '+key+': '+r.title,vuProfiles[vuProfile].label);draw();const row=[...table.querySelectorAll('tr[data-vu-record-id]')].find(x=>x.dataset.vuRecordId===r.id);(row?.querySelector('[data-vu-inline="'+key+'"]')||query).focus()});sync();
}
function vuPlayground(){return '<section class="ph"><h1>'+title('Component\nPlayground')+'</h1><p class="mute">Live specimens · Core / Motion / Components</p></section><div class="vu-lab"><section class="card"><h3>Actions &amp; feedback</h3><div class="vu-actions"><button class="btn dk" data-vu-toast>Primary action</button><button class="btn lt" data-vu-studio>Appearance</button><button class="btn lt" disabled>Disabled</button></div><p class="vu-note">Primary, secondary and disabled states.</p></section><section class="card"><h3>Contextual surfaces</h3><div class="vu-actions"><button class="btn dk" data-vu-preview-panel>Open inspector</button><button class="btn lt" data-vu-preview-activity>Activity center</button></div></section><section class="card"><h3>Form controls</h3><div class="vu-field"><label for="vu-example-input">Project name</label><input id="vu-example-input" placeholder="Enter project name"></div><label class="vu-check"><input type="checkbox" checked> Enable notifications</label><div class="vu-field"><label for="vu-example-select">Status</label><select id="vu-example-select">'+vuOptions(Object.entries(vuStatus),'active')+'</select></div></section><section class="card"><h3>States &amp; loading</h3><div class="vu-actions"><button class="btn lt" data-vu-state="loading">Loading</button><button class="btn lt" data-vu-state="empty">Empty</button><button class="btn lt" data-vu-state="error">Error</button></div><div data-vu-demo-state class="vu-empty" role="status">Choose a state to preview.</div></section><section class="card"><h3>Semantic statuses</h3><div class="vu-actions">'+Object.entries(vuStatus).map(([k,l])=>'<span class="vu-status" data-status="'+k+'">'+esc(l)+'</span>').join('')+'</div><p class="vu-note">Color supplements explicit labels.</p></section><section class="card"><h3>Motion grammar</h3><div class="vu-actions"><button class="btn lt" data-vu-motion>Replay entrance</button><button class="btn lt" data-vu-motion-settings>Motion settings</button></div><div data-vu-motion-sample class="card" style="margin-top:16px">A reversible, short transition.</div></section></div>'}
function vuBindPlayground(v){
 let timer=null;function state(mode){const el=$('[data-vu-demo-state]',v);if(!el)return;clearTimeout(timer);if(mode==='loading'){el.innerHTML='<span class="vu-skeleton" style="width:90%"></span><span class="vu-skeleton" style="width:70%"></span><span class="vu-skeleton" style="width:80%"></span><span>Loading sample…</span>';timer=setTimeout(()=>{if(el.isConnected)el.textContent='Loaded successfully.'},1200)}else if(mode==='empty')el.innerHTML='<strong>Nothing here yet</strong><span>New records will appear here.</span><button class="btn lt" data-go="workspace">Explore records</button>';else el.innerHTML='<strong>Unable to load the sample</strong><span>Your other changes are safe.</span><button class="btn lt" data-vu-state="loading">Retry</button>'}
 $('.vu-lab',v).onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-vu-toast'))toast('Changes saved');if(b.hasAttribute('data-vu-studio')||b.hasAttribute('data-vu-motion-settings'))vuStudio();if(b.hasAttribute('data-vu-preview-activity'))vuOpenActivity();if(b.hasAttribute('data-vu-preview-panel'))vuPanel('Example inspector','<p class="vu-note">A focused contextual surface that preserves the current page.</p><label class="vu-check"><input type="checkbox"> Example preference</label>');if(b.dataset.vuState)state(b.dataset.vuState);if(b.hasAttribute('data-vu-motion')){const el=$('[data-vu-motion-sample]',v);el.classList.remove('vu-enter');void el.offsetWidth;el.classList.add('vu-enter')}};
}
let vuRecent=vuStore.get('commands.recent',[]);if(!Array.isArray(vuRecent))vuRecent=[];vuRecent=vuRecent.filter(x=>typeof x==='string').slice(0,6);
let vuFavorites=vuStore.get('commands.favorites',[]);if(!Array.isArray(vuFavorites))vuFavorites=[];vuFavorites=vuFavorites.filter(x=>typeof x==='string').slice(0,20);
function vuCommandActions(q){
 const actions=[['Open Velora Studio','gear',()=>vuStudio()],['Activity center','bell',()=>vuOpenActivity()],['New deal','plus',()=>openCreate('deal')],['New customer','users',()=>openCreate('customer')],['Switch light / dark','moon',()=>v4ToggleTheme()],['Workspace templates','folder',()=>nav('workspace')],['Component playground','grid',()=>nav('playground')]];
 const visible=actions.filter(x=>!q||x[0].toLowerCase().includes(q));
 const item=([label,icon,go],group)=>({g:group,h:'<span class="sq">'+(I[icon]||I.gear)+'</span>'+esc(label),star:'<button type="button" class="vu-command-star" data-vu-favorite="'+esc(label)+'" aria-label="'+(vuFavorites.includes(label)?'Remove favorite ':'Favorite ')+esc(label)+'" aria-pressed="'+vuFavorites.includes(label)+'">'+(vuFavorites.includes(label)?'★':'☆')+'</button>',go:()=>{vuRecent=[label,...vuRecent.filter(x=>x!==label)].slice(0,6);vuStore.set('commands.recent',vuRecent);go()}});
 if(q)return visible.map(x=>item(x,'Actions'));
 const pinned=visible.filter(x=>vuFavorites.includes(x[0])),recent=vuRecent.map(label=>visible.find(x=>x[0]===label)).filter(x=>x&&!vuFavorites.includes(x[0]));
 return [...pinned.map(x=>item(x,'Favorites')),...recent.map(x=>item(x,'Recent actions')),...visible.filter(x=>!pinned.includes(x)&&!recent.includes(x)).map(x=>item(x,'Actions'))];
}
function vuInstall(){
 vuApply();vuActivityBadge();vuMobileSetup();$('#bellBtn').onclick=()=>vuOpenActivity(true);$('#inboxBtn').onclick=()=>vuOpenActivity(false);
 PAGES.workspace=[vuWorkspaceHTML,vuWorkspace];PAGES.playground=[vuPlayground,vuBindPlayground];
 $('#tabs').insertAdjacentHTML('beforeend','<button data-r="workspace">Templates</button><button data-r="playground">Playground</button>');
}

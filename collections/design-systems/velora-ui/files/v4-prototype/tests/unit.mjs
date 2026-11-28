/* Node standard-library tests for the pure V4 preference and workspace contracts. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../extension.js',import.meta.url),'utf8');
const range=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert.ok(i>=0&&j>i,a);return src.slice(i,j)};
const state=range('const vuStore={','const vuRoot=');
const prefs=range('const vuPalettes=','let vuSettings=');
const layout=range('const vuWidgets=','let vuDash=');
const profiles=range('const vuProfiles=','let vuProfile=');
let fail=false;
const memory=new Map();
const storage={getItem(k){if(fail)throw Error('disabled');return memory.get(k)??null},setItem(k,v){if(fail)throw Error('disabled');memory.set(k,v)}};
const api=new Function('localStorage','isDark',state+prefs+layout+profiles+'return {vuStore,vuPrefs,vuLayout,vuView,vuData,vuProfiles,vuStatus};')(storage,()=>false);
let n=0;
function check(value,expected){assert.deepEqual(value,expected);n++}
check(api.vuPrefs(null),{palette:'light',density:'comfortable',radius:24,glass:18,alpha:.7,motion:'system'});
check(api.vuPrefs({palette:'mist',density:'compact',radius:12,glass:0,alpha:1,motion:'subtle'}),{palette:'mist',density:'compact',radius:12,glass:0,alpha:1,motion:'subtle'});
check(api.vuPrefs({palette:'bad',density:'bad',radius:-1,glass:99,alpha:5,motion:'bad'}),api.vuPrefs(null));
for(const p of ['light','dark','ivory','mist'])check(api.vuPrefs({palette:p}).palette,p);
check(api.vuStore.get('missing',42),42);
check(api.vuStore.set('test',{a:3}),true);check(api.vuStore.get('test',null),{a:3});
memory.set('velora-ui.v4.test','broken');check(api.vuStore.get('test',42),42);
fail=true;check(api.vuStore.get('test','safe'),'safe');check(api.vuStore.set('test',1),false);fail=false;
check(api.vuLayout(null),{custom:false,order:['rev','hot','quo','mix'],spans:{rev:8,hot:12,quo:4,mix:4}});
check(api.vuLayout({custom:true,order:['mix','unknown','mix','rev'],spans:{rev:6,hot:99}}),{custom:true,order:['mix','rev','hot','quo'],spans:{rev:6,hot:12,quo:4,mix:4}});
check(api.vuView(null),{query:'',status:'all',sort:'title',desc:false,columns:['title','owner','status','date']});
check(api.vuView({query:'network',status:'active',sort:'date',desc:true,columns:['status']}),{query:'network',status:'active',sort:'date',desc:true,columns:['title','status']});
check(api.vuView({query:7,status:'bad',sort:'bad',desc:'yes',columns:[]}),{query:'',status:'all',sort:'title',desc:false,columns:['title']});
for(const p of ['crm','itsm','admin','monitoring','analytics']){
 const rows=api.vuData(p);check(rows.length,4);check(new Set(rows.map(r=>r.id)).size,4);check(rows.every(r=>Object.hasOwn(api.vuStatus,r.status)),true);
 api.vuStore.set('records.'+p,[{id:'one',title:'Saved',owner:'Ops',status:'active',date:'2026-01-01'}]);check(api.vuData(p)[0].title,'Saved');
 api.vuStore.set('records.'+p,[{id:1}]);check(api.vuData(p).length,4);
}
console.log('Velora V4: '+n+' assertions passed');

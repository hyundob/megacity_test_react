const test=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const ts=require('typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/lib/hydrogen.ts'),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
const loaded={exports:{}};new Function('exports','require',compiled.outputText)(loaded.exports,()=>({CONFIG:{API_BASE_URL:'/api'}}));
const {tmToIso,addHours,historyQuery,hydrogenRequest,validateHydrogenHistory,controlLabel}=loaded.exports;
const {aggregateHydrogenChart,hydrogenChartLabel}=loaded.exports;
function chartRow(tm,production,hg,gas,duration=300) {
 return {tm,intervalStart:tmToIso(tm),intervalEnd:tmToIso(tm),durationSeconds:duration,
 normalProductionKg:production/2,drProductionKg:production/2,reducedProductionKg:0,productionKg:production,
 energyKwh:production*8.7,openingBiogasNm3:10000,refilledBiogasNm3:0,usedBiogasNm3:production*20,
 storedBiogasNm3:gas,openingHydrogenKg:0,storedHydrogenKg:hg,shippedHydrogenKg:0,tankExchanges:0,
 drSeconds:0,stopSeconds:0,reducedSeconds:0};
}
test('hour and day charts sum production but take closing inventory across tank exchanges and refills',()=>{
 const rows=[chartRow('202609102350',2,1499,2100),chartRow('202609102355',3,2,16000),chartRow('202609110000',4,6,15920)];
 const snapshot=JSON.stringify(rows);
 const grouped=aggregateHydrogenChart([...rows].reverse(),'hour');
 assert.equal(grouped.length,2);assert.equal(grouped[0].tm,'202609102300');
 assert.equal(grouped[0].productionKg,5);assert.equal(grouped[0].energyKwh,43.5);
 assert.equal(grouped[0].storedHydrogenKg,2);assert.equal(grouped[0].storedBiogasNm3,16000);
 assert.equal(grouped[0].durationSeconds,600);
 const daily=aggregateHydrogenChart(rows,'day');
 assert.equal(daily.length,2);assert.equal(daily[0].tm,'202609100000');
 assert.equal(daily[0].productionKg,5);assert.equal(daily[1].productionKg,4);
 assert.equal(hydrogenChartLabel(daily[0].tm,'day'),'2026-09-10');
 assert.deepEqual(aggregateHydrogenChart(rows,'fiveMinutes'),rows);
 assert.equal(JSON.stringify(rows),snapshot);
});
test('legacy hourly rows, zero production and missing hours are not fabricated or split',()=>{
 const rows=[chartRow('202609100000',20,20,9000,3600),chartRow('202609100100',0,20,9000),chartRow('202609100300',1,21,8980)];
 assert.equal(aggregateHydrogenChart(rows,'fiveMinutes')[0].durationSeconds,3600);
 const hourly=aggregateHydrogenChart(rows,'hour');assert.equal(hourly.length,3);assert.equal(hourly[1].productionKg,0);
 const daily=aggregateHydrogenChart(rows,'day');assert.equal(daily.length,1);assert.equal(daily[0].productionKg,21);
 assert.equal(daily[0].storedHydrogenKg,21);assert.deepEqual(aggregateHydrogenChart([],'day'),[]);
});
test('KST timestamps and date filters cross midnight correctly',()=>{
 assert.equal(addHours('202609092300',2),'2026-09-10T01:00:00');assert.throws(()=>tmToIso('202602300000'));
 const query=new URLSearchParams(historyQuery(1,'2026-09-09'));
 assert.equal(query.get('from'),'2026-09-09T00:00:00');assert.equal(query.get('to'),'2026-09-10T00:00:00');
 assert.equal(historyQuery(7),'days=7');assert.throws(()=>historyQuery(1,'2026-02-30'));
});
test('labels distinguish percent reduction from production percent',()=>{
 assert.equal(controlLabel(null),'일반 가동');assert.equal(controlLabel({type:'REDUCE',percent:90}),'생산 감소 · 90% 감소');
 assert.equal(controlLabel({type:'STOP',percent:null}),'정지');
});
test('zero stopped production is valid and bad state or numeric data is rejected',()=>{
 const state={storedBiogasNm3:10000,storedHydrogenKg:0,dailyHydrogenKg:500,gasPerKg:20,energyPerKg:8.7,maxProductionKgH:60,refillThresholdNm3:2000,refillTargetNm3:10000,tankCapacityKg:1500};
 const row={tm:'202609090000',productionKg:0,normalProductionKg:0,drProductionKg:0,reducedProductionKg:0,energyKwh:0,storedHydrogenKg:0,storedBiogasNm3:10000,refilledBiogasNm3:0,usedBiogasNm3:0,shippedHydrogenKg:0,tankExchanges:0,durationSeconds:3600,drSeconds:0,stopSeconds:3600,reducedSeconds:0};
 const data={status:{state,activeCommand:null,expectedProductionKgH:0},hours:[row],commands:[]};
 assert.equal(validateHydrogenHistory(data),data);
 assert.throws(()=>validateHydrogenHistory({...data,hours:[{...row,productionKg:null}]}));
 assert.throws(()=>validateHydrogenHistory({...data,status:{...data.status,state:{...state,tankCapacityKg:0}}}));
});
test('monitor reads automatic history without sending a control key',async t=>{
 const old=global.fetch;t.after(()=>global.fetch=old);let seen;
 global.fetch=async(url,init)=>{seen={url,init};return new Response(JSON.stringify({message:'초기화 중'}),{status:503});};
 await assert.rejects(hydrogenRequest('/history?days=1'),/초기화/);
 assert.equal(seen.url,'/api/hydrogen/history?days=1');assert.equal(seen.init.method,'GET');assert.equal(seen.init.headers,undefined);
});

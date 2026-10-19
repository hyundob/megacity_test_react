'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { aggregateHydrogenChart, hydrogenChartLabel, hydrogenChartUnits, controlLabel, historyQuery, hydrogenRequest, validateHydrogenHistory } from '@/lib/hydrogen';
import type { HydrogenHistory, HydrogenChartUnit } from '@/lib/hydrogen';
import styles from './HydrogenSimulation.module.css';
const number=(v:number,digits=2)=>v.toLocaleString('ko-KR',{maximumFractionDigits:digits});
const stamp=(s:string)=>s.replace('T',' ').slice(5,19);

export default function HydrogenSimulation() {
    const [history,setHistory]=useState<HydrogenHistory|null>(null);
    const [error,setError]=useState('');
    const [loading,setLoading]=useState(true);
    const [days,setDays]=useState(1);
    const [date,setDate]=useState('');
    const [tab,setTab]=useState<'production'|'storage'|'table'>('production');
    const [chartUnit,setChartUnit]=useState<HydrogenChartUnit>('fiveMinutes');
    const chartRows=useMemo(()=>aggregateHydrogenChart(history?.hours??[],chartUnit),[history,chartUnit]);
    const [updated,setUpdated]=useState('');
    const requestSeq=useRef(0);
    const refresh=useCallback(async(signal?:AbortSignal)=>{
        const seq=++requestSeq.current;setLoading(true);
        try {
            const data=validateHydrogenHistory(await hydrogenRequest<HydrogenHistory>(`/history?${historyQuery(days,date)}`,undefined,signal));
            if(seq!==requestSeq.current||signal?.aborted)return;
            setHistory(data);setError('');setUpdated(new Date().toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul'}));
        } catch(e) {if(seq===requestSeq.current&&!signal?.aborted)setError(e instanceof Error?e.message:'수소 이력을 불러오지 못했습니다.');}
        finally {if(seq===requestSeq.current&&!signal?.aborted)setLoading(false);}
    },[days,date]);
    useEffect(()=>{
        const controller=new AbortController();void refresh(controller.signal);
        const timer=setInterval(()=>void refresh(controller.signal),60000);
        return ()=>{controller.abort();clearInterval(timer);};
    },[refresh]);
    const state=history?.status.state;
    const rows=history?.hours??[];
    const production=rows.reduce((sum,r)=>sum+r.productionKg,0);
    const energy=rows.reduce((sum,r)=>sum+r.energyKwh,0);
    const exchanges=rows.reduce((sum,r)=>sum+r.tankExchanges,0);
    const refilled=rows.reduce((sum,r)=>sum+r.refilledBiogasNm3,0);
    return <section className={styles.root} aria-label="수소 생산 시뮬레이션">
        <div className={styles.toolbar}>
            <strong>{history?controlLabel(history.status.activeCommand):'시스템 상태 조회 중'}</strong>
            {history&&<span>지령 기준 생산 속도 {number(history.status.expectedProductionKgH,3)} kg/h</span>}
            <button onClick={()=>void refresh()} disabled={loading} aria-label="수소 새로고침"><RefreshCw size={15}/>새로고침</button>
            <span className={styles.muted}>{loading?'불러오는 중…':updated?`${updated} 조회 · KST`:''}</span>
        </div>
        {error&&<div role="alert" className={styles.error}>{error}{history&&' 이전 조회 결과를 표시합니다.'}</div>}
        {history&&!history.status.schedulingEnabled&&<p className={styles.notice}>서버의 자동 계산이 비활성화되어 있습니다.</p>}
        {state&&history&&<>
            <div className={styles.summary}>
                <Metric title="조회 기간 생산량" value={number(production)} unit="kg" sub={`기간 내 탱크 교체 ${number(exchanges,0)}회`}/>
                <Metric title="조회 기간 소비전력량" value={number(energy)} unit="kWh" sub="0.115 kg/kWh 기준"/>
                <Metric title="마지막 저장 바이오가스" value={number(state.storedBiogasNm3)} unit="Nm³" sub="마지막 계산 기준" progress={state.storedBiogasNm3/20000}/>
                <Metric title="현재 탱크 수소량" value={number(state.storedHydrogenKg)} unit="kg" sub={`마지막 계산 기준 · ${number(state.tankCapacityKg,0)} kg 도달 시 교체`} progress={state.storedHydrogenKg/state.tankCapacityKg}/>
            </div>
            <div className={styles.controls}>
                <div className={styles.tabs} role="group" aria-label="수소 그래프 선택">
                    {([['production','생산·전력'],['storage','탱크·바이오가스'],['table','5분별 표']] as const).map(([value,label])=><button key={value} aria-pressed={tab===value} onClick={()=>setTab(value)}>{label}</button>)}
                </div>
                {tab!=='table'&&<label>그래프 단위<select aria-label="그래프 단위" value={chartUnit} onChange={e=>setChartUnit(e.target.value as HydrogenChartUnit)}><option value="fiveMinutes">5분마다</option><option value="hour">시간마다</option><option value="day">하루마다</option></select></label>}
                <label>기간<select aria-label="조회 기간" value={days} onChange={e=>{setDays(Number(e.target.value));setDate('');}}><option value={1}>최근 24시간</option><option value={7}>최근 7일</option><option value={31}>최근 31일</option></select></label>
                <label>날짜 조회<input aria-label="날짜 조회" type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
                {date&&<button onClick={()=>setDate('')}>최근으로</button>}
            </div>
            <p className={styles.muted}>5분마다 자동 저장 · 다음 저장 기준 {stamp(history.status.nextSaveAt)} · {rows.length}개 저장 구간 · 조회 기간 가스 보충 {number(refilled)} Nm³</p>
            {tab!=='table'&&<p className={styles.muted}>{hydrogenChartUnits[chartUnit]} 단위 · {tab==='production'?'생산량·전력량은 구간 합계':'탱크·바이오가스는 구간 마지막 저장값'} · 선택 기간에 저장된 데이터만 반영합니다.</p>}
            {tab!=='table'&&chartUnit==='fiveMinutes'&&rows.some(r=>r.durationSeconds>300)&&<p className={styles.muted}>기존 1시간 이력은 원래 구간으로 표시합니다. 상세 구간은 표에서 확인할 수 있습니다.</p>}
            {rows.length===0?<div className={styles.empty}>선택 기간에 저장된 이력이 없습니다. 다음 5분 경계에 자동으로 표시됩니다.</div>
            :tab==='table'?<div className={styles.tableWrap}><table><caption>구간별 생산·소비 및 구간 종료 시점 재고 (한국 시간)</caption><thead><tr><th>계산 구간</th><th>구간 분</th><th>생산 kg</th><th>전력량 kWh</th><th>탱크 kg</th><th>교체 회</th><th>가스 잔량 Nm³</th><th>가스 보충 Nm³</th><th>DR / 감소 / 정지 분</th></tr></thead><tbody>{rows.map(r=><tr key={r.tm}><td>{stamp(r.intervalStart)} ~ {r.intervalEnd.slice(11,19)}</td><td>{number(r.durationSeconds/60,1)}</td><td>{number(r.productionKg,3)}</td><td>{number(r.energyKwh,3)}</td><td>{number(r.storedHydrogenKg,3)}</td><td>{r.tankExchanges}</td><td>{number(r.storedBiogasNm3,3)}</td><td>{number(r.refilledBiogasNm3,3)}</td><td>{number(r.drSeconds/60,1)} / {number(r.reducedSeconds/60,1)} / {number(r.stopSeconds/60,1)}</td></tr>)}</tbody></table></div>
            :<div className={styles.chart} role="img" aria-label={`${hydrogenChartUnits[chartUnit]} 단위 ${tab==='production'?'생산량과 소비전력량':'탱크 수소량과 바이오가스 잔량'} 그래프`}>
                <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartRows} margin={{top:16,right:14,left:12,bottom:4}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)"/>
                    <XAxis dataKey="tm" tickFormatter={value=>hydrogenChartLabel(String(value),chartUnit)} minTickGap={45} tick={{fontSize:11,fill:'var(--foreground)'}}/>
                    <YAxis yAxisId="left" width={64} domain={tab==='storage'?[0,state.tankCapacityKg]:[0,'auto']} tick={{fontSize:11,fill:'var(--foreground)'}} label={{value:'kg',position:'insideTopLeft',fill:'var(--foreground)'}}/>
                    <YAxis yAxisId="right" orientation="right" width={68} domain={tab==='storage'?[0,20000]:[0,'auto']} tick={{fontSize:11,fill:'var(--foreground)'}} label={{value:tab==='storage'?'Nm³':'kWh',position:'insideTopRight',fill:'var(--foreground)'}}/>
                    <Tooltip labelFormatter={value=>`${hydrogenChartLabel(String(value),chartUnit)} · ${hydrogenChartUnits[chartUnit]} 구간 (KST)`} formatter={value=>number(Number(value),3)} contentStyle={{background:'var(--glass-bg)',border:'1px solid var(--glass-border)',borderRadius:8,color:'var(--foreground)'}}/>
                    <Legend wrapperStyle={{fontSize:12}}/>
                    {tab==='storage'?<><Line yAxisId="left" dataKey="storedHydrogenKg" name="탱크 수소량 (kg)" stroke="#049B78" strokeWidth={3} dot={chartRows.length===1?{r:3}:false} isAnimationActive={false}/><Line yAxisId="right" dataKey="storedBiogasNm3" name="바이오가스 잔량 (Nm³)" stroke="#118AB2" strokeWidth={2} dot={chartRows.length===1?{r:3}:false} isAnimationActive={false}/></>:<><Bar yAxisId="left" dataKey="normalProductionKg" name="일반 운전 생산 (kg)" fill="#049B78" stackId="production" isAnimationActive={false}/><Bar yAxisId="left" dataKey="drProductionKg" name="부하 증가 운전 생산 (kg)" fill="#C98A00" stackId="production" isAnimationActive={false}/><Bar yAxisId="left" dataKey="reducedProductionKg" name="부하 감소 운전 생산 (kg)" fill="#8266C7" stackId="production" isAnimationActive={false}/><Line yAxisId="right" dataKey="energyKwh" name="소비전력량 (kWh)" stroke="#118AB2" strokeWidth={2} dot={chartRows.length===1?{r:3}:false} isAnimationActive={false}/></>}
                </ComposedChart></ResponsiveContainer>
            </div>}
            <details className={styles.details}><summary>수신 지령 및 계산 기준</summary>
                <p>일반 생산량 {number(state.dailyHydrogenKg/24,3)} kg/h · 바이오가스 {state.gasPerKg} Nm³/kg · 최대 생산량 {state.maxProductionKgH} kg/h. 플러스 DR 0%는 일반 운전, 100%는 최대 생산량입니다. 감소 지령은 일반 생산량에서 지정 비율만큼 줄입니다.</p>
                <p>가득 찬 탱크는 교체하고 남은 생산분은 새 탱크에 저장합니다. 날짜가 바뀌어도 재고와 계산은 이어집니다. 이 값은 시뮬레이션 결과입니다.</p>
                <p>최근 수신 지령 (최대 50건, 조회 기간과 별개)</p>
                {history.commands.length?<ul>{history.commands.map(c=><li key={c.commandId}>{stamp(c.effectiveAt)} · {controlLabel(c)} · {c.commandId}</li>)}</ul>:<p>수신 지령이 없습니다. 일반 가동 중입니다.</p>}
            </details>
        </>}
    </section>;
}
function Metric({title,value,unit,sub,progress}:{title:string;value:string;unit:string;sub:string;progress?:number}) {
    return <div className={styles.metric}><span>{title}</span><strong>{value} <small>{unit}</small></strong><span>{sub}</span>{progress!==undefined&&<progress value={progress} max={1} aria-label={title}/>}</div>;
}

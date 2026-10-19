import { CONFIG } from './config';
export type HydrogenChartUnit = 'fiveMinutes' | 'hour' | 'day';
export const hydrogenChartUnits: Record<HydrogenChartUnit,string> = {fiveMinutes:'5분',hour:'시간',day:'일'};
export function hydrogenChartLabel(tm: string, unit: HydrogenChartUnit) {
    return unit === 'day' ? tmToIso(tm).slice(0,10) : labelTm(tm);
}
export function aggregateHydrogenChart(rows: HydrogenHour[], unit: HydrogenChartUnit) {
    const sorted=[...rows].sort((a,b)=>a.tm.localeCompare(b.tm));
    const groups=new Map<string,HydrogenHour>();
    for (const row of sorted) {
        const key=unit==='day'?`${row.tm.slice(0,8)}0000`:unit==='hour'?`${row.tm.slice(0,10)}00`:row.tm;
        const current=groups.get(key);
        if (!current) { groups.set(key,{...row,tm:key}); continue; }
        for (const field of ['normalProductionKg','drProductionKg','reducedProductionKg','productionKg','energyKwh',
            'refilledBiogasNm3','usedBiogasNm3','shippedHydrogenKg','tankExchanges','durationSeconds','drSeconds','stopSeconds','reducedSeconds'] as const) {
            current[field]+=row[field];
        }
        // Inventory is the latest closing balance, never a sum or average.
        current.storedHydrogenKg=row.storedHydrogenKg;
        current.storedBiogasNm3=row.storedBiogasNm3;
        current.intervalEnd=row.intervalEnd;
    }
    return [...groups.values()];
}
export type HydrogenControlType = 'NORMAL' | 'STOP' | 'PLUS_DR' | 'REDUCE';
export interface HydrogenState {
    systemId: string; startedAt: string; cursorAt: string; storedBiogasNm3: number; storedHydrogenKg: number;
    dailyHydrogenKg: number; gasPerKg: number; energyPerKg: number; maxProductionKgH: number;
    refillThresholdNm3: number; refillTargetNm3: number; tankCapacityKg: number;
}
export interface HydrogenCommand {
    commandId: string; type: HydrogenControlType; percent: number | null; effectiveAt: string; receivedAt: string; sequence: number;
}
export interface HydrogenHour {
    tm: string; intervalStart: string; intervalEnd: string; durationSeconds: number;
    normalProductionKg: number; drProductionKg: number; reducedProductionKg: number; productionKg: number;
    energyKwh: number; openingBiogasNm3: number; refilledBiogasNm3: number; usedBiogasNm3: number; storedBiogasNm3: number;
    openingHydrogenKg: number; storedHydrogenKg: number; shippedHydrogenKg: number; tankExchanges: number;
    drSeconds: number; stopSeconds: number; reducedSeconds: number;
}
export interface HydrogenHistory {
    status: { state: HydrogenState; activeCommand: HydrogenCommand | null; expectedProductionKgH: number; nextSaveAt: string; schedulingEnabled: boolean };
    hours: HydrogenHour[]; commands: HydrogenCommand[];
}
export const controlLabels: Record<HydrogenControlType,string> = {NORMAL:'일반 가동',STOP:'정지',PLUS_DR:'플러스 DR 가동',REDUCE:'생산 감소'};
export function controlLabel(command: HydrogenCommand | null) {
    if (!command) return controlLabels.NORMAL;
    return controlLabels[command.type] + (command.percent === null ? '' : ` · ${command.percent}% ${command.type === 'REDUCE' ? '감소' : '지령률'}`);
}
export function historyQuery(days: number,date = '') {
    if (!date) return `days=${days}`;
    const from = `${date}T00:00:00`;
    const epoch = Date.parse(`${from}+09:00`);
    if (!Number.isFinite(epoch) || kstIso(epoch) !== from) throw new Error('조회 날짜를 확인하세요.');
    return new URLSearchParams({from,to:kstIso(epoch+86400000)}).toString();
}
/** API timestamps without offsets always represent Korea Standard Time. */
export function tmToIso(tm: string) {
    if (!/^\d{12}$/.test(tm)) throw new Error('수소 데이터의 시각 형식이 올바르지 않습니다.');
    const iso = `${tm.slice(0, 4)}-${tm.slice(4, 6)}-${tm.slice(6, 8)}T${tm.slice(8, 10)}:${tm.slice(10, 12)}:00`;
    const time = Date.parse(`${iso}+09:00`);
    if (!Number.isFinite(time) || kstIso(time) !== iso) throw new Error('수소 데이터의 날짜가 올바르지 않습니다.');
    return iso;
}
export function kstIso(epoch: number) { return new Date(epoch + 9 * 3600000).toISOString().slice(0, 19); }
export function addHours(tm: string, hours: number) { return kstIso(Date.parse(`${tmToIso(tm)}+09:00`) + hours * 3600000); }
export function nextKstHour() { return kstIso((Math.floor(Date.now() / 3600000) + 1) * 3600000); }
export function labelTm(tm: string) { const s = tmToIso(tm); return `${s.slice(5, 10)} ${s.slice(11, 16)}`; }
export async function hydrogenRequest<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    const controller = new AbortController();
    const cancel = () => controller.abort();
    if (signal?.aborted) cancel();
    signal?.addEventListener('abort', cancel, { once: true });
    const timeout = setTimeout(cancel, 30000);
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL.replace(/\/$/, '')}/hydrogen${path}`, {
            method: body === undefined ? 'GET' : 'POST', cache: 'no-store', signal: controller.signal,
            ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
        });
        let data;
        try { data = JSON.parse(await response.text()); }
        catch { throw new Error(response.ok ? '수소 API 응답 형식이 올바르지 않습니다.' : `수소 API 요청이 거부되었습니다 (${response.status}). 서버 연결 설정을 확인하세요.`); }
        if (!response.ok) throw new Error(data.message || `수소 API 오류 (${response.status})`);
        return data as T;
    } catch (error) {
        if (controller.signal.aborted && !signal?.aborted) throw new Error('응답 시간이 초과되었습니다. 새로고침으로 저장 결과를 확인한 뒤 재시도하세요.');
        throw error;
    } finally { clearTimeout(timeout); signal?.removeEventListener('abort', cancel); }
}

export function validateHydrogenHistory(data: HydrogenHistory): HydrogenHistory {
    if (!data?.status?.state || !Array.isArray(data.hours) || !Array.isArray(data.commands)) throw new Error('수소 응답 형식을 확인하세요.');
    const positive=(v:unknown)=>typeof v==='number' && Number.isFinite(v) && v>=0;
    const state=data.status.state;
    for (const field of ['storedBiogasNm3','storedHydrogenKg','dailyHydrogenKg','gasPerKg','energyPerKg','maxProductionKgH','refillThresholdNm3','refillTargetNm3','tankCapacityKg'] as const) {
        if (!positive(state[field])) throw new Error('수소 상태에 잘못된 수치가 있습니다.');
    }
    if (state.tankCapacityKg<=0 || state.refillTargetNm3<=state.refillThresholdNm3 || !positive(data.status.expectedProductionKgH)) throw new Error('수소 계산 설정을 확인하세요.');
    for (const row of data.hours) {
        tmToIso(row.tm);
        for (const field of ['productionKg','normalProductionKg','drProductionKg','reducedProductionKg','energyKwh','storedHydrogenKg','storedBiogasNm3','refilledBiogasNm3','usedBiogasNm3','shippedHydrogenKg','tankExchanges','durationSeconds','drSeconds','stopSeconds','reducedSeconds'] as const) {
            if (!positive(row[field])) throw new Error('수소 이력에 잘못된 수치가 있습니다.');
        }
    }
    for (const c of [...data.commands,...(data.status.activeCommand?[data.status.activeCommand]:[])]) {
        if (!Object.hasOwn(controlLabels,c.type) || (['PLUS_DR','REDUCE'].includes(c.type) && !positive(c.percent))) throw new Error('수소 지령 응답을 확인하세요.');
    }
    return data;
}

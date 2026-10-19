import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ENDPOINTS, getJejuWeatherRegionUrl } from './api';
import { fetchJson, parseKstTimestamp, validateRows } from './dashboardRequests';
import { msToHealth } from './utils';
import type { SukubOperation, ReGenPredict, DemandPredict, JejuCurtPredict, AlertItem, JejuRegion } from './types';
import { JEJU_REGIONS } from './types';

export const RESOURCE_LABELS = {
    operation: '수급 현황', history: '수급 이력', solar: '태양광 예측',
    wind: '풍력 예측', demand: '수요 예측', curt: '출력제어 예측', weather: '제주 날씨',
} as const;
export type ResourceKey = keyof typeof RESOURCE_LABELS;
export type ResourceState = { error: string | null; updatedAt: string | null; ms: number | null };
const INITIAL_STATES = Object.fromEntries(Object.keys(RESOURCE_LABELS).map(key =>
    [key, { error: null, updatedAt: null, ms: null }])) as Record<ResourceKey, ResourceState>;
const EMPTY_WEATHER = { ncstTempC: null, ncstWindMs: null, ncstWindDir: null,
    ncstPty: null, ncstPtyText: null, ncstSky: null };
type Weather = { ncstTempC: number | null; ncstWindMs: number | null; ncstWindDir: number | null;
    ncstPty: number | null; ncstPtyText: string | null; ncstSky: number | null };

export function useDashboardData() {
    const [sukubOperation, setOperation] = useState<SukubOperation | null>(null);
    const [sukubOperationToday, setHistory] = useState<SukubOperation[]>([]);
    const [reGenPredictData, setSolar] = useState<ReGenPredict[]>([]);
    const [windPredictData, setWind] = useState<ReGenPredict[]>([]);
    const [rawDemand, setDemand] = useState<DemandPredict[]>([]);
    const [jejuCurtPredictToday, setCurt] = useState<JejuCurtPredict[]>([]);
    const [weather, setWeather] = useState<Weather>(EMPTY_WEATHER);
    const [resourceStates, setResourceStates] = useState(INITIAL_STATES);
    const [lastUpdated, setLastUpdated] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [now, setNow] = useState(0);
    const [selectedJejuRegion, setSelectedJejuRegion] = useState(JEJU_REGIONS[0]);
    const regionRef = useRef(selectedJejuRegion);
    const activeRequest = useRef<AbortController | null>(null);
    const activeWeather = useRef<AbortController | null>(null);

    const loadJejuWeather = useCallback(async (region: JejuRegion) => {
        regionRef.current = region;
        activeWeather.current?.abort();
        const controller = new AbortController();
        activeWeather.current = controller;
        // Clear previous-region values immediately, including when the new request fails.
        setWeather(EMPTY_WEATHER);
        setResourceStates(previous => ({ ...previous, weather: { error: null, updatedAt: null, ms: null } }));
        try {
            const { data, ms } = await fetchJson<Record<string, unknown>>(
                getJejuWeatherRegionUrl(region.nx, region.ny), controller.signal);
            if (controller.signal.aborted) return;
            if (data.success !== true) throw new Error('기상 데이터 없음');
            const number = (key: string) => typeof data[key] === 'number' && Number.isFinite(data[key]) ? data[key] as number : null;
            setWeather({ ncstTempC: number('ncst_tempC'), ncstWindMs: number('ncst_windMs'),
                ncstWindDir: number('ncst_windDirDeg'), ncstPty: number('ncst_ptyCode'),
                ncstPtyText: typeof data.ncst_ptyText === 'string' ? data.ncst_ptyText : null,
                ncstSky: number('fcst_skyCode') });
            setResourceStates(previous => ({ ...previous, weather: { error: null, updatedAt: new Date().toISOString(), ms } }));
        } catch (error) {
            if (!controller.signal.aborted) setResourceStates(previous => ({ ...previous,
                weather: { error: error instanceof Error ? error.message : '조회 실패', updatedAt: null, ms: null } }));
        } finally {
            if (activeWeather.current === controller) activeWeather.current = null;
        }
    }, []);

    const load = useCallback(async () => {
        if (activeRequest.current) return;
        const controller = new AbortController();
        activeRequest.current = controller;
        setIsLoading(true);
        let successes = 0;
        async function request<T>(key: ResourceKey, url: string, validate: (data: unknown) => T, update: (data: T) => void) {
            try {
                const result = await fetchJson<unknown>(url, controller.signal);
                const data = validate(result.data);
                if (controller.signal.aborted) return;
                update(data);
                successes++;
                setResourceStates(previous => ({ ...previous,
                    [key]: { error: Array.isArray(data) && !data.length ? '데이터 없음' : null,
                        updatedAt: new Date().toISOString(), ms: result.ms } }));
            } catch (error) {
                if (!controller.signal.aborted) setResourceStates(previous => ({ ...previous,
                    [key]: { ...previous[key], error: error instanceof Error ? error.message : '조회 실패', ms: null } }));
            }
        }
        const operationFields = ['suppAbility', 'currPwrTot', 'renewPwrTot', 'renewPwrSolar', 'renewPwrWind'];
        const forecastFields = ['fcstQgen', 'fcstQgmx', 'fcstQgmn'];
        try {
            await Promise.allSettled([
                request('operation', ENDPOINTS.sukubOperationLatest, value => validateRows<SukubOperation>(value, 'tm', operationFields, false), setOperation),
                request('history', ENDPOINTS.sukubOperationLast24h, value => validateRows<SukubOperation[]>(value, 'tm', operationFields), setHistory),
                request('solar', ENDPOINTS.reGenPredictLatestCrtn, value => validateRows<ReGenPredict[]>(value, 'fcstTm', forecastFields), setSolar),
                request('wind', ENDPOINTS.windPredictLatestCrtn, value => validateRows<ReGenPredict[]>(value, 'fcstTm', forecastFields), setWind),
                request('demand', ENDPOINTS.demandPredictLatestCrtn, value => validateRows<DemandPredict[]>(value, 'fcstTm', forecastFields), setDemand),
                request('curt', ENDPOINTS.jejuCurtPredictLatestCrtn, value => validateRows<JejuCurtPredict[]>(value, 'fcstTm', ['fcstMinpw', 'fcstCurt']), setCurt),
                loadJejuWeather(regionRef.current),
            ]);
            if (!controller.signal.aborted && successes > 0) setLastUpdated(new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
        } finally {
            if (activeRequest.current === controller) {
                activeRequest.current = null;
                setIsLoading(false);
            }
        }
    }, [loadJejuWeather]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('dashboard-auto-refresh');
            if (saved === 'true' || saved === 'false') setAutoRefresh(saved === 'true');
        } catch { /* Storage is optional. */ }
        setIsClient(true);
        setNow(Date.now());
        const clock = setInterval(() => setNow(Date.now()), 30000);
        void load();
        return () => {
            clearInterval(clock);
            activeRequest.current?.abort();
            activeRequest.current = null;
            activeWeather.current?.abort();
            activeWeather.current = null;
        };
    }, [load]);

    useEffect(() => {
        if (!isClient) return;
        try { localStorage.setItem('dashboard-auto-refresh', String(autoRefresh)); } catch { /* optional */ }
        if (!autoRefresh) return;
        const timer = setInterval(() => void load(), 5 * 60 * 1000);
        return () => clearInterval(timer);
    }, [autoRefresh, isClient, load]);

    const demandPredict = useMemo(() => rawDemand.map(item => {
        const exact = sukubOperationToday.find(row => row.tm === item.fcstTm);
        return { ...item, currPwrTot: exact?.currPwrTot ?? null };
    }), [rawDemand, sukubOperationToday]);

    const sourceWarnings: Partial<Record<ResourceKey, string>> = {};
    if (sukubOperation && now && now - parseKstTimestamp(sukubOperation.tm) > 15 * 60 * 1000) {
        sourceWarnings.operation = '수급 기준시각이 15분 이상 지났습니다.';
    }
    for (const [key, rows] of [['solar', reGenPredictData], ['wind', windPredictData],
        ['demand', rawDemand], ['curt', jejuCurtPredictToday]] as const) {
        if (rows.length && now && rows.every(row => parseKstTimestamp(row.fcstTm) < now)) {
            sourceWarnings[key] = '예측 대상 시간이 모두 지났습니다.';
        }
    }
    const alerts: AlertItem[] = (Object.keys(RESOURCE_LABELS) as ResourceKey[]).flatMap(key => {
        const message = resourceStates[key].error || sourceWarnings[key];
        return message ? [{ id: key, icon: 'warn' as const, title: RESOURCE_LABELS[key], desc: message, ago: '현재' }] : [];
    });
    const health = (key: ResourceKey) => msToHealth(!resourceStates[key].error && resourceStates[key].ms != null, resourceStates[key].ms ?? 0);
    const apiStatus = (Object.keys(RESOURCE_LABELS) as ResourceKey[]).filter(key => key !== 'weather')
        .every(key => resourceStates[key].updatedAt && !resourceStates[key].error) ? 'ok' as const : 'error' as const;
    return {
        sukubOperation, sukubOperationToday, reGenPredictData, windPredictData, demandPredict, jejuCurtPredictToday,
        ...weather, selectedJejuRegion, setSelectedJejuRegion, loadJejuWeather,
        resourceStates, sourceWarnings, alerts, lastUpdated, apiStatus,
        dbStatus: sukubOperation && !resourceStates.operation.error && !sourceWarnings.operation ? 'ok' as const : 'error' as const,
        latApi: resourceStates.operation.ms, latDb: resourceStates.history.ms, latPredict: resourceStates.solar.ms != null && resourceStates.wind.ms != null ? Math.max(resourceStates.solar.ms, resourceStates.wind.ms) : null,
        healthApi: health('operation'), healthDb: health('history'), healthPredict: health('solar') === 'down' || health('wind') === 'down' ? 'down' as const : health('solar') === 'slow' || health('wind') === 'slow' ? 'slow' as const : 'ok' as const,
        error: alerts.length ? alerts.map(item => `${item.title}: ${item.desc}`).join(' · ') : null,
        isLoading, isClient, autoRefresh, setAutoRefresh, load,
    };
}

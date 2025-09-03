import { useEffect, useState } from 'react';
import { fetchWithTiming, ENDPOINTS } from './api';
import {
    ForecastPredict, SukubOperation, SukubOperationItem, ReGenPredict, DemandPredict, JejuCurtPredict,
    HgGenPredict, HgGenInfo, EssPoint, ServiceHealth, AlertItem
} from './types';
import { buildEssSeriesFromData, topHours, msToHealth } from './utils';

export function useDashboardData() {
    // 원본/파생 상태
    const [forecastPredict, setForecastPredict] = useState<ForecastPredict | null>(null);
    const [sukubOperation, setSukubOperation] = useState<SukubOperation | null>(null);
    const [sukubOperationToday, setSukubOperationToday] = useState<SukubOperationItem[]>([]);
    const [reGenPredictData, setReGenPredictData] = useState<ReGenPredict[]>([]);
    const [demandPredict, setDemandPredict] = useState<DemandPredict[]>([]);
    const [jejuCurtPredictToday, setJejuCurtPredictToday] = useState<JejuCurtPredict[]>([]);
    const [hgGenPredictToday, setHgGenPredictToday] = useState<HgGenPredict[]>([]);
    const [hgGenInfoToday, setHgGenInfoToday] = useState<HgGenInfo[]>([]);
    const [forecastPredictLast48h, setForecastPredictLast48h] = useState<ForecastPredict[]>([]);
    const [essSeries, setEssSeries] = useState<EssPoint[]>([]);
    const [currentSoc, setCurrentSoc] = useState<number | null>(null);
    const [bestChrgTimes, setBestChrgTimes] = useState<string[]>([]);
    const [bestDiscTimes, setBestDiscTimes] = useState<string[]>([]);
    const [hgGenUtilPct, setHgGenUtilPct] = useState<number | null>(null);
    const [hgGenLastItem, setHgGenLastItem] = useState<HgGenInfo | null>(null);

    const [lastUpdated, setLastUpdated] = useState('');
    const [apiStatus, setApiStatus] = useState<'ok' | 'error'>('error');
    const [dbStatus, setDbStatus] = useState<'ok' | 'error'>('error');

    // 시스템 상태
    const [alerts] = useState<AlertItem[]>([
        { id: 'a1', icon: 'warn', title: '태양광 발전량 급감', desc: '10분 전 - 태양광 발전량이 예측치 대비 20% 감소했습니다.', ago: '10분 전' },
        { id: 'a2', icon: 'bell', title: '전력 수요 증가', desc: '30분 전 - 전력 수요가 예측치보다 5% 증가했습니다.', ago: '30분 전' },
    ]);
    const [latApi, setLatApi] = useState<number | null>(null);
    const [latDb, setLatDb] = useState<number | null>(null);
    const [latPredict, setLatPredict] = useState<number | null>(null);
    const [healthApi, setHealthApi] = useState<ServiceHealth>('down');
    const [healthDb, setHealthDb] = useState<ServiceHealth>('down');
    const [healthPredict, setHealthPredict] = useState<ServiceHealth>('down');
    const [hgGenLatency, setHgGenLatency] = useState<number | null>(null);
    const [ncstTempC, setNcstTempC] = useState<number | null>(null);
    const [ncstWindMs, setNcstWindMs] = useState<number | null>(null);
    const [ncstWindDir, setNcstWindDir] = useState<number | null>(null);
    const [ncstPty, setNcstPty] = useState<number | null>(null);
    const [ncstPtyText, setNcstPtyText] = useState<string | null>(null);
    const [ncstSky, setNcstSky] = useState<number | null>(null);

    const load = async () => {
        const [
            forecastPredictWrap, sukubOperationWrap, reGenPredictWrap, demandPredictWrap,
            sukubOperationTodayWrap, jejuCurtPredictWrap, hgGenPredictWrap, hgGenInfoWrap,
        ] = await Promise.all([
            fetchWithTiming(ENDPOINTS.forecastPredict),
            fetchWithTiming(ENDPOINTS.sukubOperationLatest),
            fetchWithTiming(ENDPOINTS.reGenPredictChart),
            fetchWithTiming(ENDPOINTS.demandPredictToday),
            fetchWithTiming(ENDPOINTS.sukubOperationToday),
            fetchWithTiming(ENDPOINTS.jejuCurtPredictToday),
            fetchWithTiming(ENDPOINTS.hgGenPredictToday),
            fetchWithTiming(ENDPOINTS.hgGenInfoToday),
        ]);

        // ok 체크
        const ok = [
            forecastPredictWrap, sukubOperationWrap, reGenPredictWrap, demandPredictWrap,
            sukubOperationTodayWrap, jejuCurtPredictWrap, hgGenPredictWrap, hgGenInfoWrap
        ].every(w => w.res.ok);
        if (!ok) throw new Error('API 오류');

        // 파싱
        const [forecastPredictData, sukubOperationData, reGenPredict, demandPredictData, sukubOperationTodayData, jejuCurtPredictData, hgGenPredictData, hgGenInfoData] =
            await Promise.all([
                forecastPredictWrap.res.json(), sukubOperationWrap.res.json(), reGenPredictWrap.res.json(), demandPredictWrap.res.json(),
                sukubOperationTodayWrap.res.json(), jejuCurtPredictWrap.res.json(), hgGenPredictWrap.res.json(), hgGenInfoWrap.res.json()
            ]);

        // 상태 산출
        setLatApi(Number(forecastPredictWrap.ms.toFixed(0)));
        setLatDb(Number(sukubOperationWrap.ms.toFixed(0)));
        setLatPredict(Number(reGenPredictWrap.ms.toFixed(0)));
        setHealthApi(msToHealth(true, forecastPredictWrap.ms));
        setHealthDb(msToHealth(true, sukubOperationWrap.ms));
        setHealthPredict(msToHealth(true, reGenPredictWrap.ms));

        // 필터/정렬
        const hgGenPredictFilter = (hgGenPredictData as HgGenPredict[])
            .filter(d => (d.areaGrpCd ?? 'SEOUL') === 'SEOUL')
            .sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));

        const hgGenInfoFilter = (hgGenInfoData as HgGenInfo[])
            .filter(d => (d.areaGrpCd ?? 'SEOUL') === 'SEOUL')
            .sort((a, b) => a.tm.localeCompare(b.tm));

        (reGenPredict as ReGenPredict[]).sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));
        (demandPredictData as DemandPredict[]).sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));
        (jejuCurtPredictData as JejuCurtPredict[]).sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));

        // 상태 반영
        setForecastPredict(forecastPredictData as ForecastPredict);
        setSukubOperation(sukubOperationData as SukubOperation);
        setReGenPredictData(reGenPredict as ReGenPredict[]);
        setSukubOperationToday(sukubOperationTodayData as SukubOperationItem[]);
        setJejuCurtPredictToday(jejuCurtPredictData as JejuCurtPredict[]);
        setHgGenPredictToday(hgGenPredictFilter);
        setHgGenInfoToday(hgGenInfoFilter);

        // 병합
        setDemandPredict((demandPredictData as DemandPredict[]).map(item => {
            const matched = (sukubOperationTodayData as SukubOperationItem[]).find(s => s.tm.slice(8,10) === item.fcstTm.slice(8,10));
            return { ...item, currPwrTot: matched?.currPwrTot ?? null };
        }));

        // ESS 파생
        const ess = buildEssSeriesFromData(reGenPredict as ReGenPredict[]);
        setEssSeries(ess);
        const lastWithSoc = [...ess].reverse().find(p => typeof p.soc === 'number');
        setCurrentSoc(lastWithSoc?.soc ?? null);
        setBestChrgTimes(topHours(ess, 'essChrg', 3));
        setBestDiscTimes(topHours(ess, 'essDisc', 3));

        // 수소 생산(단지)
        const last = hgGenInfoFilter[hgGenInfoFilter.length - 1] ?? null;
        setHgGenLastItem(last);
        const util = last && last.hgenCapa > 0 ? Math.round((last.hgenProd / last.hgenCapa) * 100) : null;
        setHgGenUtilPct(util);
        setHgGenLatency(Number(((hgGenInfoWrap.ms) / 1000).toFixed(1)));

        setLastUpdated(new Date().toLocaleTimeString());
        setApiStatus('ok');
        setDbStatus(forecastPredictData && sukubOperationData ? 'ok' : 'error');

        // 최근 48시간 예보는 별도로 가져오되 실패해도 대시보드 렌더는 계속
        try {
            const res = await fetch(ENDPOINTS.forecastPredictLast48h);
            if (res.ok) {
                const arr = (await res.json()) as ForecastPredict[];
                const sorted = [...arr].sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));
                setForecastPredictLast48h(sorted);
            }
        } catch (_) {
            // ignore
        }

        // Weather via backend (nowcast + forecast)
        try {
            const res = await fetch(ENDPOINTS.jejuWeatherCurrent, { cache: 'no-store' });
            if (res.ok) {
                const json = await res.json();
                // NCST (실황) 데이터
                setNcstTempC(typeof json.ncst_tempC === 'number' ? json.ncst_tempC : null);
                setNcstWindMs(typeof json.ncst_windMs === 'number' ? json.ncst_windMs : null);
                setNcstWindDir(typeof json.ncst_windDirDeg === 'number' ? json.ncst_windDirDeg : null);
                setNcstPty(typeof json.ncst_ptyCode === 'number' ? json.ncst_ptyCode : null);
                setNcstPtyText(typeof json.ncst_ptyText === 'string' ? json.ncst_ptyText : null);
                // FCST (예보) 데이터 - 하늘상태
                setNcstSky(typeof json.fcst_skyCode === 'number' ? json.fcst_skyCode : null);
            }
        } catch (_) { /* ignore */ }
    };

    useEffect(() => {
        (async () => {
            try { await load(); } catch (e) { setApiStatus('error'); setDbStatus('error'); }
        })();
        const id = setInterval(load, 5 * 60 * 1000);
        return () => clearInterval(id);
    }, []);

    return {
        // 원본/파생
        forecastPredict, sukubOperation, reGenPredictData, demandPredict, jejuCurtPredictToday, hgGenPredictToday, hgGenInfoToday,
        forecastPredictLast48h,
        essSeries, currentSoc, bestChrgTimes, bestDiscTimes,
        hgGenUtilPct, hgGenLastItem,
        // 시스템/공용
        alerts, latApi, latDb, latPredict, healthApi, healthDb, healthPredict, hgGenLatency,
        ncstTempC, ncstWindMs, ncstWindDir, ncstPty, ncstPtyText, ncstSky,
        lastUpdated, apiStatus, dbStatus,
    };
}

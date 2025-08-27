import { useEffect, useState } from 'react';
import { fetchWithTiming, ENDPOINTS } from './api';
import {
    Forecast, SukubM, SukubMItem, PredictSolar, PredictDemand, Curt,
    GenToday, GemToday, EssPoint, ServiceHealth, AlertItem
} from './types';
import { buildEssSeriesFromData, topHours, msToHealth } from './utils';

export function useDashboardData() {
    // 원본/파생 상태
    const [forecast, setForecast] = useState<Forecast | null>(null);
    const [sukubM, setSukubM] = useState<SukubM | null>(null);
    const [sukubToday, setSukubToday] = useState<SukubMItem[]>([]);
    const [predictData, setPredictData] = useState<PredictSolar[]>([]);
    const [predictDemand, setPredictDemand] = useState<PredictDemand[]>([]);
    const [curtToday, setCurtToday] = useState<Curt[]>([]);
    const [genToday, setGenToday] = useState<GenToday[]>([]);
    const [gemToday, setGemToday] = useState<GemToday[]>([]);
    const [essSeries, setEssSeries] = useState<EssPoint[]>([]);
    const [currentSoc, setCurrentSoc] = useState<number | null>(null);
    const [bestChrgTimes, setBestChrgTimes] = useState<string[]>([]);
    const [bestDiscTimes, setBestDiscTimes] = useState<string[]>([]);
    const [gemUtilPct, setGemUtilPct] = useState<number | null>(null);
    const [gemLastItem, setGemLastItem] = useState<GemToday | null>(null);

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
    const [gemLatency, setGemLatency] = useState<number | null>(null);

    const load = async () => {
        const [
            forecastWrap, sukubWrap, predictWrap, demandWrap,
            sukubTodayWrap, curtWrap, genWrap, gemWrap,
        ] = await Promise.all([
            fetchWithTiming(ENDPOINTS.forecast),
            fetchWithTiming(ENDPOINTS.operationLatest),
            fetchWithTiming(ENDPOINTS.solarChart),
            fetchWithTiming(ENDPOINTS.demandToday),
            fetchWithTiming(ENDPOINTS.operationToday),
            fetchWithTiming(ENDPOINTS.curtToday),
            fetchWithTiming(ENDPOINTS.genToday),
            fetchWithTiming(ENDPOINTS.gemToday),
        ]);

        // ok 체크
        const ok = [
            forecastWrap, sukubWrap, predictWrap, demandWrap,
            sukubTodayWrap, curtWrap, genWrap, gemWrap
        ].every(w => w.res.ok);
        if (!ok) throw new Error('API 오류');

        // 파싱
        const [forecastData, sukubData, predict, predictDemandData, sukubTodayData, curtData, genData, gemData] =
            await Promise.all([
                forecastWrap.res.json(), sukubWrap.res.json(), predictWrap.res.json(), demandWrap.res.json(),
                sukubTodayWrap.res.json(), curtWrap.res.json(), genWrap.res.json(), gemWrap.res.json()
            ]);

        // 상태 산출
        setLatApi(Number(forecastWrap.ms.toFixed(0)));
        setLatDb(Number(sukubWrap.ms.toFixed(0)));
        setLatPredict(Number(predictWrap.ms.toFixed(0)));
        setHealthApi(msToHealth(true, forecastWrap.ms));
        setHealthDb(msToHealth(true, sukubWrap.ms));
        setHealthPredict(msToHealth(true, predictWrap.ms));

        // 필터/정렬
        const genFilter = (genData as GenToday[])
            .filter(d => (d.areaGrpCd ?? 'SEOUL') === 'SEOUL')
            .sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));

        const gemFilter = (gemData as GemToday[])
            .filter(d => (d.areaGrpCd ?? 'SEOUL') === 'SEOUL')
            .sort((a, b) => a.tm.localeCompare(b.tm));

        (predict as PredictSolar[]).sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));
        (predictDemandData as PredictDemand[]).sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));
        (curtData as Curt[]).sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));

        // 상태 반영
        setForecast(forecastData as Forecast);
        setSukubM(sukubData as SukubM);
        setPredictData(predict as PredictSolar[]);
        setSukubToday(sukubTodayData as SukubMItem[]);
        setCurtToday(curtData as Curt[]);
        setGenToday(genFilter);
        setGemToday(gemFilter);

        // 병합
        setPredictDemand((predictDemandData as PredictDemand[]).map(item => {
            const matched = (sukubTodayData as SukubMItem[]).find(s => s.tm.slice(8,10) === item.fcstTm.slice(8,10));
            return { ...item, currPwrTot: matched?.currPwrTot ?? null };
        }));

        // ESS 파생
        const ess = buildEssSeriesFromData(predict as PredictSolar[]);
        setEssSeries(ess);
        const lastWithSoc = [...ess].reverse().find(p => typeof p.soc === 'number');
        setCurrentSoc(lastWithSoc?.soc ?? null);
        setBestChrgTimes(topHours(ess, 'essChrg', 3));
        setBestDiscTimes(topHours(ess, 'essDisc', 3));

        // 수소 생산(단지)
        const last = gemFilter[gemFilter.length - 1] ?? null;
        setGemLastItem(last);
        const util = last && last.hgenCapa > 0 ? Math.round((last.hgenProd / last.hgenCapa) * 100) : null;
        setGemUtilPct(util);
        setGemLatency(Number(((gemWrap.ms) / 1000).toFixed(1)));

        setLastUpdated(new Date().toLocaleTimeString());
        setApiStatus('ok');
        setDbStatus(forecastData && sukubData ? 'ok' : 'error');
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
        forecast, sukubM, predictData, predictDemand, curtToday, genToday, gemToday,
        essSeries, currentSoc, bestChrgTimes, bestDiscTimes,
        gemUtilPct, gemLastItem,
        // 시스템/공용
        alerts, latApi, latDb, latPredict, healthApi, healthDb, healthPredict, gemLatency,
        lastUpdated, apiStatus, dbStatus,
    };
}

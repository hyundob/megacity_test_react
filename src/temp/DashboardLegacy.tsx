'use client';

import React, { useEffect, useState } from 'react';
import { Circle } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
    AreaChart,
    Area,
} from 'recharts';
import '../app/globals.css';

// ===== 타입 =====
type Forecast = {
    crtnTm: string;
    fcstTm: string;
    fcstSrad: number;
    fcstTemp: number;
    fcstHumi: number;
    fcstWspd: number;
    fcstPsfc: number;
};

type SukubM = {
    tm: string;
    suppAbility: number;
    currPwrTot: number;
    renewPwrTot: number;
    renewPwrSolar: number;
    renewPwrWind: number;
};

type SukubMItem = {
    tm: string;
    suppAbility: number;
    currPwrTot: number;
    renewPwrTot: number;
    renewPwrSolar: number;
    renewPwrWind: number;
};

type PredictSolar = {
    fcstTm: string;
    fcstQgen: number;
    fcstQgmx: number;
    fcstQgmn: number;
    essChrg: number; // MWh
    essDisc: number; // MWh
    essCapa: number; // MW
};

type PredictDemand = {
    crtnTm: string;
    fcstTm: string;
    fcstQgen: number;
    fcstQgmx: number;
    fcstQgmn: number;
    currPwrTot?: number | null; // 병합 후 추가
};

type EssPoint = {
    hour: string;
    essChrg: number; // MWh
    essDisc: number; // MWh
    essCapa: number; // MW
    soc?: number;    // 즉시식 SoC(%): (essChrg/essCapa)*100. capa=0이면 undefined
};

type Curt = {
    fcstTm: string;
    fcstMinpw: number;
    fcstCurt: number;
};

type GenToday = {
    areaGrpCd: string;
    fcstTm: string;
    fcstQgen: number;
    fcstCapa: number;
};

type GemToday = {
    areaGrpCd: string;
    tm: string;
    hgenProd: number;
    hgenCapa: number;
};

// ===== 시스템 상태용 타입 & 유틸 =====
type ServiceHealth = 'ok' | 'slow' | 'down';
const msToHealth = (ok: boolean, ms: number): ServiceHealth => {
    if (!ok) return 'down';
    if (ms <= 200) return 'ok';
    if (ms <= 800) return 'slow';
    return 'down';
};
const healthText = (h: ServiceHealth) =>
    h === 'ok' ? '정상' : h === 'slow' ? '지연' : '장애';
const healthDot = (h: ServiceHealth) =>
    h === 'ok' ? 'bg-green-500' : h === 'slow' ? 'bg-yellow-500' : 'bg-red-500';

// 요청시간 측정 래퍼
async function fetchWithTiming(url: string) {
    const t0 = performance.now();
    const res = await fetch(url);
    const t1 = performance.now();
    return { res, ms: t1 - t0 };
}

// ===== 실시간 알림(예제) 타입 =====
type AlertItem = { id: string; icon: 'warn' | 'bell'; title: string; desc: string; ago: string; };

// SoC 표기 포맷: 값 없으면 --%
const formatSoc = (v: number | null | undefined) =>
    typeof v === 'number' && !Number.isNaN(v) ? `${v}%` : '--%';

// SoC 즉시 계산(각 시간대별): soc = (essChrg / essCapa) * 100
function buildEssSeriesFromData(arr: PredictSolar[]): EssPoint[] {
    if (!arr.length) return [];
    const sorted = [...arr].sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));
    return sorted.map(p => {
        const capa = p.essCapa ?? 0;
        const ch = p.essChrg ?? 0;
        const soc = capa > 0 ? Math.round((ch / capa) * 100) : undefined;
        return {
            hour: p.fcstTm.slice(8, 10) + ':00',
            essChrg: ch,
            essDisc: p.essDisc ?? 0,
            essCapa: capa,
            soc,
        };
    });
}

function topHours(arr: EssPoint[], key: 'essChrg' | 'essDisc', k = 3): string[] {
    return [...arr]
        .sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0))
        .slice(0, k)
        .map(p => p.hour);
}

export default function Dashboard() {
    const [forecast, setForecast] = useState<Forecast | null>(null);
    const [sukubM, setSukubM] = useState<SukubM | null>(null);
    const [predictData, setPredictData] = useState<PredictSolar[]>([]);
    const [lastUpdated, setLastUpdated] = useState('');
    const [apiStatus, setApiStatus] = useState<'ok' | 'error'>('error');
    const [dbStatus, setDbStatus] = useState<'ok' | 'error'>('error');
    const [predictDemand, setPredictDemand] = useState<PredictDemand[]>([]);
    const [curtToday, setCurtToday] = useState<Curt[]>([]);
    const [genToday, setGenToday] = useState<GenToday[]>([]);

    // ESS 파생 상태
    const [essSeries, setEssSeries] = useState<EssPoint[]>([]);
    const [currentSoc, setCurrentSoc] = useState<number | null>(null);
    const [bestChrgTimes, setBestChrgTimes] = useState<string[]>([]);
    const [bestDiscTimes, setBestDiscTimes] = useState<string[]>([]);

    // 수소 생산량 정보(발전단지)
    const [gemToday, setGemToday] = useState<GemToday[]>([]);
    const [gemUtilPct, setGemUtilPct] = useState<number | null>(null);
    const [gemLastItem, setGemLastItem] = useState<GemToday | null>(null);
    const [gemLatency, setGemLatency] = useState<number | null>(null); // 초 단위

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

    const formatTime = (raw: string) =>
        `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)} ${raw.slice(8, 10)}:${raw.slice(10, 12)}`;

    const getStatusColor = (status: 'ok' | 'error') => (status === 'ok' ? 'green' : 'red');

    const loadData = async () => {
        try {
            // 각 엔드포인트별로 시간 측정
            const [
                forecastWrap,
                sukubWrap,
                predictWrap,
                demandWrap,
                sukubTodayWrap,
                curtWrap,
                genWrap,
                gemWrap,
            ] = await Promise.all([
                fetchWithTiming('http://210.222.202.14:18080/api/forecast-predict/latest'),   // API 서버 헬스에 사용
                fetchWithTiming('http://210.222.202.14:18080/api/sukub-operation/latest'), // DB 헬스 대표
                fetchWithTiming('http://210.222.202.14:18080/api/re-gen-predict/chart'),   // 예측 엔진 헬스
                fetchWithTiming('http://210.222.202.14:18080/api/demand-predict/today'),
                fetchWithTiming('http://210.222.202.14:18080/api/sukub-operation/today'),
                fetchWithTiming('http://210.222.202.14:18080/api/jeju-curt-predict/today'),
                fetchWithTiming('http://210.222.202.14:18080/api/hg-gen-predict/today'),
                fetchWithTiming('http://210.222.202.14:18080/api/hg-gen-info/today'),
            ]);

            if (
                !forecastWrap.res.ok || !sukubWrap.res.ok || !predictWrap.res.ok ||
                !demandWrap.res.ok || !sukubTodayWrap.res.ok || !curtWrap.res.ok ||
                !genWrap.res.ok || !gemWrap.res.ok
            ) throw new Error('API 오류');

            // 파싱
            const forecastData: Forecast = await forecastWrap.res.json();
            const sukubData: SukubM = await sukubWrap.res.json();
            const sukubTodayData: SukubMItem[] = await sukubTodayWrap.res.json();
            const predict: PredictSolar[] = await predictWrap.res.json();
            const predictDemandData: PredictDemand[] = await demandWrap.res.json();
            const curtData: Curt[] = await curtWrap.res.json();
            const genData: GenToday[] = await genWrap.res.json();
            const gemData: GemToday[] = await gemWrap.res.json();

            // 시스템 상태 산출
            setLatApi(Number(forecastWrap.ms.toFixed(2)));
            setLatDb(Number(sukubWrap.ms.toFixed(2)));
            setLatPredict(Number(predictWrap.ms.toFixed(2)));
            setHealthApi(msToHealth(true, forecastWrap.ms));
            setHealthDb(msToHealth(true, sukubWrap.ms));
            setHealthPredict(msToHealth(true, predictWrap.ms));

            // 필터/정렬
            const genFilter = genData
                .filter(d => (d.areaGrpCd ?? 'SEOUL') === 'SEOUL')
                .sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));

            const gemFilter = gemData
                .filter(d => (d.areaGrpCd ?? 'SEOUL') === 'SEOUL')
                .sort((a, b) => a.tm.localeCompare(b.tm));

            predict.sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));
            predictDemandData.sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));
            curtData.sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));

            // 상태 반영
            setForecast(forecastData);
            setSukubM(sukubData);
            setPredictData(predict);
            setCurtToday(curtData);
            setGenToday(genFilter);
            setGemToday(gemFilter);

            // 수요예측 + 실제수요 병합
            const merged = predictDemandData.map(item => {
                const matched = sukubTodayData.find(s => s.tm.slice(8, 10) === item.fcstTm.slice(8, 10));
                return { ...item, currPwrTot: matched?.currPwrTot ?? null };
            });
            setPredictDemand(merged);

            // ESS 파생
            const ess = buildEssSeriesFromData(predict);
            setEssSeries(ess);
            const lastWithSoc = [...ess].reverse().find(p => typeof p.soc === 'number');
            setCurrentSoc(lastWithSoc?.soc ?? null);
            setBestChrgTimes(topHours(ess, 'essChrg', 3));
            setBestDiscTimes(topHours(ess, 'essDisc', 3));

            // 수소 생산(단지) 카드용
            const last = gemFilter[gemFilter.length - 1] ?? null;
            setGemLastItem(last);
            const util = last && last.hgenCapa > 0 ? Math.round((last.hgenProd / last.hgenCapa) * 100) : null;
            setGemUtilPct(util);
            setGemLatency(Number(((gemWrap.ms) / 1000).toFixed(2)));

            setLastUpdated(new Date().toLocaleTimeString());
            setApiStatus('ok');
            setDbStatus(forecastData && sukubData ? 'ok' : 'error');
        } catch (err) {
            console.error(err);
            setApiStatus('error');
            setDbStatus('error');
            setHealthApi('down');
            setHealthDb('down');
            setHealthPredict('down');
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4">
            {/* 상단 상태 바 */}
            <div className="bg-gray-100 rounded shadow p-4 flex items-center justify-start gap-6 mb-4">
                <div>⏱ 마지막 업데이트: <strong>{lastUpdated || '로딩 중...'}</strong></div>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-1">
                        <Circle size={14} color={getStatusColor(apiStatus)} fill={getStatusColor(apiStatus)} />
                        <span>API</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Circle size={14} color={getStatusColor(dbStatus)} fill={getStatusColor(dbStatus)} />
                        <span>DB</span>
                    </div>
                </div>
            </div>

            {/* 2열 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 실시간 알림 (예제) - 전체폭 */}
                <div className="p-6 bg-white rounded-2xl shadow-md md:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-gray-800">실시간 알림</h2>
                        <div className="flex items-center gap-2 text-gray-400">
                            <button className="hover:text-gray-600" title="확대">⤢</button>
                            <button className="hover:text-gray-600" title="더보기">⋯</button>
                        </div>
                    </div>
                    <div className="space-y-3 max-h-40 overflow-auto pr-2">
                        {alerts.map(a => (
                            <div key={a.id} className="flex items-start gap-3 p-3 border rounded-xl">
                                <div className="mt-0.5">{a.icon === 'warn' ? '⚠️' : '🔔'}</div>
                                <div className="flex-1">
                                    <div className="font-semibold">{a.title}</div>
                                    <div className="text-sm text-gray-600">{a.desc}</div>
                                </div>
                                <div className="text-xs text-gray-500 whitespace-nowrap">{a.ago}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 시스템 상태 - 전체폭 */}
                <div className="p-6 bg-white rounded-2xl shadow-md md:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-gray-800">시스템 상태</h2>
                        <div className="flex items-center gap-2 text-gray-400">
                            <button className="hover:text-gray-600" title="확대">⤢</button>
                            <button className="hover:text-gray-600" title="더보기">⋯</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* API 서버 */}
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${healthDot(healthApi)}`} />
                                <span className="text-gray-800">API 서버</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">{latApi !== null ? `${latApi}ms` : '—'}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border
                  ${healthApi==='ok' ? 'bg-green-50 text-green-700 border-green-200' :
                                    healthApi==='slow' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        'bg-red-50 text-red-700 border-red-200'}`}>
                  {healthText(healthApi)}
                </span>
                            </div>
                        </div>
                        {/* 데이터베이스 */}
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${healthDot(healthDb)}`} />
                                <span className="text-gray-800">데이터베이스</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">{latDb !== null ? `${latDb}ms` : '—'}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border
                  ${healthDb==='ok' ? 'bg-green-50 text-green-700 border-green-200' :
                                    healthDb==='slow' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        'bg-red-50 text-red-700 border-red-200'}`}>
                  {healthText(healthDb)}
                </span>
                            </div>
                        </div>
                        {/* 예측 엔진 */}
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${healthDot(healthPredict)}`} />
                                <span className="text-gray-800">예측 엔진</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">{latPredict !== null ? `${latPredict}ms` : '—'}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border
                  ${healthPredict==='ok' ? 'bg-green-50 text-green-700 border-green-200' :
                                    healthPredict==='slow' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        'bg-red-50 text-red-700 border-red-200'}`}>
                  {healthText(healthPredict)}
                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 이하 기존 카드들 */}
                {forecast && (
                    <div className="p-4 bg-white rounded shadow">
                        <h2 className="text-lg font-semibold mb-2">기상 예보 정보</h2>
                        <p>생성시간: {formatTime(forecast.crtnTm)}</p>
                        <p>예측시간: {formatTime(forecast.fcstTm)}</p>
                        <p>일사량: {forecast.fcstSrad}</p>
                        <p>기온: {forecast.fcstTemp} °C</p>
                        <p>습도: {forecast.fcstHumi} %</p>
                        <p>풍속: {forecast.fcstWspd} m/s</p>
                        <p>기압: {forecast.fcstPsfc} hPa</p>
                    </div>
                )}

                {sukubM && (
                    <div className="p-4 bg-white rounded shadow">
                        <h2 className="text-lg font-semibold mb-2">제주 계통 운영 정보</h2>
                        <p>기준시각: {formatTime(sukubM.tm)}</p>
                        <p>공급능력: {sukubM.suppAbility} MW</p>
                        <p>현재수요: {sukubM.currPwrTot} MW</p>
                        <p>신재생합계: {sukubM.renewPwrTot} MW</p>
                        <p>태양광합계: {sukubM.renewPwrSolar} MW</p>
                        <p>풍력합계: {sukubM.renewPwrWind} MW</p>
                    </div>
                )}

                <div className="p-6 bg-white rounded-2xl shadow-md">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">태양광 발전 예측 차트</h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart
                            data={predictData.map(item => ({ ...item, hour: item.fcstTm.slice(8, 10) + ':00' }))}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                            <YAxis unit=" MWh" tick={{ fontSize: 12 }} />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                                labelStyle={{ fontWeight: 'bold', color: '#6b7280' }}
                                itemStyle={{ fontSize: 13 }}
                            />
                            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
                            <Line type="monotone" dataKey="fcstQgen" name="최종 발전량" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} isAnimationActive />
                            <Line type="monotone" dataKey="fcstQgmx" name="최대 예측" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive />
                            <Line type="monotone" dataKey="fcstQgmn" name="최소 예측" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {predictDemand.length > 0 && (
                    <div className="p-6 bg-white rounded-2xl shadow-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">수요 추이 예측 차트</h2>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart
                                data={predictDemand.map(item => ({ ...item, hour: item.fcstTm.slice(8, 10) + ':00' }))}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                                <YAxis unit=" MW" tick={{ fontSize: 12 }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                                    labelStyle={{ fontWeight: 'bold', color: '#6b7280' }}
                                    itemStyle={{ fontSize: 13 }}
                                />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
                                <Line type="monotone" dataKey="fcstQgen" name="최종 수요예측" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} isAnimationActive />
                                <Line type="monotone" dataKey="fcstQgmx" name="수요예측 최대" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive />
                                <Line type="monotone" dataKey="fcstQgmn" name="수요예측 최소" stroke="#14b8a6" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive />
                                <Line type="monotone" dataKey="currPwrTot" name="실제 수요" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {essSeries.length > 0 && (
                    <div className="p-6 bg-white rounded-2xl shadow-md">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-gray-800">ESS 운영 전략</h2>
                            <div className="text-sm">현재 SoC : <span className="font-semibold">{formatSoc(currentSoc)}</span></div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={essSeries} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="left" unit=" MWh" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" unit=" MW" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="soc" orientation="right" domain={[0, 100]} unit=" %" hide />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                                    labelStyle={{ fontWeight: 'bold', color: '#6b7280' }}
                                    itemStyle={{ fontSize: 13 }}
                                />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
                                <Line yAxisId="left" type="monotone" dataKey="essChrg" name="ESS 충전 (MWh)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} isAnimationActive />
                                <Line yAxisId="left" type="monotone" dataKey="essDisc" name="ESS 방전 (MWh)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive />
                                <Line yAxisId="right" type="monotone" dataKey="essCapa" name="ESS 용량 (MW)" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive />
                                {essSeries.some(p => typeof p.soc === 'number') && (
                                    <Line yAxisId="soc" type="monotone" dataKey="soc" name="SoC (%)" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="3 3" dot={false} isAnimationActive />
                                )}
                            </LineChart>
                        </ResponsiveContainer>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2 font-semibold mb-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500" /> 충전
                                </div>
                                <div className="text-gray-600">최적 충전 시간:</div>
                                <div className="font-medium mt-1">{bestChrgTimes.length ? bestChrgTimes.join(', ') : '-'}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2 font-semibold mb-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-red-500" /> 방전
                                </div>
                                <div className="text-gray-600">최적 방전 시간:</div>
                                <div className="font-medium mt-1">{bestDiscTimes.length ? bestDiscTimes.join(', ') : '-'}</div>
                            </div>
                        </div>
                    </div>
                )}

                {curtToday.length > 0 && (
                    <div className="p-6 bg-white rounded-2xl shadow-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">출력제어 · 최소출력 추이</h2>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart
                                data={curtToday.map(item => ({ ...item, hour: item.fcstTm.slice(8, 10) + ':00' }))}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="left" unit=" MW/m2" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" unit=" MW/m2" tick={{ fontSize: 12 }} />
                                <RechartsTooltip
                                    formatter={(value: number, name: string) => {
                                        if (name.includes('최소출력')) return [`${value} MW/m2`, name];
                                        if (name.includes('출력제어')) return [`${value} MW/m2`, name];
                                        return [value, name];
                                    }}
                                    labelFormatter={(label) => `시간: ${label}`}
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                                    labelStyle={{ fontWeight: 'bold', color: '#6b7280' }}
                                    itemStyle={{ fontSize: 13 }}
                                />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
                                <Line yAxisId="left" type="monotone" dataKey="fcstMinpw" name="중앙급전 최소출력량 (MW/m2)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} isAnimationActive />
                                <Line yAxisId="right" type="monotone" dataKey="fcstCurt" name="출력제어량 (MW/m2)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {genToday.length > 0 && (
                    <div className="p-6 bg-white rounded-2xl shadow-md">
                        <h2 className="text-xl font-bold mb-1 text-gray-800">수소 예측 생산량</h2>
                        <p className="text-sm text-gray-500 mb-3">예측시간 : {formatTime(genToday[genToday.length - 1].fcstTm)}</p>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart
                                data={genToday.map(it => ({ ...it, hour: it.fcstTm.slice(8, 10) + ':00' }))}
                                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="gradQgen" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                                    </linearGradient>
                                    <linearGradient id="gradCapa" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.45} />
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="left" unit=" MWh" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" unit=" MW" tick={{ fontSize: 12 }} />
                                <RechartsTooltip
                                    formatter={(v: number, name: string) => {
                                        if (name.includes('최종생산량')) return [`${v} MWh`, name];
                                        if (name.includes('예측설비용량')) return [`${v} MW`, name];
                                        return [v, name];
                                    }}
                                    labelFormatter={(label) => `시간: ${label}`}
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                                    labelStyle={{ fontWeight: 'bold', color: '#6b7280' }}
                                    itemStyle={{ fontSize: 13 }}
                                />
                                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '13px' }} />
                                <Area yAxisId="left" type="monotone" dataKey="fcstQgen" name="최종생산량(MWh)" stroke="#f59e0b" fill="url(#gradQgen)" strokeWidth={2} activeDot={{ r: 5 }} />
                                <Area yAxisId="right" type="monotone" dataKey="fcstCapa" name="예측설비용량(MW)" stroke="#60a5fa" fill="url(#gradCapa)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {gemLastItem && (
                    <div className="p-6 bg-white rounded-2xl shadow-md">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">수소 생산량</h2>
                                <p className="text-sm text-gray-500 mt-1">기준시간 : {formatTime(gemLastItem.tm)}</p>
                            </div>
                            <div className="flex items-center">
                <span className="text-xs bg-gray-100 text-gray-700 border border-gray-200 rounded-full px-2 py-1">
                  {gemToday.length} 활성
                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                            <span>연결된 자원</span>
                            <span>
                마지막 동기화:{' '}
                                {(() => {
                                    const now = new Date();
                                    const s = gemLastItem.tm;
                                    const d = new Date(
                                        Number(s.slice(0,4)), Number(s.slice(4,6))-1, Number(s.slice(6,8)),
                                        Number(s.slice(8,10)), Number(s.slice(10,12))
                                    );
                                    const diffMin = Math.max(0, Math.round((now.getTime() - d.getTime())/60000));
                                    return `${diffMin}분 전`;
                                })()}
              </span>
                        </div>

                        <div className="mt-2">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-2 bg-black rounded-full transition-all" style={{ width: `${gemUtilPct ?? 0}%` }} />
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                                <span className="text-gray-600">자원 활용률</span>
                                <span className="font-semibold">{gemUtilPct !== null ? `${gemUtilPct}%` : '--%'}</span>
                            </div>
                        </div>

                        <div className="text-center mt-3 text-sm">
                            <span className="text-gray-500">응답 시간: </span>
                            <span className="font-semibold">{gemLatency !== null ? `${gemLatency}초` : '—'}</span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">설비 용량(KG)</div>
                                <div className="text-lg font-semibold">{Math.round(gemLastItem.hgenCapa).toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">수소 생산량(KG)</div>
                                <div className="text-lg font-semibold">{Math.round(gemLastItem.hgenProd).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {!forecast && !sukubM && (
                <p className="text-gray-500 mt-4">데이터 로딩 중...</p>
            )}
        </div>
    );
}

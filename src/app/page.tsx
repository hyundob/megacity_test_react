'use client';

import React from 'react';
import { Circle } from 'lucide-react';
import { useDashboardData } from '@/lib/useDashboardData';
/* import AlertsCard from '../components/alerts/AlertsCard'; */
import SystemStatusCard from '../components/system/SystemStatusCard';
import ForecastInfoCard from '../components/cards/ForecastInfoCard';
import SukubInfoCard from '../components/cards/SukubInfoCard';
import SolarPredictChart from '../components/charts/SolarPredictChart';
import DemandPredictChart from '../components/charts/DemandPredictChart';
import DemandReGenChart from '../components/charts/DemandReGenChart';
import EssStrategyCard from '../components/charts/EssStrategyCard';
import CurtChart from '../components/charts/CurtChart';
import HydrogenForecastChart from '../components/charts/HydrogenForecastChart';
import ForecastLast48hChart from '../components/charts/ForecastLast48hChart';
import JejuOperationChart from '../components/charts/JejuOperationChart';
import HydrogenProductionCard from '../components/cards/HydrogenProductionCard';
import KmaNowCard from '../components/cards/KmaNowCard';
import AlertsButton from '../components/alerts/AlertsButton';
import './globals.css';

export default function Page() {
    const d = useDashboardData();
    const getColor = (s: 'ok' | 'error') => (s === 'ok' ? 'green' : 'red');

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            {/* 상단 헤더 */}
            <div className="mb-6">
                <div className="toss-card p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">메가시티 대시보드</h1>
                            <p className="text-sm text-gray-500">마지막 업데이트: {d.lastUpdated || '로딩 중...'}</p>
                        </div>
                        <div className="flex gap-3 items-center flex-shrink-0">
                            <div className={`toss-status ${d.apiStatus === 'ok' ? 'toss-status-success' : 'toss-status-error'}`}>
                                <Circle size={8} fill="currentColor" />
                                <span>API</span>
                            </div>
                            <div className={`toss-status ${d.dbStatus === 'ok' ? 'toss-status-success' : 'toss-status-error'}`}>
                                <Circle size={8} fill="currentColor" />
                                <span>DB</span>
                            </div>
                            <AlertsButton alerts={d.alerts} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 메인 콘텐츠 그리드 */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6">
                {/* ✅ 기존 AlertsCard는 숨김 (원하면 삭제) */}
                {/* <AlertsCard alerts={d.alerts} /> */}

                <SystemStatusCard
                    latApi={d.latApi}
                    latDb={d.latDb}
                    latPredict={d.latPredict}
                    healthApi={d.healthApi}
                    healthDb={d.healthDb}
                    healthPredict={d.healthPredict}
                />

                {d.forecastPredict && <ForecastInfoCard data={d.forecastPredict} />}
                {d.sukubOperation && <SukubInfoCard data={d.sukubOperation} dailyData={d.sukubOperationToday} />}

                {d.sukubOperationToday.length > 0 && (
                    <JejuOperationChart data={d.sukubOperationToday} />
                )}

                <KmaNowCard tempC={d.ncstTempC} windMs={d.ncstWindMs} windDir={d.ncstWindDir} pty={d.ncstPty} ptyText={d.ncstPtyText} sky={d.ncstSky} />

                <SolarPredictChart data={d.reGenPredictData} />
                {d.demandPredict.length > 0 && <DemandPredictChart data={d.demandPredict} />}
                
                {d.demandPredict.length > 0 && d.reGenPredictData.length > 0 && (
                    <DemandReGenChart demandData={d.demandPredict} reGenData={d.reGenPredictData} />
                )}

                {/* <EssStrategyCard
                    series={d.essSeries}
                    currentSoc={d.currentSoc}
                    bestChrgTimes={d.bestChrgTimes}
                    bestDiscTimes={d.bestDiscTimes}
                /> */}

                {d.jejuCurtPredictToday.length > 0 && <CurtChart data={d.jejuCurtPredictToday} />}

                {d.hgGenPredictToday.length > 0 && <HydrogenForecastChart data={d.hgGenPredictToday} />}

                {d.hgGenLastItem && (
                    <HydrogenProductionCard
                        lastItem={d.hgGenLastItem}
                        utilPct={d.hgGenUtilPct}
                        latency={d.hgGenLatency}
                        totalItems={d.hgGenInfoToday.length}
                    />
                )}

                
                {d.forecastPredictLast48h.length > 0 && (
                    <div className="col-span-2">
                        <ForecastLast48hChart data={d.forecastPredictLast48h} />
                    </div>
                )}


                
            </div>

            {!d.forecastPredict && !d.sukubOperation && (
                <p className="text-gray-500 mt-4">데이터 로딩 중...</p>
            )}


        </div>
    );
}
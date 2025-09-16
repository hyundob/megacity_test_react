'use client';

import React from 'react';
import { Circle, RefreshCw, Pause, Play } from 'lucide-react';
import { useDashboardData } from '@/lib/useDashboardData';
/* import AlertsCard from '../components/alerts/AlertsCard'; */
import SystemStatusCard from '../components/system/SystemStatusCard';
import ForecastInfoCard from '../components/cards/ForecastInfoCard';
import SukubInfoCard from '../components/cards/SukubInfoCard';
import SolarPredictChart from '../components/charts/SolarPredictChart';
import DemandPredictChart from '../components/charts/DemandPredictChart';
import DemandReGenChart from '../components/charts/DemandReGenChart';
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

    const handleToggleAutoRefresh = () => {
        d.setAutoRefresh(!d.autoRefresh);
    };

    const handleManualRefresh = () => {
        d.load();
    };


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
                            
                            {/* 자동 새로고침 토글 버튼 */}
                            <button
                                onClick={handleToggleAutoRefresh}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    d.autoRefresh 
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={d.autoRefresh ? '자동 새로고침 켜짐 (5분마다)' : '자동 새로고침 꺼짐'}
                            >
                                {d.autoRefresh ? <Play size={16} /> : <Pause size={16} />}
                                <span className="hidden sm:inline">
                                    {d.autoRefresh ? '자동' : '수동'}
                                </span>
                            </button>
                            
                            {/* 수동 새로고침 버튼 */}
                            <button
                                onClick={handleManualRefresh}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                                title="지금 새로고침"
                            >
                                <RefreshCw size={16} />
                                <span className="hidden sm:inline">새로고침</span>
                            </button>
                            
                            <AlertsButton alerts={d.alerts} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 메인 콘텐츠 그리드 */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6">
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
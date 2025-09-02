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
import EssStrategyCard from '../components/charts/EssStrategyCard';
import CurtChart from '../components/charts/CurtChart';
import HydrogenForecastChart from '../components/charts/HydrogenForecastChart';
import HydrogenProductionCard from '../components/cards/HydrogenProductionCard';
import AlertsButton from '../components/alerts/AlertsButton';
import './globals.css';

export default function Page() {
    const d = useDashboardData();
    const getColor = (s: 'ok' | 'error') => (s === 'ok' ? 'green' : 'red');

    return (
        <div className="p-4">
            {/* 상단 상태 바 + 알림 버튼 */}
            <div className="bg-gray-100 rounded shadow p-4 flex items-center justify-between mb-4">
                <div>
                    ⏱ 마지막 업데이트: <strong>{d.lastUpdated || '로딩 중...'}</strong>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-1">
                        <Circle size={14} color={getColor(d.apiStatus)} fill={getColor(d.apiStatus)} />
                        <span>API</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Circle size={14} color={getColor(d.dbStatus)} fill={getColor(d.dbStatus)} />
                        <span>DB</span>
                    </div>

                    {/* 🔔 알림 버튼 */}
                    <AlertsButton alerts={d.alerts} />
                </div>
            </div>

            {/* 2열 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {d.sukubOperation && <SukubInfoCard data={d.sukubOperation} />}

                <SolarPredictChart data={d.reGenPredictData} />
                {d.demandPredict.length > 0 && <DemandPredictChart data={d.demandPredict} />}

                <EssStrategyCard
                    series={d.essSeries}
                    currentSoc={d.currentSoc}
                    bestChrgTimes={d.bestChrgTimes}
                    bestDiscTimes={d.bestDiscTimes}
                />

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
            </div>

            {!d.forecastPredict && !d.sukubOperation && (
                <p className="text-gray-500 mt-4">데이터 로딩 중...</p>
            )}


        </div>
    );
}
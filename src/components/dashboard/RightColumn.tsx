'use client';

import React from 'react';
import { Battery, Zap, TrendingUp, Sun, Activity } from 'lucide-react';
import HydrogenProductionCard from '../cards/HydrogenProductionCard';
import HydrogenForecastChart from '../charts/HydrogenForecastChart';
import SukubInfoCard from '../cards/SukubInfoCard';
import SystemStatusCard from '../system/SystemStatusCard';
import GradientCard from '../common/GradientCard';
import { CARD_GRADIENTS, SHADOW_COLORS } from '@/lib/constants';
import { HgGenInfo, HgGenPredict, SukubOperation, SukubOperationItem, ServiceHealth } from '@/lib/types';

interface RightColumnProps {
    hgGenLastItem: HgGenInfo | null;
    hgGenUtilPct: number | null;
    hgGenLatency: number | null;
    hgGenInfoToday: HgGenInfo[];
    hgGenPredictToday: HgGenPredict[];
    sukubOperation: SukubOperation | null;
    sukubOperationToday: SukubOperationItem[];
    currentDemand: number | null;
    currentRenewable: number | null;
    renewableRatio: number;
    hydrogenUtil: number;
    latApi: number | null;
    latDb: number | null;
    latPredict: number | null;
    healthApi: ServiceHealth;
    healthDb: ServiceHealth;
    healthPredict: ServiceHealth;
}

export default function RightColumn({
    hgGenLastItem,
    hgGenUtilPct,
    hgGenLatency,
    hgGenInfoToday,
    hgGenPredictToday,
    sukubOperation,
    sukubOperationToday,
    currentDemand,
    currentRenewable,
    renewableRatio,
    hydrogenUtil,
    latApi,
    latDb,
    latPredict,
    healthApi,
    healthDb,
    healthPredict
}: RightColumnProps) {
    return (
        <div className="lg:col-span-3 space-y-4">
            {/* 수소 생산 카드 */}
            {hgGenLastItem && (
                <GradientCard
                    title="수소 생산"
                    subtitle="실시간 생산 현황"
                    icon={Battery}
                    gradient={CARD_GRADIENTS.hydrogen}
                    shadowColor={SHADOW_COLORS.hydrogen}
                    textColor="light"
                    glass
                    glassColor="violet"
                >
                    <div className="flex items-center justify-center">
                        <div className="w-full">
                            <HydrogenProductionCard
                                lastItem={hgGenLastItem}
                                utilPct={hgGenUtilPct}
                                latency={hgGenLatency}
                                totalItems={hgGenInfoToday.length}
                            />
                        </div>
                    </div>
                </GradientCard>
            )}

            {/* 수소 예측 차트 */}
            {hgGenPredictToday.length > 0 && (
                <GradientCard
                    title="수소 예측"
                    subtitle="수소 생산량 예측"
                    icon={Battery}
                    gradient={CARD_GRADIENTS.hydrogenForecast}
                    shadowColor={SHADOW_COLORS.hydrogenForecast}
                    textColor="light"
                    glass
                    glassColor="violet"
                >
                    <div className="flex items-center justify-center min-h-[240px]">
                        <div className="w-full">
                            <HydrogenForecastChart data={hgGenPredictToday} />
                        </div>
                    </div>
                </GradientCard>
            )}

            {/* 작은 KPI 카드들 2x2 그리드 */}
            <div className="grid grid-cols-2 gap-3">
                <div className="kpi-card kpi-card-blue p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center border border-blue-500/25">
                            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">현재 수요</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {currentDemand ? `${Math.round(currentDemand).toLocaleString()}` : '--'}
                    </div>
                    <div className="text-xs text-slate-500">MW</div>
                </div>
                <div className="kpi-card kpi-card-green p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center border border-emerald-500/25">
                            <Sun className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">신재생</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {currentRenewable ? `${Math.round(currentRenewable).toLocaleString()}` : '--'}
                    </div>
                    <div className="text-xs text-slate-500">MW</div>
                </div>
                <div className="kpi-card kpi-card-purple p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-violet-500/15 rounded-xl flex items-center justify-center border border-violet-500/25">
                            <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">재생 비율</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {renewableRatio > 0 ? `${renewableRatio.toFixed(1)}` : '--'}
                    </div>
                    <div className="text-xs text-slate-500">%</div>
                </div>
                <div className="kpi-card kpi-card-cyan p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-cyan-500/15 rounded-xl flex items-center justify-center border border-cyan-500/25">
                            <Battery className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">수소 활용</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {hydrogenUtil > 0 ? `${hydrogenUtil}` : '--'}
                    </div>
                    <div className="text-xs text-slate-500">%</div>
                </div>
            </div>

            {/* 계통 운영 정보 카드 */}
            {sukubOperation && (
                <div className="p-6 glass-card glass-card-pink">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">계통 운영 정보</h2>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">전력 시스템 현황</p>
                        </div>
                        <div className="icon-box icon-box-pink">
                            <Zap className="w-6 h-6 text-pink-500 dark:text-pink-400" />
                        </div>
                    </div>
                    <SukubInfoCard data={sukubOperation} dailyData={sukubOperationToday} />
                </div>
            )}

            {/* 시스템 상태 카드 */}
            <div className="p-6 glass-card glass-card-teal">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">시스템 상태</h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">서비스 응답 시간</p>
                    </div>
                    <div className="icon-box icon-box-teal">
                        <Activity className="w-6 h-6 text-teal-500 dark:text-teal-400" />
                    </div>
                </div>
                <SystemStatusCard
                    latApi={latApi}
                    latDb={latDb}
                    latPredict={latPredict}
                    healthApi={healthApi}
                    healthDb={healthDb}
                    healthPredict={healthPredict}
                />
            </div>
        </div>
    );
}

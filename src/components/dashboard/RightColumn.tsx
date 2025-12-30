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
                >
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex items-center justify-center">
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
                >
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex items-center justify-center min-h-[240px]">
                        <div className="w-full max-w-full">
                            <HydrogenForecastChart data={hgGenPredictToday} />
                        </div>
                    </div>
                </GradientCard>
            )}

            {/* 작은 KPI 카드들 2x2 그리드 */}
            <div className="grid grid-cols-2 gap-3">
                <div className="kpi-card-blue p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="text-xs text-white/80 mb-1 font-medium">현재 수요</div>
                    <div className="text-xl font-bold text-white">
                        {currentDemand ? `${Math.round(currentDemand).toLocaleString()}` : '--'}
                    </div>
                    <div className="text-xs text-white/70">MW</div>
                </div>
                <div className="kpi-card-green p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Sun className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="text-xs text-white/80 mb-1 font-medium">신재생</div>
                    <div className="text-xl font-bold text-white">
                        {currentRenewable ? `${Math.round(currentRenewable).toLocaleString()}` : '--'}
                    </div>
                    <div className="text-xs text-white/70">MW</div>
                </div>
                <div className="kpi-card-purple p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="text-xs text-white/80 mb-1 font-medium">재생 비율</div>
                    <div className="text-xl font-bold text-white">
                        {renewableRatio > 0 ? `${renewableRatio.toFixed(1)}` : '--'}
                    </div>
                    <div className="text-xs text-white/70">%</div>
                </div>
                <div className="kpi-card-cyan p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Battery className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="text-xs text-white/80 mb-1 font-medium">수소 활용</div>
                    <div className="text-xl font-bold text-white">
                        {hydrogenUtil > 0 ? `${hydrogenUtil}` : '--'}
                    </div>
                    <div className="text-xs text-white/70">%</div>
                </div>
            </div>

            {/* 제주 운영 정보 카드 */}
            {sukubOperation && (
                <GradientCard
                    title="제주 계통 운영 정보"
                    subtitle="전력 시스템 현황"
                    icon={Zap}
                    gradient={CARD_GRADIENTS.jejuOperation}
                    shadowColor={SHADOW_COLORS.jejuOperation}
                    textColor="light"
                >
                    <SukubInfoCard data={sukubOperation} dailyData={sukubOperationToday} />
                </GradientCard>
            )}

            {/* 시스템 상태 카드 */}
            <GradientCard
                title="시스템 상태"
                subtitle="서비스 응답 시간"
                icon={Activity}
                gradient={CARD_GRADIENTS.systemStatus}
                shadowColor={SHADOW_COLORS.systemStatus}
                textColor="dark"
            >
                <SystemStatusCard
                    latApi={latApi}
                    latDb={latDb}
                    latPredict={latPredict}
                    healthApi={healthApi}
                    healthDb={healthDb}
                    healthPredict={healthPredict}
                />
            </GradientCard>
        </div>
    );
}


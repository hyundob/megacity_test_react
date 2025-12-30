'use client';

import React from 'react';
import { Zap, TrendingUp, Sun, Wind } from 'lucide-react';
import JejuOperationChart from '../charts/JejuOperationChart';
import DemandReGenChart from '../charts/DemandReGenChart';
import SolarPredictChart from '../charts/SolarPredictChart';
import WindPredictChart from '../charts/WindPredictChart';
import GradientCard from '../common/GradientCard';
import { CARD_GRADIENTS, SHADOW_COLORS } from '@/lib/constants';
import { SukubOperationItem, DemandPredict, ReGenPredict } from '@/lib/types';

interface CenterColumnProps {
    sukubOperationToday: SukubOperationItem[];
    demandPredict: DemandPredict[];
    reGenPredictData: ReGenPredict[];
    windPredictData: ReGenPredict[];
}

export default function CenterColumn({
    sukubOperationToday,
    demandPredict,
    reGenPredictData,
    windPredictData
}: CenterColumnProps) {
    return (
        <div className="lg:col-span-5 space-y-4">
            {/* 전력 운영 카드 */}
            <div
                className="p-6 rounded-2xl"
                style={{
                    background: CARD_GRADIENTS.operation,
                    color: '#111827',
                    border: '1px solid rgba(248, 113, 113, 0.25)',
                    boxShadow: `0 12px 30px -18px ${SHADOW_COLORS.operation}`
                }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">전력 운영</h2>
                        <p className="text-xs text-gray-500 mt-1">제주 계통 운영 현황</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Zap className="w-6 h-6 text-rose-500" />
                    </div>
                </div>
                {sukubOperationToday.length > 0 ? (
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex items-center justify-center min-h-[260px]">
                        <div className="w-full max-w-full">
                            <JejuOperationChart data={sukubOperationToday} />
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-600">데이터 로딩 중...</div>
                )}
            </div>

            {/* 수요 vs 재생에너지 */}
            {demandPredict.length > 0 && (reGenPredictData.length > 0 || windPredictData.length > 0) && (
                <div
                    className="p-6 rounded-2xl"
                    style={{
                        background: CARD_GRADIENTS.demandReGen,
                        color: '#111827',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        boxShadow: `0 12px 30px -18px ${SHADOW_COLORS.demandReGen}`
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">수요 vs 재생에너지</h2>
                            <p className="text-xs text-gray-500 mt-1">전력수요와 신재생에너지 비교</p>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <TrendingUp className="w-6 h-6 text-cyan-500" />
                        </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex items-center justify-center min-h-[260px]">
                        <div className="w-full max-w-full">
                            <DemandReGenChart
                                demandData={demandPredict}
                                reGenData={reGenPredictData}
                                windData={windPredictData}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 태양광 + 풍력 예측 */}
            <div className="grid grid-cols-1 gap-4">
                {reGenPredictData.length > 0 && (
                    <GradientCard
                        title="태양광 발전"
                        subtitle="태양광 발전 예측"
                        icon={Sun}
                        gradient={CARD_GRADIENTS.solar}
                        shadowColor={SHADOW_COLORS.solar}
                        textColor="light"
                    >
                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex items-center justify-center min-h-[260px]">
                            <div className="w-full max-w-full">
                                <SolarPredictChart data={reGenPredictData} />
                            </div>
                        </div>
                    </GradientCard>
                )}
                {windPredictData.length > 0 && (
                    <GradientCard
                        title="풍력 발전"
                        subtitle="풍력 발전 예측"
                        icon={Wind}
                        gradient={CARD_GRADIENTS.wind}
                        shadowColor={SHADOW_COLORS.wind}
                        textColor="light"
                    >
                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex items-center justify-center min-h-[260px]">
                            <div className="w-full max-w-full">
                                <WindPredictChart data={windPredictData} />
                            </div>
                        </div>
                    </GradientCard>
                )}
            </div>
        </div>
    );
}


'use client';

import React from 'react';
import { Zap, TrendingUp, Sun, Wind } from 'lucide-react';
import JejuOperationChart from '../charts/JejuOperationChart';
import DemandReGenChart from '../charts/DemandReGenChart';
import SolarPredictChart from '../charts/SolarPredictChart';
import WindPredictChart from '../charts/WindPredictChart';
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
            <div className="p-6 glass-card glass-card-pink">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">전력 운영</h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">계통 운영 현황</p>
                    </div>
                    <div className="icon-box icon-box-pink">
                        <Zap className="w-6 h-6 text-pink-500 dark:text-pink-400" />
                    </div>
                </div>
                {sukubOperationToday.length > 0 ? (
                    <div className="bg-black/5 dark:bg-black/25 rounded-lg p-3 border border-black/8 dark:border-white/5 flex items-center justify-center min-h-[260px]">
                        <div className="w-full">
                            <JejuOperationChart data={sukubOperationToday} />
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-slate-500">데이터 로딩 중...</div>
                )}
            </div>

            {/* 수요 vs 재생에너지 */}
            {demandPredict.length > 0 && (reGenPredictData.length > 0 || windPredictData.length > 0) && (
                <div className="p-6 glass-card glass-card-cyan">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">수요 vs 재생에너지</h2>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">전력수요와 신재생에너지 비교</p>
                        </div>
                        <div className="icon-box icon-box-cyan">
                            <TrendingUp className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
                        </div>
                    </div>
                    <div className="bg-black/5 dark:bg-black/25 rounded-lg p-3 border border-black/8 dark:border-white/5 flex items-center justify-center min-h-[260px]">
                        <div className="w-full">
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
                    <div className="p-6 glass-card glass-card-amber">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">태양광 발전</h2>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">태양광 발전 예측</p>
                            </div>
                            <div className="icon-box icon-box-amber">
                                <Sun className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                            </div>
                        </div>
                        <div className="bg-black/5 dark:bg-black/25 rounded-lg p-3 border border-black/8 dark:border-white/5 flex items-center justify-center min-h-[260px]">
                            <div className="w-full">
                                <SolarPredictChart data={reGenPredictData} />
                            </div>
                        </div>
                    </div>
                )}
                {windPredictData.length > 0 && (
                    <div className="p-6 glass-card glass-card-emerald">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">풍력 발전</h2>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">풍력 발전 예측</p>
                            </div>
                            <div className="icon-box icon-box-emerald">
                                <Wind className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                            </div>
                        </div>
                        <div className="bg-black/5 dark:bg-black/25 rounded-lg p-3 border border-black/8 dark:border-white/5 flex items-center justify-center min-h-[260px]">
                            <div className="w-full">
                                <WindPredictChart data={windPredictData} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

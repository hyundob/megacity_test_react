'use client';

import React from 'react';
import { Zap, TrendingUp, Sun, Wind, FlaskConical, AlertTriangle } from 'lucide-react';
import JejuOperationChart from '@/components/charts/JejuOperationChart';
import DemandReGenChart from '@/components/charts/DemandReGenChart';
import SolarPredictChart from '@/components/charts/SolarPredictChart';
import WindPredictChart from '@/components/charts/WindPredictChart';
import { SukubOperationItem, DemandPredict, ReGenPredict } from '@/lib/types';

interface CenterColumnProps {
    sukubOperationToday: SukubOperationItem[];
    demandPredict: DemandPredict[];
    reGenPredictData: ReGenPredict[];
    windPredictData: ReGenPredict[];
    currentDemand: number | null;
    currentRenewable: number | null;
}

export default function CenterColumn({
    sukubOperationToday,
    demandPredict,
    reGenPredictData,
    windPredictData,
    currentDemand,
    currentRenewable,
}: CenterColumnProps) {
    const H2_PRODUCTION_KG_PER_KWH = 0.115;
    // 잔여 전력 계산 (MW)
    const surplusMW = (currentRenewable != null && currentDemand != null)
        ? currentRenewable - currentDemand
        : null;
    const surplusKW = surplusMW != null ? surplusMW * 1000 : null;

    // 수소 생산량 추산 (kg/h) — 고정 계수 0.115 kg/kWh
    const h2Estimate = surplusKW != null && surplusKW > 0
        ? surplusKW * H2_PRODUCTION_KG_PER_KWH
        : null;
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

            {/* 잉여 전력 → 수소 전환 시나리오 */}
            {surplusMW != null && (
                <div className="p-6 glass-card glass-card-violet">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">잉여 전력 → 수소 전환 시나리오</h2>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">재생에너지 발전 - 현재 수요 기반 추산</p>
                        </div>
                        <div className="icon-box icon-box-violet">
                            <FlaskConical className="w-6 h-6 text-violet-500 dark:text-violet-400" />
                        </div>
                    </div>

                    {/* 요약 수치 */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-black/5 dark:bg-black/25 rounded-lg p-3 border border-black/8 dark:border-white/5 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">재생에너지 발전</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {currentRenewable != null ? Math.round(currentRenewable).toLocaleString() : '--'}
                                <span className="text-xs font-normal text-slate-500 ml-1">MW</span>
                            </p>
                        </div>
                        <div className="bg-black/5 dark:bg-black/25 rounded-lg p-3 border border-black/8 dark:border-white/5 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">현재 수요</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {currentDemand != null ? Math.round(currentDemand).toLocaleString() : '--'}
                                <span className="text-xs font-normal text-slate-500 ml-1">MW</span>
                            </p>
                        </div>
                        <div className={`rounded-lg p-3 border text-center ${surplusMW > 0
                            ? 'bg-emerald-500/10 border-emerald-500/20'
                            : 'bg-rose-500/10 border-rose-500/20'}`}>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">잔여 전력</p>
                            <p className={`text-lg font-bold ${surplusMW > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                                {surplusMW > 0 ? '+' : ''}{Math.round(surplusMW).toLocaleString()}
                                <span className="text-xs font-normal text-slate-500 ml-1">MW</span>
                            </p>
                        </div>
                    </div>

                    {/* 수소 생산량 추산 */}
                    {h2Estimate != null ? (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">수소 생산량 추산 (kg/h)</p>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500 w-20 shrink-0">기준 계수</span>
                                <div className="flex-1 bg-black/10 dark:bg-white/10 rounded-full h-2">
                                    <div className="bg-violet-500 h-2 rounded-full" style={{ width: '100%' }} />
                                </div>
                                <span className="text-sm font-bold text-violet-600 dark:text-violet-400 w-20 text-right">
                                    {h2Estimate.toFixed(1)} kg/h
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                                * 계산식: 잉여 전력(kW) x 0.115 kg/kWh
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>현재 재생에너지 발전량이 수요보다 낮아 잉여 전력이 없습니다.</span>
                        </div>
                    )}
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

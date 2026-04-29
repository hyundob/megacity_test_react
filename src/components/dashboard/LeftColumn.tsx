'use client';

import React from 'react';
import { Zap, Activity, Cloud, TrendingUp } from 'lucide-react';
import ForecastInfoCard from '../cards/ForecastInfoCard';
import DemandPredictChart from '../charts/DemandPredictChart';
import CurtChart from '../charts/CurtChart';
import {JejuMapCard} from '../map/JejuMapCard';
import GradientCard from '../common/GradientCard';
import { CARD_GRADIENTS, SHADOW_COLORS } from '@/lib/constants';
import { ForecastPredict, JejuCurtPredict, DemandPredict, JejuRegion } from '@/lib/types';

interface LeftColumnProps {
    currentDemand: number | null;
    currentRenewable: number | null;
    renewableRatio: number;
    demandPredict: DemandPredict[];
    jejuCurtPredictToday: JejuCurtPredict[];
    forecastPredict: ForecastPredict | null;
    selectedJejuRegion: JejuRegion | null;
    onRegionSelect: (region: JejuRegion) => Promise<void>;
    ncstTempC: number | null;
    ncstWindMs: number | null;
    ncstWindDir: number | null;
    ncstPty: number | null;
    ncstPtyText: string | null;
    ncstSky: number | null;
}

export default function LeftColumn({
    currentDemand,
    currentRenewable,
    renewableRatio,
    demandPredict,
    jejuCurtPredictToday,
    forecastPredict,
    selectedJejuRegion,
    onRegionSelect,
    ncstTempC,
    ncstWindMs,
    ncstWindDir,
    ncstPty,
    ncstPtyText,
    ncstSky
}: LeftColumnProps) {
    return (
        <div className="lg:col-span-4 space-y-4">
            {/* 지도 카드 */}
            <div className="p-6 glass-card glass-card-teal">
                <JejuMapCard
                    selectedRegion={selectedJejuRegion}
                    onRegionSelect={onRegionSelect}
                    tempC={ncstTempC}
                    windMs={ncstWindMs}
                    windDir={ncstWindDir}
                    pty={ncstPty}
                    ptyText={ncstPtyText}
                    sky={ncstSky}
                />
            </div>

            {/* 기상 정보 카드 */}
            {forecastPredict && (
                <div className="p-6 glass-card glass-card-cyan">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">기상 예보 정보</h2>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">실시간 기상 데이터</p>
                        </div>
                        <div className="icon-box icon-box-cyan">
                            <Cloud className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
                        </div>
                    </div>
                    <ForecastInfoCard data={forecastPredict} />
                </div>
            )}

            {/* 전력 수요 카드 */}
            <div className="p-6 glass-card glass-card-blue">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">전력 수요</h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">현재 운영 데이터</p>
                    </div>
                    <div className="icon-box icon-box-blue">
                        <Zap className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                    </div>
                </div>
                <div className="mb-4">
                    <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {currentDemand ? `${Math.round(currentDemand).toLocaleString()}` : '--'}
                        <span className="text-xl text-slate-500 dark:text-slate-400 ml-1">MW</span>
                    </div>
                    {currentRenewable && currentDemand && (
                        <div className="text-sm text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                            <TrendingUp className="w-4 h-4" />
                            <span>재생에너지 {renewableRatio.toFixed(1)}%</span>
                        </div>
                    )}
                </div>
                {demandPredict.length > 0 && (
                    <div className="bg-black/5 dark:bg-black/25 rounded-lg p-4 border border-black/8 dark:border-white/5 flex items-center justify-center min-h-[320px]">
                        <div className="w-full max-w-[920px]">
                            <DemandPredictChart data={demandPredict} />
                        </div>
                    </div>
                )}
            </div>

            {/* 출력제어 예측 */}
            {jejuCurtPredictToday.length > 0 && (
                <GradientCard
                    title="출력제어"
                    subtitle="출력제어 예측"
                    icon={Activity}
                    gradient={CARD_GRADIENTS.curt}
                    shadowColor={SHADOW_COLORS.curt}
                    textColor="dark"
                    glass
                    glassColor="orange"
                >
                    <div className="flex items-center justify-center min-h-[260px]">
                        <div className="w-full">
                            <CurtChart data={jejuCurtPredictToday} />
                        </div>
                    </div>
                </GradientCard>
            )}

        </div>
    );
}

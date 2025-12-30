'use client';

import React from 'react';
import { Zap, Activity, Cloud, TrendingUp } from 'lucide-react';
import ForecastInfoCard from '../cards/ForecastInfoCard';
import DemandPredictChart from '../charts/DemandPredictChart';
import CurtChart from '../charts/CurtChart';
import JejuMapCard from '../map/JejuMapCard';
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
            {/* 전력 수요 카드 */}
            <div
                className="p-6 rounded-2xl flex flex-col"
                style={{
                    background: CARD_GRADIENTS.demand,
                    color: '#111827',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    boxShadow: `0 12px 30px -18px ${SHADOW_COLORS.demand}`
                }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">전력 수요</h2>
                        <p className="text-xs text-gray-500 mt-1">현재 운영 데이터</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Zap className="w-6 h-6 text-indigo-500" />
                    </div>
                </div>
                <div className="mb-4">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                        {currentDemand ? `${Math.round(currentDemand).toLocaleString()}` : '--'}
                        <span className="text-xl text-gray-500 ml-1">MW</span>
                    </div>
                    {currentRenewable && currentDemand && (
                        <div className="text-sm text-emerald-700 inline-flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <span>재생에너지 {renewableRatio.toFixed(1)}%</span>
                        </div>
                    )}
                </div>
                {demandPredict.length > 0 && (
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm flex items-center justify-center min-h-[320px]">
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
                >
                    <div className="bg-white/50 rounded-lg p-3 backdrop-blur-sm flex items-center justify-center min-h-[260px]">
                        <div className="w-full max-w-full">
                            <CurtChart data={jejuCurtPredictToday} />
                        </div>
                    </div>
                </GradientCard>
            )}

            {/* 기상 정보 카드 */}
            {forecastPredict && (
                <GradientCard
                    title="기상 예보 정보"
                    subtitle="실시간 기상 데이터"
                    icon={Cloud}
                    gradient={CARD_GRADIENTS.weather}
                    shadowColor={SHADOW_COLORS.weather}
                    textColor="light"
                >
                    <ForecastInfoCard data={forecastPredict} />
                </GradientCard>
            )}

            {/* 지도 카드 */}
            <div
                className="p-6 rounded-2xl bg-white"
                style={{
                    boxShadow: '0 10px 25px -5px rgba(48, 207, 208, 0.2)'
                }}
            >
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
        </div>
    );
}


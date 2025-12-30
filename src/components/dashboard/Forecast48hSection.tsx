'use client';

import React from 'react';
import { Cloud } from 'lucide-react';
import ForecastLast48hChart from '../charts/ForecastLast48hChart';
import GradientCard from '../common/GradientCard';
import { CARD_GRADIENTS, SHADOW_COLORS } from '@/lib/constants';
import { ForecastPredict } from '@/lib/types';

interface Forecast48hSectionProps {
    forecastPredictLast48h: ForecastPredict[];
    filteredData: ForecastPredict[];
    selectedAreaGrpId: string;
    areaGrpIds: string[];
    onAreaGrpIdChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function Forecast48hSection({
    forecastPredictLast48h,
    filteredData,
    selectedAreaGrpId,
    areaGrpIds,
    onAreaGrpIdChange
}: Forecast48hSectionProps) {
    if (forecastPredictLast48h.length === 0) return null;

    return (
        <div className="mt-4">
            <GradientCard
                title="최근 48시간 기상 예보"
                subtitle="지역별 기온/일사량/풍속 트렌드"
                icon={Cloud}
                gradient={CARD_GRADIENTS.forecast48h}
                shadowColor={SHADOW_COLORS.forecast48h}
                textColor="light"
                className="p-6"
            >
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm flex items-center justify-center min-h-[280px]">
                    <div className="w-full max-w-full">
                        <ForecastLast48hChart
                            data={filteredData}
                            areaGrpId={selectedAreaGrpId}
                            areaGrpIds={areaGrpIds}
                            selectedAreaGrpId={selectedAreaGrpId}
                            onAreaGrpIdChange={onAreaGrpIdChange}
                        />
                    </div>
                </div>
            </GradientCard>
        </div>
    );
}


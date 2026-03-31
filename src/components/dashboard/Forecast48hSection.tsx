'use client';

import React from 'react';
import { Cloud } from 'lucide-react';
import ForecastLast48hChart from '../charts/ForecastLast48hChart';
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
            <div className="p-6 glass-card glass-card-violet">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">최근 48시간 기상 예보</h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">지역별 기온/일사량/풍속 트렌드</p>
                    </div>
                    <div className="icon-box icon-box-violet">
                        <Cloud className="w-6 h-6 text-violet-500 dark:text-violet-400" />
                    </div>
                </div>
                <div className="bg-black/5 dark:bg-black/25 rounded-lg p-4 border border-black/8 dark:border-white/5 flex items-center justify-center min-h-[280px]">
                    <div className="w-full">
                        <ForecastLast48hChart
                            data={filteredData}
                            areaGrpId={selectedAreaGrpId}
                            areaGrpIds={areaGrpIds}
                            selectedAreaGrpId={selectedAreaGrpId}
                            onAreaGrpIdChange={onAreaGrpIdChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

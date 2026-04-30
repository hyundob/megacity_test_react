import { ForecastPredict } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { Thermometer, Droplets, Wind, Gauge, Sun } from 'lucide-react';

export default function ForecastInfoCard({ data }: { data: ForecastPredict }) {
    return (
        <div>
            <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">생성시간</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatTime(data.crtnTm)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">예측시간</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatTime(data.fcstTm)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="w-7 h-7 bg-orange-500/15 rounded-md flex items-center justify-center">
                        <Sun className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">일사량</div>
                        <div className="text-base font-bold text-orange-700 dark:text-orange-300">{data.fcstSrad?.toFixed(1) ?? 'N/A'} W/m²</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="w-7 h-7 bg-red-500/15 rounded-md flex items-center justify-center">
                        <Thermometer className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">기온</div>
                        <div className="text-base font-bold text-red-700 dark:text-red-300">{data.fcstTemp?.toFixed(1) ?? 'N/A'}°C</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="w-7 h-7 bg-blue-500/15 rounded-md flex items-center justify-center">
                        <Droplets className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">습도</div>
                        <div className="text-base font-bold text-blue-700 dark:text-blue-300">{data.fcstHumi?.toFixed(1) ?? 'N/A'}%</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="w-7 h-7 bg-emerald-500/15 rounded-md flex items-center justify-center">
                        <Wind className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">풍속</div>
                        <div className="text-base font-bold text-emerald-700 dark:text-emerald-300">{data.fcstWspd?.toFixed(1) ?? 'N/A'} m/s</div>
                    </div>
                </div>
            </div>

            <div className="mt-3 flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-black/8 dark:border-white/8">
                <div className="w-7 h-7 bg-black/8 dark:bg-white/10 rounded-md flex items-center justify-center">
                    <Gauge className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">기압</div>
                    <div className="text-base font-bold text-slate-700 dark:text-slate-200">{data.fcstPsfc?.toFixed(1) ?? 'N/A'} hPa</div>
                </div>
            </div>
        </div>
    );
}

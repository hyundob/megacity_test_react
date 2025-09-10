import { ForecastPredict } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { Cloud, Thermometer, Droplets, Wind, Gauge, Sun } from 'lucide-react';

export default function ForecastInfoCard({ data }: { data: ForecastPredict }) {
    return (
        <div className="toss-card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">기상 예보 정보</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">실시간 기상 데이터</p>
                </div>
            </div>
            
            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">생성시간</span>
                    <span className="font-medium dark:text-gray-200">{formatTime(data.crtnTm)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">예측시간</span>
                    <span className="font-medium dark:text-gray-200">{formatTime(data.fcstTm)}</span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900 rounded-xl border border-orange-100 dark:border-orange-800">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center">
                        <Sun className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">일사량</div>
                        <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{data.fcstSrad.toFixed(1)} W/m²</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900 rounded-xl border border-red-100 dark:border-red-800">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center">
                        <Thermometer className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">기온</div>
                        <div className="text-lg font-bold text-red-700 dark:text-red-300">{data.fcstTemp.toFixed(1)}°C</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">습도</div>
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{data.fcstHumi.toFixed(1)}%</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900 rounded-xl border border-green-100 dark:border-green-800">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                        <Wind className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">풍속</div>
                        <div className="text-lg font-bold text-green-700 dark:text-green-300">{data.fcstWspd.toFixed(1)} m/s</div>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Gauge className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">기압</div>
                    <div className="text-lg font-bold text-gray-700 dark:text-gray-300">{data.fcstPsfc.toFixed(1)} hPa</div>
                </div>
            </div>
        </div>
    );
}
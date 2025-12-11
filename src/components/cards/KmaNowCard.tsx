import { formatWindDirection, formatSkyCondition } from '@/lib/utils';
import { Thermometer, Wind, Compass, CloudRain, Cloud } from 'lucide-react';

export default function KmaNowCard({ regionName, tempC, windMs, windDir, pty, ptyText, sky }: { regionName?: string; tempC: number | null; windMs: number | null; windDir: number | null; pty: number | null; ptyText?: string | null; sky?: number | null }) {
    const wind = formatWindDirection(windDir);
    
    return (
        <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">{regionName || '제주시'} 실황 (기상청)</h2>
                    <p className="text-sm text-gray-500">실시간 기상 현황</p>
                </div>
            </div>
            
            <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <Thermometer className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">기온</div>
                        <div className="text-lg font-bold text-red-700">{tempC ?? '--'}°C</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Wind className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">풍속</div>
                        <div className="text-lg font-bold text-green-700">{windMs ?? '--'} m/s</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Compass className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">풍향</div>
                        <div className="text-lg font-bold text-blue-700 flex items-center gap-1">
                            <span className="text-xl">{wind.arrow}</span>
                            <span className="text-sm">{wind.text}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CloudRain className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">강수형태</div>
                        <div className="text-sm font-bold text-purple-700">{ptyText ?? (pty ?? '--')}</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Cloud className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">하늘상태</div>
                        <div className="text-sm font-bold text-gray-700">{formatSkyCondition(sky)}</div>
                    </div>
                </div>
            </div>
            
            {!tempC && !windMs && !windDir && !pty && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
                    <div className="text-sm text-yellow-700 font-medium">API 키 설정 후 표시됩니다.</div>
                </div>
            )}
        </div>
    );
}



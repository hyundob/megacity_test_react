import { formatWindDirection, formatSkyCondition } from '@/lib/utils';
import { Thermometer, Wind, Compass, CloudRain, Cloud } from 'lucide-react';

export default function KmaNowCard({ regionName, tempC, windMs, windDir, pty, ptyText, sky }: { regionName?: string; tempC: number | null; windMs: number | null; windDir: number | null; pty: number | null; ptyText?: string | null; sky?: number | null }) {
    const wind = formatWindDirection(windDir);

    return (
        <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{regionName || '제주시'} 실황 (기상청)</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">실시간 기상 현황</p>
                </div>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <div className="w-8 h-8 bg-red-500/15 rounded-lg flex items-center justify-center">
                        <Thermometer className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">기온</div>
                        <div className="text-lg font-bold text-red-700 dark:text-red-300">{tempC ?? '--'}°C</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center">
                        <Wind className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">풍속</div>
                        <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{windMs ?? '--'} m/s</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center">
                        <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">풍향</div>
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                            <span className="text-xl">{wind.arrow}</span>
                            <span className="text-sm">{wind.text}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
                    <div className="w-8 h-8 bg-violet-500/15 rounded-lg flex items-center justify-center">
                        <CloudRain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">강수형태</div>
                        <div className="text-sm font-bold text-violet-700 dark:text-violet-300">{ptyText ?? (pty ?? '--')}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
                    <div className="w-8 h-8 bg-black/8 dark:bg-white/10 rounded-lg flex items-center justify-center">
                        <Cloud className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">하늘상태</div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatSkyCondition(sky)}</div>
                    </div>
                </div>
            </div>

            {!tempC && !windMs && !windDir && !pty && (
                <div className="mt-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-center">
                    <div className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">API 키 설정 후 표시됩니다.</div>
                </div>
            )}
        </div>
    );
}

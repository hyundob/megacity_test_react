import { HgGenInfo } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { Zap, Activity, Clock, Gauge } from 'lucide-react';

export default function HydrogenProductionCard({ lastItem, utilPct, latency, totalItems }: {
    lastItem: HgGenInfo | null;
    utilPct: number | null;
    latency: number | null;
    totalItems: number;
}) {
    if (!lastItem) return null;
    return (
        <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1">
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">수소 생산량</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400">실시간 생산 현황</p>
                </div>
                <div className="text-xs bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 rounded-full px-2 py-0.5 font-medium">
                    {totalItems} 활성
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">기준시간</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatTime(lastItem.tm)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">마지막 동기화</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                        {(() => {
                            const now = new Date();
                            const s = lastItem.tm;
                            const d = new Date(
                                Number(s.slice(0,4)), Number(s.slice(4,6))-1, Number(s.slice(6,8)),
                                Number(s.slice(8,10)), Number(s.slice(10,12))
                            );
                            const diffMin = Math.max(0, Math.round((now.getTime() - d.getTime())/60000));
                            return `${diffMin}분 전`;
                        })()}
                    </span>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">자원 활용률</span>
                    <span className="font-bold text-cyan-700 dark:text-cyan-400">{utilPct !== null ? `${utilPct}%` : '--%'}</span>
                </div>
                <div className="w-full h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-2.5 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-500"
                        style={{ width: `${utilPct ?? 0}%` }}
                    />
                </div>
            </div>

            <div className="mb-4 flex items-center justify-center p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">응답 시간:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{latency !== null ? `${latency}초` : '—'}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="w-7 h-7 bg-blue-500/15 rounded-md flex items-center justify-center">
                        <Gauge className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">설비 용량</div>
                        <div className="text-base font-bold text-blue-700 dark:text-blue-300">{Math.round(lastItem.hgenCapa).toLocaleString()} KG</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="w-7 h-7 bg-emerald-500/15 rounded-md flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">수소 생산량</div>
                        <div className="text-base font-bold text-emerald-700 dark:text-emerald-300">{Math.round(lastItem.hgenProd).toLocaleString()} KG</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

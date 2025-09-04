import { HgGenInfo } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { Zap, Activity, Clock, Gauge } from 'lucide-react';

export default function HydrogenProductionCard({lastItem, utilPct, latency, totalItems,}: {
    lastItem: HgGenInfo | null;
    utilPct: number | null;
    latency: number | null;
    totalItems: number;
}) {
    if (!lastItem) return null;
    return (
        <div className="toss-card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-cyan-500" />
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-800">수소 생산량</h2>
                    <p className="text-sm text-gray-500">실시간 생산 현황</p>
                </div>
                <div className="text-xs bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-full px-3 py-1 font-medium">
                    {totalItems} 활성
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">기준시간</span>
                    <span className="font-medium">{formatTime(lastItem.tm)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">마지막 동기화</span>
                    <span className="font-medium">
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

            <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-600 font-medium">자원 활용률</span>
                    <span className="font-bold text-cyan-600">{utilPct !== null ? `${utilPct}%` : '--%'}</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-3 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-500" 
                        style={{ width: `${utilPct ?? 0}%` }} 
                    />
                </div>
            </div>

            <div className="mb-6 flex items-center justify-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">응답 시간:</span>
                    <span className="font-semibold text-gray-700">{latency !== null ? `${latency}초` : '—'}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Gauge className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">설비 용량</div>
                        <div className="text-lg font-bold text-blue-700">{Math.round(lastItem.hgenCapa).toLocaleString()} KG</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">수소 생산량</div>
                        <div className="text-lg font-bold text-green-700">{Math.round(lastItem.hgenProd).toLocaleString()} KG</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

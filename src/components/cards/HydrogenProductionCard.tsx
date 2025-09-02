import { HgGenInfo } from '@/lib/types';
import { formatTime } from '@/lib/utils';

export default function HydrogenProductionCard({lastItem, utilPct, latency, totalItems,}: {
    lastItem: HgGenInfo | null;
    utilPct: number | null;
    latency: number | null;
    totalItems: number;
}) {
    if (!lastItem) return null;
    return (
        <div className="p-6 bg-white rounded-2xl shadow-md">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">수소 생산량</h2>
                    <p className="text-sm text-gray-500 mt-1">기준시간 : {formatTime(lastItem.tm)}</p>
                </div>
                <div className="flex items-center">
          <span className="text-xs bg-gray-100 text-gray-700 border border-gray-200 rounded-full px-2 py-1">
            {totalItems} 활성
          </span>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                <span>연결된 자원</span>
                <span>
          마지막 동기화:{' '}
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

            <div className="mt-2">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-black rounded-full transition-all" style={{ width: `${utilPct ?? 0}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">자원 활용률</span>
                    <span className="font-semibold">{utilPct !== null ? `${utilPct}%` : '--%'}</span>
                </div>
            </div>

            <div className="text-center mt-3 text-sm">
                <span className="text-gray-500">응답 시간: </span>
                <span className="font-semibold">{latency !== null ? `${latency}초` : '—'}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                    <div className="text-xs text-gray-500 mb-1">설비 용량(KG)</div>
                    <div className="text-lg font-semibold">{Math.round(lastItem.hgenCapa).toLocaleString()}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 mb-1">수소 생산량(KG)</div>
                    <div className="text-lg font-semibold">{Math.round(lastItem.hgenProd).toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
}

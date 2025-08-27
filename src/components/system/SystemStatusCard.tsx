import { ServiceHealth } from '@/lib/types';
import { healthDot, healthText } from '@/lib/utils';

function Item({ name, ms, health }: { name: string; ms: number | null; health: ServiceHealth }) {
    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${healthDot(health)}`} />
                <span className="text-gray-800">{name}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{ms !== null ? `${ms}ms` : '—'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border
          ${health==='ok' ? 'bg-green-50 text-green-700 border-green-200' :
                    health==='slow' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'}`}>
          {healthText(health)}
        </span>
            </div>
        </div>
    );
}

export default function SystemStatusCard(props: {
    latApi: number | null; latDb: number | null; latPredict: number | null;
    healthApi: ServiceHealth; healthDb: ServiceHealth; healthPredict: ServiceHealth;
}) {
    const { latApi, latDb, latPredict, healthApi, healthDb, healthPredict } = props;
    return (
        <div className="p-6 bg-white rounded-2xl shadow-md md:col-span-2">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-800">시스템 상태</h2>
                <div className="flex items-center gap-2 text-gray-400">
                    <button className="hover:text-gray-600" title="확대">⤢</button>
                    <button className="hover:text-gray-600" title="더보기">⋯</button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Item name="API 서버" ms={latApi} health={healthApi} />
                <Item name="데이터베이스" ms={latDb} health={healthDb} />
                <Item name="예측 엔진" ms={latPredict} health={healthPredict} />
            </div>
        </div>
    );
}

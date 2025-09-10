import { ServiceHealth } from '@/lib/types';
import { healthDot, healthText } from '@/lib/utils';
import { Server, Database, Cpu, LucideIcon } from 'lucide-react';

function Item({ name, ms, health, icon: Icon }: { name: string; ms: number | null; health: ServiceHealth; icon: LucideIcon }) {
    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    health === 'ok' ? 'bg-green-100 dark:bg-green-900' : 
                    health === 'slow' ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'
                }`}>
                    <Icon className={`w-4 h-4 ${
                        health === 'ok' ? 'text-green-600 dark:text-green-400' : 
                        health === 'slow' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                    }`} />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ms !== null ? `${ms}ms` : '—'}</p>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    health === 'ok' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    health === 'slow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }`}>
                    {healthText(health)}
                </span>
                <div className={`w-2 h-2 rounded-full ${healthDot(health)}`} />
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
        <div className="toss-card p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                    <Server className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">시스템 상태</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">서비스 상태 및 응답 시간</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Item name="API 서버" ms={latApi} health={healthApi} icon={Server} />
                <Item name="데이터베이스" ms={latDb} health={healthDb} icon={Database} />
                <Item name="예측 엔진" ms={latPredict} health={healthPredict} icon={Cpu} />
            </div>
        </div>
    );
}

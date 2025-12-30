import { ServiceHealth } from '@/lib/types';
import { healthDot, healthText } from '@/lib/utils';
import { Server, Database, Cpu, LucideIcon } from 'lucide-react';

function Item({ name, ms, health, icon: Icon }: { name: string; ms: number | null; health: ServiceHealth; icon: LucideIcon }) {
    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                    health === 'ok' ? 'bg-green-100 dark:bg-green-900' : 
                    health === 'slow' ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'
                }`}>
                    <Icon className={`w-3.5 h-3.5 ${
                        health === 'ok' ? 'text-green-600 dark:text-green-400' : 
                        health === 'slow' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                    }`} />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ms !== null ? `${ms}ms` : '—'}</p>
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
        <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Server className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-gray-800 dark:text-gray-200">시스템 상태</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">서비스 상태 및 응답 시간</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Item name="API" ms={latApi} health={healthApi} icon={Server} />
                <Item name="DB" ms={latDb} health={healthDb} icon={Database} />
                <Item name="예측 엔진" ms={latPredict} health={healthPredict} icon={Cpu} />
            </div>
        </div>
    );
}

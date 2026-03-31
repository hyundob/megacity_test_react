import { ServiceHealth } from '@/lib/types';
import { healthDot, healthText } from '@/lib/utils';
import { Server, Database, Cpu, LucideIcon } from 'lucide-react';

function Item({ name, ms, health, icon: Icon }: { name: string; ms: number | null; health: ServiceHealth; icon: LucideIcon }) {
    return (
        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-black/8 dark:border-white/8 hover:bg-black/8 dark:hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                    health === 'ok' ? 'bg-green-500/15' :
                    health === 'slow' ? 'bg-yellow-500/15' : 'bg-red-500/15'
                }`}>
                    <Icon className={`w-3.5 h-3.5 ${
                        health === 'ok' ? 'text-green-600 dark:text-green-400' :
                        health === 'slow' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                    }`} />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{name}</h3>
                    <p className="text-xs text-slate-500">{ms !== null ? `${ms}ms` : '—'}</p>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    health === 'ok' ? 'bg-green-500/15 text-green-700 dark:text-green-400' :
                    health === 'slow' ? 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-500/15 text-red-700 dark:text-red-400'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Item name="API" ms={latApi} health={healthApi} icon={Server} />
                <Item name="DB" ms={latDb} health={healthDb} icon={Database} />
                <Item name="예측 엔진" ms={latPredict} health={healthPredict} icon={Cpu} />
            </div>
        </div>
    );
}

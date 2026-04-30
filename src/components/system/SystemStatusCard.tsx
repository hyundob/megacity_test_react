import { ServiceHealth } from '@/lib/types';
import { healthDot, healthText } from '@/lib/utils';
import { Cpu, Database, LucideIcon, Server } from 'lucide-react';

function Item({
    name,
    ms,
    health,
    icon: Icon,
}: {
    name: string;
    ms: number | null;
    health: ServiceHealth;
    icon: LucideIcon;
}) {
    return (
        <div className="min-w-0 rounded-lg border border-black/8 bg-black/5 p-2 transition-colors hover:bg-black/8 dark:border-white/8 dark:bg-white/5 dark:hover:bg-white/10">
            <div className="mb-2 flex min-w-0 items-center gap-1.5">
                <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                        health === 'ok'
                            ? 'bg-green-500/15'
                            : health === 'slow'
                              ? 'bg-yellow-500/15'
                              : 'bg-red-500/15'
                    }`}
                >
                    <Icon
                        className={`h-3.5 w-3.5 ${
                            health === 'ok'
                                ? 'text-green-600 dark:text-green-400'
                                : health === 'slow'
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-red-600 dark:text-red-400'
                        }`}
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="truncate whitespace-nowrap text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {name}
                    </h3>
                    <p className="truncate text-[11px] text-slate-500">
                        {ms !== null ? `${ms}ms` : '--'}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                        health === 'ok'
                            ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                            : health === 'slow'
                              ? 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
                              : 'bg-red-500/15 text-red-700 dark:text-red-400'
                    }`}
                >
                    {healthText(health)}
                </span>
                <div className={`h-2 w-2 shrink-0 rounded-full ${healthDot(health)}`} />
            </div>
        </div>
    );
}

export default function SystemStatusCard(props: {
    latApi: number | null;
    latDb: number | null;
    latPredict: number | null;
    healthApi: ServiceHealth;
    healthDb: ServiceHealth;
    healthPredict: ServiceHealth;
}) {
    const { latApi, latDb, latPredict, healthApi, healthDb, healthPredict } = props;

    return (
        <div className="min-w-0">
            <div className="grid grid-cols-3 gap-2">
                <Item name="API" ms={latApi} health={healthApi} icon={Server} />
                <Item name="DB" ms={latDb} health={healthDb} icon={Database} />
                <Item name="예측 엔진" ms={latPredict} health={healthPredict} icon={Cpu} />
            </div>
        </div>
    );
}

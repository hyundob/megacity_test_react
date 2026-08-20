import { ForecastPredict } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { Droplets, Gauge, Sun, Thermometer, Wind } from 'lucide-react';

export default function ForecastInfoCard({ data }: { data: ForecastPredict }) {
    return (
        <div>
            <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">생성시간</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatTime(data.crtnTm)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">예측시간</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatTime(data.fcstTm)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <ForecastMetric
                    icon={Sun}
                    label="일사량"
                    value={data.fcstSrad}
                    unit="W/m2"
                    tone="orange"
                />
                <ForecastMetric
                    icon={Thermometer}
                    label="기온"
                    value={data.fcstTemp}
                    unit="C"
                    tone="red"
                />
                <ForecastMetric
                    icon={Droplets}
                    label="습도"
                    value={data.fcstHumi}
                    unit="%"
                    tone="blue"
                />
                <ForecastMetric
                    icon={Wind}
                    label="풍속"
                    value={data.fcstWspd}
                    unit="m/s"
                    tone="emerald"
                />
            </div>

            <div className="mt-3">
                <ForecastMetric
                    icon={Gauge}
                    label="기압"
                    value={data.fcstPsfc}
                    unit="hPa"
                    tone="slate"
                    wide
                />
            </div>
        </div>
    );
}

function ForecastMetric({
    icon: Icon,
    label,
    value,
    unit,
    tone,
    wide = false,
}: {
    icon: typeof Sun;
    label: string;
    value: number;
    unit: string;
    tone: 'orange' | 'red' | 'blue' | 'emerald' | 'slate';
    wide?: boolean;
}) {
    const toneClasses = {
        orange: 'bg-[#FFD166]/10 border-[#FFD166]/25 text-[#C98A00] dark:text-[#FFD166]',
        red: 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300',
        blue: 'bg-[#118AB2]/8 border-[#118AB2]/20 text-[#118AB2] dark:text-[#3FB8DE]',
        emerald: 'bg-[#049B78]/10 border-[#049B78]/25 text-[#049B78] dark:text-[#06D6A0]',
        slate: 'bg-black/5 border-black/8 text-slate-700 dark:bg-white/5 dark:border-white/8 dark:text-slate-200',
    };
    const iconClasses = {
        orange: 'bg-[#FFD166]/15 text-[#C98A00] dark:text-[#FFD166]',
        red: 'bg-red-500/15 text-red-600 dark:text-red-400',
        blue: 'bg-[#118AB2]/12 text-[#118AB2] dark:text-[#3FB8DE]',
        emerald: 'bg-[#049B78]/15 text-[#049B78] dark:text-[#06D6A0]',
        slate: 'bg-black/8 text-slate-500 dark:bg-white/10 dark:text-slate-400',
    };

    return (
        <div className={`flex items-center gap-2 rounded-lg border p-3 ${toneClasses[tone]} ${wide ? 'w-full' : ''}`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${iconClasses[tone]}`}>
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</div>
                <div className="truncate text-base font-bold">
                    {value != null ? value.toFixed(1) : 'N/A'} {unit}
                </div>
            </div>
        </div>
    );
}

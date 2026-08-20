import { SukubOperation, SukubOperationItem } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { Zap, Activity, Sun, Wind, Battery } from 'lucide-react';

interface SukubInfoCardProps {
    data: SukubOperation;
    dailyData?: SukubOperationItem[];
}

export default function SukubInfoCard({ data }: SukubInfoCardProps) {
    return (
        <div className="relative">
            <div className="mb-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">기준시각</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatTime(data.tm)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="relative flex items-center gap-2 p-3 bg-[#118AB2]/8 rounded-lg border border-[#118AB2]/20">
                    <div className="w-7 h-7 bg-[#118AB2]/12 rounded-md flex items-center justify-center">
                        <Battery className="w-3.5 h-3.5 text-[#118AB2] dark:text-[#3FB8DE]" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">공급능력</div>
                        <div className="text-base font-bold text-[#118AB2] dark:text-[#3FB8DE]">{data.suppAbility.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                    </div>
                </div>

                <div className="relative flex items-center gap-2 p-3 bg-[#E8483F]/10 rounded-lg border border-[#E8483F]/25">
                    <div className="w-7 h-7 bg-[#E8483F]/15 rounded-md flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5 text-[#E8483F] dark:text-[#FF6B6B]" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">현재수요</div>
                        <div className="text-base font-bold text-[#E8483F] dark:text-[#FF6B6B]">{data.currPwrTot.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                    </div>
                </div>

                <div className="relative flex items-center gap-2 p-3 bg-[#049B78]/10 rounded-lg border border-[#049B78]/25">
                    <div className="w-7 h-7 bg-[#049B78]/15 rounded-md flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-[#049B78] dark:text-[#06D6A0]" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">신재생합계</div>
                        <div className="text-base font-bold text-[#049B78] dark:text-[#06D6A0]">{data.renewPwrTot.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                    </div>
                </div>

                <div className="relative flex items-center gap-2 p-3 bg-[#FFD166]/10 rounded-lg border border-[#FFD166]/25">
                    <div className="w-7 h-7 bg-[#FFD166]/15 rounded-md flex items-center justify-center">
                        <Sun className="w-3.5 h-3.5 text-[#C98A00] dark:text-[#FFD166]" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">태양광합계</div>
                        <div className="text-base font-bold text-[#C98A00] dark:text-[#FFD166]">{data.renewPwrSolar.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                    </div>
                </div>
            </div>

            <div className="relative mt-3 flex items-center gap-2 p-3 bg-[#049B78]/10 rounded-lg border border-[#049B78]/25">
                <div className="w-7 h-7 bg-[#049B78]/15 rounded-md flex items-center justify-center">
                    <Wind className="w-3.5 h-3.5 text-[#049B78] dark:text-[#06D6A0]" />
                </div>
                <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">풍력합계</div>
                    <div className="text-base font-bold text-[#049B78] dark:text-[#06D6A0]">{data.renewPwrWind.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                </div>
            </div>
        </div>
    );
}

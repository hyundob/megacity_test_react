import { SukubOperation } from '../../lib/types';
import { formatTime } from '../../lib/utils';
import { Zap, Activity, Sun, Wind, Battery } from 'lucide-react';

export default function SukubInfoCard({ data }: { data: SukubOperation }) {
    return (
        <div className="toss-card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">제주 계통 운영 정보</h2>
                    <p className="text-sm text-gray-500">전력 시스템 현황</p>
                </div>
            </div>
            
            <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">기준시각</span>
                    <span className="font-medium">{formatTime(data.tm)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Battery className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">공급능력</div>
                        <div className="text-lg font-bold text-blue-700">{data.suppAbility} MW</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">현재수요</div>
                        <div className="text-lg font-bold text-red-700">{data.currPwrTot} MW</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">신재생합계</div>
                        <div className="text-lg font-bold text-green-700">{data.renewPwrTot} MW</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Sun className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">태양광합계</div>
                        <div className="text-lg font-bold text-orange-700">{data.renewPwrSolar} MW</div>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 flex items-center gap-3 p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Wind className="w-4 h-4 text-cyan-600" />
                </div>
                <div>
                    <div className="text-xs text-gray-500 font-medium">풍력합계</div>
                    <div className="text-lg font-bold text-cyan-700">{data.renewPwrWind} MW</div>
                </div>
            </div>
        </div>
    );
}

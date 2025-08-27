import { EssPoint } from '@/lib/types';
import { formatSoc } from '@/lib/utils';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';

export default function EssStrategyCard({
                                            series, currentSoc, bestChrgTimes, bestDiscTimes
                                        }: {
    series: EssPoint[];
    currentSoc: number | null;
    bestChrgTimes: string[];
    bestDiscTimes: string[];
}) {
    if (!series.length) return null;
    const hasSoc = series.some(p => typeof p.soc === 'number');

    return (
        <div className="p-6 bg-white rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">ESS 운영 전략</h2>
                <div className="text-sm">현재 SoC : <span className="font-semibold">{formatSoc(currentSoc)}</span></div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={series} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" unit=" MWh" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" unit=" MW" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="soc" orientation="right" domain={[0, 100]} unit=" %" hide />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="essChrg" name="ESS 충전 (MWh)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="left" type="monotone" dataKey="essDisc" name="ESS 방전 (MWh)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="essCapa" name="ESS 용량 (MW)" stroke="#10b981" strokeWidth={2} dot={false} />
                    {hasSoc && (
                        <Line yAxisId="soc" type="monotone" dataKey="soc" name="SoC (%)" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                    )}
                </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 font-semibold mb-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500" /> 충전
                    </div>
                    <div className="text-gray-600">최적 충전 시간:</div>
                    <div className="font-medium mt-1">{bestChrgTimes.length ? bestChrgTimes.join(', ') : '-'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 font-semibold mb-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500" /> 방전
                    </div>
                    <div className="text-gray-600">최적 방전 시간:</div>
                    <div className="font-medium mt-1">{bestDiscTimes.length ? bestDiscTimes.join(', ') : '-'}</div>
                </div>
            </div>
        </div>
    );
}

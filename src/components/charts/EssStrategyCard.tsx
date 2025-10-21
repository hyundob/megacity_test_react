import { EssPoint } from '@/lib/types';
import { formatSoc } from '@/lib/utils';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Battery } from 'lucide-react';

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
        <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Battery className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-800">ESS 운영 전략</h2>
                    <p className="text-sm text-gray-500">충전/방전 최적화 전략</p>
                </div>
                <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                    현재 SoC: <span className="font-semibold text-green-600">{formatSoc(currentSoc)}</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={series} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                    <YAxis yAxisId="left" unit=" MWh" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                    <YAxis yAxisId="right" orientation="right" unit=" MW" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                    <YAxis yAxisId="soc" orientation="right" domain={[0, 100]} unit=" %" hide />
                    <RechartsTooltip 
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="essChrg" name="ESS 충전 (MWh)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="left" type="monotone" dataKey="essDisc" name="ESS 방전 (MWh)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="essCapa" name="ESS 용량 (MW)" stroke="#10b981" strokeWidth={2} dot={false} />
                    {hasSoc && (
                        <Line yAxisId="soc" type="monotone" dataKey="soc" name="SoC (%)" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                    )}
                </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 font-semibold mb-2 text-blue-700">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs">⚡</span>
                        </div>
                        충전
                    </div>
                    <div className="text-sm text-gray-600 mb-1">최적 충전 시간:</div>
                    <div className="font-medium text-blue-800">{bestChrgTimes.length ? bestChrgTimes.join(', ') : '-'}</div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 font-semibold mb-2 text-red-700">
                        <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs">🔋</span>
                        </div>
                        방전
                    </div>
                    <div className="text-sm text-gray-600 mb-1">최적 방전 시간:</div>
                    <div className="font-medium text-red-800">{bestDiscTimes.length ? bestDiscTimes.join(', ') : '-'}</div>
                </div>
            </div>
        </div>
    );
}

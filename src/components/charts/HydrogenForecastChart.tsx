import { HgGenPredict } from '@/lib/types';
import {
    ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Zap } from 'lucide-react';

export default function HydrogenForecastChart({ data }: { data: HgGenPredict[] }) {
    const rows = data.map(d => ({ ...d, hour: d.fcstTm.slice(8, 10) + ':00' }));
    return (
        <div className="toss-card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-cyan-500" />
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-800">수소 예측 생산량</h2>
                    <p className="text-sm text-gray-500">수소 생산량 및 설비용량 예측</p>
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {rows.length ? `${rows[rows.length-1].fcstTm.slice(0,4)}-${rows[rows.length-1].fcstTm.slice(4,6)}-${rows[rows.length-1].fcstTm.slice(6,8)} ${rows[rows.length-1].fcstTm.slice(8,10)}:${rows[rows.length-1].fcstTm.slice(10,12)}` : '-'}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={rows} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="gradQgen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="gradCapa" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                    <YAxis yAxisId="left" unit=" MWh" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickFormatter={(value) => value.toLocaleString()} />
                    <YAxis yAxisId="right" orientation="right" unit=" MW" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickFormatter={(value) => value.toLocaleString()} />
                    <RechartsTooltip
                        formatter={(v: number, name: string) => {
                            if (name.includes('최종생산량')) return [`${v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MWh`, name];
                            if (name.includes('예측설비용량')) return [`${v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW`, name];
                            return [v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','), name];
                        }}
                        labelFormatter={(label) => `시간: ${label}`}
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '13px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="fcstQgen" name="최종생산량(MWh)" stroke="#f59e0b" fill="url(#gradQgen)" strokeWidth={3} activeDot={{ r: 5 }} />
                    <Area yAxisId="right" type="monotone" dataKey="fcstCapa" name="예측설비용량(MW)" stroke="#60a5fa" fill="url(#gradCapa)" strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

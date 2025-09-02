import { HgGenPredict } from '../../lib/types';
import {
    ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';

export default function HydrogenForecastChart({ data }: { data: HgGenPredict[] }) {
    const rows = data.map(d => ({ ...d, hour: d.fcstTm.slice(8, 10) + ':00' }));
    return (
        <div className="p-6 bg-white rounded-2xl shadow-md">
            <h2 className="text-xl font-bold mb-1 text-gray-800">수소 예측 생산량</h2>
            <p className="text-sm text-gray-500 mb-3">예측시간 : {rows.length ? `${rows[rows.length-1].fcstTm.slice(0,4)}-${rows[rows.length-1].fcstTm.slice(4,6)}-${rows[rows.length-1].fcstTm.slice(6,8)} ${rows[rows.length-1].fcstTm.slice(8,10)}:${rows[rows.length-1].fcstTm.slice(10,12)}` : '-'}</p>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" unit=" MWh" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" unit=" MW" tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                        formatter={(v: number, name: string) => {
                            if (name.includes('최종생산량')) return [`${v} MWh`, name];
                            if (name.includes('예측설비용량')) return [`${v} MW`, name];
                            return [v, name];
                        }}
                        labelFormatter={(label) => `시간: ${label}`}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                    />
                    <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '13px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="fcstQgen" name="최종생산량(MWh)" stroke="#f59e0b" fill="url(#gradQgen)" strokeWidth={2} activeDot={{ r: 5 }} />
                    <Area yAxisId="right" type="monotone" dataKey="fcstCapa" name="예측설비용량(MW)" stroke="#60a5fa" fill="url(#gradCapa)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

import { Curt } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';

export default function CurtChart({ data }: { data: Curt[] }) {
    const rows = data.map(d => ({ ...d, hour: d.fcstTm.slice(8, 10) + ':00' }));
    return (
        <div className="p-6 bg-white rounded-2xl shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">출력제어 · 최소출력 추이</h2>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={rows} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" unit=" MW/m2" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" unit=" MW/m2" tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                        formatter={(value: number, name: string) => {
                            if (name.includes('최소출력')) return [`${value} MW/m2`, name];
                            if (name.includes('출력제어')) return [`${value} MW/m2`, name];
                            return [value, name];
                        }}
                        labelFormatter={(label) => `시간: ${label}`}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="fcstMinpw" name="중앙급전 최소출력량 (MW/m2)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="fcstCurt" name="출력제어량 (MW/m2)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

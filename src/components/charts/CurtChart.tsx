import { JejuCurtPredict } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Settings } from 'lucide-react';

export default function CurtChart({ data }: { data: JejuCurtPredict[] }) {
    const rows = data.map(d => ({ ...d, hour: d.fcstTm.slice(8, 10) + ':00' }));
    return (
        <div className="toss-card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">출력제어 · 최소출력 추이</h2>
                    <p className="text-sm text-gray-500">제주도 출력제어 현황</p>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={rows} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                    <YAxis yAxisId="left" unit=" MW/m2" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                    <YAxis yAxisId="right" orientation="right" unit=" MW/m2" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                    <RechartsTooltip
                        formatter={(value: number, name: string) => {
                            if (name.includes('최소출력')) return [`${value} MW/m2`, name];
                            if (name.includes('출력제어')) return [`${value} MW/m2`, name];
                            return [value, name];
                        }}
                        labelFormatter={(label) => `시간: ${label}`}
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="fcstMinpw" name="중앙급전 최소출력량 (MW/m2)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="fcstCurt" name="출력제어량 (MW/m2)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

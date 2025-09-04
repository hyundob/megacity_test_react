import { ReGenPredict } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Sun } from 'lucide-react';

export default function SolarPredictChart({ data }: { data: ReGenPredict[] }) {
    const rows = data.map(d => ({ ...d, hour: d.fcstTm.slice(8, 10) + ':00' }));
    return (
        <div className="toss-card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Sun className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">태양광 발전 예측</h2>
                    <p className="text-sm text-gray-500">발전량 예측 및 범위</p>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={rows} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                    <YAxis unit=" MWh" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                    <RechartsTooltip 
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
                    <Line type="monotone" dataKey="fcstQgen" name="최종 발전량" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="fcstQgmx" name="최대 예측" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="fcstQgmn" name="최소 예측" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

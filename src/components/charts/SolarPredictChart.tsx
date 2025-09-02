import { ReGenPredict } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend
} from 'recharts';

export default function SolarPredictChart({ data }: { data: ReGenPredict[] }) {
    const rows = data.map(d => ({ ...d, hour: d.fcstTm.slice(8, 10) + ':00' }));
    return (
        <div className="p-6 bg-white rounded-2xl shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">태양광 발전 예측 차트</h2>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={rows} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis unit=" MWh" tick={{ fontSize: 12 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
                    <Line type="monotone" dataKey="fcstQgen" name="최종 발전량" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="fcstQgmx" name="최대 예측" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="fcstQgmn" name="최소 예측" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

import { PredictDemand } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';

export default function DemandPredictChart({ data }: { data: PredictDemand[] }) {
    const rows = data.map(d => ({ ...d, hour: d.fcstTm.slice(8, 10) + ':00' }));
    return (
        <div className="p-6 bg-white rounded-2xl shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">수요 추이 예측 차트</h2>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={rows} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis unit=" MW" tick={{ fontSize: 12 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
                    <Line type="monotone" dataKey="fcstQgen" name="최종 수요예측" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="fcstQgmx" name="수요예측 최대" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="fcstQgmn" name="수요예측 최소" stroke="#14b8a6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="currPwrTot" name="실제 수요" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

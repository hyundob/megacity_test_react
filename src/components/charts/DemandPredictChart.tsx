import { DemandPredict } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Activity } from 'lucide-react';

export default function DemandPredictChart({ data }: { data: DemandPredict[] }) {
    const rows = data.map(d => ({ ...d, hour: d.fcstTm.slice(8, 10) + ':00' }));
    return (
        <div className="toss-card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">수요 추이 예측</h2>
                    <p className="text-sm text-gray-500">전력 수요 예측 및 실제 수요</p>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={rows} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                    <YAxis unit=" MW" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickFormatter={(value) => value.toLocaleString()} />
                    <RechartsTooltip 
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: number, name: string) => [
                            `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW`, 
                            name
                        ]}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
                    <Line type="monotone" dataKey="fcstQgen" name="최종 수요예측" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="fcstQgmx" name="수요예측 최대" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="fcstQgmn" name="수요예측 최소" stroke="#14b8a6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="currPwrTot" name="실제 수요" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

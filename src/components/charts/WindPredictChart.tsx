import { ReGenPredict } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Wind } from 'lucide-react';

export default function WindPredictChart({ data }: { data: ReGenPredict[] }) {
    const rows = data.map(d => ({ 
        ...d, 
        hour: `${d.fcstTm.slice(4,6)}/${d.fcstTm.slice(6,8)} ${d.fcstTm.slice(8,10)}:00`
    }));
    
    return (
        <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                    <Wind className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">풍력 발전 예측</h2>
                    <p className="text-sm text-gray-500">최신 생성시간 기준 전체 예측</p>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={rows} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                    <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 12, fill: '#6b7280' }} 
                        axisLine={{ stroke: '#e5e7eb' }}
                        interval={Math.floor(rows.length / 10)}
                    />
                    <YAxis unit=" MWh" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickFormatter={(value) => value.toLocaleString()} />
                    <RechartsTooltip 
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: number, name: string) => [
                            `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MWh`, 
                            name
                        ]}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
                    <Line type="monotone" dataKey="fcstQgmx" name="최대 예측" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="fcstQgmn" name="최소 예측" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="fcstQgen" name="최종 발전량 예측" stroke="#06b6d4" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}


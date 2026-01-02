import { useMemo } from 'react';
import { JejuCurtPredict } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { CONFIG } from '@/lib/config';

export default function CurtChart({ data }: { data: JejuCurtPredict[] }) {
    const rows = useMemo(() => 
        data.map(d => ({ 
            ...d, 
            hour: `${d.fcstTm.slice(4,6)}/${d.fcstTm.slice(6,8)} ${d.fcstTm.slice(8, 10)}:00`
        })),
        [data]
    );
    
    const xAxisInterval = useMemo(() => 
        Math.max(0, Math.floor(rows.length / CONFIG.CHART.MAX_XAXIS_TICKS) - 1),
        [rows.length]
    );
    
    return (
        <div className="w-full" role="img" aria-label="출력제어 예측 차트">
            <ResponsiveContainer width="100%" height={CONFIG.CHART.DEFAULT_HEIGHT}>
                <LineChart data={rows} margin={CONFIG.CHART.MARGIN}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                    <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 10, fill: '#6b7280' }} 
                        axisLine={{ stroke: '#e5e7eb' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={xAxisInterval}
                        label={{ value: '시간', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' } }}
                    />
                    <YAxis 
                        yAxisId="left" 
                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                        axisLine={{ stroke: '#e5e7eb' }} 
                        tickFormatter={(value) => value.toLocaleString()}
                        label={{ value: '최소출력 (MW)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' } }}
                    />
                    <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                        axisLine={{ stroke: '#e5e7eb' }} 
                        tickFormatter={(value) => value.toLocaleString()}
                        label={{ value: '출력제어 (MW)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' } }}
                    />
                    <RechartsTooltip
                        formatter={(value: number, name: string) => {
                            if (name.includes('최소출력')) return [`${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW`, name];
                            if (name.includes('출력제어')) return [`${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW`, name];
                            return [value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','), name];
                        }}
                        labelFormatter={(label) => `시간: ${label}`}
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20, fontSize: '12px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="fcstMinpw" name="최소출력" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="fcstCurt" name="출력제어" stroke="#dc2626" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

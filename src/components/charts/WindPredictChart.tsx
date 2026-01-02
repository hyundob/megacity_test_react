import { useMemo } from 'react';
import { ReGenPredict } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { CONFIG } from '@/lib/config';

export default function WindPredictChart({ data }: { data: ReGenPredict[] }) {
    const rows = useMemo(() => 
        data.map(d => ({ 
            ...d, 
            hour: `${d.fcstTm.slice(4,6)}/${d.fcstTm.slice(6,8)} ${d.fcstTm.slice(8,10)}:00`
        })), 
        [data]
    );
    
    const xAxisInterval = useMemo(() => 
        Math.max(0, Math.floor(rows.length / CONFIG.CHART.MAX_XAXIS_TICKS) - 1),
        [rows.length]
    );
    
    return (
        <div className="w-full" role="img" aria-label="풍력 발전 예측 차트">
            <ResponsiveContainer width="100%" height={CONFIG.CHART.DEFAULT_HEIGHT}>
                <LineChart data={rows} margin={CONFIG.CHART.MARGIN}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                    <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.8)' }} 
                        axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={xAxisInterval}
                        label={{ value: '시간', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' } }}
                    />
                    <YAxis 
                        tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} 
                        axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} 
                        tickFormatter={(value) => value.toLocaleString()}
                        label={{ value: '발전량 (MWh)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' } }}
                    />
                    <RechartsTooltip 
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelFormatter={(label: string) => `시간: ${label}`}
                        labelStyle={{ color: '#4b5563', fontSize: 12, marginBottom: 4 }}
                        formatter={(value: number, name: string) => [
                            `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MWh`, 
                            name
                        ]}
                    />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20, fontSize: '12px' }} />
                    <Line type="monotone" dataKey="fcstQgmx" name="최대 예측" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="fcstQgmn" name="최소 예측" stroke="#a5b4fc" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="fcstQgen" name="최종 발전량 예측" stroke="#67e8f9" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}


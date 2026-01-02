import { useMemo } from 'react';
import { HgGenPredict } from '@/lib/types';
import {
    ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { CONFIG } from '@/lib/config';

export default function HydrogenForecastChart({ data }: { data: HgGenPredict[] }) {
    const rows = useMemo(() => 
        data.map(d => ({ ...d, hour: d.fcstTm.slice(8, 10) + ':00' })),
        [data]
    );
    
    const xAxisInterval = useMemo(() => 
        Math.max(0, Math.floor(rows.length / CONFIG.CHART.MAX_XAXIS_TICKS) - 1),
        [rows.length]
    );
    
    return (
        <div className="w-full" role="img" aria-label="수소 생산량 예측 차트">
            <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={rows} margin={CONFIG.CHART.MARGIN}>
                    <defs>
                        <linearGradient id="gradQgen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="gradCapa" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
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
                        yAxisId="left" 
                        tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} 
                        axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} 
                        tickFormatter={(value) => value.toLocaleString()}
                        label={{ value: '생산량 (MWh)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' } }}
                    />
                    <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} 
                        axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} 
                        tickFormatter={(value) => value.toLocaleString()}
                        label={{ value: '설비용량 (MW)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' } }}
                    />
                    <RechartsTooltip
                        formatter={(v: number, name: string) => {
                            if (name.includes('최종생산량')) return [`${v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MWh`, name];
                            if (name.includes('예측설비용량')) return [`${v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW`, name];
                            return [v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','), name];
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
                    <Area yAxisId="left" type="monotone" dataKey="fcstQgen" name="최종생산량" stroke="#ffffff" fill="url(#gradQgen)" strokeWidth={3} strokeDasharray="5 5" activeDot={{ r: 5 }} />
                    <Area yAxisId="right" type="monotone" dataKey="fcstCapa" name="예측설비용량" stroke="#fbbf24" fill="url(#gradCapa)" strokeWidth={3} strokeDasharray="5 5" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

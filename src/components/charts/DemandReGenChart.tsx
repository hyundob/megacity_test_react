import { useMemo } from 'react';
import { DemandPredict, ReGenPredict } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { CONFIG } from '@/lib/config';

interface DemandReGenChartProps {
    demandData: DemandPredict[];
    reGenData: ReGenPredict[];
    windData: ReGenPredict[];
}

export default function DemandReGenChart({ demandData, reGenData, windData }: DemandReGenChartProps) {
    // 시간대별로 데이터 병합
    const mergedData = useMemo(() => demandData.map(demand => {
        const matchingSolar = reGenData.find(regen => regen.fcstTm === demand.fcstTm);
        const matchingWind = windData.find(wind => wind.fcstTm === demand.fcstTm);
        
        // 태양광 + 풍력 = 총 신재생 발전량
        const solarGen = matchingSolar ? matchingSolar.fcstQgen : 0;
        const windGen = matchingWind ? matchingWind.fcstQgen : 0;
        const totalRenewGen = solarGen + windGen;
        
        return {
            ...demand,
            hour: `${demand.fcstTm.slice(4,6)}/${demand.fcstTm.slice(6,8)} ${demand.fcstTm.slice(8, 10)}:00`,
            // 신재생 발전량 (태양광 + 풍력)
            renewGen: totalRenewGen > 0 ? totalRenewGen : null,
            solarGen: solarGen > 0 ? solarGen : null,
            windGen: windGen > 0 ? windGen : null,
        };
    }), [demandData, reGenData, windData]);
    
    const xAxisInterval = useMemo(() => 
        Math.max(0, Math.floor(mergedData.length / CONFIG.CHART.MAX_XAXIS_TICKS) - 1),
        [mergedData.length]
    );

    return (
        <div className="w-full" role="img" aria-label="수요 vs 재생에너지 비교 차트">
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={mergedData} margin={CONFIG.CHART.MARGIN}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
                    <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        angle={-45}
                        textAnchor="end"
                        tickMargin={8}
                        height={60}
                        axisLine={{ stroke: '#e5e7eb' }}
                        interval={xAxisInterval}
                        label={{ value: '시간', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' } }}
                    />
                    {/* 좌측 Y축: 전력량 (MWh) */}
                    <YAxis 
                        yAxisId="power" 
                        orientation="left" 
                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                        domain={["auto","auto"]} 
                        axisLine={{ stroke: '#e5e7eb' }}
                        label={{ value: '전력량 (MWh)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' } }}
                        tickFormatter={(value) => value.toLocaleString()}
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
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20, fontSize: '12px', color: '#4b5563' }} />
                    
                    {/* 수요 관련 라인들 */}
                    <Line 
                        yAxisId="power" 
                        type="monotone" 
                        dataKey="fcstQgen" 
                        name="수요예측" 
                        stroke="#2563eb" 
                        strokeWidth={3} 
                        strokeDasharray="5 5"
                        dot={false} 
                    />
                    
                    {/* 신재생 발전량 */}
                    <Line 
                        yAxisId="power" 
                        type="monotone" 
                        dataKey="renewGen" 
                        name="신재생발전 예측" 
                        stroke="#34d399" 
                        strokeWidth={3} 
                        strokeDasharray="5 5"
                        dot={false} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

import { DemandPredict, ReGenPredict } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Zap } from 'lucide-react';

interface DemandReGenChartProps {
    demandData: DemandPredict[];
    reGenData: ReGenPredict[];
}

export default function DemandReGenChart({ demandData, reGenData }: DemandReGenChartProps) {
    // 시간대별로 데이터 병합
    const mergedData = demandData.map(demand => {
        const matchingReGen = reGenData.find(regen => regen.fcstTm === demand.fcstTm);
        return {
            ...demand,
            hour: demand.fcstTm.slice(8, 10) + ':00',
            // MW 단위로 변환
            fcstQgenMW: demand.fcstQgen / 1000,
            fcstQgmxMW: demand.fcstQgmx / 1000,
            fcstQgmnMW: demand.fcstQgmn / 1000,
            currPwrTotMW: demand.currPwrTot ? demand.currPwrTot / 1000 : null,
            // 신재생 발전량 (MW)
            renewGenMW: matchingReGen ? matchingReGen.fcstQgen / 1000 : null,
        };
    });

    return (
        <div className="toss-card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">수요 및 신재생발전 예측</h2>
                    <p className="text-sm text-gray-500">전력수요와 신재생에너지 발전량 통합 분석</p>
                </div>
            </div>
            
            <ResponsiveContainer width="100%" height={380}>
                <LineChart data={mergedData} margin={{ left: 8, right: 8, top: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                    <XAxis
                        dataKey="hour"
                        interval={2}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        angle={-45}
                        textAnchor="end"
                        tickMargin={12}
                        height={50}
                        axisLine={{ stroke: '#e5e7eb' }}
                    />
                    {/* 좌측 Y축: 전력량 (MW) */}
                    <YAxis 
                        yAxisId="power" 
                        orientation="left" 
                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                        domain={["auto","auto"]} 
                        axisLine={{ stroke: '#e5e7eb' }}
                        label={{ value: '전력량 (MW)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <RechartsTooltip 
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: number, name: string) => [
                            `${value.toFixed(1)} MW`, 
                            name
                        ]}
                    />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 40 }} />
                    
                    {/* 수요 관련 라인들 */}
                    <Line 
                        yAxisId="power" 
                        type="monotone" 
                        dataKey="fcstQgenMW" 
                        name="수요예측" 
                        stroke="#6366f1" 
                        strokeWidth={3} 
                        strokeDasharray="5 5"
                        dot={false} 
                    />
                    
                    {/* 신재생 발전량 */}
                    <Line 
                        yAxisId="power" 
                        type="monotone" 
                        dataKey="renewGenMW" 
                        name="신재생발전 예측" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        strokeDasharray="5 5"
                        dot={false} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

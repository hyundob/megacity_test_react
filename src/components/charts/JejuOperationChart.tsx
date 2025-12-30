import { SukubOperationItem } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Activity } from 'lucide-react';

export default function JejuOperationChart({ data }: { data: SukubOperationItem[] }) {
    const rows = data.map(d => ({
        ...d,
        dateTime: `${d.tm.slice(4,6)}/${d.tm.slice(6,8)} ${d.tm.slice(8,10)}:${d.tm.slice(10,12)}`,
        hour: `${d.tm.slice(8,10)}:${d.tm.slice(10,12)}`,
    }));

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={rows} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
                    <XAxis
                        dataKey="dateTime"
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        angle={-45}
                        textAnchor="end"
                        tickMargin={8}
                        height={60}
                        axisLine={{ stroke: '#e5e7eb' }}
                        interval={Math.max(0, Math.floor(rows.filter((_, index) => {
                            const minute = parseInt(rows[index].tm.slice(10, 12));
                            return minute === 0;
                        }).length / 8) - 1)}
                        ticks={rows
                            .filter((_, index) => {
                                const minute = parseInt(rows[index].tm.slice(10, 12));
                                return minute === 0; // 정시(00분)만 표시
                            })
                            .map(r => r.dateTime)
                        }
                        label={{ value: '시간', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' } }}
                    />
                    {/* 좌측 Y축: 전력량 (MW) */}
                    <YAxis 
                        yAxisId="power" 
                        orientation="left" 
                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                        domain={["auto","auto"]} 
                        axisLine={{ stroke: '#e5e7eb' }}
                        label={{ value: '전력량 (MW)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' } }}
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
                            `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW`,
                            name
                        ]}
                    />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20, fontSize: '12px', color: '#4b5563' }} />
                    
                    {/* 현재수요 */}
                    <Line 
                        yAxisId="power" 
                        type="monotone" 
                        dataKey="currPwrTot" 
                        name="현재수요" 
                        stroke="#a8b8d8" 
                        strokeWidth={3} 
                        dot={false} 
                    />
                    
                    {/* 태양광발전 */}
                    <Line 
                        yAxisId="power" 
                        type="monotone" 
                        dataKey="renewPwrSolar" 
                        name="태양광발전" 
                        stroke="#fde68a" 
                        strokeWidth={3} 
                        dot={false} 
                    />
                    
                    {/* 풍력발전 */}
                    <Line 
                        yAxisId="power" 
                        type="monotone" 
                        dataKey="renewPwrWind" 
                        name="풍력발전" 
                        stroke="#93c5fd" 
                        strokeWidth={3} 
                        dot={false} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

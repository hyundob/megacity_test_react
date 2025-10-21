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
        <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">제주계통운영정보 (최근 24시간)</h2>
                    <p className="text-sm text-gray-500">현재수요/태양광/풍력 발전량</p>
                </div>
            </div>
            
            <ResponsiveContainer width="100%" height={380}>
                <LineChart data={rows} margin={{ left: 8, right: 8, top: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                    <XAxis
                        dataKey="dateTime"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        angle={-45}
                        textAnchor="end"
                        tickMargin={12}
                        height={50}
                        axisLine={{ stroke: '#e5e7eb' }}
                        ticks={rows
                            .filter((_, index) => {
                                const minute = parseInt(rows[index].tm.slice(10, 12));
                                return minute === 0; // 정시(00분)만 표시
                            })
                            .map(r => r.dateTime)
                        }
                    />
                    {/* 좌측 Y축: 전력량 (MW) */}
                    <YAxis 
                        yAxisId="power" 
                        orientation="left" 
                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                        domain={["auto","auto"]} 
                        axisLine={{ stroke: '#e5e7eb' }}
                        label={{ value: '전력량 (MW)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                        tickFormatter={(value) => value.toLocaleString()}
                    />
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
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 40 }} />
                    
                    {/* 현재수요 */}
                    <Line 
                        yAxisId="power" 
                        type="monotone" 
                        dataKey="currPwrTot" 
                        name="현재수요" 
                        stroke="#ef4444" 
                        strokeWidth={3} 
                        dot={false} 
                    />
                    
                    {/* 태양광발전 */}
                    <Line 
                        yAxisId="power" 
                        type="monotone" 
                        dataKey="renewPwrSolar" 
                        name="태양광발전" 
                        stroke="#f59e0b" 
                        strokeWidth={3} 
                        dot={false} 
                    />
                    
                    {/* 풍력발전 */}
                    <Line 
                        yAxisId="power" 
                        type="monotone" 
                        dataKey="renewPwrWind" 
                        name="풍력발전" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={false} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

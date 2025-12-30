import { ForecastPredict } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ForecastLast48hChartProps {
    data: ForecastPredict[];
    areaGrpId?: string;
    areaGrpIds: string[];
    selectedAreaGrpId: string;
    onAreaGrpIdChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function ForecastLast48hChart({ data, areaGrpId, areaGrpIds, selectedAreaGrpId, onAreaGrpIdChange }: ForecastLast48hChartProps) {
    const rows = data.map(d => ({
        ...d,
        hour: `${d.fcstTm.slice(4,6)}/${d.fcstTm.slice(6,8)} ${d.fcstTm.slice(8,10)}:00`,
    }));
    return (
        <div className="w-full">
            <div className="flex flex-col items-center gap-3 mb-4">
                <div className="text-center">
                    <h2 className="text-base font-bold text-gray-800 mb-1">
                        최근 48시간 기상예보
                        {areaGrpId && <span className="ml-2 text-xs text-blue-600">({areaGrpId})</span>}
                    </h2>
                    <p className="text-xs text-gray-500">기온/일사량/풍속 추이</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-700">영역 선택:</label>
                    {areaGrpIds.length > 0 ? (
                        <select
                            value={selectedAreaGrpId}
                            onChange={onAreaGrpIdChange}
                            className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
                        >
                            {areaGrpIds.map((id, index) => (
                                <option key={`${id}-${index}`} value={id}>{id}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="text-xs text-red-500">영역 그룹 데이터 없음</div>
                    )}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={rows} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                    <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.8)' }}
                        angle={-45}
                        textAnchor="end"
                        tickMargin={8}
                        height={60}
                        axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                        interval={Math.max(0, Math.floor(rows.length / 8) - 1)}
                        label={{ value: '시간', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' } }}
                    />
                    {/* 좌측 Y축: 기온(°C) */}
                    <YAxis 
                        yAxisId="temp" 
                        orientation="left" 
                        tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} 
                        domain={["auto","auto"]} 
                        axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} 
                        label={{ value: '기온(°C)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' } }} 
                        tickFormatter={(value) => value.toLocaleString()} 
                    />
                    {/* 우측 Y축1: 일사량 (W/m2) */}
                    <YAxis 
                        yAxisId="srad" 
                        orientation="right" 
                        tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} 
                        domain={["auto","auto"]} 
                        axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} 
                        label={{ value: '일사량(W/m²)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' } }} 
                        tickFormatter={(value) => value.toLocaleString()} 
                    />
                    {/* 우측 Y축2: 풍속 (m/s) - 우측 안쪽 */}
                    <YAxis 
                        yAxisId="wspd" 
                        orientation="right" 
                        tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} 
                        domain={["auto","auto"]} 
                        width={0} 
                        label={{ value: '풍속(m/s)', angle: 90, position: 'insideRight', offset: 20, style: { textAnchor: 'middle', fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' } }} 
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
                        formatter={(value: number, name: string) => {
                            if (name.includes('기온')) return [`${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}°C`, name];
                            if (name.includes('일사량')) return [`${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} W/m²`, name];
                            if (name.includes('풍속')) return [`${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} m/s`, name];
                            return [value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','), name];
                        }}
                    />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20, fontSize: '12px' }} />
                    <Line yAxisId="temp" type="monotone" dataKey="fcstTemp" name="기온(°C)" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                    <Line yAxisId="srad" type="monotone" dataKey="fcstSrad" name="일사량(W/m²)" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                    <Line yAxisId="wspd" type="monotone" dataKey="fcstWspd" name="풍속(m/s)" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}



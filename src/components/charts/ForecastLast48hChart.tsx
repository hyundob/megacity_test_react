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
        <div className="toss-card p-6">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">
                            최근 48시간 기상예보
                            {areaGrpId && <span className="ml-2 text-sm text-blue-600">({areaGrpId})</span>}
                        </h2>
                        <p className="text-sm text-gray-500">기온/일사량/풍속 추이</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">영역 선택:</label>
                    {areaGrpIds.length > 0 ? (
                        <select
                            value={selectedAreaGrpId}
                            onChange={onAreaGrpIdChange}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        >
                            {areaGrpIds.map((id, index) => (
                                <option key={`${id}-${index}`} value={id}>{id}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="text-sm text-red-500">영역 그룹 데이터 없음</div>
                    )}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={380}>
                <LineChart data={rows} margin={{ left: 8, right: 8, top: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                    <XAxis
                        dataKey="hour"
                        interval={3}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        angle={-45}
                        textAnchor="end"
                        tickMargin={12}
                        height={50}
                        axisLine={{ stroke: '#e5e7eb' }}
                    />
                    {/* 좌측 Y축: 기온(°C) */}
                    <YAxis yAxisId="temp" orientation="left" tick={{ fontSize: 11, fill: '#6b7280' }} domain={["auto","auto"]} axisLine={{ stroke: '#e5e7eb' }} label={{ value: '기온(°C)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' } }} tickFormatter={(value) => value.toLocaleString()} />
                    {/* 우측 Y축1: 일사량 (W/m2) */}
                    <YAxis yAxisId="srad" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} domain={["auto","auto"]} axisLine={{ stroke: '#e5e7eb' }} label={{ value: '일사량(W/m²)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' } }} tickFormatter={(value) => value.toLocaleString()} />
                    {/* 우측 Y축2: 풍속 (m/s) - 우측 안쪽 */}
                    <YAxis yAxisId="wspd" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} domain={["auto","auto"]} width={0} label={{ value: '풍속(m/s)', angle: 90, position: 'insideRight', offset: 20, style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' } }} tickFormatter={(value) => value.toLocaleString()} />
                    <RechartsTooltip 
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: number, name: string) => {
                            if (name.includes('기온')) return [`${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}°C`, name];
                            if (name.includes('일사량')) return [`${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} W/m²`, name];
                            if (name.includes('풍속')) return [`${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} m/s`, name];
                            return [value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','), name];
                        }}
                    />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 40 }} />
                    <Line yAxisId="temp" type="monotone" dataKey="fcstTemp" name="기온(°C)" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                    <Line yAxisId="srad" type="monotone" dataKey="fcstSrad" name="일사량(W/m2)" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                    <Line yAxisId="wspd" type="monotone" dataKey="fcstWspd" name="풍속(m/s)" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}



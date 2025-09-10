import { SukubOperation, SukubOperationItem } from '../../lib/types';
import { formatTime } from '../../lib/utils';
import { Zap, Activity, Sun, Wind, Battery } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

interface SukubInfoCardProps {
    data: SukubOperation;
    dailyData?: SukubOperationItem[];
}

export default function SukubInfoCard({ data, dailyData = [] }: SukubInfoCardProps) {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const getDailyStats = (key: keyof SukubOperation) => {
        if (dailyData.length === 0) return null;
        
        const values = dailyData.map(d => d[key] as number).filter(v => typeof v === 'number');
        if (values.length === 0) return null;
        
        const min = Math.round(Math.min(...values) * 100) / 100;
        const max = Math.round(Math.max(...values) * 100) / 100;
        const avg = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
        
        // 최소/최대값의 인덱스 찾기
        const minIndex = values.findIndex(v => v === min);
        const maxIndex = values.findIndex(v => v === max);
        
        return { min, max, avg, count: values.length, minIndex, maxIndex };
    };

    const renderTooltip = (key: keyof SukubOperation, label: string) => {
        if (dailyData.length === 0) return null;
        
        const stats = getDailyStats(key);
        if (!stats) return null;
        
        // 차트 데이터 준비
        const chartData = dailyData.map((item, index) => ({
            time: `${item.tm.slice(8, 10)}:${item.tm.slice(10, 12)}`,
            value: item[key] as number,
            index,
            isMin: false,
            isMax: false
        })).filter(d => typeof d.value === 'number');
        
        if (chartData.length === 0) return null;
        
        // 최소/최대값 표시 설정
        chartData.forEach((d, idx) => {
            if (idx === stats.minIndex) {
                d.isMin = true;
            }
            if (idx === stats.maxIndex) {
                d.isMax = true;
            }
        });
        
        // 최소/최대값만 별도 데이터로 생성
        const minMaxData = chartData.map(d => ({
            ...d,
            minValue: d.isMin ? d.value : null,
            maxValue: d.isMax ? d.value : null
        }));
        
        return (
            <div className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 sm:p-6 w-[95vw] sm:w-[600px] sm:max-w-[90vw] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[80vh] overflow-y-auto">
                <div className="text-sm font-semibold text-gray-800 mb-3 sm:mb-4">{label} 일간 추이</div>
                
                {/* 미니 차트 */}
                <div className="h-24 sm:h-32 mb-3 sm:mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={minMaxData} margin={{ top: 6, right: 10, left: 35, bottom: 15 }}>
                            <CartesianGrid strokeDasharray="1 1" stroke="#f1f3f4" />
                            <XAxis 
                                dataKey="time" 
                                tick={{ fontSize: 8, fill: '#6b7280' }}
                                interval={2}
                                axisLine={false}
                                tickLine={false}
                                height={25}
                            />
                            <YAxis 
                                tick={{ fontSize: 8, fill: '#6b7280' }}
                                domain={[0, 'dataMax + 1000']}
                                axisLine={false}
                                tickLine={false}
                                width={30}
                                tickFormatter={(value) => Math.round(value).toLocaleString()}
                                tickCount={4}
                            />
                            <RechartsTooltip 
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs">
                                                <div className="font-medium text-gray-800">{label}</div>
                                                <div className="text-gray-600">
                                                    {payload[0].value?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={getColorByKey(key)} 
                                strokeWidth={2} 
                                dot={false}
                                activeDot={{ r: 3, fill: getColorByKey(key) }}
                            />
                            {/* 최소값 점 */}
                            <Line 
                                type="monotone" 
                                dataKey="minValue"
                                stroke="transparent"
                                dot={{ r: 3, fill: '#ef4444', stroke: '#ef4444', strokeWidth: 1 }}
                                connectNulls={false}
                            />
                            {/* 최대값 점 */}
                            <Line 
                                type="monotone" 
                                dataKey="maxValue"
                                stroke="transparent"
                                dot={{ r: 3, fill: '#10b981', stroke: '#10b981', strokeWidth: 1 }}
                                connectNulls={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                
                {/* 통계 정보 */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-600">최소:</span>
                        <span className="font-medium">{stats.min.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">최대:</span>
                        <span className="font-medium">{stats.max.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">평균:</span>
                        <span className="font-medium">{stats.avg.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">데이터:</span>
                        <span className="font-medium">{stats.count}개</span>
                    </div>
                </div>
            </div>
        );
    };

    const getColorByKey = (key: keyof SukubOperation) => {
        const colors: Record<string, string> = {
            suppAbility: '#3b82f6',    // blue
            currPwrTot: '#ef4444',     // red
            renewPwrTot: '#10b981',    // green
            renewPwrSolar: '#f97316',  // orange
            renewPwrWind: '#06b6d4'    // cyan
        };
        return colors[key] || '#6b7280';
    };

    return (
        <div className="toss-card p-6 relative">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">제주 계통 운영 정보</h2>
                    <p className="text-sm text-gray-500">전력 시스템 현황</p>
                </div>
            </div>
            
            <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">기준시각</span>
                    <span className="font-medium">{formatTime(data.tm)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div 
                    className="relative flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                    onMouseEnter={() => setHoveredItem('suppAbility')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Battery className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">공급능력</div>
                        <div className="text-lg font-bold text-blue-700">{data.suppAbility.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                    </div>
                    {hoveredItem === 'suppAbility' && renderTooltip('suppAbility', '공급능력')}
                </div>
                
                <div 
                    className="relative flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
                    onMouseEnter={() => setHoveredItem('currPwrTot')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">현재수요</div>
                        <div className="text-lg font-bold text-red-700">{data.currPwrTot.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                    </div>
                    {hoveredItem === 'currPwrTot' && renderTooltip('currPwrTot', '현재수요')}
                </div>
                
                <div 
                    className="relative flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100 cursor-pointer hover:bg-green-100 transition-colors"
                    onMouseEnter={() => setHoveredItem('renewPwrTot')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">신재생합계</div>
                        <div className="text-lg font-bold text-green-700">{data.renewPwrTot.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                    </div>
                    {hoveredItem === 'renewPwrTot' && renderTooltip('renewPwrTot', '신재생합계')}
                </div>
                
                <div 
                    className="relative flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors"
                    onMouseEnter={() => setHoveredItem('renewPwrSolar')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Sun className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">태양광합계</div>
                        <div className="text-lg font-bold text-orange-700">{data.renewPwrSolar.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                    </div>
                    {hoveredItem === 'renewPwrSolar' && renderTooltip('renewPwrSolar', '태양광합계')}
                </div>
            </div>
            
            <div 
                className="relative mt-4 flex items-center gap-3 p-4 bg-cyan-50 rounded-xl border border-cyan-100 cursor-pointer hover:bg-cyan-100 transition-colors"
                onMouseEnter={() => setHoveredItem('renewPwrWind')}
                onMouseLeave={() => setHoveredItem(null)}
            >
                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Wind className="w-4 h-4 text-cyan-600" />
                </div>
                <div>
                    <div className="text-xs text-gray-500 font-medium">풍력합계</div>
                    <div className="text-lg font-bold text-cyan-700">{data.renewPwrWind.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                </div>
                {hoveredItem === 'renewPwrWind' && renderTooltip('renewPwrWind', '풍력합계')}
            </div>
        </div>
    );
}

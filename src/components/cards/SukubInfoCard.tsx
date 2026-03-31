import { SukubOperation, SukubOperationItem } from '@/lib/types';
import { formatTime } from '@/lib/utils';
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
        let minIndex = -1;
        let maxIndex = -1;
        for (let i = 0; i < dailyData.length; i++) {
            const value = dailyData[i][key] as number;
            if (Math.round(value * 100) / 100 === min && minIndex === -1) minIndex = i;
            if (Math.round(value * 100) / 100 === max && maxIndex === -1) maxIndex = i;
        }
        return { min, max, avg, count: values.length, minIndex, maxIndex };
    };

    const renderTooltip = (key: keyof SukubOperation, label: string) => {
        if (dailyData.length === 0) return null;
        const stats = getDailyStats(key);
        if (!stats) return null;

        const chartData = dailyData.map((item, index) => ({
            time: `${item.tm.slice(8, 10)}:${item.tm.slice(10, 12)}`,
            value: item[key] as number,
            index,
            isMin: false,
            isMax: false
        })).filter(d => typeof d.value === 'number');

        if (chartData.length === 0) return null;

        chartData.forEach((d) => {
            if (d.index === stats.minIndex) d.isMin = true;
            if (d.index === stats.maxIndex) d.isMax = true;
        });

        const minMaxData = chartData.map(d => ({
            ...d,
            minValue: d.isMin ? d.value : null,
            maxValue: d.isMax ? d.value : null
        }));

        return (
            <div
                className="fixed z-50 rounded-lg shadow-2xl p-4 sm:p-6 w-[95vw] sm:w-[600px] sm:max-w-[90vw] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[80vh] overflow-y-auto border border-black/10 dark:border-white/10"
                style={{ background: 'var(--card-bg)', backdropFilter: 'blur(20px)' }}
            >
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 sm:mb-4">{label} 일간 추이</div>

                <div className="h-24 sm:h-32 mb-3 sm:mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={minMaxData} margin={{ top: 6, right: 10, left: 35, bottom: 15 }}>
                            <CartesianGrid strokeDasharray="1 1" stroke="rgba(128,128,128,0.15)" />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 8, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                height={25}
                                ticks={minMaxData
                                    .filter((_, index) => {
                                        const minute = parseInt(dailyData[minMaxData[index].index].tm.slice(10, 12));
                                        return minute === 0;
                                    })
                                    .map(d => d.time)
                                }
                            />
                            <YAxis
                                tick={{ fontSize: 8, fill: '#94a3b8' }}
                                domain={[0, 'dataMax + 1000']}
                                axisLine={false}
                                tickLine={false}
                                width={30}
                                tickFormatter={(value) => Math.round(value).toLocaleString()}
                                tickCount={4}
                            />
                            <RechartsTooltip
                                content={({ active, payload, label: lbl }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded-lg shadow-lg p-2 text-xs">
                                                <div className="font-medium text-slate-800 dark:text-slate-200">{lbl}</div>
                                                <div className="text-slate-600 dark:text-slate-400">
                                                    {payload[0].value?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Line type="monotone" dataKey="value" stroke={getColorByKey(key)} strokeWidth={2} dot={false} activeDot={{ r: 3, fill: getColorByKey(key) }} />
                            <Line type="monotone" dataKey="minValue" stroke="transparent" dot={{ r: 3, fill: '#ef4444', stroke: '#ef4444', strokeWidth: 1 }} connectNulls={false} />
                            <Line type="monotone" dataKey="maxValue" stroke="transparent" dot={{ r: 3, fill: '#10b981', stroke: '#10b981', strokeWidth: 1 }} connectNulls={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">최소:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{stats.min.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">최대:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{stats.max.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">평균:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{stats.avg.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">데이터:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{stats.count}개</span>
                    </div>
                </div>
            </div>
        );
    };

    const getColorByKey = (key: keyof SukubOperation) => {
        const colors: Record<string, string> = {
            suppAbility: '#3b82f6',
            currPwrTot: '#ef4444',
            renewPwrTot: '#10b981',
            renewPwrSolar: '#f97316',
            renewPwrWind: '#06b6d4'
        };
        return colors[key] || '#6b7280';
    };

    return (
        <div className="relative">
            <div className="mb-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">기준시각</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatTime(data.tm)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div
                    className="relative flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 cursor-pointer hover:bg-blue-500/15 transition-colors"
                    onMouseEnter={() => setHoveredItem('suppAbility')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <div className="w-7 h-7 bg-blue-500/15 rounded-md flex items-center justify-center">
                        <Battery className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">공급능력</div>
                        <div className="text-base font-bold text-blue-700 dark:text-blue-300">{data.suppAbility.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                    </div>
                    {hoveredItem === 'suppAbility' && renderTooltip('suppAbility', '공급능력')}
                </div>

                <div
                    className="relative flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20 cursor-pointer hover:bg-red-500/15 transition-colors"
                    onMouseEnter={() => setHoveredItem('currPwrTot')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <div className="w-7 h-7 bg-red-500/15 rounded-md flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">현재수요</div>
                        <div className="text-base font-bold text-red-700 dark:text-red-300">{data.currPwrTot.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                    </div>
                    {hoveredItem === 'currPwrTot' && renderTooltip('currPwrTot', '현재수요')}
                </div>

                <div
                    className="relative flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/15 transition-colors"
                    onMouseEnter={() => setHoveredItem('renewPwrTot')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <div className="w-7 h-7 bg-emerald-500/15 rounded-md flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">신재생합계</div>
                        <div className="text-base font-bold text-emerald-700 dark:text-emerald-300">{data.renewPwrTot.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                    </div>
                    {hoveredItem === 'renewPwrTot' && renderTooltip('renewPwrTot', '신재생합계')}
                </div>

                <div
                    className="relative flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 cursor-pointer hover:bg-orange-500/15 transition-colors"
                    onMouseEnter={() => setHoveredItem('renewPwrSolar')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <div className="w-7 h-7 bg-orange-500/15 rounded-md flex items-center justify-center">
                        <Sun className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">태양광합계</div>
                        <div className="text-base font-bold text-orange-700 dark:text-orange-300">{data.renewPwrSolar.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                    </div>
                    {hoveredItem === 'renewPwrSolar' && renderTooltip('renewPwrSolar', '태양광합계')}
                </div>
            </div>

            <div
                className="relative mt-3 flex items-center gap-2 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20 cursor-pointer hover:bg-cyan-500/15 transition-colors"
                onMouseEnter={() => setHoveredItem('renewPwrWind')}
                onMouseLeave={() => setHoveredItem(null)}
            >
                <div className="w-7 h-7 bg-cyan-500/15 rounded-md flex items-center justify-center">
                    <Wind className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">풍력합계</div>
                    <div className="text-base font-bold text-cyan-700 dark:text-cyan-300">{data.renewPwrWind.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MW</div>
                </div>
                {hoveredItem === 'renewPwrWind' && renderTooltip('renewPwrWind', '풍력합계')}
            </div>
        </div>
    );
}

import { useMemo } from 'react';
import { ForecastPredict } from '@/lib/types';
import { Line } from 'react-chartjs-2';
import type { TooltipItem } from 'chart.js';
import { registerChartJS, createChartOptions } from '@/lib/utils/chartConfig';
import { useTheme } from '@/components/theme/ThemeProvider';

registerChartJS();

interface ForecastLast48hChartProps {
    data: ForecastPredict[];
    areaGrpId?: string;
    areaGrpIds: string[];
    selectedAreaGrpId: string;
    onAreaGrpIdChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function ForecastLast48hChart({ data, areaGrpId, areaGrpIds, selectedAreaGrpId, onAreaGrpIdChange }: ForecastLast48hChartProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const rows = useMemo(() => data.map(d => ({
        ...d,
        hour: `${d.fcstTm.slice(4,6)}/${d.fcstTm.slice(6,8)} ${d.fcstTm.slice(8,10)}:00`,
    })), [data]);

    const labels = useMemo(() => rows.map(r => r.hour), [rows]);

    const chartData = useMemo(() => ({
        labels,
        datasets: [
            {
                label: '기온(°C)',
                data: rows.map(r => r.fcstTemp ?? null),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                borderDash: [6, 4],
                fill: false,
                yAxisID: 'y',
            },
            {
                label: '일사량(W/m²)',
                data: rows.map(r => r.fcstSrad ?? null),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                borderDash: [6, 4],
                fill: false,
                yAxisID: 'y1',
            },
            {
                label: '풍속(m/s)',
                data: rows.map(r => r.fcstWspd ?? null),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                borderDash: [6, 4],
                fill: false,
                yAxisID: 'y2',
            },
        ],
    }), [labels, rows]);

    const options = useMemo(() => {
        const baseOptions = createChartOptions('', isDark, undefined, {
            leftLabel: '기온(°C)',
            rightLabel1: '일사량(W/m²)',
            rightLabel2: '풍속(m/s)',
        });
        return {
            ...baseOptions,
            plugins: {
                ...baseOptions.plugins,
                tooltip: {
                    ...baseOptions.plugins?.tooltip,
                    callbacks: {
                        ...baseOptions.plugins?.tooltip?.callbacks,
                        label(context: TooltipItem<'line'>) {
                            const value = context.parsed.y;
                            if (value == null || Number.isNaN(value)) return '';
                            const formatted = (value as number)
                                .toFixed(2)
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                            return `${context.dataset.label || ''}: ${formatted}`;
                        },
                    },
                },
            },
        };
    }, [isDark]);

    return (
        <div className="w-full">
            <div className="flex flex-col items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">영역 그룹 선택:</label>
                    {areaGrpIds.length > 0 ? (
                        <select
                            value={selectedAreaGrpId}
                            onChange={onAreaGrpIdChange}
                            className="px-2 py-1 border border-black/15 dark:border-white/15 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        >
                            {areaGrpIds.map((id, index) => (
                                <option key={`${id}-${index}`} value={id}>{id}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="text-xs text-red-500">영역 그룹 데이터 없음</div>
                    )}
                    {areaGrpId && <span className="text-xs text-slate-500">(${areaGrpId})</span>}
                </div>
            </div>
            <div className="w-full h-[280px]" role="img" aria-label="최근 48시간 수소생산단지 기상 예측 차트">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}

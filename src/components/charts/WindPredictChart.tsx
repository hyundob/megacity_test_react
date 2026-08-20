import { useMemo } from 'react';
import { ReGenPredict } from '@/lib/types';
import { Line } from 'react-chartjs-2';
import type { TooltipItem } from 'chart.js';
import { registerChartJS, createChartOptions, chartColor, gradientFill } from '@/lib/utils/chartConfig';
import { useTheme } from '@/components/theme/ThemeProvider';

registerChartJS();

export default function WindPredictChart({ data }: { data: ReGenPredict[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const rows = useMemo(() =>
        data.map(d => ({
            ...d,
            hour: `${d.fcstTm.slice(4,6)}/${d.fcstTm.slice(6,8)} ${d.fcstTm.slice(8,10)}:00`
        })),
        [data]
    );

    const labels = useMemo(() => rows.map(r => r.hour), [rows]);

    const chartData = useMemo(() => ({
        labels,
        datasets: [
            {
                label: '최대 예측',
                data: rows.map(r => r.fcstQgmx ?? null),
                borderColor: isDark ? '#b9c791' : '#7c8a4a',
                backgroundColor: isDark ? 'rgba(185, 199, 145, 0.10)' : 'rgba(124, 138, 74, 0.08)',
                borderWidth: 1.5,
                tension: 0.35,
                pointRadius: 0,
                borderDash: [4, 3],
                fill: '+1',
            },
            {
                label: '최소 예측',
                data: rows.map(r => r.fcstQgmn ?? null),
                borderColor: chartColor('olive', isDark),
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                tension: 0.35,
                pointRadius: 0,
                borderDash: [4, 3],
                fill: false,
            },
            {
                label: '최종 발전량 예측',
                data: rows.map(r => r.fcstQgen ?? null),
                borderColor: isDark ? '#06D6A0' : '#4a5424',
                backgroundColor: gradientFill(isDark ? '#06D6A0' : '#4a5424'),
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: isDark ? '#06D6A0' : '#4a5424',
                pointHoverBorderColor: isDark ? '#181922' : '#ffffff',
                pointHoverBorderWidth: 2,
                fill: 'start',
            },
        ],
    }), [labels, rows, isDark]);

    const options = useMemo(() => {
        const baseOptions = createChartOptions('발전량 (MWh)', isDark);
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
                            return `${context.dataset.label}: ${formatted} MWh`;
                        },
                    },
                },
            },
        };
    }, [isDark]);

    return (
        <div className="w-full h-[260px]" role="img" aria-label="풍력 발전 예측 차트">
            <Line data={chartData} options={options} />
        </div>
    );
}

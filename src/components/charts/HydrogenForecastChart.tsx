import { useMemo } from 'react';
import { HgGenPredict } from '@/lib/types';
import { Line } from 'react-chartjs-2';
import type { TooltipItem } from 'chart.js';
import { registerChartJS, createChartOptions, chartColor, gradientFill } from '@/lib/utils/chartConfig';
import { useTheme } from '@/components/theme/ThemeProvider';

registerChartJS();

export default function HydrogenForecastChart({ data }: { data: HgGenPredict[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const rows = useMemo(() =>
        data.map(d => ({ ...d, hour: d.fcstTm.slice(8, 10) + ':00' })),
        [data]
    );

    const labels = useMemo(() => rows.map(r => r.hour), [rows]);

    const chartData = useMemo(() => ({
        labels,
        datasets: [
            {
                label: '최종생산량',
                data: rows.map(r => r.fcstQgen ?? null),
                borderColor: chartColor('olive', isDark),
                backgroundColor: gradientFill(chartColor('olive', isDark)),
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: chartColor('olive', isDark),
                pointHoverBorderColor: isDark ? '#181922' : '#ffffff',
                pointHoverBorderWidth: 2,
                fill: 'start',
                yAxisID: 'y',
            },
            {
                label: '예측설비용량',
                data: rows.map(r => r.fcstCapa ?? null),
                borderColor: chartColor('caramel', isDark),
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.35,
                pointRadius: 0,
                fill: false,
                yAxisID: 'y1',
            },
        ],
    }), [labels, rows, isDark]);

    const options = useMemo(() => {
        const baseOptions = createChartOptions('', isDark, {
            leftLabel: '생산량 (MWh)',
            rightLabel: '설비용량 (MW)',
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
                            const datasetLabel = context.dataset.label || '';
                            const unit = datasetLabel.includes('생산량') ? ' MWh' : ' MW';
                            return `${datasetLabel}: ${formatted}${unit}`;
                        },
                    },
                },
            },
        };
    }, [isDark]);

    return (
        <div className="w-full h-[240px]" role="img" aria-label="수소 생산량 예측 차트">
            <Line data={chartData} options={options} />
        </div>
    );
}

import { useMemo } from 'react';
import { DemandPredict } from '@/lib/types';
import { Line } from 'react-chartjs-2';
import { registerChartJS, createChartOptions } from '@/lib/utils/chartConfig';
import { useTheme } from '@/components/theme/ThemeProvider';

registerChartJS();

export default function DemandPredictChart({ data }: { data: DemandPredict[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const rows = useMemo(() =>
        data.map(d => ({
            ...d,
            hour: `${d.fcstTm.slice(4, 6)}/${d.fcstTm.slice(6, 8)} ${d.fcstTm.slice(8, 10)}:00`,
        })),
        [data]
    );

    const labels = useMemo(() => rows.map(r => r.hour), [rows]);

    const chartData = useMemo(() => ({
        labels,
        datasets: [
            {
                label: '수요예측 최대',
                data: rows.map(r => r.fcstQgmx ?? null),
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.15)',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0,
                borderDash: [6, 4],
            },
            {
                label: '수요예측 최소',
                data: rows.map(r => r.fcstQgmn ?? null),
                borderColor: '#14b8a6',
                backgroundColor: 'rgba(20, 184, 166, 0.15)',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0,
                borderDash: [6, 4],
            },
            {
                label: '최종 수요예측',
                data: rows.map(r => r.fcstQgen ?? null),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.18)',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                borderDash: [6, 4],
            },
            {
                label: '실제 수요',
                data: rows.map(r => r.currPwrTot ?? null),
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14, 165, 233, 0.25)',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 3,
                pointHoverRadius: 5,
            },
        ],
    }), [labels, rows]);

    const options = useMemo(() => {
        const baseOptions = createChartOptions('전력량 (MWh)', isDark);
        return {
            ...baseOptions,
            plugins: {
                ...baseOptions.plugins,
                tooltip: {
                    ...baseOptions.plugins?.tooltip,
                    callbacks: {
                        ...baseOptions.plugins?.tooltip?.callbacks,
                        label(context: any) {
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
        <div className="w-full h-[260px]" role="img" aria-label="전력 수요 예측 차트">
            <Line data={chartData} options={options} />
        </div>
    );
}

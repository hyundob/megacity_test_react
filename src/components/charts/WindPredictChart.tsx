import { useMemo } from 'react';
import { ReGenPredict } from '@/lib/types';
import { Line } from 'react-chartjs-2';
import { registerChartJS, createChartOptions } from '@/lib/utils/chartConfig';
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
                borderColor: '#0891b2',
                backgroundColor: 'rgba(8, 145, 178, 0.15)',
                borderWidth: 2,
                tension: 0.35,
                pointRadius: 0,
                borderDash: [6, 4],
                fill: false,
            },
            {
                label: '최소 예측',
                data: rows.map(r => r.fcstQgmn ?? null),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                borderWidth: 2,
                tension: 0.35,
                pointRadius: 0,
                borderDash: [6, 4],
                fill: false,
            },
            {
                label: '최종 발전량 예측',
                data: rows.map(r => r.fcstQgen ?? null),
                borderColor: '#14b8a6',
                backgroundColor: 'rgba(20, 184, 166, 0.18)',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                borderDash: [6, 4],
                fill: false,
            },
        ],
    }), [labels, rows]);

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
        <div className="w-full h-[260px]" role="img" aria-label="풍력 발전 예측 차트">
            <Line data={chartData} options={options} />
        </div>
    );
}

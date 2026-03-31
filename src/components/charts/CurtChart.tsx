import { useMemo } from 'react';
import { JejuCurtPredict } from '@/lib/types';
import { Line } from 'react-chartjs-2';
import { registerChartJS, createChartOptions } from '@/lib/utils/chartConfig';
import { useTheme } from '@/components/theme/ThemeProvider';

registerChartJS();

export default function CurtChart({ data }: { data: JejuCurtPredict[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const rows = useMemo(() =>
        data.map(d => ({
            ...d,
            hour: `${d.fcstTm.slice(4,6)}/${d.fcstTm.slice(6,8)} ${d.fcstTm.slice(8, 10)}:00`
        })),
        [data]
    );

    const labels = useMemo(() => rows.map(r => r.hour), [rows]);

    const chartData = useMemo(() => ({
        labels,
        datasets: [
            {
                label: '최소출력',
                data: rows.map(r => r.fcstMinpw ?? null),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                borderDash: [6, 4],
                fill: false,
                yAxisID: 'y',
            },
            {
                label: '출력제어',
                data: rows.map(r => r.fcstCurt ?? null),
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.15)',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                borderDash: [6, 4],
                fill: false,
                yAxisID: 'y1',
            },
        ],
    }), [labels, rows]);

    const options = useMemo(() => {
        const baseOptions = createChartOptions('', isDark, {
            leftLabel: '최소출력 (MW)',
            rightLabel: '출력제어 (MW)',
        });
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
                            return `${context.dataset.label || ''}: ${formatted} MW`;
                        },
                    },
                },
            },
        };
    }, [isDark]);

    return (
        <div className="w-full h-[260px]" role="img" aria-label="출력제어 예측 차트">
            <Line data={chartData} options={options} />
        </div>
    );
}

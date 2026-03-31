import { useMemo } from 'react';
import { SukubOperationItem } from '@/lib/types';
import { Line } from 'react-chartjs-2';
import { registerChartJS, createChartOptions } from '@/lib/utils/chartConfig';
import { useTheme } from '@/components/theme/ThemeProvider';

registerChartJS();

export default function JejuOperationChart({ data }: { data: SukubOperationItem[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const rows = useMemo(() =>
        data.map(d => ({
            ...d,
            dateTime: `${d.tm.slice(4,6)}/${d.tm.slice(6,8)} ${d.tm.slice(8,10)}:${d.tm.slice(10,12)}`,
        })),
        [data]
    );

    const labels = useMemo(() => rows.map(r => r.dateTime), [rows]);

    const chartData = useMemo(() => ({
        labels,
        datasets: [
            {
                label: '현재수요',
                data: rows.map(r => r.currPwrTot ?? null),
                borderColor: '#a8b8d8',
                backgroundColor: 'rgba(168, 184, 216, 0.15)',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                fill: false,
            },
            {
                label: '태양광발전',
                data: rows.map(r => r.renewPwrSolar ?? null),
                borderColor: '#fde68a',
                backgroundColor: 'rgba(253, 230, 138, 0.15)',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                fill: false,
            },
            {
                label: '풍력발전',
                data: rows.map(r => r.renewPwrWind ?? null),
                borderColor: '#93c5fd',
                backgroundColor: 'rgba(147, 197, 253, 0.15)',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                fill: false,
            },
        ],
    }), [labels, rows]);

    const options = useMemo(() => {
        const baseOptions = createChartOptions('전력량 (MW)', isDark);
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
                            return `${context.dataset.label}: ${formatted} MW`;
                        },
                    },
                },
            },
        };
    }, [isDark]);

    return (
        <div className="w-full h-[280px]" role="img" aria-label="제주 계통 운영 현황 차트">
            <Line data={chartData} options={options} />
        </div>
    );
}

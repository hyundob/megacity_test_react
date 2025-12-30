import { DemandPredict } from '@/lib/types';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

// globals.css의 --font-sans와 동일한 패밀리
const FONT_FAMILY =
    "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif";

export default function DemandPredictChart({ data }: { data: DemandPredict[] }) {
    const rows = data.map(d => ({
        ...d,
        hour: `${d.fcstTm.slice(4, 6)}/${d.fcstTm.slice(6, 8)} ${d.fcstTm.slice(8, 10)}:00`,
    }));

    const labels = rows.map(r => r.hour);

    const chartData = {
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
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    font: { size: 11, family: FONT_FAMILY },
                    color: '#4b5563', // text-gray-600
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#ffffff',
                titleColor: '#111827',
                bodyColor: '#111827',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                titleFont: { family: FONT_FAMILY, size: 12 },
                bodyFont: { family: FONT_FAMILY, size: 12 },
                callbacks: {
                    title(items) {
                        if (!items.length) return '';
                        return `시간: ${items[0].label}`;
                    },
                    label(context) {
                        const value = context.parsed.y;
                        if (value == null || Number.isNaN(value)) return '';
                        const formatted = (value as number)
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                        return `${context.dataset.label} : ${formatted} MWh`;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    color: '#6b7280', // text-gray-500
                    font: { size: 10, family: FONT_FAMILY },
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.25)', // slate-400, 연한 그리드
                },
            },
            y: {
                ticks: {
                    color: '#6b7280',
                    font: { size: 11, family: FONT_FAMILY },
                    callback(value) {
                        if (typeof value === 'number') {
                            return value.toLocaleString();
                        }
                        return value;
                    },
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.25)',
                },
                title: {
                    display: true,
                    text: '전력량 (MWh)',
                    color: '#4b5563',
                    font: { size: 12, family: FONT_FAMILY },
                },
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    return (
        <div className="w-full h-[260px]">
            <Line data={chartData} options={options} />
        </div>
    );
}

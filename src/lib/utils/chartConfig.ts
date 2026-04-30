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

// Chart.js 등록 (한 번만 실행)
let chartRegistered = false;

export function registerChartJS() {
    if (!chartRegistered) {
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
        chartRegistered = true;
    }
}

// globals.css의 --font-sans와 동일한 패밀리
export const FONT_FAMILY =
    "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif";

// 공통 Chart.js 옵션 생성 유틸리티
export function createChartOptions(
    yAxisLabel: string,
    isDark: boolean = false,
    dualYAxis?: { leftLabel: string; rightLabel: string },
    tripleYAxis?: { leftLabel: string; rightLabel1: string; rightLabel2: string }
): ChartOptions<'line'> {
    const textColor   = isDark ? 'rgba(255,255,255,0.75)' : '#64748b';
    const gridColor   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.20)';
    const tooltipBg   = isDark ? 'rgba(8,16,36,0.95)'    : '#ffffff';
    const tooltipText = isDark ? '#e2e8f0'                 : '#111827';
    const tooltipBorder = isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb';

    if (tripleYAxis) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        font: { size: 11, family: FONT_FAMILY },
                        color: textColor,
                    },
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: tooltipBg,
                    titleColor: tooltipText,
                    bodyColor: tooltipText,
                    borderColor: tooltipBorder,
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
                            const datasetLabel = context.dataset.label || '';
                            return `${datasetLabel}: ${formatted}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        color: textColor,
                        font: { size: 10, family: FONT_FAMILY },
                    },
                    grid: {
                        color: gridColor,
                    },
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        color: textColor,
                        font: { size: 11, family: FONT_FAMILY },
                        callback(value) {
                            if (typeof value === 'number') {
                                return value.toLocaleString();
                            }
                            return value;
                        },
                    },
                    grid: {
                        color: gridColor,
                    },
                    title: {
                        display: true,
                        text: tripleYAxis.leftLabel,
                        color: textColor,
                        font: { size: 12, family: FONT_FAMILY },
                    },
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        color: textColor,
                        font: { size: 11, family: FONT_FAMILY },
                        callback(value) {
                            if (typeof value === 'number') {
                                return value.toLocaleString();
                            }
                            return value;
                        },
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: tripleYAxis.rightLabel1,
                        color: textColor,
                        font: { size: 12, family: FONT_FAMILY },
                    },
                },
                y2: {
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        color: textColor,
                        font: { size: 11, family: FONT_FAMILY },
                        callback(value) {
                            if (typeof value === 'number') {
                                return value.toLocaleString();
                            }
                            return value;
                        },
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: tripleYAxis.rightLabel2,
                        color: textColor,
                        font: { size: 12, family: FONT_FAMILY },
                    },
                },
            },
        };
    }

    if (dualYAxis) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        font: { size: 11, family: FONT_FAMILY },
                        color: textColor,
                    },
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: tooltipBg,
                    titleColor: tooltipText,
                    bodyColor: tooltipText,
                    borderColor: tooltipBorder,
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
                            const datasetLabel = context.dataset.label || '';
                            return `${datasetLabel}: ${formatted}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        color: textColor,
                        font: { size: 10, family: FONT_FAMILY },
                    },
                    grid: {
                        color: gridColor,
                    },
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        color: textColor,
                        font: { size: 11, family: FONT_FAMILY },
                        callback(value) {
                            if (typeof value === 'number') {
                                return value.toLocaleString();
                            }
                            return value;
                        },
                    },
                    grid: {
                        color: gridColor,
                    },
                    title: {
                        display: true,
                        text: dualYAxis.leftLabel,
                        color: textColor,
                        font: { size: 12, family: FONT_FAMILY },
                    },
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        color: textColor,
                        font: { size: 11, family: FONT_FAMILY },
                        callback(value) {
                            if (typeof value === 'number') {
                                return value.toLocaleString();
                            }
                            return value;
                        },
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: dualYAxis.rightLabel,
                        color: textColor,
                        font: { size: 12, family: FONT_FAMILY },
                    },
                },
            },
        };
    }

    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    font: { size: 11, family: FONT_FAMILY },
                    color: textColor,
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
                        const datasetLabel = context.dataset.label || '';
                        return `${datasetLabel}: ${formatted}`;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    color: textColor,
                    font: { size: 10, family: FONT_FAMILY },
                },
                grid: {
                    color: gridColor,
                },
            },
            y: {
                ticks: {
                    color: textColor,
                    font: { size: 11, family: FONT_FAMILY },
                    callback(value) {
                        if (typeof value === 'number') {
                            return value.toLocaleString();
                        }
                        return value;
                    },
                },
                grid: {
                    color: gridColor,
                },
                title: {
                    display: true,
                    text: yAxisLabel,
                    color: textColor,
                    font: { size: 12, family: FONT_FAMILY },
                },
            },
        },
    };
}

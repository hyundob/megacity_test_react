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
    type ScriptableContext,
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

// 공용 차트 팔레트 — Sunset Grid (Coral / Amber / Mint / Deep Blue)에서 파생.
// 차트마다 제각각인 원색 대신 이 팔레트만 재사용해서 시각적으로 하나의 시스템처럼 보이게 한다.
export const CHART_PALETTE = {
    copper: { light: '#E8483F', dark: '#FF6B6B' },
    caramel: { light: '#C98A00', dark: '#FFD166' },
    olive: { light: '#049B78', dark: '#06D6A0' },
    forest: { light: '#118AB2', dark: '#3FB8DE' },
    ink: { light: '#716e7a', dark: '#a9a6b8' },
} as const;

export function chartColor(role: keyof typeof CHART_PALETTE, isDark: boolean) {
    return isDark ? CHART_PALETTE[role].dark : CHART_PALETTE[role].light;
}

function hexToRgba(hex: string, alpha: number) {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 라인 아래 은은하게 번지는 그라디언트 채움을 만든다 — 단색 반투명 배경 대신
// 상단은 진하고 하단은 투명해지는 실제 캔버스 그라디언트를 써서 "면적 차트"다운
// 입체감을 준다. chartArea가 아직 없는 첫 레이아웃 패스에서는 투명을 반환.
export function gradientFill(colorHex: string, alphaTop = 0.32, alphaBottom = 0.02) {
    return (context: ScriptableContext<'line'>) => {
        const { chart } = context;
        const { ctx, chartArea } = chart;
        if (!chartArea) return hexToRgba(colorHex, 0);
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, hexToRgba(colorHex, alphaTop));
        gradient.addColorStop(1, hexToRgba(colorHex, alphaBottom));
        return gradient;
    };
}

// 공통 Chart.js 옵션 생성 유틸리티
export function createChartOptions(
    yAxisLabel: string,
    isDark: boolean = false,
    dualYAxis?: { leftLabel: string; rightLabel: string },
    tripleYAxis?: { leftLabel: string; rightLabel1: string; rightLabel2: string }
): ChartOptions<'line'> {
    const textColor     = isDark ? 'rgba(242,241,245,0.75)' : '#55525d';
    const gridColor     = isDark ? 'rgba(242,241,245,0.07)' : 'rgba(20,20,26,0.07)';
    const tooltipBg     = isDark ? 'rgba(24,25,34,0.96)'    : 'rgba(255,255,255,0.98)';
    const tooltipText   = isDark ? '#f2f1f5'                 : '#1b1a20';
    const tooltipBorder = isDark ? 'rgba(242,241,245,0.10)' : 'rgba(20,20,26,0.08)';

    const tooltipBase = {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        cornerRadius: 10,
        padding: 10,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: { family: FONT_FAMILY, size: 12, weight: 600 as const },
        bodyFont: { family: FONT_FAMILY, size: 12 },
        callbacks: {
            title(items: { label: string }[]) {
                if (!items.length) return '';
                return `시간: ${items[0].label}`;
            },
            label(context: { parsed: { y: number | null }; dataset: { label?: string } }) {
                const value = context.parsed.y;
                if (value == null || Number.isNaN(value)) return '';
                const formatted = (value as number)
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                const datasetLabel = context.dataset.label || '';
                return `${datasetLabel}: ${formatted}`;
            },
        },
    };

    const legendBase = {
        position: 'bottom' as const,
        labels: {
            usePointStyle: true,
            pointStyle: 'circle' as const,
            boxHeight: 7,
            boxWidth: 7,
            padding: 16,
            font: { size: 11, family: FONT_FAMILY },
            color: textColor,
        },
    };

    const xAxisBase = {
        ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
            color: textColor,
            font: { size: 10, family: FONT_FAMILY },
        },
        grid: {
            display: false,
        },
        border: {
            display: false,
        },
    };

    const yTicksBase = {
        color: textColor,
        font: { size: 11, family: FONT_FAMILY },
        callback(value: number | string) {
            if (typeof value === 'number') {
                return value.toLocaleString();
            }
            return value;
        },
    };

    const elements = {
        line: {
            borderCapStyle: 'round' as const,
            borderJoinStyle: 'round' as const,
        },
        point: {
            hoverBorderWidth: 2,
        },
    };

    if (tripleYAxis) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            elements,
            plugins: {
                legend: legendBase,
                tooltip: tooltipBase,
            },
            scales: {
                x: xAxisBase,
                y: {
                    type: 'linear',
                    position: 'left',
                    ticks: yTicksBase,
                    grid: { color: gridColor, drawTicks: false },
                    border: { display: false },
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
                    ticks: yTicksBase,
                    grid: { drawOnChartArea: false },
                    border: { display: false },
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
                    ticks: yTicksBase,
                    grid: { drawOnChartArea: false },
                    border: { display: false },
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
            elements,
            plugins: {
                legend: legendBase,
                tooltip: tooltipBase,
            },
            scales: {
                x: xAxisBase,
                y: {
                    type: 'linear',
                    position: 'left',
                    ticks: yTicksBase,
                    grid: { color: gridColor, drawTicks: false },
                    border: { display: false },
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
                    ticks: yTicksBase,
                    grid: { drawOnChartArea: false },
                    border: { display: false },
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
        elements,
        plugins: {
            legend: legendBase,
            tooltip: tooltipBase,
        },
        scales: {
            x: xAxisBase,
            y: {
                ticks: yTicksBase,
                grid: { color: gridColor, drawTicks: false },
                border: { display: false },
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

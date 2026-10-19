import { useMemo } from 'react';
import { DemandPredict, ReGenPredict } from '@/lib/types';
import { Line } from 'react-chartjs-2';
import type { TooltipItem } from 'chart.js';
import { registerChartJS, createChartOptions, chartColor, gradientFill } from '@/lib/utils/chartConfig';
import { useTheme } from '@/components/theme/ThemeProvider';

registerChartJS();

interface DemandReGenChartProps {
    demandData: DemandPredict[];
    reGenData: ReGenPredict[];
    windData: ReGenPredict[];
}

export default function DemandReGenChart({ demandData, reGenData, windData }: DemandReGenChartProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const reGenMap = useMemo(() => new Map(reGenData.map(d => [d.fcstTm, d])), [reGenData]);
    const windMap  = useMemo(() => new Map(windData.map(d => [d.fcstTm, d])), [windData]);

    const mergedData = useMemo(() => demandData.map(demand => {
        const matchingSolar = reGenMap.get(demand.fcstTm);
        const matchingWind  = windMap.get(demand.fcstTm);
        const solarGen = matchingSolar?.fcstQgen ?? null;
        const windGen = matchingWind?.fcstQgen ?? null;
        const totalRenewGen = solarGen != null && windGen != null ? solarGen + windGen : null;
        return {
            ...demand,
            hour: `${demand.fcstTm.slice(4,6)}/${demand.fcstTm.slice(6,8)} ${demand.fcstTm.slice(8, 10)}:00`,
            renewGen: totalRenewGen,
            solarGen,
            windGen,
        };
    }), [demandData, reGenMap, windMap]);

    const labels = useMemo(() => mergedData.map(d => d.hour), [mergedData]);

    const chartData = useMemo(() => ({
        labels,
        datasets: [
            {
                label: '수요예측',
                data: mergedData.map(d => d.fcstQgen ?? null),
                borderColor: chartColor('copper', isDark),
                backgroundColor: gradientFill(chartColor('copper', isDark), 0.22, 0.01),
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: chartColor('copper', isDark),
                pointHoverBorderColor: isDark ? '#181922' : '#ffffff',
                pointHoverBorderWidth: 2,
                fill: 'start',
            },
            {
                label: '신재생발전 예측',
                data: mergedData.map(d => d.renewGen ?? null),
                borderColor: chartColor('olive', isDark),
                backgroundColor: gradientFill(chartColor('olive', isDark), 0.22, 0.01),
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: chartColor('olive', isDark),
                pointHoverBorderColor: isDark ? '#181922' : '#ffffff',
                pointHoverBorderWidth: 2,
                fill: 'start',
            },
        ],
    }), [labels, mergedData, isDark]);

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
        <div className="w-full h-[280px]" role="img" aria-label="수요 vs 재생에너지 비교 차트">
            <Line data={chartData} options={options} />
        </div>
    );
}

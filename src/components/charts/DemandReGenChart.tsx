import { useMemo } from 'react';
import { DemandPredict, ReGenPredict } from '@/lib/types';
import { Line } from 'react-chartjs-2';
import { registerChartJS, createChartOptions } from '@/lib/utils/chartConfig';
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

    const mergedData = useMemo(() => demandData.map(demand => {
        const matchingSolar = reGenData.find(regen => regen.fcstTm === demand.fcstTm);
        const matchingWind = windData.find(wind => wind.fcstTm === demand.fcstTm);
        const solarGen = matchingSolar ? matchingSolar.fcstQgen : 0;
        const windGen = matchingWind ? matchingWind.fcstQgen : 0;
        const totalRenewGen = solarGen + windGen;
        return {
            ...demand,
            hour: `${demand.fcstTm.slice(4,6)}/${demand.fcstTm.slice(6,8)} ${demand.fcstTm.slice(8, 10)}:00`,
            renewGen: totalRenewGen > 0 ? totalRenewGen : null,
            solarGen: solarGen > 0 ? solarGen : null,
            windGen: windGen > 0 ? windGen : null,
        };
    }), [demandData, reGenData, windData]);

    const labels = useMemo(() => mergedData.map(d => d.hour), [mergedData]);

    const chartData = useMemo(() => ({
        labels,
        datasets: [
            {
                label: '수요예측',
                data: mergedData.map(d => d.fcstQgen ?? null),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                borderDash: [6, 4],
                fill: false,
            },
            {
                label: '신재생발전 예측',
                data: mergedData.map(d => d.renewGen ?? null),
                borderColor: '#34d399',
                backgroundColor: 'rgba(52, 211, 153, 0.15)',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0,
                borderDash: [6, 4],
                fill: false,
            },
        ],
    }), [labels, mergedData]);

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
        <div className="w-full h-[280px]" role="img" aria-label="수요 vs 재생에너지 비교 차트">
            <Line data={chartData} options={options} />
        </div>
    );
}

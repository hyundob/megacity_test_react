'use client';

import React from 'react';
import {
    Activity,
    AlertTriangle,
    Cloud,
    FlaskConical,
    Sun,
    TrendingUp,
    Wind,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ForecastInfoCard from '../cards/ForecastInfoCard';
import SukubInfoCard from '../cards/SukubInfoCard';
import CurtChart from '../charts/CurtChart';
import DemandPredictChart from '../charts/DemandPredictChart';
import DemandReGenChart from '../charts/DemandReGenChart';
import ForecastLast48hChart from '../charts/ForecastLast48hChart';
import JejuOperationChart from '../charts/JejuOperationChart';
import SolarPredictChart from '../charts/SolarPredictChart';
import WindPredictChart from '../charts/WindPredictChart';
import { JejuMapCard } from '../map/JejuMapCard';
import SystemStatusCard from '../system/SystemStatusCard';
import type { DashboardWidgetDefinition } from './DashboardGrid';
import type { useDashboardData } from '@/lib/useDashboardData';
import type { useKPICalculations } from '@/lib/hooks/useKPICalculations';
import type { ForecastPredict, JejuRegion } from '@/lib/types';

type DashboardData = ReturnType<typeof useDashboardData>;
type KpiData = ReturnType<typeof useKPICalculations>;
type WidgetColor = 'blue' | 'orange' | 'cyan' | 'amber' | 'emerald' | 'violet' | 'pink' | 'teal';

const H2_PRODUCTION_KG_PER_KWH = 0.115;
const H2_STORAGE_MAX_KG = 1000;

function calculateSurplusHydrogenKg(kpi: KpiData) {
    const surplusMW = kpi.currentRenewable != null && kpi.currentDemand != null
        ? kpi.currentRenewable - kpi.currentDemand
        : null;
    const surplusKW = surplusMW != null ? surplusMW * 1000 : null;
    const h2EstimateRaw = surplusKW != null && surplusKW > 0
        ? surplusKW * H2_PRODUCTION_KG_PER_KWH
        : null;

    return {
        surplusMW,
        h2EstimateRaw,
        h2Estimate: h2EstimateRaw != null ? Math.min(h2EstimateRaw, H2_STORAGE_MAX_KG) : null,
    };
}

interface BuildDashboardWidgetsArgs {
    data: DashboardData;
    kpi: KpiData;
    selectedAreaGrpId: string;
    areaGrpIds: string[];
    filteredForecastData: ForecastPredict[];
    onAreaGrpIdChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onRegionSelect: (region: JejuRegion) => Promise<void>;
}

function WidgetCard({
    title,
    subtitle,
    icon: Icon,
    color,
    children,
}: {
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    color: WidgetColor;
    children: React.ReactNode;
}) {
    return (
        <div className={`dashboard-widget-card glass-card glass-card-${color}`}>
            <div className="dashboard-widget-header">
                <div className="min-w-0">
                    <h2 className="dashboard-widget-title">{title}</h2>
                    {subtitle && (
                        <p className="dashboard-widget-subtitle">{subtitle}</p>
                    )}
                </div>
                <div className={`dashboard-widget-icon icon-box icon-box-${color}`}>
                    <Icon className={`w-6 h-6 ${iconColorClass(color)}`} />
                </div>
            </div>
            <div className="dashboard-widget-card-body">
                {children}
            </div>
        </div>
    );
}

function iconColorClass(color: WidgetColor) {
    const colors: Record<WidgetColor, string> = {
        blue: 'text-blue-500 dark:text-blue-400',
        orange: 'text-orange-500 dark:text-orange-400',
        cyan: 'text-cyan-500 dark:text-cyan-400',
        amber: 'text-amber-500 dark:text-amber-400',
        emerald: 'text-emerald-500 dark:text-emerald-400',
        violet: 'text-violet-500 dark:text-violet-400',
        pink: 'text-pink-500 dark:text-pink-400',
        teal: 'text-teal-500 dark:text-teal-400',
    };

    return colors[color];
}

function ChartShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="dashboard-chart-shell">
            <div className="w-full h-full">
                {children}
            </div>
        </div>
    );
}

function EmptyState({ label = '데이터 로딩 중...' }: { label?: string }) {
    return (
        <div className="dashboard-empty-state">
            {label}
        </div>
    );
}

function DemandWidget({ data, kpi }: { data: DashboardData; kpi: KpiData }) {
    return (
        <WidgetCard title="전력 수요" subtitle="현재 운영 데이터" icon={Zap} color="blue">
            <div className="mb-3">
                <div className="dashboard-demand-value">
                    {kpi.currentDemand != null ? `${Math.round(kpi.currentDemand).toLocaleString()}` : '--'}
                    <span>MW</span>
                </div>
                {kpi.currentRenewable != null && kpi.currentDemand != null && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        <TrendingUp className="w-4 h-4" />
                        <span>재생에너지 {kpi.renewableRatio.toFixed(1)}%</span>
                    </div>
                )}
            </div>
            <div className="dashboard-widget-grow">
                {data.demandPredict.length > 0 ? (
                    <ChartShell>
                        <DemandPredictChart data={data.demandPredict} />
                    </ChartShell>
                ) : (
                    <EmptyState />
                )}
            </div>
        </WidgetCard>
    );
}

function CurtWidget({ data }: { data: DashboardData }) {
    return (
        <WidgetCard title="출력제어" subtitle="출력제어 예측" icon={Activity} color="orange">
            {data.jejuCurtPredictToday.length > 0 ? (
                <ChartShell>
                    <CurtChart data={data.jejuCurtPredictToday} />
                </ChartShell>
            ) : (
                <EmptyState />
            )}
        </WidgetCard>
    );
}

function WeatherWidget({ data }: { data: DashboardData }) {
    return (
        <WidgetCard title="수소생산단지 기상 예측" subtitle="일간 NWP 예측 자료" icon={Cloud} color="cyan">
            {data.forecastPredict ? <ForecastInfoCard data={data.forecastPredict} /> : <EmptyState />}
        </WidgetCard>
    );
}

function JejuMapWidget({ data, onRegionSelect }: { data: DashboardData; onRegionSelect: (region: JejuRegion) => Promise<void> }) {
    return (
        <WidgetCard title="제주 지역" subtitle="지역 선택 및 기상 현황" icon={Cloud} color="teal">
            <JejuMapCard
                selectedRegion={data.selectedJejuRegion}
                onRegionSelect={onRegionSelect}
                tempC={data.ncstTempC}
                windMs={data.ncstWindMs}
                windDir={data.ncstWindDir}
                pty={data.ncstPty}
                ptyText={data.ncstPtyText}
                sky={data.ncstSky}
            />
        </WidgetCard>
    );
}

function OperationWidget({ data }: { data: DashboardData }) {
    return (
        <WidgetCard title="전력 운영" subtitle="계통 운영 현황" icon={Zap} color="pink">
            {data.sukubOperationToday.length > 0 ? (
                <ChartShell>
                    <JejuOperationChart data={data.sukubOperationToday} />
                </ChartShell>
            ) : (
                <EmptyState />
            )}
        </WidgetCard>
    );
}

function DemandReGenWidget({ data }: { data: DashboardData }) {
    return (
        <WidgetCard title="수요 vs 재생에너지" subtitle="전력수요와 재생에너지 비교" icon={TrendingUp} color="cyan">
            {data.demandPredict.length > 0 && (data.reGenPredictData.length > 0 || data.windPredictData.length > 0) ? (
                <ChartShell>
                    <DemandReGenChart
                        demandData={data.demandPredict}
                        reGenData={data.reGenPredictData}
                        windData={data.windPredictData}
                    />
                </ChartShell>
            ) : (
                <EmptyState />
            )}
        </WidgetCard>
    );
}

function HydrogenScenarioWidget({ kpi }: { kpi: KpiData }) {
    const { surplusMW, h2EstimateRaw, h2Estimate } = calculateSurplusHydrogenKg(kpi);
    const isStorageMaxReached = h2EstimateRaw != null && h2EstimateRaw > H2_STORAGE_MAX_KG;

    return (
        <WidgetCard title="잉여 전력 기반 수소 전환" subtitle="재생에너지 발전 - 현재 수요 기반 추산" icon={FlaskConical} color="violet">
            {surplusMW == null ? (
                <EmptyState />
            ) : (
                <div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <MetricTile label="재생에너지 발전" value={kpi.currentRenewable} unit="MW" />
                        <MetricTile label="현재 수요" value={kpi.currentDemand} unit="MW" />
                        <div className={`rounded-lg p-3 border text-center ${surplusMW > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">잉여 전력</p>
                            <p className={`text-lg font-bold ${surplusMW > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                                {surplusMW > 0 ? '+' : ''}{Math.round(surplusMW).toLocaleString()}
                                <span className="text-xs font-normal text-slate-500 ml-1">MW</span>
                            </p>
                        </div>
                    </div>

                    {h2Estimate != null ? (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-3">수소 생산량 추산 (kg/h)</p>
                            <ScenarioBar label="기준 계수" value={h2Estimate} percent={100} tone="bg-violet-500" />
                            {isStorageMaxReached && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                    저장용기 최대치 1,000kg 제한이 적용되었습니다.
                                </p>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                계산식: 잉여 전력(kW) x 0.115 kg/kWh
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>현재 재생에너지 발전량이 수요보다 낮아 잉여 전력이 없습니다.</span>
                        </div>
                    )}
                </div>
            )}
        </WidgetCard>
    );
}

function SolarWidget({ data }: { data: DashboardData }) {
    return (
        <WidgetCard title="태양광 발전" subtitle="태양광 발전 예측" icon={Sun} color="amber">
            {data.reGenPredictData.length > 0 ? (
                <ChartShell>
                    <SolarPredictChart data={data.reGenPredictData} />
                </ChartShell>
            ) : (
                <EmptyState />
            )}
        </WidgetCard>
    );
}

function WindWidget({ data }: { data: DashboardData }) {
    return (
        <WidgetCard title="풍력 발전" subtitle="풍력 발전 예측" icon={Wind} color="emerald">
            {data.windPredictData.length > 0 ? (
                <ChartShell>
                    <WindPredictChart data={data.windPredictData} />
                </ChartShell>
            ) : (
                <EmptyState />
            )}
        </WidgetCard>
    );
}

function KpiWidget({ kpi }: { kpi: KpiData }) {
    const { h2Estimate } = calculateSurplusHydrogenKg(kpi);

    return (
        <WidgetCard title="KPI" subtitle="핵심 지표" icon={TrendingUp} color="cyan">
            <div className="grid grid-cols-2 gap-3">
                <KpiTile icon={Zap} color="blue" label="현재 수요" value={kpi.currentDemand} unit="MW" />
                <KpiTile icon={Sun} color="green" label="신재생" value={kpi.currentRenewable} unit="MW" />
                <KpiTile icon={TrendingUp} color="purple" label="재생 비율" value={kpi.renewableRatio > 0 ? kpi.renewableRatio : null} unit="%" decimals={1} />
                <KpiTile icon={FlaskConical} color="cyan" label="수소 전환" value={h2Estimate} unit="kg/h" />
            </div>
        </WidgetCard>
    );
}

function SukubInfoWidget({ data }: { data: DashboardData }) {
    return (
        <WidgetCard title="계통 운영 정보" subtitle="전력 시스템 현황" icon={Zap} color="pink">
            {data.sukubOperation ? (
                <SukubInfoCard data={data.sukubOperation} dailyData={data.sukubOperationToday} />
            ) : (
                <EmptyState />
            )}
        </WidgetCard>
    );
}

function SystemStatusWidget({ data }: { data: DashboardData }) {
    return (
        <WidgetCard title="시스템 상태" subtitle="서비스 응답 시간" icon={Activity} color="teal">
            <SystemStatusCard
                latApi={data.latApi}
                latDb={data.latDb}
                latPredict={data.latPredict}
                healthApi={data.healthApi}
                healthDb={data.healthDb}
                healthPredict={data.healthPredict}
            />
        </WidgetCard>
    );
}

function Forecast48hWidget({
    data,
    selectedAreaGrpId,
    areaGrpIds,
    filteredForecastData,
    onAreaGrpIdChange,
}: {
    data: DashboardData;
    selectedAreaGrpId: string;
    areaGrpIds: string[];
    filteredForecastData: ForecastPredict[];
    onAreaGrpIdChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
    return (
        <WidgetCard title="최근 48시간 수소단지 기상 예측" subtitle="영역별 기온/일사량/풍속 트렌드" icon={Cloud} color="violet">
            {data.forecastPredictLast48h.length > 0 ? (
                <ChartShell>
                    <ForecastLast48hChart
                        data={filteredForecastData}
                        areaGrpId={selectedAreaGrpId}
                        areaGrpIds={areaGrpIds}
                        selectedAreaGrpId={selectedAreaGrpId}
                        onAreaGrpIdChange={onAreaGrpIdChange}
                    />
                </ChartShell>
            ) : (
                <EmptyState />
            )}
        </WidgetCard>
    );
}

function MetricTile({ label, value, unit }: { label: string; value: number | null; unit: string }) {
    return (
        <div className="bg-black/5 dark:bg-black/25 rounded-lg p-2.5 border border-black/8 dark:border-white/5 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                {value != null ? Math.round(value).toLocaleString() : '--'}
                <span className="text-xs font-normal text-slate-500 ml-1">{unit}</span>
            </p>
        </div>
    );
}

function ScenarioBar({ label, value, percent, tone }: { label: string; value: number; percent: number; tone: string }) {
    const formattedValue = value.toLocaleString('ko-KR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-24 shrink-0">{label}</span>
            <div className="flex-1 bg-black/10 dark:bg-white/10 rounded-full h-2">
                <div className={`${tone} h-2 rounded-full`} style={{ width: `${percent}%` }} />
            </div>
            <span className="text-sm font-bold text-violet-600 dark:text-violet-400 w-20 text-right">
                {formattedValue}
            </span>
        </div>
    );
}

function KpiTile({
    icon: Icon,
    color,
    label,
    value,
    unit,
    decimals = 0,
}: {
    icon: LucideIcon;
    color: 'blue' | 'green' | 'purple' | 'cyan';
    label: string;
    value: number | null;
    unit: string;
    decimals?: number;
}) {
    const iconClasses: Record<'blue' | 'green' | 'purple' | 'cyan', string> = {
        blue: 'bg-blue-500/15 border-blue-500/25 text-blue-600 dark:text-blue-400',
        green: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-600 dark:text-emerald-400',
        purple: 'bg-violet-500/15 border-violet-500/25 text-violet-600 dark:text-violet-400',
        cyan: 'bg-cyan-500/15 border-cyan-500/25 text-cyan-600 dark:text-cyan-400',
    };

    return (
        <div className={`kpi-card kpi-card-${color} p-3`}>
            <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${iconClasses[color]}`}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">{label}</div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {value != null ? (decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString()) : '--'}
            </div>
            <div className="text-xs text-slate-500">{unit}</div>
        </div>
    );
}

export function buildDashboardWidgets({
    data,
    kpi,
    selectedAreaGrpId,
    areaGrpIds,
    filteredForecastData,
    onAreaGrpIdChange,
    onRegionSelect,
}: BuildDashboardWidgetsArgs): DashboardWidgetDefinition[] {
    return [
        { id: 'demand', title: '전력 수요', node: <DemandWidget data={data} kpi={kpi} /> },
        { id: 'operation', title: '전력 운영', node: <OperationWidget data={data} /> },
        { id: 'curt', title: '출력제어', node: <CurtWidget data={data} /> },
        { id: 'demand-regen', title: '수요 vs 재생에너지', node: <DemandReGenWidget data={data} /> },
        { id: 'weather', title: '수소생산단지 기상 예측', node: <WeatherWidget data={data} /> },
        { id: 'hydrogen-scenario', title: '수소 전환', node: <HydrogenScenarioWidget kpi={kpi} /> },
        { id: 'kpi', title: 'KPI', node: <KpiWidget kpi={kpi} /> },
        { id: 'jeju-map', title: '제주 지역', node: <JejuMapWidget data={data} onRegionSelect={onRegionSelect} /> },
        { id: 'solar', title: '태양광 발전', node: <SolarWidget data={data} /> },
        { id: 'sukub-info', title: '계통 운영 정보', node: <SukubInfoWidget data={data} /> },
        { id: 'wind', title: '풍력 발전', node: <WindWidget data={data} /> },
        { id: 'system-status', title: '시스템 상태', node: <SystemStatusWidget data={data} /> },
        {
            id: 'forecast-48h',
            title: '최근 48시간 수소단지 기상 예측',
            node: (
                <Forecast48hWidget
                    data={data}
                    selectedAreaGrpId={selectedAreaGrpId}
                    areaGrpIds={areaGrpIds}
                    filteredForecastData={filteredForecastData}
                    onAreaGrpIdChange={onAreaGrpIdChange}
                />
            ),
        },
    ];
}

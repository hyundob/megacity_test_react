'use client';

import React from 'react';
import { hydrogenRequest } from '@/lib/hydrogen';
import type { HydrogenHistory } from '@/lib/hydrogen';
import HydrogenSimulation from '../hydrogen/HydrogenSimulation';
import {
    Activity,
    Cloud,
    FlaskConical,
    Sun,
    TrendingUp,
    Wind,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SukubInfoCard from '../cards/SukubInfoCard';
import CurtChart from '../charts/CurtChart';
import DemandPredictChart from '../charts/DemandPredictChart';
import DemandReGenChart from '../charts/DemandReGenChart';
import JejuOperationChart from '../charts/JejuOperationChart';
import SolarPredictChart from '../charts/SolarPredictChart';
import WindPredictChart from '../charts/WindPredictChart';
import { JejuMapCard } from '../map/JejuMapCard';
import SystemStatusCard from '../system/SystemStatusCard';
import type { DashboardWidgetDefinition } from './DashboardGrid';
import type { useDashboardData } from '@/lib/useDashboardData';
import { RESOURCE_LABELS } from '@/lib/useDashboardData';
import type { ResourceKey } from '@/lib/useDashboardData';
import type { useKPICalculations } from '@/lib/hooks/useKPICalculations';
import type { JejuRegion } from '@/lib/types';

type DashboardData = ReturnType<typeof useDashboardData>;
type KpiData = ReturnType<typeof useKPICalculations>;
// 위젯 강조색은 팔레트에서 나온 4가지 역할로만 구성한다 (위젯마다 다른 네온 색을 쓰지 않는다).
type WidgetColor = 'copper' | 'caramel' | 'olive' | 'forest';

interface BuildDashboardWidgetsArgs {
    data: DashboardData;
    kpi: KpiData;
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
                <Icon className={`dashboard-widget-icon w-4 h-4 shrink-0 ${iconColorClass(color)}`} />
                <div className="min-w-0">
                    <h2 className="dashboard-widget-title">{title}</h2>
                    {subtitle && (
                        <p className="dashboard-widget-subtitle">{subtitle}</p>
                    )}
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
        copper: 'text-[#E8483F] dark:text-[#FF6B6B]',
        caramel: 'text-[#C98A00] dark:text-[#FFD166]',
        olive: 'text-[#049B78] dark:text-[#06D6A0]',
        forest: 'text-[#118AB2] dark:text-[#3FB8DE]',
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

function EmptyState({ label = '표시할 데이터가 없습니다.' }: { label?: string }) {
    return (
        <div className="dashboard-empty-state">
            {label}
        </div>
    );
}

function DemandWidget({ data, kpi }: { data: DashboardData; kpi: KpiData }) {
    return (
        <WidgetCard title="전력 수요 및 예측" icon={Zap} color="copper">
            <div className="mb-3">
                <div className="dashboard-demand-value">
                    {kpi.currentDemand != null ? `${Math.round(kpi.currentDemand).toLocaleString()}` : '--'}
                    <span>MW</span>
                </div>
                {kpi.currentRenewable != null && kpi.currentDemand != null && (
                    <div className="text-xs text-[#049B78] dark:text-[#06D6A0] inline-flex items-center gap-1.5 bg-[#049B78]/10 border border-[#049B78]/25 px-2.5 py-1 rounded-lg">
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
        <WidgetCard title="출력제어 예측" icon={Activity} color="copper">
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

function JejuMapWidget({ data, onRegionSelect }: { data: DashboardData; onRegionSelect: (region: JejuRegion) => Promise<void> }) {
    return (
        <WidgetCard title="제주 지역 기상 현황" icon={Cloud} color="forest">
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
        <WidgetCard title="전력 운영 현황" icon={Zap} color="forest">
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
        <WidgetCard title="수요 및 재생에너지 비교" icon={TrendingUp} color="olive">
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

function HydrogenScenarioWidget() {
    return (
        <WidgetCard title="수소 생산 시뮬레이션" icon={FlaskConical} color="olive">
            <HydrogenSimulation />
        </WidgetCard>
    );
}

function SolarWidget({ data }: { data: DashboardData }) {
    return (
        <WidgetCard title="태양광 발전 예측" icon={Sun} color="caramel">
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
        <WidgetCard title="풍력 발전 예측" icon={Wind} color="olive">
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
    const [tankHydrogenKg, setTankHydrogenKg] = React.useState<number | null>(null);
    React.useEffect(() => {
        const controller = new AbortController();
        const refresh = async () => {
            try {
                const data = await hydrogenRequest<HydrogenHistory>('/history?days=1', undefined, controller.signal);
                const value = data?.status?.state?.storedHydrogenKg;
                if (!controller.signal.aborted) {
                    setTankHydrogenKg(typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null);
                }
            } catch {
                if (!controller.signal.aborted) setTankHydrogenKg(null);
            }
        };
        void refresh();
        const timer = setInterval(() => void refresh(), 60000);
        return () => { controller.abort(); clearInterval(timer); };
    }, []);

    return (
        <WidgetCard title="KPI 핵심 지표" icon={TrendingUp} color="copper">
            <div className="grid grid-cols-2 gap-3">
                <KpiTile icon={Zap} color="blue" label="현재 수요" value={kpi.currentDemand} unit="MW" />
                <KpiTile icon={Sun} color="green" label="신재생" value={kpi.currentRenewable} unit="MW" />
                <KpiTile icon={TrendingUp} color="purple" label="재생 비율" value={kpi.currentDemand != null && kpi.currentDemand > 0 && kpi.currentRenewable != null ? kpi.renewableRatio : null} unit="%" decimals={1} />
                <KpiTile icon={FlaskConical} color="cyan" label="현재 탱크 수소량" value={tankHydrogenKg} unit="kg · 마지막 저장 기준" decimals={2} />
            </div>
        </WidgetCard>
    );
}

function SukubInfoWidget({ data }: { data: DashboardData }) {
    return (
        <WidgetCard title="계통 운영 정보" icon={Zap} color="forest">
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
        <WidgetCard title="시스템 상태" icon={Activity} color="forest">
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
    // blue→copper, green→olive, purple→caramel, cyan→forest (kpi-card-* 상단 바와 짝을 맞춤)
    const iconClasses: Record<'blue' | 'green' | 'purple' | 'cyan', string> = {
        blue: 'text-[#E8483F] dark:text-[#FF6B6B]',
        green: 'text-[#049B78] dark:text-[#06D6A0]',
        purple: 'text-[#C98A00] dark:text-[#FFD166]',
        cyan: 'text-[#118AB2] dark:text-[#3FB8DE]',
    };

    return (
        <div className={`kpi-card kpi-card-${color} p-3`}>
            <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${iconClasses[color]}`} />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {value != null ? (decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString()) : '--'}
            </div>
            <div className="text-xs text-slate-500">{unit}</div>
        </div>
    );
}

export function buildDashboardWidgets({
    data,
    kpi,
    onRegionSelect,
}: BuildDashboardWidgetsArgs): DashboardWidgetDefinition[] {
    const widgets: DashboardWidgetDefinition[] = [
        { id: 'demand', title: '전력 수요 및 예측', node: <DemandWidget data={data} kpi={kpi} /> },
        { id: 'operation', title: '전력 운영 현황', node: <OperationWidget data={data} /> },
        { id: 'curt', title: '출력제어 예측', node: <CurtWidget data={data} /> },
        { id: 'demand-regen', title: '수요 및 재생에너지 비교', node: <DemandReGenWidget data={data} /> },
        { id: 'hydrogen-scenario', title: '수소 전환', node: <HydrogenScenarioWidget /> },
        { id: 'kpi', title: 'KPI 핵심 지표', node: <KpiWidget kpi={kpi} /> },
        { id: 'jeju-map', title: '제주 지역 기상 현황', node: <JejuMapWidget data={data} onRegionSelect={onRegionSelect} /> },
        { id: 'solar', title: '태양광 발전 예측', node: <SolarWidget data={data} /> },
        { id: 'sukub-info', title: '계통 운영 정보', node: <SukubInfoWidget data={data} /> },
        { id: 'wind', title: '풍력 발전 예측', node: <WindWidget data={data} /> },
        { id: 'system-status', title: '시스템 상태', node: <SystemStatusWidget data={data} /> },
    ];
    const dependencies: Partial<Record<DashboardWidgetDefinition['id'], ResourceKey[]>> = {
        demand: ['operation', 'demand'], operation: ['history'], curt: ['curt'],
        'demand-regen': ['demand', 'solar', 'wind'], kpi: ['operation'],
        'jeju-map': ['weather'], solar: ['solar'], wind: ['wind'], 'sukub-info': ['operation'],
    };
    return widgets.map(widget => {
        const messages = (dependencies[widget.id] ?? []).flatMap(key => {
            const state = data.resourceStates[key];
            const warning = state.error || data.sourceWarnings[key];
            if (!warning) return [];
            const last = state.updatedAt ? new Date(state.updatedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : null;
            return [`${RESOURCE_LABELS[key]}: ${warning}${last && state.error ? ` (최근 수신: ${last})` : ''}`];
        });
        return { ...widget, node: <div className="flex h-full min-h-0 flex-col">
            {messages.length > 0 && <p role="status" className="mb-1 shrink-0 text-xs text-amber-700 dark:text-amber-400">{messages.join(' · ')}</p>}
            <div className="min-h-0 flex-1">{widget.node}</div>
        </div> };
    });
}

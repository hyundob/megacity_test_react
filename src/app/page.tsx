'use client';

import React, { useMemo, useEffect, useCallback } from 'react';
import { useDashboardData } from '@/lib/useDashboardData';
import { useKPICalculations } from '@/lib/hooks/useKPICalculations';
import { CARD_GRADIENTS } from '@/lib/constants';
import Navbar from '../components/navbar/Navbar';
import LeftColumn from '../components/dashboard/LeftColumn';
import CenterColumn from '../components/dashboard/CenterColumn';
import RightColumn from '../components/dashboard/RightColumn';
import Forecast48hSection from '../components/dashboard/Forecast48hSection';
import './globals.css';

export default function Page() {
    const d = useDashboardData();
    const [selectedAreaGrpId, setSelectedAreaGrpId] = React.useState<string>('');

    // KPI 계산
    const kpi = useKPICalculations({
        sukubOperation: d.sukubOperation,
        hgGenUtilPct: d.hgGenUtilPct
    });

    // 이벤트 핸들러
    const handleToggleAutoRefresh = useCallback(() => {
        d.setAutoRefresh(!d.autoRefresh);
    }, [d.autoRefresh, d.setAutoRefresh]);

    const handleManualRefresh = useCallback(() => {
        d.load();
    }, [d.load]);

    const handleAreaGrpIdChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAreaGrpId(e.target.value);
    }, []);

    // areaGrpId 목록 추출 (중복 제거)
    const areaGrpIds = useMemo(() => {
        const ids = new Set(d.forecastPredictLast48h.map(item => item.areaGrpId).filter(Boolean));
        return Array.from(ids).sort();
    }, [d.forecastPredictLast48h]);

    // 첫 번째 영역을 기본값으로 설정
    useEffect(() => {
        if (areaGrpIds.length > 0 && !selectedAreaGrpId) {
            setSelectedAreaGrpId(areaGrpIds[0]);
        }
    }, [areaGrpIds, selectedAreaGrpId]);

    // 선택된 areaGrpId로 필터링
    const filteredData = useMemo(() => {
        if (!selectedAreaGrpId) return [];
        return d.forecastPredictLast48h.filter(item => item.areaGrpId === selectedAreaGrpId);
    }, [d.forecastPredictLast48h, selectedAreaGrpId]);

    const handleRegionSelect = useCallback(async (region: NonNullable<typeof d.selectedJejuRegion>) => {
        if (!region) return;
        d.setSelectedJejuRegion(region);
        await d.loadJejuWeather(region);
    }, [d.setSelectedJejuRegion, d.loadJejuWeather]);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1920px] mx-auto p-3 sm:p-4">
                <Navbar
                    lastUpdated={d.lastUpdated}
                    apiStatus={d.apiStatus}
                    dbStatus={d.dbStatus}
                    autoRefresh={d.autoRefresh}
                    onToggleAutoRefresh={handleToggleAutoRefresh}
                    onManualRefresh={handleManualRefresh}
                    alerts={d.alerts}
                />

                {/* 메인 대시보드 레이아웃 */}
                <div
                    className="grid grid-cols-1 lg:grid-cols-12 gap-4"
                    style={{
                        background: CARD_GRADIENTS.mainBackground,
                        padding: '1.5rem',
                        borderRadius: '24px',
                        marginBottom: '1.5rem',
                        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <LeftColumn
                        currentDemand={kpi.currentDemand}
                        currentRenewable={kpi.currentRenewable}
                        renewableRatio={kpi.renewableRatio}
                        demandPredict={d.demandPredict}
                        jejuCurtPredictToday={d.jejuCurtPredictToday}
                        forecastPredict={d.forecastPredict}
                        selectedJejuRegion={d.selectedJejuRegion}
                        onRegionSelect={handleRegionSelect}
                        ncstTempC={d.ncstTempC}
                        ncstWindMs={d.ncstWindMs}
                        ncstWindDir={d.ncstWindDir}
                        ncstPty={d.ncstPty}
                        ncstPtyText={d.ncstPtyText}
                        ncstSky={d.ncstSky}
                    />

                    <CenterColumn
                        sukubOperationToday={d.sukubOperationToday}
                        demandPredict={d.demandPredict}
                        reGenPredictData={d.reGenPredictData}
                        windPredictData={d.windPredictData}
                    />

                    <RightColumn
                        hgGenLastItem={d.hgGenLastItem}
                        hgGenUtilPct={d.hgGenUtilPct}
                        hgGenLatency={d.hgGenLatency}
                        hgGenInfoToday={d.hgGenInfoToday}
                        hgGenPredictToday={d.hgGenPredictToday}
                        sukubOperation={d.sukubOperation}
                        sukubOperationToday={d.sukubOperationToday}
                        currentDemand={kpi.currentDemand}
                        currentRenewable={kpi.currentRenewable}
                        renewableRatio={kpi.renewableRatio}
                        hydrogenUtil={kpi.hydrogenUtil}
                        latApi={d.latApi}
                        latDb={d.latDb}
                        latPredict={d.latPredict}
                        healthApi={d.healthApi}
                        healthDb={d.healthDb}
                        healthPredict={d.healthPredict}
                    />
                </div>

                {/* 하단: 기상 예보 상세 전체폭 */}
                <Forecast48hSection
                    forecastPredictLast48h={d.forecastPredictLast48h}
                    filteredData={filteredData}
                    selectedAreaGrpId={selectedAreaGrpId}
                    areaGrpIds={areaGrpIds}
                    onAreaGrpIdChange={handleAreaGrpIdChange}
                />
            </div>
        </div>
    );
}

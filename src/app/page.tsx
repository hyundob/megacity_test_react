'use client';

import React, { useMemo, useEffect, useCallback } from 'react';
import { useDashboardData } from '@/lib/useDashboardData';
import { useKPICalculations } from '@/lib/hooks/useKPICalculations';
import Navbar from '../components/navbar/Navbar';
import DashboardGrid from '../components/dashboard/DashboardGrid';
import { buildDashboardWidgets } from '../components/dashboard/DashboardWidgets';
import type { JejuRegion } from '@/lib/types';
import './globals.css';

export default function Page() {
    const d = useDashboardData();
    const {
        autoRefresh,
        setAutoRefresh,
        load,
        setSelectedJejuRegion,
        loadJejuWeather,
    } = d;
    const [selectedAreaGrpId, setSelectedAreaGrpId] = React.useState<string>('');

    // KPI 계산
    const kpi = useKPICalculations({
        sukubOperation: d.sukubOperation,
        hgGenUtilPct: d.hgGenUtilPct
    });

    // 이벤트 핸들러
    const handleToggleAutoRefresh = useCallback(() => {
        setAutoRefresh(!autoRefresh);
    }, [autoRefresh, setAutoRefresh]);

    const handleManualRefresh = useCallback(() => {
        load();
    }, [load]);

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

    const handleRegionSelect = useCallback(async (region: JejuRegion) => {
        if (!region) return;
        setSelectedJejuRegion(region);
        await loadJejuWeather(region);
    }, [setSelectedJejuRegion, loadJejuWeather]);

    const widgets = useMemo(() => buildDashboardWidgets({
        data: d,
        kpi,
        selectedAreaGrpId,
        areaGrpIds,
        filteredForecastData: filteredData,
        onAreaGrpIdChange: handleAreaGrpIdChange,
        onRegionSelect: handleRegionSelect,
    }), [
        d,
        kpi,
        selectedAreaGrpId,
        areaGrpIds,
        filteredData,
        handleAreaGrpIdChange,
        handleRegionSelect,
    ]);

    return (
        <div className="min-h-screen">
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

                <DashboardGrid widgets={widgets} />
            </div>
        </div>
    );
}

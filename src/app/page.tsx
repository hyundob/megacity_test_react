'use client';

import React, { useMemo, useEffect, useCallback, useRef, useState } from 'react';
import { useDashboardData } from '@/lib/useDashboardData';
import { useKPICalculations } from '@/lib/hooks/useKPICalculations';
import Navbar from '../components/navbar/Navbar';
import DashboardGrid from '../components/dashboard/DashboardGrid';
import { buildDashboardWidgets } from '../components/dashboard/DashboardWidgets';
import {
    PAGE_DEFAULT_WIDGETS,
    PAGE_DEFAULT_LAYOUTS,
    PAGE_LABELS,
    PAGE_STORAGE_KEYS,
    VISIBLE_WIDGETS_STORAGE_KEY,
} from '@/lib/dashboardLayout';
import type { DashboardWidgetId, PageId } from '@/lib/dashboardLayout';
import type { JejuRegion } from '@/lib/types';
import './globals.css';

const PAGES: PageId[] = ['page1', 'page2', 'page3'];

export default function Page() {
    const d = useDashboardData();
    const { autoRefresh, setAutoRefresh, load, setSelectedJejuRegion, loadJejuWeather } = d;
     const [currentPage, setCurrentPage] = useState(0);
    const [pageLabelFlash, setPageLabelFlash] = useState(true);
    const [visibleWidgets, setVisibleWidgets] = useState<Record<PageId, DashboardWidgetId[]>>(PAGE_DEFAULT_WIDGETS);
    const [visibleLoaded, setVisibleLoaded] = useState(false);

    const snapRef = useRef<HTMLDivElement>(null);

    // Load persisted widget visibility
    useEffect(() => {
        try {
            const stored = localStorage.getItem(VISIBLE_WIDGETS_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Record<string, DashboardWidgetId[]>;
                if (PAGES.every(p => Array.isArray(parsed[p]))) {
                    setVisibleWidgets(Object.fromEntries(PAGES.map(p => [p,
                        [...new Set(parsed[p])].filter(id => PAGE_DEFAULT_WIDGETS[p].includes(id)),
                    ])) as Record<PageId, DashboardWidgetId[]>);
                }
            }
        } catch { /* ignore */ }
        setVisibleLoaded(true);
    }, []);

    useEffect(() => {
        if (!visibleLoaded) return;
        try { localStorage.setItem(VISIBLE_WIDGETS_STORAGE_KEY, JSON.stringify(visibleWidgets)); } catch { /* storage unavailable */ }
    }, [visibleWidgets, visibleLoaded]);

    // Scroll-snap page tracker
    const handleScroll = useCallback(() => {
        const el = snapRef.current;
        if (!el || el.clientHeight === 0) return;
        setCurrentPage(Math.round(el.scrollTop / el.clientHeight));
    }, []);

    const scrollToPage = useCallback((index: number) => {
        const el = snapRef.current;
        if (!el) return;
        el.scrollTo({ top: index * el.clientHeight, behavior: 'smooth' });
    }, []);

    // Show the active page's label briefly after it changes, then let it fade
    // out — keeping it up permanently covered chart content behind it.
    useEffect(() => {
        setPageLabelFlash(true);
        const timer = setTimeout(() => setPageLabelFlash(false), 2000);
        return () => clearTimeout(timer);
    }, [currentPage]);

    // KPI
    const kpi = useKPICalculations({ sukubOperation: d.sukubOperation, hgGenUtilPct: null });

    const handleToggleAutoRefresh = useCallback(() => setAutoRefresh(!autoRefresh), [autoRefresh, setAutoRefresh]);
    const handleManualRefresh = useCallback(() => load(), [load]);
    const handleRegionSelect = useCallback(async (region: JejuRegion) => {
        if (!region) return;
        setSelectedJejuRegion(region);
        await loadJejuWeather(region);
    }, [setSelectedJejuRegion, loadJejuWeather]);

    const allWidgets = useMemo(() => buildDashboardWidgets({
        data: d,
        kpi,
        onRegionSelect: handleRegionSelect,
    }), [d, kpi, handleRegionSelect]);

    const widgetMap = useMemo(() => new Map(allWidgets.map(w => [w.id, w])), [allWidgets]);

    const getPageWidgets = useCallback((pageId: PageId) =>
        visibleWidgets[pageId]
            .map(id => widgetMap.get(id))
            .filter((w): w is NonNullable<typeof w> => w != null),
        [visibleWidgets, widgetMap],
    );

    const getAddableWidgets = useCallback((pageId: PageId) =>
        PAGE_DEFAULT_WIDGETS[pageId]
            .filter(id => !visibleWidgets[pageId].includes(id))
            .map(id => widgetMap.get(id))
            .filter((w): w is NonNullable<typeof w> => w != null),
        [visibleWidgets, widgetMap],
    );

    const handleAddWidget = useCallback((pageId: PageId, id: DashboardWidgetId) => {
        setVisibleWidgets(prev => ({ ...prev, [pageId]: [...prev[pageId], id] }));
    }, []);

    const handleRemoveWidget = useCallback((pageId: PageId, id: DashboardWidgetId) => {
        setVisibleWidgets(prev => ({ ...prev, [pageId]: prev[pageId].filter(wid => wid !== id) }));
    }, []);

    return (
        <div className="snap-outer">
            {/* Fixed navbar */}
            <div className="snap-navbar">
                <Navbar
                    lastUpdated={d.lastUpdated}
                    isLoading={d.isLoading}
                    error={d.error}
                    apiStatus={d.apiStatus}
                    dbStatus={d.dbStatus}
                    autoRefresh={d.autoRefresh}
                    onToggleAutoRefresh={handleToggleAutoRefresh}
                    onManualRefresh={handleManualRefresh}
                    alerts={d.alerts}
                />
            </div>

            {/* Right-side page indicators */}
            <nav className="page-indicators" aria-label="페이지 탐색">
                {PAGES.map((pageId, i) => (
                    <button
                        key={pageId}
                        type="button"
                        className={`page-dot ${currentPage === i ? 'page-dot-active' : ''} ${currentPage === i && pageLabelFlash ? 'page-dot-recent' : ''}`}
                        onClick={() => scrollToPage(i)}
                        title={PAGE_LABELS[pageId]}
                        aria-label={PAGE_LABELS[pageId]}
                        aria-current={currentPage === i ? 'page' : undefined}
                    >
                        <span className="page-dot-label">{PAGE_LABELS[pageId]}</span>
                    </button>
                ))}
            </nav>

            {/* Scroll-snap container */}
            <div ref={snapRef} className="snap-scroll" onScroll={handleScroll}>
                {PAGES.map((pageId) => (
                    <div key={pageId} className="snap-page">
                        <div className="snap-page-inner w-full max-w-[2400px] mx-auto px-4 sm:px-6">
                            <DashboardGrid
                                widgets={getPageWidgets(pageId)}
                                storageKey={PAGE_STORAGE_KEYS[pageId]}
                                defaultLayout={PAGE_DEFAULT_LAYOUTS[pageId]}
                                addableWidgets={getAddableWidgets(pageId)}
                                onAddWidget={(id) => handleAddWidget(pageId, id)}
                                onRemoveWidget={(id) => handleRemoveWidget(pageId, id)}
                                pageLabel={PAGE_LABELS[pageId]}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

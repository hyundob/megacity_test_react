'use client';

import React from 'react';
import { Circle, RefreshCw, Pause, Play, Sun, Moon } from 'lucide-react';
import AlertsButton from '../alerts/AlertsButton';
import { AlertItem } from '@/lib/types';
import { useTheme } from '@/components/theme/ThemeProvider';

interface NavbarProps {
    lastUpdated: string | null;
    isLoading?: boolean;
    error?: string | null;
    apiStatus: 'ok' | 'error';
    dbStatus: 'ok' | 'error';
    autoRefresh: boolean;
    onToggleAutoRefresh: () => void;
    onManualRefresh: () => void;
    alerts: AlertItem[];
}

export default function Navbar({
    lastUpdated,
    isLoading = false,
    error,
    apiStatus,
    dbStatus,
    autoRefresh,
    onToggleAutoRefresh,
    onManualRefresh,
    alerts
}: NavbarProps) {
    const { theme, toggle } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="nav-glass relative z-50">
            <div className="max-w-[2400px] mx-auto px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* 왼쪽: 제목 및 업데이트 정보 */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">메가시티 섹터커플링 대시보드</h1>
                            <div className="flex items-center gap-2">
                                <div className={`status-badge ${apiStatus === 'ok' ? 'status-badge-success' : 'status-badge-error'}`}>
                                    <Circle size={6} fill="currentColor" />
                                    <span className="text-xs font-semibold">API</span>
                                </div>
                                <div className={`status-badge ${dbStatus === 'ok' ? 'status-badge-success' : 'status-badge-error'}`}>
                                    <Circle size={6} fill="currentColor" />
                                    <span className="text-xs font-semibold">수급 자료</span>
                                </div>
                                {autoRefresh && apiStatus === 'ok' && <span className="live-dot ml-1" title="5분 주기 자동 조회" />}
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            최근 조회 완료: <span className="text-slate-700 dark:text-slate-300">{lastUpdated || (isLoading ? '조회 중...' : '조회 기록 없음')}</span>
                        </p>
                        {error && <p role="alert" className="mt-1 text-xs text-amber-600 dark:text-amber-400">{error}</p>}
                    </div>

                    {/* 오른쪽: 액션 버튼들 */}
                    <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
                        {/* 자동 새로고침 토글 버튼 */}
                        <button
                            onClick={onToggleAutoRefresh}
                            aria-pressed={autoRefresh}
                            aria-label="자동 새로고침 토글"
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                autoRefresh
                                    ? 'bg-[#049B78]/15 text-[#049B78] dark:text-[#06D6A0] border border-[#049B78]/30 hover:bg-[#049B78]/20'
                                    : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-slate-300'
                            }`}
                            title={autoRefresh ? '자동 새로고침 켜짐 (5분마다) - 클릭하면 끔' : '자동 새로고침 꺼짐 - 클릭하면 켬'}
                        >
                            {autoRefresh ? <Pause size={16} /> : <Play size={16} />}
                            <span className="hidden sm:inline">
                                {autoRefresh ? '자동' : '수동'}
                            </span>
                        </button>

                        {/* 수동 새로고침 버튼 */}
                        <button
                            onClick={onManualRefresh}
                            disabled={isLoading}
                            aria-busy={isLoading}
                            className="flex items-center gap-2 px-3.5 py-2 bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200"
                            title="지금 새로고침"
                        >
                            <RefreshCw size={16} />
                            <span className="hidden sm:inline">새로고침</span>
                        </button>

                        {/* 테마 토글 버튼 */}
                        <button
                            onClick={toggle}
                            aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                            className="flex items-center gap-2 px-3.5 py-2 bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200"
                            title={isDark ? '라이트 모드' : '다크 모드'}
                        >
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                            <span className="hidden sm:inline">{isDark ? '라이트' : '다크'}</span>
                        </button>

                        <AlertsButton alerts={alerts} />
                    </div>
                </div>
            </div>
        </div>
    );
}

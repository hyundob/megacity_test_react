'use client';

import React from 'react';
import { Circle, RefreshCw, Pause, Play } from 'lucide-react';
import AlertsButton from '../alerts/AlertsButton';
import { AlertItem } from '@/lib/types';

interface NavbarProps {
    lastUpdated: string | null;
    apiStatus: 'ok' | 'error';
    dbStatus: 'ok' | 'error';
    autoRefresh: boolean;
    onToggleAutoRefresh: () => void;
    onManualRefresh: () => void;
    alerts: AlertItem[];
}

export default function Navbar({
    lastUpdated,
    apiStatus,
    dbStatus,
    autoRefresh,
    onToggleAutoRefresh,
    onManualRefresh,
    alerts
}: NavbarProps) {
    return (
        <div className="mb-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* 왼쪽: 제목 및 업데이트 정보 */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">DASHBOARD</h1>
                            <div className="flex items-center gap-2">
                                <div className={`status-badge ${apiStatus === 'ok' ? 'status-badge-success' : 'status-badge-error'}`}>
                                    <Circle size={6} fill="currentColor" />
                                    <span className="text-xs font-semibold">API</span>
                                </div>
                                <div className={`status-badge ${dbStatus === 'ok' ? 'status-badge-success' : 'status-badge-error'}`}>
                                    <Circle size={6} fill="currentColor" />
                                    <span className="text-xs font-semibold">DB</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                            마지막 업데이트: <span className="text-gray-700">{lastUpdated || '로딩 중...'}</span>
                        </p>
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
                                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300' 
                                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
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
                            className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                            title="지금 새로고침"
                        >
                            <RefreshCw size={16} />
                            <span className="hidden sm:inline">새로고침</span>
                        </button>
                        
                        <AlertsButton alerts={alerts} />
                    </div>
                </div>
            </div>
        </div>
    );
}


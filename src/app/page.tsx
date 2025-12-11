'use client';

import React from 'react';
import { Circle, RefreshCw, Pause, Play } from 'lucide-react';
import { useDashboardData } from '@/lib/useDashboardData';
/* import AlertsCard from '../components/alerts/AlertsCard'; */
import SystemStatusCard from '../components/system/SystemStatusCard';
import ForecastInfoCard from '../components/cards/ForecastInfoCard';
import SukubInfoCard from '../components/cards/SukubInfoCard';
import SolarPredictChart from '../components/charts/SolarPredictChart';
import DemandPredictChart from '../components/charts/DemandPredictChart';
import DemandReGenChart from '../components/charts/DemandReGenChart';
import CurtChart from '../components/charts/CurtChart';
import HydrogenForecastChart from '../components/charts/HydrogenForecastChart';
import ForecastLast48hChart from '../components/charts/ForecastLast48hChart';
import JejuOperationChart from '../components/charts/JejuOperationChart';
import HydrogenProductionCard from '../components/cards/HydrogenProductionCard';
import AlertsButton from '../components/alerts/AlertsButton';
import WindPredictChart from '../components/charts/WindPredictChart';
import JejuMapCard from '../components/map/JejuMapCard';
import './globals.css';

export default function Page() {
    const d = useDashboardData();
    const [selectedAreaGrpId, setSelectedAreaGrpId] = React.useState<string>('');

    const handleToggleAutoRefresh = () => {
        d.setAutoRefresh(!d.autoRefresh);
    };

    const handleManualRefresh = () => {
        d.load();
    };

    const handleAreaGrpIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAreaGrpId(e.target.value);
    };

    // areaGrpId 목록 추출 (중복 제거)
    const areaGrpIds = React.useMemo(() => {
        const ids = new Set(d.forecastPredictLast48h.map(item => item.areaGrpId).filter(Boolean));
        return Array.from(ids).sort();
    }, [d.forecastPredictLast48h]);

    // 첫 번째 영역을 기본값으로 설정
    React.useEffect(() => {
        if (areaGrpIds.length > 0 && !selectedAreaGrpId) {
            setSelectedAreaGrpId(areaGrpIds[0]);
        }
    }, [areaGrpIds, selectedAreaGrpId]);

    // 선택된 areaGrpId로 필터링
    const filteredData = React.useMemo(() => {
        if (!selectedAreaGrpId) return [];
        return d.forecastPredictLast48h.filter(item => item.areaGrpId === selectedAreaGrpId);
    }, [d.forecastPredictLast48h, selectedAreaGrpId]);


    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            {/* 상단 헤더 */}
            <div className="mb-6">
                <div className="card p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">메가시티 대시보드</h1>
                            <p className="text-sm text-gray-500">마지막 업데이트: {d.lastUpdated || '로딩 중...'}</p>
                        </div>
                        <div className="flex gap-3 items-center flex-shrink-0">
                            <div className={`status-badge ${d.apiStatus === 'ok' ? 'status-badge-success' : 'status-badge-error'}`}>
                                <Circle size={8} fill="currentColor" />
                                <span>API</span>
                            </div>
                            <div className={`status-badge ${d.dbStatus === 'ok' ? 'status-badge-success' : 'status-badge-error'}`}>
                                <Circle size={8} fill="currentColor" />
                                <span>DB</span>
                            </div>
                            
                            {/* 자동 새로고침 토글 버튼 */}
                            <button
                                onClick={handleToggleAutoRefresh}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    d.autoRefresh 
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={d.autoRefresh ? '자동 새로고침 켜짐 (5분마다)' : '자동 새로고침 꺼짐'}
                            >
                                {d.autoRefresh ? <Play size={16} /> : <Pause size={16} />}
                                <span className="hidden sm:inline">
                                    {d.autoRefresh ? '자동' : '수동'}
                                </span>
                            </button>
                            
                            {/* 수동 새로고침 버튼 */}
                            <button
                                onClick={handleManualRefresh}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                                title="지금 새로고침"
                            >
                                <RefreshCw size={16} />
                                <span className="hidden sm:inline">새로고침</span>
                            </button>
                            
                            <AlertsButton alerts={d.alerts} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 메인 콘텐츠 그리드 */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6">
                {/* <AlertsCard alerts={d.alerts} /> */}

                <SystemStatusCard
                    latApi={d.latApi}
                    latDb={d.latDb}
                    latPredict={d.latPredict}
                    healthApi={d.healthApi}
                    healthDb={d.healthDb}
                    healthPredict={d.healthPredict}
                />

                {d.forecastPredict ? (
                    <ForecastInfoCard data={d.forecastPredict} />
                ) : (
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">기상 예보 정보</h2>
                        <p className="text-sm text-gray-500">데이터 로딩 중...</p>
                    </div>
                )}

                {d.sukubOperation ? (
                    <SukubInfoCard data={d.sukubOperation} dailyData={d.sukubOperationToday} />
                ) : (
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">제주 수급 운영 정보</h2>
                        <p className="text-sm text-gray-500">데이터 로딩 중...</p>
                    </div>
                )}

                {d.sukubOperationToday.length > 0 ? (
                    <JejuOperationChart data={d.sukubOperationToday} />
                ) : (
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">제주 운영 현황</h2>
                        <p className="text-sm text-gray-500">데이터 로딩 중...</p>
                    </div>
                )}

                {/* 제주도 지도 및 지역 선택 + 실시간 기상 현황 */}
                <JejuMapCard 
                    selectedRegion={d.selectedJejuRegion}
                    onRegionSelect={async (region) => {
                        d.setSelectedJejuRegion(region);
                        await d.loadJejuWeather(region);
                    }}
                    tempC={d.ncstTempC} 
                    windMs={d.ncstWindMs} 
                    windDir={d.ncstWindDir} 
                    pty={d.ncstPty} 
                    ptyText={d.ncstPtyText} 
                    sky={d.ncstSky} 
                />

                {d.reGenPredictData.length > 0 ? (
                    <SolarPredictChart data={d.reGenPredictData} />
                ) : (
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">태양광 발전 예측</h2>
                        <p className="text-sm text-gray-500">데이터 로딩 중...</p>
                    </div>
                )}

                {d.demandPredict.length > 0 ? (
                    <DemandPredictChart data={d.demandPredict} />
                ) : (
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">전력 수요 예측</h2>
                        <p className="text-sm text-gray-500">데이터 로딩 중...</p>
                    </div>
                )}
                
                {d.windPredictData.length > 0 ? (
                    <WindPredictChart data={d.windPredictData} />
                ) : (
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">풍력 발전 예측</h2>
                        <p className="text-sm text-gray-500">데이터 로딩 중...</p>
                    </div>
                )}

                {d.demandPredict.length > 0 && (d.reGenPredictData.length > 0 || d.windPredictData.length > 0) ? (
                    <DemandReGenChart 
                        demandData={d.demandPredict} 
                        reGenData={d.reGenPredictData}
                        windData={d.windPredictData}
                    />
                ) : (
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">수요 vs 재생에너지</h2>
                        <p className="text-sm text-gray-500">데이터 로딩 중...</p>
                    </div>
                )}

                {/* <EssStrategyCard
                    series={d.essSeries}
                    currentSoc={d.currentSoc}
                    bestChrgTimes={d.bestChrgTimes}
                    bestDiscTimes={d.bestDiscTimes}
                /> */}

                {d.jejuCurtPredictToday.length > 0 ? (
                    <CurtChart data={d.jejuCurtPredictToday} />
                ) : (
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">제주 출력제어 예측</h2>
                        <p className="text-sm text-gray-500">데이터 로딩 중...</p>
                    </div>
                )}

                {d.hgGenPredictToday.length > 0 ? (
                    <HydrogenForecastChart data={d.hgGenPredictToday} />
                ) : (
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">수소 생산 예측</h2>
                        <p className="text-sm text-gray-500">데이터 로딩 중...</p>
                    </div>
                )}
                
                {d.hgGenLastItem ? (
                    <HydrogenProductionCard
                        lastItem={d.hgGenLastItem}
                        utilPct={d.hgGenUtilPct}
                        latency={d.hgGenLatency}
                        totalItems={d.hgGenInfoToday.length}
                    />
                ) : (
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">수소 생산 현황</h2>
                        <p className="text-sm text-gray-500">데이터 로딩 중...</p>
                    </div>
                )}

                
                {d.forecastPredictLast48h.length > 0 ? (
                    <div className="col-span-2">
                        <ForecastLast48hChart 
                            data={filteredData} 
                            areaGrpId={selectedAreaGrpId}
                            areaGrpIds={areaGrpIds}
                            selectedAreaGrpId={selectedAreaGrpId}
                            onAreaGrpIdChange={handleAreaGrpIdChange}
                        />
                    </div>
                ) : (
                    <div className="col-span-2">
                        <div className="card p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-2">최근 48시간 기상예보</h2>
                            <p className="text-sm text-gray-500">데이터 로딩 중...</p>
                        </div>
                    </div>
                )}


                
            </div>

            {!d.forecastPredict && !d.sukubOperation && (
                <p className="text-gray-500 mt-4">데이터 로딩 중...</p>
            )}


        </div>
    );
}
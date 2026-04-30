'use client';

import React, { useEffect, useRef } from 'react';
import { MapPin, Thermometer, Wind, Compass, CloudRain, Cloud } from 'lucide-react';
import { JejuRegion, JEJU_REGIONS } from '@/lib/types';
import { formatWindDirection, formatSkyCondition } from '@/lib/utils';
import type { MapInstance, MarkerInstance, MarkerOptions, CustomOverlayInstance } from '@/lib/types/kakao';
import { CONFIG } from '@/lib/config';

const TRANSPARENT_MARKER_SRC = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

function createMarkerContent(regionName: string, isSelected: boolean) {
    const background = isSelected
        ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
        : 'rgba(15, 23, 42, 0.88)';
    const dotColor = isSelected ? '#bfdbfe' : '#38bdf8';
    const shadow = isSelected
        ? '0 10px 24px rgba(37, 99, 235, 0.35)'
        : '0 6px 16px rgba(15, 23, 42, 0.25)';
    const padding = isSelected ? '8px 12px' : '6px 10px';
    const fontSize = isSelected ? '13px' : '12px';
    const dotSize = isSelected ? '9px' : '7px';

    return `
        <div
            data-jeju-region="${regionName}"
            style="
                position: relative;
                transform: translateY(-8px);
                cursor: pointer;
                pointer-events: auto;
                user-select: none;
            "
        >
            <div style="
                display: flex;
                align-items: center;
                gap: 6px;
                padding: ${padding};
                background: ${background};
                color: white;
                border-radius: 999px;
                font-size: ${fontSize};
                font-weight: 700;
                line-height: 1;
                white-space: nowrap;
                box-shadow: ${shadow};
                border: 1px solid rgba(255,255,255,0.35);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
            ">
                <span style="
                    width: ${dotSize};
                    height: ${dotSize};
                    border-radius: 999px;
                    background: ${dotColor};
                    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.18);
                    display: inline-block;
                    flex-shrink: 0;
                "></span>
                <span>${regionName}</span>
            </div>
            <div style="
                position: absolute;
                left: 50%;
                bottom: -6px;
                transform: translateX(-50%) rotate(45deg);
                width: 12px;
                height: 12px;
                background: ${isSelected ? '#4f46e5' : 'rgba(15, 23, 42, 0.88)'};
                border-right: 1px solid rgba(255,255,255,0.25);
                border-bottom: 1px solid rgba(255,255,255,0.25);
            "></div>
        </div>
    `;
}

interface JejuMapCardProps {
    selectedRegion: JejuRegion | null;
    onRegionSelect: (region: JejuRegion) => void;
    tempC: number | null;
    windMs: number | null;
    windDir: number | null;
    pty: number | null;
    ptyText?: string | null;
    sky?: number | null;
}

export function JejuMapCard({
                                selectedRegion,
                                onRegionSelect,
                                tempC,
                                windMs,
                                windDir,
                                pty,
                                ptyText,
                                sky
                            }: JejuMapCardProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapInstance | null>(null);
    const onRegionSelectRef = useRef(onRegionSelect);
    const initialSelectedRegionName = useRef(selectedRegion?.name);
    const markersRef = useRef<Array<{
        marker: MarkerInstance;
        overlay: CustomOverlayInstance;
        region: JejuRegion
    }>>([]);
    const [isMapLoaded, setIsMapLoaded] = React.useState(false);

    useEffect(() => {
        onRegionSelectRef.current = onRegionSelect;
    }, [onRegionSelect]);

    useEffect(() => {
        if (!mapContainer.current) return;

        let retryCount = 0;
        const maxRetries = CONFIG.MAP.MAX_RETRIES;

        const initMap = () => {
            if (retryCount > maxRetries) {
                console.error('카카오맵 SDK 로드 실패: 타임아웃');
                return;
            }

            if (!window.kakao || !window.kakao.maps) {
                retryCount++;
                setTimeout(initMap, CONFIG.MAP.RETRY_INTERVAL_MS);
                return;
            }

            window.kakao.maps.load(() => {
                const container = mapContainer.current;
                if (!container) {
                    console.error('지도 컨테이너를 찾을 수 없습니다');
                    return;
                }

                try {
                    const centerLat = (33.4996 + 33.2394 + 33.3800 + 33.2936) / 4;
                    const centerLng = (126.5312 + 126.5653 + 126.8800 + 126.1617) / 4;

                    const options = {
                        center: new window.kakao.maps.LatLng(centerLat, centerLng),
                        level: CONFIG.MAP.DEFAULT_LEVEL,
                    };

                    const map = new window.kakao.maps.Map(container, options);
                    mapRef.current = map;
                    const transparentMarkerImage = new window.kakao.maps.MarkerImage(
                        TRANSPARENT_MARKER_SRC,
                        new window.kakao.maps.Size(1, 1),
                        {offset: new window.kakao.maps.Point(0, 0)}
                    );

                    markersRef.current = JEJU_REGIONS.map((region) => {
                        const position = new window.kakao.maps.LatLng(region.lat, region.lng);
                        const isSelected = initialSelectedRegionName.current === region.name;

                        const markerOptions: MarkerOptions = {
                            position: position,
                            map: map,
                            clickable: true,
                            image: transparentMarkerImage,
                        };

                        const marker = new window.kakao.maps.Marker(markerOptions);

                        if (!marker) {
                            console.error(`마커 생성 실패: ${region.name}`);
                        } else {
                            const markerMap = marker.getMap();
                            if (!markerMap) {
                                console.warn(`마커가 지도에 없음: ${region.name}, 다시 추가`);
                                marker.setMap(map);
                            }
                        }

                        const overlay = new window.kakao.maps.CustomOverlay({
                            position: position,
                            content: createMarkerContent(region.name, isSelected),
                            yAnchor: 1.45,
                            zIndex: isSelected ? 20 : 10,
                        });
                        overlay.setMap(map);

                        window.kakao.maps.event.addListener(marker, 'click', () => {
                            onRegionSelectRef.current(region);
                        });

                        return {marker, overlay, region};
                    });

                    setTimeout(() => {
                        markersRef.current.forEach(({region}) => {
                            const overlayElement = document.querySelector<HTMLElement>(`[data-jeju-region="${region.name}"]`);
                            overlayElement?.addEventListener('click', () => onRegionSelectRef.current(region));
                        });
                    }, 0);

                    setIsMapLoaded(true);
                } catch (error) {
                    console.error('카카오맵 초기화 오류:', error);
                }
            });
        };

        initMap();
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !window.kakao || !isMapLoaded) return;
        if (markersRef.current.length === 0) return;

        markersRef.current.forEach(({marker, overlay, region}) => {
            if (!marker || !overlay) return;
            const isSelected = selectedRegion?.name === region.name;

            try {
                if (!marker.getMap()) {
                    console.warn(`마커가 지도에 없음: ${region.name}`);
                    marker.setMap(map);
                }

                overlay.setContent(createMarkerContent(region.name, isSelected));

                setTimeout(() => {
                    const overlayElement = document.querySelector<HTMLElement>(`[data-jeju-region="${region.name}"]`);
                    overlayElement?.addEventListener('click', () => onRegionSelectRef.current(region));
                }, 0);

                if (isSelected) {
                    const position = new window.kakao.maps.LatLng(region.lat, region.lng);
                    map.setCenter(position);
                }
            } catch (error) {
                console.error('마커 업데이트 오류:', error);
            }
        });
    }, [selectedRegion, isMapLoaded]);

    return (
        <div className="space-y-3">
            {/* 지도 섹션 */}
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400"/>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">제주도 지역 선택 및 기상 현황</h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400">지도에서 지역을 클릭하여 선택하세요</p>
                    </div>
                </div>

                <div
                    ref={mapContainer}
                    className="w-full h-52 rounded-lg border border-black/10 dark:border-white/10 overflow-hidden relative bg-slate-100 dark:bg-slate-900"
                >
                    {!isMapLoaded && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 z-10">
                            <div className="text-center">
                                <div
                                    className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">지도를 불러오는 중...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 기상 현황 섹션 */}
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400"/>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedRegion?.name || '제주시'} 실황
                            (기상청)</h3>
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                    <div
                        className="bg-red-500/10 rounded-lg p-2 border border-red-500/20 flex flex-col items-center justify-center text-center min-h-[72px]">
                        <div className="w-8 h-8 bg-red-500/15 rounded-lg flex items-center justify-center mb-1.5">
                            <Thermometer className="w-4 h-4 text-red-600 dark:text-red-400"/>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-0.5">기온</div>
                        <div className="text-sm font-bold text-red-700 dark:text-red-300">{tempC ?? '--'}°C</div>
                    </div>

                    <div
                        className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20 flex flex-col items-center justify-center text-center min-h-[72px]">
                        <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center mb-1.5">
                            <Wind className="w-4 h-4 text-emerald-600 dark:text-emerald-400"/>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-0.5">풍속</div>
                        <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{windMs ?? '--'} m/s
                        </div>
                    </div>

                    <div
                        className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20 flex flex-col items-center justify-center text-center min-h-[72px]">
                        <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center mb-1.5">
                            <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400"/>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-0.5">풍향</div>
                        <div
                            className="text-sm font-bold text-blue-700 dark:text-blue-300 flex flex-col items-center gap-0.5">
                            <span className="text-base">{formatWindDirection(windDir).arrow}</span>
                            <span className="text-xs">{formatWindDirection(windDir).text}</span>
                        </div>
                    </div>

                    <div
                        className="bg-violet-500/10 rounded-lg p-2 border border-violet-500/20 flex flex-col items-center justify-center text-center min-h-[72px]">
                        <div className="w-8 h-8 bg-violet-500/15 rounded-lg flex items-center justify-center mb-1.5">
                            <CloudRain className="w-4 h-4 text-violet-600 dark:text-violet-400"/>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-0.5">강수형태</div>
                        <div
                            className="text-xs font-bold text-violet-700 dark:text-violet-300">{ptyText ?? (pty !== null && pty !== undefined ? String(pty) : '없음')}</div>
                    </div>

                    <div
                        className="bg-black/5 dark:bg-white/5 rounded-lg p-2 border border-black/10 dark:border-white/10 flex flex-col items-center justify-center text-center min-h-[72px]">
                        <div
                            className="w-8 h-8 bg-black/8 dark:bg-white/10 rounded-lg flex items-center justify-center mb-1.5">
                            <Cloud className="w-4 h-4 text-slate-500 dark:text-slate-400"/>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-0.5">하늘상태</div>
                        <div
                            className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatSkyCondition(sky)}</div>
                    </div>
                </div>

                {!tempC && !windMs && !windDir && !pty && (
                    <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
                        <div className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">지도를 클릭하여 지역을 선택하면 기상
                            정보가 표시됩니다.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

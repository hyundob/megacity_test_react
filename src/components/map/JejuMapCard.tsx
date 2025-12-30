'use client';

import React, { useEffect, useRef } from 'react';
import { MapPin, Thermometer, Wind, Compass, CloudRain, Cloud } from 'lucide-react';
import { JejuRegion, JEJU_REGIONS } from '@/lib/types';
import { formatWindDirection, formatSkyCondition } from '@/lib/utils';

declare global {
    interface Window {
        kakao: any;
    }
}

interface JejuMapCardProps {
    selectedRegion: JejuRegion | null;
    onRegionSelect: (region: JejuRegion) => void;
    // 기상 현황 데이터
    tempC: number | null;
    windMs: number | null;
    windDir: number | null;
    pty: number | null;
    ptyText?: string | null;
    sky?: number | null;
}

export default function JejuMapCard({ 
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
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [isMapLoaded, setIsMapLoaded] = React.useState(false);

    useEffect(() => {
        if (!mapContainer.current) return;

        let retryCount = 0;
        const maxRetries = 50; // 최대 5초 대기

        // 카카오맵 스크립트 로드 대기
        const initMap = () => {
            if (retryCount > maxRetries) {
                console.error('카카오맵 SDK 로드 실패: 타임아웃');
                return;
            }

            if (!window.kakao || !window.kakao.maps) {
                retryCount++;
                setTimeout(initMap, 100);
                return;
            }

            // 카카오맵 초기화
            window.kakao.maps.load(() => {
                const container = mapContainer.current;
                if (!container) {
                    console.error('지도 컨테이너를 찾을 수 없습니다');
                    return;
                }

                try {
                    // 모든 마커가 보이도록 중심 계산 (제주시, 서귀포, 성산, 고산의 중간점)
                    const centerLat = (33.4996 + 33.2394 + 33.3800 + 33.2936) / 4; // 약 33.353
                    const centerLng = (126.5312 + 126.5653 + 126.8800 + 126.1617) / 4; // 약 126.535
                    
                    const options = {
                        center: new window.kakao.maps.LatLng(centerLat, centerLng), // 제주도 전체 중심
                        level: 11, // 확대 레벨 (높을수록 넓게 보임, 낮을수록 확대)
                    };

                    const map = new window.kakao.maps.Map(container, options);
                    mapRef.current = map;

                    // 마커 생성 및 이벤트 등록
                    markersRef.current = JEJU_REGIONS.map((region) => {
                        const position = new window.kakao.maps.LatLng(region.lat, region.lng);
                        
                        // 선택 여부 확인
                        const isSelected = selectedRegion?.name === region.name;
                        
                        // 마커 생성 옵션
                        const markerOptions: any = {
                            position: position,
                            map: map,
                            clickable: true,
                        };
                        
                        // 선택된 마커만 빨간색 이미지 사용, 나머지는 기본 마커
                        if (isSelected) {
                            try {
                                // 선택된 마커: 빨간색 이미지
                                const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
                                const imageSize = new window.kakao.maps.Size(24, 35);
                                const imageOption = { offset: new window.kakao.maps.Point(12, 35) };
                                const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
                                markerOptions.image = markerImage;
                            } catch (error) {
                                console.warn(`빨간색 마커 이미지 생성 실패 (${region.name}), 기본 마커 사용:`, error);
                            }
                        }
                        // 선택되지 않은 마커는 기본 마커 사용 (이미지 설정 안 함)
                        
                        // 마커 생성
                        const marker = new window.kakao.maps.Marker(markerOptions);
                        
                        // 마커가 제대로 생성되었는지 확인
                        if (!marker) {
                            console.error(`마커 생성 실패: ${region.name}`);
                        } else {
                            // 마커가 지도에 표시되는지 확인
                            const markerMap = marker.getMap();
                            if (!markerMap) {
                                console.warn(`마커가 지도에 없음: ${region.name}, 다시 추가`);
                                marker.setMap(map);
                            }
                            
                            console.log(`마커 생성 성공: ${region.name} (선택: ${isSelected}, 이미지: ${isSelected ? '빨간색' : '기본'}, 지도: ${marker.getMap() ? '있음' : '없음'})`);
                        }

                        // 커스텀 오버레이 (지역명 표시)
                        const overlay = new window.kakao.maps.CustomOverlay({
                            position: position,
                            content: `
                                <div style="
                                    padding: 4px 8px;
                                    background: ${isSelected ? '#ef4444' : '#3b82f6'};
                                    color: white;
                                    border-radius: 12px;
                                    font-size: 12px;
                                    font-weight: 600;
                                    white-space: nowrap;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                    pointer-events: none;
                                ">
                                    ${region.name}
                                </div>
                            `,
                            yAnchor: 2.5,
                        });
                        overlay.setMap(map);

                        // 마커 클릭 이벤트
                        window.kakao.maps.event.addListener(marker, 'click', () => {
                            onRegionSelect(region);
                        });

                        return { marker, overlay, region };
                    });

                    console.log('카카오맵 초기화 완료, 마커 개수:', markersRef.current.length);
                    markersRef.current.forEach(({ region }) => {
                        console.log(`마커 생성됨: ${region.name} (${region.lat}, ${region.lng})`);
                    });
                    setIsMapLoaded(true);
                } catch (error) {
                    console.error('카카오맵 초기화 오류:', error);
                }
            });
        };

        initMap();
    }, []);

    // 선택된 지역 변경 시 마커 업데이트
    useEffect(() => {
        if (!mapRef.current || !window.kakao || !isMapLoaded) return;
        if (markersRef.current.length === 0) return;

        markersRef.current.forEach(({ marker, overlay, region }) => {
            if (!marker || !overlay) return;
            
            const isSelected = selectedRegion?.name === region.name;
            
            try {
                // 선택된 마커만 빨간색 이미지 사용, 나머지는 기본 마커
                if (isSelected) {
                    // 선택된 마커: 빨간색 이미지 설정
                    try {
                        const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
                        const imageSize = new window.kakao.maps.Size(24, 35);
                        const imageOption = { offset: new window.kakao.maps.Point(12, 35) };
                        const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
                        marker.setImage(markerImage);
                    } catch (error) {
                        console.warn(`빨간색 마커 이미지 설정 실패 (${region.name}):`, error);
                    }
                } else {
                    // 선택되지 않은 마커: 기본 마커 사용 (이미지 제거)
                    marker.setImage(null);
                }
                
                // 마커가 지도에 표시되는지 확인
                if (!marker.getMap()) {
                    console.warn(`마커가 지도에 없음: ${region.name}`);
                    marker.setMap(mapRef.current);
                }

                // 오버레이 업데이트
                overlay.setContent(`
                    <div style="
                        padding: 4px 8px;
                        background: ${isSelected ? '#ef4444' : '#3b82f6'};
                        color: white;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                        white-space: nowrap;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        pointer-events: none;
                    ">
                        ${region.name}
                    </div>
                `);

                // 선택된 지역으로 지도 중심 이동
                if (isSelected) {
                    const position = new window.kakao.maps.LatLng(region.lat, region.lng);
                    mapRef.current.setCenter(position);
                }
            } catch (error) {
                console.error('마커 업데이트 오류:', error);
            }
        });
    }, [selectedRegion, isMapLoaded]);

    return (
        <div className="space-y-4">
            {/* 지도 섹션 - 회색 배경 카드 */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-800">제주도 지역 선택 및 기상 현황</h2>
                        <p className="text-xs text-gray-500">지도에서 지역을 클릭하여 선택하세요</p>
                    </div>
                </div>
                
                {/* 카카오맵 컨테이너 */}
                <div 
                    ref={mapContainer}
                    className="w-full h-64 rounded-lg border border-gray-300 overflow-hidden bg-white relative"
                >
                    {!isMapLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 기상 현황 섹션 */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Cloud className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-800">{selectedRegion?.name || '제주시'} 실황 (기상청)</h3>
                    </div>
                </div>
                
                {/* 기상 정보 카드들 - 5개 정사각형 그리드 */}
                <div className="grid grid-cols-5 gap-3">
                    {/* 기온 */}
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex flex-col items-center justify-center text-center min-h-[100px]">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                            <Thermometer className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-xs text-gray-600 font-medium mb-1">기온</div>
                        <div className="text-lg font-bold text-red-700">{tempC ?? '--'}°C</div>
                    </div>
                    
                    {/* 풍속 */}
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex flex-col items-center justify-center text-center min-h-[100px]">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                            <Wind className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-xs text-gray-600 font-medium mb-1">풍속</div>
                        <div className="text-lg font-bold text-green-700">{windMs ?? '--'} m/s</div>
                    </div>
                    
                    {/* 풍향 */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col items-center justify-center text-center min-h-[100px]">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                            <Compass className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-xs text-gray-600 font-medium mb-1">풍향</div>
                        <div className="text-base font-bold text-blue-700 flex flex-col items-center gap-0.5">
                            <span className="text-xl">{formatWindDirection(windDir).arrow}</span>
                            <span className="text-xs">{formatWindDirection(windDir).text}</span>
                        </div>
                    </div>
                    
                    {/* 강수형태 */}
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex flex-col items-center justify-center text-center min-h-[100px]">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                            <CloudRain className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-xs text-gray-600 font-medium mb-1">강수형태</div>
                        <div className="text-sm font-bold text-purple-700">{ptyText ?? (pty !== null && pty !== undefined ? String(pty) : '없음')}</div>
                    </div>
                    
                    {/* 하늘상태 */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col items-center justify-center text-center min-h-[100px]">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                            <Cloud className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="text-xs text-gray-600 font-medium mb-1">하늘상태</div>
                        <div className="text-sm font-bold text-gray-700">{formatSkyCondition(sky)}</div>
                    </div>
                </div>
                
                {!tempC && !windMs && !windDir && !pty && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                        <div className="text-xs text-yellow-700 font-medium">지도를 클릭하여 지역을 선택하면 기상 정보가 표시됩니다.</div>
                    </div>
                )}
            </div>
        </div>
    );
}


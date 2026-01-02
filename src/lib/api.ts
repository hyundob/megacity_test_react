export async function fetchWithTiming(url: string) {
    const t0 = performance.now();
    const res = await fetch(url);
    const t1 = performance.now();
    return { res, ms: t1 - t0 };
}

import { CONFIG } from './config';

const BASE_URL = CONFIG.API_BASE_URL;

export const ENDPOINTS = {
    // 기상 예보 (forecast-predict)
    forecastPredictLatest: `${BASE_URL}/forecast-predict/latest`,
    forecastPredictLast48h: `${BASE_URL}/forecast-predict/last-48h`,
    
    // 수급 운영 (sukub-operation)
    sukubOperationLatest: `${BASE_URL}/sukub-operation/latest`,
    sukubOperationLast24h: `${BASE_URL}/sukub-operation/last-24h`,
    // sukubOperationToday: `${BASE_URL}/sukub-operation/today`, // 미사용
    
    // 재생에너지 발전 예측 (re-gen-predict) - 최신 CRTN_TM 기준
    reGenPredictLatestCrtn: `${BASE_URL}/re-gen-predict/latest-crtn`, // 태양광
    windPredictLatestCrtn: `${BASE_URL}/re-gen-predict/wind/latest-crtn`, // 풍력
    // reGenPredictToday: `${BASE_URL}/re-gen-predict/today`, // 미사용
    
    // 전력 수요 예측 (demand-predict) - 최신 CRTN_TM 기준
    demandPredictLatestCrtn: `${BASE_URL}/demand-predict/latest-crtn`,
    // demandPredictToday: `${BASE_URL}/demand-predict/today`, // 미사용
    
    // 제주 출력제어 예측 (jeju-curt-predict) - 최신 CRTN_TM 기준
    jejuCurtPredictLatestCrtn: `${BASE_URL}/jeju-curt-predict/latest-crtn`,
    // jejuCurtPredictToday: `${BASE_URL}/jeju-curt-predict/today`, // 미사용
    
    // 수소 생산 예측 (hg-gen-predict)
    hgGenPredictToday: `${BASE_URL}/hg-gen-predict/today`,
    
    // 수소 생산 정보 (hg-gen-info)
    hgGenInfoToday: `${BASE_URL}/hg-gen-info/today`,
    
    // 제주 날씨 (jeju-weather)
    jejuWeatherCurrent: `${BASE_URL}/jeju-weather/current`,
    jejuWeatherRegion: (nx: number, ny: number) => 
        `${BASE_URL}/jeju-weather/region?nx=${nx}&ny=${ny}`,
} as const;

export const getJejuWeatherRegionUrl = (nx: number, ny: number) => 
    `${BASE_URL}/jeju-weather/region?nx=${nx}&ny=${ny}`;

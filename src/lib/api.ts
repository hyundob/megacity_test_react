export async function fetchWithTiming(url: string) {
    const t0 = performance.now();
    const res = await fetch(url);
    const t1 = performance.now();
    return { res, ms: t1 - t0 };
}

export const ENDPOINTS = {
    forecastPredict: 'http://210.222.202.14:18080/api/forecast-predict/latest',
    forecastPredictLast48h: 'http://210.222.202.14:18080/api/forecast-predict/last-48h',
    sukubOperationLatest: 'http://210.222.202.14:18080/api/sukub-operation/latest',
    reGenPredictChart: 'http://210.222.202.14:18080/api/re-gen-predict/today',
    demandPredictToday: 'http://210.222.202.14:18080/api/demand-predict/today',
    sukubOperationToday: 'http://210.222.202.14:18080/api/sukub-operation/today',
    jejuCurtPredictToday: 'http://210.222.202.14:18080/api/jeju-curt-predict/today',
    hgGenPredictToday: 'http://210.222.202.14:18080/api/hg-gen-predict/today',
    hgGenInfoToday: 'http://210.222.202.14:18080/api/hg-gen-info/today',
    jejuWeatherLatest: 'http://210.222.202.14:18080/api/jeju-weather/latest',
};

// KMA (기상청) 단기예보: Jeju-si grid (nx=52, ny=38) for example
export const KMA = {
    // The user provided a percent-encoded key; we accept raw string input
    baseUrl: 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0',
    nx: 52,
    ny: 38,
};

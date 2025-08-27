export async function fetchWithTiming(url: string) {
    const t0 = performance.now();
    const res = await fetch(url);
    const t1 = performance.now();
    return { res, ms: t1 - t0 };
}

export const ENDPOINTS = {
    forecast: 'http://210.222.202.14:18080/api/forecast/latest',
    operationLatest: 'http://210.222.202.14:18080/api/operation/latest',
    solarChart: 'http://210.222.202.14:18080/api/fcst-gen/chart',
    demandToday: 'http://210.222.202.14:18080/api/lfd/demand-today',
    operationToday: 'http://210.222.202.14:18080/api/operation/today',
    curtToday: 'http://210.222.202.14:18080/api/curt/today',
    genToday: 'http://210.222.202.14:18080/api/gen/today',
    gemToday: 'http://210.222.202.14:18080/api/gem/today',
};

import { EssPoint, ReGenPredict, ServiceHealth } from './types';
import { KMA } from './api';

export const formatTime = (raw: string) =>
    `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)} ${raw.slice(8, 10)}:${raw.slice(10, 12)}`;

export const formatSoc = (v: number | null | undefined) =>
    typeof v === 'number' && !Number.isNaN(v) ? `${v}%` : '--%';

export function buildEssSeriesFromData(arr: ReGenPredict[]): EssPoint[] {
    if (!arr.length) return [];
    const sorted = [...arr].sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));
    return sorted.map(p => {
        const capa = p.essCapa ?? 0;
        const ch = p.essChrg ?? 0;
        const soc = capa > 0 ? Math.round((ch / capa) * 100) : undefined; // 즉시식
        return { hour: p.fcstTm.slice(8, 10) + ':00', essChrg: ch, essDisc: p.essDisc ?? 0, essCapa: capa, soc };
    });
}

// Build KMA short-term forecast (ultra) latest fetch URL for T1H (temp), WSD (wind)
export function buildKmaLatestUrl(apiKey: string) {
    const now = new Date();
    // KMA requires base_time at HH30 or HH00; use the latest past half-hour block
    const m = now.getMinutes();
    if (m < 30) now.setMinutes(0, 0, 0); else now.setMinutes(30, 0, 0);
    const y = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const base_date = `${y}${mm}${dd}`;
    const base_time = `${HH}${now.getMinutes().toString().padStart(2,'0')}`;
    const params = new URLSearchParams({
        serviceKey: apiKey,
        dataType: 'JSON',
        numOfRows: '200',
        pageNo: '1',
        base_date,
        base_time,
        nx: String(KMA.nx),
        ny: String(KMA.ny),
    });
    // Ultra Short-term Nowcast
    return `${KMA.baseUrl}/getUltraSrtNcst?${params.toString()}`;
}

export function topHours(arr: EssPoint[], key: 'essChrg' | 'essDisc', k = 3): string[] {
    return [...arr].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0)).slice(0, k).map(p => p.hour);
}

export const msToHealth = (ok: boolean, ms: number): ServiceHealth => {
    if (!ok) return 'down';
    if (ms <= 200) return 'ok';
    if (ms <= 800) return 'slow';
    return 'down';
};
export const healthText = (h: ServiceHealth) => (h === 'ok' ? '정상' : h === 'slow' ? '지연' : '장애');
export const healthDot = (h: ServiceHealth) =>
    h === 'ok' ? 'bg-green-500' : h === 'slow' ? 'bg-yellow-500' : 'bg-red-500';

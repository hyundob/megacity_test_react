import { EssPoint, PredictSolar, ServiceHealth } from './types';

export const formatTime = (raw: string) =>
    `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)} ${raw.slice(8, 10)}:${raw.slice(10, 12)}`;

export const formatSoc = (v: number | null | undefined) =>
    typeof v === 'number' && !Number.isNaN(v) ? `${v}%` : '--%';

export function buildEssSeriesFromData(arr: PredictSolar[]): EssPoint[] {
    if (!arr.length) return [];
    const sorted = [...arr].sort((a, b) => a.fcstTm.localeCompare(b.fcstTm));
    return sorted.map(p => {
        const capa = p.essCapa ?? 0;
        const ch = p.essChrg ?? 0;
        const soc = capa > 0 ? Math.round((ch / capa) * 100) : undefined; // 즉시식
        return { hour: p.fcstTm.slice(8, 10) + ':00', essChrg: ch, essDisc: p.essDisc ?? 0, essCapa: capa, soc };
    });
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

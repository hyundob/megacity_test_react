import { EssPoint, ReGenPredict, ServiceHealth } from './types';

export const formatTime = (raw: string) =>
    `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)} ${raw.slice(8, 10)}:${raw.slice(10, 12)}`;

export const formatSoc = (v: number | null | undefined) =>
    typeof v === 'number' && !Number.isNaN(v) ? `${v}%` : '--%';

// Convert wind direction degrees to compass direction and arrow
export function formatWindDirection(degrees: number | null | undefined): { text: string; arrow: string } {
    if (typeof degrees !== 'number' || Number.isNaN(degrees)) {
        return { text: '--', arrow: '--' };
    }
    
    // Normalize to 0-360 range
    const normalized = ((degrees % 360) + 360) % 360;
    
    // 16-point compass directions
    const directions = [
        { name: '북', arrow: '↑', min: 348.75, max: 11.25 },
        { name: '북북동', arrow: '↗', min: 11.25, max: 33.75 },
        { name: '북동', arrow: '↗', min: 33.75, max: 56.25 },
        { name: '동북동', arrow: '↗', min: 56.25, max: 78.75 },
        { name: '동', arrow: '→', min: 78.75, max: 101.25 },
        { name: '동남동', arrow: '↘', min: 101.25, max: 123.75 },
        { name: '남동', arrow: '↘', min: 123.75, max: 146.25 },
        { name: '남남동', arrow: '↘', min: 146.25, max: 168.75 },
        { name: '남', arrow: '↓', min: 168.75, max: 191.25 },
        { name: '남남서', arrow: '↙', min: 191.25, max: 213.75 },
        { name: '남서', arrow: '↙', min: 213.75, max: 236.25 },
        { name: '서남서', arrow: '↙', min: 236.25, max: 258.75 },
        { name: '서', arrow: '←', min: 258.75, max: 281.25 },
        { name: '서북서', arrow: '↖', min: 281.25, max: 303.75 },
        { name: '북서', arrow: '↖', min: 303.75, max: 326.25 },
        { name: '북북서', arrow: '↖', min: 326.25, max: 348.75 }
    ];
    
    for (const dir of directions) {
        if (normalized >= dir.min || normalized < dir.max) {
            return { text: dir.name, arrow: dir.arrow };
        }
    }
    
    return { text: '북', arrow: '↑' }; // fallback
}

// Convert sky condition code to Korean text
export function formatSkyCondition(skyCode: number | null | undefined): string {
    if (typeof skyCode !== 'number' || Number.isNaN(skyCode)) {
        return '--';
    }
    
    switch (skyCode) {
        case 1: return '맑음';
        case 3: return '구름많음';
        case 4: return '흐림';
        default: return `코드${skyCode}`;
    }
}

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
// KMA utils removed (switch to backend endpoint)

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

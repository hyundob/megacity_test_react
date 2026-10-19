export async function fetchJson<T>(url: string, signal?: AbortSignal, timeoutMs = 12000): Promise<{ data: T; ms: number }> {
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (signal?.aborted) controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(abort, timeoutMs);
    const start = performance.now();
    try {
        const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error(response.status === 404 ? '데이터 없음' : `조회 실패 (${response.status})`);
        const data: T = await response.json();
        return { data, ms: Math.round(performance.now() - start) };
    } catch (error) {
        if (controller.signal.aborted && !signal?.aborted) throw new Error('응답 시간 초과');
        throw error;
    } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
    }
}

export function parseKstTimestamp(value: string): number {
    if (!/^\d{12}$/.test(value)) return NaN;
    return Date.parse(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(8, 10)}:${value.slice(10, 12)}:00+09:00`);
}

export function validateRows<T>(value: unknown, timeKey: string, numericKeys: string[], array = true): T {
    if (array && !Array.isArray(value)) throw new Error('응답 형식 오류');
    const rows: unknown[] = array ? value as unknown[] : [value];
    for (const row of rows) {
        if (!row || typeof row !== 'object') throw new Error('응답 형식 오류');
        const record = row as Record<string, unknown>;
        if (typeof record[timeKey] !== 'string' || !Number.isFinite(parseKstTimestamp(record[timeKey] as string))) {
            throw new Error('데이터 시각 형식 오류');
        }
        if (numericKeys.some(key => typeof record[key] !== 'number' || !Number.isFinite(record[key]))) {
            throw new Error('수치 데이터 누락 또는 형식 오류');
        }
    }
    return value as T;
}

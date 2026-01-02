// 순수 함수로 분리된 계산 유틸리티

/**
 * 재생에너지 비율 계산
 */
export function calculateRenewableRatio(
    demand: number | null,
    renewable: number | null
): number {
    if (!demand || demand <= 0 || !renewable) return 0;
    return (renewable / demand) * 100;
}


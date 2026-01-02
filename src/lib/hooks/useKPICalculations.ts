import { useMemo } from 'react';
import { SukubOperation } from '../types';
import { calculateRenewableRatio } from '../utils/calculations';

interface UseKPICalculationsProps {
    sukubOperation: SukubOperation | null;
    hgGenUtilPct: number | null;
}

export function useKPICalculations({ sukubOperation, hgGenUtilPct }: UseKPICalculationsProps) {
    const kpi = useMemo(() => {
        const currentDemand = sukubOperation?.currPwrTot ?? null;
        const currentRenewable = sukubOperation?.renewPwrTot ?? null;
        
        const renewableRatio = calculateRenewableRatio(currentDemand, currentRenewable);
        const hydrogenUtil = hgGenUtilPct ?? 0;

        return {
            currentDemand,
            currentRenewable,
            renewableRatio,
            hydrogenUtil
        };
    }, [sukubOperation, hgGenUtilPct]);

    return kpi;
}


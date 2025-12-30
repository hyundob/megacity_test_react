import { useMemo } from 'react';
import { SukubOperation } from '../types';

interface UseKPICalculationsProps {
    sukubOperation: SukubOperation | null;
    hgGenUtilPct: number | null;
}

export function useKPICalculations({ sukubOperation, hgGenUtilPct }: UseKPICalculationsProps) {
    const kpi = useMemo(() => {
        const currentDemand = sukubOperation?.currPwrTot ?? null;
        const currentRenewable = sukubOperation?.renewPwrTot ?? null;
        
        const renewableRatio = currentDemand && currentDemand > 0 && currentRenewable
            ? ((currentRenewable / currentDemand) * 100)
            : 0;
        
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


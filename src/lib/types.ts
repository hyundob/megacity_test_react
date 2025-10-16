// 공용 타입
export type ForecastPredict = {
    crtnTm: string; fcstTm: string; areaGrpId: string; fcstSrad: number; fcstTemp: number;
    fcstHumi: number; fcstWspd: number; fcstPsfc: number;
};

export type SukubOperation = {
    tm: string; suppAbility: number; currPwrTot: number;
    renewPwrTot: number; renewPwrSolar: number; renewPwrWind: number;
};
export type SukubOperationItem = SukubOperation;

export type ReGenPredict = {
    fcstTm: string; fcstQgen: number; fcstQgmx: number; fcstQgmn: number;
    essChrg: number; essDisc: number; essCapa: number;
};

export type DemandPredict = {
    crtnTm: string; fcstTm: string; fcstQgen: number; fcstQgmx: number; fcstQgmn: number;
    currPwrTot?: number | null;
};

export type EssPoint = {
    hour: string; essChrg: number; essDisc: number; essCapa: number; soc?: number;
};

export type JejuCurtPredict = { fcstTm: string; fcstMinpw: number; fcstCurt: number };

export type HgGenPredict = { areaGrpCd: string; fcstTm: string; fcstQgen: number; fcstCapa: number };

export type HgGenInfo = { areaGrpCd: string; tm: string; hgenProd: number; hgenCapa: number };

export type ServiceHealth = 'ok' | 'slow' | 'down';

export type AlertItem = { id: string; icon: 'warn' | 'bell'; title: string; desc: string; ago: string; };

export type KmaNow = {
    tm: string; // yyyymmddHHMM
    tempC: number | null;
    windMs: number | null;
};

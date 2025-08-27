// 공용 타입
export type Forecast = {
    crtnTm: string; fcstTm: string; fcstSrad: number; fcstTemp: number;
    fcstHumi: number; fcstWspd: number; fcstPsfc: number;
};

export type SukubM = {
    tm: string; suppAbility: number; currPwrTot: number;
    renewPwrTot: number; renewPwrSolar: number; renewPwrWind: number;
};
export type SukubMItem = SukubM;

export type PredictSolar = {
    fcstTm: string; fcstQgen: number; fcstQgmx: number; fcstQgmn: number;
    essChrg: number; essDisc: number; essCapa: number;
};

export type PredictDemand = {
    crtnTm: string; fcstTm: string; fcstQgen: number; fcstQgmx: number; fcstQgmn: number;
    currPwrTot?: number | null;
};

export type EssPoint = {
    hour: string; essChrg: number; essDisc: number; essCapa: number; soc?: number;
};

export type Curt = { fcstTm: string; fcstMinpw: number; fcstCurt: number };

export type GenToday = { areaGrpCd: string; fcstTm: string; fcstQgen: number; fcstCapa: number };

export type GemToday = { areaGrpCd: string; tm: string; hgenProd: number; hgenCapa: number };

export type ServiceHealth = 'ok' | 'slow' | 'down';

export type AlertItem = { id: string; icon: 'warn' | 'bell'; title: string; desc: string; ago: string; };

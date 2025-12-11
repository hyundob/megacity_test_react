// 공용 타입
export type ForecastPredict = {
    crtnTm: string; fcstTm: string; areaGrpId: string; fcstSrad: number; fcstTemp: number;
    fcstHumi: number; fcstWspd: number; fcstPsfc: number;
};
``
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

export type JejuRegion = {
    name: string;
    direction: 'north' | 'south' | 'east' | 'west';
    nx: number;
    ny: number;
    lat: number;
    lng: number;
};

export const JEJU_REGIONS: JejuRegion[] = [
    { name: '제주시', direction: 'north', nx: 53, ny: 38, lat: 33.4996, lng: 126.5312 }, // CSV: 5011000000 제주시
    { name: '서귀포', direction: 'south', nx: 52, ny: 33, lat: 33.2394, lng: 126.5653 }, // CSV: 5013000000 서귀포시
    { name: '성산', direction: 'east', nx: 60, ny: 37, lat: 33.3800, lng: 126.8800 }, // CSV: 5013025900 성산읍
    { name: '고산', direction: 'west', nx: 46, ny: 35, lat: 33.2936, lng: 126.1617 }, // CSV: 5011031000 한경면 (고산 관측소 위치)
];

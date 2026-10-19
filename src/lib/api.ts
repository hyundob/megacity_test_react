import { CONFIG } from './config';

const BASE_URL = CONFIG.API_BASE_URL.replace(/\/$/, '');
export const ENDPOINTS = {
    sukubOperationLatest: `${BASE_URL}/sukub-operation/latest`,
    sukubOperationLast24h: `${BASE_URL}/sukub-operation/last-24h`,
    reGenPredictLatestCrtn: `${BASE_URL}/re-gen-predict/latest-crtn`,
    windPredictLatestCrtn: `${BASE_URL}/re-gen-predict/wind/latest-crtn`,
    demandPredictLatestCrtn: `${BASE_URL}/demand-predict/latest-crtn`,
    jejuCurtPredictLatestCrtn: `${BASE_URL}/jeju-curt-predict/latest-crtn`,
} as const;
export const getJejuWeatherRegionUrl = (nx: number, ny: number) =>
    `${BASE_URL}/jeju-weather/region?nx=${nx}&ny=${ny}`;

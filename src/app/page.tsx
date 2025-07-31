'use client';

import React, { useEffect, useState } from 'react';
import { Circle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import './globals.css';

type Forecast = {
  crtnTm: string;
  fcstTm: string;
  fcstSrad: number;
  fcstTemp: number;
  fcstHumi: number;
  fcstWspd: number;
  fcstPsfc: number;
};

type SukubM = {
  tm: string;
  suppAbility: number;
  currPwrTot: number;
  renewPwrTot: number;
  renewPwrSolar: number;
  renewPwrWind: number;
};

type PredictSolar = {
  fcstTm: string;
  fcstQgen: number;
  fcstQgmx: number;
  fcstQgmn: number;
};

export default function Dashboard() {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [sukubM, setSukubM] = useState<SukubM | null>(null);
  const [predictData, setPredictData] = useState<PredictSolar[]>([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [apiStatus, setApiStatus] = useState<'ok' | 'error'>('error');
  const [dbStatus, setDbStatus] = useState<'ok' | 'error'>('error');

  const formatTime = (raw: string) =>
      `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)} ${raw.slice(8, 10)}:${raw.slice(10, 12)}`;

  const getStatusColor = (status: 'ok' | 'error') => (status === 'ok' ? 'green' : 'red');

  const loadData = async () => {
    try {
      const [forecastRes, sukubRes, predictRes] = await Promise.all([
        fetch('http://localhost:8080/api/forecast/latest'),
        fetch('http://localhost:8080/api/operation/latest'),
        fetch('http://localhost:8080/api/fcst-gen/chart'),
      ]);

      if (!forecastRes.ok || !sukubRes.ok || !predictRes.ok) throw new Error('API 오류');

      const forecastData = await forecastRes.json();
      const sukubData = await sukubRes.json();
      const predict = await predictRes.json();

      setForecast(forecastData);
      setSukubM(sukubData);
      setPredictData(predict);
      setLastUpdated(new Date().toLocaleTimeString());
      setApiStatus('ok');
      setDbStatus(forecastData && sukubData ? 'ok' : 'error');
    } catch (err) {
      console.error(err);
      setApiStatus('error');
      setDbStatus('error');
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
      <div className="p-4">
        <div className="bg-gray-100 rounded shadow p-4 flex items-center justify-start gap-6 mb-4">
          <div>⏱ 마지막 업데이트: <strong>{lastUpdated || '로딩 중...'}</strong></div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1">
              <Circle size={14} color={getStatusColor(apiStatus)} fill={getStatusColor(apiStatus)} />
              <span>API</span>
            </div>
            <div className="flex items-center gap-1">
              <Circle size={14} color={getStatusColor(dbStatus)} fill={getStatusColor(dbStatus)} />
              <span>DB</span>
            </div>
          </div>
        </div>

        {forecast && (
            <div className="p-4 bg-white rounded shadow mb-6">
              <h2 className="text-lg font-semibold mb-2">기상 예보 정보</h2>
              <p>생성시간: {formatTime(forecast.crtnTm)}</p>
              <p>예측시간: {formatTime(forecast.fcstTm)}</p>
              <p>일사량: {forecast.fcstSrad}</p>
              <p>기온: {forecast.fcstTemp} °C</p>
              <p>습도: {forecast.fcstHumi} %</p>
              <p>풍속: {forecast.fcstWspd} m/s</p>
              <p>기압: {forecast.fcstPsfc} hPa</p>
            </div>
        )}

        {sukubM && (
            <div className="p-4 bg-white rounded shadow">
              <h2 className="text-lg font-semibold mb-2">제주 계통 운영 정보</h2>
              <p>기준시각: {formatTime(sukubM.tm)}</p>
              <p>공급능력: {sukubM.suppAbility} MW</p>
              <p>현재수요: {sukubM.currPwrTot} MW</p>
              <p>신재생합계: {sukubM.renewPwrTot} MW</p>
              <p>태양광합계: {sukubM.renewPwrSolar} MW</p>
              <p>풍력합계: {sukubM.renewPwrWind} MW</p>
            </div>
        )}

        <div className="p-6 bg-white rounded-2xl shadow-md mt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">태양광 발전 예측 차트</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
                data={predictData.map(item => ({
                  ...item,
                  hour: item.fcstTm.slice(8, 10) + ':00',
                }))}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
              <YAxis unit=" MWh" tick={{ fontSize: 12 }} />
              <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                  labelStyle={{ fontWeight: 'bold', color: '#6b7280' }}
                  itemStyle={{ fontSize: 13 }}
              />
              {/* 기본 Legend + payload 활성화 */}
              <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ fontSize: '13px' }}
              />

              {/* isAnimationActive 를 true 또는 생략 */}
              <Line
                  type="monotone"
                  dataKey="fcstQgen"
                  name="최종 발전량"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
              />
              <Line
                  type="monotone"
                  dataKey="fcstQgmx"
                  name="최대 예측"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={true}
              />
              <Line
                  type="monotone"
                  dataKey="fcstQgmn"
                  name="최소 예측"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {!forecast && !sukubM && (
            <p className="text-gray-500 mt-4">데이터 로딩 중...</p>
        )}
      </div>
  );
}

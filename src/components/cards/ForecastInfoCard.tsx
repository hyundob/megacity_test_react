import { Forecast } from '@/lib/types';
import { formatTime } from '@/lib/utils';

export default function ForecastInfoCard({ data }: { data: Forecast }) {
    return (
        <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-2">기상 예보 정보</h2>
            <p>생성시간: {formatTime(data.crtnTm)}</p>
            <p>예측시간: {formatTime(data.fcstTm)}</p>
            <p>일사량: {data.fcstSrad}</p>
            <p>기온: {data.fcstTemp} °C</p>
            <p>습도: {data.fcstHumi} %</p>
            <p>풍속: {data.fcstWspd} m/s</p>
            <p>기압: {data.fcstPsfc} hPa</p>
        </div>
    );
}
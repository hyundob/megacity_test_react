import { SukubM } from '../../lib/types';
import { formatTime } from '../../lib/utils';

export default function SukubInfoCard({ data }: { data: SukubM }) {
    return (
        <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-2">제주 계통 운영 정보</h2>
            <p>기준시각: {formatTime(data.tm)}</p>
            <p>공급능력: {data.suppAbility} MW</p>
            <p>현재수요: {data.currPwrTot} MW</p>
            <p>신재생합계: {data.renewPwrTot} MW</p>
            <p>태양광합계: {data.renewPwrSolar} MW</p>
            <p>풍력합계: {data.renewPwrWind} MW</p>
        </div>
    );
}

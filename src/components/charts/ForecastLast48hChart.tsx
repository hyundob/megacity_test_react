import { ForecastPredict } from '@/lib/types';
import {
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';

export default function ForecastLast48hChart({ data }: { data: ForecastPredict[] }) {
    const rows = data.map(d => ({
        ...d,
        hour: `${d.fcstTm.slice(4,6)}/${d.fcstTm.slice(6,8)} ${d.fcstTm.slice(8,10)}:00`,
    }));
    return (
        <div className="p-6 bg-white rounded-2xl shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">최근 48시간 기상예보 (기온/일사량/풍속)</h2>
            <ResponsiveContainer width="100%" height={380}>
                <LineChart data={rows} margin={{ left: 8, right: 8, top: 10, bottom: 48 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="hour"
                        interval={3}
                        tick={{ fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        tickMargin={12}
                        height={50}
                    />
                    {/* 좌측 Y축: 기온(°C) */}
                    <YAxis yAxisId="temp" orientation="left" tick={{ fontSize: 11 }} domain={["auto","auto"]} />
                    {/* 우측 Y축1: 일사량 (W/m2) */}
                    <YAxis yAxisId="srad" orientation="right" tick={{ fontSize: 11 }} domain={["auto","auto"]} />
                    {/* 우측 Y축2: 풍속 (m/s) - 우측 안쪽 */}
                    <YAxis yAxisId="wspd" orientation="right" tick={{ fontSize: 11 }} domain={["auto","auto"]} width={0} />
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 40 }} />
                    <Line yAxisId="temp" type="monotone" dataKey="fcstTemp" name="기온(°C)" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line yAxisId="srad" type="monotone" dataKey="fcstSrad" name="일사량(W/m2)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line yAxisId="wspd" type="monotone" dataKey="fcstWspd" name="풍속(m/s)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}



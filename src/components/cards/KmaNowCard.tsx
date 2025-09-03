import { formatWindDirection, formatSkyCondition } from '@/lib/utils';

export default function KmaNowCard({ tempC, windMs, windDir, pty, ptyText, sky }: { tempC: number | null; windMs: number | null; windDir: number | null; pty: number | null; ptyText?: string | null; sky?: number | null }) {
    return (
        <div className="p-3 sm:p-4 bg-white rounded shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-2">제주시 실황 (기상청)</h2>
            <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 text-sm">
                <div>
                    <div className="text-gray-500 text-xs sm:text-sm">기온</div>
                    <div className="text-lg sm:text-xl font-bold">{tempC ?? '--'}<span className="text-sm sm:text-base font-normal">°C</span></div>
                </div>
                <div>
                    <div className="text-gray-500 text-xs sm:text-sm">풍속</div>
                    <div className="text-lg sm:text-xl font-bold">{windMs ?? '--'}<span className="text-sm sm:text-base font-normal"> m/s</span></div>
                </div>
                <div>
                    <div className="text-gray-500 text-xs sm:text-sm">풍향</div>
                    <div className="text-lg sm:text-xl font-bold flex items-center gap-1">
                        <span className="text-xl sm:text-2xl">{formatWindDirection(windDir).arrow}</span>
                        <span className="text-xs sm:text-sm">{formatWindDirection(windDir).text}</span>
                    </div>
                </div>
                <div>
                    <div className="text-gray-500 text-xs sm:text-sm">강수형태</div>
                    <div className="text-xs sm:text-sm font-bold">{ptyText ?? (pty ?? '--')}</div>
                </div>
                <div>
                    <div className="text-gray-500 text-xs sm:text-sm">하늘상태</div>
                    <div className="text-xs sm:text-sm font-bold">{formatSkyCondition(sky)}</div>
                </div>
            </div>
            {!tempC && !windMs && !windDir && !pty && (
                <div className="text-xs text-gray-500 mt-2">API 키 설정 후 표시됩니다.</div>
            )}
        </div>
    );
}



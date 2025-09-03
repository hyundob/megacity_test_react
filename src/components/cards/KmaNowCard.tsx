export default function KmaNowCard({ tempC, windMs }: { tempC: number | null; windMs: number | null }) {
    return (
        <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-2">제주시 실황 (기상청)</h2>
            <div className="flex gap-6 text-sm">
                <div>
                    <div className="text-gray-500">기온</div>
                    <div className="text-xl font-bold">{tempC ?? '--'}<span className="text-base font-normal">°C</span></div>
                </div>
                <div>
                    <div className="text-gray-500">풍속</div>
                    <div className="text-xl font-bold">{windMs ?? '--'}<span className="text-base font-normal"> m/s</span></div>
                </div>
            </div>
            {!tempC && !windMs && (
                <div className="text-xs text-gray-500 mt-2">API 키 설정 후 표시됩니다.</div>
            )}
        </div>
    );
}



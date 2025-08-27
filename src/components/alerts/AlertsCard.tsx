import { AlertItem } from '@/lib/types';

export default function AlertsCard({ alerts }: { alerts: AlertItem[] }) {
    return (
        <div className="p-6 bg-white rounded-2xl shadow-md md:col-span-2">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-800">실시간 알림</h2>
                <div className="flex items-center gap-2 text-gray-400">
                    <button className="hover:text-gray-600" title="확대">⤢</button>
                    <button className="hover:text-gray-600" title="더보기">⋯</button>
                </div>
            </div>
            <div className="space-y-3 max-h-40 overflow-auto pr-2">
                {alerts.map(a => (
                    <div key={a.id} className="flex items-start gap-3 p-3 border rounded-xl">
                        <div className="mt-0.5">{a.icon === 'warn' ? '⚠️' : '🔔'}</div>
                        <div className="flex-1">
                            <div className="font-semibold">{a.title}</div>
                            <div className="text-sm text-gray-600">{a.desc}</div>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">{a.ago}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

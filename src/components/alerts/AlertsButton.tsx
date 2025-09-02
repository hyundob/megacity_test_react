import { Bell } from 'lucide-react';
import { AlertItem } from '@/lib/types';

export default function AlertsButton({ alerts }: { alerts: AlertItem[] }) {
    return (
        <div className="relative group">
            <button
                className="relative p-2 bg-white rounded-full shadow hover:bg-gray-50"
                aria-label="알림 보기"
            >
                <Bell size={18} className="text-gray-600" />
                {/* 새 알림 뱃지 */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            {/* 말풍선 */}
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        🔔 실시간 알림
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="text-sm text-gray-500 py-2">표시할 알림이 없습니다.</div>
                        ) : (
                            alerts.map((alert) => (
                                <div key={alert.id} className="flex items-start gap-2 p-2 border rounded-lg hover:bg-gray-50">
                                    <div className="mt-0.5 text-sm">
                                        {alert.icon === 'warn' ? '⚠️' : '🔔'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-800 truncate">
                                            {alert.title}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                            {alert.desc}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                        {alert.ago}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
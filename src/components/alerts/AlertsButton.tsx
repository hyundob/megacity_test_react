import { Bell } from 'lucide-react';
import { AlertItem } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';

export default function AlertsButton({ alerts }: { alerts: AlertItem[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: Event) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={containerRef}>
            <button
                className="relative p-3 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-gray-300 transition-all duration-200 active:scale-95"
                aria-label="알림 보기"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={18} className="text-gray-600" />
                {/* 새 알림 뱃지 */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            </button>
            
            {/* 말풍선 */}
            <div className={`absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 transition-all duration-200 z-50 ${
                isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
            }`}>
                <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Bell size={14} className="text-blue-500" />
                        </div>
                        실시간 알림
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Bell size={20} className="text-gray-400" />
                                </div>
                                <div className="text-sm text-gray-500">표시할 알림이 없습니다.</div>
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-sm">
                                            {alert.icon === 'warn' ? '⚠️' : '🔔'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-gray-800 truncate">
                                            {alert.title}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                            {alert.desc}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 whitespace-nowrap ml-2 flex-shrink-0">
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
import { Bell } from 'lucide-react';
import { AlertItem } from '@/lib/types';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function AlertsButton({ alerts }: { alerts: AlertItem[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isMouseInsideRef = useRef(false);

    const handleToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;
            
            // 마우스가 컨테이너나 드롭다운 안에 있으면 무시
            if (
                containerRef.current?.contains(target) ||
                dropdownRef.current?.contains(target) ||
                isMouseInsideRef.current
            ) {
                return;
            }
            
            setIsOpen(false);
        };

        // 이벤트 리스너는 약간의 지연 후 추가 (현재 클릭 이벤트가 처리되도록)
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside, true);
            document.addEventListener('touchstart', handleClickOutside, true);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('touchstart', handleClickOutside, true);
        };
    }, [isOpen]);

    // 드롭다운 위치 계산
    useEffect(() => {
        if (!isOpen || !containerRef.current || !dropdownRef.current) return;

        const updatePosition = () => {
            if (!containerRef.current || !dropdownRef.current) return;
            
            const buttonRect = containerRef.current.getBoundingClientRect();
            const dropdown = dropdownRef.current;
            const dropdownWidth = 320;
            
            dropdown.style.position = 'fixed';
            dropdown.style.top = `${buttonRect.bottom + 12}px`;
            
            const rightPosition = window.innerWidth - buttonRect.right;
            if (rightPosition + dropdownWidth > window.innerWidth) {
                dropdown.style.right = '16px';
                dropdown.style.left = 'auto';
            } else {
                dropdown.style.right = `${rightPosition}px`;
                dropdown.style.left = 'auto';
            }
        };

        updatePosition();
        
        // 스크롤이나 리사이즈 시 위치 업데이트
        const handleScroll = () => updatePosition();
        const handleResize = () => updatePosition();
        
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={containerRef}>
            <button
                className="relative p-3 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-gray-300 transition-all duration-200"
                aria-label="알림 보기"
                onClick={handleToggle}
            >
                <Bell size={18} className="text-gray-600" />
                {/* 새 알림 뱃지 */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            </button>
            
            {/* 말풍선 - fixed positioning 사용, 항상 렌더링하되 visibility로 제어 */}
            <div 
                ref={dropdownRef}
                className={`w-80 bg-white rounded-2xl shadow-xl border border-gray-200 transition-opacity duration-200 z-[99999] ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                style={{ 
                    position: 'fixed',
                    visibility: isOpen ? 'visible' : 'hidden'
                }}
                onMouseEnter={() => { isMouseInsideRef.current = true; }}
                onMouseLeave={() => { isMouseInsideRef.current = false; }}
                onMouseDown={(e) => e.stopPropagation()}
            >
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
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
            if (
                containerRef.current?.contains(target) ||
                dropdownRef.current?.contains(target) ||
                isMouseInsideRef.current
            ) return;
            setIsOpen(false);
        };
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
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={containerRef}>
            <button
                className="relative p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-200"
                aria-label="알림 보기"
                onClick={handleToggle}
            >
                <Bell size={18} className="text-slate-600 dark:text-slate-300" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            </button>

            <div
                ref={dropdownRef}
                className={`w-80 rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl transition-opacity duration-200 z-[99999] ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                style={{
                    position: 'fixed',
                    visibility: isOpen ? 'visible' : 'hidden',
                    background: 'var(--nav-bg)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                }}
                onMouseEnter={() => { isMouseInsideRef.current = true; }}
                onMouseLeave={() => { isMouseInsideRef.current = false; }}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <Bell size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        실시간 알림
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Bell size={20} className="text-slate-400 dark:text-slate-500" />
                                </div>
                                <div className="text-sm text-slate-500">표시할 알림이 없습니다.</div>
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <div key={alert.id} className="flex items-start gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/8 dark:hover:bg-white/10 transition-colors border border-black/5 dark:border-white/5">
                                    <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-sm">
                                            {alert.icon === 'warn' ? '⚠️' : '🔔'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                                            {alert.title}
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                            {alert.desc}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 whitespace-nowrap ml-2 flex-shrink-0">
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

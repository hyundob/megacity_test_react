import { useEffect, useState } from 'react';
import { AlertItem } from '../../lib/types';

export default function AlertsModal({
    open,
    onClose,
    alerts,
}: {
    open: boolean;
    onClose: () => void;
    alerts: AlertItem[];
}) {
    const [showAnim, setShowAnim] = useState(false);

    useEffect(() => {
        if (open) {
            setShowAnim(false);
            const id = requestAnimationFrame(() => setShowAnim(true));
            return () => cancelAnimationFrame(id);
        } else {
            setShowAnim(false);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-200 ${showAnim ? 'bg-black/40' : 'bg-black/0'}`}
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`rounded-xl shadow-2xl w-[420px] max-w-[92vw] border border-black/10 dark:border-white/10 transition-all duration-200 ease-out ${showAnim ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)' }}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 dark:border-white/10">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">🔔 실시간 알림</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-xl leading-none"
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-auto px-5 py-4 space-y-3">
                    {alerts.length === 0 ? (
                        <div className="text-sm text-slate-500">표시할 알림이 없습니다.</div>
                    ) : (
                        alerts.map((a) => (
                            <div key={a.id} className="flex items-start gap-3 p-3 border border-black/8 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded-xl">
                                <div className="mt-0.5">{a.icon === 'warn' ? '⚠️' : '🔔'}</div>
                                <div className="flex-1">
                                    <div className="font-semibold text-slate-800 dark:text-slate-200">{a.title}</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">{a.desc}</div>
                                </div>
                                <div className="text-[11px] text-slate-500 whitespace-nowrap">{a.ago}</div>
                            </div>
                        ))
                    )}
                </div>

                <div className="px-5 py-4 border-t border-black/10 dark:border-white/10 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25 text-sm rounded-lg hover:bg-blue-500/25 transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}

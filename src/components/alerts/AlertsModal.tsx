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
    // 마운트 후 한 틱 뒤에 애니메이션 시작 (opacity/scale)
    const [showAnim, setShowAnim] = useState(false);

    useEffect(() => {
        if (open) {
            // 새로 열릴 때 초기 상태(작게/투명)로 시작 → 다음 프레임에 활성
            setShowAnim(false);
            const id = requestAnimationFrame(() => setShowAnim(true));
            return () => cancelAnimationFrame(id);
        } else {
            setShowAnim(false);
        }
    }, [open]);

    // ESC 키로 닫기
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className={`
        fixed inset-0 z-50 flex items-center justify-center
        transition-colors duration-200
        ${showAnim ? 'bg-black/40' : 'bg-black/0'}
      `}
            onClick={onClose} // 배경 클릭 시 닫힘
            aria-modal="true"
            role="dialog"
        >
            <div
                // 이벤트 버블 막아서 카드 클릭 시 닫히지 않도록
                onClick={(e) => e.stopPropagation()}
                className={`
          bg-white rounded-xl shadow-lg w-[420px] max-w-[92vw]
          transition-all duration-200 ease-out
          ${showAnim ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <h2 className="text-lg font-semibold">🔔 실시간 알림</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                </div>

                {/* 목록 */}
                <div className="max-h-[60vh] overflow-auto px-5 py-4 space-y-3">
                    {alerts.length === 0 ? (
                        <div className="text-sm text-gray-500">표시할 알림이 없습니다.</div>
                    ) : (
                        alerts.map((a) => (
                            <div key={a.id} className="flex items-start gap-3 p-3 border rounded-xl">
                                <div className="mt-0.5">{a.icon === 'warn' ? '⚠️' : '🔔'}</div>
                                <div className="flex-1">
                                    <div className="font-semibold">{a.title}</div>
                                    <div className="text-sm text-gray-600">{a.desc}</div>
                                </div>
                                <div className="text-[11px] text-gray-500 whitespace-nowrap">{a.ago}</div>
                            </div>
                        ))
                    )}
                </div>

                {/* 푸터 */}
                <div className="px-5 py-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}

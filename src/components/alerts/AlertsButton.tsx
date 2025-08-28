import { Bell } from 'lucide-react';

export default function AlertsButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="relative p-2 bg-white rounded-full shadow hover:bg-gray-50"
            aria-label="알림 열기"
        >
            <Bell size={18} className="text-gray-600" />
            {/* 새 알림 뱃지 (원하면 제거 가능) */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
    );
}
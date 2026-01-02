// 환경 변수 및 설정 상수
export const CONFIG = {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://210.222.202.14:18080/api',
    
    CHART: {
        DEFAULT_HEIGHT: 260,
        MAX_XAXIS_TICKS: 8,
        MARGIN: {
            top: 20,
            right: 20,
            left: 20,
            bottom: 20,
        },
    },
    
    MAP: {
        MAX_RETRIES: 50,
        RETRY_INTERVAL_MS: 100,
        DEFAULT_LEVEL: 11,
    },
} as const;


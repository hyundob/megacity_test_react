export const DASHBOARD_GRID_COLUMNS = 12;
export const DASHBOARD_GRID_ROW_HEIGHT = 52;
export const DASHBOARD_GRID_GAP = 12;

export type DashboardWidgetId =
    | 'demand'
    | 'curt'
    | 'weather'
    | 'jeju-map'
    | 'operation'
    | 'demand-regen'
    | 'hydrogen-scenario'
    | 'solar'
    | 'wind'
    | 'kpi'
    | 'sukub-info'
    | 'system-status'
    | 'forecast-48h';

export type PageId = 'page1' | 'page2' | 'page3';

export type DashboardLayoutItem = {
    id: DashboardWidgetId;
    x: number;
    y: number;
    w: number;
    h: number;
    minW: number;
    minH: number;
    maxW?: number;
    maxH?: number;
};

// Per-page localStorage keys
export const PAGE_STORAGE_KEYS: Record<PageId, string> = {
    page1: 'megacity-layout-page1-v1',
    page2: 'megacity-layout-page2-v1',
    page3: 'megacity-layout-page3-v1',
};

export const VISIBLE_WIDGETS_STORAGE_KEY = 'megacity-visible-widgets-v1';

// Default widget assignment per page
export const PAGE_DEFAULT_WIDGETS: Record<PageId, DashboardWidgetId[]> = {
    page1: ['jeju-map', 'kpi', 'demand', 'sukub-info', 'system-status'],
    page2: ['operation', 'curt', 'solar', 'wind', 'demand-regen'],
    page3: ['weather', 'hydrogen-scenario', 'forecast-48h'],
};

export const PAGE_LABELS: Record<PageId, string> = {
    page1: '실시간 현황',
    page2: '발전 / 에너지',
    page3: '수소 / 예측',
};

// Page 1 — 실시간 현황 (max 10 rows)
const PAGE1_DEFAULT_LAYOUT: DashboardLayoutItem[] = [
    { id: 'jeju-map',      x: 0, y: 0, w: 4, h: 10, minW: 4, minH: 8  },
    { id: 'kpi',           x: 4, y: 0, w: 4, h: 4,  minW: 3, minH: 4  },
    { id: 'demand',        x: 8, y: 0, w: 4, h: 6,  minW: 3, minH: 4  },
    { id: 'sukub-info',    x: 4, y: 4, w: 4, h: 6,  minW: 3, minH: 3  },
    { id: 'system-status', x: 8, y: 6, w: 4, h: 4,  minW: 3, minH: 3  },
];

// Page 2 — 발전 / 에너지 (max 10 rows)
const PAGE2_DEFAULT_LAYOUT: DashboardLayoutItem[] = [
    { id: 'operation',    x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4 },
    { id: 'curt',         x: 6, y: 0, w: 6, h: 5, minW: 3, minH: 3 },
    { id: 'solar',        x: 0, y: 5, w: 4, h: 5, minW: 4, minH: 3 },
    { id: 'wind',         x: 4, y: 5, w: 4, h: 5, minW: 4, minH: 3 },
    { id: 'demand-regen', x: 8, y: 5, w: 4, h: 5, minW: 4, minH: 4 },
];

// Page 3 — 수소 / 예측 (max 10 rows)
const PAGE3_DEFAULT_LAYOUT: DashboardLayoutItem[] = [
    { id: 'weather',           x: 0, y: 0, w: 4, h: 10, minW: 3, minH: 3 },
    { id: 'hydrogen-scenario', x: 4, y: 0, w: 8, h: 5,  minW: 4, minH: 3 },
    { id: 'forecast-48h',      x: 4, y: 5, w: 8, h: 5,  minW: 6, minH: 4 },
];

export const PAGE_DEFAULT_LAYOUTS: Record<PageId, DashboardLayoutItem[]> = {
    page1: PAGE1_DEFAULT_LAYOUT,
    page2: PAGE2_DEFAULT_LAYOUT,
    page3: PAGE3_DEFAULT_LAYOUT,
};

// Legacy — kept for any code that still references it
export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayoutItem[] = [
    ...PAGE1_DEFAULT_LAYOUT,
    ...PAGE2_DEFAULT_LAYOUT,
    ...PAGE3_DEFAULT_LAYOUT,
];
export const DASHBOARD_LAYOUT_STORAGE_KEY = 'megacity-dashboard-layout-v4';

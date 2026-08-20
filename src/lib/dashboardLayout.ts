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
// maxW/maxH: 기본 크기 대비 과도하게 커지는 것을 막기 위한 상한 (지정하지 않으면 12열/100행까지 확장되어
// 리사이즈 드래그 한 번에 위젯이 그리드 전체를 뒤덮는 문제가 있었음)
const PAGE1_DEFAULT_LAYOUT: DashboardLayoutItem[] = [
    { id: 'jeju-map',      x: 0, y: 0, w: 4, h: 10, minW: 4, minH: 8, maxW: 8,  maxH: 16 },
    { id: 'kpi',           x: 4, y: 0, w: 4, h: 5,  minW: 3, minH: 5, maxW: 8,  maxH: 10 },
    { id: 'demand',        x: 8, y: 0, w: 4, h: 6,  minW: 3, minH: 4, maxW: 8,  maxH: 12 },
    { id: 'sukub-info',    x: 4, y: 5, w: 4, h: 6,  minW: 3, minH: 3, maxW: 8,  maxH: 12 },
    { id: 'system-status', x: 8, y: 6, w: 4, h: 4,  minW: 3, minH: 3, maxW: 8,  maxH: 10 },
];

// Page 2 — 발전 / 에너지 (max 10 rows)
const PAGE2_DEFAULT_LAYOUT: DashboardLayoutItem[] = [
    { id: 'operation',    x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4, maxW: 10, maxH: 11 },
    { id: 'curt',         x: 6, y: 0, w: 6, h: 5, minW: 3, minH: 3, maxW: 10, maxH: 11 },
    { id: 'solar',        x: 0, y: 5, w: 4, h: 5, minW: 4, minH: 3, maxW: 8,  maxH: 11 },
    { id: 'wind',         x: 4, y: 5, w: 4, h: 5, minW: 4, minH: 3, maxW: 8,  maxH: 11 },
    { id: 'demand-regen', x: 8, y: 5, w: 4, h: 5, minW: 4, minH: 4, maxW: 8,  maxH: 11 },
];

// Page 3 — 수소 / 예측 (max 10 rows)
const PAGE3_DEFAULT_LAYOUT: DashboardLayoutItem[] = [
    { id: 'weather',           x: 0, y: 0, w: 4, h: 10, minW: 3, minH: 3, maxW: 8,  maxH: 16 },
    { id: 'hydrogen-scenario', x: 4, y: 0, w: 8, h: 5,  minW: 4, minH: 3, maxW: 12, maxH: 11 },
    { id: 'forecast-48h',      x: 4, y: 5, w: 8, h: 5,  minW: 6, minH: 4, maxW: 12, maxH: 11 },
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

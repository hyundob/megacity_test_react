export const DASHBOARD_GRID_COLUMNS = 12;
export const DASHBOARD_GRID_ROW_HEIGHT = 52;
export const DASHBOARD_GRID_GAP = 12;
export const DASHBOARD_LAYOUT_STORAGE_KEY = 'megacity-dashboard-layout-v4';

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

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayoutItem[] = [
    { id: 'jeju-map', x: 0, y: 0, w: 4, h: 10, minW: 4, minH: 10 },
    { id: 'kpi', x: 4, y: 0, w: 3, h: 4, minW: 3, minH: 4 },
    { id: 'demand', x: 7, y: 0, w: 5, h: 6, minW: 3, minH: 4 },
    { id: 'system-status', x: 4, y: 8, w: 3, h: 3, minW: 3, minH: 3 },
    { id: 'weather', x: 4, y: 4, w: 3, h: 4, minW: 3, minH: 3 },
    { id: 'sukub-info', x: 7, y: 6, w: 5, h: 5, minW: 3, minH: 3 },
    { id: 'operation', x: 0, y: 10, w: 4, h: 5, minW: 4, minH: 4 },
    { id: 'demand-regen', x: 4, y: 15, w: 4, h: 5, minW: 4, minH: 4 },
    { id: 'curt', x: 8, y: 11, w: 4, h: 4, minW: 3, minH: 3 },
    { id: 'hydrogen-scenario', x: 4, y: 11, w: 4, h: 4, minW: 4, minH: 3 },
    { id: 'solar', x: 0, y: 15, w: 4, h:  5, minW: 4, minH: 3 },
    { id: 'wind', x: 8, y: 15, w: 4, h: 5, minW: 4, minH: 3 },
    { id: 'forecast-48h', x: 0, y: 20, w: 12, h: 5, minW: 6, minH: 4 },
];

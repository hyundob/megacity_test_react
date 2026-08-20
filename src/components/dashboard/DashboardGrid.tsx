'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Check,
    Grip,
    Maximize2,
    Minus,
    Plus,
    RotateCcw,
    Settings2,
    X,
} from 'lucide-react';
import {
    DASHBOARD_GRID_COLUMNS,
    DASHBOARD_GRID_GAP,
    DASHBOARD_GRID_ROW_HEIGHT,
} from '@/lib/dashboardLayout';
import type { DashboardLayoutItem, DashboardWidgetId } from '@/lib/dashboardLayout';

export type DashboardWidgetDefinition = {
    id: DashboardWidgetId;
    title: string;
    node: React.ReactNode;
};

type DragAction = {
    id: DashboardWidgetId;
    mode: 'move' | 'resize';
    startClientX: number;
    startClientY: number;
    startItem: DashboardLayoutItem;
};

interface DashboardGridProps {
    widgets: DashboardWidgetDefinition[];
    storageKey: string;
    defaultLayout: DashboardLayoutItem[];
    addableWidgets?: DashboardWidgetDefinition[];
    onAddWidget?: (id: DashboardWidgetId) => void;
    onRemoveWidget?: (id: DashboardWidgetId) => void;
    pageLabel?: string;
}

// ─────────────────────────────────────────────
// Pure helpers — parameterised by defaultLayout
// ─────────────────────────────────────────────

function clamp(value: number, min: number, max: number) {
    if (!Number.isFinite(value)) return min;
    return Math.min(Math.max(value, min), max);
}

function numberOr(value: unknown, fallback: number) {
    const next = Number(value);
    return Number.isFinite(next) ? next : fallback;
}

function sortLayout(layout: DashboardLayoutItem[]) {
    return [...layout].sort((a, b) => (a.y - b.y) || (a.x - b.x));
}

function collides(a: DashboardLayoutItem, b: DashboardLayoutItem) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function overlapArea(a: DashboardLayoutItem, b: DashboardLayoutItem) {
    const xOverlap = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
    const yOverlap = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    return xOverlap * yOverlap;
}

function hasCollision(item: DashboardLayoutItem, others: DashboardLayoutItem[]) {
    return others.some(other => other.id !== item.id && collides(item, other));
}

function findPrimaryCollision(item: DashboardLayoutItem, others: DashboardLayoutItem[]) {
    return others
        .filter(other => other.id !== item.id && collides(item, other))
        .sort((a, b) => overlapArea(item, b) - overlapArea(item, a))[0] ?? null;
}

// Creates a set of layout helpers scoped to a specific defaultLayout
function createHelpers(defaultLayout: DashboardLayoutItem[]) {
    const byId = new Map(defaultLayout.map(item => [item.id, item]));

    function clampLayoutItem(item: DashboardLayoutItem): DashboardLayoutItem {
        const defaults = byId.get(item.id) ?? item;
        const minW = defaults.minW;
        const minH = defaults.minH;
        const maxW = defaults.maxW ?? DASHBOARD_GRID_COLUMNS;
        const maxH = defaults.maxH ?? 100;
        const w = clamp(Math.round(item.w), minW, Math.min(maxW, DASHBOARD_GRID_COLUMNS));
        const h = clamp(Math.round(item.h), minH, maxH);
        return {
            ...defaults,
            ...item,
            minW,
            minH,
            maxW: defaults.maxW,
            maxH: defaults.maxH,
            w,
            h,
            x: clamp(Math.round(item.x), 0, DASHBOARD_GRID_COLUMNS - w),
            y: Math.max(0, Math.round(item.y)),
        };
    }

    function compactLayout(layout: DashboardLayoutItem[], pinnedId?: DashboardWidgetId): DashboardLayoutItem[] {
        const placed: DashboardLayoutItem[] = [];
        const pinned = pinnedId ? layout.find(item => item.id === pinnedId) : null;

        if (pinned) placed.push(clampLayoutItem(pinned));

        for (const item of sortLayout(layout.filter(i => i.id !== pinnedId))) {
            let candidate = clampLayoutItem(item);
            let guard = 0;
            while (hasCollision(candidate, placed) && guard < layout.length * 4) {
                candidate = clampLayoutItem({ ...candidate, y: candidate.y + 1 });
                guard += 1;
            }
            while (candidate.y > 0) {
                const moved = { ...candidate, y: candidate.y - 1 };
                if (hasCollision(moved, placed)) break;
                candidate = moved;
            }
            placed.push(candidate);
        }

        return sortLayout(placed);
    }

    function resolveCollisions(layout: DashboardLayoutItem[], priorityId?: DashboardWidgetId): DashboardLayoutItem[] {
        let next = layout.map(clampLayoutItem);
        let changed = true;
        let guard = 0;

        while (changed && guard < next.length * next.length * 2) {
            changed = false;
            guard += 1;

            const priority = priorityId ? next.find(item => item.id === priorityId) : null;
            const ordered = priority
                ? [priority, ...sortLayout(next.filter(item => item.id !== priorityId))]
                : sortLayout(next);

            for (let i = 0; i < ordered.length; i += 1) {
                for (let j = i + 1; j < ordered.length; j += 1) {
                    if (collides(ordered[i], ordered[j])) {
                        ordered[j].y = ordered[i].y + ordered[i].h;
                        changed = true;
                    }
                }
            }

            next = next.map(clampLayoutItem);
        }

        return compactLayout(sortLayout(next), priorityId);
    }

    function moveWithSwap(
        layout: DashboardLayoutItem[],
        movingId: DashboardWidgetId,
        nextMovingItem: DashboardLayoutItem,
        previousMovingItem: DashboardLayoutItem,
    ): DashboardLayoutItem[] {
        const movingItem = clampLayoutItem(nextMovingItem);
        const others = layout.filter(item => item.id !== movingId).map(clampLayoutItem);
        const primaryCollision = findPrimaryCollision(movingItem, others);

        if (primaryCollision) {
            const swappedItem = clampLayoutItem({
                ...primaryCollision,
                x: clamp(previousMovingItem.x, 0, DASHBOARD_GRID_COLUMNS - primaryCollision.w),
                y: previousMovingItem.y,
            });
            const remaining = others.filter(item => item.id !== primaryCollision.id);

            if (
                !collides(movingItem, swappedItem) &&
                !hasCollision(swappedItem, remaining) &&
                !hasCollision(movingItem, remaining)
            ) {
                return sortLayout([movingItem, swappedItem, ...remaining]);
            }
        }

        return resolveCollisions([movingItem, ...others], movingId);
    }

    function parseStoredLayout(value: string | null): DashboardLayoutItem[] | null {
        if (!value) return null;

        try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) return null;

            return defaultLayout.map(defaultItem => {
                const stored = parsed.find((item: Partial<DashboardLayoutItem>) => item?.id === defaultItem.id);
                if (!stored) return defaultItem;

                return clampLayoutItem({
                    ...defaultItem,
                    x: numberOr(stored.x, defaultItem.x),
                    y: numberOr(stored.y, defaultItem.y),
                    w: numberOr(stored.w, defaultItem.w),
                    h: numberOr(stored.h, defaultItem.h),
                });
            });
        } catch {
            return null;
        }
    }

    return { clampLayoutItem, compactLayout, resolveCollisions, moveWithSwap, parseStoredLayout };
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function DashboardGrid({
    widgets,
    storageKey,
    defaultLayout,
    addableWidgets,
    onAddWidget,
    onRemoveWidget,
    pageLabel,
}: DashboardGridProps) {
    const widgetMap = useMemo(() => new Map(widgets.map(widget => [widget.id, widget])), [widgets]);

    const helpers = useMemo(() => createHelpers(defaultLayout), [defaultLayout]);

    // Row count the page is designed for — used to scale row height to fill
    // whatever vertical space the viewport actually has (see rowHeight effect below).
    const targetRows = useMemo(
        () => Math.max(1, ...defaultLayout.map(item => item.y + item.h)),
        [defaultLayout],
    );

    const [layout, setLayout] = useState<DashboardLayoutItem[]>(defaultLayout);
    const [editMode, setEditMode] = useState(false);
    const [layoutReady, setLayoutReady] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [rowHeight, setRowHeight] = useState(DASHBOARD_GRID_ROW_HEIGHT);

    const gridRef = useRef<HTMLDivElement>(null);
    const actionRef = useRef<DragAction | null>(null);
    const rowHeightRef = useRef(DASHBOARD_GRID_ROW_HEIGHT);

    // Rows fill the available height instead of staying a fixed 52px — on a
    // taller viewport (e.g. QHD vs FHD) the container has more room than the
    // page's fixed row count needs, so rows grow to use it instead of leaving
    // dead space below the content. Mirrors how column width already reads
    // grid.clientWidth live; this does the same for the vertical axis.
    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const recompute = () => {
            const available = grid.clientHeight - DASHBOARD_GRID_GAP * (targetRows - 1);
            const next = clamp(available / targetRows, DASHBOARD_GRID_ROW_HEIGHT, DASHBOARD_GRID_ROW_HEIGHT * 2);
            rowHeightRef.current = next;
            setRowHeight(next);
        };

        recompute();
        const observer = new ResizeObserver(recompute);
        observer.observe(grid);
        return () => observer.disconnect();
    }, [targetRows]);

    // Load from localStorage
    useEffect(() => {
        const stored = helpers.parseStoredLayout(localStorage.getItem(storageKey));
        setLayout(helpers.resolveCollisions(stored ?? defaultLayout));
        setLayoutReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist to localStorage
    useEffect(() => {
        if (!layoutReady) return;
        localStorage.setItem(storageKey, JSON.stringify(layout));
    }, [layout, layoutReady, storageKey]);

    // Close add modal when edit mode is off
    useEffect(() => {
        if (!editMode) setShowAddModal(false);
    }, [editMode]);

    // Pointer drag/resize
    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            const action = actionRef.current;
            const grid = gridRef.current;
            if (!action || !grid) return;

            event.preventDefault();
            const colWidth = (grid.clientWidth - DASHBOARD_GRID_GAP * (DASHBOARD_GRID_COLUMNS - 1)) / DASHBOARD_GRID_COLUMNS;
            const colStep = colWidth + DASHBOARD_GRID_GAP;
            const rowStep = rowHeightRef.current + DASHBOARD_GRID_GAP;
            const deltaX = Math.round((event.clientX - action.startClientX) / colStep);
            const deltaY = Math.round((event.clientY - action.startClientY) / rowStep);

            setLayout(current => {
                const currentItem = current.find(item => item.id === action.id);
                if (!currentItem) return current;

                if (action.mode === 'move') {
                    const movedItem = helpers.clampLayoutItem({
                        ...currentItem,
                        x: action.startItem.x + deltaX,
                        y: action.startItem.y + deltaY,
                    });
                    return helpers.moveWithSwap(current, action.id, movedItem, action.startItem);
                }

                const next = current.map(item => item.id === action.id
                    ? helpers.clampLayoutItem({
                        ...item,
                        w: action.startItem.w + deltaX,
                        h: action.startItem.h + deltaY,
                    })
                    : item
                );

                return helpers.resolveCollisions(next, action.id);
            });
        };

        const handlePointerUp = () => { actionRef.current = null; };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    // helpers is stable (memoized on defaultLayout which is a module-level constant)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateItem = useCallback((id: DashboardWidgetId, patch: Partial<Pick<DashboardLayoutItem, 'x' | 'y' | 'w' | 'h'>>) => {
        setLayout(current => helpers.resolveCollisions(
            current.map(item => item.id === id ? helpers.clampLayoutItem({ ...item, ...patch }) : item),
            id,
        ));
    }, [helpers]);

    const moveItem = useCallback((id: DashboardWidgetId, patch: Partial<Pick<DashboardLayoutItem, 'x' | 'y'>>) => {
        setLayout(current => {
            const item = current.find(i => i.id === id);
            if (!item) return current;
            return helpers.moveWithSwap(current, id, helpers.clampLayoutItem({ ...item, ...patch }), item);
        });
    }, [helpers]);

    const updateItemField = useCallback((id: DashboardWidgetId, field: 'x' | 'y' | 'w' | 'h', value: number) => {
        if (field === 'x' || field === 'y') {
            moveItem(id, { [field]: value } as Partial<Pick<DashboardLayoutItem, 'x' | 'y'>>);
            return;
        }
        updateItem(id, { [field]: value } as Partial<Pick<DashboardLayoutItem, 'x' | 'y' | 'w' | 'h'>>);
    }, [moveItem, updateItem]);

    const nudge = useCallback((id: DashboardWidgetId, dx: number, dy: number) => {
        const item = layout.find(i => i.id === id);
        if (!item) return;
        moveItem(id, { x: item.x + dx, y: item.y + dy });
    }, [layout, moveItem]);

    const resizeBy = useCallback((id: DashboardWidgetId, dw: number, dh: number) => {
        const item = layout.find(i => i.id === id);
        if (!item) return;
        updateItem(id, { w: item.w + dw, h: item.h + dh });
    }, [layout, updateItem]);

    const startPointerAction = useCallback((
        event: React.PointerEvent<HTMLButtonElement>,
        item: DashboardLayoutItem,
        mode: DragAction['mode'],
    ) => {
        if (!editMode) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        actionRef.current = { id: item.id, mode, startClientX: event.clientX, startClientY: event.clientY, startItem: item };
    }, [editMode]);

    const resetLayout = useCallback(() => {
        const defaults = helpers.compactLayout(helpers.resolveCollisions(defaultLayout));
        setLayout(defaults);
        localStorage.setItem(storageKey, JSON.stringify(defaults));
    }, [helpers, defaultLayout, storageKey]);

    const visibleLayout = useMemo(
        () => sortLayout(layout.filter(item => widgetMap.has(item.id))),
        [layout, widgetMap],
    );

    const hasAddable = (addableWidgets?.length ?? 0) > 0;

    return (
        <section className={`dashboard-grid-shell ${editMode ? 'dashboard-grid-shell-editing' : ''}`}>
            {/* Toolbar */}
            <div className="dashboard-grid-toolbar">
                {pageLabel && (
                    <span className="dashboard-grid-page-label">{pageLabel}</span>
                )}
                <div className="dashboard-grid-toolbar-actions">
                    {editMode && hasAddable && (
                        <button
                            type="button"
                            className="dashboard-grid-action dashboard-grid-action-add"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus size={15} />
                            <span>모듈 추가</span>
                        </button>
                    )}
                    <button
                        type="button"
                        className={`dashboard-grid-action ${editMode ? 'dashboard-grid-action-active' : ''}`}
                        onClick={() => setEditMode(current => !current)}
                        aria-pressed={editMode}
                        title={editMode ? '편집 완료' : '레이아웃 편집'}
                    >
                        {editMode ? <Check size={16} /> : <Settings2 size={16} />}
                        <span>{editMode ? '완료' : '편집'}</span>
                    </button>
                    <button
                        type="button"
                        className="dashboard-grid-action"
                        onClick={resetLayout}
                        title="기본 배치"
                    >
                        <RotateCcw size={16} />
                        <span>초기화</span>
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div
                ref={gridRef}
                className="dashboard-grid"
                style={{ '--grid-row-h': `${rowHeight}px` } as React.CSSProperties}
            >
                {visibleLayout.map(item => {
                    const widget = widgetMap.get(item.id);
                    if (!widget) return null;

                    return (
                        <article
                            key={item.id}
                            className={`dashboard-widget ${editMode ? 'dashboard-widget-editing' : ''}`}
                            style={{
                                gridColumn: `${item.x + 1} / span ${item.w}`,
                                gridRow: `${item.y + 1} / span ${item.h}`,
                            }}
                        >
                            {/* Edit overlay */}
                            {editMode && (
                                <div className="dashboard-widget-editor">
                                    <button
                                        type="button"
                                        className="dashboard-widget-drag"
                                        onPointerDown={event => startPointerAction(event, item, 'move')}
                                        title={`${widget.title} 이동`}
                                        aria-label={`${widget.title} 이동`}
                                    >
                                        <Grip size={15} />
                                    </button>

                                    <div className="dashboard-widget-panel">
                                        <div className="dashboard-widget-move-buttons">
                                            <button type="button" onClick={() => nudge(item.id, 0, -1)} title="위로" aria-label="위로 이동"><ArrowUp size={13} /></button>
                                            <button type="button" onClick={() => nudge(item.id, -1, 0)} title="왼쪽" aria-label="왼쪽 이동"><ArrowLeft size={13} /></button>
                                            <button type="button" onClick={() => nudge(item.id, 1, 0)} title="오른쪽" aria-label="오른쪽 이동"><ArrowRight size={13} /></button>
                                            <button type="button" onClick={() => nudge(item.id, 0, 1)} title="아래로" aria-label="아래로 이동"><ArrowDown size={13} /></button>
                                            <button type="button" onClick={() => resizeBy(item.id, 1, 0)} title="너비 증가" aria-label="너비 증가"><Plus size={13} /></button>
                                            <button type="button" onClick={() => resizeBy(item.id, -1, 0)} title="너비 감소" aria-label="너비 감소"><Minus size={13} /></button>
                                            <button type="button" onClick={() => resizeBy(item.id, 0, 1)} title="높이 증가" aria-label="높이 증가"><Plus size={13} /></button>
                                            <button type="button" onClick={() => resizeBy(item.id, 0, -1)} title="높이 감소" aria-label="높이 감소"><Minus size={13} /></button>
                                        </div>

                                        <div className="dashboard-widget-metrics">
                                            {(['x', 'y', 'w', 'h'] as const).map(field => (
                                                <label key={field}>
                                                    <span>{field.toUpperCase()}</span>
                                                    <input
                                                        type="number"
                                                        value={item[field]}
                                                        min={field === 'x' || field === 'y' ? 0 : item[field === 'w' ? 'minW' : 'minH']}
                                                        max={field === 'x' ? DASHBOARD_GRID_COLUMNS - item.w : field === 'w' ? DASHBOARD_GRID_COLUMNS : undefined}
                                                        onChange={event => updateItemField(item.id, field, Number(event.target.value))}
                                                        aria-label={`${widget.title} ${field.toUpperCase()}`}
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Widget content */}
                            <div className="dashboard-widget-inner">
                                {widget.node}
                            </div>

                            {/* Resize handle */}
                            {editMode && (
                                <button
                                    type="button"
                                    className="dashboard-widget-resize"
                                    onPointerDown={event => startPointerAction(event, item, 'resize')}
                                    title={`${widget.title} 크기 조정`}
                                    aria-label={`${widget.title} 크기 조정`}
                                >
                                    <Maximize2 size={15} />
                                </button>
                            )}

                            {/* Remove from page button */}
                            {editMode && onRemoveWidget && (
                                <button
                                    type="button"
                                    className="dashboard-widget-remove"
                                    onClick={() => onRemoveWidget(item.id)}
                                    title={`${widget.title} 이 페이지에서 제거`}
                                    aria-label={`${widget.title} 제거`}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </article>
                    );
                })}
            </div>

            {/* Add Module Modal */}
            {showAddModal && addableWidgets && addableWidgets.length > 0 && (
                <div
                    className="add-module-overlay"
                    onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}
                >
                    <div className="add-module-panel">
                        <div className="add-module-header">
                            <span className="add-module-title">모듈 추가</span>
                            <button
                                type="button"
                                className="add-module-close"
                                onClick={() => setShowAddModal(false)}
                                aria-label="닫기"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <p className="add-module-desc">이 페이지에 추가할 모듈을 선택하세요.</p>
                        <div className="add-module-grid">
                            {addableWidgets.map(widget => (
                                <button
                                    key={widget.id}
                                    type="button"
                                    className="add-module-item"
                                    onClick={() => {
                                        onAddWidget?.(widget.id);
                                        setShowAddModal(false);
                                    }}
                                >
                                    <Plus size={14} />
                                    {widget.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

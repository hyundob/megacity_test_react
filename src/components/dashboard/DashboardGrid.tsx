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
} from 'lucide-react';
import {
    DASHBOARD_GRID_COLUMNS,
    DASHBOARD_GRID_GAP,
    DASHBOARD_GRID_ROW_HEIGHT,
    DASHBOARD_LAYOUT_STORAGE_KEY,
    DEFAULT_DASHBOARD_LAYOUT,
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
}

const defaultLayoutById = new Map(DEFAULT_DASHBOARD_LAYOUT.map(item => [item.id, item]));

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

function clampLayoutItem(item: DashboardLayoutItem): DashboardLayoutItem {
    const defaults = defaultLayoutById.get(item.id) ?? item;
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

function compactLayout(layout: DashboardLayoutItem[], pinnedId?: DashboardWidgetId) {
    const placed: DashboardLayoutItem[] = [];
    const pinned = pinnedId ? layout.find(item => item.id === pinnedId) : null;

    if (pinned) {
        placed.push(clampLayoutItem(pinned));
    }

    for (const item of sortLayout(layout.filter(layoutItem => layoutItem.id !== pinnedId))) {
        let candidate = clampLayoutItem(item);

        while (candidate.y > 0) {
            const moved = { ...candidate, y: candidate.y - 1 };
            if (hasCollision(moved, placed)) break;
            candidate = moved;
        }

        placed.push(candidate);
    }

    return sortLayout(placed);
}

function resolveCollisions(layout: DashboardLayoutItem[], priorityId?: DashboardWidgetId) {
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
) {
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

        if (!hasCollision(swappedItem, remaining) && !hasCollision(movingItem, remaining)) {
            return compactLayout([movingItem, swappedItem, ...remaining], movingId);
        }
    }

    return resolveCollisions([movingItem, ...others], movingId);
}

function parseStoredLayout(value: string | null): DashboardLayoutItem[] | null {
    if (!value) return null;

    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) return null;

        return DEFAULT_DASHBOARD_LAYOUT.map(defaultItem => {
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

export default function DashboardGrid({ widgets }: DashboardGridProps) {
    const widgetMap = useMemo(() => new Map(widgets.map(widget => [widget.id, widget])), [widgets]);
    const [layout, setLayout] = useState<DashboardLayoutItem[]>(DEFAULT_DASHBOARD_LAYOUT);
    const [editMode, setEditMode] = useState(false);
    const [layoutReady, setLayoutReady] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const actionRef = useRef<DragAction | null>(null);

    useEffect(() => {
        const stored = parseStoredLayout(localStorage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY));
        setLayout(resolveCollisions(stored ?? DEFAULT_DASHBOARD_LAYOUT));
        setLayoutReady(true);
    }, []);

    useEffect(() => {
        if (!layoutReady) return;
        localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    }, [layout, layoutReady]);

    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            const action = actionRef.current;
            const grid = gridRef.current;
            if (!action || !grid) return;

            event.preventDefault();
            const colWidth = (grid.clientWidth - DASHBOARD_GRID_GAP * (DASHBOARD_GRID_COLUMNS - 1)) / DASHBOARD_GRID_COLUMNS;
            const colStep = colWidth + DASHBOARD_GRID_GAP;
            const rowStep = DASHBOARD_GRID_ROW_HEIGHT + DASHBOARD_GRID_GAP;
            const deltaX = Math.round((event.clientX - action.startClientX) / colStep);
            const deltaY = Math.round((event.clientY - action.startClientY) / rowStep);

            setLayout(current => {
                const currentItem = current.find(item => item.id === action.id);
                if (!currentItem) return current;

                if (action.mode === 'move') {
                    const movedItem = clampLayoutItem({
                        ...currentItem,
                        x: action.startItem.x + deltaX,
                        y: action.startItem.y + deltaY,
                    });

                    return moveWithSwap(current, action.id, movedItem, action.startItem);
                }

                const next = current.map(item => item.id === action.id
                    ? clampLayoutItem({
                        ...item,
                        w: action.startItem.w + deltaX,
                        h: action.startItem.h + deltaY,
                    })
                    : item
                );

                return resolveCollisions(next, action.id);
            });
        };

        const handlePointerUp = () => {
            actionRef.current = null;
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, []);

    const updateItem = useCallback((id: DashboardWidgetId, patch: Partial<Pick<DashboardLayoutItem, 'x' | 'y' | 'w' | 'h'>>) => {
        setLayout(current => resolveCollisions(
            current.map(item => item.id === id ? clampLayoutItem({ ...item, ...patch }) : item),
            id,
        ));
    }, []);

    const moveItem = useCallback((id: DashboardWidgetId, patch: Partial<Pick<DashboardLayoutItem, 'x' | 'y'>>) => {
        setLayout(current => {
            const item = current.find(layoutItem => layoutItem.id === id);
            if (!item) return current;

            return moveWithSwap(current, id, clampLayoutItem({ ...item, ...patch }), item);
        });
    }, []);

    const updateItemField = useCallback((id: DashboardWidgetId, field: 'x' | 'y' | 'w' | 'h', value: number) => {
        if (field === 'x' || field === 'y') {
            moveItem(id, { [field]: value } as Partial<Pick<DashboardLayoutItem, 'x' | 'y'>>);
            return;
        }

        updateItem(id, { [field]: value } as Partial<Pick<DashboardLayoutItem, 'x' | 'y' | 'w' | 'h'>>);
    }, [moveItem, updateItem]);

    const nudge = useCallback((id: DashboardWidgetId, dx: number, dy: number) => {
        const item = layout.find(layoutItem => layoutItem.id === id);
        if (!item) return;
        moveItem(id, { x: item.x + dx, y: item.y + dy });
    }, [layout, moveItem]);

    const resizeBy = useCallback((id: DashboardWidgetId, dw: number, dh: number) => {
        const item = layout.find(layoutItem => layoutItem.id === id);
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
        actionRef.current = {
            id: item.id,
            mode,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startItem: item,
        };
    }, [editMode]);

    const resetLayout = useCallback(() => {
        const defaults = compactLayout(resolveCollisions(DEFAULT_DASHBOARD_LAYOUT));
        setLayout(defaults);
        localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(defaults));
    }, []);

    const visibleLayout = useMemo(
        () => sortLayout(layout.filter(item => widgetMap.has(item.id))),
        [layout, widgetMap],
    );

    return (
        <section className={`dashboard-grid-shell ${editMode ? 'dashboard-grid-shell-editing' : ''}`}>
            <div className="dashboard-grid-toolbar">
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

            <div ref={gridRef} className="dashboard-grid">
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
                                            <button type="button" onClick={() => nudge(item.id, 0, -1)} title="위로 이동" aria-label="위로 이동">
                                                <ArrowUp size={13} />
                                            </button>
                                            <button type="button" onClick={() => nudge(item.id, -1, 0)} title="왼쪽 이동" aria-label="왼쪽 이동">
                                                <ArrowLeft size={13} />
                                            </button>
                                            <button type="button" onClick={() => nudge(item.id, 1, 0)} title="오른쪽 이동" aria-label="오른쪽 이동">
                                                <ArrowRight size={13} />
                                            </button>
                                            <button type="button" onClick={() => nudge(item.id, 0, 1)} title="아래로 이동" aria-label="아래로 이동">
                                                <ArrowDown size={13} />
                                            </button>
                                            <button type="button" onClick={() => resizeBy(item.id, 1, 0)} title="너비 증가" aria-label="너비 증가">
                                                <Plus size={13} />
                                            </button>
                                            <button type="button" onClick={() => resizeBy(item.id, -1, 0)} title="너비 감소" aria-label="너비 감소">
                                                <Minus size={13} />
                                            </button>
                                            <button type="button" onClick={() => resizeBy(item.id, 0, 1)} title="높이 증가" aria-label="높이 증가">
                                                <Plus size={13} />
                                            </button>
                                            <button type="button" onClick={() => resizeBy(item.id, 0, -1)} title="높이 감소" aria-label="높이 감소">
                                                <Minus size={13} />
                                            </button>
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

                            <div className="dashboard-widget-inner">
                                {widget.node}
                            </div>

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
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

import { onMounted, ref, computed } from 'vue';
import { fetchRunHistory, deleteRunHistory } from '../api/client';
import { useFormatters } from '../composables/useFormatters';
const { formatCurrency, formatDateTime } = useFormatters();
const data = ref(null);
const loading = ref(false);
const error = ref(null);
const expandedRunId = ref(null);
async function load() {
    loading.value = true;
    error.value = null;
    try {
        data.value = await fetchRunHistory();
    }
    catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to load history';
    }
    finally {
        loading.value = false;
    }
}
onMounted(load);
function toggleExpand(id) {
    expandedRunId.value = expandedRunId.value === id ? null : id;
}
const previousRunMap = computed(() => {
    const map = new Map();
    if (!data.value)
        return map;
    const runs = data.value.runs;
    for (let i = 0; i < runs.length - 1; i++) {
        map.set(runs[i].id, runs[i + 1]);
    }
    return map;
});
function basketDelta(run) {
    const prev = previousRunMap.value.get(run.id);
    if (!prev || run.basket_total === null || prev.basket_total === null)
        return null;
    if (prev.basket_total === 0)
        return null;
    const diff = run.basket_total - prev.basket_total;
    const pct = (diff / prev.basket_total) * 100;
    if (Math.abs(pct) < 0.05)
        return null;
    const sign = diff > 0 ? '+' : '';
    return {
        text: `${sign}${formatCurrency(diff)} (${sign}${pct.toFixed(1)}%)`,
        cls: diff > 0 ? 'delta-up' : 'delta-down',
    };
}
function itemDelta(run, item) {
    const prev = previousRunMap.value.get(run.id);
    if (!prev)
        return null;
    const prevItem = prev.items.find((p) => p.item_key === item.item_key);
    if (!prevItem || prevItem.unit_price === 0)
        return null;
    const diff = item.unit_price - prevItem.unit_price;
    const pct = (diff / prevItem.unit_price) * 100;
    if (Math.abs(pct) < 0.05)
        return null;
    const sign = diff > 0 ? '+' : '';
    return {
        text: `${sign}${pct.toFixed(1)}%`,
        cls: diff > 0 ? 'delta-up' : 'delta-down',
    };
}
function runTypeLabel(type) {
    return type === 'refresh' ? 'Price Refresh' : 'Monthly Snapshot';
}
function statusClass(status) {
    if (status === 'completed')
        return 'badge-accepted';
    if (status === 'failed')
        return 'badge-rejected';
    return 'badge-pending';
}
function durationText(run) {
    const ms = new Date(run.completed_at).getTime() - new Date(run.started_at).getTime();
    if (ms < 1000)
        return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}
const deleting = ref(null);
async function deleteRun(id, event) {
    event.stopPropagation();
    if (!confirm('Delete this run from history?'))
        return;
    deleting.value = id;
    try {
        await deleteRunHistory(id);
        if (data.value) {
            data.value = { runs: data.value.runs.filter((r) => r.id !== id) };
        }
        if (expandedRunId.value === id)
            expandedRunId.value = null;
    }
    catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to delete run';
    }
    finally {
        deleting.value = null;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['run-row']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-table']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-table']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-delete']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-delete']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "history" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
if (__VLS_ctx.loading && !__VLS_ctx.data) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-state" },
    });
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.error);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.load) },
        ...{ class: "btn btn-secondary" },
    });
}
else if (__VLS_ctx.data && __VLS_ctx.data.runs.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "history-subtitle" },
    });
    (__VLS_ctx.data.runs.length);
    (__VLS_ctx.data.runs.length === 1 ? '' : 's');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-wrap card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "text-right" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "text-right" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "text-right" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "text-right" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    for (const [run] of __VLS_getVForSourceType((__VLS_ctx.data.runs))) {
        (run.id);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && !__VLS_ctx.data))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.data && __VLS_ctx.data.runs.length > 0))
                        return;
                    __VLS_ctx.toggleExpand(run.id);
                } },
            ...{ class: "run-row" },
            ...{ class: ({ 'run-row--expanded': __VLS_ctx.expandedRunId === run.id }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "run-time" },
        });
        (__VLS_ctx.formatDateTime(run.started_at));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "run-type" },
            ...{ class: ('run-type--' + run.run_type) },
        });
        (__VLS_ctx.runTypeLabel(run.run_type));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge" },
            ...{ class: (__VLS_ctx.statusClass(run.status)) },
        });
        (run.status);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "num" },
        });
        (run.item_count);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "num" },
        });
        (run.basket_total !== null ? __VLS_ctx.formatCurrency(run.basket_total) : '—');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "num" },
        });
        if (__VLS_ctx.basketDelta(run)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: (__VLS_ctx.basketDelta(run).cls) },
                ...{ class: "delta-text" },
            });
            (__VLS_ctx.basketDelta(run).text);
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "text-muted" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "num" },
        });
        (__VLS_ctx.durationText(run));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "delete-cell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && !__VLS_ctx.data))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.data && __VLS_ctx.data.runs.length > 0))
                        return;
                    __VLS_ctx.deleteRun(run.id, $event);
                } },
            ...{ class: "btn-delete" },
            disabled: (__VLS_ctx.deleting === run.id),
            title: "Delete run",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            width: "14",
            height: "14",
            viewBox: "0 0 16 16",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.5",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4M6.667 7.333v4M9.333 7.333v4",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M3.333 4h9.334l-.667 9.333a1.333 1.333 0 0 1-1.333 1.334H5.333A1.333 1.333 0 0 1 4 13.333L3.333 4Z",
        });
        if (__VLS_ctx.expandedRunId === run.id) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                ...{ class: "detail-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                colspan: "8",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "detail-panel" },
            });
            if (run.run_type === 'refresh' && run.summary) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "detail-meta mb-4" },
                });
                if (run.summary.observations_collected != null) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    (run.summary.observations_collected);
                }
                if (run.summary.observations_reviewed != null) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    (run.summary.observations_reviewed);
                }
            }
            if (run.run_type === 'snapshot' && run.summary) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "detail-meta mb-4" },
                });
                if (run.summary.snapshot_month) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    (run.summary.snapshot_month);
                }
            }
            if (run.items.length > 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
                    ...{ class: "detail-table" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
                    ...{ class: "text-right" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
                    ...{ class: "text-right" },
                });
                if (run.run_type === 'snapshot') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
                        ...{ class: "text-right" },
                    });
                }
                if (run.run_type === 'snapshot') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
                        ...{ class: "text-right" },
                    });
                }
                if (run.run_type === 'refresh') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
                        ...{ class: "text-right" },
                    });
                }
                if (run.run_type === 'refresh') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
                        ...{ class: "text-right" },
                    });
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
                for (const [item] of __VLS_getVForSourceType((run.items))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                        key: (item.item_key),
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                    (item.name);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                        ...{ class: "num" },
                    });
                    (__VLS_ctx.formatCurrency(item.unit_price));
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                        ...{ class: "num" },
                    });
                    if (__VLS_ctx.itemDelta(run, item)) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: (__VLS_ctx.itemDelta(run, item).cls) },
                            ...{ class: "delta-text" },
                        });
                        (__VLS_ctx.itemDelta(run, item).text);
                    }
                    else {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "text-muted" },
                        });
                    }
                    if (run.run_type === 'snapshot') {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                            ...{ class: "num" },
                        });
                        (item.quantity ?? '—');
                    }
                    if (run.run_type === 'snapshot') {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                            ...{ class: "num" },
                        });
                        (item.line_total != null ? __VLS_ctx.formatCurrency(item.line_total) : '—');
                    }
                    if (run.run_type === 'refresh') {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                            ...{ class: "num" },
                        });
                        (item.observation_count ?? '—');
                    }
                    if (run.run_type === 'refresh') {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                            ...{ class: "num" },
                        });
                        (item.accepted_count ?? '—');
                    }
                }
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    ...{ class: "text-muted" },
                    ...{ style: {} },
                });
            }
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
/** @type {__VLS_StyleScopedClasses['history']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['history-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['run-row']} */ ;
/** @type {__VLS_StyleScopedClasses['run-time']} */ ;
/** @type {__VLS_StyleScopedClasses['run-type']} */ ;
/** @type {__VLS_StyleScopedClasses['badge']} */ ;
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['delta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-delete']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-table']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['delta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatCurrency: formatCurrency,
            formatDateTime: formatDateTime,
            data: data,
            loading: loading,
            error: error,
            expandedRunId: expandedRunId,
            load: load,
            toggleExpand: toggleExpand,
            basketDelta: basketDelta,
            itemDelta: itemDelta,
            runTypeLabel: runTypeLabel,
            statusClass: statusClass,
            durationText: durationText,
            deleting: deleting,
            deleteRun: deleteRun,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=HistoryView.vue.js.map
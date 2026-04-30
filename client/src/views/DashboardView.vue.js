import { onMounted, ref } from 'vue';
import { useDashboardStore } from '../stores/dashboard';
import { triggerRefresh, triggerSnapshot } from '../api/client';
import { useFormatters } from '../composables/useFormatters';
import BasketTotal from '../components/dashboard/BasketTotal.vue';
import ChangeIndicator from '../components/dashboard/ChangeIndicator.vue';
import LogConsole from '../components/dashboard/LogConsole.vue';
const dashboard = useDashboardStore();
const { formatDate, formatMonth } = useFormatters();
const refreshing = ref(false);
const refreshResult = ref(null);
const refreshError = ref(null);
const snapshotting = ref(false);
const snapshotResult = ref(null);
const snapshotError = ref(null);
onMounted(() => {
    dashboard.load();
});
async function runRefresh() {
    refreshing.value = true;
    refreshResult.value = null;
    refreshError.value = null;
    try {
        refreshResult.value = await triggerRefresh();
        dashboard.load();
    }
    catch (err) {
        refreshError.value = err instanceof Error ? err.message : 'Refresh failed';
    }
    finally {
        refreshing.value = false;
    }
}
async function runSnapshot() {
    snapshotting.value = true;
    snapshotResult.value = null;
    snapshotError.value = null;
    try {
        snapshotResult.value = await triggerSnapshot();
        dashboard.load();
    }
    catch (err) {
        snapshotError.value = err instanceof Error ? err.message : 'Snapshot failed';
    }
    finally {
        snapshotting.value = false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['dashboard-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dashboard" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
if (__VLS_ctx.dashboard.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-state" },
    });
}
else if (__VLS_ctx.dashboard.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.dashboard.error);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.dashboard.loading))
                    return;
                if (!(__VLS_ctx.dashboard.error))
                    return;
                __VLS_ctx.dashboard.load();
            } },
        ...{ class: "btn btn-secondary" },
    });
}
else if (__VLS_ctx.dashboard.data) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dashboard-summary" },
    });
    /** @type {[typeof BasketTotal, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(BasketTotal, new BasketTotal({
        total: (__VLS_ctx.dashboard.data.current_basket_total),
        loading: (__VLS_ctx.dashboard.loading),
    }));
    const __VLS_1 = __VLS_0({
        total: (__VLS_ctx.dashboard.data.current_basket_total),
        loading: (__VLS_ctx.dashboard.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    /** @type {[typeof ChangeIndicator, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(ChangeIndicator, new ChangeIndicator({
        label: "vs Previous Month",
        currentValue: (__VLS_ctx.dashboard.data.current_basket_total),
        previousValue: (__VLS_ctx.dashboard.data.previous_month_total),
    }));
    const __VLS_4 = __VLS_3({
        label: "vs Previous Month",
        currentValue: (__VLS_ctx.dashboard.data.current_basket_total),
        previousValue: (__VLS_ctx.dashboard.data.previous_month_total),
    }, ...__VLS_functionalComponentArgsRest(__VLS_3));
    /** @type {[typeof ChangeIndicator, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(ChangeIndicator, new ChangeIndicator({
        label: "vs Baseline",
        currentValue: (__VLS_ctx.dashboard.data.current_basket_total),
        previousValue: (__VLS_ctx.dashboard.data.baseline_total),
    }));
    const __VLS_7 = __VLS_6({
        label: "vs Baseline",
        currentValue: (__VLS_ctx.dashboard.data.current_basket_total),
        previousValue: (__VLS_ctx.dashboard.data.baseline_total),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dashboard-meta card mt-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-value" },
    });
    (__VLS_ctx.dashboard.data.item_count);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-value" },
    });
    (__VLS_ctx.dashboard.data.latest_refresh_date ? __VLS_ctx.formatDate(__VLS_ctx.dashboard.data.latest_refresh_date) : 'Never');
    if (__VLS_ctx.dashboard.data.baseline_month) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "meta-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "meta-value" },
        });
        (__VLS_ctx.formatMonth(__VLS_ctx.dashboard.data.baseline_month));
    }
    /** @type {[typeof LogConsole, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(LogConsole, new LogConsole({
        ...{ class: "mt-4" },
    }));
    const __VLS_10 = __VLS_9({
        ...{ class: "mt-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dashboard-actions mt-6" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.runRefresh) },
        ...{ class: "btn btn-primary" },
        disabled: (__VLS_ctx.refreshing),
    });
    (__VLS_ctx.refreshing ? 'Running...' : 'Run Refresh');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.runSnapshot) },
        ...{ class: "btn btn-secondary" },
        disabled: (__VLS_ctx.snapshotting),
    });
    (__VLS_ctx.snapshotting ? 'Generating...' : 'Generate Snapshot');
    if (__VLS_ctx.refreshResult) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "action-result card mt-4" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.refreshResult.status);
        (__VLS_ctx.refreshResult.observations_collected);
        (__VLS_ctx.refreshResult.observations_reviewed);
        (__VLS_ctx.refreshResult.duration_ms);
        if (__VLS_ctx.refreshResult.errors.length > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
                ...{ class: "action-errors" },
            });
            for (const [err, i] of __VLS_getVForSourceType((__VLS_ctx.refreshResult.errors))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                    key: (i),
                });
                (err);
            }
        }
    }
    if (__VLS_ctx.refreshError) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "error-state mt-4" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.refreshError);
    }
    if (__VLS_ctx.snapshotResult) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "action-result card mt-4" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.snapshotResult.status);
        (__VLS_ctx.formatMonth(__VLS_ctx.snapshotResult.snapshot_month));
        (__VLS_ctx.snapshotResult.items_snapshotted);
        (__VLS_ctx.snapshotResult.basket_total.toFixed(2));
    }
    if (__VLS_ctx.snapshotError) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "error-state mt-4" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.snapshotError);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.runRefresh) },
        ...{ class: "btn btn-primary mt-4" },
        disabled: (__VLS_ctx.refreshing),
    });
    (__VLS_ctx.refreshing ? 'Running...' : 'Run Refresh');
}
/** @type {__VLS_StyleScopedClasses['dashboard']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['dashboard-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['dashboard-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-label']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-value']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-label']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-value']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-label']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-value']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['dashboard-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['action-result']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['action-errors']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['action-result']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BasketTotal: BasketTotal,
            ChangeIndicator: ChangeIndicator,
            LogConsole: LogConsole,
            dashboard: dashboard,
            formatDate: formatDate,
            formatMonth: formatMonth,
            refreshing: refreshing,
            refreshResult: refreshResult,
            refreshError: refreshError,
            snapshotting: snapshotting,
            snapshotResult: snapshotResult,
            snapshotError: snapshotError,
            runRefresh: runRefresh,
            runSnapshot: runSnapshot,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=DashboardView.vue.js.map
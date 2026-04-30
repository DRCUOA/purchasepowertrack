import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useBasketStore } from '../stores/basket';
import { usePricesStore } from '../stores/prices';
import { useDashboardStore } from '../stores/dashboard';
import { useFormatters } from '../composables/useFormatters';
import { computePeriods, clampPeriodDays, DEFAULT_PERIOD_DAYS, MIN_PERIOD_DAYS, MAX_PERIOD_DAYS, } from '../composables/usePeriodAnalysis';
import StatTile from '../components/analyse/StatTile.vue';
import BasketTotalChart from '../components/analyse/BasketTotalChart.vue';
import IndexChart from '../components/analyse/IndexChart.vue';
import ContributionChart from '../components/analyse/ContributionChart.vue';
import ItemChangeChart from '../components/analyse/ItemChangeChart.vue';
const basket = useBasketStore();
const prices = usePricesStore();
const dashboard = useDashboardStore();
const { formatCurrency, formatDate } = useFormatters();
const ANALYSE_PERIOD_STORAGE_KEY = 'ppt.analyse.periodDays';
const PERIOD_PRESETS = [7, 14, 20, 30];
function loadStoredPeriodDays() {
    try {
        const raw = localStorage.getItem(ANALYSE_PERIOD_STORAGE_KEY);
        if (raw === null)
            return DEFAULT_PERIOD_DAYS;
        return clampPeriodDays(parseInt(raw, 10));
    }
    catch {
        return DEFAULT_PERIOD_DAYS;
    }
}
function persistPeriodDays(n) {
    try {
        localStorage.setItem(ANALYSE_PERIOD_STORAGE_KEY, String(n));
    }
    catch {
        /* private mode / quota */
    }
}
const periodDays = ref(loadStoredPeriodDays());
const periodDaysModel = computed({
    get: () => periodDays.value,
    set: (v) => {
        if (typeof v !== 'number' || !Number.isFinite(v))
            return;
        const c = clampPeriodDays(Math.floor(v));
        periodDays.value = c;
        persistPeriodDays(c);
    },
});
function setPeriodPreset(d) {
    const c = clampPeriodDays(d);
    periodDays.value = c;
    persistPeriodDays(c);
}
const historiesLoading = ref(false);
const historiesError = ref(null);
/** Load weekly price history for every basket item in parallel. */
async function loadAllHistories() {
    historiesLoading.value = true;
    historiesError.value = null;
    try {
        await Promise.all(basket.items.map((it) => prices.loadHistory(it.item_key)));
    }
    catch (err) {
        historiesError.value =
            err instanceof Error ? err.message : 'Failed to load price history';
    }
    finally {
        historiesLoading.value = false;
    }
}
onMounted(async () => {
    if (!dashboard.data)
        dashboard.load();
    if (!prices.currentPrices)
        prices.loadCurrentPrices();
    if (basket.items.length === 0)
        await basket.load();
    if (basket.items.length > 0)
        await loadAllHistories();
});
// If basket items load after the page, kick off histories then.
watch(() => basket.items.length, (n, prev) => {
    if (n > 0 && prev === 0)
        loadAllHistories();
});
const analysis = computed(() => computePeriods(basket.items, prices.historyCache, periodDays.value));
const periodsAsc = computed(() => analysis.value.periods); // already chronological
const periodsDesc = computed(() => [...periodsAsc.value].reverse());
const latestPeriod = computed(() => periodsDesc.value[0] ?? null);
const previousPeriod = computed(() => periodsDesc.value[1] ?? null);
const baselinePeriod = computed(() => periodsAsc.value[0] ?? null);
const isLoading = computed(() => (basket.loading && basket.items.length === 0) ||
    (historiesLoading.value && periodsAsc.value.length === 0));
const hasAnyData = computed(() => periodsAsc.value.length > 0 ||
    (prices.currentPrices?.prices.length ?? 0) > 0);
// ------------------------------------------------------------------ helpers
function direction(current, previous) {
    if (current === null || previous === null)
        return null;
    const diff = current - previous;
    if (Math.abs(diff) < 0.005)
        return 'flat';
    return diff > 0 ? 'up' : 'down';
}
// ------------------------------------------------------------------ KPI tiles
const tileBasket = computed(() => {
    const cur = latestPeriod.value?.basket_total ?? null;
    const prev = previousPeriod.value?.basket_total ?? null;
    return {
        value: cur !== null ? formatCurrency(cur) : '—',
        sublabel: latestPeriod.value
            ? `${latestPeriod.value.label} basket cost`
            : 'no completed periods yet',
        delta: cur !== null && prev !== null && prev !== 0
            ? `${cur >= prev ? '+' : ''}${(((cur - prev) / prev) * 100).toFixed(1)}% PoP`
            : null,
        direction: direction(cur, prev),
    };
});
const tileIndex = computed(() => {
    const latest = latestPeriod.value;
    const baseline = baselinePeriod.value;
    if (!latest || !baseline) {
        return {
            value: '—',
            sublabel: 'no baseline period yet',
            delta: null,
            direction: null,
        };
    }
    // Annualise: extrapolate latest's compounded growth out to a full year.
    // Periods elapsed since baseline = latest.index - 1.
    const periodsElapsed = latest.index - 1;
    let annualised = null;
    if (periodsElapsed > 0) {
        const ratio = latest.index_value / 100;
        const periodsPerYear = 365.25 / periodDays.value;
        const annual = Math.pow(ratio, periodsPerYear / periodsElapsed) - 1;
        annualised = `${annual >= 0 ? '+' : ''}${(annual * 100).toFixed(1)}% / yr`;
    }
    return {
        value: latest.index_value.toFixed(1),
        sublabel: `vs ${baseline.label} = 100`,
        delta: annualised,
        direction: latest.index_value > 100
            ? 'up'
            : latest.index_value < 100
                ? 'down'
                : 'flat',
    };
});
const itemsPoPChanges = computed(() => {
    const cur = latestPeriod.value;
    const prev = previousPeriod.value;
    if (!cur || !prev)
        return [];
    const prevByKey = new Map(prev.items.map((i) => [i.item_key, i]));
    const out = [];
    for (const c of cur.items) {
        const p = prevByKey.get(c.item_key);
        if (!p || p.avg_unit_price <= 0 || c.avg_unit_price <= 0)
            continue;
        const pct = ((c.avg_unit_price - p.avg_unit_price) / p.avg_unit_price) * 100;
        out.push({ item_key: c.item_key, name: c.name, pct_change: pct });
    }
    return out;
});
const tileBiggestMover = computed(() => {
    const items = itemsPoPChanges.value;
    if (items.length === 0) {
        return {
            value: '—',
            sublabel: 'need 2+ completed periods',
            delta: null,
            direction: null,
        };
    }
    const top = [...items].sort((a, b) => Math.abs(b.pct_change) - Math.abs(a.pct_change))[0];
    return {
        value: top.name,
        sublabel: 'biggest mover this period',
        delta: `${top.pct_change >= 0 ? '+' : ''}${top.pct_change.toFixed(1)}%`,
        direction: top.pct_change > 0
            ? 'up'
            : top.pct_change < 0
                ? 'down'
                : 'flat',
    };
});
const tileCoverage = computed(() => {
    const totalItems = basket.items.length;
    const priced = prices.currentPrices?.prices.length ?? 0;
    const accepted = prices.currentPrices?.prices.reduce((sum, p) => sum + p.accepted_count, 0) ?? 0;
    const lastRefresh = dashboard.data?.latest_refresh_date ?? null;
    return {
        value: totalItems > 0 ? `${priced} / ${totalItems}` : '—',
        sublabel: lastRefresh !== null
            ? `last refresh ${formatDate(lastRefresh)}`
            : 'no refresh yet',
        delta: `${accepted} accepted obs`,
    };
});
// ----------------------------------------------------------------- chart data
const trendPoints = computed(() => periodsAsc.value.map((p) => ({
    label: p.label,
    tooltipTitle: p.tooltipTitle,
    basket_total: p.basket_total,
    isBaseline: p.index === 1,
})));
const indexPoints = computed(() => periodsAsc.value.map((p) => ({
    label: p.label,
    tooltipTitle: p.tooltipTitle,
    index_value: p.index_value,
    isBaseline: p.index === 1,
})));
const contributionRows = computed(() => {
    const latest = latestPeriod.value;
    if (!latest)
        return [];
    return latest.items.map((i) => ({
        item_key: i.item_key,
        name: i.name,
        line_total: i.period_total,
    }));
});
const itemChangeRows = computed(() => {
    const latest = latestPeriod.value;
    const baseline = baselinePeriod.value;
    if (!latest || !baseline || latest.index === 1)
        return [];
    const baselineByKey = new Map(baseline.items.map((i) => [i.item_key, i]));
    const out = [];
    for (const c of latest.items) {
        const b = baselineByKey.get(c.item_key);
        if (!b || b.avg_unit_price <= 0 || c.avg_unit_price <= 0)
            continue;
        const pct = ((c.avg_unit_price - b.avg_unit_price) / b.avg_unit_price) * 100;
        out.push({ item_key: c.item_key, name: c.name, pct_change: pct });
    }
    return out;
});
// ----------------------------------------------------------------- summary
const summary = computed(() => {
    const latest = latestPeriod.value;
    const baseline = baselinePeriod.value;
    const prev = previousPeriod.value;
    if (!latest)
        return null;
    return {
        latestLabel: latest.label,
        latestTooltip: latest.tooltipTitle,
        latestTotal: formatCurrency(latest.basket_total),
        vsBaseline: baseline && latest.index !== 1
            ? `${latest.index_value >= 100 ? '+' : ''}${(latest.index_value - 100).toFixed(1)}%`
            : null,
        vsBaselineUp: latest.index_value >= 100,
        vsPrev: prev && prev.basket_total > 0
            ? `${latest.basket_total >= prev.basket_total ? '+' : ''}${(((latest.basket_total - prev.basket_total) / prev.basket_total) * 100).toFixed(1)}%`
            : null,
        vsPrevUp: prev ? latest.basket_total >= prev.basket_total : false,
        baselineLabel: baseline?.tooltipTitle ?? null,
    };
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['stat-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "analyse" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "analyse-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "analyse-header-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "period-control" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "period-label" },
    for: "analyse-period-days",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "analyse-period-days",
    type: "number",
    ...{ class: "input input-inline period-input" },
    min: (__VLS_ctx.MIN_PERIOD_DAYS),
    max: (__VLS_ctx.MAX_PERIOD_DAYS),
    step: "1",
    'aria-describedby': "analyse-period-hint",
});
(__VLS_ctx.periodDaysModel);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    id: "analyse-period-hint",
    ...{ class: "period-hint" },
});
(__VLS_ctx.MIN_PERIOD_DAYS);
(__VLS_ctx.MAX_PERIOD_DAYS);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "period-presets" },
    role: "group",
    'aria-label': "Quick period lengths",
});
for (const [d] of __VLS_getVForSourceType((__VLS_ctx.PERIOD_PRESETS))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.setPeriodPreset(d);
            } },
        key: (d),
        type: "button",
        ...{ class: "btn btn-ghost btn-sm period-preset" },
        'aria-pressed': (__VLS_ctx.periodDays === d),
    });
    (d);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-sub" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.periodDays);
if (__VLS_ctx.analysis.anchor_date) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.formatDate(__VLS_ctx.analysis.anchor_date));
}
if (__VLS_ctx.analysis.has_in_progress_period) {
}
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-state" },
    });
}
else if (!__VLS_ctx.hasAnyData) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    const __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: "/operations",
        ...{ class: "btn btn-primary mt-4" },
    }));
    const __VLS_2 = __VLS_1({
        to: "/operations",
        ...{ class: "btn btn-primary mt-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    var __VLS_3;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "stat-grid" },
    });
    /** @type {[typeof StatTile, ]} */ ;
    // @ts-ignore
    const __VLS_4 = __VLS_asFunctionalComponent(StatTile, new StatTile({
        label: "Latest period basket",
        value: (__VLS_ctx.tileBasket.value),
        sublabel: (__VLS_ctx.tileBasket.sublabel),
        delta: (__VLS_ctx.tileBasket.delta),
        direction: (__VLS_ctx.tileBasket.direction),
    }));
    const __VLS_5 = __VLS_4({
        label: "Latest period basket",
        value: (__VLS_ctx.tileBasket.value),
        sublabel: (__VLS_ctx.tileBasket.sublabel),
        delta: (__VLS_ctx.tileBasket.delta),
        direction: (__VLS_ctx.tileBasket.direction),
    }, ...__VLS_functionalComponentArgsRest(__VLS_4));
    /** @type {[typeof StatTile, ]} */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(StatTile, new StatTile({
        label: "Index vs P1",
        value: (__VLS_ctx.tileIndex.value),
        sublabel: (__VLS_ctx.tileIndex.sublabel),
        delta: (__VLS_ctx.tileIndex.delta),
        direction: (__VLS_ctx.tileIndex.direction),
    }));
    const __VLS_8 = __VLS_7({
        label: "Index vs P1",
        value: (__VLS_ctx.tileIndex.value),
        sublabel: (__VLS_ctx.tileIndex.sublabel),
        delta: (__VLS_ctx.tileIndex.delta),
        direction: (__VLS_ctx.tileIndex.direction),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    /** @type {[typeof StatTile, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(StatTile, new StatTile({
        label: "Biggest mover",
        value: (__VLS_ctx.tileBiggestMover.value),
        sublabel: (__VLS_ctx.tileBiggestMover.sublabel),
        delta: (__VLS_ctx.tileBiggestMover.delta),
        direction: (__VLS_ctx.tileBiggestMover.direction),
    }));
    const __VLS_11 = __VLS_10({
        label: "Biggest mover",
        value: (__VLS_ctx.tileBiggestMover.value),
        sublabel: (__VLS_ctx.tileBiggestMover.sublabel),
        delta: (__VLS_ctx.tileBiggestMover.delta),
        direction: (__VLS_ctx.tileBiggestMover.direction),
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    /** @type {[typeof StatTile, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(StatTile, new StatTile({
        label: "Coverage",
        value: (__VLS_ctx.tileCoverage.value),
        sublabel: (__VLS_ctx.tileCoverage.sublabel),
        delta: (__VLS_ctx.tileCoverage.delta),
        direction: (null),
        inverseTrend: (false),
    }));
    const __VLS_14 = __VLS_13({
        label: "Coverage",
        value: (__VLS_ctx.tileCoverage.value),
        sublabel: (__VLS_ctx.tileCoverage.sublabel),
        delta: (__VLS_ctx.tileCoverage.delta),
        direction: (null),
        inverseTrend: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    if (__VLS_ctx.periodsAsc.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-state card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.periodDays);
        (__VLS_ctx.periodDays);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            ...{ class: "chart-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "card-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "chart-sub" },
        });
        (__VLS_ctx.periodDays);
        /** @type {[typeof BasketTotalChart, ]} */ ;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent(BasketTotalChart, new BasketTotalChart({
            points: (__VLS_ctx.trendPoints),
        }));
        const __VLS_17 = __VLS_16({
            points: (__VLS_ctx.trendPoints),
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "card-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "chart-sub" },
        });
        (__VLS_ctx.baselinePeriod ? __VLS_ctx.baselinePeriod.tooltipTitle + ' = 100' : 'baseline pending');
        /** @type {[typeof IndexChart, ]} */ ;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(IndexChart, new IndexChart({
            points: (__VLS_ctx.indexPoints),
        }));
        const __VLS_20 = __VLS_19({
            points: (__VLS_ctx.indexPoints),
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            ...{ class: "chart-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "card-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "chart-sub" },
        });
        if (__VLS_ctx.latestPeriod) {
            (__VLS_ctx.latestPeriod.tooltipTitle);
        }
        if (__VLS_ctx.latestPeriod) {
            (__VLS_ctx.formatCurrency(__VLS_ctx.latestPeriod.basket_total));
        }
        /** @type {[typeof ContributionChart, ]} */ ;
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent(ContributionChart, new ContributionChart({
            rows: (__VLS_ctx.contributionRows),
            basketTotal: (__VLS_ctx.latestPeriod?.basket_total ?? 0),
        }));
        const __VLS_23 = __VLS_22({
            rows: (__VLS_ctx.contributionRows),
            basketTotal: (__VLS_ctx.latestPeriod?.basket_total ?? 0),
        }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "card-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "chart-sub" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "legend-dot legend-dot--up" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "legend-dot legend-dot--down" },
        });
        /** @type {[typeof ItemChangeChart, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(ItemChangeChart, new ItemChangeChart({
            rows: (__VLS_ctx.itemChangeRows),
        }));
        const __VLS_26 = __VLS_25({
            rows: (__VLS_ctx.itemChangeRows),
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        if (__VLS_ctx.summary) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
                ...{ class: "card analyse-summary" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ class: "card-title" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (__VLS_ctx.summary.latestTooltip);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (__VLS_ctx.summary.latestTotal);
            if (__VLS_ctx.summary.vsBaseline) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                    ...{ class: (__VLS_ctx.summary.vsBaselineUp ? 'txt-up' : 'txt-down') },
                });
                (__VLS_ctx.summary.vsBaseline);
                (__VLS_ctx.summary.baselineLabel);
            }
            if (__VLS_ctx.summary.vsPrev) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                    ...{ class: (__VLS_ctx.summary.vsPrevUp ? 'txt-up' : 'txt-down') },
                });
                (__VLS_ctx.summary.vsPrev);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "analyse-meta" },
            });
            (__VLS_ctx.periodDays);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (__VLS_ctx.analysis.anchor_date ? __VLS_ctx.formatDate(__VLS_ctx.analysis.anchor_date) : '—');
            (__VLS_ctx.periodsAsc.length);
            (__VLS_ctx.periodsAsc.length === 1 ? '' : 's');
            if (__VLS_ctx.analysis.has_in_progress_period) {
                (__VLS_ctx.periodsAsc.length + 1);
            }
        }
    }
    if (__VLS_ctx.historiesError) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "error-state mt-4" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.historiesError);
    }
}
/** @type {__VLS_StyleScopedClasses['analyse']} */ ;
/** @type {__VLS_StyleScopedClasses['analyse-header']} */ ;
/** @type {__VLS_StyleScopedClasses['analyse-header-row']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['period-control']} */ ;
/** @type {__VLS_StyleScopedClasses['period-label']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['period-input']} */ ;
/** @type {__VLS_StyleScopedClasses['period-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['period-presets']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['period-preset']} */ ;
/** @type {__VLS_StyleScopedClasses['page-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-head']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-head']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-head']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-head']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot--up']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot--down']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['analyse-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['analyse-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RouterLink: RouterLink,
            MIN_PERIOD_DAYS: MIN_PERIOD_DAYS,
            MAX_PERIOD_DAYS: MAX_PERIOD_DAYS,
            StatTile: StatTile,
            BasketTotalChart: BasketTotalChart,
            IndexChart: IndexChart,
            ContributionChart: ContributionChart,
            ItemChangeChart: ItemChangeChart,
            formatCurrency: formatCurrency,
            formatDate: formatDate,
            PERIOD_PRESETS: PERIOD_PRESETS,
            periodDays: periodDays,
            periodDaysModel: periodDaysModel,
            setPeriodPreset: setPeriodPreset,
            historiesError: historiesError,
            analysis: analysis,
            periodsAsc: periodsAsc,
            latestPeriod: latestPeriod,
            baselinePeriod: baselinePeriod,
            isLoading: isLoading,
            hasAnyData: hasAnyData,
            tileBasket: tileBasket,
            tileIndex: tileIndex,
            tileBiggestMover: tileBiggestMover,
            tileCoverage: tileCoverage,
            trendPoints: trendPoints,
            indexPoints: indexPoints,
            contributionRows: contributionRows,
            itemChangeRows: itemChangeRows,
            summary: summary,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=AnalyseView.vue.js.map
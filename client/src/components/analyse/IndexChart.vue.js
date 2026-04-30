import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import { chartTheme } from './chartSetup';
const props = defineProps();
const theme = chartTheme();
const chartData = computed(() => {
    return {
        labels: props.points.map((p) => p.label),
        datasets: [
            {
                label: 'Index (baseline = 100)',
                data: props.points.map((p) => p.index_value),
                borderColor: theme.primary,
                backgroundColor: theme.primary + '33',
                pointRadius: props.points.map((p) => (p.isBaseline ? 6 : 3)),
                pointBackgroundColor: props.points.map((p) => p.isBaseline
                    ? theme.warning
                    : p.index_value >= 100
                        ? theme.danger
                        : theme.success),
                borderWidth: 2.5,
                fill: true,
                tension: 0.25,
            },
        ],
    };
});
const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                title: (ctxs) => {
                    const i = ctxs[0]?.dataIndex ?? 0;
                    return props.points[i]?.tooltipTitle ?? props.points[i]?.label ?? '';
                },
                label: (ctx) => {
                    const v = ctx.parsed.y;
                    const pct = (v - 100).toFixed(1);
                    const sign = v >= 100 ? '+' : '';
                    return `Index ${v.toFixed(1)} (${sign}${pct}% vs P1)`;
                },
            },
        },
    },
    scales: {
        y: {
            grid: { color: theme.border },
            ticks: {
                callback: function (v) {
                    return Number(v).toFixed(0);
                },
            },
        },
        x: { grid: { display: false } },
    },
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-frame" },
});
if (props.points.length > 0) {
    const __VLS_0 = {}.Line;
    /** @type {[typeof __VLS_components.Line, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        data: (__VLS_ctx.chartData),
        options: (__VLS_ctx.chartOptions),
    }));
    const __VLS_2 = __VLS_1({
        data: (__VLS_ctx.chartData),
        options: (__VLS_ctx.chartOptions),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-empty" },
    });
}
/** @type {__VLS_StyleScopedClasses['chart-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-empty']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Line: Line,
            chartData: chartData,
            chartOptions: chartOptions,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=IndexChart.vue.js.map
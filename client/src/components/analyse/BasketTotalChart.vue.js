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
                label: 'Basket total (NZD)',
                data: props.points.map((p) => p.basket_total),
                borderColor: theme.primary,
                backgroundColor: theme.primary + '22',
                pointBackgroundColor: props.points.map((p) => p.isBaseline ? theme.warning : theme.primary),
                pointRadius: props.points.map((p) => (p.isBaseline ? 6 : 4)),
                pointHoverRadius: 7,
                borderWidth: 2.5,
                tension: 0.25,
                fill: true,
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
                label: (ctx) => `$${ctx.parsed.y.toFixed(2)}`,
            },
        },
    },
    scales: {
        y: {
            beginAtZero: false,
            ticks: {
                callback: function (v) {
                    return '$' + v;
                },
            },
            grid: { color: theme.border },
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
//# sourceMappingURL=BasketTotalChart.vue.js.map
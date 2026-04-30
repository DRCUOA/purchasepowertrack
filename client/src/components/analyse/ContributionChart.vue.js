import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { chartTheme } from './chartSetup';
const props = defineProps();
const theme = chartTheme();
// Sort largest -> smallest, then reverse for Chart.js horizontal-bar (top = first).
const sorted = computed(() => [...props.rows].sort((a, b) => b.line_total - a.line_total));
const chartData = computed(() => {
    const ordered = [...sorted.value].reverse();
    return {
        labels: ordered.map((r) => r.name),
        datasets: [
            {
                label: 'Monthly $ contribution',
                data: ordered.map((r) => r.line_total),
                backgroundColor: theme.primary,
                borderRadius: 4,
                barThickness: 18,
            },
        ],
    };
});
const chartOptions = computed(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (ctx) => {
                    const v = ctx.parsed.x;
                    const pct = props.basketTotal
                        ? ((v / props.basketTotal) * 100).toFixed(1) + '%'
                        : '';
                    return `$${v.toFixed(2)}  (${pct} of basket)`;
                },
            },
        },
    },
    scales: {
        x: {
            grid: { color: theme.border },
            ticks: {
                callback: function (v) {
                    return '$' + v;
                },
            },
        },
        y: { grid: { display: false } },
    },
}));
const dynamicHeight = computed(() => Math.max(220, sorted.value.length * 32));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-frame" },
    ...{ style: ({ height: __VLS_ctx.dynamicHeight + 'px' }) },
});
if (__VLS_ctx.sorted.length > 0) {
    const __VLS_0 = {}.Bar;
    /** @type {[typeof __VLS_components.Bar, ]} */ ;
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
            Bar: Bar,
            sorted: sorted,
            chartData: chartData,
            chartOptions: chartOptions,
            dynamicHeight: dynamicHeight,
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
//# sourceMappingURL=ContributionChart.vue.js.map
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { chartTheme } from './chartSetup';
const props = defineProps();
const theme = chartTheme();
// Sort by pct change ascending so the most-deflated items sit at the bottom
// of the chart and the most-inflated at the top (Chart.js horizontal-bar
// renders the first label at the top by default after we reverse).
const sorted = computed(() => [...props.rows].sort((a, b) => a.pct_change - b.pct_change));
const chartData = computed(() => {
    const ordered = sorted.value;
    return {
        labels: ordered.map((r) => r.name),
        datasets: [
            {
                label: '% change vs baseline',
                data: ordered.map((r) => r.pct_change),
                backgroundColor: ordered.map((r) => r.pct_change > 0 ? theme.danger : r.pct_change < 0 ? theme.success : theme.textSecondary),
                borderRadius: 4,
                barThickness: 16,
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
                    const sign = v > 0 ? '+' : '';
                    return `${sign}${v.toFixed(1)}% vs baseline`;
                },
            },
        },
    },
    scales: {
        x: {
            grid: {
                color: (ctx) => ctx.tick.value === 0 ? theme.text : theme.border,
                lineWidth: (ctx) => ctx.tick.value === 0 ? 1.5 : 1,
            },
            ticks: {
                callback: function (v) {
                    return v + '%';
                },
            },
        },
        y: { grid: { display: false } },
    },
}));
const dynamicHeight = computed(() => Math.max(220, sorted.value.length * 28));
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
//# sourceMappingURL=ItemChangeChart.vue.js.map
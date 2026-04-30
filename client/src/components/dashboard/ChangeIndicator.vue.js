import { computed } from 'vue';
import { useFormatters } from '../../composables/useFormatters';
const props = defineProps();
const { formatChange } = useFormatters();
const change = computed(() => formatChange(props.currentValue, props.previousValue));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "change-indicator card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "change-indicator-label" },
});
(props.label);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "change-indicator-value" },
    ...{ class: ({
            'change-indicator-value--up': __VLS_ctx.change.direction === 'up',
            'change-indicator-value--down': __VLS_ctx.change.direction === 'down',
            'change-indicator-value--flat': __VLS_ctx.change.direction === 'flat',
        }) },
});
if (__VLS_ctx.change.direction === 'up') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "change-arrow" },
        'aria-label': "up",
    });
}
else if (__VLS_ctx.change.direction === 'down') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "change-arrow" },
        'aria-label': "down",
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "change-arrow" },
        'aria-label': "flat",
    });
}
(__VLS_ctx.change.value);
/** @type {__VLS_StyleScopedClasses['change-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['change-indicator-label']} */ ;
/** @type {__VLS_StyleScopedClasses['change-indicator-value']} */ ;
/** @type {__VLS_StyleScopedClasses['change-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['change-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['change-arrow']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            change: change,
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
//# sourceMappingURL=ChangeIndicator.vue.js.map
import { useFormatters } from '../../composables/useFormatters';
const props = defineProps();
const { formatCurrency } = useFormatters();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "basket-total card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "basket-total-label" },
});
if (props.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "basket-total-value basket-total-value--loading" },
    });
}
else if (props.total !== null) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "basket-total-value" },
    });
    (__VLS_ctx.formatCurrency(props.total));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "basket-total-value basket-total-value--empty" },
    });
}
/** @type {__VLS_StyleScopedClasses['basket-total']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['basket-total-label']} */ ;
/** @type {__VLS_StyleScopedClasses['basket-total-value']} */ ;
/** @type {__VLS_StyleScopedClasses['basket-total-value--loading']} */ ;
/** @type {__VLS_StyleScopedClasses['basket-total-value']} */ ;
/** @type {__VLS_StyleScopedClasses['basket-total-value']} */ ;
/** @type {__VLS_StyleScopedClasses['basket-total-value--empty']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatCurrency: formatCurrency,
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
//# sourceMappingURL=BasketTotal.vue.js.map
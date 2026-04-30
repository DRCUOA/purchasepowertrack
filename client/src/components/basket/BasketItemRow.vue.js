import { computed } from 'vue';
import { useFormatters } from '../../composables/useFormatters';
import QuantityEditor from './QuantityEditor.vue';
const props = defineProps();
const emit = defineEmits();
const { formatCurrency } = useFormatters();
const qty = computed(() => props.item.monthly_quantity ?? 0);
const month = computed(() => props.item.effective_month ?? new Date().toISOString().slice(0, 7));
const lineTotal = computed(() => {
    if (props.price === null)
        return null;
    return qty.value * props.price;
});
function onSave(newQty) {
    emit('update-quantity', props.item.id, month.value, newQty);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
(__VLS_ctx.item.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
(__VLS_ctx.item.unit_label);
__VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
    ...{ class: "num" },
});
if (__VLS_ctx.price !== null) {
    (__VLS_ctx.formatCurrency(__VLS_ctx.price));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-muted" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
    ...{ class: "num" },
});
/** @type {[typeof QuantityEditor, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(QuantityEditor, new QuantityEditor({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onSave': {} },
    modelValue: (__VLS_ctx.qty),
    month: (__VLS_ctx.month),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onSave': {} },
    modelValue: (__VLS_ctx.qty),
    month: (__VLS_ctx.month),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    'onUpdate:modelValue': ((v) => __VLS_ctx.onSave(v))
};
const __VLS_7 = {
    onSave: (() => { })
};
var __VLS_2;
__VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
    ...{ class: "num" },
});
if (__VLS_ctx.lineTotal !== null) {
    (__VLS_ctx.formatCurrency(__VLS_ctx.lineTotal));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-muted" },
    });
}
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            QuantityEditor: QuantityEditor,
            formatCurrency: formatCurrency,
            qty: qty,
            month: month,
            lineTotal: lineTotal,
            onSave: onSave,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=BasketItemRow.vue.js.map
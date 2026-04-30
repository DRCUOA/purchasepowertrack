import { useFormatters } from '../../composables/useFormatters';
const __VLS_props = defineProps();
const { formatCurrency, formatDate } = useFormatters();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "obs-card card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "obs-card-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "obs-shop" },
});
(__VLS_ctx.observation.shop_name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "badge" },
    ...{ class: ({
            'badge-accepted': __VLS_ctx.observation.review_status === 'accepted',
            'badge-rejected': __VLS_ctx.observation.review_status === 'rejected',
            'badge-pending': __VLS_ctx.observation.review_status === 'pending',
        }) },
});
(__VLS_ctx.observation.review_status);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "obs-title" },
});
(__VLS_ctx.observation.raw_title);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "obs-details" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "obs-price" },
});
(__VLS_ctx.formatCurrency(__VLS_ctx.observation.raw_price));
if (__VLS_ctx.observation.unit_text) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "obs-unit" },
    });
    (__VLS_ctx.observation.unit_text);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "obs-meta" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.formatDate(__VLS_ctx.observation.observed_at));
if (__VLS_ctx.observation.is_special) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "badge badge-pending" },
    });
}
if (__VLS_ctx.observation.is_member_price) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "badge badge-pending" },
    });
}
if (__VLS_ctx.observation.review_reason) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "obs-reason" },
    });
    (__VLS_ctx.observation.review_reason);
}
if (__VLS_ctx.observation.source_url) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
        href: (__VLS_ctx.observation.source_url),
        target: "_blank",
        rel: "noopener noreferrer",
        ...{ class: "obs-source" },
    });
}
/** @type {__VLS_StyleScopedClasses['obs-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['obs-card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['obs-shop']} */ ;
/** @type {__VLS_StyleScopedClasses['badge']} */ ;
/** @type {__VLS_StyleScopedClasses['obs-title']} */ ;
/** @type {__VLS_StyleScopedClasses['obs-details']} */ ;
/** @type {__VLS_StyleScopedClasses['obs-price']} */ ;
/** @type {__VLS_StyleScopedClasses['obs-unit']} */ ;
/** @type {__VLS_StyleScopedClasses['obs-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['badge']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-pending']} */ ;
/** @type {__VLS_StyleScopedClasses['badge']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-pending']} */ ;
/** @type {__VLS_StyleScopedClasses['obs-reason']} */ ;
/** @type {__VLS_StyleScopedClasses['obs-source']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatCurrency: formatCurrency,
            formatDate: formatDate,
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
//# sourceMappingURL=ObservationCard.vue.js.map
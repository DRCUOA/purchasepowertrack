const __VLS_props = withDefaults(defineProps(), { sublabel: '', delta: null, direction: null, inverseTrend: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({ sublabel: '', delta: null, direction: null, inverseTrend: true });
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-tile card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
(__VLS_ctx.label);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.value);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-foot" },
});
if (__VLS_ctx.delta !== null && __VLS_ctx.delta !== '') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-delta" },
        ...{ class: ({
                'stat-delta--up-bad': __VLS_ctx.inverseTrend && __VLS_ctx.direction === 'up',
                'stat-delta--down-good': __VLS_ctx.inverseTrend && __VLS_ctx.direction === 'down',
                'stat-delta--up-good': !__VLS_ctx.inverseTrend && __VLS_ctx.direction === 'up',
                'stat-delta--down-bad': !__VLS_ctx.inverseTrend && __VLS_ctx.direction === 'down',
                'stat-delta--flat': __VLS_ctx.direction === 'flat' || __VLS_ctx.direction === null,
            }) },
    });
    if (__VLS_ctx.direction === 'up') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            'aria-hidden': "true",
        });
    }
    else if (__VLS_ctx.direction === 'down') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            'aria-hidden': "true",
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            'aria-hidden': "true",
        });
    }
    (__VLS_ctx.delta);
}
if (__VLS_ctx.sublabel) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-sublabel" },
    });
    (__VLS_ctx.sublabel);
}
/** @type {__VLS_StyleScopedClasses['stat-tile']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-foot']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-delta']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-sublabel']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=StatTile.vue.js.map
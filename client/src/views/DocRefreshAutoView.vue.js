import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { marked } from 'marked';
import readme from '../../../README_Refresh_Auto.md?raw';
const readmeHtml = computed(() => marked.parse(readme));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "doc-refresh" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "doc-refresh-header" },
});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: ({ name: 'operations' }),
    ...{ class: "doc-back" },
}));
const __VLS_2 = __VLS_1({
    to: ({ name: 'operations' }),
    ...{ class: "doc-back" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-sub" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "doc-refresh-body" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "doc-md" },
});
__VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.readmeHtml) }, null, null);
/** @type {__VLS_StyleScopedClasses['doc-refresh']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-refresh-header']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-back']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-refresh-body']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-md']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RouterLink: RouterLink,
            readmeHtml: readmeHtml,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=DocRefreshAutoView.vue.js.map
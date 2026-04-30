import { RouterLink } from 'vue-router';
const links = [
    { to: '/', label: 'Analyse' },
    { to: '/operations', label: 'Operations' },
    { to: '/basket', label: 'Basket Items' },
    { to: '/evidence', label: 'Price Evidence' },
    { to: '/flagged', label: 'Flagged Items' },
    { to: '/trends', label: 'Trends' },
    { to: '/history', label: 'History' },
    { to: '/settings', label: 'Settings' },
];
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['app-nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['app-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['app-nav-list']} */ ;
/** @type {__VLS_StyleScopedClasses['app-nav-link']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
    ...{ class: "app-nav" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "app-nav-list" },
});
for (const [link] of __VLS_getVForSourceType((__VLS_ctx.links))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (link.to),
        ...{ class: "app-nav-item" },
    });
    const __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: (link.to),
        ...{ class: "app-nav-link" },
        activeClass: "app-nav-link--active",
        exact: (link.to === '/'),
    }));
    const __VLS_2 = __VLS_1({
        to: (link.to),
        ...{ class: "app-nav-link" },
        activeClass: "app-nav-link--active",
        exact: (link.to === '/'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    (link.label);
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['app-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['app-nav-list']} */ ;
/** @type {__VLS_StyleScopedClasses['app-nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['app-nav-link']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RouterLink: RouterLink,
            links: links,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=AppNav.vue.js.map
import { onMounted, computed } from 'vue';
import { useBasketStore } from '../stores/basket';
import { usePricesStore } from '../stores/prices';
import { useFormatters } from '../composables/useFormatters';
import BasketItemRow from '../components/basket/BasketItemRow.vue';
const basket = useBasketStore();
const prices = usePricesStore();
const { formatCurrency } = useFormatters();
onMounted(() => {
    basket.load();
    prices.loadCurrentPrices();
});
const isLoading = computed(() => basket.loading || prices.loading);
const error = computed(() => basket.error || prices.error);
const grandTotal = computed(() => {
    let total = 0;
    let hasAny = false;
    for (const item of basket.items) {
        const price = prices.priceByItemKey.get(item.item_key);
        if (price !== undefined && item.monthly_quantity !== null) {
            total += price * item.monthly_quantity;
            hasAny = true;
        }
    }
    return hasAny ? total : null;
});
function getPrice(itemKey) {
    return prices.priceByItemKey.get(itemKey) ?? null;
}
async function onUpdateQuantity(id, month, qty) {
    await basket.setQuantity(id, month, qty);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "basket-items" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-state" },
    });
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.error);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isLoading))
                    return;
                if (!(__VLS_ctx.error))
                    return;
                __VLS_ctx.basket.load();
                __VLS_ctx.prices.loadCurrentPrices();
            } },
        ...{ class: "btn btn-secondary" },
    });
}
else if (__VLS_ctx.basket.items.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card table-wrap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "text-right" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "text-right" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "text-right" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.basket.items))) {
        /** @type {[typeof BasketItemRow, ]} */ ;
        // @ts-ignore
        const __VLS_0 = __VLS_asFunctionalComponent(BasketItemRow, new BasketItemRow({
            ...{ 'onUpdateQuantity': {} },
            key: (item.id),
            item: (item),
            price: (__VLS_ctx.getPrice(item.item_key)),
        }));
        const __VLS_1 = __VLS_0({
            ...{ 'onUpdateQuantity': {} },
            key: (item.id),
            item: (item),
            price: (__VLS_ctx.getPrice(item.item_key)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        let __VLS_3;
        let __VLS_4;
        let __VLS_5;
        const __VLS_6 = {
            onUpdateQuantity: (__VLS_ctx.onUpdateQuantity)
        };
        var __VLS_2;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tfoot, __VLS_intrinsicElements.tfoot)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
        colspan: "4",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
        ...{ class: "num" },
    });
    if (__VLS_ctx.grandTotal !== null) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.formatCurrency(__VLS_ctx.grandTotal));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "text-muted" },
        });
    }
}
/** @type {__VLS_StyleScopedClasses['basket-items']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['num']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BasketItemRow: BasketItemRow,
            basket: basket,
            prices: prices,
            formatCurrency: formatCurrency,
            isLoading: isLoading,
            error: error,
            grandTotal: grandTotal,
            getPrice: getPrice,
            onUpdateQuantity: onUpdateQuantity,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=BasketItemsView.vue.js.map
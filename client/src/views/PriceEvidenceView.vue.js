import { onMounted, ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getWeekStart } from '@basket/shared';
import { useBasketStore } from '../stores/basket';
import { usePricesStore } from '../stores/prices';
import ObservationCard from '../components/evidence/ObservationCard.vue';
import ReviewSummary from '../components/evidence/ReviewSummary.vue';
import { useFormatters } from '../composables/useFormatters';
const { formatDate } = useFormatters();
const route = useRoute();
const router = useRouter();
const basket = useBasketStore();
const prices = usePricesStore();
const selectedItemKey = ref('');
const selectedWeek = ref(getWeekStart(new Date()));
const availableWeeks = computed(() => {
    if (!selectedItemKey.value)
        return [];
    const history = prices.getHistory(selectedItemKey.value);
    if (!history || history.history.length === 0)
        return [selectedWeek.value];
    const weeks = history.history.map((h) => h.week_start);
    if (!weeks.includes(selectedWeek.value)) {
        weeks.unshift(selectedWeek.value);
    }
    return weeks;
});
onMounted(async () => {
    if (basket.items.length === 0) {
        await basket.load();
    }
    const paramKey = route.params.itemKey;
    if (paramKey) {
        selectedItemKey.value = paramKey;
        await prices.loadHistory(paramKey);
        loadEvidence(paramKey, selectedWeek.value);
    }
});
watch(selectedItemKey, async (key) => {
    if (key) {
        router.replace({ name: 'evidence-item', params: { itemKey: key } });
        await prices.loadHistory(key);
        const weeks = availableWeeks.value;
        if (weeks.length > 0 && !weeks.includes(selectedWeek.value)) {
            selectedWeek.value = weeks[0];
        }
        loadEvidence(key, selectedWeek.value);
    }
});
watch(selectedWeek, (week) => {
    if (selectedItemKey.value && week) {
        loadEvidence(selectedItemKey.value, week);
    }
});
function loadEvidence(itemKey, weekStart) {
    prices.loadEvidence(itemKey, weekStart);
}
const evidence = computed(() => {
    if (!selectedItemKey.value)
        return null;
    return prices.getEvidence(selectedItemKey.value, selectedWeek.value) ?? null;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "price-evidence" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "evidence-controls mb-6" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex-row" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "item-select",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    id: "item-select",
    value: (__VLS_ctx.selectedItemKey),
    ...{ class: "input" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
    disabled: true,
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.basket.items))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (item.item_key),
        value: (item.item_key),
    });
    (item.name);
    (item.unit_label);
}
if (__VLS_ctx.selectedItemKey) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "week-select",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        id: "week-select",
        value: (__VLS_ctx.selectedWeek),
        ...{ class: "input" },
        ...{ style: {} },
    });
    for (const [week] of __VLS_getVForSourceType((__VLS_ctx.availableWeeks))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: (week),
            value: (week),
        });
        (__VLS_ctx.formatDate(week));
    }
}
if (!__VLS_ctx.selectedItemKey) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
else if (__VLS_ctx.prices.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-state" },
    });
}
else if (__VLS_ctx.prices.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.prices.error);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.selectedItemKey))
                    return;
                if (!!(__VLS_ctx.prices.loading))
                    return;
                if (!(__VLS_ctx.prices.error))
                    return;
                __VLS_ctx.loadEvidence(__VLS_ctx.selectedItemKey, __VLS_ctx.selectedWeek);
            } },
        ...{ class: "btn btn-secondary" },
    });
}
else if (__VLS_ctx.evidence) {
    /** @type {[typeof ReviewSummary, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(ReviewSummary, new ReviewSummary({
        normalizedPrice: (__VLS_ctx.evidence.normalized_price),
        observationCount: (__VLS_ctx.evidence.observations.length),
        ...{ class: "mb-6" },
    }));
    const __VLS_1 = __VLS_0({
        normalizedPrice: (__VLS_ctx.evidence.normalized_price),
        observationCount: (__VLS_ctx.evidence.observations.length),
        ...{ class: "mb-6" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    if (__VLS_ctx.evidence.observations.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-state" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "grid-cards" },
        });
        for (const [obs] of __VLS_getVForSourceType((__VLS_ctx.evidence.observations))) {
            /** @type {[typeof ObservationCard, ]} */ ;
            // @ts-ignore
            const __VLS_3 = __VLS_asFunctionalComponent(ObservationCard, new ObservationCard({
                key: (obs.id),
                observation: (obs),
            }));
            const __VLS_4 = __VLS_3({
                key: (obs.id),
                observation: (obs),
            }, ...__VLS_functionalComponentArgsRest(__VLS_3));
        }
    }
}
/** @type {__VLS_StyleScopedClasses['price-evidence']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cards']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ObservationCard: ObservationCard,
            ReviewSummary: ReviewSummary,
            formatDate: formatDate,
            basket: basket,
            prices: prices,
            selectedItemKey: selectedItemKey,
            selectedWeek: selectedWeek,
            availableWeeks: availableWeeks,
            loadEvidence: loadEvidence,
            evidence: evidence,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=PriceEvidenceView.vue.js.map
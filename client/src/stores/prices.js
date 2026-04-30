import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchCurrentPrices, fetchPriceHistory, fetchPriceEvidence, } from '../api/client';
export const usePricesStore = defineStore('prices', () => {
    const currentPrices = ref(null);
    const historyCache = ref({});
    const evidenceCache = ref({});
    const loading = ref(false);
    const error = ref(null);
    const priceByItemKey = computed(() => {
        const map = new Map();
        if (currentPrices.value) {
            for (const p of currentPrices.value.prices) {
                map.set(p.item_key, p.canonical_unit_price);
            }
        }
        return map;
    });
    async function loadCurrentPrices() {
        loading.value = true;
        error.value = null;
        try {
            currentPrices.value = await fetchCurrentPrices();
        }
        catch (err) {
            error.value =
                err instanceof Error ? err.message : 'Failed to load prices';
        }
        finally {
            loading.value = false;
        }
    }
    async function loadHistory(itemKey) {
        loading.value = true;
        error.value = null;
        try {
            historyCache.value[itemKey] = await fetchPriceHistory(itemKey);
        }
        catch (err) {
            error.value =
                err instanceof Error ? err.message : 'Failed to load price history';
        }
        finally {
            loading.value = false;
        }
    }
    async function loadEvidence(itemKey, weekStart) {
        loading.value = true;
        error.value = null;
        try {
            const cacheKey = weekStart ? `${itemKey}:${weekStart}` : itemKey;
            evidenceCache.value[cacheKey] = await fetchPriceEvidence(itemKey, weekStart);
        }
        catch (err) {
            error.value =
                err instanceof Error ? err.message : 'Failed to load evidence';
        }
        finally {
            loading.value = false;
        }
    }
    function getHistory(itemKey) {
        return historyCache.value[itemKey];
    }
    function getEvidence(itemKey, weekStart) {
        const key = weekStart ? `${itemKey}:${weekStart}` : itemKey;
        return evidenceCache.value[key];
    }
    return {
        currentPrices,
        historyCache,
        evidenceCache,
        loading,
        error,
        priceByItemKey,
        loadCurrentPrices,
        loadHistory,
        loadEvidence,
        getHistory,
        getEvidence,
    };
});
//# sourceMappingURL=prices.js.map
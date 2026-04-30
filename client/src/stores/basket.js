import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchBasketItems, updateQuantity } from '../api/client';
export const useBasketStore = defineStore('basket', () => {
    const items = ref([]);
    const loading = ref(false);
    const error = ref(null);
    async function load() {
        loading.value = true;
        error.value = null;
        try {
            items.value = await fetchBasketItems();
        }
        catch (err) {
            error.value =
                err instanceof Error ? err.message : 'Failed to load basket items';
        }
        finally {
            loading.value = false;
        }
    }
    async function setQuantity(id, month, qty) {
        error.value = null;
        try {
            await updateQuantity(id, {
                monthly_quantity: qty,
                effective_month: month,
            });
            const item = items.value.find((i) => i.id === id);
            if (item) {
                item.monthly_quantity = qty;
                item.effective_month = month;
            }
        }
        catch (err) {
            error.value =
                err instanceof Error ? err.message : 'Failed to update quantity';
            throw err;
        }
    }
    return { items, loading, error, load, setQuantity };
});
//# sourceMappingURL=basket.js.map
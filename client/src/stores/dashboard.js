import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchDashboard } from '../api/client';
export const useDashboardStore = defineStore('dashboard', () => {
    const data = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const changeVsPreviousPct = computed(() => data.value?.change_vs_previous_pct ?? null);
    const changeVsBaselinePct = computed(() => data.value?.change_vs_baseline_pct ?? null);
    const hasFlaggedItems = computed(() => (data.value?.flagged_items.length ?? 0) > 0);
    async function load() {
        loading.value = true;
        error.value = null;
        try {
            data.value = await fetchDashboard();
        }
        catch (err) {
            error.value =
                err instanceof Error ? err.message : 'Failed to load dashboard';
        }
        finally {
            loading.value = false;
        }
    }
    return {
        data,
        loading,
        error,
        changeVsPreviousPct,
        changeVsBaselinePct,
        hasFlaggedItems,
        load,
    };
});
//# sourceMappingURL=dashboard.js.map
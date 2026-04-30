import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchSettings } from '../api/client';
export const useSettingsStore = defineStore('settings', () => {
    const settings = ref(null);
    const loading = ref(false);
    const error = ref(null);
    async function load() {
        loading.value = true;
        error.value = null;
        try {
            settings.value = await fetchSettings();
        }
        catch (err) {
            error.value =
                err instanceof Error ? err.message : 'Failed to load settings';
        }
        finally {
            loading.value = false;
        }
    }
    return { settings, loading, error, load };
});
//# sourceMappingURL=settings.js.map
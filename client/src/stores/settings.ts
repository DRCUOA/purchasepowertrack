import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SettingsResponse } from '@basket/shared';
import { fetchSettings } from '../api/client';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<SettingsResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      settings.value = await fetchSettings();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load settings';
    } finally {
      loading.value = false;
    }
  }

  return { settings, loading, error, load };
});

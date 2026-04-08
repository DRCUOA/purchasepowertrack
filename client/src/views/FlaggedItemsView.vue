<script setup lang="ts">
import { onMounted } from 'vue';
import { useDashboardStore } from '../stores/dashboard';
import FlaggedItems from '../components/dashboard/FlaggedItems.vue';

const dashboard = useDashboardStore();

onMounted(() => {
  if (!dashboard.data) {
    dashboard.load();
  }
});
</script>

<template>
  <div class="flagged-view">
    <h2 class="page-title">Flagged Items</h2>

    <div v-if="dashboard.loading" class="loading-state">Loading flagged items...</div>

    <div v-else-if="dashboard.error" class="error-state">
      <p>{{ dashboard.error }}</p>
      <button class="btn btn-secondary" @click="dashboard.load()">Retry</button>
    </div>

    <template v-else-if="dashboard.data">
      <p class="flagged-subtitle">
        Items that need attention — missing price data or insufficient observations.
      </p>
      <FlaggedItems :items="dashboard.data.flagged_items" class="mt-4" />
    </template>

    <div v-else class="empty-state">
      <p>No data available yet. Run a refresh from the Dashboard first.</p>
    </div>
  </div>
</template>

<style scoped>
.flagged-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: calc(-1 * var(--space-4));
  margin-bottom: var(--space-2);
}
</style>

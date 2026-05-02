<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useDashboardStore } from '../stores/dashboard';
import { triggerRefresh, triggerSnapshot } from '../api/client';
import type { RefreshRunResponse, SnapshotRunResponse } from '@basket/shared';
import { useFormatters } from '../composables/useFormatters';
import BasketTotal from '../components/dashboard/BasketTotal.vue';
import ChangeIndicator from '../components/dashboard/ChangeIndicator.vue';
import LogConsole from '../components/dashboard/LogConsole.vue';

const dashboard = useDashboardStore();
const { formatDate, formatMonth } = useFormatters();

const refreshing = ref(false);
const refreshResult = ref<RefreshRunResponse | null>(null);
const refreshError = ref<string | null>(null);

const snapshotting = ref(false);
const snapshotResult = ref<SnapshotRunResponse | null>(null);
const snapshotError = ref<string | null>(null);

onMounted(() => {
  dashboard.load();
});

async function runRefresh() {
  refreshing.value = true;
  refreshResult.value = null;
  refreshError.value = null;
  try {
    refreshResult.value = await triggerRefresh();
    dashboard.load();
  } catch (err) {
    refreshError.value = err instanceof Error ? err.message : 'Refresh failed';
  } finally {
    refreshing.value = false;
  }
}

async function runSnapshot() {
  snapshotting.value = true;
  snapshotResult.value = null;
  snapshotError.value = null;
  try {
    snapshotResult.value = await triggerSnapshot();
    dashboard.load();
  } catch (err) {
    snapshotError.value = err instanceof Error ? err.message : 'Snapshot failed';
  } finally {
    snapshotting.value = false;
  }
}
</script>

<template>
  <div class="dashboard">
    <h2 class="page-title">Dashboard</h2>

    <div v-if="dashboard.loading" class="loading-state">Loading dashboard...</div>

    <div v-else-if="dashboard.error" class="error-state">
      <p>{{ dashboard.error }}</p>
      <button class="btn btn-secondary" @click="dashboard.load()">Retry</button>
    </div>

    <template v-else-if="dashboard.data">
      <div class="dashboard-summary">
        <BasketTotal
          :total="dashboard.data.current_basket_total"
          :loading="dashboard.loading"
        />
        <ChangeIndicator
          label="vs Previous Month"
          :current-value="dashboard.data.current_basket_total"
          :previous-value="dashboard.data.previous_month_total"
        />
        <ChangeIndicator
          label="vs Baseline"
          :current-value="dashboard.data.current_basket_total"
          :previous-value="dashboard.data.baseline_total"
        />
      </div>

      <div class="dashboard-meta card mt-4">
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Items tracked</span>
            <span class="meta-value">{{ dashboard.data.item_count }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Last refresh</span>
            <span class="meta-value">
              {{ dashboard.data.latest_refresh_date ? formatDate(dashboard.data.latest_refresh_date) : 'Never' }}
            </span>
          </div>
          <div v-if="dashboard.data.baseline_month" class="meta-item">
            <span class="meta-label">Baseline month</span>
            <span class="meta-value">{{ formatMonth(dashboard.data.baseline_month) }}</span>
          </div>
        </div>
      </div>

      <LogConsole class="mt-4" />

      <div class="dashboard-actions mt-6">
        <div class="flex-row">
          <button
            class="btn btn-primary"
            :disabled="refreshing"
            @click="runRefresh"
          >
            {{ refreshing ? 'Running...' : 'Run Refresh' }}
          </button>
          <button
            class="btn btn-secondary"
            :disabled="snapshotting"
            @click="runSnapshot"
          >
            {{ snapshotting ? 'Generating...' : 'Generate Snapshot' }}
          </button>
        </div>

        <p class="doc-link mt-3">
          <RouterLink :to="{ name: 'auto-refresh-readme' }">
            Preview auto-refresh setup guide
          </RouterLink>
          <span class="doc-link-hint">
            — macOS LaunchAgent, logs, troubleshooting (README_Refresh_Auto.md)
          </span>
        </p>

        <div v-if="refreshResult" class="action-result card mt-4">
          <p>
            Refresh <strong>{{ refreshResult.status }}</strong>
            — {{ refreshResult.observations_collected }} observations collected,
            {{ refreshResult.observations_reviewed }} reviewed
            ({{ refreshResult.duration_ms }}ms)
          </p>
          <ul v-if="refreshResult.errors.length > 0" class="action-errors">
            <li v-for="(err, i) in refreshResult.errors" :key="i">{{ err }}</li>
          </ul>
        </div>
        <div v-if="refreshError" class="error-state mt-4">
          <p>{{ refreshError }}</p>
        </div>

        <div v-if="snapshotResult" class="action-result card mt-4">
          <p>
            Snapshot <strong>{{ snapshotResult.status }}</strong>
            for {{ formatMonth(snapshotResult.snapshot_month) }}
            — {{ snapshotResult.items_snapshotted }} items, total {{ snapshotResult.basket_total.toFixed(2) }}
          </p>
        </div>
        <div v-if="snapshotError" class="error-state mt-4">
          <p>{{ snapshotError }}</p>
        </div>
      </div>
    </template>

    <div v-else class="empty-state">
      <p>No dashboard data yet.</p>
      <p>Run a refresh to get started.</p>
      <button class="btn btn-primary mt-4" :disabled="refreshing" @click="runRefresh">
        {{ refreshing ? 'Running...' : 'Run Refresh' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.dashboard-summary {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-4);
}

.meta-grid {
  display: flex;
  gap: var(--space-8);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.meta-label {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.meta-value {
  font-size: var(--text-base);
  font-weight: 600;
}

.doc-link {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.doc-link-hint {
  color: var(--color-text-muted);
}

.action-result {
  font-size: var(--text-sm);
}

.action-errors {
  list-style: disc;
  padding-left: var(--space-6);
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-danger);
}

@media (max-width: 768px) {
  .dashboard-summary {
    grid-template-columns: 1fr;
  }

  .meta-grid {
    flex-direction: column;
    gap: var(--space-4);
  }
}
</style>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import type { RunHistoryResponse, RunHistoryEntry, RunHistoryItemSnapshot } from '@basket/shared';
import { fetchRunHistory, deleteRunHistory } from '../api/client';
import { useFormatters } from '../composables/useFormatters';

const { formatCurrency, formatDateTime } = useFormatters();

const data = ref<RunHistoryResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const expandedRunId = ref<number | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    data.value = await fetchRunHistory();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load history';
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function toggleExpand(id: number) {
  expandedRunId.value = expandedRunId.value === id ? null : id;
}

const previousRunMap = computed(() => {
  const map = new Map<number, RunHistoryEntry>();
  if (!data.value) return map;
  const runs = data.value.runs;
  for (let i = 0; i < runs.length - 1; i++) {
    map.set(runs[i].id, runs[i + 1]);
  }
  return map;
});

function basketDelta(run: RunHistoryEntry): { text: string; cls: string } | null {
  const prev = previousRunMap.value.get(run.id);
  if (!prev || run.basket_total === null || prev.basket_total === null) return null;
  if (prev.basket_total === 0) return null;
  const diff = run.basket_total - prev.basket_total;
  const pct = (diff / prev.basket_total) * 100;
  if (Math.abs(pct) < 0.05) return null;
  const sign = diff > 0 ? '+' : '';
  return {
    text: `${sign}${formatCurrency(diff)} (${sign}${pct.toFixed(1)}%)`,
    cls: diff > 0 ? 'delta-up' : 'delta-down',
  };
}

function itemDelta(
  run: RunHistoryEntry,
  item: RunHistoryItemSnapshot,
): { text: string; cls: string } | null {
  const prev = previousRunMap.value.get(run.id);
  if (!prev) return null;
  const prevItem = prev.items.find((p) => p.item_key === item.item_key);
  if (!prevItem || prevItem.unit_price === 0) return null;
  const diff = item.unit_price - prevItem.unit_price;
  const pct = (diff / prevItem.unit_price) * 100;
  if (Math.abs(pct) < 0.05) return null;
  const sign = diff > 0 ? '+' : '';
  return {
    text: `${sign}${pct.toFixed(1)}%`,
    cls: diff > 0 ? 'delta-up' : 'delta-down',
  };
}

function runTypeLabel(type: string): string {
  return type === 'refresh' ? 'Price Refresh' : 'Monthly Snapshot';
}

function statusClass(status: string): string {
  if (status === 'completed') return 'badge-accepted';
  if (status === 'failed') return 'badge-rejected';
  return 'badge-pending';
}

function durationText(run: RunHistoryEntry): string {
  const ms = new Date(run.completed_at).getTime() - new Date(run.started_at).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const deleting = ref<number | null>(null);

async function deleteRun(id: number, event: Event) {
  event.stopPropagation();
  if (!confirm('Delete this run from history?')) return;
  deleting.value = id;
  try {
    await deleteRunHistory(id);
    if (data.value) {
      data.value = { runs: data.value.runs.filter((r) => r.id !== id) };
    }
    if (expandedRunId.value === id) expandedRunId.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete run';
  } finally {
    deleting.value = null;
  }
}
</script>

<template>
  <div class="history">
    <h2 class="page-title">Run History</h2>

    <div v-if="loading && !data" class="loading-state">Loading history...</div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="load">Retry</button>
    </div>

    <template v-else-if="data && data.runs.length > 0">
      <p class="history-subtitle">
        {{ data.runs.length }} run{{ data.runs.length === 1 ? '' : 's' }} recorded.
        Click a row to see per-item detail.
      </p>

      <div class="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Type</th>
              <th>Status</th>
              <th class="text-right">Items</th>
              <th class="text-right">Basket Total</th>
              <th class="text-right">Change</th>
              <th class="text-right">Duration</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="run in data.runs" :key="run.id">
              <tr class="run-row" :class="{ 'run-row--expanded': expandedRunId === run.id }" @click="toggleExpand(run.id)">
                <td class="run-time">{{ formatDateTime(run.started_at) }}</td>
                <td>
                  <span class="run-type" :class="'run-type--' + run.run_type">
                    {{ runTypeLabel(run.run_type) }}
                  </span>
                </td>
                <td><span class="badge" :class="statusClass(run.status)">{{ run.status }}</span></td>
                <td class="num">{{ run.item_count }}</td>
                <td class="num">{{ run.basket_total !== null ? formatCurrency(run.basket_total) : '—' }}</td>
                <td class="num">
                  <span v-if="basketDelta(run)" :class="basketDelta(run)!.cls" class="delta-text">
                    {{ basketDelta(run)!.text }}
                  </span>
                  <span v-else class="text-muted">—</span>
                </td>
                <td class="num">{{ durationText(run) }}</td>
                <td class="delete-cell">
                  <button
                    class="btn-delete"
                    :disabled="deleting === run.id"
                    title="Delete run"
                    @click="deleteRun(run.id, $event)"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4M6.667 7.333v4M9.333 7.333v4" />
                      <path d="M3.333 4h9.334l-.667 9.333a1.333 1.333 0 0 1-1.333 1.334H5.333A1.333 1.333 0 0 1 4 13.333L3.333 4Z" />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr v-if="expandedRunId === run.id" class="detail-row">
                <td colspan="8">
                  <div class="detail-panel">
                    <div v-if="run.run_type === 'refresh' && run.summary" class="detail-meta mb-4">
                      <span v-if="(run.summary as any).observations_collected != null">
                        {{ (run.summary as any).observations_collected }} observations collected
                      </span>
                      <span v-if="(run.summary as any).observations_reviewed != null">
                        · {{ (run.summary as any).observations_reviewed }} reviewed
                      </span>
                    </div>
                    <div v-if="run.run_type === 'snapshot' && run.summary" class="detail-meta mb-4">
                      <span v-if="(run.summary as any).snapshot_month">
                        Snapshot month: {{ (run.summary as any).snapshot_month }}
                      </span>
                    </div>
                    <table v-if="run.items.length > 0" class="detail-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th class="text-right">Unit Price</th>
                          <th class="text-right">vs Prev</th>
                          <th v-if="run.run_type === 'snapshot'" class="text-right">Qty</th>
                          <th v-if="run.run_type === 'snapshot'" class="text-right">Line Total</th>
                          <th v-if="run.run_type === 'refresh'" class="text-right">Obs</th>
                          <th v-if="run.run_type === 'refresh'" class="text-right">Accepted</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in run.items" :key="item.item_key">
                          <td>{{ item.name }}</td>
                          <td class="num">{{ formatCurrency(item.unit_price) }}</td>
                          <td class="num">
                            <span v-if="itemDelta(run, item)" :class="itemDelta(run, item)!.cls" class="delta-text">
                              {{ itemDelta(run, item)!.text }}
                            </span>
                            <span v-else class="text-muted">—</span>
                          </td>
                          <td v-if="run.run_type === 'snapshot'" class="num">{{ item.quantity ?? '—' }}</td>
                          <td v-if="run.run_type === 'snapshot'" class="num">{{ item.line_total != null ? formatCurrency(item.line_total) : '—' }}</td>
                          <td v-if="run.run_type === 'refresh'" class="num">{{ item.observation_count ?? '—' }}</td>
                          <td v-if="run.run_type === 'refresh'" class="num">{{ item.accepted_count ?? '—' }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p v-else class="text-muted" style="font-size: var(--text-sm)">No item data recorded for this run.</p>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </template>

    <div v-else class="empty-state">
      <p>No run history yet.</p>
      <p>Run a price refresh or generate a snapshot from the Dashboard to start tracking movement.</p>
    </div>
  </div>
</template>

<style scoped>
.history-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.run-row {
  cursor: pointer;
  transition: background 0.1s;
}

.run-row:hover {
  background: var(--color-primary-light) !important;
}

.run-row--expanded {
  background: var(--color-bg);
}

.run-time {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.run-type {
  display: inline-block;
  padding: 2px var(--space-2);
  font-size: var(--text-xs);
  font-weight: 600;
  border-radius: var(--radius-sm);
  letter-spacing: 0.02em;
}

.run-type--refresh {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.run-type--snapshot {
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.detail-row > td {
  padding: 0 !important;
  border-bottom: 2px solid var(--color-border);
}

.detail-panel {
  padding: var(--space-4) var(--space-6);
  background: var(--color-bg);
}

.detail-meta {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.detail-meta span + span {
  margin-left: var(--space-1);
}

.detail-table {
  font-size: var(--text-xs);
}

.detail-table thead th {
  font-size: 0.65rem;
  padding: var(--space-2) var(--space-3);
  border-bottom-width: 1px;
}

.detail-table tbody td {
  padding: var(--space-1) var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
}

.delta-text {
  font-weight: 600;
  font-size: var(--text-xs);
  white-space: nowrap;
}

.delta-up {
  color: var(--color-danger);
}

.delta-down {
  color: var(--color-success);
}

.text-muted {
  color: var(--color-text-muted);
}

.delete-cell {
  width: 32px;
  text-align: center;
  padding-right: var(--space-3) !important;
}

.btn-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn-delete:hover:not(:disabled) {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.btn-delete:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>

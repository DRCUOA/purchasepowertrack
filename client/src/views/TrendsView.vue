<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import type { PriceHistoryResponse, TrendsResponse } from '@basket/shared';
import { useBasketStore } from '../stores/basket';
import { usePricesStore } from '../stores/prices';
import { useDashboardStore } from '../stores/dashboard';
import { fetchTrends } from '../api/client';
import { useFormatters } from '../composables/useFormatters';

const basket = useBasketStore();
const prices = usePricesStore();
const dashboard = useDashboardStore();
const { formatCurrency, formatDate, formatMonth, formatPercent } = useFormatters();

const selectedItemKey = ref<string>('');
const trendsData = ref<TrendsResponse | null>(null);
const trendsLoading = ref(false);
const trendsError = ref<string | null>(null);

async function loadTrends() {
  trendsLoading.value = true;
  trendsError.value = null;
  try {
    trendsData.value = await fetchTrends();
  } catch (err) {
    trendsError.value = err instanceof Error ? err.message : 'Failed to load trends';
  } finally {
    trendsLoading.value = false;
  }
}

onMounted(async () => {
  if (!dashboard.data) await dashboard.load();
  if (basket.items.length === 0) await basket.load();
  await Promise.all([prices.loadCurrentPrices(), loadTrends()]);
});

const priceEntries = computed(() => {
  if (!prices.currentPrices) return [];
  return prices.currentPrices.prices;
});

const itemHistory = computed((): PriceHistoryResponse | undefined => {
  if (!selectedItemKey.value) return undefined;
  return prices.getHistory(selectedItemKey.value);
});

function loadItemHistory() {
  if (selectedItemKey.value) {
    prices.loadHistory(selectedItemKey.value);
  }
}

const baselineMonth = computed(() => dashboard.data?.baseline_month ?? null);

function indexClass(value: number): string {
  if (value > 100) return 'index-up';
  if (value < 100) return 'index-down';
  return '';
}

function pctDelta(current: number, previous: number): { text: string; cls: string } | null {
  if (!previous) return null;
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.05) return null;
  const sign = pct > 0 ? '+' : '';
  return {
    text: `${sign}${pct.toFixed(1)}%`,
    cls: pct > 0 ? 'delta-up' : 'delta-down',
  };
}
</script>

<template>
  <div class="trends">
    <h2 class="page-title">Trends</h2>

    <div v-if="prices.loading && !prices.currentPrices" class="loading-state">Loading trends data...</div>

    <div v-else-if="prices.error" class="error-state">
      <p>{{ prices.error }}</p>
      <button class="btn btn-secondary" @click="prices.loadCurrentPrices()">Retry</button>
    </div>

    <template v-else>
      <section class="card mb-6">
        <h3 class="card-title">Current Prices</h3>
        <div v-if="priceEntries.length === 0" class="empty-state">
          <p>No price data yet. Run a refresh to collect prices.</p>
        </div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Unit</th>
                <th class="text-right">Price</th>
                <th class="text-right">Observations</th>
                <th class="text-right">Accepted</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in priceEntries" :key="entry.item_key">
                <td>{{ entry.name }}</td>
                <td>{{ entry.unit_label }}</td>
                <td class="num">{{ formatCurrency(entry.canonical_unit_price) }}</td>
                <td class="num">{{ entry.observation_count }}</td>
                <td class="num">{{ entry.accepted_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="trendsData && trendsData.index_series.length > 0" class="card mb-6">
        <h3 class="card-title">Monthly Basket Index</h3>
        <p class="index-subtitle">
          Relative to {{ trendsData.baseline_month ? formatMonth(trendsData.baseline_month) : 'baseline' }} = 100
        </p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th class="text-right">Basket Total</th>
                <th class="text-right">Index</th>
                <th class="text-right">Items</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(point, i) in trendsData.index_series"
                :key="point.snapshot_month"
                :class="{ 'row-baseline': point.snapshot_month === trendsData.baseline_month }"
              >
                <td>
                  {{ formatMonth(point.snapshot_month) }}
                  <span v-if="point.snapshot_month === trendsData.baseline_month" class="badge badge-baseline">baseline</span>
                </td>
                <td class="num">
                  {{ formatCurrency(trendsData.months[i]?.basket_total ?? 0) }}
                  <sup
                    v-if="i < trendsData.index_series.length - 1 && trendsData.months[i] && trendsData.months[i + 1] && pctDelta(trendsData.months[i]!.basket_total, trendsData.months[i + 1]!.basket_total)"
                    :class="pctDelta(trendsData.months[i]!.basket_total, trendsData.months[i + 1]!.basket_total)!.cls"
                    class="delta"
                  >{{ pctDelta(trendsData.months[i]!.basket_total, trendsData.months[i + 1]!.basket_total)!.text }}</sup>
                </td>
                <td class="num" :class="indexClass(point.index_value)">{{ point.index_value.toFixed(1) }}</td>
                <td class="num">{{ trendsData.months[i]?.item_count ?? 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card mb-6">
        <div class="card-header">
          <h3 class="card-title">Per-Item Price History</h3>
        </div>

        <div class="flex-row mb-4">
          <select
            v-model="selectedItemKey"
            class="input"
            style="max-width: 20rem"
            @change="loadItemHistory"
          >
            <option value="" disabled>Choose an item...</option>
            <option
              v-for="item in basket.items"
              :key="item.item_key"
              :value="item.item_key"
            >
              {{ item.name }}
            </option>
          </select>
        </div>

        <div v-if="!selectedItemKey" class="empty-state">
          <p>Select an item to view its price history.</p>
        </div>
        <div v-else-if="prices.loading" class="loading-state">Loading history...</div>
        <div v-else-if="itemHistory && itemHistory.history.length > 0" class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Week</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Observations</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(h, idx) in itemHistory.history" :key="h.week_start">
                <td>{{ formatDate(h.week_start) }}</td>
                <td class="num">
                  {{ formatCurrency(h.canonical_unit_price) }}
                  <sup
                    v-if="idx < itemHistory.history.length - 1 && pctDelta(h.canonical_unit_price, itemHistory.history[idx + 1].canonical_unit_price)"
                    :class="pctDelta(h.canonical_unit_price, itemHistory.history[idx + 1].canonical_unit_price)!.cls"
                    class="delta"
                  >{{ pctDelta(h.canonical_unit_price, itemHistory.history[idx + 1].canonical_unit_price)!.text }}</sup>
                </td>
                <td class="num">{{ h.observation_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else-if="itemHistory" class="empty-state">
          <p>No price history for this item yet.</p>
        </div>
      </section>

      <section v-if="dashboard.data" class="card">
        <h3 class="card-title">Summary</h3>
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Current total</span>
            <span class="meta-value">
              {{ dashboard.data.current_basket_total !== null ? formatCurrency(dashboard.data.current_basket_total) : '—' }}
            </span>
          </div>
          <div v-if="baselineMonth" class="meta-item">
            <span class="meta-label">Baseline ({{ formatMonth(baselineMonth) }})</span>
            <span class="meta-value">
              {{ dashboard.data.baseline_total !== null ? formatCurrency(dashboard.data.baseline_total) : '—' }}
            </span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Change vs baseline</span>
            <span class="meta-value">
              {{ formatPercent(dashboard.data.change_vs_baseline_pct) }}
            </span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.index-subtitle {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
}

.index-up {
  color: var(--color-danger);
}

.index-down {
  color: var(--color-success);
}

.row-baseline {
  background: var(--color-primary-light);
}

.badge-baseline {
  display: inline-block;
  margin-left: var(--space-2);
  padding: 0 var(--space-2);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 9999px;
}

.meta-grid {
  display: flex;
  gap: var(--space-8);
  flex-wrap: wrap;
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
  font-size: var(--text-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.delta {
  margin-left: 4px;
  font-size: 0.7em;
  font-weight: 600;
  letter-spacing: 0.01em;
  vertical-align: super;
}

.delta-up {
  color: var(--color-danger);
}

.delta-down {
  color: var(--color-success);
}
</style>

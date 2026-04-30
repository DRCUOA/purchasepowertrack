<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useBasketStore } from '../stores/basket';
import { usePricesStore } from '../stores/prices';
import { useDashboardStore } from '../stores/dashboard';
import { useFormatters } from '../composables/useFormatters';
import {
  computePeriods,
  clampPeriodDays,
  DEFAULT_PERIOD_DAYS,
  MIN_PERIOD_DAYS,
  MAX_PERIOD_DAYS,
  type PeriodAnalysis,
} from '../composables/usePeriodAnalysis';

import StatTile from '../components/analyse/StatTile.vue';
import BasketTotalChart from '../components/analyse/BasketTotalChart.vue';
import IndexChart from '../components/analyse/IndexChart.vue';
import ContributionChart from '../components/analyse/ContributionChart.vue';
import ItemChangeChart from '../components/analyse/ItemChangeChart.vue';

const basket = useBasketStore();
const prices = usePricesStore();
const dashboard = useDashboardStore();
const { formatCurrency, formatDate } = useFormatters();

const ANALYSE_PERIOD_STORAGE_KEY = 'ppt.analyse.periodDays';
const PERIOD_PRESETS = [7, 14, 20, 30] as const;

function loadStoredPeriodDays(): number {
  try {
    const raw = localStorage.getItem(ANALYSE_PERIOD_STORAGE_KEY);
    if (raw === null) return DEFAULT_PERIOD_DAYS;
    return clampPeriodDays(parseInt(raw, 10));
  } catch {
    return DEFAULT_PERIOD_DAYS;
  }
}

function persistPeriodDays(n: number) {
  try {
    localStorage.setItem(ANALYSE_PERIOD_STORAGE_KEY, String(n));
  } catch {
    /* private mode / quota */
  }
}

const periodDays = ref(loadStoredPeriodDays());

const periodDaysModel = computed({
  get: () => periodDays.value,
  set: (v: number) => {
    if (typeof v !== 'number' || !Number.isFinite(v)) return;
    const c = clampPeriodDays(Math.floor(v));
    periodDays.value = c;
    persistPeriodDays(c);
  },
});

function setPeriodPreset(d: number) {
  const c = clampPeriodDays(d);
  periodDays.value = c;
  persistPeriodDays(c);
}

const historiesLoading = ref(false);
const historiesError = ref<string | null>(null);

/** Load weekly price history for every basket item in parallel. */
async function loadAllHistories() {
  historiesLoading.value = true;
  historiesError.value = null;
  try {
    await Promise.all(
      basket.items.map((it) => prices.loadHistory(it.item_key)),
    );
  } catch (err) {
    historiesError.value =
      err instanceof Error ? err.message : 'Failed to load price history';
  } finally {
    historiesLoading.value = false;
  }
}

onMounted(async () => {
  if (!dashboard.data) dashboard.load();
  if (!prices.currentPrices) prices.loadCurrentPrices();
  if (basket.items.length === 0) await basket.load();
  if (basket.items.length > 0) await loadAllHistories();
});

// If basket items load after the page, kick off histories then.
watch(
  () => basket.items.length,
  (n, prev) => {
    if (n > 0 && prev === 0) loadAllHistories();
  },
);

const analysis = computed<PeriodAnalysis>(() =>
  computePeriods(basket.items, prices.historyCache, periodDays.value),
);

const periodsAsc = computed(() => analysis.value.periods); // already chronological
const periodsDesc = computed(() => [...periodsAsc.value].reverse());
const latestPeriod = computed(() => periodsDesc.value[0] ?? null);
const previousPeriod = computed(() => periodsDesc.value[1] ?? null);
const baselinePeriod = computed(() => periodsAsc.value[0] ?? null);

const isLoading = computed(
  () =>
    (basket.loading && basket.items.length === 0) ||
    (historiesLoading.value && periodsAsc.value.length === 0),
);

const hasAnyData = computed(
  () =>
    periodsAsc.value.length > 0 ||
    (prices.currentPrices?.prices.length ?? 0) > 0,
);

// ------------------------------------------------------------------ helpers

function direction(
  current: number | null,
  previous: number | null,
): 'up' | 'down' | 'flat' | null {
  if (current === null || previous === null) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.005) return 'flat';
  return diff > 0 ? 'up' : 'down';
}

// ------------------------------------------------------------------ KPI tiles

const tileBasket = computed(() => {
  const cur = latestPeriod.value?.basket_total ?? null;
  const prev = previousPeriod.value?.basket_total ?? null;
  return {
    value: cur !== null ? formatCurrency(cur) : '—',
    sublabel: latestPeriod.value
      ? `${latestPeriod.value.label} basket cost`
      : 'no completed periods yet',
    delta:
      cur !== null && prev !== null && prev !== 0
        ? `${cur >= prev ? '+' : ''}${(((cur - prev) / prev) * 100).toFixed(1)}% PoP`
        : null,
    direction: direction(cur, prev),
  };
});

const tileIndex = computed(() => {
  const latest = latestPeriod.value;
  const baseline = baselinePeriod.value;
  if (!latest || !baseline) {
    return {
      value: '—',
      sublabel: 'no baseline period yet',
      delta: null,
      direction: null as 'up' | 'down' | 'flat' | null,
    };
  }
  // Annualise: extrapolate latest's compounded growth out to a full year.
  // Periods elapsed since baseline = latest.index - 1.
  const periodsElapsed = latest.index - 1;
  let annualised: string | null = null;
  if (periodsElapsed > 0) {
    const ratio = latest.index_value / 100;
    const periodsPerYear = 365.25 / periodDays.value;
    const annual = Math.pow(ratio, periodsPerYear / periodsElapsed) - 1;
    annualised = `${annual >= 0 ? '+' : ''}${(annual * 100).toFixed(1)}% / yr`;
  }
  return {
    value: latest.index_value.toFixed(1),
    sublabel: `vs ${baseline.label} = 100`,
    delta: annualised,
    direction:
      latest.index_value > 100
        ? 'up'
        : latest.index_value < 100
          ? 'down'
          : 'flat',
  } as const;
});

interface ItemPoPChange {
  item_key: string;
  name: string;
  pct_change: number;
}

const itemsPoPChanges = computed<ItemPoPChange[]>(() => {
  const cur = latestPeriod.value;
  const prev = previousPeriod.value;
  if (!cur || !prev) return [];
  const prevByKey = new Map(prev.items.map((i) => [i.item_key, i]));
  const out: ItemPoPChange[] = [];
  for (const c of cur.items) {
    const p = prevByKey.get(c.item_key);
    if (!p || p.avg_unit_price <= 0 || c.avg_unit_price <= 0) continue;
    const pct = ((c.avg_unit_price - p.avg_unit_price) / p.avg_unit_price) * 100;
    out.push({ item_key: c.item_key, name: c.name, pct_change: pct });
  }
  return out;
});

const tileBiggestMover = computed(() => {
  const items = itemsPoPChanges.value;
  if (items.length === 0) {
    return {
      value: '—',
      sublabel: 'need 2+ completed periods',
      delta: null,
      direction: null as 'up' | 'down' | 'flat' | null,
    };
  }
  const top = [...items].sort(
    (a, b) => Math.abs(b.pct_change) - Math.abs(a.pct_change),
  )[0];
  return {
    value: top.name,
    sublabel: 'biggest mover this period',
    delta: `${top.pct_change >= 0 ? '+' : ''}${top.pct_change.toFixed(1)}%`,
    direction:
      top.pct_change > 0
        ? ('up' as const)
        : top.pct_change < 0
          ? ('down' as const)
          : ('flat' as const),
  };
});

const tileCoverage = computed(() => {
  const totalItems = basket.items.length;
  const priced = prices.currentPrices?.prices.length ?? 0;
  const accepted =
    prices.currentPrices?.prices.reduce(
      (sum, p) => sum + p.accepted_count,
      0,
    ) ?? 0;
  const lastRefresh = dashboard.data?.latest_refresh_date ?? null;
  return {
    value: totalItems > 0 ? `${priced} / ${totalItems}` : '—',
    sublabel:
      lastRefresh !== null
        ? `last refresh ${formatDate(lastRefresh)}`
        : 'no refresh yet',
    delta: `${accepted} accepted obs`,
  };
});

// ----------------------------------------------------------------- chart data

const trendPoints = computed(() =>
  periodsAsc.value.map((p) => ({
    label: p.label,
    tooltipTitle: p.tooltipTitle,
    basket_total: p.basket_total,
    isBaseline: p.index === 1,
  })),
);

const indexPoints = computed(() =>
  periodsAsc.value.map((p) => ({
    label: p.label,
    tooltipTitle: p.tooltipTitle,
    index_value: p.index_value,
    isBaseline: p.index === 1,
  })),
);

const contributionRows = computed(() => {
  const latest = latestPeriod.value;
  if (!latest) return [];
  return latest.items.map((i) => ({
    item_key: i.item_key,
    name: i.name,
    line_total: i.period_total,
  }));
});

const itemChangeRows = computed(() => {
  const latest = latestPeriod.value;
  const baseline = baselinePeriod.value;
  if (!latest || !baseline || latest.index === 1) return [];
  const baselineByKey = new Map(baseline.items.map((i) => [i.item_key, i]));
  const out = [];
  for (const c of latest.items) {
    const b = baselineByKey.get(c.item_key);
    if (!b || b.avg_unit_price <= 0 || c.avg_unit_price <= 0) continue;
    const pct =
      ((c.avg_unit_price - b.avg_unit_price) / b.avg_unit_price) * 100;
    out.push({ item_key: c.item_key, name: c.name, pct_change: pct });
  }
  return out;
});

// ----------------------------------------------------------------- summary

const summary = computed(() => {
  const latest = latestPeriod.value;
  const baseline = baselinePeriod.value;
  const prev = previousPeriod.value;
  if (!latest) return null;
  return {
    latestLabel: latest.label,
    latestTooltip: latest.tooltipTitle,
    latestTotal: formatCurrency(latest.basket_total),
    vsBaseline:
      baseline && latest.index !== 1
        ? `${latest.index_value >= 100 ? '+' : ''}${(latest.index_value - 100).toFixed(1)}%`
        : null,
    vsBaselineUp: latest.index_value >= 100,
    vsPrev:
      prev && prev.basket_total > 0
        ? `${latest.basket_total >= prev.basket_total ? '+' : ''}${(((latest.basket_total - prev.basket_total) / prev.basket_total) * 100).toFixed(1)}%`
        : null,
    vsPrevUp: prev ? latest.basket_total >= prev.basket_total : false,
    baselineLabel: baseline?.tooltipTitle ?? null,
  };
});
</script>

<template>
  <div class="analyse">
    <header class="analyse-header">
      <div class="analyse-header-row">
        <h2 class="page-title">Analyse</h2>
        <div class="period-control">
          <label class="period-label" for="analyse-period-days">Period length</label>
          <input
            id="analyse-period-days"
            v-model.number="periodDaysModel"
            type="number"
            class="input input-inline period-input"
            :min="MIN_PERIOD_DAYS"
            :max="MAX_PERIOD_DAYS"
            step="1"
            aria-describedby="analyse-period-hint"
          />
          <span id="analyse-period-hint" class="period-hint">
            days ({{ MIN_PERIOD_DAYS }}–{{ MAX_PERIOD_DAYS }})
          </span>
          <div class="period-presets" role="group" aria-label="Quick period lengths">
            <button
              v-for="d in PERIOD_PRESETS"
              :key="d"
              type="button"
              class="btn btn-ghost btn-sm period-preset"
              :aria-pressed="periodDays === d"
              @click="setPeriodPreset(d)"
            >
              {{ d }}
            </button>
          </div>
        </div>
      </div>
      <p class="page-sub">
        How the NZ grocery basket is moving — measured in
        <strong>{{ periodDays }}-day periods</strong> anchored on the first reported price.
        <template v-if="analysis.anchor_date">
          P1 starts <strong>{{ formatDate(analysis.anchor_date) }}</strong>.
        </template>
        <template v-if="analysis.has_in_progress_period">
          The current period is still in progress and is not shown.
        </template>
      </p>
    </header>

    <div v-if="isLoading" class="loading-state">Loading analysis…</div>

    <div v-else-if="!hasAnyData" class="empty-state card">
      <p>No data to analyse yet.</p>
      <p>Run a refresh from the Operations page to start collecting prices.</p>
      <RouterLink to="/operations" class="btn btn-primary mt-4">Go to Operations</RouterLink>
    </div>

    <template v-else>
      <!-- KPI tiles ------------------------------------------------------- -->
      <section class="stat-grid">
        <StatTile
          label="Latest period basket"
          :value="tileBasket.value"
          :sublabel="tileBasket.sublabel"
          :delta="tileBasket.delta"
          :direction="tileBasket.direction"
        />
        <StatTile
          label="Index vs P1"
          :value="tileIndex.value"
          :sublabel="tileIndex.sublabel"
          :delta="tileIndex.delta"
          :direction="tileIndex.direction"
        />
        <StatTile
          label="Biggest mover"
          :value="tileBiggestMover.value"
          :sublabel="tileBiggestMover.sublabel"
          :delta="tileBiggestMover.delta"
          :direction="tileBiggestMover.direction"
        />
        <StatTile
          label="Coverage"
          :value="tileCoverage.value"
          :sublabel="tileCoverage.sublabel"
          :delta="tileCoverage.delta"
          :direction="null"
          :inverse-trend="false"
        />
      </section>

      <div v-if="periodsAsc.length === 0" class="empty-state card">
        <p>
          Not enough history yet to form a complete {{ periodDays }}-day period.
          Once {{ periodDays }} days have elapsed since the first reported price,
          P1 will appear here.
        </p>
      </div>

      <template v-else>
        <!-- Charts row 1: trend lines ----------------------------------- -->
        <section class="chart-grid">
          <div class="card">
            <div class="chart-head">
              <h3 class="card-title">Basket total over time</h3>
              <p class="chart-sub">Cost of the fixed basket per {{ periodDays }}-day period</p>
            </div>
            <BasketTotalChart :points="trendPoints" />
          </div>

          <div class="card">
            <div class="chart-head">
              <h3 class="card-title">Index vs P1</h3>
              <p class="chart-sub">
                {{ baselinePeriod ? baselinePeriod.tooltipTitle + ' = 100' : 'baseline pending' }}
              </p>
            </div>
            <IndexChart :points="indexPoints" />
          </div>
        </section>

        <!-- Charts row 2: per-item breakdowns -------------------------- -->
        <section class="chart-grid">
          <div class="card">
            <div class="chart-head">
              <h3 class="card-title">What's driving the basket cost</h3>
              <p class="chart-sub">
                Per-item $ contribution
                <template v-if="latestPeriod">
                  — {{ latestPeriod.tooltipTitle }}
                </template>
                <template v-if="latestPeriod">
                  · total {{ formatCurrency(latestPeriod.basket_total) }}
                </template>
              </p>
            </div>
            <ContributionChart
              :rows="contributionRows"
              :basket-total="latestPeriod?.basket_total ?? 0"
            />
          </div>

          <div class="card">
            <div class="chart-head">
              <h3 class="card-title">Winners and losers vs P1</h3>
              <p class="chart-sub">
                <span class="legend-dot legend-dot--up"></span>more expensive
                <span class="legend-dot legend-dot--down"></span>cheaper
              </p>
            </div>
            <ItemChangeChart :rows="itemChangeRows" />
          </div>
        </section>

        <!-- Plain-language summary ------------------------------------- -->
        <section v-if="summary" class="card analyse-summary">
          <h3 class="card-title">Summary</h3>
          <p>
            In <strong>{{ summary.latestTooltip }}</strong> the basket cost
            <strong>{{ summary.latestTotal }}</strong>.
            <template v-if="summary.vsBaseline">
              That's
              <strong :class="summary.vsBaselineUp ? 'txt-up' : 'txt-down'">
                {{ summary.vsBaseline }}
              </strong>
              vs P1 ({{ summary.baselineLabel }}).
            </template>
            <template v-if="summary.vsPrev">
              Period-on-period, the basket is
              <strong :class="summary.vsPrevUp ? 'txt-up' : 'txt-down'">
                {{ summary.vsPrev }}
              </strong>.
            </template>
          </p>
          <p class="analyse-meta">
            Periods are {{ periodDays }} elapsed days from
            <strong>{{ analysis.anchor_date ? formatDate(analysis.anchor_date) : '—' }}</strong>.
            {{ periodsAsc.length }} completed period{{ periodsAsc.length === 1 ? '' : 's' }}.
            <template v-if="analysis.has_in_progress_period">
              The current period (P{{ periodsAsc.length + 1 }}) is in progress.
            </template>
          </p>
        </section>
      </template>

      <div v-if="historiesError" class="error-state mt-4">
        <p>History: {{ historiesError }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.analyse-header {
  margin-bottom: var(--space-6);
}

.analyse-header-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
}

.period-control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.period-label {
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: 500;
}

.period-input {
  width: 4.25rem;
}

.period-hint {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.period-presets {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
}

.period-preset[aria-pressed='true'] {
  background: var(--color-border-light);
}

.page-sub {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.chart-head {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
}

.chart-sub {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.legend-dot {
  display: inline-block;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  margin: 0 var(--space-1) 0 var(--space-3);
  vertical-align: middle;
}
.legend-dot--up {
  background: var(--color-danger);
}
.legend-dot--down {
  background: var(--color-success);
}

.analyse-summary p {
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-text);
}

.analyse-meta {
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.txt-up {
  color: var(--color-danger);
}
.txt-down {
  color: var(--color-success);
}

@media (max-width: 1024px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import type {
  ChartData,
  ChartOptions,
  TooltipItem,
  Scale,
  ScriptableScaleContext,
} from 'chart.js';
import { chartTheme } from './chartSetup';

export interface ItemChangeRow {
  item_key: string;
  name: string;
  pct_change: number; // e.g. 12.4 means +12.4% vs baseline
}

const props = defineProps<{
  rows: ItemChangeRow[];
}>();

const theme = chartTheme();

// Sort by pct change ascending so the most-deflated items sit at the bottom
// of the chart and the most-inflated at the top (Chart.js horizontal-bar
// renders the first label at the top by default after we reverse).
const sorted = computed(() =>
  [...props.rows].sort((a, b) => a.pct_change - b.pct_change),
);

const chartData = computed<ChartData<'bar'>>(() => {
  const ordered = sorted.value;
  return {
    labels: ordered.map((r) => r.name),
    datasets: [
      {
        label: '% change vs baseline',
        data: ordered.map((r) => r.pct_change),
        backgroundColor: ordered.map((r) =>
          r.pct_change > 0 ? theme.danger : r.pct_change < 0 ? theme.success : theme.textSecondary,
        ),
        borderRadius: 4,
        barThickness: 16,
      },
    ],
  };
});

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) => {
          const v = ctx.parsed.x as number;
          const sign = v > 0 ? '+' : '';
          return `${sign}${v.toFixed(1)}% vs baseline`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: (ctx: ScriptableScaleContext) =>
          ctx.tick.value === 0 ? theme.text : theme.border,
        lineWidth: (ctx: ScriptableScaleContext) =>
          ctx.tick.value === 0 ? 1.5 : 1,
      },
      ticks: {
        callback: function (this: Scale, v: string | number) {
          return v + '%';
        },
      },
    },
    y: { grid: { display: false } },
  },
}));

const dynamicHeight = computed(() => Math.max(220, sorted.value.length * 28));
</script>

<template>
  <div class="chart-frame" :style="{ height: dynamicHeight + 'px' }">
    <Bar v-if="sorted.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="chart-empty">Need at least two snapshots to compare against baseline.</div>
  </div>
</template>

<style scoped>
.chart-frame {
  position: relative;
  min-height: 220px;
}
.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import type { ChartData, ChartOptions, TooltipItem, Scale } from 'chart.js';
import { chartTheme } from './chartSetup';

export interface ContributionRow {
  item_key: string;
  name: string;
  line_total: number;
}

const props = defineProps<{
  rows: ContributionRow[];
  basketTotal: number;
}>();

const theme = chartTheme();

// Sort largest -> smallest, then reverse for Chart.js horizontal-bar (top = first).
const sorted = computed(() =>
  [...props.rows].sort((a, b) => b.line_total - a.line_total),
);

const chartData = computed<ChartData<'bar'>>(() => {
  const ordered = [...sorted.value].reverse();
  return {
    labels: ordered.map((r) => r.name),
    datasets: [
      {
        label: 'Monthly $ contribution',
        data: ordered.map((r) => r.line_total),
        backgroundColor: theme.primary,
        borderRadius: 4,
        barThickness: 18,
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
          const pct = props.basketTotal
            ? ((v / props.basketTotal) * 100).toFixed(1) + '%'
            : '';
          return `$${v.toFixed(2)}  (${pct} of basket)`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: theme.border },
      ticks: {
        callback: function (this: Scale, v: string | number) {
          return '$' + v;
        },
      },
    },
    y: { grid: { display: false } },
  },
}));

const dynamicHeight = computed(() => Math.max(220, sorted.value.length * 32));
</script>

<template>
  <div class="chart-frame" :style="{ height: dynamicHeight + 'px' }">
    <Bar v-if="sorted.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="chart-empty">No item-level snapshot data.</div>
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

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import type { ChartData, ChartOptions, TooltipItem, Scale } from 'chart.js';
import { chartTheme } from './chartSetup';

export interface TrendPoint {
  /** Display label for the X axis (e.g. "P1", "P3"). */
  label: string;
  /** Optional richer label shown in the tooltip title (e.g. "Period 3 · 25 May – 13 Jun"). */
  tooltipTitle?: string;
  basket_total: number;
  isBaseline?: boolean;
}

const props = defineProps<{
  /** Points are passed in chronological order (oldest -> newest). */
  points: TrendPoint[];
}>();

const theme = chartTheme();

const chartData = computed<ChartData<'line'>>(() => {
  return {
    labels: props.points.map((p) => p.label),
    datasets: [
      {
        label: 'Basket total (NZD)',
        data: props.points.map((p) => p.basket_total),
        borderColor: theme.primary,
        backgroundColor: theme.primary + '22',
        pointBackgroundColor: props.points.map((p) =>
          p.isBaseline ? theme.warning : theme.primary,
        ),
        pointRadius: props.points.map((p) => (p.isBaseline ? 6 : 4)),
        pointHoverRadius: 7,
        borderWidth: 2.5,
        tension: 0.25,
        fill: true,
      },
    ],
  };
});

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (ctxs: TooltipItem<'line'>[]) => {
          const i = ctxs[0]?.dataIndex ?? 0;
          return props.points[i]?.tooltipTitle ?? props.points[i]?.label ?? '';
        },
        label: (ctx: TooltipItem<'line'>) =>
          `$${(ctx.parsed.y as number).toFixed(2)}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        callback: function (this: Scale, v: string | number) {
          return '$' + v;
        },
      },
      grid: { color: theme.border },
    },
    x: { grid: { display: false } },
  },
}));
</script>

<template>
  <div class="chart-frame">
    <Line v-if="props.points.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="chart-empty">No completed periods yet.</div>
  </div>
</template>

<style scoped>
.chart-frame {
  position: relative;
  height: 280px;
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

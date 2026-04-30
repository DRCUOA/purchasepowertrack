<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import type { ChartData, ChartOptions, TooltipItem, Scale } from 'chart.js';
import { chartTheme } from './chartSetup';

export interface IndexPoint {
  label: string;
  tooltipTitle?: string;
  index_value: number;
  isBaseline?: boolean;
}

const props = defineProps<{
  /** Chronological order, oldest -> newest. */
  points: IndexPoint[];
}>();

const theme = chartTheme();

const chartData = computed<ChartData<'line'>>(() => {
  return {
    labels: props.points.map((p) => p.label),
    datasets: [
      {
        label: 'Index (baseline = 100)',
        data: props.points.map((p) => p.index_value),
        borderColor: theme.primary,
        backgroundColor: theme.primary + '33',
        pointRadius: props.points.map((p) => (p.isBaseline ? 6 : 3)),
        pointBackgroundColor: props.points.map((p) =>
          p.isBaseline
            ? theme.warning
            : p.index_value >= 100
              ? theme.danger
              : theme.success,
        ),
        borderWidth: 2.5,
        fill: true,
        tension: 0.25,
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
        label: (ctx: TooltipItem<'line'>) => {
          const v = ctx.parsed.y as number;
          const pct = (v - 100).toFixed(1);
          const sign = v >= 100 ? '+' : '';
          return `Index ${v.toFixed(1)} (${sign}${pct}% vs P1)`;
        },
      },
    },
  },
  scales: {
    y: {
      grid: { color: theme.border },
      ticks: {
        callback: function (this: Scale, v: string | number) {
          return Number(v).toFixed(0);
        },
      },
    },
    x: { grid: { display: false } },
  },
}));
</script>

<template>
  <div class="chart-frame">
    <Line v-if="props.points.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="chart-empty">Need at least one completed period.</div>
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

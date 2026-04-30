<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: string;
    sublabel?: string;
    delta?: string | null;
    direction?: 'up' | 'down' | 'flat' | null;
    /** When true, "up" reads as bad (red) and "down" as good (green) — the
     * convention for inflation/cost. When false (e.g. coverage tiles), neutral
     * colouring is used. */
    inverseTrend?: boolean;
  }>(),
  { sublabel: '', delta: null, direction: null, inverseTrend: true },
);
</script>

<template>
  <div class="stat-tile card">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">{{ value }}</div>
    <div class="stat-foot">
      <span
        v-if="delta !== null && delta !== ''"
        class="stat-delta"
        :class="{
          'stat-delta--up-bad': inverseTrend && direction === 'up',
          'stat-delta--down-good': inverseTrend && direction === 'down',
          'stat-delta--up-good': !inverseTrend && direction === 'up',
          'stat-delta--down-bad': !inverseTrend && direction === 'down',
          'stat-delta--flat': direction === 'flat' || direction === null,
        }"
      >
        <span v-if="direction === 'up'" aria-hidden="true">&#9650;</span>
        <span v-else-if="direction === 'down'" aria-hidden="true">&#9660;</span>
        <span v-else aria-hidden="true">&#8212;</span>
        {{ delta }}
      </span>
      <span v-if="sublabel" class="stat-sublabel">{{ sublabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.stat-tile {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-6);
}

.stat-label {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  line-height: 1.1;
}

.stat-foot {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.stat-delta {
  font-size: var(--text-sm);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-variant-numeric: tabular-nums;
}

.stat-delta--up-bad,
.stat-delta--down-bad {
  color: var(--color-danger);
}

.stat-delta--down-good,
.stat-delta--up-good {
  color: var(--color-success);
}

.stat-delta--flat {
  color: var(--color-text-muted);
}

.stat-sublabel {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>

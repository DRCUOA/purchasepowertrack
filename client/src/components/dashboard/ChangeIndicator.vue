<script setup lang="ts">
import { computed } from 'vue';
import { useFormatters } from '../../composables/useFormatters';

const props = defineProps<{
  label: string;
  currentValue: number | null;
  previousValue: number | null;
}>();

const { formatChange } = useFormatters();

const change = computed(() =>
  formatChange(props.currentValue, props.previousValue),
);
</script>

<template>
  <div class="change-indicator card">
    <div class="change-indicator-label">{{ props.label }}</div>
    <div
      class="change-indicator-value"
      :class="{
        'change-indicator-value--up': change.direction === 'up',
        'change-indicator-value--down': change.direction === 'down',
        'change-indicator-value--flat': change.direction === 'flat',
      }"
    >
      <span v-if="change.direction === 'up'" class="change-arrow" aria-label="up">&#9650;</span>
      <span v-else-if="change.direction === 'down'" class="change-arrow" aria-label="down">&#9660;</span>
      <span v-else class="change-arrow" aria-label="flat">&#8212;</span>
      {{ change.value }}
    </div>
  </div>
</template>

<style scoped>
.change-indicator {
  padding: var(--space-5) var(--space-6);
}

.change-indicator-label {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: var(--space-2);
}

.change-indicator-value {
  font-size: var(--text-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.change-indicator-value--up {
  color: var(--color-danger);
}

.change-indicator-value--down {
  color: var(--color-success);
}

.change-indicator-value--flat {
  color: var(--color-text-muted);
}

.change-arrow {
  font-size: var(--text-sm);
}
</style>

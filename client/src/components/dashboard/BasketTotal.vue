<script setup lang="ts">
import { useFormatters } from '../../composables/useFormatters';

const props = defineProps<{
  total: number | null;
  loading: boolean;
}>();

const { formatCurrency } = useFormatters();
</script>

<template>
  <div class="basket-total card">
    <div class="basket-total-label">Current Monthly Basket</div>
    <div v-if="props.loading" class="basket-total-value basket-total-value--loading">...</div>
    <div v-else-if="props.total !== null" class="basket-total-value">
      {{ formatCurrency(props.total) }}
    </div>
    <div v-else class="basket-total-value basket-total-value--empty">No data</div>
  </div>
</template>

<style scoped>
.basket-total {
  text-align: center;
  padding: var(--space-8) var(--space-6);
}

.basket-total-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: var(--space-2);
}

.basket-total-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.basket-total-value--loading {
  color: var(--color-text-muted);
}

.basket-total-value--empty {
  font-size: var(--text-lg);
  color: var(--color-text-muted);
}
</style>

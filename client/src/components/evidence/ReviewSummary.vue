<script setup lang="ts">
import type { NormalizedPrice } from '@basket/shared';
import { useFormatters } from '../../composables/useFormatters';

defineProps<{
  normalizedPrice: NormalizedPrice | null;
  observationCount: number;
}>();

const { formatCurrency } = useFormatters();
</script>

<template>
  <div class="review-summary card">
    <h3 class="card-title">Price Summary</h3>
    <div v-if="normalizedPrice" class="summary-grid">
      <div class="summary-item">
        <span class="summary-label">Canonical price</span>
        <span class="summary-value">{{ formatCurrency(normalizedPrice.canonical_unit_price) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Method</span>
        <span class="summary-value">{{ normalizedPrice.method }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Observations</span>
        <span class="summary-value">{{ observationCount }} total</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Accepted</span>
        <span class="summary-value">{{ normalizedPrice.accepted_count }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Rejected</span>
        <span class="summary-value">{{ normalizedPrice.rejected_count }}</span>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>No normalized price data available.</p>
    </div>
  </div>
</template>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-4);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.summary-label {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-value {
  font-size: var(--text-base);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>

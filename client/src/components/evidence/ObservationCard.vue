<script setup lang="ts">
import type { PriceObservation } from '@basket/shared';
import { useFormatters } from '../../composables/useFormatters';

defineProps<{
  observation: PriceObservation;
}>();

const { formatCurrency, formatDate } = useFormatters();
</script>

<template>
  <div class="obs-card card">
    <div class="obs-card-header">
      <span class="obs-shop">{{ observation.shop_name }}</span>
      <span
        class="badge"
        :class="{
          'badge-accepted': observation.review_status === 'accepted',
          'badge-rejected': observation.review_status === 'rejected',
          'badge-pending': observation.review_status === 'pending',
        }"
      >
        {{ observation.review_status }}
      </span>
    </div>

    <div class="obs-title">{{ observation.raw_title }}</div>

    <div class="obs-details">
      <div class="obs-price">{{ formatCurrency(observation.raw_price) }}</div>
      <div v-if="observation.unit_text" class="obs-unit">{{ observation.unit_text }}</div>
    </div>

    <div class="obs-meta">
      <span>{{ formatDate(observation.observed_at) }}</span>
      <span v-if="observation.is_special" class="badge badge-pending">Special</span>
      <span v-if="observation.is_member_price" class="badge badge-pending">Member</span>
    </div>

    <div v-if="observation.review_reason" class="obs-reason">
      {{ observation.review_reason }}
    </div>

    <a
      v-if="observation.source_url"
      :href="observation.source_url"
      target="_blank"
      rel="noopener noreferrer"
      class="obs-source"
    >
      View source
    </a>
  </div>
</template>

<style scoped>
.obs-card {
  padding: var(--space-4);
}

.obs-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.obs-shop {
  font-weight: 600;
  font-size: var(--text-sm);
}

.obs-title {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.obs-details {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.obs-price {
  font-size: var(--text-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.obs-unit {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.obs-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.obs-reason {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
}

.obs-source {
  font-size: var(--text-xs);
}
</style>

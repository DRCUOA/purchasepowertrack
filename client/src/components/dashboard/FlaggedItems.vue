<script setup lang="ts">
import type { FlaggedItem } from '@basket/shared';
import { RouterLink } from 'vue-router';

defineProps<{
  items: FlaggedItem[];
}>();
</script>

<template>
  <div class="flagged-items card">
    <h3 class="card-title">Flagged Items</h3>
    <div v-if="items.length === 0" class="empty-state">
      <p>No flagged items — everything looks good.</p>
    </div>
    <ul v-else class="flagged-list">
      <li v-for="item in items" :key="item.basket_item_id" class="flagged-item">
        <RouterLink
          :to="{ name: 'evidence-item', params: { itemKey: item.item_key } }"
          class="flagged-link"
        >
          <span class="flagged-name">{{ item.name }}</span>
          <span class="flagged-reason">{{ item.reason }}</span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.flagged-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.flagged-item {
  background: var(--color-warning-bg);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  transition: background 0.15s;
}

.flagged-item:hover {
  background: var(--color-warning-bg-hover, rgba(251, 191, 36, 0.15));
}

.flagged-link {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: var(--space-2) var(--space-3);
  text-decoration: none;
  color: inherit;
}

.flagged-name {
  font-weight: 500;
  color: var(--color-text);
}

.flagged-reason {
  color: var(--color-warning-text);
  font-size: var(--text-xs);
}
</style>

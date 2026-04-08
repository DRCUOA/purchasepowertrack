<script setup lang="ts">
import { RouterLink } from 'vue-router';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/basket', label: 'Basket Items' },
  { to: '/evidence', label: 'Price Evidence' },
  { to: '/flagged', label: 'Flagged Items' },
  { to: '/trends', label: 'Trends' },
  { to: '/settings', label: 'Settings' },
] as const;
</script>

<template>
  <nav class="app-nav">
    <ul class="app-nav-list">
      <li v-for="link in links" :key="link.to" class="app-nav-item">
        <RouterLink :to="link.to" class="app-nav-link" active-class="app-nav-link--active" :exact="link.to === '/'">
          {{ link.label }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.app-nav {
  width: 200px;
  flex-shrink: 0;
  padding: var(--space-6) 0;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
}

.app-nav-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: 0 var(--space-3);
}

.app-nav-link {
  display: block;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.app-nav-link:hover {
  background: var(--color-bg);
  color: var(--color-text);
  text-decoration: none;
}

.app-nav-link--active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .app-nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-2) 0;
  }

  .app-nav-list {
    flex-direction: row;
    overflow-x: auto;
    gap: 0;
    padding: 0 var(--space-3);
  }

  .app-nav-link {
    white-space: nowrap;
    padding: var(--space-2) var(--space-3);
  }
}
</style>

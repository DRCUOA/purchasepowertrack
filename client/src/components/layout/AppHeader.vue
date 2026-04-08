<script setup lang="ts">
</script>

<template>
  <header class="app-header">
    <div class="app-header-inner">
      <h1 class="app-header-title">NZ Basket Tracker</h1>
      <span class="app-header-subtitle">Monthly Grocery Purchasing Power</span>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-4) var(--space-8);
}

.app-header-inner {
  display: flex;
  align-items: baseline;
  gap: var(--space-4);
  max-width: 1400px;
}

.app-header-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.app-header-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .app-header {
    padding: var(--space-3) var(--space-4);
  }

  .app-header-inner {
    flex-direction: column;
    gap: 0;
  }

  .app-header-subtitle {
    font-size: var(--text-xs);
  }
}
</style>

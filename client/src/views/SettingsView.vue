<script setup lang="ts">
import { onMounted } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useFormatters } from '../composables/useFormatters';

const settings = useSettingsStore();
const { formatMonth } = useFormatters();

onMounted(() => {
  settings.load();
});
</script>

<template>
  <div class="settings">
    <h2 class="page-title">Settings</h2>

    <div v-if="settings.loading" class="loading-state">Loading settings...</div>

    <div v-else-if="settings.error" class="error-state">
      <p>{{ settings.error }}</p>
      <button class="btn btn-secondary" @click="settings.load()">Retry</button>
    </div>

    <template v-else-if="settings.settings">
      <div class="stack">
        <section class="card">
          <h3 class="card-title">Enabled Retailers</h3>
          <ul class="retailer-list">
            <li
              v-for="r in settings.settings.enabled_retailers"
              :key="r"
              class="retailer-item"
            >
              {{ r }}
            </li>
          </ul>
        </section>

        <section class="card">
          <h3 class="card-title">Baseline Month</h3>
          <p class="settings-value">{{ formatMonth(settings.settings.baseline_month) }}</p>
        </section>

        <section class="card">
          <h3 class="card-title">Refresh Schedule</h3>
          <p class="settings-value">{{ settings.settings.refresh_schedule }}</p>
        </section>

        <section class="card">
          <h3 class="card-title">Observation Rules</h3>
          <div class="rules-grid">
            <div class="rule-item">
              <span class="rule-label">Reject specials</span>
              <span class="rule-value" :class="settings.settings.observation_rules.reject_specials ? 'rule-on' : 'rule-off'">
                {{ settings.settings.observation_rules.reject_specials ? 'Yes' : 'No' }}
              </span>
            </div>
            <div class="rule-item">
              <span class="rule-label">Reject member pricing</span>
              <span class="rule-value" :class="settings.settings.observation_rules.reject_member_pricing ? 'rule-on' : 'rule-off'">
                {{ settings.settings.observation_rules.reject_member_pricing ? 'Yes' : 'No' }}
              </span>
            </div>
            <div class="rule-item">
              <span class="rule-label">Reject multi-buy</span>
              <span class="rule-value" :class="settings.settings.observation_rules.reject_multi_buy ? 'rule-on' : 'rule-off'">
                {{ settings.settings.observation_rules.reject_multi_buy ? 'Yes' : 'No' }}
              </span>
            </div>
            <div class="rule-item">
              <span class="rule-label">Reject wrong size</span>
              <span class="rule-value" :class="settings.settings.observation_rules.reject_wrong_size ? 'rule-on' : 'rule-off'">
                {{ settings.settings.observation_rules.reject_wrong_size ? 'Yes' : 'No' }}
              </span>
            </div>
          </div>
        </section>
      </div>
    </template>

    <div v-else class="empty-state">
      <p>No settings available.</p>
    </div>
  </div>
</template>

<style scoped>
.retailer-list {
  list-style: none;
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.retailer-item {
  padding: var(--space-1) var(--space-3);
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 9999px;
  font-size: var(--text-sm);
  font-weight: 500;
  text-transform: capitalize;
}

.settings-value {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-text);
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-3);
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg);
  border-radius: var(--radius-md);
}

.rule-label {
  font-size: var(--text-sm);
  color: var(--color-text);
}

.rule-value {
  font-size: var(--text-sm);
  font-weight: 600;
}

.rule-on {
  color: var(--color-success);
}

.rule-off {
  color: var(--color-text-muted);
}
</style>

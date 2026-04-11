<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getWeekStart } from '@basket/shared';
import { useBasketStore } from '../stores/basket';
import { usePricesStore } from '../stores/prices';
import ObservationCard from '../components/evidence/ObservationCard.vue';
import ReviewSummary from '../components/evidence/ReviewSummary.vue';
import { useFormatters } from '../composables/useFormatters';

const { formatDate } = useFormatters();

const route = useRoute();
const router = useRouter();
const basket = useBasketStore();
const prices = usePricesStore();

const selectedItemKey = ref<string>('');
const selectedWeek = ref<string>(getWeekStart(new Date()));

const availableWeeks = computed(() => {
  if (!selectedItemKey.value) return [];
  const history = prices.getHistory(selectedItemKey.value);
  if (!history || history.history.length === 0) return [selectedWeek.value];
  const weeks = history.history.map((h) => h.week_start);
  if (!weeks.includes(selectedWeek.value)) {
    weeks.unshift(selectedWeek.value);
  }
  return weeks;
});

onMounted(async () => {
  if (basket.items.length === 0) {
    await basket.load();
  }

  const paramKey = route.params.itemKey as string | undefined;
  if (paramKey) {
    selectedItemKey.value = paramKey;
    await prices.loadHistory(paramKey);
    loadEvidence(paramKey, selectedWeek.value);
  }
});

watch(selectedItemKey, async (key) => {
  if (key) {
    router.replace({ name: 'evidence-item', params: { itemKey: key } });
    await prices.loadHistory(key);
    const weeks = availableWeeks.value;
    if (weeks.length > 0 && !weeks.includes(selectedWeek.value)) {
      selectedWeek.value = weeks[0];
    }
    loadEvidence(key, selectedWeek.value);
  }
});

watch(selectedWeek, (week) => {
  if (selectedItemKey.value && week) {
    loadEvidence(selectedItemKey.value, week);
  }
});

function loadEvidence(itemKey: string, weekStart: string) {
  prices.loadEvidence(itemKey, weekStart);
}

const evidence = computed(() => {
  if (!selectedItemKey.value) return null;
  return prices.getEvidence(selectedItemKey.value, selectedWeek.value) ?? null;
});
</script>

<template>
  <div class="price-evidence">
    <h2 class="page-title">Price Evidence</h2>

    <div class="evidence-controls mb-6">
      <div class="flex-row" style="gap: var(--space-4); flex-wrap: wrap">
        <div>
          <label for="item-select">Select item</label>
          <select
            id="item-select"
            v-model="selectedItemKey"
            class="input"
            style="max-width: 24rem"
          >
            <option value="" disabled>Choose a basket item...</option>
            <option
              v-for="item in basket.items"
              :key="item.item_key"
              :value="item.item_key"
            >
              {{ item.name }} ({{ item.unit_label }})
            </option>
          </select>
        </div>
        <div v-if="selectedItemKey">
          <label for="week-select">Week starting</label>
          <select
            id="week-select"
            v-model="selectedWeek"
            class="input"
            style="max-width: 14rem"
          >
            <option
              v-for="week in availableWeeks"
              :key="week"
              :value="week"
            >
              {{ formatDate(week) }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="!selectedItemKey" class="empty-state">
      <p>Select a basket item above to view price observations.</p>
    </div>

    <div v-else-if="prices.loading" class="loading-state">Loading evidence...</div>

    <div v-else-if="prices.error" class="error-state">
      <p>{{ prices.error }}</p>
      <button class="btn btn-secondary" @click="loadEvidence(selectedItemKey, selectedWeek)">Retry</button>
    </div>

    <template v-else-if="evidence">
      <ReviewSummary
        :normalized-price="evidence.normalized_price"
        :observation-count="evidence.observations.length"
        class="mb-6"
      />

      <div v-if="evidence.observations.length === 0" class="empty-state">
        <p>No observations for this item yet.</p>
      </div>

      <div v-else class="grid-cards">
        <ObservationCard
          v-for="obs in evidence.observations"
          :key="obs.id"
          :observation="obs"
        />
      </div>
    </template>
  </div>
</template>

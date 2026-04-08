<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useBasketStore } from '../stores/basket';
import { usePricesStore } from '../stores/prices';
import { useFormatters } from '../composables/useFormatters';
import BasketItemRow from '../components/basket/BasketItemRow.vue';

const basket = useBasketStore();
const prices = usePricesStore();
const { formatCurrency } = useFormatters();

onMounted(() => {
  basket.load();
  prices.loadCurrentPrices();
});

const isLoading = computed(() => basket.loading || prices.loading);
const error = computed(() => basket.error || prices.error);

const grandTotal = computed(() => {
  let total = 0;
  let hasAny = false;
  for (const item of basket.items) {
    const price = prices.priceByItemKey.get(item.item_key);
    if (price !== undefined && item.monthly_quantity !== null) {
      total += price * item.monthly_quantity;
      hasAny = true;
    }
  }
  return hasAny ? total : null;
});

function getPrice(itemKey: string): number | null {
  return prices.priceByItemKey.get(itemKey) ?? null;
}

async function onUpdateQuantity(id: number, month: string, qty: number) {
  await basket.setQuantity(id, month, qty);
}
</script>

<template>
  <div class="basket-items">
    <h2 class="page-title">Basket Items</h2>

    <div v-if="isLoading" class="loading-state">Loading basket items...</div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="basket.load(); prices.loadCurrentPrices()">Retry</button>
    </div>

    <div v-else-if="basket.items.length === 0" class="empty-state">
      <p>No basket items yet.</p>
      <p>Run a refresh from the dashboard to populate items.</p>
    </div>

    <div v-else class="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Unit</th>
            <th class="text-right">Current Price</th>
            <th class="text-right">Monthly Qty</th>
            <th class="text-right">Monthly Total</th>
          </tr>
        </thead>
        <tbody>
          <BasketItemRow
            v-for="item in basket.items"
            :key="item.id"
            :item="item"
            :price="getPrice(item.item_key)"
            @update-quantity="onUpdateQuantity"
          />
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4"><strong>Total</strong></td>
            <td class="num">
              <strong v-if="grandTotal !== null">{{ formatCurrency(grandTotal) }}</strong>
              <span v-else class="text-muted">—</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style scoped>
.text-muted {
  color: var(--color-text-muted);
}
</style>

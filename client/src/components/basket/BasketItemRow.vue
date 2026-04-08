<script setup lang="ts">
import { computed } from 'vue';
import type { BasketItemWithQuantity } from '@basket/shared';
import { useFormatters } from '../../composables/useFormatters';
import QuantityEditor from './QuantityEditor.vue';

const props = defineProps<{
  item: BasketItemWithQuantity;
  price: number | null;
}>();

const emit = defineEmits<{
  'update-quantity': [id: number, month: string, qty: number];
}>();

const { formatCurrency } = useFormatters();

const qty = computed(() => props.item.monthly_quantity ?? 0);
const month = computed(() => props.item.effective_month ?? new Date().toISOString().slice(0, 7));
const lineTotal = computed(() => {
  if (props.price === null) return null;
  return qty.value * props.price;
});

function onSave(newQty: number) {
  emit('update-quantity', props.item.id, month.value, newQty);
}
</script>

<template>
  <tr>
    <td>{{ item.name }}</td>
    <td>{{ item.unit_label }}</td>
    <td class="num">
      <template v-if="price !== null">{{ formatCurrency(price) }}</template>
      <template v-else><span class="text-muted">—</span></template>
    </td>
    <td class="num">
      <QuantityEditor
        :model-value="qty"
        :month="month"
        @update:model-value="(v: number) => onSave(v)"
        @save="() => {}"
      />
    </td>
    <td class="num">
      <template v-if="lineTotal !== null">{{ formatCurrency(lineTotal) }}</template>
      <template v-else><span class="text-muted">—</span></template>
    </td>
  </tr>
</template>

<style scoped>
.text-muted {
  color: var(--color-text-muted);
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: number;
  month: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
  save: [];
}>();

const editing = ref(false);
const draft = ref(props.modelValue);

watch(
  () => props.modelValue,
  (v) => {
    draft.value = v;
  },
);

function startEdit() {
  draft.value = props.modelValue;
  editing.value = true;
}

function cancel() {
  draft.value = props.modelValue;
  editing.value = false;
}

function save() {
  if (draft.value < 0) return;
  emit('update:modelValue', draft.value);
  emit('save');
  editing.value = false;
}
</script>

<template>
  <div class="qty-editor">
    <template v-if="!editing">
      <span class="qty-display">{{ props.modelValue }}</span>
      <button class="btn btn-ghost btn-sm" @click="startEdit">Edit</button>
    </template>
    <template v-else>
      <input
        v-model.number="draft"
        type="number"
        min="0"
        step="1"
        class="input input-inline qty-input"
        @keyup.enter="save"
        @keyup.escape="cancel"
      />
      <button class="btn btn-primary btn-sm" @click="save">Save</button>
      <button class="btn btn-ghost btn-sm" @click="cancel">Cancel</button>
    </template>
  </div>
</template>

<style scoped>
.qty-editor {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.qty-display {
  font-variant-numeric: tabular-nums;
  min-width: 2ch;
  text-align: right;
}

.qty-input {
  width: 5rem;
  text-align: right;
}
</style>

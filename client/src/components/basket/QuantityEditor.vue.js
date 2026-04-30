import { ref, watch } from 'vue';
const props = defineProps();
const emit = defineEmits();
const editing = ref(false);
const draft = ref(props.modelValue);
watch(() => props.modelValue, (v) => {
    draft.value = v;
});
function startEdit() {
    draft.value = props.modelValue;
    editing.value = true;
}
function cancel() {
    draft.value = props.modelValue;
    editing.value = false;
}
function save() {
    if (draft.value < 0)
        return;
    emit('update:modelValue', draft.value);
    emit('save');
    editing.value = false;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "qty-editor" },
});
if (!__VLS_ctx.editing) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "qty-display" },
    });
    (props.modelValue);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.startEdit) },
        ...{ class: "btn btn-ghost btn-sm" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onKeyup: (__VLS_ctx.save) },
        ...{ onKeyup: (__VLS_ctx.cancel) },
        type: "number",
        min: "0",
        step: "1",
        ...{ class: "input input-inline qty-input" },
    });
    (__VLS_ctx.draft);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.save) },
        ...{ class: "btn btn-primary btn-sm" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.cancel) },
        ...{ class: "btn btn-ghost btn-sm" },
    });
}
/** @type {__VLS_StyleScopedClasses['qty-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-display']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-input']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            editing: editing,
            draft: draft,
            startEdit: startEdit,
            cancel: cancel,
            save: save,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=QuantityEditor.vue.js.map
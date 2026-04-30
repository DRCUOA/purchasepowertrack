import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { formatDateTime } from '@basket/shared';
const lines = ref([]);
const scrollEl = ref(null);
const autoScroll = ref(true);
const isConnected = ref(false);
const maxLines = 500;
let evtSource = null;
const connectionLabel = computed(() => isConnected.value ? 'CONNECTED' : 'DISCONNECTED');
function scrollToBottom() {
    if (!autoScroll.value || !scrollEl.value)
        return;
    nextTick(() => {
        scrollEl.value.scrollTop = scrollEl.value.scrollHeight;
    });
}
function handleScroll() {
    if (!scrollEl.value)
        return;
    const { scrollTop, scrollHeight, clientHeight } = scrollEl.value;
    autoScroll.value = scrollHeight - scrollTop - clientHeight < 40;
}
function clearConsole() {
    lines.value = [];
}
function connect() {
    evtSource = new EventSource('/api/logs/stream');
    evtSource.onopen = () => {
        isConnected.value = true;
    };
    evtSource.onmessage = (event) => {
        try {
            const entry = JSON.parse(event.data);
            lines.value.push(entry);
            if (lines.value.length > maxLines) {
                lines.value.splice(0, lines.value.length - maxLines);
            }
            scrollToBottom();
        }
        catch { /* ignore malformed */ }
    };
    evtSource.onerror = () => {
        isConnected.value = false;
        evtSource?.close();
        setTimeout(connect, 3000);
    };
}
onMounted(() => {
    connect();
});
onBeforeUnmount(() => {
    evtSource?.close();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['console-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['console-output']} */ ;
/** @type {__VLS_StyleScopedClasses['console-output']} */ ;
/** @type {__VLS_StyleScopedClasses['console-output']} */ ;
/** @type {__VLS_StyleScopedClasses['console-output']} */ ;
/** @type {__VLS_StyleScopedClasses['console-output']} */ ;
/** @type {__VLS_StyleScopedClasses['console-msg']} */ ;
/** @type {__VLS_StyleScopedClasses['console-msg']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "console-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "console-titlebar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "console-titlebar-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "console-dot console-dot--red" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "console-dot console-dot--yellow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "console-dot console-dot--green" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "console-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "console-titlebar-right" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: (['console-status', __VLS_ctx.isConnected ? 'console-status--on' : 'console-status--off']) },
});
(__VLS_ctx.connectionLabel);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearConsole) },
    ...{ class: "console-btn" },
    title: "Clear",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onScroll: (__VLS_ctx.handleScroll) },
    ref: "scrollEl",
    ...{ class: "console-output" },
});
/** @type {typeof __VLS_ctx.scrollEl} */ ;
if (__VLS_ctx.lines.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "console-empty" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "console-prompt" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "console-cursor" },
    });
}
for (const [entry, i] of __VLS_getVForSourceType((__VLS_ctx.lines))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (i),
        ...{ class: (['console-line', `console-line--${entry.level}`]) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "console-ts" },
    });
    (__VLS_ctx.formatDateTime(entry.timestamp));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: (['console-level', `console-level--${entry.level}`]) },
    });
    (entry.level.toUpperCase().padEnd(5));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "console-msg" },
    });
    (entry.message);
}
if (__VLS_ctx.lines.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "console-prompt-line" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "console-prompt" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "console-cursor" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "console-footer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "console-footer-item" },
});
(__VLS_ctx.lines.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "console-footer-item" },
});
(__VLS_ctx.autoScroll ? 'on' : 'off');
/** @type {__VLS_StyleScopedClasses['console-container']} */ ;
/** @type {__VLS_StyleScopedClasses['console-titlebar']} */ ;
/** @type {__VLS_StyleScopedClasses['console-titlebar-left']} */ ;
/** @type {__VLS_StyleScopedClasses['console-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['console-dot--red']} */ ;
/** @type {__VLS_StyleScopedClasses['console-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['console-dot--yellow']} */ ;
/** @type {__VLS_StyleScopedClasses['console-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['console-dot--green']} */ ;
/** @type {__VLS_StyleScopedClasses['console-title']} */ ;
/** @type {__VLS_StyleScopedClasses['console-titlebar-right']} */ ;
/** @type {__VLS_StyleScopedClasses['console-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['console-output']} */ ;
/** @type {__VLS_StyleScopedClasses['console-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['console-prompt']} */ ;
/** @type {__VLS_StyleScopedClasses['console-cursor']} */ ;
/** @type {__VLS_StyleScopedClasses['console-ts']} */ ;
/** @type {__VLS_StyleScopedClasses['console-msg']} */ ;
/** @type {__VLS_StyleScopedClasses['console-prompt-line']} */ ;
/** @type {__VLS_StyleScopedClasses['console-prompt']} */ ;
/** @type {__VLS_StyleScopedClasses['console-cursor']} */ ;
/** @type {__VLS_StyleScopedClasses['console-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['console-footer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['console-footer-item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatDateTime: formatDateTime,
            lines: lines,
            scrollEl: scrollEl,
            autoScroll: autoScroll,
            isConnected: isConnected,
            connectionLabel: connectionLabel,
            handleScroll: handleScroll,
            clearConsole: clearConsole,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=LogConsole.vue.js.map
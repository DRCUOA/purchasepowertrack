<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { formatDateTime } from '@basket/shared';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

const lines = ref<LogEntry[]>([]);
const scrollEl = ref<HTMLElement | null>(null);
const autoScroll = ref(true);
const isConnected = ref(false);
const maxLines = 500;

let evtSource: EventSource | null = null;

const connectionLabel = computed(() =>
  isConnected.value ? 'CONNECTED' : 'DISCONNECTED',
);

function scrollToBottom() {
  if (!autoScroll.value || !scrollEl.value) return;
  nextTick(() => {
    scrollEl.value!.scrollTop = scrollEl.value!.scrollHeight;
  });
}

function handleScroll() {
  if (!scrollEl.value) return;
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
      const entry: LogEntry = JSON.parse(event.data);
      lines.value.push(entry);
      if (lines.value.length > maxLines) {
        lines.value.splice(0, lines.value.length - maxLines);
      }
      scrollToBottom();
    } catch { /* ignore malformed */ }
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
</script>

<template>
  <div class="console-container">
    <div class="console-titlebar">
      <div class="console-titlebar-left">
        <span class="console-dot console-dot--red"></span>
        <span class="console-dot console-dot--yellow"></span>
        <span class="console-dot console-dot--green"></span>
        <span class="console-title">system_log</span>
      </div>
      <div class="console-titlebar-right">
        <span :class="['console-status', isConnected ? 'console-status--on' : 'console-status--off']">
          {{ connectionLabel }}
        </span>
        <button class="console-btn" @click="clearConsole" title="Clear">CLR</button>
      </div>
    </div>
    <div
      ref="scrollEl"
      class="console-output"
      @scroll="handleScroll"
    >
      <div v-if="lines.length === 0" class="console-empty">
        <span class="console-prompt">&gt;</span> awaiting signal&hellip;
        <span class="console-cursor"></span>
      </div>
      <div
        v-for="(entry, i) in lines"
        :key="i"
        :class="['console-line', `console-line--${entry.level}`]"
      >
        <span class="console-ts">{{ formatDateTime(entry.timestamp) }}</span>
        <span :class="['console-level', `console-level--${entry.level}`]">{{ entry.level.toUpperCase().padEnd(5) }}</span>
        <span class="console-msg">{{ entry.message }}</span>
      </div>
      <div v-if="lines.length > 0" class="console-prompt-line">
        <span class="console-prompt">&gt;</span>
        <span class="console-cursor"></span>
      </div>
    </div>
    <div class="console-footer">
      <span class="console-footer-item">{{ lines.length }} entries</span>
      <span class="console-footer-item">auto-scroll: {{ autoScroll ? 'on' : 'off' }}</span>
    </div>
  </div>
</template>

<style scoped>
.console-container {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #1a1f2e;
  box-shadow:
    0 0 20px rgba(0, 255, 65, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.5);
  font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', Consolas, 'Liberation Mono', monospace;
  background: #0a0e17;
}

/* ---- Title bar ---- */

.console-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #111827;
  border-bottom: 1px solid #1e2a3a;
  user-select: none;
}

.console-titlebar-left {
  display: flex;
  align-items: center;
  gap: 7px;
}

.console-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

.console-dot--red { background: #ff5f57; }
.console-dot--yellow { background: #febc2e; }
.console-dot--green { background: #28c840; }

.console-title {
  margin-left: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7a8d;
  letter-spacing: 0.08em;
  text-transform: lowercase;
}

.console-titlebar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.console-status {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.console-status--on {
  color: #00ff41;
  text-shadow: 0 0 6px rgba(0, 255, 65, 0.5);
}

.console-status--off {
  color: #ff4444;
  text-shadow: 0 0 6px rgba(255, 68, 68, 0.4);
}

.console-btn {
  background: #1a2332;
  border: 1px solid #2a3a4e;
  color: #6b7a8d;
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 3px 10px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s;
}

.console-btn:hover {
  background: #243447;
  color: #00ff41;
  border-color: #00ff41;
}

/* ---- Output area ---- */

.console-output {
  height: 320px;
  overflow-y: auto;
  padding: 12px 14px;
  background:
    linear-gradient(
      rgba(0, 255, 65, 0.012) 1px,
      transparent 1px
    );
  background-size: 100% 22px;
  position: relative;
}

/* scan-line overlay */
.console-output::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.08) 2px,
    rgba(0, 0, 0, 0.08) 4px
  );
}

/* scrollbar */
.console-output::-webkit-scrollbar {
  width: 6px;
}

.console-output::-webkit-scrollbar-track {
  background: #0a0e17;
}

.console-output::-webkit-scrollbar-thumb {
  background: #1e2a3a;
  border-radius: 3px;
}

.console-output::-webkit-scrollbar-thumb:hover {
  background: #2a3a4e;
}

/* ---- Log lines ---- */

.console-line {
  display: flex;
  gap: 8px;
  font-size: 12px;
  line-height: 20px;
  white-space: pre-wrap;
  word-break: break-all;
}

.console-ts {
  color: #3a4a5e;
  flex-shrink: 0;
  font-size: 11px;
}

.console-level {
  flex-shrink: 0;
  font-weight: 700;
  font-size: 11px;
  width: 42px;
  text-align: right;
}

.console-level--info {
  color: #00ff41;
  text-shadow: 0 0 4px rgba(0, 255, 65, 0.3);
}

.console-level--warn {
  color: #ffb300;
  text-shadow: 0 0 4px rgba(255, 179, 0, 0.3);
}

.console-level--error {
  color: #ff4444;
  text-shadow: 0 0 4px rgba(255, 68, 68, 0.3);
}

.console-msg {
  color: #c5d0dc;
}

.console-line--warn .console-msg {
  color: #e6c97a;
}

.console-line--error .console-msg {
  color: #ff8888;
}

/* ---- Empty / prompt ---- */

.console-empty {
  color: #3a5a3a;
  font-size: 13px;
  padding: 8px 0;
}

.console-prompt {
  color: #00ff41;
  text-shadow: 0 0 6px rgba(0, 255, 65, 0.4);
  font-weight: 700;
}

.console-prompt-line {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 2px;
  font-size: 13px;
}

.console-cursor {
  display: inline-block;
  width: 8px;
  height: 15px;
  background: #00ff41;
  opacity: 0.8;
  animation: blink 1s step-end infinite;
  vertical-align: middle;
  box-shadow: 0 0 6px rgba(0, 255, 65, 0.4);
}

@keyframes blink {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0; }
}

/* ---- Footer ---- */

.console-footer {
  display: flex;
  justify-content: space-between;
  padding: 5px 14px;
  background: #111827;
  border-top: 1px solid #1e2a3a;
  font-size: 10px;
  color: #3a4a5e;
  letter-spacing: 0.06em;
  user-select: none;
}

.console-footer-item {
  text-transform: uppercase;
}
</style>

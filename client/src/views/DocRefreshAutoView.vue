<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { marked } from 'marked';
import readme from '../../../README_Refresh_Auto.md?raw';

const readmeHtml = computed(() => marked.parse(readme) as string);
</script>

<template>
  <div class="doc-refresh">
    <header class="doc-refresh-header">
      <RouterLink :to="{ name: 'operations' }" class="doc-back">
        ← Operations
      </RouterLink>
      <h1 class="page-title">Auto-refresh setup</h1>
      <p class="page-sub">
        Rendered from
        <code>README_Refresh_Auto.md</code>
        (repository root). In development this tracks the file on disk; in
        production the HTML is produced when the client bundle is built.
      </p>
    </header>
    <article class="doc-refresh-body">
      <div class="doc-md" v-html="readmeHtml"></div>
    </article>
  </div>
</template>

<style scoped>
.doc-refresh {
  max-width: 56rem;
  margin: 0 auto;
}

.doc-refresh-header {
  margin-bottom: var(--space-6);
}

.doc-back {
  display: inline-block;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
}

.page-sub {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.page-sub code {
  font-family: var(--font-mono);
  font-size: 0.9em;
}

.doc-refresh-body {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  overflow: auto;
  max-height: calc(100vh - 11rem);
}

/* Markdown output (v-html): use :deep() so scoped styles apply */
.doc-md :deep(h1) {
  font-size: var(--text-2xl);
  font-weight: 700;
  margin: var(--space-8) 0 var(--space-3);
  line-height: 1.25;
}

.doc-md :deep(h1:first-child) {
  margin-top: 0;
}

.doc-md :deep(h2) {
  font-size: var(--text-xl);
  font-weight: 650;
  margin: var(--space-8) 0 var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border-light);
  line-height: 1.3;
}

.doc-md :deep(h3) {
  font-size: var(--text-lg);
  font-weight: 600;
  margin: var(--space-6) 0 var(--space-2);
  line-height: 1.35;
}

.doc-md :deep(p) {
  margin: 0 0 var(--space-4);
  line-height: 1.65;
}

.doc-md :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.doc-md :deep(a:hover) {
  color: var(--color-primary-hover);
}

.doc-md :deep(ul),
.doc-md :deep(ol) {
  margin: 0 0 var(--space-4);
  padding-left: var(--space-6);
}

.doc-md :deep(li) {
  margin-bottom: var(--space-2);
  line-height: 1.6;
}

.doc-md :deep(li > p) {
  margin-bottom: var(--space-2);
}

.doc-md :deep(ul ul),
.doc-md :deep(ol ol),
.doc-md :deep(ul ol),
.doc-md :deep(ol ul) {
  margin-bottom: var(--space-2);
}

.doc-md :deep(blockquote) {
  margin: 0 0 var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-left: 4px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text-secondary);
}

.doc-md :deep(hr) {
  border: 0;
  border-top: 1px solid var(--color-border);
  margin: var(--space-6) 0;
}

.doc-md :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
  margin: 0 0 var(--space-4);
}

.doc-md :deep(th),
.doc-md :deep(td) {
  border: 1px solid var(--color-border);
  padding: var(--space-2) var(--space-3);
  text-align: left;
  vertical-align: top;
}

.doc-md :deep(th) {
  background: var(--color-bg);
  font-weight: 600;
}

.doc-md :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.88em;
  padding: 0.125em 0.35em;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
}

.doc-md :deep(pre) {
  margin: 0 0 var(--space-4);
  padding: var(--space-4);
  overflow-x: auto;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  line-height: 1.5;
}

.doc-md :deep(pre code) {
  padding: 0;
  border: 0;
  background: transparent;
  font-size: var(--text-sm);
}

.doc-md :deep(strong) {
  font-weight: 650;
}

.doc-md :deep(input[type='checkbox']) {
  margin-right: var(--space-2);
  accent-color: var(--color-primary);
}
</style>

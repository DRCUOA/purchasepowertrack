<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue';
import AppNav from './components/layout/AppNav.vue';
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <div class="app-body">
      <AppNav />
      <main class="app-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-body {
  display: flex;
  flex: 1;
}
.app-main {
  flex: 1;
  padding: 1.5rem 2rem;
  max-width: 1200px;
}
@media (max-width: 768px) {
  .app-body {
    flex-direction: column;
  }
  .app-main {
    padding: 1rem;
  }
}
</style>

import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'analyse',
      component: () => import('../views/AnalyseView.vue'),
    },
    {
      path: '/operations',
      name: 'operations',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/docs/auto-refresh',
      name: 'auto-refresh-readme',
      component: () => import('../views/DocRefreshAutoView.vue'),
    },
    // Legacy alias — keeps old links / bookmarks working.
    {
      path: '/dashboard',
      redirect: { name: 'operations' },
    },
    {
      path: '/basket',
      name: 'basket',
      component: () => import('../views/BasketItemsView.vue'),
    },
    {
      path: '/evidence',
      name: 'evidence',
      component: () => import('../views/PriceEvidenceView.vue'),
    },
    {
      path: '/evidence/:itemKey',
      name: 'evidence-item',
      component: () => import('../views/PriceEvidenceView.vue'),
    },
    {
      path: '/flagged',
      name: 'flagged',
      component: () => import('../views/FlaggedItemsView.vue'),
    },
    {
      path: '/trends',
      name: 'trends',
      component: () => import('../views/TrendsView.vue'),
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
  ],
});

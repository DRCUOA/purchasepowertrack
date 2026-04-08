import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
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
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
  ],
});

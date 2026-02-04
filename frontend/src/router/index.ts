import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStores';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import TodoView from '../views/TodoView.vue';
import SettingsView from '../views/SettingsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/todos',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true },
    },
    {
      path: '/todos',
      name: 'todos',
      component: TodoView,
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  }
  // Check if route requires guest (not logged in)
  else if (to.meta.requiresGuest && isAuthenticated) {
    next('/todos');
  }
  // Allow navigation
  else {
    next();
  }
});

export default router;
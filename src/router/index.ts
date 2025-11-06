import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/worker',
      name: 'worker',
      component: () => import('../views/WorkerView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignUpView.vue'),
    }
  ],
})

// Navigation guard para verificar autenticación y roles
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')

    // Si no hay token, redirigir a login
    if (!token) {
      next('/login')
      return
    }

    // Verificar si el token es válido
    try {
      // Si no hay usuario cargado, intentar obtenerlo
      if (!authStore.user) {
        authStore.token = token
        await authStore.fetchCurrentUser()
      }

      // Verificar si la ruta requiere rol de admin
      if (to.meta.requiresAdmin && !authStore.isAdmin) {
        next('/worker')
        return
      }

      // Si llegamos aquí, el token es válido y el rol es correcto
      next()
    } catch {
      // El token expiró o es inválido
      authStore.logout()
      next('/login')
    }
  } else {
    next()
  }
})

export default router

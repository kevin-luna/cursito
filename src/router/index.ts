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

// Navigation guard para verificar autenticación
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

      // Si llegamos aquí, el token es válido
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

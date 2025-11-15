import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService, {
  type LoginRequest,
  type RegisterRequest,
  type Worker,
} from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<Worker | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  // role: 0 = docente/teacher, 1 = admin/jefe de departamento
  const isAdmin = computed(() => user.value?.role === 1 || user.value?.role === '1')
  const isTeacher = computed(() => user.value?.role === 0 || user.value?.role === '0')
  const isCoordinator = computed(() => user.value?.role === 1 || user.value?.role === '1')

  // Actions
  async function login(credentials: LoginRequest) {
    try {
      loading.value = true
      error.value = null

      const response = await authService.login(credentials)

      // Guardar token en localStorage y state
      token.value = response.access_token
      localStorage.setItem('token', response.access_token)

      // Obtener información completa del usuario
      await fetchCurrentUser()

      return response
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al iniciar sesión'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterRequest) {
    try {
      loading.value = true
      error.value = null

      const newUser = await authService.register(data)

      // Después del registro, hacer login automáticamente
      await login({
        email: data.email,
        password: data.password,
      })

      return newUser
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al registrar usuario'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    try {
      const currentUser = await authService.getCurrentUser()
      user.value = currentUser
      localStorage.setItem('user', JSON.stringify(currentUser))
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al obtener usuario'
      throw err
    }
  }

  async function logout() {
    authService.logout()
    user.value = null
    token.value = null
    error.value = null
  }

  async function initialize() {
    // Cargar token y usuario del localStorage al iniciar la app
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)

      // Verificar que el token siga siendo válido
      try {
        await fetchCurrentUser()
      } catch (err) {
        // Si el token no es válido, limpiar
        logout()
      }
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    isTeacher,
    isCoordinator,
    // Actions
    login,
    register,
    logout,
    initialize,
    fetchCurrentUser,
    clearError,
  }
})

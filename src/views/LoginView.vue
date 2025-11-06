<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const errorMessage = ref('')

const emailRules = [
  (v: string) => !!v || 'El correo electrónico es requerido',
  (v: string) => /.+@.+\..+/.test(v) || 'El correo electrónico debe ser válido',
]

const passwordRules = [(v: string) => !!v || 'La contraseña es requerida']

const handleLogin = async () => {
  try {
    errorMessage.value = ''

    await authStore.login({
      email: email.value,
      password: password.value,
    })

    // Redirigir al home después del login exitoso
    router.push({ name: 'home' })
  } catch (error: any) {
    console.error('Error en login:', error)
    errorMessage.value = error.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.'
  }
}
</script>

<template>
  <v-container fluid class="fill-height login-container pa-0">
    <v-row align="center" justify="center" class="fill-height ma-0" style="width: 100%;">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">
        <v-card elevation="8" class="login-card">
          <!-- Header con logo/icono -->
          <v-card-text class="text-center pt-8 pb-4">
            <v-avatar size="80" color="primary" class="mb-4">
              <v-icon size="50" color="white">mdi-school</v-icon>
            </v-avatar>
            <h1 class="text-h4 font-weight-bold primary--text mb-2">Cursito</h1>
            <p class="text-subtitle-1 text-grey-darken-1">Inicia sesión en tu cuenta</p>
          </v-card-text>

          <v-card-text class="px-8 pb-8">
            <!-- Mensaje de error -->
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              closable
              @click:close="errorMessage = ''"
              class="mb-4"
            >
              {{ errorMessage }}
            </v-alert>

            <v-form @submit.prevent="handleLogin">
              <!-- Campo de correo electrónico -->
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Correo electrónico"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                color="primary"
                class="mb-2"
                type="email"
                autocomplete="email"
              ></v-text-field>

              <!-- Campo de contraseña -->
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                label="Contraseña"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                color="primary"
                class="mb-2"
                autocomplete="current-password"
              ></v-text-field>

              <!-- Recordarme y recuperar contraseña -->
              <v-row class="mb-4" align="center">
                <v-col cols="6">
                  <v-checkbox
                    v-model="rememberMe"
                    label="Recordarme"
                    color="primary"
                    hide-details
                    density="compact"
                  ></v-checkbox>
                </v-col>
                <v-col cols="6" class="text-right">
                  <a href="#" class="text-decoration-none text-primary">¿Olvidaste tu contraseña?</a>
                </v-col>
              </v-row>

              <!-- Botón de inicio de sesión -->
              <v-btn
                type="submit"
                :loading="authStore.loading"
                block
                size="large"
                color="primary"
                class="mb-4 text-none"
                elevation="2"
              >
                <v-icon start>mdi-login</v-icon>
                Iniciar sesión
              </v-btn>

              <!-- Divider -->
              <v-divider class="my-6"></v-divider>

              <!-- Registro -->
              <div class="text-center">
                <span class="text-grey-darken-1">¿No tienes una cuenta?</span>
                <router-link
                  :to="{ name: 'signup' }"
                  class="text-decoration-none text-primary font-weight-medium ml-1"
                >
                  Regístrate
                </router-link>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Footer -->
        <div class="text-center mt-6">
          <p class="text-caption text-grey">
            &copy; 2025 Cursito. Todos los derechos reservados.
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-container {
  background: white;
  min-height: 100vh;
  width: 100vw !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
}

.login-card {
  border-radius: 16px !important;
  background: #ffffff;
}

.primary--text {
  color: #1e3a8a !important;
}

.text-primary {
  color: #1e3a8a !important;
}

.text-grey-darken-1 {
  color: #64748b !important;
}

.text-grey {
  color: #94a3b8 !important;
}
</style>

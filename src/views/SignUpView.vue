<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Refs para los campos del formulario
const nombreCompleto = ref('')
const apellidoPaterno = ref('')
const apellidoMaterno = ref('')
const email = ref('')
const departamento = ref('')
const rfc = ref('')
const curp = ref('')
const sexo = ref('')
const telefono = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const formValid = ref(false)

// Lista de departamentos
const departamentos = [
  'Sistemas y Computación',
  'Ingeniería Industrial',
  'Ingeniería Electrónica',
  'Ingeniería Mecánica',
  'Ingeniería Química',
  'Ciencias Básicas',
  'Administración',
  'Recursos Humanos',
  'Servicios Escolares',
]

// Reglas de validación
const nombreRules = [
  (v: string) => !!v || 'El nombre completo es requerido',
  (v: string) => v.length <= 45 || 'El nombre no puede exceder 45 caracteres',
]

const apellidoPaternoRules = [
  (v: string) => !!v || 'El apellido paterno es requerido',
  (v: string) => v.length <= 40 || 'El apellido paterno no puede exceder 40 caracteres',
]

const apellidoMaternoRules = [
  (v: string) => !!v || 'El apellido materno es requerido',
  (v: string) => v.length <= 40 || 'El apellido materno no puede exceder 40 caracteres',
]

const emailRules = [
  (v: string) => !!v || 'El correo electrónico es requerido',
  (v: string) =>
    /@veracruz\.tecnm\.mx$/.test(v) ||
    'El correo debe ser del dominio @veracruz.tecnm.mx',
]

const departamentoRules = [(v: string) => !!v || 'El departamento es requerido']

const rfcRules = [
  (v: string) => !!v || 'El RFC es requerido',
  (v: string) => v.length === 13 || 'El RFC debe tener exactamente 13 caracteres',
  (v: string) => /^[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3}$/.test(v) || 'Formato de RFC inválido',
]

const curpRules = [
  (v: string) => !!v || 'El CURP es requerido',
  (v: string) => v.length === 18 || 'El CURP debe tener exactamente 18 caracteres',
  (v: string) =>
    /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$/.test(v) || 'Formato de CURP inválido',
]

const sexoRules = [(v: string) => !!v || 'El sexo es requerido']

const telefonoRules = [
  (v: string) => !!v || 'El teléfono es requerido',
  (v: string) => /^[0-9]{10}$/.test(v) || 'El teléfono debe tener exactamente 10 dígitos',
]

const passwordRules = [
  (v: string) => !!v || 'La contraseña es requerida',
  (v: string) => v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Confirma tu contraseña',
  (v: string) => v === password.value || 'Las contraseñas no coinciden',
]

const handleSignUp = async () => {
  loading.value = true
  // Simular llamada a API
  setTimeout(() => {
    loading.value = false
    console.log('Registro:', {
      nombreCompleto: nombreCompleto.value,
      apellidoPaterno: apellidoPaterno.value,
      apellidoMaterno: apellidoMaterno.value,
      email: email.value,
      departamento: departamento.value,
      rfc: rfc.value,
      curp: curp.value,
      sexo: sexo.value,
      telefono: telefono.value,
    })
    // Aquí iría la lógica de registro
    router.push({ name: 'login' })
  }, 1500)
}

const goToLogin = () => {
  router.push({ name: 'login' })
}
</script>

<template>
  <v-container fluid class="fill-height signup-container pa-0">
    <v-row align="center" justify="center" class="fill-height ma-0" style="width: 100%">
      <v-col cols="12" sm="10" md="8" lg="6" xl="5">
        <v-card elevation="8" class="signup-card my-6">
          <!-- Header -->
          <v-card-text class="text-center pt-8 pb-4">
            <v-avatar size="70" color="primary" class="mb-3">
              <v-icon size="40" color="white">mdi-account-plus</v-icon>
            </v-avatar>
            <h1 class="text-h4 font-weight-bold primary--text mb-2">Registro</h1>
            <p class="text-subtitle-1 text-grey-darken-1">Crea tu cuenta en Cursito</p>
          </v-card-text>

          <v-card-text class="px-8 pb-8">
            <v-form v-model="formValid" @submit.prevent="handleSignUp">
              <!-- Nombre completo -->
              <v-text-field
                v-model="nombreCompleto"
                :rules="nombreRules"
                label="Nombre completo"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                color="primary"
                class="mb-2"
                counter="45"
                maxlength="45"
              ></v-text-field>

              <!-- Apellidos en dos columnas -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="apellidoPaterno"
                    :rules="apellidoPaternoRules"
                    label="Apellido paterno"
                    prepend-inner-icon="mdi-account-details"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    counter="40"
                    maxlength="40"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="apellidoMaterno"
                    :rules="apellidoMaternoRules"
                    label="Apellido materno"
                    prepend-inner-icon="mdi-account-details"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    counter="40"
                    maxlength="40"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Correo electrónico -->
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Correo electrónico institucional"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                color="primary"
                class="mb-2"
                type="email"
                hint="Debe terminar en @veracruz.tecnm.mx"
                persistent-hint
              ></v-text-field>

              <!-- Departamento -->
              <v-select
                v-model="departamento"
                :rules="departamentoRules"
                :items="departamentos"
                label="Departamento"
                prepend-inner-icon="mdi-domain"
                variant="outlined"
                color="primary"
                class="mb-2 mt-4"
              ></v-select>

              <!-- RFC y CURP en dos columnas -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="rfc"
                    :rules="rfcRules"
                    label="RFC"
                    prepend-inner-icon="mdi-card-account-details"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    counter="13"
                    maxlength="13"
                    hint="13 caracteres"
                    @input="rfc = rfc.toUpperCase()"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="curp"
                    :rules="curpRules"
                    label="CURP"
                    prepend-inner-icon="mdi-card-account-details-outline"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    counter="18"
                    maxlength="18"
                    hint="18 caracteres"
                    @input="curp = curp.toUpperCase()"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Sexo y Teléfono -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-radio-group
                    v-model="sexo"
                    :rules="sexoRules"
                    label="Sexo"
                    inline
                    color="primary"
                  >
                    <v-radio label="Hombre" value="M">
                      <template #label>
                        <div class="d-flex align-center">
                          <v-icon class="mr-2">mdi-gender-male</v-icon>
                          <span>Hombre</span>
                        </div>
                      </template>
                    </v-radio>
                    <v-radio label="Mujer" value="F">
                      <template #label>
                        <div class="d-flex align-center">
                          <v-icon class="mr-2">mdi-gender-female</v-icon>
                          <span>Mujer</span>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="telefono"
                    :rules="telefonoRules"
                    label="Teléfono"
                    prepend-inner-icon="mdi-phone"
                    variant="outlined"
                    color="primary"
                    class="mb-2"
                    counter="10"
                    maxlength="10"
                    hint="10 dígitos"
                    type="tel"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Contraseña -->
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                label="Contraseña"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                color="primary"
                class="mb-2"
              ></v-text-field>

              <!-- Confirmar Contraseña -->
              <v-text-field
                v-model="confirmPassword"
                :rules="confirmPasswordRules"
                :type="showConfirmPassword ? 'text' : 'password'"
                label="Confirmar contraseña"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                variant="outlined"
                color="primary"
                class="mb-4"
              ></v-text-field>

              <!-- Botón de registro -->
              <v-btn
                type="submit"
                :loading="loading"
                :disabled="!formValid"
                block
                size="large"
                color="primary"
                class="mb-4 text-none"
                elevation="2"
              >
                <v-icon start>mdi-account-plus</v-icon>
                Crear cuenta
              </v-btn>

              <!-- Divider -->
              <v-divider class="my-4"></v-divider>

              <!-- Login -->
              <div class="text-center">
                <span class="text-grey-darken-1">¿Ya tienes una cuenta?</span>
                <a
                  @click="goToLogin"
                  class="text-decoration-none text-primary font-weight-medium ml-1"
                  style="cursor: pointer"
                >
                  Inicia sesión
                </a>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Footer -->
        <div class="text-center mb-6">
          <p class="text-caption text-grey">
            &copy; 2025 Cursito. Todos los derechos reservados.
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.signup-container {
  background: white;
  min-height: 100vh;
  width: 100vw !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
}

.signup-card {
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

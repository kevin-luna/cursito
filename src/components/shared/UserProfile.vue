<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import authService, { type Worker, type ChangePasswordRequest } from '@/services/authService'
import departmentService, { type Department } from '@/services/departmentService'
import workerService from '@/services/workerService'

const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const departments = ref<Department[]>([])
const showPasswordDialog = ref(false)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const positionOptions = [
  { value: 0, title: 'Docente' },
  { value: 1, title: 'Administrativo' },
]

// Formulario de datos personales
const formData = ref<Partial<Worker>>({
  name: '',
  father_surname: '',
  mother_surname: '',
  email: '',
  telephone: '',
  rfc: '',
  curp: '',
  sex: 0,
  department_id: '',
  position: 0,
})

// Formulario de cambio de contraseña
const passwordForm = ref<ChangePasswordRequest>({
  current_password: '',
  new_password: '',
})

const confirmPassword = ref('')

const sexOptions = [
  { value: 0, title: 'Mujer' },
  { value: 1, title: 'Hombre' },
]

const positionLabel = computed(() => {
  if (authStore.user?.position === 1 || authStore.user?.position === '1') {
    return 'Jefe de Departamento'
  }
  return 'Docente'
})

const departmentName = computed(() => {
  const dept = departments.value.find((d) => d.id === formData.value.department_id)
  return dept?.name || 'Cargando...'
})

const loadDepartments = async () => {
  try {
    departments.value = await departmentService.getAll()
  } catch (error: any) {
    console.error('Error loading departments:', error)
  }
}

const loadUserData = () => {
  if (authStore.user) {
    formData.value = {
      name: authStore.user.name,
      father_surname: authStore.user.father_surname,
      mother_surname: authStore.user.mother_surname,
      email: authStore.user.email,
      telephone: authStore.user.telephone,
      rfc: authStore.user.rfc,
      curp: authStore.user.curp,
      sex: authStore.user.sex,
      department_id: authStore.user.department_id,
      position: authStore.user.position
    }
  }
}

const saveProfile = async () => {
  saving.value = true
  try {
    // Crear un objeto solo con los campos que han cambiado
    const updates: Partial<Worker> = {}

    if (formData.value.name !== authStore.user?.name) updates.name = formData.value.name
    if (formData.value.father_surname !== authStore.user?.father_surname)
      updates.father_surname = formData.value.father_surname
    if (formData.value.mother_surname !== authStore.user?.mother_surname)
      updates.mother_surname = formData.value.mother_surname
    if (formData.value.email !== authStore.user?.email) updates.email = formData.value.email
    if (formData.value.telephone !== authStore.user?.telephone)
      updates.telephone = formData.value.telephone
    if (formData.value.rfc !== authStore.user?.rfc) updates.rfc = formData.value.rfc
    if (formData.value.curp !== authStore.user?.curp) updates.curp = formData.value.curp
    if (formData.value.sex !== authStore.user?.sex) updates.sex = formData.value.sex
    if (formData.value.department_id !== authStore.user?.department_id)
      updates.department_id = formData.value.department_id

    if (Object.keys(updates).length === 0) {
      snackbarMessage.value = 'No hay cambios para guardar'
      snackbarColor.value = 'info'
      showSnackbar.value = true
      return
    }

    if (!authStore.user?.id) {
      throw new Error('No se pudo obtener el ID del usuario')
    }

    await workerService.update(authStore.user.id, updates)
    await authStore.fetchCurrentUser()
    loadUserData()

    snackbarMessage.value = 'Perfil actualizado exitosamente'
    snackbarColor.value = 'success'
    showSnackbar.value = true
  } catch (error: any) {
    // Usar el error del servicio de trabajadores si está disponible
    snackbarMessage.value = workerService.lastError || error.response?.data?.detail || 'Error al actualizar el perfil'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.new_password !== confirmPassword.value) {
    snackbarMessage.value = 'Las contraseñas no coinciden'
    snackbarColor.value = 'error'
    showSnackbar.value = true
    return
  }

  if (passwordForm.value.new_password.length < 8) {
    snackbarMessage.value = 'La contraseña debe tener al menos 8 caracteres'
    snackbarColor.value = 'error'
    showSnackbar.value = true
    return
  }

  saving.value = true
  try {
    await authService.changePassword(passwordForm.value)

    snackbarMessage.value = 'Contraseña cambiada exitosamente'
    snackbarColor.value = 'success'
    showSnackbar.value = true

    showPasswordDialog.value = false
    passwordForm.value = { current_password: '', new_password: '' }
    confirmPassword.value = ''
  } catch (error: any) {
    snackbarMessage.value = error.response?.data?.detail || 'Error al cambiar la contraseña'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    saving.value = false
  }
}

const cancelPasswordChange = () => {
  showPasswordDialog.value = false
  passwordForm.value = { current_password: '', new_password: '' }
  confirmPassword.value = ''
}

onMounted(() => {
  loadDepartments()
  loadUserData()
})
</script>

<template>
  <v-card>
    <v-card-title class="bg-primary text-white">
      <v-icon class="mr-2">mdi-account-circle</v-icon>
      Mi Perfil
    </v-card-title>

    <v-card-text class="pa-6">
      <v-row v-if="loading">
        <v-col cols="12" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-4">Cargando información...</p>
        </v-col>
      </v-row>

      <v-form v-else @submit.prevent="saveProfile">
        <!-- Información del sistema (solo lectura) -->
        <v-row class="mb-4">
          <v-col cols="12">
            <h3 class="text-h6 mb-3">Información del Sistema</h3>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              label="ID de Usuario"
              :model-value="authStore.user?.id"
              readonly
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-identifier"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="formData.position"
              :items="positionOptions"
              readonly
              label="Puesto"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-briefcase"
            />
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <!-- Información personal editable -->
        <v-row class="mb-4">
          <v-col cols="12">
            <h3 class="text-h6 mb-3">Información Personal</h3>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.name"
              label="Nombre"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              counter="45"
              maxlength="45"
              :rules="[
                (v) => !!v || 'El nombre es requerido',
                (v) => (v && v.trim().length > 0) || 'El nombre no puede estar vacío',
                (v) => (v && v.length <= 45) || 'El nombre no puede exceder 45 caracteres',
                (v) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(v) || 'Solo se permiten letras, espacios y acentos'
              ]"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.father_surname"
              label="Apellido Paterno"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              counter="40"
              maxlength="40"
              :rules="[
                (v) => !!v || 'El apellido paterno es requerido',
                (v) => (v && v.trim().length > 0) || 'El apellido paterno no puede estar vacío',
                (v) => (v && v.length <= 40) || 'El apellido paterno no puede exceder 40 caracteres',
                (v) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(v) || 'Solo se permiten letras, espacios y acentos'
              ]"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.mother_surname"
              label="Apellido Materno"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              counter="40"
              maxlength="40"
              :rules="[
                (v) => {
                  if (!v || v.trim().length === 0) return true
                  return v.length <= 40 || 'El apellido materno no puede exceder 40 caracteres'
                },
                (v) => {
                  if (!v || v.trim().length === 0) return true
                  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(v) || 'Solo se permiten letras, espacios y acentos'
                }
              ]"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="formData.sex"
              :items="sexOptions"
              label="Sexo"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-gender-male-female"
              :rules="[(v) => v !== null && v !== undefined || 'El sexo es requerido']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.telephone"
              label="Teléfono"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-phone"
              counter="10"
              maxlength="10"
              :rules="[
                (v) => !!v || 'El teléfono es requerido',
                (v) => (v && v.trim().length > 0) || 'El teléfono no puede estar vacío',
                (v) => (v && v.length === 10) || 'El teléfono debe tener exactamente 10 dígitos',
                (v) => /^[0-9]{10}$/.test(v) || 'El teléfono solo puede contener números'
              ]"
            />
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <!-- Información de contacto -->
        <v-row class="mb-4">
          <v-col cols="12">
            <h3 class="text-h6 mb-3">Información de Contacto</h3>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.email"
              label="Correo Electrónico"
              type="email"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email"
              counter="64"
              maxlength="64"
              :rules="[
                (v) => !!v || 'El correo es requerido',
                (v) => (v && v.trim().length > 0) || 'El correo no puede estar vacío',
                (v) => (v && v.length <= 64) || 'El correo no puede exceder 64 caracteres',
                (v) => /.+@.+\..+/.test(v) || 'Correo inválido'
              ]"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="formData.department_id"
              :items="departments"
              item-title="name"
              item-value="id"
              label="Departamento"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-office-building"
              :rules="[(v) => !!v || 'El departamento es requerido']"
            />
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <!-- Información oficial -->
        <v-row class="mb-4">
          <v-col cols="12">
            <h3 class="text-h6 mb-3">Información Oficial</h3>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.rfc"
              label="RFC"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-card-account-details"
              counter="13"
              maxlength="13"
              @input="formData.rfc = formData.rfc?.toUpperCase()"
              :rules="[
                (v) => !!v || 'El RFC es requerido',
                (v) => (v && v.trim().length > 0) || 'El RFC no puede estar vacío',
                (v) => (v && v.length === 13) || 'El RFC debe tener exactamente 13 caracteres',
                (v) => /^[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3}$/.test(v) || 'Formato de RFC inválido'
              ]"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.curp"
              label="CURP"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-card-account-details"
              counter="18"
              maxlength="18"
              @input="formData.curp = formData.curp?.toUpperCase()"
              :rules="[
                (v) => !!v || 'El CURP es requerido',
                (v) => (v && v.trim().length > 0) || 'El CURP no puede estar vacío',
                (v) => (v && v.length === 18) || 'El CURP debe tener exactamente 18 caracteres',
                (v) => /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/.test(v) || 'Formato de CURP inválido'
              ]"
            />
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <!-- Botones de acción -->
        <v-row>
          <v-col cols="12" class="d-flex justify-end gap-3">
            <v-btn
              color="secondary"
              variant="outlined"
              prepend-icon="mdi-lock-reset"
              @click="showPasswordDialog = true"
            >
              Cambiar Contraseña
            </v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="saving"
              prepend-icon="mdi-content-save"
            >
              Guardar Cambios
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <!-- Dialog para cambiar contraseña -->
    <v-dialog v-model="showPasswordDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="bg-secondary text-white">
          <v-icon class="mr-2">mdi-lock-reset</v-icon>
          Cambiar Contraseña
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form @submit.prevent="changePassword">
            <v-text-field
              v-model="passwordForm.current_password"
              label="Contraseña Actual"
              type="password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock"
              class="mb-4"
              :rules="[(v) => !!v || 'La contraseña actual es requerida']"
            />
            <v-text-field
              v-model="passwordForm.new_password"
              label="Nueva Contraseña"
              type="password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-plus"
              class="mb-4"
              :rules="[(v) => !!v || 'La nueva contraseña es requerida', (v) => v.length >= 6 || 'Mínimo 6 caracteres']"
            />
            <v-text-field
              v-model="confirmPassword"
              label="Confirmar Nueva Contraseña"
              type="password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-check"
              :rules="[(v) => !!v || 'Confirma la nueva contraseña', (v) => v === passwordForm.new_password || 'Las contraseñas no coinciden']"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancelPasswordChange">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" @click="changePassword">
            Cambiar Contraseña
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensajes -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showSnackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>

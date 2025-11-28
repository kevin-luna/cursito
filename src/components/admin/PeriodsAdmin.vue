<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import periodService, { type Period, type CreatePeriodRequest } from '@/services/periodService'

const periods = ref<Period[]>([])
const loading = ref(false)
const dialog = ref(false)
const editMode = ref(false)
const selectedPeriod = ref<Period | null>(null)
const formData = ref<CreatePeriodRequest>({ name: '', start_date: '', end_date: '' })
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Pagination state
const page = ref(1)
const itemsPerPage = ref(10)

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Fecha Inicio', key: 'start_date' },
  { title: 'Fecha Fin', key: 'end_date' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const loadPeriods = async () => {
  loading.value = true
  try {
    const response = await periodService.getAll(page.value, itemsPerPage.value)
    periods.value = response
  } finally {
    loading.value = false
  }
}

// Watch for page or itemsPerPage changes
watch([page, itemsPerPage], () => {
  loadPeriods()
})

const openCreateDialog = () => {
  editMode.value = false
  formData.value = { name: '', start_date: '', end_date: '' }
  dialog.value = true
}

const openEditDialog = (period: Period) => {
  editMode.value = true
  selectedPeriod.value = period
  formData.value = { ...period }
  dialog.value = true
}

const savePeriod = async () => {
  loading.value = true
  try {
    if (editMode.value && selectedPeriod.value) {
      await periodService.update(selectedPeriod.value.id, formData.value)
      snackbarMessage.value = 'Periodo actualizado exitosamente'
    } else {
      await periodService.create(formData.value)
      snackbarMessage.value = 'Periodo creado exitosamente'
    }
    snackbarColor.value = 'success'
    snackbar.value = true
    dialog.value = false
    await loadPeriods()
  } catch {
    // Usar el error del servicio de periodos si está disponible
    snackbarMessage.value = periodService.lastError || 'Error al guardar el periodo'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadPeriods)
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between">
      <span class="text-h5">Gestión de Periodos</span>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Nuevo Periodo
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-data-table-server
        :headers="headers"
        :items="periods"
        :loading="loading"
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :items-per-page-options="[5, 10, 25, 50, 100]"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEditDialog(item)" />
        </template>
      </v-data-table-server>
    </v-card-text>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>{{ editMode ? 'Editar Periodo' : 'Nuevo Periodo' }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Nombre del Periodo"
                counter="100"
                maxlength="100"
                required
                :rules="[
                  (v) => !!v || 'El nombre del periodo es requerido',
                  (v) => (v && v.trim().length > 0) || 'El nombre no puede estar vacío',
                  (v) => (v && v.length <= 100) || 'El nombre no puede exceder 100 caracteres',
                  (v) => /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-]+$/.test(v) || 'Solo se permiten letras, números, espacios, acentos y guiones'
                ]"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="formData.start_date"
                label="Fecha Inicio"
                type="date"
                required
                :rules="[(v) => !!v || 'La fecha de inicio es requerida']"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="formData.end_date"
                label="Fecha Fin"
                type="date"
                required
                :rules="[
                  (v) => !!v || 'La fecha de fin es requerida',
                  (v) => !formData.start_date || !v || new Date(v) >= new Date(formData.start_date) || 'La fecha de fin debe ser posterior o igual a la fecha de inicio'
                ]"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="loading" @click="savePeriod">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensajes -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

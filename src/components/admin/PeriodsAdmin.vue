<script setup lang="ts">
import { ref, onMounted } from 'vue'
import periodService, { type Period, type CreatePeriodRequest } from '@/services/periodService'

const periods = ref<Period[]>([])
const loading = ref(false)
const dialog = ref(false)
const editMode = ref(false)
const selectedPeriod = ref<Period | null>(null)
const formData = ref<CreatePeriodRequest>({ name: '', start_date: '', end_date: '' })

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Fecha Inicio', key: 'start_date' },
  { title: 'Fecha Fin', key: 'end_date' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const loadPeriods = async () => {
  loading.value = true
  try {
    periods.value = await periodService.getAll()
  } finally {
    loading.value = false
  }
}

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
    } else {
      await periodService.create(formData.value)
    }
    dialog.value = false
    await loadPeriods()
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
      <v-data-table :headers="headers" :items="periods" :loading="loading">
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEditDialog(item)" />
        </template>
      </v-data-table>
    </v-card-text>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>{{ editMode ? 'Editar Periodo' : 'Nuevo Periodo' }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="formData.name" label="Nombre del Periodo" required />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="formData.start_date"
                label="Fecha Inicio"
                type="date"
                required
              />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="formData.end_date" label="Fecha Fin" type="date" required />
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
  </v-card>
</template>

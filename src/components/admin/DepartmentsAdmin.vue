<script setup lang="ts">
import { ref, onMounted } from 'vue'
import departmentService, {
  type Department,
  type CreateDepartmentRequest,
} from '@/services/departmentService'

const departments = ref<Department[]>([])
const loading = ref(false)
const dialog = ref(false)
const deleteDialog = ref(false)
const editMode = ref(false)
const selectedDepartment = ref<Department | null>(null)
const formData = ref<CreateDepartmentRequest>({ name: '' })

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const loadDepartments = async () => {
  loading.value = true
  try {
    departments.value = await departmentService.getAll()
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editMode.value = false
  formData.value = { name: '' }
  dialog.value = true
}

const openEditDialog = (department: Department) => {
  editMode.value = true
  selectedDepartment.value = department
  formData.value = { name: department.name }
  dialog.value = true
}

const saveDepartment = async () => {
  loading.value = true
  try {
    if (editMode.value && selectedDepartment.value) {
      await departmentService.update(selectedDepartment.value.id, formData.value)
    } else {
      await departmentService.create(formData.value)
    }
    dialog.value = false
    await loadDepartments()
  } finally {
    loading.value = false
  }
}

const deleteDepartment = async () => {
  if (!selectedDepartment.value) return
  loading.value = true
  try {
    await departmentService.delete(selectedDepartment.value.id)
    deleteDialog.value = false
    await loadDepartments()
  } finally {
    loading.value = false
  }
}

onMounted(loadDepartments)
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between">
      <span class="text-h5">Gestión de Departamentos</span>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Nuevo Departamento
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-data-table :headers="headers" :items="departments" :loading="loading">
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEditDialog(item)" />
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="
              selectedDepartment = item
              deleteDialog = true
            "
          />
        </template>
      </v-data-table>
    </v-card-text>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editMode ? 'Editar Departamento' : 'Nuevo Departamento' }}
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="formData.name" label="Nombre del Departamento" required />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="loading" @click="saveDepartment">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Está seguro de eliminar "{{ selectedDepartment?.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" :loading="loading" @click="deleteDepartment">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

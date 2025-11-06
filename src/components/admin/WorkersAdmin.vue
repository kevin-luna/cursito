<script setup lang="ts">
import { ref, onMounted } from 'vue'
import workerService from '@/services/workerService'
import departmentService, { type Department } from '@/services/departmentService'
import type { Worker } from '@/services/authService'

const workers = ref<Worker[]>([])
const departments = ref<Department[]>([])
const loading = ref(false)
const dialog = ref(false)
const deleteDialog = ref(false)
const selectedWorker = ref<Worker | null>(null)

const formData = ref({
  name: '',
  father_lastname: '',
  mother_lastname: '',
  department_id: '',
  role: '',
})

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Apellido Paterno', key: 'father_lastname' },
  { title: 'Apellido Materno', key: 'mother_lastname' },
  { title: 'Email', key: 'email' },
  { title: 'Rol', key: 'role' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const roleOptions = [
  { value: 'teacher', title: 'Docente' },
  { value: 'admin', title: 'Administrador' },
  { value: 'coordinator', title: 'Coordinador' },
]

const loadWorkers = async () => {
  loading.value = true
  try {
    workers.value = await workerService.getAll()
  } catch (error) {
    console.error('Error al cargar trabajadores:', error)
  } finally {
    loading.value = false
  }
}

const loadDepartments = async () => {
  try {
    departments.value = await departmentService.getAll()
  } catch (error) {
    console.error('Error al cargar departamentos:', error)
  }
}

const openEditDialog = (worker: Worker) => {
  selectedWorker.value = worker
  formData.value = {
    name: worker.name,
    father_lastname: worker.father_lastname,
    mother_lastname: worker.mother_lastname,
    department_id: worker.department_id,
    role: worker.role,
  }
  dialog.value = true
}

const openDeleteDialog = (worker: Worker) => {
  selectedWorker.value = worker
  deleteDialog.value = true
}

const saveWorker = async () => {
  if (!selectedWorker.value) return
  loading.value = true
  try {
    await workerService.update(selectedWorker.value.id, formData.value)
    dialog.value = false
    await loadWorkers()
  } catch (error) {
    console.error('Error al actualizar trabajador:', error)
  } finally {
    loading.value = false
  }
}

const deleteWorker = async () => {
  if (!selectedWorker.value) return
  loading.value = true
  try {
    await workerService.delete(selectedWorker.value.id)
    deleteDialog.value = false
    await loadWorkers()
  } catch (error) {
    console.error('Error al eliminar trabajador:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWorkers()
  loadDepartments()
})
</script>

<template>
  <div>
    <v-card>
      <v-card-title>
        <span class="text-h5">Gestión de Trabajadores</span>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="workers"
          :loading="loading"
          loading-text="Cargando trabajadores..."
        >
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEditDialog(item)" />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="openDeleteDialog(item)"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog para editar -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>Editar Trabajador</v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="formData.name" label="Nombre" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.father_lastname"
                  label="Apellido Paterno"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.mother_lastname"
                  label="Apellido Materno"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.department_id"
                  :items="departments"
                  item-title="name"
                  item-value="id"
                  label="Departamento"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.role"
                  :items="roleOptions"
                  label="Rol"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="loading" @click="saveWorker">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para confirmar eliminación -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Está seguro de que desea eliminar al trabajador "{{ selectedWorker?.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" :loading="loading" @click="deleteWorker">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

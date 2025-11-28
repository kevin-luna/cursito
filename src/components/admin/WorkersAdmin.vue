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
  rfc: '',
  curp: '',
  sex: 0,
  telephone: '',
  email: '',
  name: '',
  father_surname: '',
  mother_surname: '',
  department_id: '',
  position: 0,
})

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Apellido Paterno', key: 'father_surname' },
  { title: 'Apellido Materno', key: 'mother_surname' },
  { title: 'RFC', key: 'rfc' },
  { title: 'Email', key: 'email' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const roleOptions = [
  { value: 0, title: 'Docente' },
  { value: 1, title: 'Administrador' }
]

const sexOptions = [
  { value: 0, title: 'Mujer' },
  { value: 1, title: 'Hombre' }
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
    rfc: worker.rfc,
    curp: worker.curp,
    sex: worker.sex,
    telephone: worker.telephone,
    email: worker.email,
    name: worker.name,
    father_surname: worker.father_surname,
    mother_surname: worker.mother_surname,
    department_id: worker.department_id,
    position: worker.position,
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
                  v-model="formData.father_surname"
                  label="Apellido Paterno"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.mother_surname"
                  label="Apellido Materno"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.email"
                  label="Correo Electrónico"
                  type="email"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.telephone"
                  label="Teléfono"
                  maxlength="10"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.rfc"
                  label="RFC"
                  maxlength="13"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.curp"
                  label="CURP"
                  maxlength="18"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.sex"
                  :items="sexOptions"
                  item-title="title"
                  item-value="value"
                  label="Sexo"
                  required
                ></v-select>
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
                  v-model="formData.position"
                  :items="roleOptions"
                  item-title="title"
                  item-value="value"
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

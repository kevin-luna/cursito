<script setup lang="ts">
import { ref, onMounted } from 'vue'
import courseService, { type Course, type CreateCourseRequest } from '@/services/courseService'
import periodService, { type Period } from '@/services/periodService'

const courses = ref<Course[]>([])
const periods = ref<Period[]>([])
const loading = ref(false)
const dialog = ref(false)
const deleteDialog = ref(false)
const editMode = ref(false)
const selectedCourse = ref<Course | null>(null)

const formData = ref<CreateCourseRequest>({
  period_id: '',
  target: '',
  name: '',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  type: 0,
  mode: 0,
  profile: 0,
  goal: '',
  details: '',
})

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Objetivo', key: 'target' },
  { title: 'Fecha Inicio', key: 'start_date' },
  { title: 'Fecha Fin', key: 'end_date' },
  { title: 'Tipo', key: 'type' },
  { title: 'Modalidad', key: 'mode' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const typeOptions = [
  { value: 0, title: 'Diplomado' },
  { value: 1, title: 'Taller' },
]

const modeOptions = [
  { value: 0, title: 'Virtual' },
  { value: 1, title: 'Presencial' },
]

const profileOptions = [
  { value: 0, title: 'Formación' },
  { value: 1, title: 'Actualización Docente' },
]

const getTypeLabel = (type: number) => typeOptions.find((t) => t.value === type)?.title || ''
const getModeLabel = (mode: number) => modeOptions.find((m) => m.value === mode)?.title || ''

const loadCourses = async () => {
  loading.value = true
  try {
    courses.value = await courseService.getAll()
  } catch (error) {
    console.error('Error al cargar cursos:', error)
  } finally {
    loading.value = false
  }
}

const loadPeriods = async () => {
  try {
    periods.value = await periodService.getAll()
  } catch (error) {
    console.error('Error al cargar periodos:', error)
  }
}

const openCreateDialog = () => {
  editMode.value = false
  formData.value = {
    period_id: '',
    target: '',
    name: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    type: 0,
    mode: 0,
    profile: 0,
    goal: '',
    details: '',
  }
  dialog.value = true
}

const openEditDialog = (course: Course) => {
  editMode.value = true
  selectedCourse.value = course
  formData.value = { ...course }
  dialog.value = true
}

const openDeleteDialog = (course: Course) => {
  selectedCourse.value = course
  deleteDialog.value = true
}

const saveCourse = async () => {
  loading.value = true
  try {
    if (editMode.value && selectedCourse.value) {
      await courseService.update(selectedCourse.value.id, formData.value)
    } else {
      await courseService.create(formData.value)
    }
    dialog.value = false
    await loadCourses()
  } catch (error) {
    console.error('Error al guardar curso:', error)
  } finally {
    loading.value = false
  }
}

const deleteCourse = async () => {
  if (!selectedCourse.value) return
  loading.value = true
  try {
    await courseService.delete(selectedCourse.value.id)
    deleteDialog.value = false
    await loadCourses()
  } catch (error) {
    console.error('Error al eliminar curso:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCourses()
  loadPeriods()
})
</script>

<template>
  <div>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">Gestión de Cursos</span>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          Nuevo Curso
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="courses"
          :loading="loading"
          loading-text="Cargando cursos..."
        >
          <template v-slot:item.type="{ item }">
            {{ getTypeLabel(item.type) }}
          </template>
          <template v-slot:item.mode="{ item }">
            {{ getModeLabel(item.mode) }}
          </template>
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

    <!-- Dialog para crear/editar -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-card-title>
          {{ editMode ? 'Editar Curso' : 'Crear Nuevo Curso' }}
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="Nombre del Curso"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.period_id"
                  :items="periods"
                  item-title="name"
                  item-value="id"
                  label="Periodo"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.target"
                  label="Objetivo del Curso"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.start_date"
                  label="Fecha de Inicio"
                  type="date"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.end_date"
                  label="Fecha de Fin"
                  type="date"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.start_time"
                  label="Hora de Inicio"
                  type="time"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.end_time"
                  label="Hora de Fin"
                  type="time"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.type"
                  :items="typeOptions"
                  label="Tipo"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.mode"
                  :items="modeOptions"
                  label="Modalidad"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.profile"
                  :items="profileOptions"
                  label="Perfil"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.goal"
                  label="Meta del Curso"
                  rows="3"
                  required
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.details"
                  label="Detalles Adicionales"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="loading" @click="saveCourse">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para confirmar eliminación -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Está seguro de que desea eliminar el curso "{{ selectedCourse?.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" :loading="loading" @click="deleteCourse">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

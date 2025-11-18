<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import courseService, { type Course, type CreateCourseRequest } from '@/services/courseService'
import periodService, { type Period } from '@/services/periodService'

const courses = ref<Course[]>([])
const periods = ref<Period[]>([])
const loading = ref(false)
const dialog = ref(false)
const deleteDialog = ref(false)
const editMode = ref(false)
const selectedCourse = ref<Course | null>(null)

// Pagination state
const page = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const serverItemsLength = ref(0)

const formData = ref<CreateCourseRequest>({
  period_id: '',
  target: '',
  name: '',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  course_type: 0,
  modality: 0,
  course_profile: 0,
  goal: '',
  details: '',
  instructors: [],
})

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Objetivo', key: 'target' },
  { title: 'Fecha Inicio', key: 'start_date' },
  { title: 'Fecha Fin', key: 'end_date' },
  { title: 'Tipo', key: 'course_type' },
  { title: 'Modalidad', key: 'modality' },
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
    const allCourses = await courseService.getAll(page.value, itemsPerPage.value)
    courses.value = allCourses
    totalItems.value = allCourses.length
    serverItemsLength.value = allCourses.length
  } catch (error) {
    console.error('Error al cargar cursos:', error)
  } finally {
    loading.value = false
  }
}

const loadPeriods = async () => {
  try {
    const response = await periodService.getAll(1, 100)
    periods.value = response.items
  } catch (error) {
    console.error('Error al cargar periodos:', error)
  }
}

// Watch for page or itemsPerPage changes
watch([page, itemsPerPage], () => {
  loadCourses()
})

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
    course_type: 0,
    modality: 0,
    course_profile: 0,
    goal: '',
    details: '',
    instructors: [],
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
        <v-data-table-server
          :headers="headers"
          :items="courses"
          :loading="loading"
          :items-length="serverItemsLength"
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :items-per-page-options="[5, 10, 25, 50, 100]"
          loading-text="Cargando cursos..."
        >
          <template v-slot:item.course_type="{ item }">
            {{ getTypeLabel(item.course_type) }}
          </template>
          <template v-slot:item.modality="{ item }">
            {{ getModeLabel(item.modality) }}
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
        </v-data-table-server>
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
                  v-model="formData.course_type"
                  :items="typeOptions"
                  label="Tipo"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.modality"
                  :items="modeOptions"
                  label="Modalidad"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.course_profile"
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

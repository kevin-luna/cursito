<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import courseService, { type CreateCourseRequest, type Course } from '@/services/courseService'
import periodService, { type Period } from '@/services/periodService'
import workerService from '@/services/workerService'
import { useAuthStore } from '@/stores/auth'
import type { Worker } from '@/services/authService'

const props = defineProps<{
  editMode: boolean
  courseData?: Course | null
}>()

const emit = defineEmits<{
  'course-created': []
  'cancel': []
}>()

const authStore = useAuthStore()
const periods = ref<Period[]>([])
const workers = ref<Worker[]>([])
const loading = ref(false)

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
  instructors: [authStore.user?.id || '']
})

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

const loadData = async () => {
  loading.value = true
  try {
    periods.value = await periodService.getAll()
    workers.value = await workerService.getAll()
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
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
    instructors: [authStore.user?.id || '']
  }
}

// Cargar datos del curso cuando se pasa courseData (modo edición)
watch(
  () => [props.courseData, props.editMode] as const,
  ([newCourseData, isEditMode]) => {

    if (newCourseData && isEditMode) {
      formData.value = {
        period_id: newCourseData.period_id || '',
        target: newCourseData.target || '',
        name: newCourseData.name || '',
        start_date: newCourseData.start_date || '',
        end_date: newCourseData.end_date || '',
        start_time: newCourseData.start_time || '',
        end_time: newCourseData.end_time || '',
        course_type: newCourseData.course_type ?? 0,
        modality: newCourseData.modality ?? 0,
        course_profile: newCourseData.course_profile ?? 0,
        goal: newCourseData.goal || '',
        details: newCourseData.details || '',
        instructors: [authStore.user?.id || '']
      }
    } else if (!isEditMode) {
      resetForm()
    }
  },
  { immediate: true }
)

const createCourse = async () => {

  loading.value = true
  try {
    const newCourse = await courseService.create(formData.value)
    alert('Curso creado exitosamente')
    resetForm()
    emit('course-created')
  } catch (error) {
    console.error('Error creating course:', error)
    // Usar el error del servicio de cursos si está disponible
    const errorMessage = courseService.lastError || 'Error al crear el curso'
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

const updateCourse = async () => {

  if (!props.courseData?.id) {
    console.error('No course ID found!')
    alert('Error: No se encontró el ID del curso')
    return
  }

  loading.value = true
  try {
    await courseService.update(props.courseData.id, formData.value)
    alert('Curso actualizado exitosamente')
    resetForm()
    emit('course-created')
  } catch (error) {
    console.error('Error updating course:', error)
    // Usar el error del servicio de cursos si está disponible
    const errorMessage = courseService.lastError || 'Error al actualizar el curso'
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div>
    <!-- Formulario de creación/edición -->
    <v-card class="mb-6">
      <v-card-title class="text-h5">
        {{ props.editMode ? 'Editar Curso' : 'Crear Nuevo Curso' }}
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                label="Nombre del Curso"
                counter="150"
                maxlength="150"
                required
                :rules="[
                  (v) => !!v || 'El nombre del curso es requerido',
                  (v) => (v && v.trim().length > 0) || 'El nombre no puede estar vacío',
                  (v) => (v && v.length <= 150) || 'El nombre no puede exceder 150 caracteres',
                  (v) => /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(v) || 'Solo se permiten letras, números, espacios y acentos'
                ]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.period_id"
                :items="periods"
                item-title="name"
                item-value="id"
                label="Periodo"
                required
                :rules="[(v) => !!v || 'El periodo es requerido']"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="formData.target"
                label="Objetivo del Curso"
                counter="255"
                maxlength="255"
                required
                :rules="[
                  (v) => !!v || 'El objetivo es requerido',
                  (v) => (v && v.trim().length > 0) || 'El objetivo no puede estar vacío',
                  (v) => (v && v.length <= 255) || 'El objetivo no puede exceder 255 caracteres',
                  (v) => /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:()\-]+$/.test(v) || 'Solo se permiten letras, números, espacios, acentos y puntuación básica'
                ]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.start_date"
                label="Fecha Inicio"
                type="date"
                required
                :rules="[(v) => !!v || 'La fecha de inicio es requerida']"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.end_date"
                label="Fecha Fin"
                type="date"
                required
                :rules="[
                  (v) => !!v || 'La fecha de fin es requerida',
                  (v) => !formData.start_date || !v || new Date(v) >= new Date(formData.start_date) || 'La fecha de fin debe ser posterior a la fecha de inicio'
                ]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.start_time"
                label="Hora Inicio"
                type="time"
                required
                :rules="[(v) => !!v || 'La hora de inicio es requerida']"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.end_time"
                label="Hora Fin"
                type="time"
                required
                :rules="[(v) => !!v || 'La hora de fin es requerida']"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="formData.course_type"
                :items="typeOptions"
                label="Tipo"
                required
                :rules="[(v) => v !== null && v !== undefined || 'El tipo de curso es requerido']"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="formData.modality"
                :items="modeOptions"
                label="Modalidad"
                required
                :rules="[(v) => v !== null && v !== undefined || 'La modalidad es requerida']"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="formData.course_profile"
                :items="profileOptions"
                label="Perfil"
                required
                :rules="[(v) => v !== null && v !== undefined || 'El perfil es requerido']"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="formData.goal"
                label="Meta del Curso"
                rows="3"
                required
                :rules="[
                  (v) => !!v || 'La meta del curso es requerida',
                  (v) => (v && v.trim().length > 0) || 'La meta no puede estar vacía'
                ]"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="formData.details"
                label="Detalles"
                rows="3"
                hint="Opcional"
              />
            </v-col>
            <!-- <v-btn class="ml-4" color="primary" @click="instructorsDialog=true">Instructores</v-btn> -->
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn v-if="props.editMode" @click="emit('cancel')">Cancelar</v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          @click="props.editMode ? updateCourse() : createCourse()"
        >
          {{ props.editMode ? 'Actualizar' : 'Crear Curso' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

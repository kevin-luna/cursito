<script setup lang="ts">
import { ref, onMounted } from 'vue'
import courseService, { type CreateCourseRequest } from '@/services/courseService'
import periodService, { type Period } from '@/services/periodService'
import workerService from '@/services/workerService'
import { useAuthStore } from '@/stores/auth'
import type { Worker } from '@/services/authService'

const authStore = useAuthStore()
const periods = ref<Period[]>([])
const workers = ref<Worker[]>([])
const loading = ref(false)
const myCourses = ref<any[]>([])
const editMode = ref(false)
const selectedCourseId = ref<string | null>(null)
const additionalInstructors = ref<string[]>([])
const instructorsDialog = ref(false)

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

    // Cargar cursos creados por este trabajador
    const allCourses = await courseService.getAll()
    const myCoursesData = []

    for (const course of allCourses) {
      const instructors = await courseService.getInstructors(course.id)
      if (instructors.some((i: any) => i.worker_id === authStore.user?.id)) {
        myCoursesData.push({ ...course, instructors })
      }
    }

    myCourses.value = myCoursesData
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
    type: 0,
    mode: 0,
    profile: 0,
    goal: '',
    details: '',
  }
  editMode.value = false
  selectedCourseId.value = null
}

const createCourse = async () => {
  loading.value = true
  try {
    const newCourse = await courseService.create(formData.value)

    // Agregar al trabajador actual como instructor
    await courseService.addInstructor(newCourse.id, authStore.user!.id)

    alert('Curso creado exitosamente')
    resetForm()
    await loadData()
  } finally {
    loading.value = false
  }
}

const editCourse = (course: any) => {
  editMode.value = true
  selectedCourseId.value = course.id
  formData.value = { ...course }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const updateCourse = async () => {
  if (!selectedCourseId.value) return
  loading.value = true
  try {
    await courseService.update(selectedCourseId.value, formData.value)
    alert('Curso actualizado exitosamente')
    resetForm()
    await loadData()
  } finally {
    loading.value = false
  }
}

const deleteCourse = async (courseId: string) => {
  if (confirm('¿Está seguro de eliminar este curso?')) {
    loading.value = true
    try {
      await courseService.delete(courseId)
      await loadData()
    } finally {
      loading.value = false
    }
  }
}

const openInstructorsDialog = async (course: any) => {
  selectedCourseId.value = course.id
  const instructors = await courseService.getInstructors(course.id)
  additionalInstructors.value = instructors.map((i: any) => i.worker_id)
  instructorsDialog.value = true
}

const saveInstructors = async () => {
  if (!selectedCourseId.value) return
  loading.value = true
  try {
    const currentInstructors = await courseService.getInstructors(selectedCourseId.value)
    const currentIds = currentInstructors.map((i: any) => i.worker_id)

    // Agregar nuevos instructores
    for (const workerId of additionalInstructors.value) {
      if (!currentIds.includes(workerId)) {
        await courseService.addInstructor(selectedCourseId.value, workerId)
      }
    }

    // Remover instructores desmarcados
    for (const workerId of currentIds) {
      if (!additionalInstructors.value.includes(workerId)) {
        await courseService.removeInstructor(selectedCourseId.value, workerId)
      }
    }

    alert('Instructores actualizados')
    instructorsDialog.value = false
    await loadData()
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
        {{ editMode ? 'Editar Curso' : 'Crear Nuevo Curso' }}
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.name" label="Nombre del Curso" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.period_id"
                :items="periods"
                item-title="name"
                item-value="id"
                label="Periodo"
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="formData.target" label="Objetivo del Curso" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.start_date" label="Fecha Inicio" type="date" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.end_date" label="Fecha Fin" type="date" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.start_time" label="Hora Inicio" type="time" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.end_time" label="Hora Fin" type="time" />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="formData.type" :items="typeOptions" label="Tipo" />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="formData.mode" :items="modeOptions" label="Modalidad" />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="formData.profile" :items="profileOptions" label="Perfil" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="formData.goal" label="Meta del Curso" rows="3" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="formData.details" label="Detalles" rows="3" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn v-if="editMode" @click="resetForm">Cancelar</v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          @click="editMode ? updateCourse() : createCourse()"
        >
          {{ editMode ? 'Actualizar' : 'Crear Curso' }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Lista de mis cursos -->
    <v-card>
      <v-card-title class="text-h5">Mis Cursos Creados</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item v-for="course in myCourses" :key="course.id">
            <v-list-item-title>{{ course.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ course.target }}</v-list-item-subtitle>
            <template v-slot:append>
              <v-btn
                icon="mdi-account-multiple-plus"
                size="small"
                variant="text"
                @click="openInstructorsDialog(course)"
              />
              <v-btn icon="mdi-pencil" size="small" variant="text" @click="editCourse(course)" />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteCourse(course.id)"
              />
            </template>
          </v-list-item>
        </v-list>

        <v-alert v-if="myCourses.length === 0" type="info" class="mt-4">
          No has creado ningún curso aún
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Dialog para agregar instructores -->
    <v-dialog v-model="instructorsDialog" max-width="500px">
      <v-card>
        <v-card-title>Agregar Instructores Adicionales</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="worker in workers" :key="worker.id">
              <template v-slot:prepend>
                <v-checkbox-btn v-model="additionalInstructors" :value="worker.id" />
              </template>
              <v-list-item-title>{{ worker.name }} {{ worker.father_lastname }}</v-list-item-title>
              <v-list-item-subtitle>{{ worker.email }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="instructorsDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="loading" @click="saveInstructors">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

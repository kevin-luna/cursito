<script setup lang="ts">
import { ref, onMounted } from 'vue'
import enrollmentService, { type Enrollment } from '@/services/enrollmentService'
import courseService, { type Course } from '@/services/courseService'
import workerService from '@/services/workerService'
import type { Worker } from '@/services/authService'

const enrollments = ref<any[]>([])
const courses = ref<Course[]>([])
const workers = ref<Worker[]>([])
const loading = ref(false)
const dialog = ref(false)
const selectedEnrollment = ref<any | null>(null)
const formData = ref({ worker_id: '', course_id: '' })

const headers = [
  { title: 'Trabajador', key: 'worker_name' },
  { title: 'Curso', key: 'course_name' },
  { title: 'Calificación Final', key: 'final_grade' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const loadEnrollments = async () => {
  loading.value = true
  try {
    const data = await enrollmentService.getAll()
    const coursesData = await courseService.getAll()
    const workersData = await workerService.getAll()

    enrollments.value = data.map((enrollment: Enrollment) => {
      const course = coursesData.find((c: Course) => c.id === enrollment.course_id)
      const worker = workersData.find((w: Worker) => w.id === enrollment.worker_id)
      return {
        ...enrollment,
        course_name: course?.name || 'N/A',
        worker_name: worker ? `${worker.name} ${worker.father_lastname}` : 'N/A',
      }
    })
  } finally {
    loading.value = false
  }
}

const loadData = async () => {
  try {
    courses.value = await courseService.getAll()
    workers.value = await workerService.getAll()
  } catch (error) {
    console.error('Error al cargar datos:', error)
  }
}

const openCreateDialog = () => {
  formData.value = { worker_id: '', course_id: '' }
  dialog.value = true
}

const createEnrollment = async () => {
  loading.value = true
  try {
    await enrollmentService.create(formData.value)
    dialog.value = false
    await loadEnrollments()
  } finally {
    loading.value = false
  }
}

const deleteEnrollment = async (id: string) => {
  if (confirm('¿Está seguro de eliminar esta inscripción?')) {
    try {
      await enrollmentService.delete(id)
      await loadEnrollments()
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  }
}

onMounted(() => {
  loadEnrollments()
  loadData()
})
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between">
      <span class="text-h5">Gestión de Inscripciones</span>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Nueva Inscripción
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-data-table :headers="headers" :items="enrollments" :loading="loading">
        <template v-slot:item.final_grade="{ item }">
          {{ item.final_grade || 'Sin calificar' }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="deleteEnrollment(item.id)"
          />
        </template>
      </v-data-table>
    </v-card-text>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>Nueva Inscripción</v-card-title>
        <v-card-text>
          <v-select
            v-model="formData.worker_id"
            :items="workers"
            item-title="email"
            item-value="id"
            label="Trabajador"
          />
          <v-select
            v-model="formData.course_id"
            :items="courses"
            item-title="name"
            item-value="id"
            label="Curso"
            class="mt-4"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="loading" @click="createEnrollment">Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

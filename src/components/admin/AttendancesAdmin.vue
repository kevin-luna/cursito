<script setup lang="ts">
import { ref, onMounted } from 'vue'
import attendanceService, { type Attendance } from '@/services/attendanceService'
import courseService, { type Course } from '@/services/courseService'
import workerService from '@/services/workerService'
import type { Worker } from '@/services/authService'

const attendances = ref<any[]>([])
const courses = ref<Course[]>([])
const loading = ref(false)
const selectedCourse = ref('')
const selectedDate = ref('')

const headers = [
  { title: 'Trabajador', key: 'worker_name' },
  { title: 'Curso', key: 'course_name' },
  { title: 'Fecha', key: 'date' },
]

const loadAttendances = async () => {
  loading.value = true
  try {
    const data = await attendanceService.getAll()
    const coursesData = await courseService.getAll()
    const workersData = await workerService.getAll()

    attendances.value = data.map((attendance: Attendance) => {
      const course = coursesData.find((c: Course) => c.id === attendance.course_id)
      const worker = workersData.find((w: Worker) => w.id === attendance.worker_id)
      return {
        ...attendance,
        course_name: course?.name || 'N/A',
        worker_name: worker ? `${worker.name} ${worker.father_lastname}` : 'N/A',
      }
    })
  } finally {
    loading.value = false
  }
}

const loadCourses = async () => {
  try {
    courses.value = await courseService.getAll()
  } catch (error) {
    console.error('Error al cargar cursos:', error)
  }
}

const filterAttendances = async () => {
  if (!selectedCourse.value) return
  loading.value = true
  try {
    const data = await courseService.getAttendances(selectedCourse.value, selectedDate.value)
    const workersData = await workerService.getAll()
    const course = courses.value.find((c) => c.id === selectedCourse.value)

    attendances.value = data.map((attendance: Attendance) => {
      const worker = workersData.find((w: Worker) => w.id === attendance.worker_id)
      return {
        ...attendance,
        course_name: course?.name || 'N/A',
        worker_name: worker ? `${worker.name} ${worker.father_lastname}` : 'N/A',
      }
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAttendances()
  loadCourses()
})
</script>

<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">Gestión de Asistencias</span>
    </v-card-title>
    <v-card-text>
      <v-row class="mb-4">
        <v-col cols="12" md="5">
          <v-select
            v-model="selectedCourse"
            :items="courses"
            item-title="name"
            item-value="id"
            label="Filtrar por Curso"
            clearable
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="selectedDate" label="Filtrar por Fecha" type="date" clearable />
        </v-col>
        <v-col cols="12" md="3" class="d-flex align-center">
          <v-btn color="primary" @click="filterAttendances" block>Filtrar</v-btn>
        </v-col>
      </v-row>

      <v-data-table :headers="headers" :items="attendances" :loading="loading"> </v-data-table>
    </v-card-text>
  </v-card>
</template>

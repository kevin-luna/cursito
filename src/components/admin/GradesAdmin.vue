<script setup lang="ts">
import { ref, onMounted } from 'vue'
import enrollmentService, { type Enrollment } from '@/services/enrollmentService'
import courseService, { type Course } from '@/services/courseService'
import workerService from '@/services/workerService'
import type { Worker } from '@/services/authService'

const enrollments = ref<any[]>([])
const loading = ref(false)
const dialog = ref(false)
const selectedEnrollment = ref<any | null>(null)
const gradeValue = ref<number>(0)

const headers = [
  { title: 'Trabajador', key: 'worker_name' },
  { title: 'Curso', key: 'course_name' },
  { title: 'Calificación', key: 'final_grade' },
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

const openGradeDialog = (enrollment: any) => {
  selectedEnrollment.value = enrollment
  gradeValue.value = enrollment.final_grade || 0
  dialog.value = true
}

const updateGrade = async () => {
  if (!selectedEnrollment.value) return
  loading.value = true
  try {
    await enrollmentService.updateGrade(selectedEnrollment.value.id, {
      final_grade: gradeValue.value,
    })
    dialog.value = false
    await loadEnrollments()
  } finally {
    loading.value = false
  }
}

onMounted(loadEnrollments)
</script>

<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">Gestión de Calificaciones</span>
    </v-card-title>
    <v-card-text>
      <v-data-table :headers="headers" :items="enrollments" :loading="loading">
        <template v-slot:item.final_grade="{ item }">
          <v-chip :color="item.final_grade ? 'success' : 'warning'" size="small">
            {{ item.final_grade || 'Sin calificar' }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            color="primary"
            @click="openGradeDialog(item)"
          />
        </template>
      </v-data-table>
    </v-card-text>

    <v-dialog v-model="dialog" max-width="400px">
      <v-card>
        <v-card-title>Asignar Calificación</v-card-title>
        <v-card-text>
          <div class="mb-2">
            <strong>Trabajador:</strong> {{ selectedEnrollment?.worker_name }}
          </div>
          <div class="mb-4">
            <strong>Curso:</strong> {{ selectedEnrollment?.course_name }}
          </div>
          <v-text-field
            v-model.number="gradeValue"
            label="Calificación Final"
            type="number"
            min="0"
            max="100"
            step="0.01"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="loading" @click="updateGrade">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

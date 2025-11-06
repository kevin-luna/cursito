<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import courseService, { type Course } from '@/services/courseService'
import enrollmentService from '@/services/enrollmentService'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const courses = ref<Course[]>([])
const loading = ref(false)
const detailsDialog = ref(false)
const selectedCourse = ref<Course | null>(null)
const enrolledCourses = ref<string[]>([])

const typeLabels: Record<number, string> = { 0: 'Diplomado', 1: 'Taller' }
const modeLabels: Record<number, string> = { 0: 'Virtual', 1: 'Presencial' }
const profileLabels: Record<number, string> = { 0: 'Formación', 1: 'Actualización Docente' }

const availableCourses = computed(() => {
  const today = new Date()
  return courses.value.filter((course) => {
    const startDate = new Date(course.start_date)
    // Solo mostrar cursos que aún no han comenzado (próximos a comenzar)
    return startDate > today
  })
})

const loadCourses = async () => {
  loading.value = true
  try {
    courses.value = await courseService.getAll()
    const myEnrollments = await enrollmentService.getMyEnrollments()
    enrolledCourses.value = myEnrollments.map((e) => e.course_id)
  } finally {
    loading.value = false
  }
}

const isEnrolled = (courseId: string) => enrolledCourses.value.includes(courseId)

const viewDetails = (course: Course) => {
  selectedCourse.value = course
  detailsDialog.value = true
}

const enrollInCourse = async (courseId: string) => {
  if (confirm('¿Desea inscribirse a este curso?')) {
    loading.value = true
    try {
      await enrollmentService.enrollInCourse(courseId)
      await loadCourses()
    } finally {
      loading.value = false
    }
  }
}

onMounted(loadCourses)
</script>

<template>
  <div>
    <v-card>
      <v-card-title class="text-h5">Cursos Disponibles</v-card-title>
      <v-card-subtitle>Cursos próximos a comenzar en los que puedes inscribirte</v-card-subtitle>
      <v-card-text>
        <v-row>
          <v-col v-for="course in availableCourses" :key="course.id" cols="12" md="6" lg="4">
            <v-card elevation="2" class="h-100">
              <v-card-title class="text-h6">{{ course.name }}</v-card-title>
              <v-card-subtitle>{{ course.target }}</v-card-subtitle>
              <v-card-text>
                <div class="mb-2">
                  <v-chip size="small" class="mr-2" color="primary">{{
                    typeLabels[course.type]
                  }}</v-chip>
                  <v-chip size="small" class="mr-2">{{ modeLabels[course.mode] }}</v-chip>
                  <v-chip size="small">{{ profileLabels[course.profile] }}</v-chip>
                </div>
                <div class="text-body-2 mt-2">
                  <strong>Inicia:</strong> {{ course.start_date }}
                </div>
                <div class="text-body-2">
                  <strong>Termina:</strong> {{ course.end_date }}
                </div>
                <div class="text-body-2">
                  <strong>Horario:</strong> {{ course.start_time }} - {{ course.end_time }}
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn size="small" @click="viewDetails(course)">Ver Detalles</v-btn>
                <v-spacer />
                <v-btn
                  v-if="!isEnrolled(course.id)"
                  size="small"
                  color="primary"
                  @click="enrollInCourse(course.id)"
                  :loading="loading"
                >
                  Inscribirse
                </v-btn>
                <v-chip v-else color="success" size="small">Inscrito</v-chip>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-alert v-if="availableCourses.length === 0" type="info" class="mt-4">
          No hay cursos disponibles para inscripción en este momento
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Dialog detalles del curso -->
    <v-dialog v-model="detailsDialog" max-width="700px">
      <v-card v-if="selectedCourse">
        <v-card-title class="text-h5">{{ selectedCourse.name }}</v-card-title>
        <v-card-text>
          <div class="mb-3">
            <strong>Objetivo:</strong>
            <p>{{ selectedCourse.target }}</p>
          </div>
          <div class="mb-3">
            <strong>Meta:</strong>
            <p>{{ selectedCourse.goal }}</p>
          </div>
          <div v-if="selectedCourse.details" class="mb-3">
            <strong>Detalles:</strong>
            <p>{{ selectedCourse.details }}</p>
          </div>
          <v-divider class="my-3" />
          <v-row>
            <v-col cols="6">
              <strong>Tipo:</strong> {{ typeLabels[selectedCourse.type] }}
            </v-col>
            <v-col cols="6">
              <strong>Modalidad:</strong> {{ modeLabels[selectedCourse.mode] }}
            </v-col>
            <v-col cols="6">
              <strong>Perfil:</strong> {{ profileLabels[selectedCourse.profile] }}
            </v-col>
            <v-col cols="6">
              <strong>Horario:</strong> {{ selectedCourse.start_time }} -
              {{ selectedCourse.end_time }}
            </v-col>
            <v-col cols="6">
              <strong>Fecha Inicio:</strong> {{ selectedCourse.start_date }}
            </v-col>
            <v-col cols="6">
              <strong>Fecha Fin:</strong> {{ selectedCourse.end_date }}
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="detailsDialog = false">Cerrar</v-btn>
          <v-btn
            v-if="!isEnrolled(selectedCourse.id)"
            color="primary"
            @click="enrollInCourse(selectedCourse.id);detailsDialog = false"
          >
            Inscribirse
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

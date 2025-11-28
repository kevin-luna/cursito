<script setup lang="ts">
import { ref, onMounted } from 'vue'
import enrollmentService, { type Enrollment } from '@/services/enrollmentService'
import courseService, { type Course } from '@/services/courseService'
import workerService from '@/services/workerService'
import reportService from '@/services/reportService'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const enrollments = ref<Enrollment[]>([])
const loading = ref(false)
const detailsDialog = ref(false)
const surveysDialog = ref(false)
const selectedCourse = ref<Course | null>(null)
const downloadingCertificate = ref(false)
const downloadingFollowUpSurvey = ref(false)
const downloadingOpinionSurvey = ref(false)

const typeLabels: Record<number, string> = { 0: 'Diplomado', 1: 'Taller' }
const modeLabels: Record<number, string> = { 0: 'Virtual', 1: 'Presencial' }

const loadEnrollments = async () => {
  if (!authStore.user?.id) return

  loading.value = true
  try {
    const myCourses = await workerService.getEnrollments(authStore.user.id)

    enrollments.value = myCourses.map((enrollment: Enrollment) => {
      return {
        id: enrollment.id,
        course: enrollment.course,
        final_grade: enrollment.final_grade
      }
    })
  } finally {
    loading.value = false
  }
}

const viewDetails = (course: Course) => {
  selectedCourse.value = course
  detailsDialog.value = true
}

const unenroll = async (enrollmentId: string) => {
  if (confirm('¿Está seguro de desinscribirse de este curso?')) {
    loading.value = true
    try {
      await enrollmentService.unenrollFromCourse(enrollmentId)
      await loadEnrollments()
    } finally {
      loading.value = false
    }
  }
}

const viewSurveys = async (course: Course | undefined) => {
  if (!course) return
  selectedCourse.value = course
  surveysDialog.value = true
}

const closeSurveys = () => {
  surveysDialog.value = false
}

const downloadCertificate = async () => {
  if (!authStore.user?.id || !selectedCourse.value?.id) return

  downloadingCertificate.value = true
  try {
    await reportService.downloadEnrollmentCertificate(authStore.user.id, selectedCourse.value.id)
  } catch (error) {
    console.error('Error al descargar cédula:', error)
    alert('Error al descargar la cédula de inscripción')
  } finally {
    downloadingCertificate.value = false
  }
}

const downloadFollowUpSurvey = async () => {
  if (!authStore.user?.id || !selectedCourse.value?.id) return

  downloadingFollowUpSurvey.value = true
  try {
    await reportService.downloadFollowUpSurvey(authStore.user.id, selectedCourse.value.id)
  } catch (error) {
    console.error('Error al descargar evaluación de seguimiento:', error)
    alert('Error al descargar la evaluación de seguimiento')
  } finally {
    downloadingFollowUpSurvey.value = false
  }
}

const downloadOpinionSurvey = async () => {
  if (!authStore.user?.id || !selectedCourse.value?.id) return

  downloadingOpinionSurvey.value = true
  try {
    await reportService.downloadOpinionSurvey(authStore.user.id, selectedCourse.value.id)
  } catch (error) {
    console.error('Error al descargar encuesta de opinión:', error)
    alert('Error al descargar la encuesta de opinión')
  } finally {
    downloadingOpinionSurvey.value = false
  }
}

onMounted(loadEnrollments)
</script>

<template>
  <div>
    <v-card>
      <v-card-title class="text-h5">Mis Inscripciones</v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            v-for="enrollment in enrollments"
            :key="enrollment.id"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card elevation="2" class="h-100">
              <v-card-title class="text-h6">{{ enrollment.course?.name }}</v-card-title>
              <v-card-text>
                <div class="mb-2">
                  <v-chip size="small" class="mr-2" color="primary">{{
                    typeLabels[enrollment.course?.course_type]
                  }}</v-chip>
                  <v-chip size="small">{{ modeLabels[enrollment.course?.modality] }}</v-chip>
                </div>
                <div class="text-body-2 mt-2">
                  <strong>Inicia:</strong> {{ enrollment.course?.start_date }}
                </div>
                <div class="text-body-2">
                  <strong>Termina:</strong> {{ enrollment.course?.end_date }}
                </div>
                <div v-if="enrollment.final_grade" class="mt-2">
                  <v-chip color="success" size="small">
                    Calificación: {{ enrollment.final_grade }}
                  </v-chip>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn size="small" @click="viewDetails(enrollment.course)">Ver Detalles</v-btn>
                <v-btn size="small" color="primary" @click="viewSurveys(enrollment.course)">
                  Encuestas
                </v-btn>
                <v-spacer />
                <v-btn
                  size="small"
                  color="error"
                  variant="text"
                  @click="unenroll(enrollment.id)"
                >
                  Desinscribirse
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-alert v-if="enrollments.length === 0" type="info" class="mt-4">
          No estás inscrito en ningún curso
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Dialog detalles -->
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
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            prepend-icon="mdi-download"
            :loading="downloadingCertificate"
            @click="downloadCertificate"
          >
            Descargar Cédula de Inscripción
          </v-btn>
          <v-spacer />
          <v-btn @click="detailsDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog encuestas -->
    <v-dialog v-model="surveysDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Descargar Encuestas de Satisfacción</span>
          <v-btn icon variant="text" @click="closeSurveys">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <p class="text-body-1 mb-4">
            Descarga las respuestas de tus encuestas de satisfacción en formato PDF.
          </p>

          <v-list>
            <v-list-item>
              <v-list-item-title class="font-weight-medium">
                Evaluación de seguimiento
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                Resultados de tu evaluación CSAT
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-download"
                  :loading="downloadingFollowUpSurvey"
                  @click="downloadFollowUpSurvey"
                >
                  Descargar PDF
                </v-btn>
              </template>
            </v-list-item>

            <v-divider class="my-2" />

            <v-list-item>
              <v-list-item-title class="font-weight-medium">
                Encuesta de opinión
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                Resultados de tu encuesta de opinión del curso
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-download"
                  :loading="downloadingOpinionSurvey"
                  @click="downloadOpinionSurvey"
                >
                  Descargar PDF
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeSurveys">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

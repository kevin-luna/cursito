<script setup lang="ts">
import { ref, onMounted } from 'vue'
import enrollmentService, { type Enrollment } from '@/services/enrollmentService'
import courseService, { type Course } from '@/services/courseService'
import { type Survey } from '@/services/surveyService'
import workerService from '@/services/workerService'
import { useAuthStore } from '@/stores/auth'
import OpinionSurveyForm from './OpinionSurveyForm.vue'
import SurveyResponseWorker from './SurveyResponseWorker.vue'
import FollowUpCSATForm from './FollowUpCSATForm.vue'

const authStore = useAuthStore()
const enrollments = ref<Enrollment[]>([])
const loading = ref(false)
const detailsDialog = ref(false)
const surveysDialog = ref(false)
const selectedCourse = ref<Course | null>(null)
const availableSurveys = ref<Survey[]>([])
const selectedSurveyId = ref<string | null>(null)

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

const viewSurveys = async () => {
  // Mostrar encuestas estáticas con IDs reales del sistema
  availableSurveys.value = [
    { id: '3d1fa6a2-6d4a-42fa-a474-68c83156f541', name: 'Evaluación de seguimiento', created_at: '2024-02-01' },
    { id: 'c2a77b75-8552-4fe0-ab49-231803244ace', name: 'Encuesta de opinión', created_at: '2025-07-06' }
  ]
  surveysDialog.value = true
}

const selectSurvey = (survey: Survey) => {
  selectedSurveyId.value = survey.id
}

const closeSurveys = () => {
  surveysDialog.value = false
  selectedSurveyId.value = null
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
                <v-btn size="small" color="primary" @click="viewSurveys()">
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
          <v-spacer />
          <v-btn @click="detailsDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog encuestas -->
    <v-dialog v-model="surveysDialog" max-width="1200px" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Encuestas de Satisfacción</span>
          <v-btn icon variant="text" @click="closeSurveys">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <!-- Lista de encuestas disponibles -->
          <v-list v-if="!selectedSurveyId">
            <v-list-item v-for="survey in availableSurveys" :key="survey.id">
              <v-list-item-title>{{ survey.name }}</v-list-item-title>
              <template v-slot:append>
                <v-btn size="small" color="primary" @click="selectSurvey(survey)">
                  Responder
                </v-btn>
              </template>
            </v-list-item>

            <v-alert v-if="availableSurveys.length === 0" type="info">
              No hay encuestas disponibles para este curso
            </v-alert>
          </v-list>

          <!-- Componente de Evaluación de seguimiento -->
          <div v-else-if="selectedSurveyId === '3d1fa6a2-6d4a-42fa-a474-68c83156f541'">
            <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="selectedSurveyId = null" class="mb-4">
              Volver a lista de encuestas
            </v-btn>
            <FollowUpCSATForm />
          </div>

          <!-- Componente de Encuesta de opinión -->
          <div v-else-if="selectedSurveyId === 'c2a77b75-8552-4fe0-ab49-231803244ace'">
            <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="selectedSurveyId = null" class="mb-4">
              Volver a lista de encuestas
            </v-btn>
            <OpinionSurveyForm />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

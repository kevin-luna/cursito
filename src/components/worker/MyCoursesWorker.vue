<script setup lang="ts">
import { ref, onMounted } from 'vue'
import enrollmentService, { type Enrollment } from '@/services/enrollmentService'
import courseService, { type Course } from '@/services/courseService'
import surveyService, { type Survey, type Question } from '@/services/surveyService'

const enrollments = ref<any[]>([])
const loading = ref(false)
const detailsDialog = ref(false)
const surveysDialog = ref(false)
const selectedCourse = ref<Course | null>(null)
const availableSurveys = ref<Survey[]>([])
const surveyQuestions = ref<Question[]>([])
const surveyAnswers = ref<Record<string, string>>({})

const typeLabels: Record<number, string> = { 0: 'Diplomado', 1: 'Taller' }
const modeLabels: Record<number, string> = { 0: 'Virtual', 1: 'Presencial' }

const loadEnrollments = async () => {
  loading.value = true
  try {
    const myEnrollments = await enrollmentService.getMyEnrollments()
    const coursesData = await Promise.all(
      myEnrollments.map((e: Enrollment) => courseService.getById(e.course_id)),
    )

    enrollments.value = myEnrollments.map((enrollment: Enrollment) => {
      const course = coursesData.find((c: Course) => c.id === enrollment.course_id)
      return {
        ...enrollment,
        course,
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

const viewSurveys = async (courseId: string) => {
  loading.value = true
  try {
    availableSurveys.value = await courseService.getSurveys(courseId)
    surveysDialog.value = true
  } finally {
    loading.value = false
  }
}

const selectSurvey = async (survey: Survey) => {
  loading.value = true
  try {
    surveyQuestions.value = await surveyService.getQuestionsBySurvey(survey.id)
    surveyAnswers.value = {}
  } finally {
    loading.value = false
  }
}

const submitSurvey = async (surveyId: string, courseId: string) => {
  const answers = Object.entries(surveyAnswers.value).map(([question_id, value]) => ({
    question_id,
    value,
  }))

  if (answers.length === 0) {
    alert('Por favor responda al menos una pregunta')
    return
  }

  loading.value = true
  try {
    await surveyService.submitAnswers({ course_id: courseId, answers })
    alert('Encuesta enviada exitosamente')
    surveyAnswers.value = {}
    surveyQuestions.value = []
  } finally {
    loading.value = false
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
                    typeLabels[enrollment.course?.type]
                  }}</v-chip>
                  <v-chip size="small">{{ modeLabels[enrollment.course?.mode] }}</v-chip>
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
                <v-btn size="small" color="primary" @click="viewSurveys(enrollment.course_id)">
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
    <v-dialog v-model="surveysDialog" max-width="800px">
      <v-card>
        <v-card-title>Encuestas de Satisfacción</v-card-title>
        <v-card-text>
          <v-list v-if="surveyQuestions.length === 0">
            <v-list-item v-for="survey in availableSurveys" :key="survey.id">
              <v-list-item-title>{{ survey.name }}</v-list-item-title>
              <template v-slot:append>
                <v-btn size="small" color="primary" @click="selectSurvey(survey)">
                  Responder
                </v-btn>
              </template>
            </v-list-item>
          </v-list>

          <div v-else>
            <h3 class="mb-4">Responde las siguientes preguntas:</h3>
            <v-form>
              <div v-for="question in surveyQuestions" :key="question.id" class="mb-4">
                <v-textarea
                  v-model="surveyAnswers[question.id]"
                  :label="`${question.position}. ${question.question}`"
                  rows="2"
                />
              </div>
            </v-form>
          </div>

          <v-alert v-if="availableSurveys.length === 0" type="info">
            No hay encuestas disponibles para este curso
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="surveyQuestions.length > 0"
            @click="surveyQuestions = [];surveyAnswers = {}"
          >
            Volver
          </v-btn>
          <v-spacer />
          <v-btn @click="surveysDialog = false">Cerrar</v-btn>
          <v-btn
            v-if="surveyQuestions.length > 0 && selectedCourse"
            color="primary"
            :loading="loading"
            @click="submitSurvey(surveyQuestions[0]!.survey_id, selectedCourse.id)"
          >
            Enviar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

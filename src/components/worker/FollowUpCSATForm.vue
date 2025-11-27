<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import surveyService, { type SurveySubmitRequest } from '@/services/surveyService'
import type { Course } from '@/services/courseService'
import { useAuthStore } from '@/stores/auth'

const FOLLOWUP_SURVEY_ID = '3d1fa6a2-6d4a-42fa-a474-68c83156f541'

const props = defineProps<{
  course: Course
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const loading = ref(false)
const submitted = ref(false)
const alreadyAnswered = ref(false)

// Respuestas del formulario
const formAnswers = ref({
  // Preguntas 1-3 (escala Likert)
  question1: 0,
  question2: 0,
  question3: 0,

  // Pregunta 4 (múltiple selección)
  question4: {
    a: false, // Incremento en motivación
    b: false, // Desarrollo personal
    c: false, // Integración con compañeros
    d: false, // Comprensión del servicio TecNM
    e: false, // Mejoría en actitud
    f: false, // Desarrollo de habilidades
    g: false, // Comprensión de conceptos
    h: false, // Valores compatibles
  },

  // Obstáculos
  obstacles: {
    equipment: false, // Falta de equipo y/o material
    support: false,   // Falta de apoyo en el área de trabajo
    other: false,     // Otro
    otherText: '',    // Descripción del otro obstáculo
  },

  // Comentarios
  comments: '',
})

const likertOptions = [
  { value: 1, text: 'En desacuerdo', color: 'red' },
  { value: 2, text: 'Parcialmente en desacuerdo', color: 'orange' },
  { value: 3, text: 'Indiferente', color: 'grey' },
  { value: 4, text: 'Parcialmente de acuerdo', color: 'light-green' },
  { value: 5, text: 'Totalmente de acuerdo', color: 'green' },
]

const question4Options = [
  { key: 'a', text: 'Produjo un incremento en su motivación' },
  { key: 'b', text: 'Ha servido para su desarrollo personal' },
  { key: 'c', text: 'Sirvió para integrarse mejor con sus compañeros(as) de trabajo' },
  { key: 'd', text: 'Produjo una mayor comprensión del servicio que presta al Tecnológico Nacional de México' },
  { key: 'e', text: 'Facilitó una mejoría en su actitud hacia el Tecnológico Nacional de México o sus compañeros de trabajo' },
  { key: 'f', text: 'Permitió desarrollar algunas habilidades adicionales' },
  { key: 'g', text: 'Generó una mejor comprensión de los conceptos generales del curso aplicables en su trabajo' },
  { key: 'h', text: 'Ofrecieron valores compatibles con los suyos' },
]

const checkIfAlreadyAnswered = async () => {
  // Verificar si ya respondió esta encuesta para este curso
  if (authStore.user?.id) {
    loading.value = true
    try {
      const existingAnswers = await surveyService.getWorkerSurveyAnswers(
        FOLLOWUP_SURVEY_ID,
        authStore.user.id,
        props.course.id
      )
      if (existingAnswers && existingAnswers.length > 0) {
        alreadyAnswered.value = true
      }
    } catch (error) {
      console.error('Error verificando respuestas:', error)
    } finally {
      loading.value = false
    }
  }
}

const resetForm = () => {
  formAnswers.value = {
    question1: 0,
    question2: 0,
    question3: 0,
    question4: {
      a: false,
      b: false,
      c: false,
      d: false,
      e: false,
      f: false,
      g: false,
      h: false,
    },
    obstacles: {
      equipment: false,
      support: false,
      other: false,
      otherText: '',
    },
    comments: '',
  }
}

const isFormValid = computed(() => {
  return (
    formAnswers.value.question1 > 0 &&
    formAnswers.value.question2 > 0 &&
    formAnswers.value.question3 > 0 &&
    Object.values(formAnswers.value.question4).some((v) => v === true)
  )
})

const submitSurvey = async () => {
  if (!authStore.user?.id) return

  loading.value = true
  try {
    // Preparar respuestas en formato compatible con la API
    const answers = [
      {
        question_id: '35860b6b-24b7-4269-a4d5-5f3e9d7c6174',
        value: formAnswers.value.question1.toString(),
      },
      {
        question_id: '99d63963-cdc6-41b7-bcbf-01fe09ef6c88',
        value: formAnswers.value.question2.toString(),
      },
      {
        question_id: '0ef61261-a82e-43dc-b13e-642430980b5c',
        value: formAnswers.value.question3.toString(),
      },
      {
        question_id: 'f27d05f4-7bfa-4d41-ad34-b0154943d0f6',
        value: JSON.stringify(formAnswers.value.question4),
      },
      {
        question_id: '4b67a52c-ee25-4970-9b1a-8881eadf83a8',
        value: JSON.stringify(formAnswers.value.obstacles),
      },
      {
        question_id: 'b5673bc5-6d8e-46f6-9839-81dfa7b63ec2',
        value: formAnswers.value.comments,
      },
    ]

    const request: SurveySubmitRequest = {
      worker_id: authStore.user.id,
      course_id: props.course.id,
      answers,
    }

    await surveyService.submitSurveyAnswers(FOLLOWUP_SURVEY_ID, request)
    submitted.value = true
  } catch (error) {
    console.error('Error al enviar evaluación:', error)
    const err = error as { response?: { status?: number } }
    if (err.response?.status === 409) {
      alreadyAnswered.value = true
    } else {
      alert('Error al enviar la evaluación. Por favor intente de nuevo.')
    }
  } finally {
    loading.value = false
  }
}

onMounted(checkIfAlreadyAnswered)
</script>

<template>
  <v-card>
    <v-card-title class="bg-primary text-white">
      <v-icon class="mr-2">mdi-clipboard-check</v-icon>
      Evaluación de Seguimiento del Curso Participante
    </v-card-title>

    <v-card-text class="pa-6">

      <!-- Mensaje de ya respondido -->
      <div v-if="alreadyAnswered" class="text-center py-8">
        <v-icon size="80" color="warning">mdi-alert-circle</v-icon>
        <h3 class="text-h5 mt-4">Ya has respondido esta evaluación</h3>
        <p class="text-body-1 mt-2">
          Ya has completado la evaluación de seguimiento para el curso "{{ course.name }}".
        </p>
        <p class="text-body-2 text-grey mt-2">
          Solo puedes responder esta evaluación una vez por curso.
        </p>
        <v-btn color="primary" class="mt-6" @click="emit('close')">
          Volver
        </v-btn>
      </div>

      <!-- Paso 2: Formulario de evaluación -->
      <div v-if="!submitted && !alreadyAnswered">

        <h3 class="text-h5 mb-2">{{ course.name }}</h3>
        <p class="text-subtitle-1 mb-6">
          Por favor, complete la siguiente evaluación de seguimiento sobre el curso.
        </p>

        <!-- Sección 1: Preguntas Likert -->
        <v-card variant="outlined" class="mb-6">
          <v-card-title class="bg-grey-lighten-4">
            Aplicación de Conocimientos
          </v-card-title>
          <v-card-text class="pa-6">
            <!-- Pregunta 1 -->
            <div class="mb-8">
              <h4 class="text-h6 mb-4">
                1. Los conocimientos adquiridos en el curso tienen aplicación en su ámbito laboral
                en el corto y mediano plazo.
              </h4>
              <v-radio-group v-model="formAnswers.question1" inline>
                <v-radio
                  v-for="option in likertOptions"
                  :key="option.value"
                  :value="option.value"
                  :color="option.color"
                >
                  <template v-slot:label>
                    <span :class="`text-${option.color}`">{{ option.text }}</span>
                  </template>
                </v-radio>
              </v-radio-group>
            </div>

            <!-- Pregunta 2 -->
            <div class="mb-8">
              <h4 class="text-h6 mb-4">
                2. El curso le ayudó a mejorar el desempeño de sus funciones.
              </h4>
              <v-radio-group v-model="formAnswers.question2" inline>
                <v-radio
                  v-for="option in likertOptions"
                  :key="option.value"
                  :value="option.value"
                  :color="option.color"
                >
                  <template v-slot:label>
                    <span :class="`text-${option.color}`">{{ option.text }}</span>
                  </template>
                </v-radio>
              </v-radio-group>
            </div>

            <!-- Pregunta 3 -->
            <div class="mb-4">
              <h4 class="text-h6 mb-4">
                3. El curso le ayudó a considerar nuevas formas de trabajo.
              </h4>
              <v-radio-group v-model="formAnswers.question3" inline>
                <v-radio
                  v-for="option in likertOptions"
                  :key="option.value"
                  :value="option.value"
                  :color="option.color"
                >
                  <template v-slot:label>
                    <span :class="`text-${option.color}`">{{ option.text }}</span>
                  </template>
                </v-radio>
              </v-radio-group>
            </div>
          </v-card-text>
        </v-card>

        <!-- Sección 2: Pregunta 4 (múltiple selección) -->
        <v-card variant="outlined" class="mb-6">
          <v-card-title class="bg-grey-lighten-4">
            Beneficios del Curso
          </v-card-title>
          <v-card-text class="pa-6">
            <h4 class="text-h6 mb-4">4. El curso que tomó le:</h4>
            <p class="text-caption mb-4">
              Seleccione todas las opciones que apliquen
            </p>
            <v-checkbox
              v-for="option in question4Options"
              :key="option.key"
              v-model="formAnswers.question4[option.key]"
              :label="option.text"
              color="primary"
              hide-details
              class="mb-2"
            />
          </v-card-text>
        </v-card>

        <!-- Sección 3: Obstáculos -->
        <v-card variant="outlined" class="mb-6">
          <v-card-title class="bg-grey-lighten-4">
            Obstáculos para Aplicar Conocimientos
          </v-card-title>
          <v-card-text class="pa-6">
            <p class="text-body-1 mb-4">
              En caso de considerar que existen obstáculos que le impidan aplicar los
              conocimientos del curso, señale los correspondientes:
            </p>
            <v-checkbox
              v-model="formAnswers.obstacles.equipment"
              label="Falta de equipo y/o material"
              color="warning"
              hide-details
              class="mb-2"
            />
            <v-checkbox
              v-model="formAnswers.obstacles.support"
              label="Falta de apoyo en el área de trabajo"
              color="warning"
              hide-details
              class="mb-2"
            />
            <v-checkbox
              v-model="formAnswers.obstacles.other"
              label="Otro"
              color="warning"
              hide-details
              class="mb-3"
            />
            <v-text-field
              v-if="formAnswers.obstacles.other"
              v-model="formAnswers.obstacles.otherText"
              label="Especifique el obstáculo"
              variant="outlined"
              density="compact"
              class="mt-2"
            />
          </v-card-text>
        </v-card>

        <!-- Sección 4: Comentarios -->
        <v-card variant="outlined" class="mb-6">
          <v-card-title class="bg-grey-lighten-4">
            Comentarios y Sugerencias
          </v-card-title>
          <v-card-text class="pa-6">
            <v-textarea
              v-model="formAnswers.comments"
              label="Comparta sus comentarios y sugerencias"
              variant="outlined"
              rows="5"
              placeholder="Escriba aquí sus comentarios..."
            />
          </v-card-text>
        </v-card>

        <!-- Botones de acción -->
        <v-card-actions class="px-0">
          <v-spacer />
          <v-btn variant="outlined" @click="emit('close')">Cancelar</v-btn>
          <v-btn
            color="primary"
            size="large"
            :disabled="!isFormValid"
            :loading="loading"
            @click="submitSurvey"
          >
            Enviar Evaluación
          </v-btn>
        </v-card-actions>
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="submitted" class="text-center py-8">
        <v-icon size="80" color="success">mdi-check-circle</v-icon>
        <h3 class="text-h5 mt-4">¡Evaluación enviada con éxito!</h3>
        <p class="text-body-1 mt-2">
          Gracias por completar la evaluación de seguimiento del curso.
        </p>
        <p class="text-body-2 text-grey mt-2">
          Su retroalimentación es muy importante para mejorar nuestros programas de capacitación.
        </p>
        <v-btn color="primary" class="mt-6" @click="emit('close')">
          Cerrar
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.v-radio-group :deep(.v-selection-control-group) {
  flex-direction: column;
  gap: 8px;
}

.v-radio-group.inline :deep(.v-selection-control-group) {
  flex-direction: row;
  flex-wrap: wrap;
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import surveyService, { type SurveySubmitRequest } from '@/services/surveyService'
import type { Course } from '@/services/courseService'
import reportService from '@/services/reportService'
import { useAuthStore } from '@/stores/auth'

const OPINION_SURVEY_ID = 'c2a77b75-8552-4fe0-ab49-231803244ace'

const props = withDefaults(defineProps<{
  course: Course
  workerId?: string
  readOnly?: boolean
}>(), {
  workerId: undefined,
  readOnly: false
})

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const loading = ref(false)
const submitted = ref(false)
const alreadyAnswered = ref(false)
const currentSection = ref(0)
const hasAnswers = ref(false)

// Secciones del formulario
const sections = [
  { id: 'instructor', title: 'Instructor', icon: 'mdi-account-tie' },
  { id: 'material', title: 'Material Didáctico', icon: 'mdi-book-open-page-variant' },
  { id: 'course', title: 'Curso', icon: 'mdi-school' },
  { id: 'infrastructure', title: 'Infraestructura', icon: 'mdi-office-building' },
]

// Respuestas del formulario (todas las preguntas en escala Likert 1-5)
const formAnswers = ref({
  // Instructor (7 preguntas)
  instructor: {
    q1: 0, // Expuso objetivo y temario
    q2: 0, // Dominio del contenido
    q3: 0, // Fomentó participación
    q4: 0, // Aclaró dudas
    q5: 0, // Dio retroalimentación
    q6: 0, // Aplicó evaluación final
    q7: 0, // Puntualidad
  },
  // Material didáctico (3 preguntas)
  material: {
    q1: 0, // Material útil
    q2: 0, // Material legible
    q3: 0, // Variedad suficiente
  },
  // Curso (4 preguntas)
  course: {
    q1: 0, // Distribución del tiempo
    q2: 0, // Temas suficientes
    q3: 0, // Ejercicios de práctica
    q4: 0, // Cubrió expectativas
  },
  // Infraestructura (6 preguntas)
  infrastructure: {
    q1: 0, // Iluminación
    q2: 0, // Ventilación
    q3: 0, // Aseo
    q4: 0, // Sanitarios
    q5: 0, // Servicio de café
    q6: 0, // Apoyo del personal
  },
  // Comentarios
  comments: '',
})

const likertOptions = [
  { value: 1, text: 'En desacuerdo', color: 'red', icon: 'mdi-emoticon-sad' },
  { value: 2, text: 'Parcialmente en desacuerdo', color: 'orange', icon: 'mdi-emoticon-neutral' },
  { value: 3, text: 'Indiferente', color: 'grey', icon: 'mdi-emoticon-neutral-outline' },
  { value: 4, text: 'Parcialmente de acuerdo', color: 'light-green', icon: 'mdi-emoticon-happy' },
  { value: 5, text: 'Totalmente de acuerdo', color: 'green', icon: 'mdi-emoticon-excited' },
]

const questions = {
  instructor: [
    'Expuso el objetivo y temario del curso.',
    'Mostró dominio del contenido abordado.',
    'Fomentó la participación del grupo.',
    'Aclaró las dudas que se presentaron.',
    'Dio retroalimentación a los ejercicios realizados.',
    'Aplicó una evaluación final relacionada con los contenidos del curso.',
    'Inició y concluyó puntualmente las sesiones.',
  ],
  material: [
    'El material didáctico fue útil a lo largo del curso.',
    'La impresión del material didáctico fue legible.',
    'La variedad del material didáctico fue suficiente para apoyar su aprendizaje.',
  ],
  course: [
    'La distribución del tiempo fue adecuada para cubrir el contenido.',
    'Los temas fueron suficientes para alcanzar el objetivo del curso.',
    'El curso comprendió ejercicios de práctica relacionados con el contenido.',
    'El curso cubrió sus expectativas.',
  ],
  infrastructure: [
    'La iluminación del aula fue adecuada.',
    'La ventilación del aula fue adecuada.',
    'El aseo del aula fue adecuado.',
    'El servicio de los sanitarios fue adecuado (limpieza, abasto de papel, toallas, jabón, etc.).',
    'El servicio de café fue adecuado.',
    'Recibió apoyo del personal que coordinó el curso.',
  ],
}

const checkIfAlreadyAnswered = async () => {
  // Determinar qué worker ID usar (prop o usuario autenticado)
  const targetWorkerId = props.workerId || authStore.user?.id
  if (!targetWorkerId) return

  loading.value = true
  try {
    const existingAnswers = await surveyService.getWorkerSurveyAnswers(
      OPINION_SURVEY_ID,
      targetWorkerId,
      props.course.id
    )

    if (existingAnswers && existingAnswers.length > 0) {
      hasAnswers.value = true

      // Si está en modo readOnly, cargar las respuestas
      if (props.readOnly) {
        loadAnswersIntoForm(existingAnswers)
      } else {
        // Si no está en readOnly, marcar como ya respondido
        alreadyAnswered.value = true
      }
    }
  } catch (error) {
    console.error('Error verificando respuestas:', error)
  } finally {
    loading.value = false
  }
}

const loadAnswersIntoForm = (answers: any[]) => {
  // Crear un mapa de question_id -> value para búsqueda rápida
  const answerMap = new Map(answers.map(a => [a.question_id, a.value]))

  // IDs de las preguntas
  const instructorQuestionIds = [
    'c613744d-a2cc-4e5b-b0a4-c9e1488b7658',
    'd6ade9fe-b02a-4435-8254-00b009fcc8a6',
    '6577645c-96f6-495d-ae31-65727e029d68',
    'a2b6fbd2-e431-485d-910f-d1440c4fc6f4',
    '8775f5a8-d88a-46c1-9eb8-9a44a1aee56a',
    '747f6e4a-1103-4fd3-91da-7743c623dd60',
    'e6b27138-4041-4253-a1fb-8a6c530ed06c',
  ]
  const materialQuestionIds = [
    '44c6af40-e6c3-4b01-90d6-7b1bc20f33d1',
    '2b884a85-b41e-4c91-8a42-c98a41583f5f',
    'e619993e-cc69-45bb-a990-6e3bf840dca7',
  ]
  const courseQuestionIds = [
    'f47b08ed-1f5b-4e4f-b0d4-d2446df19157',
    'c648f340-b4d4-4d8a-85bb-501314c4b83a',
    '8b0cc047-eb89-4409-a81a-ac481299369a',
    'e4e69b3d-a4e2-4c4b-8991-d38071d9a20f',
  ]
  const infrastructureQuestionIds = [
    'c16802fa-af4a-4855-bb20-f20ceaa2f28e',
    '43292b9b-14d1-40ca-96a9-77bc88f49128',
    'f2665c3d-d0d5-405d-ac73-533c3bc41d29',
    'a3326530-b3f4-4122-a38f-bf2b231b0de0',
    'cba33950-6190-4401-a749-26dff08cb6ab',
    '4e376ddf-922b-4d57-8551-0cd679d218db',
  ]
  const commentsQuestionId = '085773da-7b07-4619-8178-cdffcb5ea7dc'

  // Cargar instructor
  instructorQuestionIds.forEach((id, index) => {
    const value = answerMap.get(id)
    if (value) {
      const key = `q${index + 1}` as keyof typeof formAnswers.value.instructor
      formAnswers.value.instructor[key] = parseInt(value)
    }
  })

  // Cargar material
  materialQuestionIds.forEach((id, index) => {
    const value = answerMap.get(id)
    if (value) {
      const key = `q${index + 1}` as keyof typeof formAnswers.value.material
      formAnswers.value.material[key] = parseInt(value)
    }
  })

  // Cargar course
  courseQuestionIds.forEach((id, index) => {
    const value = answerMap.get(id)
    if (value) {
      const key = `q${index + 1}` as keyof typeof formAnswers.value.course
      formAnswers.value.course[key] = parseInt(value)
    }
  })

  // Cargar infrastructure
  infrastructureQuestionIds.forEach((id, index) => {
    const value = answerMap.get(id)
    if (value) {
      const key = `q${index + 1}` as keyof typeof formAnswers.value.infrastructure
      formAnswers.value.infrastructure[key] = parseInt(value)
    }
  })

  // Cargar comentarios
  const commentsValue = answerMap.get(commentsQuestionId)
  if (commentsValue) {
    formAnswers.value.comments = commentsValue
  }
}

const resetForm = () => {
  formAnswers.value = {
    instructor: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0 },
    material: { q1: 0, q2: 0, q3: 0 },
    course: { q1: 0, q2: 0, q3: 0, q4: 0 },
    infrastructure: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 },
    comments: '',
  }
}

const isSectionValid = (sectionId: string) => {
  const section = formAnswers.value[sectionId as keyof typeof formAnswers.value]
  if (typeof section === 'object' && section !== null && !Array.isArray(section)) {
    return Object.values(section).every((v) => typeof v === 'number' && v > 0)
  }
  return true
}

const isFormValid = computed(() => {
  return (
    isSectionValid('instructor') &&
    isSectionValid('material') &&
    isSectionValid('course') &&
    isSectionValid('infrastructure')
  )
})

const getSectionProgress = (sectionId: string) => {
  const section = formAnswers.value[sectionId as keyof typeof formAnswers.value]
  if (typeof section === 'object' && section !== null && !Array.isArray(section)) {
    const values = Object.values(section).filter((v) => typeof v === 'number')
    const answered = values.filter((v) => v > 0).length
    return (answered / values.length) * 100
  }
  return 0
}

const overallProgress = computed(() => {
  const sections = ['instructor', 'material', 'course', 'infrastructure']
  const totalProgress = sections.reduce((acc, s) => acc + getSectionProgress(s), 0)
  return totalProgress / sections.length
})

const nextSection = () => {
  if (currentSection.value < sections.length - 1) {
    currentSection.value++
  }
}

const previousSection = () => {
  if (currentSection.value > 0) {
    currentSection.value--
  }
}

const submitSurvey = async () => {
  if (!authStore.user?.id) return

  loading.value = true
  try {
    // IDs de las preguntas de la encuesta de opinión
    const instructorQuestionIds = [
      'c613744d-a2cc-4e5b-b0a4-c9e1488b7658', // q1
      'd6ade9fe-b02a-4435-8254-00b009fcc8a6', // q2
      '6577645c-96f6-495d-ae31-65727e029d68', // q3
      'a2b6fbd2-e431-485d-910f-d1440c4fc6f4', // q4
      '8775f5a8-d88a-46c1-9eb8-9a44a1aee56a', // q5
      '747f6e4a-1103-4fd3-91da-7743c623dd60', // q6
      'e6b27138-4041-4253-a1fb-8a6c530ed06c', // q7
    ]
    const materialQuestionIds = [
      '44c6af40-e6c3-4b01-90d6-7b1bc20f33d1', // q1
      '2b884a85-b41e-4c91-8a42-c98a41583f5f', // q2
      'e619993e-cc69-45bb-a990-6e3bf840dca7', // q3
    ]
    const courseQuestionIds = [
      'f47b08ed-1f5b-4e4f-b0d4-d2446df19157', // q1
      'c648f340-b4d4-4d8a-85bb-501314c4b83a', // q2
      '8b0cc047-eb89-4409-a81a-ac481299369a', // q3
      'e4e69b3d-a4e2-4c4b-8991-d38071d9a20f', // q4
    ]
    const infrastructureQuestionIds = [
      'c16802fa-af4a-4855-bb20-f20ceaa2f28e', // q1
      '43292b9b-14d1-40ca-96a9-77bc88f49128', // q2
      'f2665c3d-d0d5-405d-ac73-533c3bc41d29', // q3
      'a3326530-b3f4-4122-a38f-bf2b231b0de0', // q4
      'cba33950-6190-4401-a749-26dff08cb6ab', // q5
      '4e376ddf-922b-4d57-8551-0cd679d218db', // q6
    ]
    const commentsQuestionId = '085773da-7b07-4619-8178-cdffcb5ea7dc'

    const answers = [
      // Instructor (7 preguntas)
      {
        question_id: instructorQuestionIds[0],
        value: formAnswers.value.instructor.q1.toString(),
      },
      {
        question_id: instructorQuestionIds[1],
        value: formAnswers.value.instructor.q2.toString(),
      },
      {
        question_id: instructorQuestionIds[2],
        value: formAnswers.value.instructor.q3.toString(),
      },
      {
        question_id: instructorQuestionIds[3],
        value: formAnswers.value.instructor.q4.toString(),
      },
      {
        question_id: instructorQuestionIds[4],
        value: formAnswers.value.instructor.q5.toString(),
      },
      {
        question_id: instructorQuestionIds[5],
        value: formAnswers.value.instructor.q6.toString(),
      },
      {
        question_id: instructorQuestionIds[6],
        value: formAnswers.value.instructor.q7.toString(),
      },
      // Material (3 preguntas)
      {
        question_id: materialQuestionIds[0],
        value: formAnswers.value.material.q1.toString(),
      },
      {
        question_id: materialQuestionIds[1],
        value: formAnswers.value.material.q2.toString(),
      },
      {
        question_id: materialQuestionIds[2],
        value: formAnswers.value.material.q3.toString(),
      },
      // Course (4 preguntas)
      {
        question_id: courseQuestionIds[0],
        value: formAnswers.value.course.q1.toString(),
      },
      {
        question_id: courseQuestionIds[1],
        value: formAnswers.value.course.q2.toString(),
      },
      {
        question_id: courseQuestionIds[2],
        value: formAnswers.value.course.q3.toString(),
      },
      {
        question_id: courseQuestionIds[3],
        value: formAnswers.value.course.q4.toString(),
      },
      // Infrastructure (6 preguntas)
      {
        question_id: infrastructureQuestionIds[0],
        value: formAnswers.value.infrastructure.q1.toString(),
      },
      {
        question_id: infrastructureQuestionIds[1],
        value: formAnswers.value.infrastructure.q2.toString(),
      },
      {
        question_id: infrastructureQuestionIds[2],
        value: formAnswers.value.infrastructure.q3.toString(),
      },
      {
        question_id: infrastructureQuestionIds[3],
        value: formAnswers.value.infrastructure.q4.toString(),
      },
      {
        question_id: infrastructureQuestionIds[4],
        value: formAnswers.value.infrastructure.q5.toString(),
      },
      {
        question_id: infrastructureQuestionIds[5],
        value: formAnswers.value.infrastructure.q6.toString(),
      },
      // Comments
      {
        question_id: commentsQuestionId,
        value: formAnswers.value.comments,
      },
    ]

    const request: SurveySubmitRequest = {
      worker_id: authStore.user.id,
      course_id: props.course.id,
      answers,
    }

    await surveyService.submitSurveyAnswers(OPINION_SURVEY_ID, request)
    submitted.value = true

    // Descargar PDF automáticamente después de enviar
    await downloadPDF()
  } catch (error) {
    console.error('Error al enviar encuesta:', error)
    const err = error as { response?: { status?: number } }
    if (err.response?.status === 409) {
      alreadyAnswered.value = true
    } else {
      alert('Error al enviar la encuesta. Por favor intente de nuevo.')
    }
  } finally {
    loading.value = false
  }
}

const downloadPDF = async () => {
  const targetWorkerId = props.workerId || authStore.user?.id
  if (!targetWorkerId) return

  loading.value = true
  try {
    await reportService.downloadOpinionSurvey(targetWorkerId, props.course.id)
  } catch (error) {
    console.error('Error al descargar PDF:', error)
    alert('Error al descargar el PDF de respuestas. Por favor intente de nuevo.')
  } finally {
    loading.value = false
  }
}

onMounted(checkIfAlreadyAnswered)
</script>

<template>
  <v-card>
    <v-card-title class="bg-primary text-white">
      <v-icon class="mr-2">mdi-clipboard-text</v-icon>
      Encuesta de Opinión del Curso
    </v-card-title>

    <v-card-text class="pa-6">

      <!-- Mensaje cuando no hay respuestas en modo readOnly -->
      <div v-if="readOnly && !hasAnswers && !loading" class="text-center py-8">
        <v-icon size="80" color="info">mdi-information</v-icon>
        <h3 class="text-h5 mt-4">Sin respuestas</h3>
        <p class="text-body-1 mt-2">
          Este trabajador aún no ha respondido la encuesta de opinión para este curso.
        </p>
        <v-btn color="primary" class="mt-6" @click="emit('close')">
          Volver
        </v-btn>
      </div>

      <!-- Mensaje de ya respondido -->
      <div v-else-if="alreadyAnswered" class="text-center py-8">
        <v-icon size="80" color="warning">mdi-alert-circle</v-icon>
        <h3 class="text-h5 mt-4">Ya has respondido esta encuesta</h3>
        <p class="text-body-1 mt-2">
          Ya has completado la encuesta de opinión para el curso "{{ course.name }}".
        </p>
        <p class="text-body-2 text-grey mt-2">
          Solo puedes responder esta encuesta una vez por curso.
        </p>
        <div class="mt-6 d-flex gap-3 justify-center">
          <v-btn variant="outlined" @click="emit('close')">
            Volver
          </v-btn>
          <v-btn color="primary" prepend-icon="mdi-download" @click="downloadPDF">
            Descargar Respuestas PDF
          </v-btn>
        </div>
      </div>

      <!-- Formulario de evaluación -->
      <div v-else-if="!submitted && (readOnly ? hasAnswers : !alreadyAnswered)">

        <h3 class="text-h5 mb-2">{{ course.name }}</h3>
        <p class="text-subtitle-1 mb-4">
          Complete la encuesta de opinión sobre el curso.
        </p>

        <!-- Progreso general -->
        <v-card variant="tonal" color="info" class="mb-6">
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="font-weight-bold">Progreso general</span>
              <span>{{ overallProgress.toFixed(0) }}%</span>
            </div>
            <v-progress-linear
              :model-value="overallProgress"
              color="success"
              height="12"
              rounded
            />
          </v-card-text>
        </v-card>

        <!-- Navegación por secciones -->
        <v-tabs v-model="currentSection" bg-color="transparent" color="primary" class="mb-6">
          <v-tab
            v-for="(section, index) in sections"
            :key="section.id"
            :value="index"
          >
            <v-icon :icon="section.icon" class="mr-2" />
            {{ section.title }}
            <v-badge
              v-if="getSectionProgress(section.id) === 100"
              color="success"
              icon="mdi-check"
              inline
              class="ml-2"
            />
          </v-tab>
        </v-tabs>

        <!-- Sección Instructor -->
        <v-window v-model="currentSection">
          <v-window-item :value="0">
            <v-card variant="outlined" class="mb-6">
              <v-card-title class="bg-grey-lighten-4">
                <v-icon class="mr-2">mdi-account-tie</v-icon>
                Instructor
              </v-card-title>
              <v-card-text class="pa-6">
                <div
                  v-for="(question, index) in questions.instructor"
                  :key="`instructor-${index}`"
                  class="mb-8"
                >
                  <h4 class="text-subtitle-1 mb-3">{{ index + 1 }}. {{ question }}</h4>
                  <v-radio-group
                    v-model="formAnswers.instructor[`q${index + 1}`]"
                    inline
                    hide-details
                    :disabled="readOnly"
                  >
                    <v-radio
                      v-for="option in likertOptions"
                      :key="option.value"
                      :value="option.value"
                      :color="option.color"
                    >
                      <template v-slot:label>
                        <div class="d-flex align-center">
                          <v-icon :icon="option.icon" :color="option.color" class="mr-1" size="small" />
                          <span :class="`text-${option.color}`">{{ option.text }}</span>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </div>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- Sección Material Didáctico -->
          <v-window-item :value="1">
            <v-card variant="outlined" class="mb-6">
              <v-card-title class="bg-grey-lighten-4">
                <v-icon class="mr-2">mdi-book-open-page-variant</v-icon>
                Material Didáctico
              </v-card-title>
              <v-card-text class="pa-6">
                <div
                  v-for="(question, index) in questions.material"
                  :key="`material-${index}`"
                  class="mb-8"
                >
                  <h4 class="text-subtitle-1 mb-3">{{ index + 1 }}. {{ question }}</h4>
                  <v-radio-group
                    v-model="formAnswers.material[`q${index + 1}`]"
                    inline
                    hide-details
                    :disabled="readOnly"
                  >
                    <v-radio
                      v-for="option in likertOptions"
                      :key="option.value"
                      :value="option.value"
                      :color="option.color"
                    >
                      <template v-slot:label>
                        <div class="d-flex align-center">
                          <v-icon :icon="option.icon" :color="option.color" class="mr-1" size="small" />
                          <span :class="`text-${option.color}`">{{ option.text }}</span>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </div>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- Sección Curso -->
          <v-window-item :value="2">
            <v-card variant="outlined" class="mb-6">
              <v-card-title class="bg-grey-lighten-4">
                <v-icon class="mr-2">mdi-school</v-icon>
                Curso
              </v-card-title>
              <v-card-text class="pa-6">
                <div
                  v-for="(question, index) in questions.course"
                  :key="`course-${index}`"
                  class="mb-8"
                >
                  <h4 class="text-subtitle-1 mb-3">{{ index + 1 }}. {{ question }}</h4>
                  <v-radio-group
                    v-model="formAnswers.course[`q${index + 1}`]"
                    inline
                    hide-details
                    :disabled="readOnly"
                  >
                    <v-radio
                      v-for="option in likertOptions"
                      :key="option.value"
                      :value="option.value"
                      :color="option.color"
                    >
                      <template v-slot:label>
                        <div class="d-flex align-center">
                          <v-icon :icon="option.icon" :color="option.color" class="mr-1" size="small" />
                          <span :class="`text-${option.color}`">{{ option.text }}</span>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </div>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- Sección Infraestructura -->
          <v-window-item :value="3">
            <v-card variant="outlined" class="mb-6">
              <v-card-title class="bg-grey-lighten-4">
                <v-icon class="mr-2">mdi-office-building</v-icon>
                Infraestructura
              </v-card-title>
              <v-card-text class="pa-6">
                <div
                  v-for="(question, index) in questions.infrastructure"
                  :key="`infrastructure-${index}`"
                  class="mb-8"
                >
                  <h4 class="text-subtitle-1 mb-3">{{ index + 1 }}. {{ question }}</h4>
                  <v-radio-group
                    v-model="formAnswers.infrastructure[`q${index + 1}`]"
                    inline
                    hide-details
                    :disabled="readOnly"
                  >
                    <v-radio
                      v-for="option in likertOptions"
                      :key="option.value"
                      :value="option.value"
                      :color="option.color"
                    >
                      <template v-slot:label>
                        <div class="d-flex align-center">
                          <v-icon :icon="option.icon" :color="option.color" class="mr-1" size="small" />
                          <span :class="`text-${option.color}`">{{ option.text }}</span>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </div>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>

        <!-- Sección de comentarios (siempre visible) -->
        <v-card variant="outlined" class="mb-6">
          <v-card-title class="bg-grey-lighten-4">
            <v-icon class="mr-2">mdi-comment-text</v-icon>
            Comentarios o Sugerencias
          </v-card-title>
          <v-card-text class="pa-6">
            <v-textarea
              v-model="formAnswers.comments"
              label="Comparta sus comentarios o sugerencias"
              variant="outlined"
              rows="5"
              placeholder="Escriba aquí sus comentarios..."
              :disabled="readOnly"
            />
          </v-card-text>
        </v-card>

        <!-- Botones de navegación -->
        <v-card-actions v-if="!readOnly" class="px-0">
          <v-btn
            v-if="currentSection > 0"
            variant="outlined"
            prepend-icon="mdi-chevron-left"
            @click="previousSection"
          >
            Anterior
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="currentSection < sections.length - 1"
            color="primary"
            append-icon="mdi-chevron-right"
            @click="nextSection"
            :disabled="!isSectionValid(sections[currentSection].id)"
          >
            Siguiente
          </v-btn>
          <v-btn
            v-else
            color="success"
            size="large"
            prepend-icon="mdi-send"
            :disabled="!isFormValid"
            :loading="loading"
            @click="submitSurvey"
          >
            Enviar Encuesta
          </v-btn>
        </v-card-actions>
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="submitted" class="text-center py-8">
        <v-icon size="80" color="success">mdi-check-circle</v-icon>
        <h3 class="text-h5 mt-4">¡Encuesta enviada con éxito!</h3>
        <p class="text-body-1 mt-2">
          Gracias por completar la encuesta de opinión del curso.
        </p>
        <p class="text-body-2 text-grey mt-2">
          Su retroalimentación nos ayuda a mejorar la calidad de nuestros cursos.
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
  gap: 12px;
}

.v-radio-group.inline :deep(.v-selection-control-group) {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}
</style>

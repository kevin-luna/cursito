<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import surveyService, { type SubmitSurveyAnswersRequest } from '@/services/surveyService'
import courseService, { type Course } from '@/services/courseService'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const myCourses = ref<Course[]>([])
const selectedCourse = ref<Course | null>(null)
const submitted = ref(false)
const step = ref(1)
const currentSection = ref(0)

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

const loadMyCourses = async () => {
  loading.value = true
  try {
    if (!authStore.user?.id) return
    const response = await courseService.getCoursesByWorker(authStore.user.id)
    myCourses.value = response
  } finally {
    loading.value = false
  }
}

const selectCourse = (course: Course) => {
  selectedCourse.value = course
  step.value = 2
  currentSection.value = 0
  resetForm()
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
  if (!selectedCourse.value) return

  loading.value = true
  try {
    const answers = [
      // Instructor
      ...Object.entries(formAnswers.value.instructor).map(([key, value]) => ({
        question_id: `opinion-instructor-${key}`,
        value: value.toString(),
      })),
      // Material
      ...Object.entries(formAnswers.value.material).map(([key, value]) => ({
        question_id: `opinion-material-${key}`,
        value: value.toString(),
      })),
      // Course
      ...Object.entries(formAnswers.value.course).map(([key, value]) => ({
        question_id: `opinion-course-${key}`,
        value: value.toString(),
      })),
      // Infrastructure
      ...Object.entries(formAnswers.value.infrastructure).map(([key, value]) => ({
        question_id: `opinion-infrastructure-${key}`,
        value: value.toString(),
      })),
      // Comments
      {
        question_id: 'opinion-comments',
        value: formAnswers.value.comments,
      },
    ]

    const request: SubmitSurveyAnswersRequest = {
      course_id: selectedCourse.value.id,
      answers,
    }

    await surveyService.submitAnswers(request)
    submitted.value = true
  } finally {
    loading.value = false
  }
}


const resetAll = () => {
  step.value = 1
  selectedCourse.value = null
  submitted.value = false
  currentSection.value = 0
  resetForm()
}

onMounted(loadMyCourses)
</script>

<template>
  <v-card>
    <v-card-title class="bg-primary text-white">
      <v-icon class="mr-2">mdi-clipboard-text</v-icon>
      Encuesta de Opinión del Curso
    </v-card-title>

    <v-card-text class="pa-6">

      <!-- Paso 2: Formulario de evaluación -->
      <div v-if="!submitted">

        <h3 class="text-h5 mb-2">{{ selectedCourse?.name }}</h3>
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
            />
          </v-card-text>
        </v-card>

        <!-- Botones de navegación -->
        <v-card-actions class="px-0">
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
        <v-btn color="primary" class="mt-6" @click="resetAll">
          Evaluar otro curso
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

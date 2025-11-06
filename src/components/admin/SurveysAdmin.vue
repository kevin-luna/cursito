<script setup lang="ts">
import { ref, onMounted } from 'vue'
import surveyService, {
  type Survey,
  type Question,
  type CreateSurveyRequest,
} from '@/services/surveyService'

const surveys = ref<Survey[]>([])
const selectedSurvey = ref<Survey | null>(null)
const questions = ref<Question[]>([])
const answers = ref<any[]>([])
const loading = ref(false)
const dialog = ref(false)
const questionsDialog = ref(false)
const answersDialog = ref(false)

const formData = ref<CreateSurveyRequest>({
  name: '',
  questions: [],
})

const newQuestion = ref({ question: '', position: 1 })

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Fecha Creación', key: 'created_at' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const loadSurveys = async () => {
  loading.value = true
  try {
    surveys.value = await surveyService.getAllSurveys()
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  formData.value = { name: '', questions: [] }
  dialog.value = true
}

const addQuestion = () => {
  formData.value.questions.push({
    question: newQuestion.value.question,
    position: formData.value.questions.length + 1,
  })
  newQuestion.value = { question: '', position: formData.value.questions.length + 2 }
}

const removeQuestion = (index: number) => {
  formData.value.questions.splice(index, 1)
  formData.value.questions.forEach((q, i) => (q.position = i + 1))
}

const createSurvey = async () => {
  loading.value = true
  try {
    await surveyService.createSurvey(formData.value)
    dialog.value = false
    await loadSurveys()
  } finally {
    loading.value = false
  }
}

const viewQuestions = async (survey: Survey) => {
  selectedSurvey.value = survey
  loading.value = true
  try {
    questions.value = await surveyService.getQuestionsBySurvey(survey.id)
    questionsDialog.value = true
  } finally {
    loading.value = false
  }
}

const viewAnswers = async (survey: Survey) => {
  selectedSurvey.value = survey
  answersDialog.value = true
}

onMounted(loadSurveys)
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between">
      <span class="text-h5">Gestión de Encuestas</span>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Nueva Encuesta
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-data-table :headers="headers" :items="surveys" :loading="loading">
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-format-list-bulleted"
            size="small"
            variant="text"
            @click="viewQuestions(item)"
          />
          <v-btn
            icon="mdi-comment-text-multiple"
            size="small"
            variant="text"
            color="primary"
            @click="viewAnswers(item)"
          />
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Dialog crear encuesta -->
    <v-dialog v-model="dialog" max-width="700px" persistent>
      <v-card>
        <v-card-title>Nueva Encuesta</v-card-title>
        <v-card-text>
          <v-text-field v-model="formData.name" label="Nombre de la Encuesta" required />

          <v-divider class="my-4" />

          <h3 class="mb-2">Preguntas</h3>
          <v-list>
            <v-list-item v-for="(q, index) in formData.questions" :key="index">
              <v-list-item-title>{{ index + 1 }}. {{ q.question }}</v-list-item-title>
              <template v-slot:append>
                <v-btn icon="mdi-delete" size="small" @click="removeQuestion(index)" />
              </template>
            </v-list-item>
          </v-list>

          <v-row>
            <v-col cols="10">
              <v-text-field
                v-model="newQuestion.question"
                label="Nueva Pregunta"
                @keyup.enter="addQuestion"
              />
            </v-col>
            <v-col cols="2">
              <v-btn color="primary" @click="addQuestion" block>Agregar</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="!formData.name || formData.questions.length === 0"
            @click="createSurvey"
          >
            Crear
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog ver preguntas -->
    <v-dialog v-model="questionsDialog" max-width="600px">
      <v-card>
        <v-card-title>Preguntas: {{ selectedSurvey?.name }}</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="question in questions" :key="question.id">
              <v-list-item-title>{{ question.position }}. {{ question.question }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="questionsDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog ver respuestas -->
    <v-dialog v-model="answersDialog" max-width="800px">
      <v-card>
        <v-card-title>Respuestas: {{ selectedSurvey?.name }}</v-card-title>
        <v-card-text>
          <p class="text-center">Visualización de respuestas en desarrollo</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="answersDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

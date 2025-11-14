<script setup lang="ts">
import { ref, onMounted } from 'vue'
import courseService, { type Course } from '@/services/courseService'
import enrollmentService from '@/services/enrollmentService'
import attendanceService, { type BulkAttendanceRequest } from '@/services/attendanceService'
import surveyService, { type Survey } from '@/services/surveyService'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const myCourses = ref<Course[]>([])
const selectedCourse = ref<Course | null>(null)
const loading = ref(false)
const attendanceDialog = ref(false)
const gradesDialog = ref(false)
const surveysDialog = ref(false)
const enrolledStudents = ref<any[]>([])
const attendanceDate = ref('')
const selectedStudents = ref<string[]>([])
const availableSurveys = ref<Survey[]>([])
const assignedSurveys = ref<Survey[]>([])

const loadMyCourses = async () => {
  loading.value = true
  try {
    const allCourses = await courseService.getAll()
    const myCoursesData: Course[] = []

    for (const course of allCourses) {
      const instructors = await courseService.getInstructors(course.id)
      if (instructors.some((i: any) => i.worker_id === authStore.user?.id)) {
        myCoursesData.push(course)
      }
    }

    myCourses.value = myCoursesData
  } finally {
    loading.value = false
  }
}

const openAttendanceDialog = async (course: Course) => {
  selectedCourse.value = course
  loading.value = true
  try {
    const enrollments = await courseService.getEnrollments(course.id)
    enrolledStudents.value = enrollments
    attendanceDate.value = new Date().toISOString().split('T')[0] || ''
    selectedStudents.value = []
    attendanceDialog.value = true
  } finally {
    loading.value = false
  }
}

const saveAttendance = async () => {
  if (!selectedCourse.value || selectedStudents.value.length === 0) {
    alert('Debe seleccionar al menos un estudiante')
    return
  }

  loading.value = true
  try {
    const data: BulkAttendanceRequest = {
      course_id: selectedCourse.value.id,
      date: attendanceDate.value,
      worker_ids: selectedStudents.value,
    }
    await attendanceService.createBulk(data)
    alert('Asistencia registrada exitosamente')
    attendanceDialog.value = false
  } finally {
    loading.value = false
  }
}

const openGradesDialog = async (course: Course) => {
  selectedCourse.value = course
  loading.value = true
  try {
    const enrollments = await courseService.getEnrollments(course.id)
    enrolledStudents.value = enrollments
    gradesDialog.value = true
  } finally {
    loading.value = false
  }
}

const updateGrade = async (enrollmentId: string, grade: number) => {
  loading.value = true
  try {
    await enrollmentService.updateGrade(enrollmentId, { final_grade: grade })
    alert('Calificación actualizada')
  } finally {
    loading.value = false
  }
}

const openSurveysDialog = async (course: Course) => {
  selectedCourse.value = course
  loading.value = true
  try {
    availableSurveys.value = await surveyService.getAllSurveys()
    assignedSurveys.value = await courseService.getSurveys(course.id)
    surveysDialog.value = true
  } finally {
    loading.value = false
  }
}

const toggleSurvey = async (surveyId: string) => {
  if (!selectedCourse.value) return
  const isAssigned = assignedSurveys.value.some((s) => s.id === surveyId)

  loading.value = true
  try {
    if (isAssigned) {
      await courseService.removeSurvey(selectedCourse.value.id, surveyId)
    } else {
      await courseService.addSurvey(selectedCourse.value.id, surveyId)
    }
    assignedSurveys.value = await courseService.getSurveys(selectedCourse.value.id)
  } finally {
    loading.value = false
  }
}

onMounted(loadMyCourses)
</script>

<template>
  <div>
    <v-card>
      <v-card-title class="text-h5">Cursos que Imparto</v-card-title>
      <v-card-text>
        <v-row>
          <v-col v-for="course in myCourses" :key="course.id" cols="12" md="6" lg="4">
            <v-card elevation="2">
              <v-card-title class="text-h6">{{ course.name }}</v-card-title>
              <v-card-text>
                <div class="text-body-2">
                  <strong>Inicia:</strong> {{ course.start_date }}
                </div>
                <div class="text-body-2">
                  <strong>Termina:</strong> {{ course.end_date }}
                </div>
              </v-card-text>
              <v-card-actions class="flex-wrap">
                <v-btn
                  size="small"
                  color="primary"
                  prepend-icon="mdi-calendar-check"
                  @click="openAttendanceDialog(course)"
                >
                  Asistencia
                </v-btn>
                <v-btn
                  size="small"
                  color="success"
                  prepend-icon="mdi-certificate"
                  @click="openGradesDialog(course)"
                >
                  Calificar
                </v-btn>
                <v-btn
                  size="small"
                  color="info"
                  prepend-icon="mdi-file-document"
                  @click="openSurveysDialog(course)"
                >
                  Encuestas
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-alert v-if="myCourses.length === 0" type="info" class="mt-4">
          No eres instructor de ningún curso
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Dialog pase de lista -->
    <v-dialog v-model="attendanceDialog" max-width="600px">
      <v-card>
        <v-card-title>Pase de Lista - {{ selectedCourse?.name }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="attendanceDate" label="Fecha" type="date" class="mb-4" />

          <v-list>
            <v-list-item v-for="student in enrolledStudents" :key="student.id">
              <template v-slot:prepend>
                <v-checkbox-btn
                  v-model="selectedStudents"
                  :value="student.worker_id"
                ></v-checkbox-btn>
              </template>
              <v-list-item-title>{{ student.worker_name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="attendanceDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="loading" @click="saveAttendance">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog calificaciones -->
    <v-dialog v-model="gradesDialog" max-width="600px">
      <v-card>
        <v-card-title>Asignar Calificaciones - {{ selectedCourse?.name }}</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="student in enrolledStudents" :key="student.id">
              <v-row align="center">
                <v-col cols="7">
                  <v-list-item-title>{{ student.worker_name }}</v-list-item-title>
                </v-col>
                <v-col cols="5">
                  <v-text-field
                    :model-value="student.final_grade"
                    @update:model-value="(val) => updateGrade(student.id, Number(val))"
                    label="Calificación"
                    type="number"
                    min="0"
                    max="100"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="gradesDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog gestión de encuestas -->
    <v-dialog v-model="surveysDialog" max-width="600px">
      <v-card>
        <v-card-title>Gestión de Encuestas - {{ selectedCourse?.name }}</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="survey in availableSurveys" :key="survey.id">
              <v-list-item-title>{{ survey.name }}</v-list-item-title>
              <template v-slot:append>
                <v-switch
                  :model-value="assignedSurveys.some((s) => s.id === survey.id)"
                  @update:model-value="toggleSurvey(survey.id)"
                  color="primary"
                  :loading="loading"
                />
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="surveysDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

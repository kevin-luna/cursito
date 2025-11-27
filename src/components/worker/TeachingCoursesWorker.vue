<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import courseService, { type Course } from '@/services/courseService'
import enrollmentService, { type Enrollment } from '@/services/enrollmentService'
import attendanceService, { type BulkAttendanceRequest } from '@/services/attendanceService'
import surveyService from '@/services/surveyService'
import { useAuthStore, type Worker as WorkerUser } from '@/stores/auth'
import CreateCourseWorker from './CreateCourseWorker.vue'
import workerService from '@/services/workerService'
import OpinionSurveyForm from './OpinionSurveyForm.vue'
import FollowUpCSATForm from './FollowUpCSATForm.vue'

const authStore = useAuthStore()
const myCourses = ref<Course[]>([])
const selectedCourse = ref<Course | null>(null)
const loading = ref(false)
const attendanceDialog = ref(false)
const gradesDialog = ref(false)
const surveysDialog = ref(false)
const createCourseDialog = ref(false)
const editMode = ref(false)
const enrolledStudents = ref<Enrollment[]>([])
const attendanceDate = ref('')
const selectedStudents = ref<string[]>([])
const editedGrades = ref<Map<string, number>>(new Map())
const attendedWorkers = ref<WorkerUser[]>([])
const selectedWorkerForSurvey = ref<WorkerUser | null>(null)
const selectedSurveyType = ref<'opinion' | 'followup' | null>(null)

// Computed properties para limitar el rango de fechas
const minDate = computed(() => selectedCourse.value?.start_date || '')
const maxDate = computed(() => selectedCourse.value?.end_date || '')

const loadMyCourses = async () => {
  if (!authStore.user?.id) return

  loading.value = true
  try {
    const userId = authStore.user.id
    const allCourses = await workerService.getCourses(userId, 'teaching')

    myCourses.value = allCourses
  } finally {
    loading.value = false
  }
}

const loadAttendancesByDate = async () => {
  if (!selectedCourse.value || !attendanceDate.value || !attendanceDialog.value) {
    return
  }

  try {
    const workers = await courseService.getAttendances(selectedCourse.value.id, attendanceDate.value)
    attendedWorkers.value = workers as unknown as WorkerUser[]

    // Marcar los estudiantes que ya tienen asistencia
    const selected = enrolledStudents.value
      .filter(enrollment => {
        const workerData = enrollment.worker as unknown as WorkerUser
        const hasAttendance = workers.some((w) => {
          const workerFromList = w as unknown as WorkerUser
          return workerFromList.id === workerData?.id
        })
        return hasAttendance
      })
      .map(enrollment => enrollment.id)

    selectedStudents.value = selected
  } catch (error) {
    console.error('Error loading attendances:', error)
    selectedStudents.value = []
  }
}

const openAttendanceDialog = async (course: Course) => {
  if (!authStore.user?.id) return

  selectedCourse.value = course
  attendanceDialog.value = true
  loading.value = true

  try {
    const enrollments = await courseService.getEnrollments(course.id)
    enrolledStudents.value = enrollments

    // Establecer la fecha actual o la fecha de inicio del curso si aún no ha comenzado
    const today = new Date().toISOString().split('T')[0] || ''
    const courseStartDate = course.start_date
    const courseEndDate = course.end_date

    if (today < courseStartDate) {
      attendanceDate.value = courseStartDate
    } else if (today > courseEndDate) {
      attendanceDate.value = courseEndDate
    } else {
      attendanceDate.value = today
    }

    // Cargar asistencias de la fecha seleccionada (el watch se encargará de esto)
  } finally {
    loading.value = false
  }
}

// Watch para cargar asistencias cuando cambie la fecha
watch(attendanceDate, async () => {
  if (attendanceDialog.value && enrolledStudents.value.length > 0) {
    await loadAttendancesByDate()
  }
})

const saveAttendance = async () => {
  if (!selectedCourse.value || selectedStudents.value.length === 0) {
    alert('Debe seleccionar al menos un estudiante')
    return
  }

  loading.value = true
  try {
    // Convertir enrollment IDs a worker IDs
    const workerIds = selectedStudents.value
      .map(enrollmentId => {
        const enrollment = enrolledStudents.value.find(e => e.id === enrollmentId)
        const workerData = enrollment?.worker as unknown as WorkerUser
        return workerData?.id
      })
      .filter((id): id is string => !!id)

    const data: BulkAttendanceRequest = {
      course_id: selectedCourse.value.id,
      date: attendanceDate.value,
      worker_ids: workerIds,
    }
    await attendanceService.createBulk(data)
    alert('Asistencia registrada exitosamente')

    // Recargar asistencias después de guardar
    await loadAttendancesByDate()
  } finally {
    loading.value = false
  }
}

const openGradesDialog = async (course: Course) => {
  selectedCourse.value = course
  loading.value = true
  gradesDialog.value = true
  editedGrades.value.clear()
  try {
    const enrollments = await courseService.getEnrollments(course.id)
    enrolledStudents.value = enrollments
  } finally {
    loading.value = false
  }
}

const updateGradeLocally = (enrollmentId: string, grade: number) => {
  editedGrades.value.set(enrollmentId, grade)
}

const getDisplayGrade = (enrollment: Enrollment): number => {
  if (editedGrades.value.has(enrollment.id)) {
    return editedGrades.value.get(enrollment.id)!
  }
  return enrollment.final_grade ?? 0
}

const saveAllGrades = async () => {
  if (!selectedCourse.value || editedGrades.value.size === 0) {
    alert('No hay cambios para guardar')
    return
  }

  // Validar que todas las calificaciones estén entre 0 y 100
  const invalidGrades = Array.from(editedGrades.value.entries()).filter(
    ([, grade]) => grade < 0 || grade > 100
  )

  if (invalidGrades.length > 0) {
    alert('Las calificaciones deben estar entre 0 y 100')
    return
  }

  loading.value = true
  try {
    // Construir el array de calificaciones para el bulk update
    const grades = Array.from(editedGrades.value.entries()).map(([enrollmentId, grade]) => {
      const student = enrolledStudents.value.find(s => s.id === enrollmentId)
      const workerData = student?.worker as unknown as WorkerUser
      return {
        worker_id: workerData?.id || '',
        final_grade: grade
      }
    }).filter(g => g.worker_id !== '')

    const bulkData = {
      course_id: selectedCourse.value.id,
      grades
    }

    const result = await enrollmentService.updateBulkGrades(bulkData)

    // Actualizar la lista local
    enrolledStudents.value = enrolledStudents.value.map(student => {
      if (editedGrades.value.has(student.id)) {
        return { ...student, final_grade: editedGrades.value.get(student.id) }
      }
      return student
    })

    editedGrades.value.clear()

    // Mostrar resultado
    if (result.errors.length > 0) {
      alert(`Calificaciones guardadas: ${result.updated} actualizadas, ${result.skipped} omitidas.\nErrores: ${result.errors.join(', ')}`)
    } else {
      alert(`Calificaciones guardadas exitosamente: ${result.updated} actualizadas`)
    }
  } catch (error) {
    alert('Error al guardar las calificaciones')
  } finally {
    loading.value = false
  }
}

const openSurveysDialog = async (course: Course) => {
  selectedCourse.value = course
  selectedWorkerForSurvey.value = null
  selectedSurveyType.value = null
  loading.value = true
  surveysDialog.value = true
  try {
    // Cargar estudiantes inscritos en el curso
    const enrollments = await courseService.getEnrollments(course.id)
    enrolledStudents.value = enrollments
  } finally {
    loading.value = false
  }
}

const viewWorkerSurvey = (worker: WorkerUser, surveyType: 'opinion' | 'followup') => {
  selectedWorkerForSurvey.value = worker
  selectedSurveyType.value = surveyType
}

const closeSurveyView = () => {
  selectedWorkerForSurvey.value = null
  selectedSurveyType.value = null
}

const handleCourseCreated = () => {
  editMode.value = false
  selectedCourse.value = null
  createCourseDialog.value = false
  loadMyCourses()
}

const deleteCourse = async (course: Course) => {
  loading.value = true
  if (confirm('¿Está seguro de eliminar este curso? Se eliminará toda la información relacionada')) {
    try {
      await courseService.delete(course.id)
      await loadMyCourses()
    } finally {
      loading.value = false
    }
  }
}

const openEditCourseDialog = (course: Course) => {
  selectedCourse.value = course
  editMode.value = true
  createCourseDialog.value = true
}

const openCreateCourseDialog = () => {
  selectedCourse.value = null
  editMode.value = false
  createCourseDialog.value = true
}

const closeCreateCourseDialog = () => {
  selectedCourse.value = null
  editMode.value = false
  createCourseDialog.value = false
}

onMounted(loadMyCourses)
</script>

<template>
  <div>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">Cursos que Imparto</span>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus-circle"
          @click="openCreateCourseDialog"
        >
          Crear Curso
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col v-for="course in myCourses" :key="course.id" cols="12" md="6" lg="4">
            <v-card elevation="2" class="position-relative">
              <div class="position-absolute top-0 right-0 d-flex pa-2 z-10 gap-1">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="openEditCourseDialog(course)"
                />

                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteCourse(course)"
                />
              </div>

              <v-card-title class="text-h6 pt-10">
                {{ course.name }}
              </v-card-title>

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
                  Calificaciones
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
          <v-text-field
            v-model="attendanceDate"
            label="Fecha"
            type="date"
            class="mb-4"
            :min="minDate"
            :max="maxDate"
          />

          <v-list>
            <v-list-item v-for="student in enrolledStudents" :key="student.id">
              <template v-slot:prepend>
                <v-checkbox-btn
                  v-model="selectedStudents"
                  :value="student.id"
                ></v-checkbox-btn>
              </template>
              <v-list-item-title>{{ `${student.worker?.name || ''} ${student.worker?.father_surname || ''} ${student.worker?.mother_surname || ''}` }}</v-list-item-title>
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
    <v-dialog v-model="gradesDialog" max-width="700px">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          Calificaciones - {{ selectedCourse?.name }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-0">
          <v-alert v-if="enrolledStudents.length === 0" type="info" class="ma-4">
            No hay trabajadores inscritos en este curso
          </v-alert>
          <v-list v-else class="py-0">
            <v-list-item
              v-for="(student, index) in enrolledStudents"
              :key="student.id"
              :class="{ 'bg-grey-lighten-4': index % 2 === 0 }"
            >
              <v-row align="center" no-gutters>
                <v-col cols="7" class="py-2">
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ `${student.worker?.name || ''} ${student.worker?.father_surname || ''} ${student.worker?.mother_surname || ''}` }}
                  </div>
                  <div v-if="(student.worker as unknown as WorkerUser)?.email" class="text-caption text-grey-darken-1">
                    {{ (student.worker as unknown as WorkerUser).email }}
                  </div>
                </v-col>
                <v-col cols="5" class="py-2">
                  <v-text-field
                    :model-value="getDisplayGrade(student)"
                    @update:model-value="(val) => updateGradeLocally(student.id, Number(val))"
                    label="Calificación"
                    type="number"
                    min="0"
                    max="100"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="gradesDialog = false" variant="text">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="editedGrades.size === 0"
            @click="saveAllGrades"
          >
            Guardar Calificaciones
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog gestión de encuestas -->
    <v-dialog v-model="surveysDialog" max-width="1200px" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Respuestas de Encuestas - {{ selectedCourse?.name }}</span>
          <v-btn icon variant="text" @click="surveysDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <!-- Vista de lista de estudiantes -->
          <div v-if="!selectedWorkerForSurvey">
            <v-alert v-if="enrolledStudents.length === 0" type="info" class="mb-4">
              No hay trabajadores inscritos en este curso
            </v-alert>
            <v-list v-else>
              <v-list-item
                v-for="student in enrolledStudents"
                :key="student.id"
                class="mb-2"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary" class="mr-3">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="text-subtitle-1 font-weight-medium">
                  {{ `${student.worker?.name || ''} ${student.worker?.father_surname || ''} ${student.worker?.mother_surname || ''}` }}
                </v-list-item-title>

                <template v-slot:append>
                  <div class="d-flex gap-2">
                    <v-btn
                      size="small"
                      color="primary"
                      variant="outlined"
                      prepend-icon="mdi-clipboard-check"
                      @click="viewWorkerSurvey(student.worker as unknown as WorkerUser, 'followup')"
                    >
                      Seguimiento
                    </v-btn>
                    <v-btn
                      size="small"
                      color="secondary"
                      variant="outlined"
                      prepend-icon="mdi-clipboard-text"
                      @click="viewWorkerSurvey(student.worker as unknown as WorkerUser, 'opinion')"
                    >
                      Opinión
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </div>

          <!-- Vista de formulario de encuesta -->
          <div v-else>
            <v-btn
              variant="text"
              prepend-icon="mdi-arrow-left"
              @click="closeSurveyView"
              class="mb-4"
            >
              Volver a lista de estudiantes
            </v-btn>

            <div class="mb-4">
              <h3 class="text-h6">
                Estudiante: {{ `${selectedWorkerForSurvey.name} ${selectedWorkerForSurvey.father_surname} ${selectedWorkerForSurvey.mother_surname}` }}
              </h3>
            </div>

            <!-- Formulario de seguimiento -->
            <FollowUpCSATForm
              v-if="selectedSurveyType === 'followup' && selectedCourse"
              :course="selectedCourse"
              :worker-id="selectedWorkerForSurvey.id"
              :read-only="true"
              @close="closeSurveyView"
            />

            <!-- Formulario de opinión -->
            <OpinionSurveyForm
              v-else-if="selectedSurveyType === 'opinion' && selectedCourse"
              :course="selectedCourse"
              :worker-id="selectedWorkerForSurvey.id"
              :read-only="true"
              @close="closeSurveyView"
            />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog crear/editar curso -->
    <v-dialog v-model="createCourseDialog" max-width="900px" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <v-btn icon="mdi-close" variant="text" @click="closeCreateCourseDialog"></v-btn>
        </v-card-title>
        <v-card-text>
          <CreateCourseWorker
            :edit-mode="editMode"
            :course-data="selectedCourse"
            @course-created="handleCourseCreated"
            @cancel="closeCreateCourseDialog"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

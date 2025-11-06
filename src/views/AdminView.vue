<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import CoursesAdmin from '@/components/admin/CoursesAdmin.vue'
import WorkersAdmin from '@/components/admin/WorkersAdmin.vue'
import DepartmentsAdmin from '@/components/admin/DepartmentsAdmin.vue'
import PeriodsAdmin from '@/components/admin/PeriodsAdmin.vue'
import EnrollmentsAdmin from '@/components/admin/EnrollmentsAdmin.vue'
import AttendancesAdmin from '@/components/admin/AttendancesAdmin.vue'
import GradesAdmin from '@/components/admin/GradesAdmin.vue'
import SurveysAdmin from '@/components/admin/SurveysAdmin.vue'

const authStore = useAuthStore()
const router = useRouter()

const drawer = ref(true)
const selectedTab = ref('courses')

const tabs = [
  { id: 'courses', title: 'Cursos', icon: 'mdi-school' },
  { id: 'workers', title: 'Trabajadores', icon: 'mdi-account-group' },
  { id: 'departments', title: 'Departamentos', icon: 'mdi-domain' },
  { id: 'periods', title: 'Periodos', icon: 'mdi-calendar-range' },
  { id: 'enrollments', title: 'Inscripciones', icon: 'mdi-clipboard-text' },
  { id: 'attendances', title: 'Asistencias', icon: 'mdi-calendar-check' },
  { id: 'grades', title: 'Calificaciones', icon: 'mdi-certificate' },
  { id: 'surveys', title: 'Encuestas', icon: 'mdi-file-document' },
]

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  if (!authStore.isAdmin) {
    router.push('/worker')
  }
})
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app color="primary" dark>
      <v-list>
        <v-list-item class="px-2">
          <v-list-item-title class="text-h6">Panel Admin</v-list-item-title>
          <v-list-item-subtitle>{{ authStore.user?.email }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="tab in tabs"
          :key="tab.id"
          :value="tab.id"
          :active="selectedTab === tab.id"
          @click="selectedTab = tab.id"
          :prepend-icon="tab.icon"
        >
          <v-list-item-title>{{ tab.title }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block @click="handleLogout" color="error"> Cerrar sesión </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar app color="white" elevation="1">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-primary font-weight-bold">
        Sistema de Gestión de Cursos
      </v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <CoursesAdmin v-if="selectedTab === 'courses'" />
        <WorkersAdmin v-else-if="selectedTab === 'workers'" />
        <DepartmentsAdmin v-else-if="selectedTab === 'departments'" />
        <PeriodsAdmin v-else-if="selectedTab === 'periods'" />
        <EnrollmentsAdmin v-else-if="selectedTab === 'enrollments'" />
        <AttendancesAdmin v-else-if="selectedTab === 'attendances'" />
        <GradesAdmin v-else-if="selectedTab === 'grades'" />
        <SurveysAdmin v-else-if="selectedTab === 'surveys'" />
      </v-container>
    </v-main>
  </v-app>
</template>

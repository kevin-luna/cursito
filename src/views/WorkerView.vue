<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import AvailableCoursesWorker from '@/components/worker/AvailableCoursesWorker.vue'
import MyCoursesWorker from '@/components/worker/MyCoursesWorker.vue'
import TeachingCoursesWorker from '@/components/worker/TeachingCoursesWorker.vue'
import CreateCourseWorker from '@/components/worker/CreateCourseWorker.vue'

const authStore = useAuthStore()
const router = useRouter()

const drawer = ref(true)
const selectedTab = ref('available-courses')

const tabs = [
  { id: 'available-courses', title: 'Cursos Disponibles', icon: 'mdi-book-search' },
  { id: 'my-courses', title: 'Mis Inscripciones', icon: 'mdi-book-account' },
  { id: 'teaching-courses', title: 'Cursos que Imparto', icon: 'mdi-teach' },
  { id: 'create-course', title: 'Crear Curso', icon: 'mdi-plus-circle' },
]

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app color="primary" dark>
      <v-list>
        <v-list-item class="px-2">
          <v-list-item-title class="text-h6">Portal Trabajador</v-list-item-title>
          <v-list-item-subtitle>{{ authStore.user?.name }}</v-list-item-subtitle>
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
        <AvailableCoursesWorker v-if="selectedTab === 'available-courses'" />
        <MyCoursesWorker v-else-if="selectedTab === 'my-courses'" />
        <TeachingCoursesWorker v-else-if="selectedTab === 'teaching-courses'" />
        <CreateCourseWorker v-else-if="selectedTab === 'create-course'" />
      </v-container>
    </v-main>
  </v-app>
</template>

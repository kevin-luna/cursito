<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.isAdmin)

onMounted(() => {
  // Redirigir basado en el rol del usuario
  if (isAdmin.value) {
    router.push('/admin')
  } else {
    router.push('/worker')
  }
})
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4 text-h6">Cargando...</p>
      </v-col>
    </v-row>
  </v-container>
</template>

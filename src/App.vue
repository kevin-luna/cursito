<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <RouterView />
  </v-app>
</template>

<style>
/* Sobrescribir estilos globales para que Vuetify maneje el layout */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  overflow-x: hidden !important;
}

body {
  display: block !important;
  place-items: unset !important;
}

#app {
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
  grid-template-columns: none !important;
  width: 100% !important;
}
</style>

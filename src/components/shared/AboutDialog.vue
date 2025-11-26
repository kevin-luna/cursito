<script setup lang="ts">
import { ref } from 'vue'
import naomiImage from '@/assets/naomi.jpeg'
import kevinImage from '@/assets/kevin.jpg'
import jesusImage from '@/assets/jesus.jpg'

const creators = [
  {
    name: 'Marla Naomi Cruz Martinez',
    controlNumber: 'L21020368',
    email: 'L21020368@veracruz.tecnm.mx',
    image: naomiImage
  },
  {
    name: 'Kevin Alejandro Gutierrez Luna',
    controlNumber: 'L21020397',
    email: 'L21020397@veracruz.tecnm.mx',
    image: kevinImage
  },
  {
    name: 'Jesús Everardo López Jiménez',
    controlNumber: 'L21020398',
    email: 'L21020398@veracruz.tecnm.mx',
    image: jesusImage
  }
]

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const closeDialog = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="900px">
    <v-card>
      <v-card-title class="text-h5 bg-primary text-white pa-4">
        <v-icon start>mdi-information</v-icon>
        Acerca del Sistema
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <div class="text-h6 mb-4 text-center">Creadores del Sistema</div>

        <v-row>
          <v-col
            v-for="creator in creators"
            :key="creator.controlNumber"
            cols="12"
            md="4"
          >
            <v-card variant="outlined" class="pa-4">
              <div class="text-center">
                <v-avatar
                  size="120"
                  class="mb-4"
                  color="grey-lighten-2"
                >
                  <v-img
                    v-if="creator.image"
                    :src="creator.image"
                    :alt="creator.name"
                    cover
                  />
                  <v-icon v-else size="80" color="grey-darken-1">
                    mdi-account-circle
                  </v-icon>
                </v-avatar>

                <div class="text-h6 mb-2">{{ creator.name }}</div>

                <v-divider class="my-3" />

                <div class="text-body-2 text-grey-darken-1 mb-1">
                  <v-icon size="small" start>mdi-school</v-icon>
                  No. Control
                </div>
                <div class="text-body-1 font-weight-medium mb-3">
                  {{ creator.controlNumber }}
                </div>

                <div class="text-body-2 text-grey-darken-1 mb-1">
                  <v-icon size="small" start>mdi-email</v-icon>
                  Correo
                </div>
                <div class="text-body-2">
                  {{ creator.email }}
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <div class="text-center">
          <div class="text-body-1 text-grey-darken-1">
            Cursito - Sistema de Gestión de Cursos
          </div>
          <div class="text-caption text-grey">
            Tecnológico Nacional de México - Campus Veracruz
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" @click="closeDialog">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

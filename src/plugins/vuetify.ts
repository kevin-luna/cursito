import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme: {
        dark: false,
        colors: {
          primary: '#1e3a8a', // Azul marino
          secondary: '#64748b', // Gris azulado
          background: '#f8fafc', // Blanco grisáceo
          surface: '#ffffff', // Blanco
          'surface-variant': '#e2e8f0', // Gris claro
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
          'on-background': '#1e293b',
          'on-surface': '#1e293b',
        },
      },
    },
  },
})

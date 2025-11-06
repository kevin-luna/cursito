# Integración Frontend con API REST

## Descripción

Se ha completado la integración de las pantallas de login y registro con la API REST del backend utilizando axios.

## Archivos Creados/Modificados

### Servicios Creados

1. **[src/services/api.ts](src/services/api.ts)** - Configuración base de axios
   - Instancia de axios configurada con baseURL
   - Interceptores para agregar token JWT automáticamente
   - Manejo de errores 401 (token expirado)
   - Timeout de 10 segundos

2. **[src/services/authService.ts](src/services/authService.ts)** - Servicio de autenticación
   - `login(credentials)` - POST /auth/login
   - `register(data)` - POST /workers
   - `getCurrentUser()` - GET /auth/me
   - `changePassword(data)` - POST /auth/change-password
   - `logout()` - Limpia localStorage

### Store de Pinia

3. **[src/stores/auth.ts](src/stores/auth.ts)** - Store de autenticación
   - Estado: `user`, `token`, `loading`, `error`
   - Getters: `isAuthenticated`, `isAdmin`, `isTeacher`, `isCoordinator`
   - Actions: `login`, `register`, `logout`, `initialize`, `fetchCurrentUser`

### Vistas Actualizadas

4. **[src/views/LoginView.vue](src/views/LoginView.vue)**
   - Integrado con `useAuthStore`
   - Manejo de errores con `v-alert`
   - Loading state del botón
   - Redirección automática después del login

5. **[src/views/SignUpView.vue](src/views/SignUpView.vue)**
   - Integrado con `useAuthStore`
   - Validación completa del formulario
   - Mensajes de error y éxito
   - Registro automático + login después del registro
   - Redirección automática al home

### Configuración

6. **[.env](.env)** - Variables de entorno
   ```env
   VITE_API_URL=http://localhost:8000
   ```

## Cómo Usar

### 1. Instalar Dependencias

```bash
cd cursito
npm install
```

### 2. Configurar Variables de Entorno

Asegúrate de que el archivo `.env` tenga la URL correcta de tu API:

```env
VITE_API_URL=http://localhost:8000
```

### 3. Iniciar el Backend

```bash
cd cursito-api
# Activar entorno virtual
source venv/bin/activate  # En Windows: venv\Scripts\activate
# Iniciar FastAPI
uvicorn src.api:app --reload
```

El backend debe estar corriendo en `http://localhost:8000`

### 4. Iniciar el Frontend

```bash
cd cursito
npm run dev
```

El frontend estará disponible en `http://localhost:5173` (o el puerto que Vite asigne)

## Flujo de Autenticación

### Login

1. Usuario ingresa email y contraseña
2. Se hace POST a `/auth/login`
3. Backend responde con:
   ```json
   {
     "access_token": "eyJhbGc...",
     "token_type": "bearer",
     "expires_in": 30,
     "worker_id": "uuid",
     "email": "usuario@veracruz.tecnm.mx",
     "role": "teacher",
     "department_id": "uuid"
   }
   ```
4. Token se guarda en `localStorage`
5. Se obtiene información completa del usuario con GET `/auth/me`
6. Usuario se redirige al home

### Registro

1. Usuario completa el formulario de registro
2. Se hace POST a `/workers` con los datos:
   ```json
   {
     "email": "usuario@veracruz.tecnm.mx",
     "password": "password123",
     "name": "Juan",
     "father_lastname": "Pérez",
     "mother_lastname": "García",
     "department_id": "uuid",
     "rfc": "PEGJ850101ABC",
     "curp": "PEGJ850101HVZRXN01",
     "sex": "M",
     "phone": "2281234567",
     "role": "teacher"
   }
   ```
3. Backend crea el usuario y responde con los datos del usuario
4. Automáticamente se hace login con las credenciales
5. Usuario se redirige al home

### Peticiones Protegidas

Todas las peticiones que requieren autenticación automáticamente incluyen el header:
```
Authorization: Bearer <token>
```

Esto se maneja en el interceptor de axios en [src/services/api.ts](src/services/api.ts:13-22)

## Uso del Store en Componentes

### Ejemplo: Obtener información del usuario autenticado

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Acceder a la información del usuario
console.log(authStore.user?.name)
console.log(authStore.user?.email)
console.log(authStore.user?.role)

// Verificar si está autenticado
if (authStore.isAuthenticated) {
  console.log('Usuario autenticado')
}

// Verificar rol
if (authStore.isAdmin) {
  console.log('Es administrador')
}

// Cerrar sesión
const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>
```

### Ejemplo: Hacer una petición protegida

```typescript
import api from '@/services/api'

// El token se agrega automáticamente
const response = await api.get('/some-protected-endpoint')
```

## Manejo de Errores

### Errores de Login

Los errores se muestran con `v-alert` en la pantalla:
- Credenciales incorrectas
- Usuario no encontrado
- Errores de conexión

### Token Expirado

Cuando el token expira (401):
1. Se limpia el localStorage
2. Usuario se redirige automáticamente a login
3. Esto se maneja en el interceptor de axios

## Almacenamiento

### localStorage

Se guardan dos items:
- `token` - JWT token
- `user` - JSON con información del usuario

### Persistencia

Al recargar la página, el store intenta:
1. Cargar token y usuario de localStorage
2. Validar el token con GET `/auth/me`
3. Si es válido, restaura la sesión
4. Si no es válido, limpia y redirige a login

## Seguridad

### Headers HTTP

Todas las peticiones incluyen:
```
Content-Type: application/json
Authorization: Bearer <token>
```

### CORS

Asegúrate de que el backend tenga CORS configurado para permitir peticiones desde el frontend:

```python
# En cursito-api/src/api.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Próximos Pasos

### Mejoras Recomendadas

1. **Cargar Departamentos Dinámicamente**
   - En SignUpView, hacer GET `/departments` para obtener la lista real
   - Mapear nombres a UUIDs

2. **Refresh Token**
   - Implementar refresh token para sesiones más largas
   - Renovar token automáticamente antes de que expire

3. **Recuperación de Contraseña**
   - Implementar endpoint de "Olvidé mi contraseña"
   - Conectar el enlace en LoginView

4. **Guards de Navegación**
   - Crear guards en vue-router para proteger rutas
   - Verificar autenticación antes de acceder a rutas protegidas

5. **Manejo de Roles**
   - Implementar guards basados en roles
   - Mostrar/ocultar elementos según el rol del usuario

### Ejemplo de Guard de Navegación

```typescript
// En src/router/index.ts
import { useAuthStore } from '@/stores/auth'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.role && authStore.user?.role !== to.meta.role) {
    next({ name: 'unauthorized' })
  } else {
    next()
  }
})
```

## Testing

### Probar Login

1. Asegúrate de tener un usuario en la base de datos
2. Usa el script `hash_password.py` del backend para generar un hash
3. Actualiza la contraseña en la BD
4. Intenta hacer login en el frontend

### Probar Registro

1. Completa el formulario de registro
2. Usa un email con dominio `@veracruz.tecnm.mx`
3. Verifica que se cree el usuario en la base de datos
4. Verifica que se haga login automáticamente

### Probar Token Expirado

1. Haz login
2. Espera 30 minutos (tiempo de expiración por defecto)
3. Intenta acceder a una ruta protegida
4. Deberías ser redirigido a login

## Troubleshooting

### Error: "Network Error"
- Verifica que el backend esté corriendo
- Verifica la URL en `.env`
- Verifica CORS en el backend

### Error: "Token inválido"
- El token puede haber expirado
- Limpia localStorage y vuelve a hacer login
- Verifica que JWT_SECRET_KEY sea la misma en backend

### Error: "Department not found"
- El department_id debe ser un UUID válido
- Implementa carga dinámica de departamentos
- Por ahora, usa un UUID real de la base de datos

### Usuario no puede registrarse
- Verifica validaciones del formulario
- El email debe terminar en `@veracruz.tecnm.mx`
- RFC debe tener 13 caracteres
- CURP debe tener 18 caracteres
- Teléfono debe tener 10 dígitos

## Documentación Relacionada

- [Backend AUTH_README.md](../cursito-api/AUTH_README.md) - Documentación de autenticación del backend
- [Backend README.md](../cursito-api/README.md) - Documentación general del backend
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)

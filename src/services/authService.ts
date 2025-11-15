import api from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  worker_id: string
  email: string
  role: string | number // 0 = docente, 1 = admin/jefe de departamento
  department_id: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  father_lastname: string
  mother_lastname: string
  department_id: string
  rfc: string
  curp: string
  sex: string
  phone: string
  role?: string
}

export interface Worker {
  id: string
  email: string
  name: string
  father_lastname: string
  mother_lastname: string
  role: string | number // 0 = docente, 1 = admin/jefe de departamento
  department_id: string
  rfc: string
  curp: string
  sex: string
  phone: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

class AuthService {
  /**
   * Inicia sesión con email y contraseña
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  }

  /**
   * Registra un nuevo usuario
   */
  async register(data: RegisterRequest): Promise<Worker> {
    const response = await api.post<Worker>('/workers', data)
    return response.data
  }

  /**
   * Obtiene la información del usuario actual
   */
  async getCurrentUser(): Promise<Worker> {
    const response = await api.get<Worker>('/auth/me')
    return response.data
  }

  /**
   * Cambia la contraseña del usuario actual
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/change-password', data)
    return response.data
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

export default new AuthService()

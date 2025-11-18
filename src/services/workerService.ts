import api from './api'
import type { Worker } from './authService'
import type { PaginatedResponse } from './types'

export interface UpdateWorkerRequest {
  name?: string
  father_surname?: string
  mother_surname?: string
  department_id?: string
  rfc?: string
  curp?: string
  sex?: number
  telephone?: string
  email?: string
  position?: number
}

class WorkerService {
  async getAll(): Promise<Worker[]> {
    const response = await api.get<PaginatedResponse<Worker>>('/workers')
    return response.data.items
  }

  async getById(id: string): Promise<Worker> {
    const response = await api.get<Worker>(`/workers/${id}`)
    return response.data
  }

  async update(id: string, data: UpdateWorkerRequest): Promise<Worker> {
    const response = await api.put<Worker>(`/workers/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/workers/${id}`)
  }

  async getByDepartment(departmentId: string): Promise<Worker[]> {
    const response = await api.get<PaginatedResponse<Worker>>(`/workers/department/${departmentId}`)
    return response.data.items
  }
}

export default new WorkerService()

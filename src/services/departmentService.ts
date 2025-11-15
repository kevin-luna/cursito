import api from './api'
import type { PaginatedResponse } from './types'

export interface Department {
  id: string
  name: string
}

export interface CreateDepartmentRequest {
  name: string
}

export interface UpdateDepartmentRequest {
  name: string
}

class DepartmentService {
  async getAll(): Promise<Department[]> {
    const response = await api.get<PaginatedResponse<Department>>('/departments')
    return response.data.items
  }

  async getById(id: string): Promise<Department> {
    const response = await api.get<Department>(`/departments/${id}`)
    return response.data
  }

  async create(data: CreateDepartmentRequest): Promise<Department> {
    const response = await api.post<Department>('/departments', data)
    return response.data
  }

  async update(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    const response = await api.put<Department>(`/departments/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/departments/${id}`)
  }
}

export default new DepartmentService()

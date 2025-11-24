import api from './api'
import type { Worker } from './authService'
import type { Course } from './courseService'
import type { Enrollment } from './enrollmentService'
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
    // Use a large limit to get all workers in one request
    // If you have more than 1000 workers, consider implementing pagination in the UI
    const response = await api.get<PaginatedResponse<Worker>>('/workers', {
      params: { limit: 1000 }
    })
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

  async getCourses(workerId: string, courseType: 'teaching' | 'enrolled'): Promise<Course[]> {
    const response = await api.get<PaginatedResponse<Course>>(`/workers/${workerId}/courses`, {params: {courseType: courseType}})
    return response.data.items
  }

  async getEnrollments(workerId: string): Promise<Enrollment[]> {
    const response = await api.get<PaginatedResponse<Enrollment>>(`/workers/${workerId}/enrollments`)
    return response.data.items
  }

}

export default new WorkerService()

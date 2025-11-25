import api from './api'
import type { Course } from './courseService'
import type { PaginatedResponse } from './types'

export interface Enrollment {
  id: string
  worker?: Worker
  course?: Course
  final_grade?: number
}

export interface CreateEnrollmentRequest {
  worker_id: string
  course_id: string
}

export interface UpdateGradeRequest {
  final_grade: number
}

class EnrollmentService {
  async getAll(): Promise<Enrollment[]> {
    const response = await api.get<PaginatedResponse<Enrollment>>('/enrollings')
    return response.data.items
  }

  async getById(id: string): Promise<Enrollment> {
    const response = await api.get<Enrollment>(`/enrollments/${id}`)
    return response.data
  }

  async create(data: CreateEnrollmentRequest): Promise<Enrollment> {
    const response = await api.post<Enrollment>('/enrollments', data)
    return response.data
  }

  async updateGrade(id: string, data: UpdateGradeRequest): Promise<Enrollment> {
    const response = await api.put<Enrollment>(`/enrollings/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/enrollments/${id}`)
  }

  async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await api.get<Enrollment[]>('/enrollments/me')
    return response.data
  }

  async enrollInCourse(workerId: string, courseId: string): Promise<Enrollment> {
    const response = await api.post<Enrollment>('/enrollings', {
      worker_id: workerId,
      course_id: courseId
    })
    return response.data
  }

  async unenrollFromCourse(enrollmentId: string): Promise<void> {
    await api.delete(`/enrollings/${enrollmentId}`)
  }
}

export default new EnrollmentService()

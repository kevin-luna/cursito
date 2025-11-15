import api from './api'
import type { PaginatedResponse } from './types'

export interface Enrollment {
  id: string
  worker_id: string
  course_id: string
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
    const response = await api.get<PaginatedResponse<Enrollment>>('/enrollments')
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
    const response = await api.put<Enrollment>(`/enrollments/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/enrollments/${id}`)
  }

  async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await api.get<Enrollment[]>('/enrollments/me')
    return response.data
  }

  async enrollInCourse(courseId: string): Promise<Enrollment> {
    const response = await api.post<Enrollment>('/enrollments/enroll', {
      course_id: courseId,
    })
    return response.data
  }

  async unenrollFromCourse(enrollmentId: string): Promise<void> {
    await api.delete(`/enrollments/${enrollmentId}`)
  }
}

export default new EnrollmentService()

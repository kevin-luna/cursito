import api from './api'
import type { PaginatedResponse } from './types'

export interface Course {
  id: string
  period_id: string
  target: string
  name: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  type: number // 0 = diplomado, 1 = taller
  mode: number // 0 = virtual, 1 = presencial
  profile: number // 0 = formacion, 1 = actualización docente
  goal: string
  details?: string
}

export interface CreateCourseRequest {
  period_id: string
  target: string
  name: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  type: number
  mode: number
  profile: number
  goal: string
  details?: string
}

export interface UpdateCourseRequest extends CreateCourseRequest {}

class CourseService {
  async getAll(): Promise<Course[]> {
    const response = await api.get<PaginatedResponse<Course>>('/courses')
    return response.data.items
  }

  async getById(id: string): Promise<Course> {
    const response = await api.get<Course>(`/courses/${id}`)
    return response.data
  }

  async create(data: CreateCourseRequest): Promise<Course> {
    const response = await api.post<Course>('/courses', data)
    return response.data
  }

  async update(id: string, data: UpdateCourseRequest): Promise<Course> {
    const response = await api.put<Course>(`/courses/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/courses/${id}`)
  }

  async getInstructors(courseId: string): Promise<any[]> {
    const response = await api.get(`/courses/${courseId}/instructors`)
    return response.data
  }

  async addInstructor(courseId: string, workerId: string): Promise<void> {
    await api.post(`/courses/${courseId}/instructors`, { worker_id: workerId })
  }

  async removeInstructor(courseId: string, workerId: string): Promise<void> {
    await api.delete(`/courses/${courseId}/instructors/${workerId}`)
  }

  async getEnrollments(courseId: string): Promise<any[]> {
    const response = await api.get(`/courses/${courseId}/enrollments`)
    return response.data
  }

  async getAttendances(courseId: string, date?: string): Promise<any[]> {
    const params = date ? { date } : {}
    const response = await api.get(`/courses/${courseId}/attendances`, { params })
    return response.data
  }

  async getSurveys(courseId: string): Promise<any[]> {
    const response = await api.get(`/courses/${courseId}/surveys`)
    return response.data
  }

  async addSurvey(courseId: string, surveyId: string): Promise<void> {
    await api.post(`/courses/${courseId}/surveys`, { survey_id: surveyId })
  }

  async removeSurvey(courseId: string, surveyId: string): Promise<void> {
    await api.delete(`/courses/${courseId}/surveys/${surveyId}`)
  }
}

export default new CourseService()

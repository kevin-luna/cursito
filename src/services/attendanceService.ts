import api from './api'
import type { PaginatedResponse } from './types'

export interface Attendance {
  id: string
  worker_id: string
  course_id: string
  date: string
}

export interface CreateAttendanceRequest {
  worker_id: string
  course_id: string
  date: string
}

export interface BulkAttendanceRequest {
  course_id: string
  date: string
  worker_ids: string[]
}

class AttendanceService {
  async getAll(): Promise<Attendance[]> {
    const response = await api.get<PaginatedResponse<Attendance>>('/attendances')
    return response.data.items
  }

  async getById(id: string): Promise<Attendance> {
    const response = await api.get<Attendance>(`/attendances/${id}`)
    return response.data
  }

  async create(data: CreateAttendanceRequest): Promise<Attendance> {
    const response = await api.post<Attendance>('/attendances', data)
    return response.data
  }

  async createBulk(data: BulkAttendanceRequest): Promise<Attendance[]> {
    const response = await api.post<Attendance[]>('/attendances/bulk', data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/attendances/${id}`)
  }

  async getByCourse(courseId: string, date?: string): Promise<Attendance[]> {
    const params = date ? { date } : {}
    const response = await api.get<Attendance[]>(`/attendances/course/${courseId}`, { params })
    return response.data
  }
}

export default new AttendanceService()

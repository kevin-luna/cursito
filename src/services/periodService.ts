import api from './api'
import type { PaginatedResponse } from './types'

export interface Period {
  id: string
  name: string
  start_date: string
  end_date: string
}

export interface CreatePeriodRequest {
  name: string
  start_date: string
  end_date: string
}

export interface UpdatePeriodRequest {
  name: string
  start_date: string
  end_date: string
}

class PeriodService {
  lastError: string | null = null

  async getAll(page: number = 1, limit: number = 100): Promise<Period[]> {
    const response = await api.get<PaginatedResponse<Period>>('/periods/', {
      params: { page, limit }
    })
    return response.data.items
  }

  async getById(id: string): Promise<Period> {
    const response = await api.get<Period>(`/periods/${id}/`)
    return response.data
  }

  async create(data: CreatePeriodRequest): Promise<Period> {
    try {
      this.lastError = null
      const response = await api.post<Period>('/periods/', data)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status >= 400) {
        this.lastError = error.response.data?.detail || 'An error occurred'
      }
      throw error
    }
  }

  async update(id: string, data: UpdatePeriodRequest): Promise<Period> {
    try {
      this.lastError = null
      const response = await api.put<Period>(`/periods/${id}/`, data)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status >= 400) {
        this.lastError = error.response.data?.detail || 'An error occurred'
      }
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/periods/${id}/`)
  }
}

export default new PeriodService()

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
  async getAll(): Promise<Period[]> {
    const response = await api.get<PaginatedResponse<Period>>('/periods')
    return response.data.items
  }

  async getById(id: string): Promise<Period> {
    const response = await api.get<Period>(`/periods/${id}`)
    return response.data
  }

  async create(data: CreatePeriodRequest): Promise<Period> {
    const response = await api.post<Period>('/periods', data)
    return response.data
  }

  async update(id: string, data: UpdatePeriodRequest): Promise<Period> {
    const response = await api.put<Period>(`/periods/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/periods/${id}`)
  }
}

export default new PeriodService()

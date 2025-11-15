import api from './api'
import type { PaginatedResponse } from './types'

export interface Survey {
  id: string
  name: string
  created_at: string
}

export interface Question {
  id: string
  survey_id: string
  question: string
  position: number
}

export interface Answer {
  id: string
  worker_id: string
  course_id: string
  question_id: string
  value: string
}

export interface CreateSurveyRequest {
  name: string
  questions: { question: string; position: number }[]
}

export interface UpdateSurveyRequest {
  name: string
}

export interface CreateQuestionRequest {
  survey_id: string
  question: string
  position: number
}

export interface CreateAnswerRequest {
  worker_id: string
  course_id: string
  question_id: string
  value: string
}

export interface SubmitSurveyAnswersRequest {
  course_id: string
  answers: { question_id: string; value: string }[]
}

class SurveyService {
  // Surveys
  async getAllSurveys(): Promise<Survey[]> {
    const response = await api.get<PaginatedResponse<Survey>>('/surveys')
    return response.data.items
  }

  async getSurveyById(id: string): Promise<Survey> {
    const response = await api.get<Survey>(`/surveys/${id}`)
    return response.data
  }

  async createSurvey(data: CreateSurveyRequest): Promise<Survey> {
    const response = await api.post<Survey>('/surveys', data)
    return response.data
  }

  async updateSurvey(id: string, data: UpdateSurveyRequest): Promise<Survey> {
    const response = await api.put<Survey>(`/surveys/${id}`, data)
    return response.data
  }

  async deleteSurvey(id: string): Promise<void> {
    await api.delete(`/surveys/${id}`)
  }

  // Questions
  async getQuestionsBySurvey(surveyId: string): Promise<Question[]> {
    const response = await api.get<Question[]>(`/surveys/${surveyId}/questions`)
    return response.data
  }

  async createQuestion(data: CreateQuestionRequest): Promise<Question> {
    const response = await api.post<Question>('/questions', data)
    return response.data
  }

  async updateQuestion(id: string, data: Partial<CreateQuestionRequest>): Promise<Question> {
    const response = await api.put<Question>(`/questions/${id}`, data)
    return response.data
  }

  async deleteQuestion(id: string): Promise<void> {
    await api.delete(`/questions/${id}`)
  }

  // Answers
  async getAnswersByCourse(courseId: string): Promise<Answer[]> {
    const response = await api.get<Answer[]>(`/courses/${courseId}/answers`)
    return response.data
  }

  async submitAnswers(data: SubmitSurveyAnswersRequest): Promise<Answer[]> {
    const response = await api.post<Answer[]>('/answers/submit', data)
    return response.data
  }

  async getAnswersByWorkerAndCourse(workerId: string, courseId: string): Promise<Answer[]> {
    const response = await api.get<Answer[]>(`/answers/worker/${workerId}/course/${courseId}`)
    return response.data
  }
}

export default new SurveyService()

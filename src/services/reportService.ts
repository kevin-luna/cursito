import api from './api'

class ReportService {
  /**
   * Download enrollment certificate PDF
   */
  async downloadEnrollmentCertificate(workerId: string, courseId: string): Promise<void> {
    try {
      const response = await api.get(`/reports/enrollment/${workerId}/${courseId}`, {
        responseType: 'blob'
      })

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cedula_inscripcion_${courseId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading enrollment certificate:', error)
      throw error
    }
  }

  /**
   * Download attendance list PDF
   */
  async downloadAttendanceList(courseId: string): Promise<void> {
    try {
      const response = await api.get(`/reports/attendance/${courseId}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `lista_asistencia_${courseId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading attendance list:', error)
      throw error
    }
  }

  /**
   * Download grades list PDF
   */
  async downloadGradesList(courseId: string): Promise<void> {
    try {
      const response = await api.get(`/reports/grades/${courseId}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `lista_calificaciones_${courseId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading grades list:', error)
      throw error
    }
  }

  /**
   * Download instructor courses list PDF
   */
  async downloadInstructorCourses(workerId: string): Promise<void> {
    try {
      const response = await api.get(`/reports/instructor-courses/${workerId}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cursos_instructor_${workerId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading instructor courses:', error)
      throw error
    }
  }

  /**
   * Download follow-up survey responses PDF
   */
  async downloadFollowUpSurvey(workerId: string, courseId: string): Promise<void> {
    try {
      const response = await api.get(`/reports/survey/${workerId}/${courseId}/followup`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `evaluacion_seguimiento_${courseId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading follow-up survey:', error)
      throw error
    }
  }

  /**
   * Download opinion survey responses PDF
   */
  async downloadOpinionSurvey(workerId: string, courseId: string): Promise<void> {
    try {
      const response = await api.get(`/reports/survey/${workerId}/${courseId}/opinion`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `encuesta_opinion_${courseId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading opinion survey:', error)
      throw error
    }
  }
}

export default new ReportService()

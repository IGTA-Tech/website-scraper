import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const scraperAPI = {
  // Create new scrape job
  createScrapeJob: async (data) => {
    const response = await api.post('/api/scrape', data)
    return response.data
  },

  // Get job status
  getJobStatus: async (jobId) => {
    const response = await api.get(`/api/jobs/${jobId}`)
    return response.data
  },

  // List all jobs
  listJobs: async () => {
    const response = await api.get('/api/jobs')
    return response.data
  },

  // Delete job
  deleteJob: async (jobId) => {
    const response = await api.delete(`/api/jobs/${jobId}`)
    return response.data
  },

  // Get stats
  getStats: async () => {
    const response = await api.get('/api/stats')
    return response.data
  },

  // Download file
  getDownloadUrl: (filename) => {
    return `${API_BASE_URL}/api/download/${filename}`
  },

  // WebSocket connection
  connectWebSocket: (jobId, onMessage) => {
    const wsUrl = API_BASE_URL.replace('http', 'ws')
    const ws = new WebSocket(`${wsUrl}/ws/${jobId}`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onMessage(data)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return ws
  },
}

export default api

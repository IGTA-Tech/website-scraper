import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'

export default function ResultsPage() {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJob()

    // Connect WebSocket for live updates
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
    let ws

    try {
      ws = new WebSocket(`${wsUrl}/ws/${jobId}`)
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setJob(data)
        setLoading(false)
      }
      ws.onerror = () => {
        console.log('WebSocket error, falling back to polling')
      }
    } catch (e) {
      console.log('WebSocket not available, using polling')
    }

    // Fallback polling
    const interval = setInterval(fetchJob, 3000)

    return () => {
      if (ws) ws.close()
      clearInterval(interval)
    }
  }, [jobId])

  const fetchJob = async () => {
    try {
      const response = await api.get(`/api/jobs/${jobId}`)
      setJob(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch job:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Job Not Found</h2>
          <Link to="/scrape" className="text-indigo-600 hover:underline">
            Start a new scrape →
          </Link>
        </div>
      </div>
    )
  }

  const isComplete = job.status === 'completed'
  const isFailed = job.status === 'failed'
  const isProcessing = !isComplete && !isFailed
  const progress = job.total > 0 ? (job.progress / job.total) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">
                Website Scraper Pro
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/scrape" className="text-gray-600 hover:text-gray-900">
                New Scrape
              </Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {isComplete
                ? '✅ Scrape Complete!'
                : isProcessing
                ? '⏳ Scraping in Progress'
                : '❌ Scrape Failed'}
            </h1>
            <p className="text-gray-600 truncate max-w-lg mx-auto">{job.url}</p>
          </div>

          {/* Progress Card */}
          {isProcessing && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold">Progress</span>
                  <span className="text-indigo-600 font-bold">
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {job.progress} of {job.total} pages scraped
                </p>
              </div>

              <div className="text-center">
                <p className="text-gray-700 mb-2">{job.message}</p>
                <div className="flex items-center justify-center text-sm text-green-600">
                  <span className="relative flex h-3 w-3 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                  Live updates
                </div>
              </div>
            </div>
          )}

          {/* Complete - Download */}
          {isComplete && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-8 mb-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-4">Your Report is Ready!</h2>
              <p className="text-gray-700 mb-6">
                Successfully scraped {job.stats?.successful || job.progress} pages
                {job.stats?.total_cost > 0 && ' with AI analysis'}
              </p>

              <a
                href={`${import.meta.env.VITE_API_URL || ''}/api/download/${job.result_file}`}
                download
                className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all text-lg"
              >
                📥 Download Excel Report
              </a>

              {job.stats && (
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {job.stats.successful || job.progress}
                    </div>
                    <div className="text-sm text-gray-600">Pages Scraped</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {job.stats.duration?.toFixed(1) || '—'}s
                    </div>
                    <div className="text-sm text-gray-600">Processing Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">
                      ${job.stats.total_cost?.toFixed(4) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">API Cost</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Failed */}
          {isFailed && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-900 mb-4">Scrape Failed</h2>
              <p className="text-red-700 mb-6">{job.message}</p>
              <Link
                to="/scrape"
                className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
              >
                Try Again
              </Link>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-4">What's Next?</h3>
            <div className="space-y-3">
              <Link
                to="/scrape"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold">🔄 Scrape Another Website</span>
              </Link>
              <Link
                to="/dashboard"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold">📊 View All Jobs</span>
              </Link>
              <Link
                to="/pricing"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold">⬆️ Upgrade for More Credits</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

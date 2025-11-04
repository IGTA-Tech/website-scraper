import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { scraperAPI } from '../services/api'

export default function JobDetails() {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJob()

    // Connect WebSocket for real-time updates
    const ws = scraperAPI.connectWebSocket(jobId, (data) => {
      setJob(data)
    })

    // Fallback polling
    const interval = setInterval(fetchJob, 2000)

    return () => {
      ws.close()
      clearInterval(interval)
    }
  }, [jobId])

  const fetchJob = async () => {
    try {
      const data = await scraperAPI.getJobStatus(jobId)
      setJob(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching job:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="card text-center py-12">
        <p className="text-lg text-gray-500 mb-4">Job not found</p>
        <Link to="/jobs" className="text-primary hover:underline">
          Back to Jobs
        </Link>
      </div>
    )
  }

  const progressPercent = (job.progress / job.total) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/jobs" className="text-primary hover:underline">
          ← Back to Jobs
        </Link>
        <StatusBadge status={job.status} />
      </div>

      {/* Job Info */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Job Details</h2>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">URL</p>
            <p className="font-medium break-all">{job.url}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{job.message}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Job ID</p>
            <p className="font-mono text-xs text-gray-600">{job.job_id}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">{new Date(job.created_at).toLocaleString()}</p>
          </div>

          {job.completed_at && (
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="font-medium">{new Date(job.completed_at).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {job.status !== 'completed' && job.status !== 'failed' && (
        <div className="card">
          <h3 className="font-bold mb-4">Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{job.progress} pages</span>
              <span>{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-4 rounded-full transition-all flex items-center justify-end pr-2"
                style={{ width: `${progressPercent}%` }}
              >
                {progressPercent > 10 && (
                  <span className="text-white text-xs font-bold">
                    {progressPercent.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {job.total - job.progress} pages remaining
            </p>
          </div>

          {/* Live indicator */}
          <div className="mt-4 flex items-center text-sm text-green-600">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Live updates active
          </div>
        </div>
      )}

      {/* Statistics */}
      {job.stats && (
        <div className="card">
          <h3 className="font-bold mb-4">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Pages</p>
              <p className="text-2xl font-bold">{job.stats.total_pages}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Successful</p>
              <p className="text-2xl font-bold text-green-500">{job.stats.successful}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-red-500">{job.stats.failed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-2xl font-bold">{job.stats.duration?.toFixed(1)}s</p>
            </div>
            {job.stats.total_tokens && (
              <div>
                <p className="text-sm text-gray-500">Tokens Used</p>
                <p className="text-2xl font-bold">{job.stats.total_tokens?.toLocaleString()}</p>
              </div>
            )}
            {job.stats.total_cost !== undefined && (
              <div>
                <p className="text-sm text-gray-500">API Cost</p>
                <p className="text-2xl font-bold">${job.stats.total_cost?.toFixed(4)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Download Button */}
      {job.status === 'completed' && job.result_file && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-green-900 mb-1">Results Ready!</h3>
              <p className="text-sm text-green-700">Your scrape has completed successfully</p>
            </div>
            <a
              href={scraperAPI.getDownloadUrl(job.result_file)}
              download
              className="btn btn-primary"
            >
              📥 Download Results
            </a>
          </div>
        </div>
      )}

      {/* Error Message */}
      {job.status === 'failed' && (
        <div className="card bg-red-50 border-red-200">
          <h3 className="font-bold text-red-900 mb-2">Job Failed</h3>
          <p className="text-red-700">{job.message}</p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    queued: 'bg-gray-200 text-gray-700',
    scraping: 'bg-blue-100 text-blue-700',
    analyzing: 'bg-purple-100 text-purple-700',
    exporting: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || colors.queued}`}>
      {status}
    </span>
  )
}

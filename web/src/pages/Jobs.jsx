import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { scraperAPI } from '../services/api'

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchJobs = async () => {
    try {
      const data = await scraperAPI.listJobs()
      setJobs(data.reverse()) // Most recent first
      setLoading(false)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setLoading(false)
    }
  }

  const handleDelete = async (jobId) => {
    if (!confirm('Delete this job?')) return

    try {
      await scraperAPI.deleteJob(jobId)
      setJobs(jobs.filter(j => j.job_id !== jobId))
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Failed to delete job')
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true
    return job.status === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Jobs</h2>
        <Link to="/scrape" className="btn btn-primary">
          + New Scrape
        </Link>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        {['all', 'queued', 'scraping', 'analyzing', 'completed', 'failed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="card">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No jobs found</p>
            <Link to="/scrape" className="text-primary hover:underline">
              Create your first scrape
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <div
                key={job.job_id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <Link
                      to={`/jobs/${job.job_id}`}
                      className="font-medium text-gray-900 hover:text-primary truncate block"
                    >
                      {job.url}
                    </Link>
                    <p className="text-sm text-gray-500">{job.message}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={job.status} />
                    <button
                      onClick={() => handleDelete(job.job_id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {job.status !== 'completed' && job.status !== 'failed' && (
                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(job.progress / job.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.progress} / {job.total} pages
                    </p>
                  </div>
                )}

                {job.status === 'completed' && job.result_file && (
                  <a
                    href={scraperAPI.getDownloadUrl(job.result_file)}
                    download
                    className="inline-block mt-2 text-primary hover:underline text-sm"
                  >
                    📥 Download Results
                  </a>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  Created: {new Date(job.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
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
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || colors.queued}`}>
      {status}
    </span>
  )
}

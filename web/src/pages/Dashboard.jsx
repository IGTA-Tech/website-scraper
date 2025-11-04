import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { scraperAPI } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentJobs, setRecentJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [statsData, jobsData] = await Promise.all([
        scraperAPI.getStats(),
        scraperAPI.listJobs()
      ])
      setStats(statsData)
      setRecentJobs(jobsData.slice(0, 5))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-primary to-secondary text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome to Website Scraper Pro 🕷️</h2>
        <p className="text-lg opacity-90 mb-4">
          AI-powered web scraping with GPT-4o-mini integration
        </p>
        <Link to="/scrape" className="btn bg-white text-primary hover:bg-gray-100">
          Start New Scrape
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Jobs</p>
              <p className="text-3xl font-bold">{stats?.jobs?.total || 0}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Running</p>
              <p className="text-3xl font-bold text-primary">{stats?.jobs?.running || 0}</p>
            </div>
            <div className="text-4xl">⚡</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-500">{stats?.jobs?.completed || 0}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Cache Hit Rate</p>
              <p className="text-3xl font-bold text-secondary">
                {stats?.cache?.cache_hit_rate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="text-4xl">💾</div>
          </div>
        </div>
      </div>

      {/* Cache Stats */}
      {stats?.cache && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Cache Performance (Last 30 Days)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Cached Pages</p>
              <p className="text-2xl font-bold">{stats.cache.cached_pages?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">API Calls Saved</p>
              <p className="text-2xl font-bold text-green-500">
                {stats.cache.api_calls_saved?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cost Saved</p>
              <p className="text-2xl font-bold text-green-500">
                ${stats.cache.cost_saved?.toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tokens</p>
              <p className="text-2xl font-bold">
                {stats.cache.total_tokens_used?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Recent Jobs</h3>
          <Link to="/jobs" className="text-primary hover:underline">
            View All
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No jobs yet</p>
            <Link to="/scrape" className="text-primary hover:underline">
              Create your first scrape
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <Link
                key={job.job_id}
                to={`/jobs/${job.job_id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">{job.url}</p>
                    <p className="text-sm text-gray-500">{job.message}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                {job.status !== 'completed' && job.status !== 'failed' && (
                  <div className="mt-2">
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
              </Link>
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

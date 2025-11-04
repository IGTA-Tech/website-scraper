import React, { useState, useEffect } from 'react'
import { scraperAPI } from '../services/api'

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const data = await scraperAPI.getStats()
      setStats(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching stats:', error)
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Statistics & Performance</h2>

      {/* Job Stats */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Job Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            label="Total Jobs"
            value={stats?.jobs?.total || 0}
            icon="📊"
          />
          <StatCard
            label="Queued"
            value={stats?.jobs?.queued || 0}
            icon="⏳"
            color="text-gray-600"
          />
          <StatCard
            label="Running"
            value={stats?.jobs?.running || 0}
            icon="⚡"
            color="text-blue-600"
          />
          <StatCard
            label="Completed"
            value={stats?.jobs?.completed || 0}
            icon="✅"
            color="text-green-600"
          />
          <StatCard
            label="Failed"
            value={stats?.jobs?.failed || 0}
            icon="❌"
            color="text-red-600"
          />
        </div>
      </div>

      {/* Cache Performance */}
      {stats?.cache && (
        <>
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Cache Performance (Last 30 Days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Cached Pages</p>
                <p className="text-3xl font-bold">{stats.cache.cached_pages?.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.cache.total_accesses?.toLocaleString()} total accesses
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Cache Hit Rate</p>
                <p className="text-3xl font-bold text-primary">
                  {stats.cache.cache_hit_rate?.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.cache.cache_hits?.toLocaleString()} hits / {stats.cache.cache_misses?.toLocaleString()} misses
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">API Calls Saved</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.cache.api_calls_saved?.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avoided API requests
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Cost Savings</p>
                <p className="text-3xl font-bold text-green-600">
                  ${stats.cache.cost_saved?.toFixed(4)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Money saved by caching
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">AI Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Cached Analyses</p>
                <p className="text-3xl font-bold">{stats.cache.cached_analyses?.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Total Tokens Used</p>
                <p className="text-3xl font-bold">{stats.cache.total_tokens_used?.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Total AI Cost</p>
                <p className="text-3xl font-bold text-secondary">
                  ${stats.cache.total_cost?.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="card bg-gradient-to-r from-primary to-secondary text-white">
            <h3 className="text-xl font-bold mb-4">💡 Performance Insights</h3>
            <div className="space-y-3">
              {stats.cache.cache_hit_rate > 50 && (
                <div className="flex items-start">
                  <span className="mr-2">✅</span>
                  <div>
                    <p className="font-medium">Excellent Cache Performance</p>
                    <p className="text-sm opacity-90">
                      Your cache hit rate of {stats.cache.cache_hit_rate.toFixed(1)}% is saving significant API costs
                    </p>
                  </div>
                </div>
              )}

              {stats.cache.cost_saved > 0 && (
                <div className="flex items-start">
                  <span className="mr-2">💰</span>
                  <div>
                    <p className="font-medium">Cost Optimization Active</p>
                    <p className="text-sm opacity-90">
                      You've saved ${stats.cache.cost_saved.toFixed(4)} in API costs through intelligent caching
                    </p>
                  </div>
                </div>
              )}

              {stats.cache.api_calls_saved > 100 && (
                <div className="flex items-start">
                  <span className="mr-2">⚡</span>
                  <div>
                    <p className="font-medium">High Efficiency</p>
                    <p className="text-sm opacity-90">
                      {stats.cache.api_calls_saved.toLocaleString()} API calls avoided thanks to smart caching
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color = "text-gray-900" }) {
  return (
    <div className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

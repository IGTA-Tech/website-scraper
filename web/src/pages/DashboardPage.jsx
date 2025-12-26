import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const showSuccess = searchParams.get('success') === 'true'

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }

    fetchUserData()
    fetchJobs()
  }, [navigate])

  const fetchUserData = async () => {
    try {
      const response = await api.get('/api/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token')
        navigate('/login')
      }
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs')
      setJobs(response.data || [])
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/signout')
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_id')
    navigate('/')
  }

  const handleManageSubscription = async () => {
    try {
      const response = await api.post('/api/stripe/create-portal-session', {
        user_id: localStorage.getItem('user_id'),
        return_url: window.location.href,
      })
      if (response.data.url) {
        window.location.href = response.data.url
      }
    } catch (error) {
      console.error('Portal error:', error)
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

  const tierColors = {
    free: 'bg-gray-100 text-gray-800',
    starter: 'bg-blue-100 text-blue-800',
    professional: 'bg-purple-100 text-purple-800',
    business: 'bg-indigo-100 text-indigo-800',
    enterprise: 'bg-yellow-100 text-yellow-800',
  }

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
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                Upgrade
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-900 font-semibold">
              Payment successful! Your subscription is now active.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back{user?.email ? `, ${user.email}` : ''}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  to="/scrape"
                  className="flex items-center p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <span className="text-2xl mr-3">+</span>
                  <div>
                    <div className="font-semibold">New Scrape</div>
                    <div className="text-sm opacity-90">Start a new analysis</div>
                  </div>
                </Link>
                <button
                  onClick={handleManageSubscription}
                  className="flex items-center p-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-all text-left"
                >
                  <span className="text-2xl mr-3">Settings</span>
                  <div>
                    <div className="font-semibold">Manage Subscription</div>
                    <div className="text-sm text-gray-600">Billing & invoices</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Recent Scrapes</h2>
                <Link to="/scrape" className="text-indigo-600 hover:underline text-sm">
                  View all
                </Link>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-600 mb-4">No scrapes yet</p>
                  <Link
                    to="/scrape"
                    className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Start Your First Scrape
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job) => (
                    <Link
                      key={job.id}
                      to={`/results/${job.id}`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{job.url}</p>
                          <p className="text-sm text-gray-600">
                            {job.progress} pages scraped
                          </p>
                        </div>
                        <div className="ml-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              job.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : job.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Credits Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-bold text-lg mb-4">Your Credits</h2>
              {user?.credits ? (
                <>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-indigo-600">
                      {user.credits.remaining}
                    </div>
                    <div className="text-sm text-gray-600">
                      of {user.credits.monthly_limit} pages remaining
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${
                          (user.credits.remaining / user.credits.monthly_limit) * 100
                        }%`,
                      }}
                    />
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    Resets on {new Date(user.credits.reset_date).toLocaleDateString()}
                  </div>
                </>
              ) : (
                <p className="text-gray-600">Loading credits...</p>
              )}

              <Link
                to="/pricing"
                className="block mt-4 text-center py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Upgrade for More Credits
              </Link>
            </div>

            {/* Subscription Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-bold text-lg mb-4">Subscription</h2>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Current Plan</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    tierColors[user?.subscription?.tier || 'free']
                  }`}
                >
                  {(user?.subscription?.tier || 'free').charAt(0).toUpperCase() +
                    (user?.subscription?.tier || 'free').slice(1)}
                </span>
              </div>

              {user?.subscription?.tier === 'free' ? (
                <Link
                  to="/pricing"
                  className="block text-center py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Upgrade Now
                </Link>
              ) : (
                <button
                  onClick={handleManageSubscription}
                  className="w-full py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Manage Subscription
                </button>
              )}
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Check our FAQ or contact support for assistance.
              </p>
              <Link
                to="/support"
                className="text-indigo-600 hover:underline text-sm font-medium"
              >
                Visit Support Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ScraperTool() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [url, setUrl] = useState(searchParams.get('url') || '')
  const [maxPages, setMaxPages] = useState(100)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [credits, setCredits] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    if (token) {
      setIsLoggedIn(true)
      fetchCredits()
    }
  }, [])

  const fetchCredits = async () => {
    try {
      const response = await api.get('/api/auth/me')
      setCredits(response.data.credits)
    } catch (error) {
      console.error('Failed to fetch credits:', error)
    }
  }

  const handleScrape = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/api/scrape', {
        url,
        max_pages: maxPages,
        use_ai: true,
        use_cache: true,
        output_format: 'xlsx'
      })

      // Redirect to results page
      navigate(`/results/${response.data.job_id}`)
    } catch (err) {
      if (err.response?.status === 402) {
        setError({
          type: 'credits',
          message: 'Not enough credits. Upgrade your plan to continue.',
          upgradeUrl: '/pricing'
        })
      } else if (err.response?.status === 403) {
        setError({
          type: 'feature',
          message: err.response.data.detail || 'Feature not available on your plan',
          upgradeUrl: '/pricing'
        })
      } else if (err.response?.status === 401) {
        setError({
          type: 'auth',
          message: 'Please login to use more than 10 pages',
          upgradeUrl: '/login'
        })
      } else {
        setError({
          type: 'error',
          message: err.response?.data?.detail || 'Something went wrong. Please try again.'
        })
      }
      setLoading(false)
    }
  }

  // Adjust max pages based on login status
  const effectiveMaxPages = isLoggedIn ? maxPages : Math.min(maxPages, 10)

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
              {credits && (
                <div className="text-sm text-gray-600">
                  <span className="font-bold text-indigo-600">{credits.remaining}</span>
                  {' '}credits left
                </div>
              )}
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              {isLoggedIn ? (
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Website Scraper</h1>
            <p className="text-xl text-gray-600">
              Enter a website URL to extract and analyze its content
            </p>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleScrape} className="space-y-6">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Max Pages Slider */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Pages: {effectiveMaxPages}
                  {!isLoggedIn && maxPages > 10 && (
                    <span className="text-orange-500 text-xs ml-2">
                      (Login for more pages)
                    </span>
                  )}
                </label>
                <input
                  type="range"
                  min="10"
                  max={isLoggedIn ? 500 : 10}
                  value={effectiveMaxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10 pages</span>
                  <span>{isLoggedIn ? '500 pages' : 'Login for more'}</span>
                </div>
              </div>

              {/* Features Preview */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3">What you'll get:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {isLoggedIn ? 'AI-powered content analysis' : 'Basic metadata extraction'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {isLoggedIn ? 'Quality & SEO scoring' : 'Page titles and descriptions'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {isLoggedIn ? 'Keyword extraction' : 'Link extraction'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {isLoggedIn ? 'Excel report with charts' : 'CSV export only'}
                  </li>
                </ul>
                {!isLoggedIn && (
                  <p className="text-xs text-indigo-600 mt-3">
                    <Link to="/signup" className="underline">Sign up</Link> for AI analysis and Excel exports!
                  </p>
                )}
              </div>

              {/* Estimates */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Estimated time:</span>
                  <span className="font-semibold">~{Math.ceil(effectiveMaxPages / 35)} minutes</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-600">Credits required:</span>
                  <span className="font-semibold">{effectiveMaxPages} credits</span>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div
                  className={`rounded-lg p-4 ${
                    error.type === 'credits'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p
                    className={`font-semibold ${
                      error.type === 'credits' ? 'text-yellow-900' : 'text-red-900'
                    }`}
                  >
                    {error.message}
                  </p>
                  {error.upgradeUrl && (
                    <Link
                      to={error.upgradeUrl}
                      className="text-indigo-600 hover:underline text-sm mt-2 inline-block"
                    >
                      {error.type === 'auth' ? 'Login →' : 'Upgrade Plan →'}
                    </Link>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-6 w-6 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Starting analysis...
                  </span>
                ) : (
                  `Scrape ${effectiveMaxPages} Pages →`
                )}
              </button>
            </form>
          </div>

          {/* Example URLs */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Try these examples:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['techcrunch.com', 'medium.com', 'dev.to', 'producthunt.com'].map(
                (domain) => (
                  <button
                    key={domain}
                    onClick={() => setUrl(`https://${domain}`)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:border-indigo-500 transition-colors"
                  >
                    {domain}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

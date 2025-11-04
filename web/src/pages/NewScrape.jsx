import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { scraperAPI } from '../services/api'

export default function NewScrape() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    url: '',
    max_pages: 500,
    use_cache: true,
    use_ai: true,
    email: '',
    output_format: 'xlsx'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const estimatedCost = formData.use_ai
    ? formData.use_cache
      ? (formData.max_pages * 0.00016).toFixed(4)
      : (formData.max_pages * 0.00034).toFixed(4)
    : 0

  const estimatedTime = Math.ceil(formData.max_pages / 35) // ~35 pages per minute

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const job = await scraperAPI.createScrapeJob(formData)
      navigate(`/jobs/${job.job_id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create scrape job')
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Start New Scrape</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL *
            </label>
            <input
              type="url"
              name="url"
              required
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
              className="input"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the starting URL to scrape
            </p>
          </div>

          {/* Max Pages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Pages
            </label>
            <input
              type="number"
              name="max_pages"
              min="1"
              max="1000"
              value={formData.max_pages}
              onChange={handleChange}
              className="input"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum number of pages to scrape (1-1000)
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Options</h3>

            <label className="flex items-start">
              <input
                type="checkbox"
                name="use_cache"
                checked={formData.use_cache}
                onChange={handleChange}
                className="mt-1 mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <div>
                <span className="font-medium">Use Cache</span>
                <p className="text-sm text-gray-500">
                  Reuse cached data to reduce costs (recommended)
                </p>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                name="use_ai"
                checked={formData.use_ai}
                onChange={handleChange}
                className="mt-1 mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <div>
                <span className="font-medium">AI Analysis</span>
                <p className="text-sm text-gray-500">
                  Use GPT-4o-mini for content analysis (adds cost)
                </p>
              </div>
            </label>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Results (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="input"
            />
            <p className="mt-1 text-sm text-gray-500">
              Receive results via email when complete
            </p>
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              name="output_format"
              value={formData.output_format}
              onChange={handleChange}
              className="input"
            >
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Estimates */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Estimates</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p>⏱️ Estimated time: ~{estimatedTime} minutes</p>
              <p>💰 Estimated cost: ${estimatedCost}</p>
              {formData.use_cache && (
                <p className="text-green-600">
                  ✓ Cache enabled - may reduce actual cost by 50%+
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting Scrape...
              </span>
            ) : (
              '🚀 Start Scraping'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

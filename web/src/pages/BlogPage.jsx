import React from 'react'
import { Link } from 'react-router-dom'

export default function BlogPage() {
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
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link to="/scrape" className="text-gray-600 hover:text-gray-900">
                Scraper
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl opacity-90">
            Tutorials, tips, and insights for web scraping and data extraction
          </p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="text-6xl mb-6">📝</div>
          <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
            We're working on amazing content to help you get the most out of web scraping.
            Check back soon!
          </p>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 max-w-md mx-auto">
            <h3 className="font-semibold mb-4">What to expect:</h3>
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span>Web scraping tutorials and guides</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span>SEO analysis tips and tricks</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span>Use cases and success stories</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span>Industry news and updates</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="mt-12">
            <h3 className="font-semibold mb-4">Get notified when we launch</h3>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Notify Me
              </button>
            </form>
          </div>
        </div>

        {/* Categories Preview */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6 text-center">Categories</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <CategoryCard
              title="Tutorials"
              description="Step-by-step guides"
              icon="📖"
              count={0}
            />
            <CategoryCard
              title="Use Cases"
              description="Real-world applications"
              icon="💼"
              count={0}
            />
            <CategoryCard
              title="SEO Tips"
              description="Optimization insights"
              icon="🔍"
              count={0}
            />
            <CategoryCard
              title="Industry News"
              description="Latest updates"
              icon="📰"
              count={0}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            While you wait, try our scraping tool!
          </p>
          <Link
            to="/scrape"
            className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
          >
            Try Free Scraper
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>© 2024 Website Scraper Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function CategoryCard({ title, description, icon, count }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 text-center hover:shadow-lg transition-shadow">
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      <span className="text-xs text-gray-400">{count} articles</span>
    </div>
  )
}

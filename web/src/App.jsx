import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import NewScrape from './pages/NewScrape'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import Stats from './pages/Stats'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🕷️</span>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Website Scraper Pro
                  </h1>
                  <p className="text-sm text-gray-500">AI-Powered Web Intelligence</p>
                </div>
              </div>

              <nav className="flex space-x-4">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </Link>
                <Link
                  to="/scrape"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'scrape'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('scrape')}
                >
                  New Scrape
                </Link>
                <Link
                  to="/jobs"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'jobs'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('jobs')}
                >
                  Jobs
                </Link>
                <Link
                  to="/stats"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'stats'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('stats')}
                >
                  Stats
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scrape" element={<NewScrape />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500 text-sm">
              Made with ❤️ using Claude Code | Website Scraper Pro v1.0.0
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App

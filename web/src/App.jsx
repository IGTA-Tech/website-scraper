import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Pages
import LandingPage from './pages/LandingPage'
import ScraperTool from './pages/ScraperTool'
import ResultsPage from './pages/ResultsPage'
import PricingPage from './pages/PricingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import SupportPage from './pages/SupportPage'
import BlogPage from './pages/BlogPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/scrape" element={<ScraperTool />} />
        <Route path="/results/:jobId" element={<ResultsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Pages */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Catch-all redirect to home */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
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
              <Link to="/blog" className="text-gray-600 hover:text-gray-900">
                Blog
              </Link>
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Scrape Any Website
            <br />
            <span className="text-yellow-300">Powered by AI</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Extract data, analyze content, and get insights in minutes.
            <br />
            No coding required.
          </p>

          {/* Quick Try Form */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
            <QuickTryForm />
          </div>

          <p className="mt-6 text-sm opacity-75">
            Start with 10 free pages - No credit card required
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center px-4">
          <p className="text-gray-600 mb-8">Trusted by 1,000+ businesses worldwide</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50">
            <div className="text-2xl font-bold text-gray-400">TechCorp</div>
            <div className="text-2xl font-bold text-gray-400">DataFlow</div>
            <div className="text-2xl font-bold text-gray-400">SEO Masters</div>
            <div className="text-2xl font-bold text-gray-400">ContentPro</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Everything You Need to Extract & Analyze
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              icon="🤖"
              title="AI-Powered Analysis"
              description="GPT-4 analyzes every page for quality, SEO, sentiment, and keywords automatically"
            />
            <FeatureCard
              icon="⚡"
              title="Lightning Fast"
              description="Scrape hundreds of pages in minutes. Export beautiful reports instantly"
            />
            <FeatureCard
              icon="📊"
              title="Professional Reports"
              description="Get Excel reports with charts, metrics, and actionable insights"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>

          <div className="space-y-8">
            <Step
              number="1"
              title="Enter Website URL"
              description="Paste any website URL - we'll automatically discover and crawl all pages"
            />
            <Step
              number="2"
              title="AI Analyzes Content"
              description="Our AI examines every page, extracting insights, keywords, and quality scores"
            />
            <Step
              number="3"
              title="Download Results"
              description="Get a beautiful Excel report with all data, ready to use"
            />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Perfect For</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UseCase
              icon="🔍"
              title="SEO Audits"
              description="Analyze competitor content and find optimization opportunities"
            />
            <UseCase
              icon="📈"
              title="Market Research"
              description="Extract product data and pricing from multiple sources"
            />
            <UseCase
              icon="📝"
              title="Content Analysis"
              description="Evaluate content quality across your entire website"
            />
            <UseCase
              icon="🎯"
              title="Lead Generation"
              description="Find contact information and business intelligence"
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl mb-12 opacity-90">Start free, upgrade as you grow</p>

          <div className="grid md:grid-cols-3 gap-6">
            <PricingPreview
              tier="Free"
              price="$0"
              features={['10 pages/month', 'Basic data', 'CSV export']}
            />
            <PricingPreview
              tier="Starter"
              price="$10"
              features={['500 pages/month', 'AI analysis', 'Excel reports']}
              highlighted={true}
            />
            <PricingPreview
              tier="Professional"
              price="$39"
              features={['2,500 pages/month', 'API access', 'Priority support']}
            />
          </div>

          <Link
            to="/pricing"
            className="inline-block mt-8 px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:shadow-lg transition-all text-lg"
          >
            View All Plans
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Extract Insights?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Start for free. No credit card required.
          </p>
          <Link
            to="/signup"
            className="inline-block px-12 py-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all text-lg"
          >
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Website Scraper Pro</h3>
            <p className="text-gray-400">
              AI-powered web scraping and content analysis for professionals.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link to="/scrape" className="hover:text-white">Scraper Tool</Link></li>
              <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/support" className="hover:text-white">FAQ</Link></li>
              <li><a href="mailto:support@webscraper.pro" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          © 2024 Website Scraper Pro. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

// Quick Try Form Component
function QuickTryForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!url) return

    // Redirect to scraper tool with URL pre-filled
    navigate(`/scrape?url=${encodeURIComponent(url)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 px-6 py-4 text-lg text-gray-900 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze →'}
        </button>
      </div>
      <p className="text-sm text-gray-600">
        Try it now - First 10 pages are free!
      </p>
    </form>
  )
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

// Step Component
function Step({ number, title, description }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}

// Use Case Component
function UseCase({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-100">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

// Pricing Preview Component
function PricingPreview({ tier, price, features, highlighted }) {
  return (
    <div
      className={`bg-white text-gray-900 p-6 rounded-lg ${
        highlighted ? 'ring-4 ring-yellow-400 scale-105' : ''
      }`}
    >
      <h3 className="font-bold text-xl mb-2">{tier}</h3>
      <div className="text-3xl font-bold mb-4">
        {price}
        <span className="text-lg font-normal text-gray-600">/mo</span>
      </div>
      <ul className="space-y-2 text-sm">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

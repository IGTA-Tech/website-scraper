import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function SupportPage() {
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
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How Can We Help?
          </h1>
          <p className="text-xl opacity-90">
            Find answers to common questions or contact our support team
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <FAQ
              question="How does Website Scraper Pro work?"
              answer="Simply enter a website URL, and our system will automatically crawl the site, extract content from each page, and optionally analyze it using AI. You'll get a downloadable Excel or CSV report with all the data."
            />
            <FAQ
              question="What data can I extract?"
              answer="We extract page titles, meta descriptions, headings, body content, links, images, and more. With AI analysis enabled, you also get quality scores, SEO recommendations, keyword extraction, and sentiment analysis."
            />
            <FAQ
              question="Is there a free plan?"
              answer="Yes! Our free plan includes 10 pages per month with basic metadata extraction and CSV export. No credit card required to get started."
            />
            <FAQ
              question="What's the difference between free and paid plans?"
              answer="Paid plans include AI-powered analysis, Excel exports with charts, more pages per month, and additional features like API access, batch processing, and priority support depending on your tier."
            />
            <FAQ
              question="How long does scraping take?"
              answer="Speed depends on the website and number of pages. Typically, we process about 30-50 pages per minute. You'll see live progress updates while your job runs."
            />
            <FAQ
              question="Can I scrape any website?"
              answer="We respect robots.txt and rate limits. Some websites may block automated access. If you encounter issues, try reducing the number of pages or contact support."
            />
            <FAQ
              question="How do credits work?"
              answer="Each page scraped uses 1 credit. Credits reset monthly on your billing date. Unused credits don't roll over to the next month."
            />
            <FAQ
              question="Can I cancel my subscription?"
              answer="Yes, you can cancel anytime from your dashboard. You'll retain access until the end of your current billing period."
            />
            <FAQ
              question="Do you offer refunds?"
              answer="We offer a 14-day money-back guarantee for all paid plans. Contact support if you're not satisfied."
            />
            <FAQ
              question="Is my data secure?"
              answer="Yes. We use industry-standard encryption and don't store scraped content longer than necessary. Your payment information is handled securely by Stripe."
            />
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Still Need Help?</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Email Support</h3>
              <p className="text-gray-600 mb-4">
                Send us an email and we'll get back to you within 24 hours.
              </p>
              <a
                href="mailto:support@webscraper.pro"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                support@webscraper.pro
              </a>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Response Times</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="w-24 text-sm font-medium">Free:</span>
                  <span>Community forums</span>
                </li>
                <li className="flex items-center">
                  <span className="w-24 text-sm font-medium">Starter:</span>
                  <span>48 hours</span>
                </li>
                <li className="flex items-center">
                  <span className="w-24 text-sm font-medium">Professional:</span>
                  <span>24 hours</span>
                </li>
                <li className="flex items-center">
                  <span className="w-24 text-sm font-medium">Business:</span>
                  <span>4 hours</span>
                </li>
                <li className="flex items-center">
                  <span className="w-24 text-sm font-medium">Enterprise:</span>
                  <span>Dedicated support</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              to="/pricing"
              className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow"
            >
              <div className="text-2xl mb-2">💳</div>
              <h3 className="font-semibold mb-1">Pricing</h3>
              <p className="text-sm text-gray-600">View all plans and features</p>
            </Link>
            <Link
              to="/scrape"
              className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow"
            >
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-semibold mb-1">Start Scraping</h3>
              <p className="text-sm text-gray-600">Try our tool for free</p>
            </Link>
            <Link
              to="/blog"
              className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow"
            >
              <div className="text-2xl mb-2">📚</div>
              <h3 className="font-semibold mb-1">Blog & Tutorials</h3>
              <p className="text-sm text-gray-600">Learn tips and tricks</p>
            </Link>
          </div>
        </section>
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

function FAQ({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-6 flex justify-between items-center"
      >
        <span className="font-medium text-lg pr-4">{question}</span>
        <span className="text-2xl text-gray-400 flex-shrink-0">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  )
}

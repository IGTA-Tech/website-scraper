import React from 'react'
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
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
              <Link to="/support" className="text-gray-600 hover:text-gray-900">
                Support
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: December 2024</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Website Scraper Pro ("we", "our", or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our web scraping and content analysis service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Email address (for account creation and communication)</li>
              <li>Payment information (processed securely via Stripe)</li>
              <li>Usage data (pages scraped, features used)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.2 Scraped Data</h3>
            <p className="text-gray-700 mb-4">
              When you use our service to scrape websites, we temporarily process and store
              the extracted data to generate your reports. This data is automatically deleted
              after your report is generated and downloaded.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To process your transactions</li>
              <li>To send you service-related communications</li>
              <li>To improve our service and develop new features</li>
              <li>To prevent fraud and abuse</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your account information for as long as your account is active.
              Scraped data and generated reports are retained according to your subscription tier:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Free: 24 hours</li>
              <li>Starter: 7 days</li>
              <li>Professional: 7 days</li>
              <li>Business: 30 days</li>
              <li>Enterprise: Custom retention</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>HTTPS encryption for all data transmission</li>
              <li>Encrypted database storage</li>
              <li>Secure payment processing via Stripe</li>
              <li>Regular security audits</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Stripe</strong> - Payment processing</li>
              <li><strong>OpenAI</strong> - AI content analysis</li>
              <li><strong>Supabase</strong> - Database and authentication</li>
              <li><strong>SendGrid</strong> - Email delivery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Cookies</h2>
            <p className="text-gray-700 mb-4">
              We use essential cookies to maintain your session and preferences.
              We do not use tracking cookies for advertising purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of
              any changes by posting the new Privacy Policy on this page and updating the
              "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-700">
              Email: <a href="mailto:privacy@webscraper.pro" className="text-indigo-600 hover:underline">privacy@webscraper.pro</a>
            </p>
          </section>
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

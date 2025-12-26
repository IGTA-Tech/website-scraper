import React from 'react'
import { Link } from 'react-router-dom'

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: December 2024</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using Website Scraper Pro ("Service"), you agree to be bound
              by these Terms of Service ("Terms"). If you disagree with any part of the terms,
              you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              Website Scraper Pro is a web scraping and content analysis tool that:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Crawls and extracts data from publicly accessible websites</li>
              <li>Analyzes content using AI technology</li>
              <li>Generates reports in various formats</li>
              <li>Provides API access for automated workflows (paid plans)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">
              When using our Service, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Only scrape websites you have permission to access</li>
              <li>Respect robots.txt files and website terms of service</li>
              <li>Not use the Service for illegal purposes</li>
              <li>Not attempt to overload or disrupt target websites</li>
              <li>Not scrape personal data without proper legal basis</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Account Terms</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>You must provide accurate account information</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must be at least 18 years old to use the Service</li>
              <li>One person or organization per account</li>
              <li>You may not share your account credentials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Subscription and Billing</h2>
            <h3 className="text-xl font-semibold mb-3">5.1 Subscription Plans</h3>
            <p className="text-gray-700 mb-4">
              We offer various subscription plans with different features and limits.
              Details are available on our Pricing page.
            </p>

            <h3 className="text-xl font-semibold mb-3">5.2 Billing</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Subscriptions are billed monthly or annually</li>
              <li>Payment is processed securely via Stripe</li>
              <li>Prices are subject to change with 30 days notice</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">5.3 Cancellation</h3>
            <p className="text-gray-700 mb-4">
              You may cancel your subscription at any time. Access continues until
              the end of your current billing period. We offer a 14-day money-back
              guarantee for new subscriptions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Our Service, including code, design, and content, is our property</li>
              <li>You retain ownership of data you upload or generate</li>
              <li>You grant us a license to process your data to provide the Service</li>
              <li>Scraped content belongs to its original owners</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">You may not use the Service to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Collect personal data without consent</li>
              <li>Distribute malware or harmful content</li>
              <li>Engage in competitive intelligence that violates laws</li>
              <li>Overload or attack websites (DDoS, etc.)</li>
              <li>Resell or redistribute our Service without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-gray-700 mb-4">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DO NOT
              GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR MEET
              YOUR SPECIFIC REQUIREMENTS.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
              ANY LOSS OF PROFITS OR REVENUES.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Indemnification</h2>
            <p className="text-gray-700 mb-4">
              You agree to indemnify and hold harmless Website Scraper Pro and its
              affiliates from any claims, damages, or expenses arising from your
              use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these Terms at any time. We will provide
              notice of significant changes via email or through the Service. Continued
              use after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the
              laws of the United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">13. Contact</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms, please contact us at:
            </p>
            <p className="text-gray-700">
              Email: <a href="mailto:legal@webscraper.pro" className="text-indigo-600 hover:underline">legal@webscraper.pro</a>
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

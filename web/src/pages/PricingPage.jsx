import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState('monthly')

  const tiers = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      pages: 10,
      features: [
        'Basic metadata extraction',
        'CSV export only',
        'Community support',
        'No AI analysis',
      ],
      notIncluded: ['AI analysis', 'Excel export', 'Email delivery'],
      cta: 'Get Started Free',
      ctaLink: '/signup',
      highlighted: false,
    },
    {
      name: 'Starter',
      price: 10,
      period: 'month',
      pages: 500,
      priceId: 'price_1SiTD4BsxM9WuBhjc9votvnW',
      features: [
        'Full AI analysis (GPT-4o-mini)',
        'Quality & SEO scoring',
        'Keyword extraction',
        'Sentiment analysis',
        'Excel + CSV export',
        'Email delivery',
        'Email support',
      ],
      notIncluded: ['API access', 'Batch processing'],
      cta: 'Start Free Trial',
      highlighted: true,
      popular: true,
    },
    {
      name: 'Professional',
      price: 39,
      period: 'month',
      pages: 2500,
      priceId: 'price_1SiTD5BsxM9WuBhjfspyI3jQ',
      features: [
        'Everything in Starter',
        'API access',
        'Batch processing',
        'Priority support',
        'Custom export templates',
        'Scheduled scraping',
        '7-day data retention',
      ],
      notIncluded: ['White-label', 'Team features'],
      cta: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Business',
      price: 149,
      period: 'month',
      pages: 15000,
      priceId: 'price_1SiTD5BsxM9WuBhjmFFSMy6Q',
      features: [
        'Everything in Professional',
        'White-label reports',
        'Team collaboration (5 users)',
        'Dedicated support',
        '30-day data retention',
        'Custom branding',
        'SLA guarantee (99.5%)',
      ],
      notIncluded: [],
      cta: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Enterprise',
      price: 499,
      period: 'month',
      pages: 50000,
      features: [
        'Everything in Business',
        'Unlimited users',
        'Custom integrations',
        'Dedicated infrastructure',
        'Custom AI models',
        'On-premise option',
        'Account manager',
        'Custom SLA (99.9%)',
      ],
      notIncluded: [],
      cta: 'Contact Sales',
      ctaLink: 'mailto:sales@webscraper.pro',
      highlighted: false,
    },
  ]

  const handleSubscribe = async (tier) => {
    if (tier.ctaLink) {
      window.location.href = tier.ctaLink
      return
    }

    if (!tier.priceId) {
      window.location.href = '/signup'
      return
    }

    setLoading(true)
    try {
      // This would call the Stripe checkout endpoint
      const response = await api.post('/api/stripe/create-checkout-session', {
        price_id: tier.priceId,
        user_id: localStorage.getItem('user_id') || 'anonymous',
        success_url: `${window.location.origin}/dashboard?success=true`,
        cancel_url: `${window.location.origin}/pricing`,
      })

      if (response.data.url) {
        window.location.href = response.data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      // Redirect to signup if not logged in
      window.location.href = '/signup'
    } finally {
      setLoading(false)
    }
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
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link to="/blog" className="text-gray-600 hover:text-gray-900">
                Blog
              </Link>
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl opacity-90">
            Start free, upgrade as you grow. No hidden fees.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-16 -mt-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`bg-white rounded-2xl shadow-lg p-6 relative ${
                tier.highlighted
                  ? 'ring-4 ring-indigo-500 scale-105 z-10'
                  : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>

              <div className="mb-4">
                <span className="text-4xl font-bold">${tier.price}</span>
                <span className="text-gray-600">/{tier.period}</span>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <strong>{tier.pages.toLocaleString()}</strong> pages/month
              </div>

              <ul className="space-y-2 mb-6 text-sm">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
                {tier.notIncluded.map((feature, i) => (
                  <li key={i} className="flex items-start text-gray-400">
                    <span className="mr-2 mt-0.5">✗</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(tier)}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  tier.highlighted
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {loading ? 'Loading...' : tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-4 px-4">Feature</th>
                <th className="py-4 px-4 text-center">Free</th>
                <th className="py-4 px-4 text-center bg-indigo-50">Starter</th>
                <th className="py-4 px-4 text-center">Professional</th>
                <th className="py-4 px-4 text-center">Business</th>
                <th className="py-4 px-4 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-4 px-4 font-medium">Pages per month</td>
                <td className="py-4 px-4 text-center">10</td>
                <td className="py-4 px-4 text-center bg-indigo-50">500</td>
                <td className="py-4 px-4 text-center">2,500</td>
                <td className="py-4 px-4 text-center">15,000</td>
                <td className="py-4 px-4 text-center">50,000+</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4 font-medium">AI Analysis</td>
                <td className="py-4 px-4 text-center text-red-500">✗</td>
                <td className="py-4 px-4 text-center bg-indigo-50 text-green-500">✓</td>
                <td className="py-4 px-4 text-center text-green-500">✓</td>
                <td className="py-4 px-4 text-center text-green-500">✓</td>
                <td className="py-4 px-4 text-center text-green-500">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4 font-medium">Excel Export</td>
                <td className="py-4 px-4 text-center text-red-500">✗</td>
                <td className="py-4 px-4 text-center bg-indigo-50 text-green-500">✓</td>
                <td className="py-4 px-4 text-center text-green-500">✓</td>
                <td className="py-4 px-4 text-center text-green-500">✓</td>
                <td className="py-4 px-4 text-center text-green-500">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4 font-medium">API Access</td>
                <td className="py-4 px-4 text-center text-red-500">✗</td>
                <td className="py-4 px-4 text-center bg-indigo-50 text-red-500">✗</td>
                <td className="py-4 px-4 text-center text-green-500">✓</td>
                <td className="py-4 px-4 text-center text-green-500">✓</td>
                <td className="py-4 px-4 text-center text-green-500">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4 font-medium">White-label</td>
                <td className="py-4 px-4 text-center text-red-500">✗</td>
                <td className="py-4 px-4 text-center bg-indigo-50 text-red-500">✗</td>
                <td className="py-4 px-4 text-center text-red-500">✗</td>
                <td className="py-4 px-4 text-center text-green-500">✓</td>
                <td className="py-4 px-4 text-center text-green-500">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4 font-medium">Team Members</td>
                <td className="py-4 px-4 text-center">1</td>
                <td className="py-4 px-4 text-center bg-indigo-50">1</td>
                <td className="py-4 px-4 text-center">1</td>
                <td className="py-4 px-4 text-center">5</td>
                <td className="py-4 px-4 text-center">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4 font-medium">Support</td>
                <td className="py-4 px-4 text-center">Community</td>
                <td className="py-4 px-4 text-center bg-indigo-50">Email</td>
                <td className="py-4 px-4 text-center">Priority</td>
                <td className="py-4 px-4 text-center">Dedicated</td>
                <td className="py-4 px-4 text-center">Account Manager</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <FAQ
            question="Can I try before I buy?"
            answer="Yes! Start with our Free tier - 10 pages per month, no credit card required. Upgrade anytime."
          />
          <FAQ
            question="What happens if I exceed my page limit?"
            answer="You'll receive a notification when you're close to your limit. You can upgrade your plan or wait until next month for credits to reset."
          />
          <FAQ
            question="Can I cancel anytime?"
            answer="Absolutely. Cancel your subscription anytime from your dashboard. You'll retain access until the end of your billing period."
          />
          <FAQ
            question="What payment methods do you accept?"
            answer="We accept all major credit cards (Visa, Mastercard, American Express) via our secure Stripe payment processing."
          />
          <FAQ
            question="Is there a refund policy?"
            answer="Yes, we offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-indigo-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl opacity-90 mb-8">
            Start with 10 free pages. No credit card required.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:shadow-lg transition-all text-lg"
          >
            Get Started Free →
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

function FAQ({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex justify-between items-center"
      >
        <span className="font-medium text-lg">{question}</span>
        <span className="text-2xl">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="mt-4 text-gray-600">{answer}</p>}
    </div>
  )
}

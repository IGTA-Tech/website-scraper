/**
 * Setup Stripe Products and Prices
 * Run once to create subscription products in Stripe
 *
 * Usage: node scripts/setup_stripe.js
 */

const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY environment variable is required');
  console.log('Usage: STRIPE_SECRET_KEY=sk_xxx node scripts/setup_stripe.js');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const products = {
  starter: {
    name: "Starter Plan",
    description: "Perfect for individuals and freelancers - 500 pages/month with AI analysis",
    price: 1000, // $10.00 in cents
    credits: 500,
    interval: "month"
  },
  professional: {
    name: "Professional Plan",
    description: "For small teams and growing businesses - 2,500 pages/month with API access",
    price: 3900, // $39.00
    credits: 2500,
    interval: "month"
  },
  business: {
    name: "Business Plan",
    description: "For agencies and large teams - 15,000 pages/month with white-label reports",
    price: 14900, // $149.00
    credits: 15000,
    interval: "month"
  }
};

async function setupStripeProducts() {
  console.log('Creating Stripe products and prices...\n');

  const priceIds = {};

  for (const [key, product] of Object.entries(products)) {
    try {
      // Create product
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
        metadata: {
          tier: key,
          credits_per_period: String(product.credits)
        }
      });

      console.log(`Created product: ${product.name} (${stripeProduct.id})`);

      // Create price
      const price = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: product.price,
        currency: 'usd',
        recurring: {
          interval: product.interval
        },
        metadata: {
          tier: key,
          credits: String(product.credits)
        }
      });

      console.log(`Created price: $${product.price / 100}/month (${price.id})`);
      priceIds[key] = price.id;
      console.log('');

    } catch (error) {
      console.error(`Error creating ${key}:`, error.message);
    }
  }

  console.log('\n========================================');
  console.log('Add these to your .env file:');
  console.log('========================================\n');
  console.log(`STRIPE_PRICE_STARTER=${priceIds.starter || ''}`);
  console.log(`STRIPE_PRICE_PROFESSIONAL=${priceIds.professional || ''}`);
  console.log(`STRIPE_PRICE_BUSINESS=${priceIds.business || ''}`);
  console.log('\n========================================\n');

  return priceIds;
}

// Run if called directly
setupStripeProducts()
  .then(priceIds => {
    console.log('Setup complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });

import { supabase } from './supabase'

// Stripe configuration via environment variables
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const STRIPE_PRO_PRICE_ID = import.meta.env.VITE_STRIPE_PRO_PRICE_ID || ''
const STRIPE_CHECKOUT_BASE_URL = import.meta.env.VITE_STRIPE_CHECKOUT_BASE_URL || ''

export function isStripeConfigured(): boolean {
  return !!(STRIPE_PUBLISHABLE_KEY && STRIPE_PRO_PRICE_ID)
}

/**
 * Creates a Stripe Checkout session via Supabase Edge Function.
 * The edge function handles Stripe API calls securely with the secret key.
 */
export async function createCheckoutSession(userId: string, email: string): Promise<string | null> {
  // If a Supabase Edge Function is configured, use it
  if (STRIPE_CHECKOUT_BASE_URL) {
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch(`${STRIPE_CHECKOUT_BASE_URL}/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        userId,
        email,
        priceId: STRIPE_PRO_PRICE_ID,
        successUrl: `${window.location.origin}/?upgrade=success`,
        cancelUrl: `${window.location.origin}/?upgrade=canceled`,
      }),
    })

    if (!response.ok) {
      throw new Error('Erro ao criar sessão de pagamento')
    }

    const { url } = await response.json()
    return url
  }

  // Fallback: Use Stripe Payment Links (no backend needed)
  // This is a simpler approach using pre-configured Stripe Payment Links
  const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK
  if (paymentLink) {
    const url = new URL(paymentLink)
    url.searchParams.set('client_reference_id', userId)
    url.searchParams.set('prefilled_email', email)
    return url.toString()
  }

  return null
}

/**
 * Opens the Stripe Customer Portal for managing subscriptions.
 */
export async function openCustomerPortal(userId: string): Promise<string | null> {
  if (!STRIPE_CHECKOUT_BASE_URL) return null

  const { data: { session } } = await supabase.auth.getSession()
  const response = await fetch(`${STRIPE_CHECKOUT_BASE_URL}/customer-portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({
      userId,
      returnUrl: window.location.origin,
    }),
  })

  if (!response.ok) {
    throw new Error('Erro ao abrir portal do cliente')
  }

  const { url } = await response.json()
  return url
}

/**
 * Log a subscription event locally
 */
export async function logSubscriptionEvent(
  userId: string,
  eventType: string,
  metadata?: Record<string, unknown>
) {
  await supabase.from('subscription_events').insert([{
    user_id: userId,
    event_type: eventType,
    plan: 'pro',
    metadata: metadata || {},
  }])
}

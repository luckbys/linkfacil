import { createClient } from 'npm:@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!
    const proPriceId = Deno.env.get('STRIPE_PRO_PRICE_ID')!
    const businessPriceId = Deno.env.get('STRIPE_BUSINESS_PRICE_ID')!
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const sb = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: { user } } = await sb.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { plan } = await req.json().catch(() => ({ plan: 'pro' }))
    const price = plan === 'business' ? businessPriceId : proPriceId
    if (!price) {
      return new Response(JSON.stringify({ error: 'Price ID not configured for selected plan' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const form = new URLSearchParams()
    form.set('mode', 'subscription')
    form.set('success_url', `${appUrl}/?checkout=success`)
    form.set('cancel_url', `${appUrl}/?checkout=cancel`)
    form.set('line_items[0][price]', price)
    form.set('line_items[0][quantity]', '1')
    form.set('customer_email', user.email || '')
    form.set('metadata[user_id]', user.id)
    form.set('metadata[plan_type]', plan)
    form.set('subscription_data[metadata][user_id]', user.id)
    form.set('subscription_data[metadata][plan_type]', plan)

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    })

    const stripeJson = await stripeRes.json()
    if (!stripeRes.ok) {
      return new Response(JSON.stringify({ error: stripeJson?.error?.message || 'Stripe checkout creation failed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ checkout_url: stripeJson.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

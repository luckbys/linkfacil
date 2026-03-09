import { createClient } from 'npm:@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    if (!signature || !webhookSecret) {
      return new Response(JSON.stringify({ error: 'Missing stripe signature or webhook secret' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const encoder = new TextEncoder()
    const payload = signature.split(',').reduce<Record<string, string>>((acc, part) => {
      const [k, v] = part.split('=')
      if (k && v) acc[k] = v
      return acc
    }, {})

    const t = payload.t
    const v1 = payload.v1
    if (!t || !v1) {
      return new Response(JSON.stringify({ error: 'Invalid stripe-signature format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const signedPayload = `${t}.${body}`
    const key = await crypto.subtle.importKey('raw', encoder.encode(webhookSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload))
    const expected = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')

    if (expected !== v1) {
      return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const event = JSON.parse(body)
    const sb = createClient(supabaseUrl, serviceRoleKey)

    const { error: eventErr } = await sb.from('billing_webhook_events').upsert({
      provider: 'stripe',
      event_id: event.id,
      event_type: event.type,
      payload: event,
      processed: false,
    }, { onConflict: 'provider,event_id' })

    if (eventErr) throw eventErr

    const object = event?.data?.object || {}
    const metadata = object.metadata || {}
    const userId = metadata.user_id
    const planType = metadata.plan_type || (object.items?.data?.[0]?.price?.metadata?.plan_type ?? 'pro')

    if (userId && ['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) {
      const statusMap: Record<string, string> = {
        trialing: 'trialing',
        active: 'active',
        past_due: 'past_due',
        canceled: 'canceled',
        unpaid: 'past_due',
      }

      const mappedStatus = statusMap[object.status] || (event.type === 'customer.subscription.deleted' ? 'canceled' : 'active')

      const { error: subErr } = await sb.from('subscriptions').upsert({
        user_id: userId,
        provider: 'stripe',
        provider_customer_id: object.customer,
        provider_subscription_id: object.id,
        plan_type: planType,
        status: mappedStatus,
        current_period_start: object.current_period_start ? new Date(object.current_period_start * 1000).toISOString() : null,
        current_period_end: object.current_period_end ? new Date(object.current_period_end * 1000).toISOString() : null,
        trial_end: object.trial_end ? new Date(object.trial_end * 1000).toISOString() : null,
        cancel_at_period_end: object.cancel_at_period_end ?? false,
        metadata,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'provider_subscription_id' })

      if (subErr) throw subErr
    }

    await sb.from('billing_webhook_events').update({ processed: true }).eq('provider', 'stripe').eq('event_id', event.id)

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

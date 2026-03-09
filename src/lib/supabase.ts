import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types
export interface User {
  id: string
  email: string
  slug: string
  name: string
  bio: string
  avatar_url?: string
  pix_key?: string
  pix_enabled: boolean
  theme: string
  plan_type?: 'start' | 'pro' | 'business'
  subscription_status?: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
  subscription_provider?: 'stripe' | 'mercado_pago' | 'pagarme' | null
  created_at: string
}

export interface Link {
  id: string
  user_id: string
  title: string
  url: string
  type: 'link' | 'whatsapp' | 'instagram' | 'tiktok' | 'youtube' | 'email' | 'pix'
  icon?: string
  clicks: number
  position: number
  active: boolean
  highlight?: 'pulse' | 'shine' | 'shake' | 'glow' | 'featured' | null
  scheduled_start?: string | null
  scheduled_end?: string | null
  is_embed?: boolean
  embed_html?: string | null
  created_at: string
}

export interface PageView {
  id: string
  user_id: string
  ip_address?: string
  user_agent?: string
  referrer?: string
  created_at: string
}


export interface Subscription {
  id: string
  user_id: string
  provider: 'stripe' | 'mercado_pago' | 'pagarme'
  provider_customer_id?: string | null
  provider_subscription_id?: string | null
  plan_type: 'start' | 'pro' | 'business'
  status: 'trialing' | 'active' | 'past_due' | 'canceled'
  current_period_start?: string | null
  current_period_end?: string | null
  trial_end?: string | null
  cancel_at_period_end?: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

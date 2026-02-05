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

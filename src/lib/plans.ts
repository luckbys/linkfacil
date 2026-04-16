import type { PlanType } from './supabase'

export interface PlanConfig {
  id: PlanType
  name: string
  price: number // BRL per month
  priceDisplay: string
  maxLinks: number
  features: string[]
  highlighted: boolean
}

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Grátis',
    price: 0,
    priceDisplay: 'R$ 0',
    maxLinks: 5,
    features: [
      'Até 5 links',
      '2 temas básicos',
      'Estatísticas básicas',
      'URL personalizada',
    ],
    highlighted: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 990, // R$ 9,90 in cents
    priceDisplay: 'R$ 9,90',
    maxLinks: Infinity,
    features: [
      'Links ilimitados',
      'Todos os temas',
      'PIX integrado',
      'Botão WhatsApp',
      'Embeds de vídeo',
      'Animações de destaque',
      'Agendamento de links',
      'Analytics completo',
      'Suporte prioritário',
    ],
    highlighted: true,
  },
}

export const FREE_THEMES = ['brand', 'dark']

export function isPro(plan: PlanType | undefined): boolean {
  return plan === 'pro'
}

export function canAddMoreLinks(plan: PlanType | undefined, currentCount: number): boolean {
  const config = PLANS[plan || 'free']
  return currentCount < config.maxLinks
}

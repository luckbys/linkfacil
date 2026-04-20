import type { PlanType } from './supabase'

export interface PlanConfig {
  id: PlanType
  name: string
  price: number // BRL in cents per month
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
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 990, // R$ 9,90
    priceDisplay: 'R$ 9,90',
    maxLinks: 20,
    features: [
      'Até 20 links',
      'Todos os temas',
      'PIX integrado',
      'Botão WhatsApp',
      'Estatísticas completas',
      'Suporte por email',
    ],
    highlighted: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 1990, // R$ 19,90
    priceDisplay: 'R$ 19,90',
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
    highlighted: false,
  },
}

export const FREE_THEMES = ['brand', 'dark']

export function isPro(plan: PlanType | undefined): boolean {
  return plan === 'pro'
}

export function isAtLeastStarter(plan: PlanType | undefined): boolean {
  return plan === 'starter' || plan === 'pro'
}

export function canAddMoreLinks(plan: PlanType | undefined, currentCount: number): boolean {
  const config = PLANS[plan || 'free']
  return currentCount < config.maxLinks
}

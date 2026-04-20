/**
 * LM Studio local API client
 * Assumes LM Studio is running on http://localhost:1234
 */

export interface AutoTitleResult {
  title: string
  description?: string
}

const LM_STUDIO_API = 'http://localhost:1234/v1/chat/completions'

export async function generateAutoTitle(url: string): Promise<AutoTitleResult> {
  try {
    // Extract domain for context
    const urlObj = new URL(url)
    const domain = urlObj.hostname

    const prompt = `Você é um especialista em marketing digital brasileiro.

Analise esta URL e gere um título profissional e atrativo para um link em uma página de bio (link-in-bio):
URL: ${url}

Requisitos:
- Máximo 40 caracteres
- Deve ser em português brasileiro
- Deve ser acionável e claro
- Se for WhatsApp, Instagram, TikTok, etc: incluir o nome da plataforma
- Evitar "Clique aqui" ou "Link"

Exemplos de bons títulos:
- "wa.me/5511..." → "WhatsApp - Agende seu horário"
- "instagram.com/usuario" → "Me siga no Instagram"
- "linktr.ee/..." → "Todos os meus links"
- "calendly.com/..." → "Agende uma consulta"
- "paypal.me/..." → "Apoie meu trabalho"

Responda APENAS com o título sugerido, sem explicações.`

    const response = await fetch(LM_STUDIO_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'local-model',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em criar títulos curtos e eficazes para links em páginas de bio. Responda com apenas o título, sem explicações.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`LM Studio API error: ${response.status}`)
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>
    }

    const title = data.choices[0]?.message?.content?.trim() || ''

    if (!title) {
      throw new Error('Empty response from LM Studio')
    }

    return {
      title,
      description: `Sugestão gerada para ${domain}`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to generate auto title: ${message}`)
  }
}

/**
 * Detect link type from URL for icon suggestion
 */
export function detectLinkTypeFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.toLowerCase()

    if (domain.includes('wa.me') || domain.includes('whatsapp')) return 'whatsapp'
    if (domain.includes('instagram')) return 'instagram'
    if (domain.includes('tiktok')) return 'tiktok'
    if (domain.includes('youtube') || domain.includes('youtu.be')) return 'youtube'
    if (domain.includes('twitter') || domain.includes('x.com')) return 'twitter'
    if (domain.includes('facebook')) return 'facebook'
    if (domain.includes('linkedin')) return 'linkedin'
    if (domain.includes('github')) return 'github'
    if (domain.includes('telegram')) return 'telegram'
    if (domain.includes('discord')) return 'link'
    if (domain.includes('twitch')) return 'link'
    if (domain.includes('paypal') || domain.includes('pix')) return 'link'
    if (domain.includes('calendly') || domain.includes('agendor')) return 'link'

    return 'link'
  } catch {
    return 'link'
  }
}

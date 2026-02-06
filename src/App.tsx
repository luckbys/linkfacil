import { useState, useEffect } from 'react'
import './index.css'
import { supabase } from './lib/supabase'
import type { User, Link } from './lib/supabase'
import { generatePixPayload, getPixQrCodeUrl } from './lib/pix'
import { detectLinkType, getFaviconUrl } from './lib/icons'
import {
  Link2, CreditCard, Smartphone, Palette, BarChart3,
  ChevronRight, Check, LogOut,
  Trash2, GripVertical, Plus, Copy, CheckCircle, X, ShieldCheck,
  Instagram, Youtube, Linkedin, Github, Twitter, Facebook, Mail, MessageCircle, Play
} from 'lucide-react'

// Embed Helper Functions
function getEmbedType(url: string): 'youtube' | 'tiktok' | 'instagram' | null {
  if (url.match(/youtube\.com|youtu\.be/)) return 'youtube'
  if (url.match(/tiktok\.com/)) return 'tiktok'
  if (url.match(/instagram\.com\/p\/|instagram\.com\/reel\//)) return 'instagram'
  return null
}

function getYouTubeEmbedUrl(url: string): string | null {
  // https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

function getTikTokVideoId(url: string): string | null {
  // https://www.tiktok.com/@user/video/VIDEO_ID
  const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
  return match ? match[1] : null
}

// Social Embed Component
function SocialEmbed({ url, embedHtml }: { url: string; embedHtml?: string | null }) {
  const embedType = getEmbedType(url)

  // Custom HTML embed (for Instagram)
  if (embedHtml) {
    return (
      <div
        className="social-embed w-full rounded-xl overflow-hidden bg-white shadow-md"
        dangerouslySetInnerHTML={{ __html: embedHtml }}
      />
    )
  }

  // YouTube embed
  if (embedType === 'youtube') {
    const embedUrl = getYouTubeEmbedUrl(url)
    if (embedUrl) {
      return (
        <div className="social-embed w-full aspect-video rounded-xl overflow-hidden shadow-md">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
  }

  // TikTok embed
  if (embedType === 'tiktok') {
    const videoId = getTikTokVideoId(url)
    if (videoId) {
      return (
        <div className="social-embed w-full max-w-[325px] mx-auto rounded-xl overflow-hidden shadow-md">
          <blockquote
            className="tiktok-embed"
            cite={url}
            data-video-id={videoId}
            style={{ maxWidth: '325px', minWidth: '280px' }}
          >
            <section className="p-4 bg-gradient-to-br from-pink-500 to-violet-500 text-white text-center">
              <Play className="w-8 h-8 mx-auto mb-2" />
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
                Ver no TikTok
              </a>
            </section>
          </blockquote>
          <script async src="https://www.tiktok.com/embed.js"></script>
        </div>
      )
    }
  }

  // Fallback - just show a placeholder
  return (
    <div className="social-embed w-full p-6 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl text-center border border-slate-200">
      <Play className="w-10 h-10 mx-auto text-slate-400 mb-2" />
      <p className="text-sm text-slate-500">Embed não suportado</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline text-sm">
        Ver conteúdo original
      </a>
    </div>
  )
}

// Auth Hook
function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    console.log('Fetching profile for:', userId)
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Se o perfil não existe (erro PGRST116), vamos criar um
    if (error && error.code === 'PGRST116') {
      console.log('Profile missing, creating default profile...')

      // Pegamos os detalhes do usuário atual da sessão
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: authUser.email!,
            slug: userId.slice(0, 8) + Math.floor(Math.random() * 1000), // Slug mais seguro
            name: authUser.user_metadata.name || 'Novo Usuário',
            bio: 'Minha página de links',
            theme: 'brand'
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating default profile:', createError)
        } else {
          console.log('Created default profile:', newProfile)
          data = newProfile
        }
      }
    } else if (error) {
      console.error('Error fetching profile:', error)
    }

    if (data) {
      console.log('Final profile set:', data)
      setUser(data as User)
    }
    setLoading(false)
  }

  return { user, loading, setUser }
}

// Landing Page - Optimized with landing-page-generator skill
function LandingPage({ onStart }: { onStart: () => void }) {
  const benefits = [
    { icon: CreditCard, text: 'Receba pagamentos via PIX direto na página' },
    { icon: Smartphone, text: 'Botão de WhatsApp com mensagem personalizada' },
    { icon: Palette, text: 'Design brasileiro único (temas Carnaval, Futebol, Praia)' },
    { icon: Link2, text: 'Links ilimitados e personalizáveis' },
    { icon: CheckCircle, text: 'Estatísticas em tempo real' },
    { icon: CheckCircle, text: 'URL personalizada: linkfacil.app/@seunome' },
  ]

  const features = [
    { title: 'Editor Drag \u0026 Drop', desc: 'Monte sua página em minutos, sem código' },
    { title: 'QR Code PIX', desc: 'Gere QR codes dinâmicos para qualquer valor' },
    { title: 'Temas Exclusivos', desc: 'Cores e estilos inspirados no Brasil' },
    { title: 'Dashboard Completo', desc: 'Gerencie links, veja analytics, configure PIX' },
    { title: '100% Responsivo', desc: 'Perfeito em qualquer dispositivo' },
    { title: 'Suporte Local', desc: 'Atendimento em português, do Brasil' },
  ]

  const testimonials = [
    { name: 'Ana Silva', role: 'Influencer', text: 'Consegui triplicar meus agendamentos com o botão de WhatsApp!' },
    { name: 'Carlos Mendes', role: 'Barbeiro', text: 'Clientes pagam direto pela página. Não preciso mais ficar enviando chave PIX!' },
    { name: 'Marina Costa', role: 'Consultora', text: 'Muito mais barato que o Linktree e com cara de Brasil. Amo!' },
  ]

  const faqs = [
    { q: 'Preciso saber programar?', a: 'Não! Nosso editor é super intuitivo. Em 2 minutos sua página está no ar.' },
    { q: 'O PIX funciona de verdade?', a: 'Sim! Geramos QR codes válidos que funcionam em qualquer banco. O dinheiro vai direto pra sua conta.' },
    { q: 'Posso usar meu próprio domínio?', a: 'Na versão Pro, sim! Você pode usar @seudominio.com' },
    { q: 'Tem garantia?', a: 'Sim! 7 dias de garantia incondicional. Não gostou? Devolvemos seu dinheiro.' },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-slate-900 selection:bg-sky-100 selection:text-sky-900">
      {/* Sticky Nav */}
      <nav className="fixed top-0 left-0 right-0 glass z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">LinkFácil</span>
          </div>
          <button
            onClick={onStart}
            className="btn-primary text-sm md:text-base px-5 py-2.5"
          >
            Criar Grátis
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 hero-gradient -z-20"></div>
        <div className="absolute inset-0 bg-dot-pattern opacity-50 -z-10"></div>

        {/* Glow Effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-sky-200/20 rounded-full blur-3xl -z-10 animate-pulse-glow"></div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex animate-fadeInUp opacity-0" style={{ animationDelay: '0.1s' }}>
            <div className="badge badge-brand mb-8 border border-sky-200 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              Oferta de Lançamento: 50% OFF
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-slate-900 leading-[1.1] mb-8 text-balance animate-fadeInUp opacity-0" style={{ animationDelay: '0.2s' }}>
            Seus links, <br className="hidden md:block" />
            <span className="gradient-text">muito mais Brasil.</span> 🇧🇷
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed text-balance animate-fadeInUp opacity-0" style={{ animationDelay: '0.3s' }}>
            Crie uma página digna de seus seguidores. Com <strong>PIX integrado</strong>, <strong>botão de WhatsApp</strong> e design que converte.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fadeInUp opacity-0" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={onStart}
              className="btn-primary text-lg px-8 py-4 shadow-xl shadow-sky-500/20 w-full sm:w-auto hover:-translate-y-1 transition-transform"
            >
              Começar Agora
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
            <p className="text-sm text-slate-500 font-medium sm:hidden">Comece grátis, cancele quando quiser.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm font-medium text-slate-500 animate-fadeInUp opacity-0" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-white/50 backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-white/50 backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Instalação em 2 min</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-white/50 backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>7 dias de garantia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Bar */}
      <section className="py-8 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex flex-col md:flex-row items-center gap-4 text-lg md:text-xl font-medium">
            <span className="text-slate-400">Linktree cobra: <span className="line-through decoration-red-500/50">R$ 45/mês</span></span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="text-sky-400 font-bold bg-sky-400/10 px-4 py-1 rounded-full border border-sky-400/20">LinkFácil: R$ 9,90/mês</span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="text-emerald-400 font-bold flex items-center gap-2">
              Economize 78%
              <span className="text-2xl">💰</span>
            </span>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Por que escolher o <span className="text-sky-600">LinkFácil</span>?
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed text-balance">
              Tudo que você precisa para vender mais e organizar seus links com a identidade do seu negócio.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover hover:border-sky-100 group">
                <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-sky-500 group-hover:scale-110 transition-all duration-300">
                  <benefit.icon className="w-6 h-6 text-sky-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-medium text-slate-700 leading-relaxed pt-1">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding bg-slate-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern opacity-30"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Funcionalidades Premium
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">O que você recebe</h2>
            <p className="text-xl text-slate-600 leading-relaxed text-balance">
              Ferramentas poderosas desenvolvidas especificamente para o mercado brasileiro.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="glass p-8 rounded-3xl shadow-sm card-hover group">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-slate-50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-sky-50 to-transparent -z-10"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">O que dizem nossos usuários</h2>
            <p className="text-xl text-slate-600 leading-relaxed text-balance">
              Junte-se a milhares de empreendedores que já profissionalizaram suas vendas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 card-hover flex flex-col relative">
                <div className="text-4xl text-sky-200 absolute top-4 right-6 font-serif">"</div>
                <p className="text-slate-600 mb-6 text-lg italic leading-relaxed flex-grow relative z-10">"{t.text}"</p>
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-sm text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">Preço Simples e Transparente</h2>
            <p className="text-xl text-slate-600 leading-relaxed text-balance">Sem taxas escondidas. Cancele quando quiser.</p>
          </div>

          <div className="bg-white rounded-[2rem] shadow-2xl shadow-sky-900/10 p-8 md:p-12 text-center border border-slate-100 relative overflow-hidden max-w-lg mx-auto transform hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-500"></div>
            <div className="absolute top-6 right-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700 uppercase tracking-wide">
                Mais Popular
              </span>
            </div>

            <div className="text-sm text-sky-600 font-bold uppercase tracking-widest mb-2">Plano Pro</div>
            <div className="flex items-baseline justify-center gap-1 mb-8">
              <span className="text-slate-400 line-through text-lg relative top-[-0.5rem] mr-2">R$ 19,90</span>
              <span className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">R$ 9,90</span>
              <span className="text-slate-500 font-medium">/mês</span>
            </div>

            <ul className="space-y-4 text-left mx-auto mb-10 max-w-xs md:max-w-sm">
              {['Links ilimitados', 'PIX integrado', 'Botão WhatsApp', 'Estatísticas básicas', 'Temas premium', 'Suporte prioritário'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={onStart}
              className="w-full btn-primary text-lg py-4 shadow-xl shadow-sky-500/20"
            >
              Começar Agora
            </button>

            <p className="text-xs text-slate-400 mt-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              7 dias de garantia incondicional
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center text-gray-900 mb-12">Dúvidas Frequentes</h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8">
            Comece a vender mais hoje mesmo.
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto text-balance">
            Junte-se a milhares de brasileiros que usam o LinkFácil para transformar cliques em vendas no WhatsApp.
          </p>
          <button
            onClick={onStart}
            className="btn-primary text-lg px-10 py-5 bg-white text-slate-900 hover:bg-sky-50 shadow-white/5"
          >
            Criar Minha Página
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400 text-center">
        <p>© 2026 LinkFácil. Feito com ❤️ no Brasil 🇧🇷</p>
      </footer>
    </div>
  )
}

// Auth Page
function AuthPage({ onAuth }: { onAuth: () => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        console.log('Attempting login for:', email)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        console.log('Login successful:', data)
      } else {
        console.log('Attempting signup for:', email)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0], // Nome padrão baseado no email
            }
          }
        })
        if (error) throw error
        console.log('Signup successful:', data)
      }
      onAuth()
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'Erro na autenticação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black">{isLogin ? 'Entrar' : 'Criar Conta'}</h1>
          <p className="text-gray-500">{isLogin ? 'Bem-vindo de volta!' : 'Comece gratuitamente'}</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-brand-600 font-bold">
            {isLogin ? 'Criar agora' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}

// Link Icon Component with Universal Support (Favicon fallback)
function LinkIcon({ type, url, className = "w-5 h-5" }: { type?: string, url?: string, className?: string }) {
  const [imgError, setImgError] = useState(false)

  // Dynamic type detection for legacy links
  const effectiveType = type || (url ? detectLinkType(url) : 'link')
  const favicon = url ? getFaviconUrl(url) : null

  // If we have a non-email URL and favicon didn't error, try showing the favicon first
  if (favicon && !imgError && effectiveType !== 'email') {
    return (
      <img
        src={favicon}
        alt=""
        className={className + " rounded-sm object-contain"}
        onError={() => setImgError(true)}
      />
    )
  }

  // Fallback to manual Lucide icons
  switch (effectiveType) {
    case 'instagram': return <Instagram className={className} />
    case 'youtube': return <Youtube className={className} />
    case 'whatsapp': return <MessageCircle className={className} />
    case 'tiktok': return <Link2 className={className} />
    case 'linkedin': return <Linkedin className={className} />
    case 'github': return <Github className={className} />
    case 'facebook': return <Facebook className={className} />
    case 'twitter': return <Twitter className={className} />
    case 'email': return <Mail className={className} />
    case 'pix': return <CreditCard className={className} />
    default: return <Link2 className={className} />
  }
}

// Analytics Dashboard Component
function AnalyticsDashboard({ userId, links }: { userId: string, links: Link[] }) {
  const [stats, setStats] = useState({
    totalViews: 0,
    viewsByDay: [] as { date: string, count: number }[],
    deviceStats: { mobile: 0, desktop: 0 },
    countries: [] as { country: string, count: number, code: string }[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [userId])

  async function fetchAnalytics() {
    setLoading(true)

    // Fetch page views
    const { data: views } = await supabase
      .from('page_views')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (views) {
      // Total views
      const totalViews = views.length

      // Views by day (last 7 days)
      const today = new Date()
      const viewsByDay = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const count = views.filter(v => v.created_at?.startsWith(dateStr)).length
        viewsByDay.push({ date: dateStr, count })
      }

      // Device stats
      const mobile = views.filter(v => v.device_type === 'mobile').length
      const desktop = views.filter(v => v.device_type === 'desktop').length

      // Country stats
      const countryMap = new Map<string, { count: number, code: string }>()
      views.forEach(v => {
        if (v.country) {
          const existing = countryMap.get(v.country) || { count: 0, code: v.country_code || '' }
          countryMap.set(v.country, { count: existing.count + 1, code: existing.code })
        }
      })
      const countries = Array.from(countryMap.entries())
        .map(([country, data]) => ({ country, count: data.count, code: data.code }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setStats({ totalViews, viewsByDay, deviceStats: { mobile, desktop }, countries })
    }
    setLoading(false)
  }

  const maxDayViews = Math.max(...stats.viewsByDay.map(d => d.count), 1)

  if (loading) {
    return (
      <section className="dash-card p-6 sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-100 rounded"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="dash-card p-4 sm:p-8">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Analytics</h2>
          <p className="text-xs sm:text-sm text-slate-500">Métricas da página</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
          <div className="text-2xl sm:text-3xl font-black text-sky-600">{stats.totalViews}</div>
          <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Visualizações</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{links.reduce((sum, l) => sum + (l.clicks || 0), 0)}</div>
          <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Cliques</div>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
          <div className="text-2xl sm:text-3xl font-black text-violet-600">{stats.deviceStats.mobile}</div>
          <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">📱 Mobile</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
          <div className="text-2xl sm:text-3xl font-black text-amber-600">{stats.deviceStats.desktop}</div>
          <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">🖥️ Desktop</div>
        </div>
      </div>

      {/* Views Chart */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Visualizações (7 dias)</h3>
        <div className="flex items-end gap-1 h-24">
          {stats.viewsByDay.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-sky-500 rounded-t transition-all hover:bg-sky-600"
                style={{ height: `${(day.count / maxDayViews) * 100}%`, minHeight: day.count > 0 ? '4px' : '2px' }}
              />
              <span className="text-[10px] text-slate-400 mt-1">{new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Links */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Cliques por Link</h3>
        <div className="space-y-2">
          {links.slice(0, 5).map((link) => {
            const maxClicks = Math.max(...links.map(l => l.clicks || 0), 1)
            const percentage = ((link.clicks || 0) / maxClicks) * 100
            return (
              <div key={link.id} className="flex items-center gap-3">
                <div className="w-5 h-5 flex-shrink-0">
                  <LinkIcon type={link.type} url={link.url} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-700 truncate">{link.title}</div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-600">{link.clicks || 0}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Countries */}
      {stats.countries.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3">🌍 Países</h3>
          <div className="flex flex-wrap gap-2">
            {stats.countries.map((c, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full text-sm">
                <span>{c.code === 'BR' ? '🇧🇷' : c.code === 'US' ? '🇺🇸' : c.code === 'PT' ? '🇵🇹' : '🌐'}</span>
                <span className="font-medium text-slate-700">{c.country}</span>
                <span className="text-slate-400">({c.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

// Dashboard
function Dashboard({ user, onLogout }: { user: User, onLogout: () => void }) {
  const [links, setLinks] = useState<Link[]>([])
  const [profile, setProfile] = useState<User>(user)
  const [newLink, setNewLink] = useState({ title: '', url: '', type: 'link' as const })
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showMobilePreview, setShowMobilePreview] = useState(false)

  useEffect(() => {
    fetchLinks()
  }, [])

  async function fetchLinks() {
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('position')
    if (data) setLinks(data as Link[])
  }

  async function addLink() {
    if (!newLink.title || !newLink.url) return
    setLoading(true)

    const detectedType = detectLinkType(newLink.url)

    const { data, error } = await supabase
      .from('links')
      .insert([{
        user_id: user.id,
        title: newLink.title,
        url: newLink.url,
        type: detectedType as any,
        position: links.length
      }])
      .select()

    if (!error && data) {
      setLinks([...links, data[0] as Link])
      setNewLink({ title: '', url: '', type: 'link' })
    }
    setLoading(false)
  }

  async function deleteLink(id: string) {
    if (!confirm('Deseja realmente excluir este link?')) return
    await supabase.from('links').delete().eq('id', id)
    setLinks(links.filter(l => l.id !== id))
  }

  async function updateProfile() {
    await supabase.from('profiles').update(profile).eq('id', user.id)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const updatedProfile = { ...profile, avatar_url: publicUrl }
      setProfile(updatedProfile)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    } catch (error: any) {
      alert('Erro ao subir imagem: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const themes = [
    { id: 'brand', name: 'Padrão', colors: ['#0ea5e9', '#ffffff'] },
    { id: 'dark', name: 'Premium Dark', colors: ['#0f172a', '#1e293b'] },
    { id: 'nature', name: 'Natureza', colors: ['#f0fdf4', '#10b981'] },
    { id: 'sunset', name: 'Pôr do Sol', colors: ['#fff7ed', '#f97316'] },
    { id: 'midnight', name: 'Meia-noite', colors: ['#020617', '#818cf8'] }
  ]

  const publicUrl = `${window.location.origin}/@${profile.slug}`

  function copyLink() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[var(--dash-bg)]">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">LinkFácil</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-medium transition-all group active:scale-95"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-500 animate-in zoom-in duration-300" />
                  <span className="text-emerald-600">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400 group-hover:text-sky-500" />
                  <span className="hidden sm:inline">Copiar Link</span>
                </>
              )}
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
            <button
              onClick={onLogout}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Editor Column */}
          <div className="lg:col-span-7 space-y-8 pb-20">

            {/* Profile Section */}
            <section className="dash-card p-4 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Seu Perfil</h2>
                <div className="px-2 sm:px-3 py-1 bg-sky-50 text-sky-600 text-xs font-bold rounded-full uppercase tracking-wider">
                  Básico
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="relative group flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full border-2 border-white shadow-md overflow-hidden flex items-center justify-center text-2xl sm:text-3xl">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full object-cover" />
                    ) : '👤'}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity cursor-pointer rounded-full">
                    <Palette className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
                  </label>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Sua Foto</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-1">PNG, JPG ou GIF</p>
                  <label className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer uppercase tracking-wider">
                    Alterar
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Nome de Exibição</label>
                    <input
                      type="text"
                      placeholder="Ex: João Silva"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      onBlur={updateProfile}
                      className="input-custom input-focus"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">URL Personalizada</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
                      <input
                        type="text"
                        placeholder="seu-link"
                        value={profile.slug}
                        onChange={(e) => setProfile({ ...profile, slug: e.target.value })}
                        onBlur={updateProfile}
                        className="input-custom input-focus pl-8"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Bio / Descrição Breve</label>
                  <textarea
                    placeholder="Conte um pouco sobre você ou seu negócio..."
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    onBlur={updateProfile}
                    className="input-custom input-focus min-h-[100px] resize-none"
                  />
                  <p className="text-xs text-slate-400 text-right">Mínimo 20 caracteres para melhor visualização</p>
                </div>
              </div>
            </section>

            {/* Customization Section */}
            <section className="dash-card p-4 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Personalização</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Escolha o visual</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={async () => {
                      const updated = { ...profile, theme: t.id }
                      setProfile(updated)
                      await supabase.from('profiles').update({ theme: t.id }).eq('id', user.id)
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all text-left group ${profile.theme === t.id ? 'border-sky-500 bg-sky-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                  >
                    <div className="flex gap-1 mb-3">
                      <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: t.colors[0] }} />
                      <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: t.colors[1] }} />
                    </div>
                    <span className={`text-sm font-bold ${profile.theme === t.id ? 'text-sky-700' : 'text-slate-600'}`}>{t.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Analytics Section */}
            <AnalyticsDashboard userId={user.id} links={links} />

            {/* Links Editor Section */}
            <section className="dash-card p-0 overflow-hidden">
              <div className="p-4 sm:p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Seus Links</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Gerencie seus destinos</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                  {links.length}
                </div>
              </div>

              {/* Links List */}
              <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto dash-scrollbar">
                {links.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Link2 className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-medium">Você ainda não adicionou nenhum link.</p>
                  </div>
                ) : (
                  links.map((link, idx) => {
                    // Calculate schedule status
                    const now = new Date()
                    const startDate = link.scheduled_start ? new Date(link.scheduled_start) : null
                    const endDate = link.scheduled_end ? new Date(link.scheduled_end) : null
                    const isScheduled = startDate && startDate > now
                    const isExpired = endDate && endDate < now

                    return (
                      <div key={link.id} className="p-4 sm:p-6 flex flex-col gap-3 group hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <button className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-400 transition-colors">
                            <GripVertical className="w-5 h-5" />
                          </button>

                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors overflow-hidden p-2">
                            <LinkIcon type={link.type} url={link.url} className="w-full h-full" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{idx + 1}</span>
                              <p className="font-bold text-slate-900 truncate max-w-[150px] sm:max-w-none">{link.title}</p>
                              {isScheduled && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">🕐 Agendado</span>}
                              {isExpired && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">⏰ Expirado</span>}
                            </div>
                            <p className="text-sm text-slate-500 truncate">{link.url}</p>
                          </div>

                          {/* Controls - always visible on mobile, hover on desktop */}
                          <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            {/* Highlight selector */}
                            <select
                              value={link.highlight || ''}
                              onChange={async (e) => {
                                const highlight = e.target.value || null
                                await supabase.from('links').update({ highlight }).eq('id', link.id)
                                setLinks(links.map(l => l.id === link.id ? { ...l, highlight: highlight as any } : l))
                              }}
                              className="text-xs bg-slate-100 hover:bg-slate-200 rounded-lg px-2 py-1.5 border-0 cursor-pointer transition-colors"
                              title="Animação de destaque"
                            >
                              <option value="">Sem destaque</option>
                              <option value="pulse">✨ Pulso</option>
                              <option value="shine">💫 Brilho</option>
                              <option value="shake">👀 Shake</option>
                              <option value="glow">🔵 Glow</option>
                              <option value="featured">⭐ Destaque</option>
                            </select>
                            {/* Embed toggle - only for YouTube/TikTok links */}
                            {(link.url.match(/youtube\.com|youtu\.be|tiktok\.com|instagram\.com\/p\/|instagram\.com\/reel\//) && (
                              <button
                                onClick={async () => {
                                  const is_embed = !link.is_embed
                                  await supabase.from('links').update({ is_embed }).eq('id', link.id)
                                  setLinks(links.map(l => l.id === link.id ? { ...l, is_embed } : l))
                                }}
                                className={`p-2 rounded-lg transition-all ${link.is_embed ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50'}`}
                                title={link.is_embed ? 'Exibindo como embed' : 'Exibir como embed de vídeo'}
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            ))}
                            <button
                              onClick={() => deleteLink(link.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Scheduling inputs - always visible on mobile, hover on desktop */}
                        <div className="flex sm:hidden flex-col gap-2 ml-0 mt-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 w-16">🗓️ Início:</span>
                            <input
                              type="datetime-local"
                              value={link.scheduled_start?.slice(0, 16) || ''}
                              onChange={async (e) => {
                                const scheduled_start = e.target.value ? new Date(e.target.value).toISOString() : null
                                await supabase.from('links').update({ scheduled_start }).eq('id', link.id)
                                setLinks(links.map(l => l.id === link.id ? { ...l, scheduled_start } : l))
                              }}
                              className="flex-1 bg-slate-100 rounded px-2 py-2 text-slate-600 border-0"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 w-16">⏰ Fim:</span>
                            <input
                              type="datetime-local"
                              value={link.scheduled_end?.slice(0, 16) || ''}
                              onChange={async (e) => {
                                const scheduled_end = e.target.value ? new Date(e.target.value).toISOString() : null
                                await supabase.from('links').update({ scheduled_end }).eq('id', link.id)
                                setLinks(links.map(l => l.id === link.id ? { ...l, scheduled_end } : l))
                              }}
                              className="flex-1 bg-slate-100 rounded px-2 py-2 text-slate-600 border-0"
                            />
                          </div>
                        </div>
                        {/* Desktop hover version */}
                        <div className="hidden sm:group-hover:flex items-center gap-4 ml-14 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">🗓️ Início:</span>
                            <input
                              type="datetime-local"
                              value={link.scheduled_start?.slice(0, 16) || ''}
                              onChange={async (e) => {
                                const scheduled_start = e.target.value ? new Date(e.target.value).toISOString() : null
                                await supabase.from('links').update({ scheduled_start }).eq('id', link.id)
                                setLinks(links.map(l => l.id === link.id ? { ...l, scheduled_start } : l))
                              }}
                              className="bg-slate-100 rounded px-2 py-1 text-slate-600 border-0"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">⏰ Fim:</span>
                            <input
                              type="datetime-local"
                              value={link.scheduled_end?.slice(0, 16) || ''}
                              onChange={async (e) => {
                                const scheduled_end = e.target.value ? new Date(e.target.value).toISOString() : null
                                await supabase.from('links').update({ scheduled_end }).eq('id', link.id)
                                setLinks(links.map(l => l.id === link.id ? { ...l, scheduled_end } : l))
                              }}
                              className="bg-slate-100 rounded px-2 py-1 text-slate-600 border-0"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Add New Link Form */}
              <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Novo Link</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Título (Ex: Meu WhatsApp)"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    className="input-custom input-focus py-2.5"
                  />
                  <input
                    type="text"
                    placeholder="URL (Ex: https://wa.me/...)"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="input-custom input-focus py-2.5"
                  />
                </div>
                <button
                  onClick={addLink}
                  disabled={loading || !newLink.title || !newLink.url}
                  className="w-full btn-primary py-3 rounded-xl disabled:opacity-50 disabled:grayscale"
                >
                  {loading ? 'Adicionando...' : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Adicionar à lista</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* PIX Settings */}
            <section className="dash-card p-6 sm:p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Vendas via PIX</h2>
                    <p className="text-sm text-slate-500">Receba direto na sua conta</p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ${profile.pix_enabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  onClick={() => {
                    const nextVal = !profile.pix_enabled;
                    setProfile({ ...profile, pix_enabled: nextVal });
                    supabase.from('profiles').update({ pix_enabled: nextVal }).eq('id', user.id);
                  }}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${profile.pix_enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 text-center">
                  <div className="inline-block p-1 bg-emerald-100 rounded-lg text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                    Funcionalidade Premium Ativada
                  </div>
                  <input
                    type="text"
                    placeholder="Sua chave PIX (CPF, Celular, Email ou Aleatória)"
                    value={profile.pix_key || ''}
                    onChange={(e) => setProfile({ ...profile, pix_key: e.target.value })}
                    onBlur={updateProfile}
                    className="input-custom input-focus text-center font-medium"
                  />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed text-center px-4">
                  Nós não cobramos taxas sobre suas vendas. O valor cai integralmente na conta vinculada à sua chave PIX.
                </p>
              </div>
            </section>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 h-fit hidden lg:block">
            <div className="relative">
              {/* Background Decoration */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-sky-100 rounded-full blur-3xl opacity-50 -z-10" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -z-10" />

              <div className="text-center mb-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Visualização Real</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <code className="text-xs font-bold text-slate-600">{publicUrl.replace('https://', '')}</code>
                </div>
              </div>

              <PhonePreview profile={profile} links={links} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Preview Floating Action + Modal */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowMobilePreview(true)}
          className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <Smartphone className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Preview Modal */}
      {showMobilePreview && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm">
            <button
              onClick={() => setShowMobilePreview(false)}
              className="absolute -top-12 right-0 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <PhonePreview profile={profile} links={links} />
          </div>
        </div>
      )}
    </div>
  )
}

// Phone Preview Component
function PhonePreview({ profile, links }: { profile: User, links: Link[] }) {
  return (
    <div className="bg-gray-900 rounded-[2.5rem] p-3 max-w-sm mx-auto shadow-2xl overflow-hidden" data-theme={profile.theme}>
      <div className="bg-[var(--theme-bg)] rounded-[2rem] overflow-hidden min-h-[500px] transition-colors duration-500">
        <div className="p-8 text-center bg-white/5 backdrop-blur-sm border-b border-black/5">
          <div className="w-20 h-20 bg-white shadow-xl rounded-full mx-auto mb-4 p-1">
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-100 text-3xl">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" />
              ) : '👤'}
            </div>
          </div>
          <h3 className="font-bold text-xl text-[var(--theme-text)]">{profile.name || 'Seu Nome'}</h3>
          <p className="opacity-70 text-sm mt-1 text-[var(--theme-text)]">{profile.bio || 'Sua bio aqui'}</p>
        </div>

        <div className="p-4 space-y-3">
          {links.filter(l => l.active).map((link) => {
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full bg-[var(--theme-card-bg)] hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md text-[var(--theme-text)] py-3.5 px-6 rounded-xl font-medium transition-all duration-200"
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <LinkIcon type={link.type} url={link.url} className="w-full h-full" />
                </div>
                <span className="flex-1 text-center pr-5">{link.title}</span>
              </a>
            )
          })}

          {profile.pix_enabled && profile.pix_key && (
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              Pagar com PIX
            </button>
          )}

          {links.length === 0 && (
            <p className="text-center text-gray-400 py-8">Adicione seus links!</p>
          )}
        </div>

        <div className="p-4 text-center">
          <p className="text-xs text-gray-400">feito com LinkFácil</p>
        </div>
      </div>
    </div>
  )
}

// PIX Payment Modal
function PixModal({
  isOpen,
  onClose,
  pixKey,
  merchantName
}: {
  isOpen: boolean
  onClose: () => void
  pixKey: string
  merchantName: string
}) {
  const [amount, setAmount] = useState('')
  const [pixCode, setPixCode] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen && pixKey) {
      generatePix()
    }
  }, [isOpen, pixKey])

  function generatePix() {
    const payload = generatePixPayload({
      key: pixKey,
      amount: amount ? parseFloat(amount) : undefined,
      merchantName: merchantName,
      merchantCity: 'BRASIL'
    })
    setPixCode(payload)
    setQrUrl(getPixQrCodeUrl(payload))
  }

  function copyPixCode() {
    navigator.clipboard.writeText(pixCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">Pagar com PIX</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (opcional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={generatePix}
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all"
          >
            Gerar QR Code
          </button>

          {qrUrl && (
            <div className="text-center">
              <img src={qrUrl} alt="PIX QR Code" className="mx-auto w-64 h-64" />
              <p className="text-sm text-gray-500 mt-2">Escaneie com seu banco</p>
            </div>
          )}

          {pixCode && (
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">Ou copie o código:</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-white p-2 rounded text-xs break-all">{pixCode}</code>
                <button
                  onClick={copyPixCode}
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Public Page (for viewing profiles)
function PublicPage({ slug }: { slug: string }) {
  const [profile, setProfile] = useState<User | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [pixModalOpen, setPixModalOpen] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .single()

      if (profileData) {
        setProfile(profileData as User)

        const { data: linksData } = await supabase
          .from('links')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('active', true)
          .order('position')

        if (linksData) setLinks(linksData as Link[])

        // Enhanced tracking with device and location
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        const deviceType = isMobile ? 'mobile' : 'desktop'

        // Get location data (non-blocking)
        let country = null, city = null, countryCode = null
        try {
          const geoRes = await fetch('https://ipapi.co/json/')
          if (geoRes.ok) {
            const geoData = await geoRes.json()
            country = geoData.country_name
            city = geoData.city
            countryCode = geoData.country_code
          }
        } catch (e) { /* silently fail */ }

        await supabase.from('page_views').insert([{
          user_id: profileData.id,
          device_type: deviceType,
          country,
          city,
          country_code: countryCode,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        }])
      }
      setLoading(false)
    }
    fetchProfile()
  }, [slug])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Página não encontrada</div>

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] transition-colors duration-500" data-theme={profile.theme}>
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white shadow-xl rounded-full mx-auto mb-4 p-1">
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-100 text-4xl">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" />
              ) : '👤'}
            </div>
          </div>
          <h1 className="text-2xl font-black text-[var(--theme-text)]">{profile.name}</h1>
          <p className="opacity-70 mt-2 text-[var(--theme-text)]">{profile.bio}</p>
        </div>

        <div className="space-y-3">
          {links.map((link) => {
            // Check if link is within scheduled period
            const now = new Date()
            const startDate = link.scheduled_start ? new Date(link.scheduled_start) : null
            const endDate = link.scheduled_end ? new Date(link.scheduled_end) : null
            const isScheduled = startDate && startDate > now
            const isExpired = endDate && endDate < now

            // Skip rendering if outside schedule
            if (isScheduled || isExpired) return null

            const handleLinkClick = async () => {
              // Track individual link click
              const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
              await supabase.from('link_clicks').insert([{
                link_id: link.id,
                user_id: profile!.id,
                device_type: isMobile ? 'mobile' : 'desktop',
                user_agent: navigator.userAgent,
                referrer: document.referrer || null
              }])
              // Also increment the simple counter
              await supabase.rpc('increment_link_clicks', { link_id: link.id })
            }

            // Render as embed if is_embed is true
            if (link.is_embed) {
              return (
                <div key={link.id} className="w-full" onClick={handleLinkClick}>
                  {link.title && <p className="text-sm font-medium text-[var(--theme-text)] opacity-70 mb-2 text-center">{link.title}</p>}
                  <SocialEmbed url={link.url} embedHtml={link.embed_html} />
                </div>
              )
            }

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 w-full bg-[var(--theme-card-bg)] shadow-md hover:shadow-lg text-[var(--theme-text)] py-4 px-6 rounded-2xl font-medium transition-all ${link.highlight ? `link-${link.highlight}` : ''}`}
              >
                <div className="w-6 h-6 flex-shrink-0">
                  <LinkIcon type={link.type} url={link.url} className="w-full h-full" />
                </div>
                <span className="flex-1 text-center pr-6">{link.title}</span>
              </a>
            )
          })}

          {profile.pix_enabled && profile.pix_key && (
            <button
              onClick={() => setPixModalOpen(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Pagar com PIX
            </button>
          )}
        </div>

        <div className="mt-12 text-center">
          <a href="/" className="text-sm text-gray-400 hover:text-brand-600">Criar minha página com LinkFácil</a>
        </div>

        <PixModal
          isOpen={pixModalOpen}
          onClose={() => setPixModalOpen(false)}
          pixKey={profile.pix_key || ''}
          merchantName={profile.name}
        />
      </div>
    </div>
  )
}

// Main App
function App() {
  const [page, setPage] = useState<'landing' | 'auth' | 'dashboard'>('landing')
  const { user, loading } = useAuth()
  const [publicSlug, setPublicSlug] = useState<string | null>(null)

  // Check URL for public profile
  useEffect(() => {
    const path = window.location.pathname
    if (path.startsWith('/@')) {
      setPublicSlug(path.slice(2))
    }
  }, [])

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (user && page === 'landing') {
      setPage('dashboard')
    }
  }, [user])

  if (publicSlug) {
    return <PublicPage slug={publicSlug} />
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen">
      {page === 'landing' && <LandingPage onStart={() => setPage('auth')} />}
      {page === 'auth' && <AuthPage onAuth={() => setPage('dashboard')} />}
      {page === 'dashboard' && (
        user ? (
          <Dashboard
            user={user}
            onLogout={() => {
              supabase.auth.signOut()
              setPage('landing')
            }}
          />
        ) : (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Perfil não encontrado</h2>
            <p className="text-gray-600 mb-8">Não conseguimos encontrar os dados do seu perfil. Tente recarregar a página ou fazer login novamente.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold"
            >
              Recarregar Página
            </button>
            <button
              onClick={() => {
                supabase.auth.signOut()
                setPage('landing')
              }}
              className="mt-4 text-brand-600 font-medium"
            >
              Sair e tentar novamente
            </button>
          </div>
        )
      )}
    </div>
  )
}

export default App

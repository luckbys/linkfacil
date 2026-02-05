import { useState, useEffect } from 'react'
import './index.css'
import { supabase, User, Link } from './lib/supabase'
import { generatePixPayload, getPixQrCodeUrl, isValidPixKey, formatPixKey } from './lib/pix'
import { 
  Link2, Share2, CreditCard, Smartphone, Palette, 
  ChevronRight, Check, LogIn, UserPlus, LogOut, Eye, EyeOff,
  Trash2, GripVertical, Plus, ExternalLink, Copy, CheckCircle, X
} from 'lucide-react'

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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (data) {
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
    <div className="min-h-screen bg-white">
      {/* Sticky Nav */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">LinkFácil</span>
          </div>
          <button 
            onClick={onStart} 
            className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all"
          >
            Criar Página Grátis
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-brand-50 via-white to-brand-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium text-sm mb-8">
            <span>🎉 Oferta de Lançamento: 50% OFF no primeiro mês!</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-6">
            Crie Sua Página de Links<br />
            <span className="text-brand-600">em 2 Minutos</span> ⏱️
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Com <strong>WhatsApp integrado</strong>, <strong>pagamentos via PIX</strong> e <strong>design brasileiro</strong>.
            <br className="hidden md:block" />
            Muito mais barato que o Linktree!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button 
              onClick={onStart} 
              className="bg-brand-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-brand-700 hover:scale-105 transition-all shadow-2xl shadow-brand-500/30 flex items-center justify-center gap-2"
            >
              Começar Gratuitamente
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-500">
            ✅ Sem cartão de crédito <span className="mx-2">•</span> 
            ✅ Setup em 2 minutos <span className="mx-2">•</span> 
            ✅ Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Comparison Bar */}
      <section className="py-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-lg">
            <span className="text-gray-400">Linktree cobra:</span> <span className="line-through">R$ 45/mês</span>
            <span className="mx-4">|</span>
            <span className="text-brand-400 font-bold">LinkFácil: R$ 9,90/mês</span>
            <span className="mx-4">|</span>
            <span className="text-green-400">Economize 78%! 💰</span>
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center text-gray-900 mb-4">
            Por que escolher o LinkFácil?
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Tudo que você precisa para vender mais e organizar seus links
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-brand-600" />
                </div>
                <p className="font-medium text-gray-900">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center text-gray-900 mb-4">O que você recebe</h2>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Funcionalidades pensadas para quem vende no Brasil
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center text-gray-900 mb-12">
            O que dizem nossos usuários
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <p className="text-gray-700 mb-6 text-lg">"{t.text}"</p>
                <div>
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center text-gray-900 mb-4">Preço Simples</h2>
          <p className="text-xl text-gray-600 text-center mb-12">Sem complicação, sem surpresas</p>

          <div className="bg-white rounded-3xl shadow-2xl p-10 text-center border-4 border-brand-500">
            <div className="text-sm text-brand-600 font-bold uppercase tracking-wide mb-4">Plano Pro</div>
            <div className="flex items-baseline justify-center gap-2 mb-6">
              <span className="text-gray-400 line-through text-2xl">R$ 19,90</span>
              <span className="text-6xl font-black text-gray-900">R$ 9,90</span>
              <span className="text-gray-500">/mês</span>
            </div>

            <ul className="space-y-4 text-left max-w-md mx-auto mb-8">
              {['Links ilimitados', 'PIX integrado', 'WhatsApp button', 'Estatísticas', 'Temas premium', 'Suporte por email'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={onStart}
              className="w-full bg-brand-600 text-white py-4 rounded-xl font-black text-xl hover:bg-brand-700 transition-all"
            >
              Começar Agora
            </button>

            <p className="text-sm text-gray-500 mt-4">7 dias de garantia • Cancele quando quiser</p>
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
      <section className="py-20 bg-brand-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-brand-100 mb-8">
            Crie sua página de links em menos de 2 minutos
          </p>
          <button 
            onClick={onStart}
            className="bg-white text-brand-600 px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl"
          >
            Criar Página Grátis →
          </button>
          <p className="text-brand-200 mt-6">
            ⏰ Oferta de lançamento: 50% OFF no primeiro mês
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400 text-center">
        <p>© 2026 LinkFácil. Feito com ❤️ no Brasil 🇧🇷</p>
      </footer>
    </div>
  )
}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button onClick={onStart} className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-brand-700 hover:scale-105 transition-all shadow-xl shadow-brand-500/30">
            Começar Grátis
          </button>
        </div>

        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
          <span className="text-2xl">R$ 9,90</span>
          <span className="text-sm">/mês</span>
          <span className="bg-green-200 px-2 py-1 rounded text-xs">vs R$ 45 do Linktree</span>
        </div>
      </section>

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
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
      onAuth()
    } catch (err: any) {
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

// Dashboard
function Dashboard({ user, onLogout }: { user: User, onLogout: () => void }) {
  const [links, setLinks] = useState<Link[]>([])
  const [profile, setProfile] = useState<User>(user)
  const [newLink, setNewLink] = useState({ title: '', url: '', type: 'link' as const })
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

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
    
    const { data, error } = await supabase
      .from('links')
      .insert([{
        user_id: user.id,
        title: newLink.title,
        url: newLink.url,
        type: newLink.type,
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
    await supabase.from('links').delete().eq('id', id)
    setLinks(links.filter(l => l.id !== id))
  }

  async function updateProfile() {
    await supabase.from('profiles').update(profile).eq('id', user.id)
  }

  const publicUrl = `${window.location.origin}/@${profile.slug}`

  function copyLink() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black">LinkFácil</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={copyLink} className="flex items-center gap-2 text-gray-600 hover:text-brand-600">
              {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
            <button onClick={onLogout} className="text-gray-500 hover:text-gray-700">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="space-y-6">
          {/* Profile */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Seu Perfil</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                onBlur={updateProfile}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <input
                type="text"
                placeholder="/@seu-link"
                value={profile.slug}
                onChange={(e) => setProfile({...profile, slug: e.target.value})}
                onBlur={updateProfile}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <textarea
                placeholder="Bio"
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                onBlur={updateProfile}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                rows={2}
              />
            </div>
          </div>

          {/* Links */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Seus Links ({links.length})</h2>
            
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {links.map((link, idx) => (
                <div key={link.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{link.title}</p>
                    <p className="text-xs text-gray-500 truncate">{link.url}</p>
                  </div>
                  <button onClick={() => deleteLink(link.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <input
                type="text"
                placeholder="Título"
                value={newLink.title}
                onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <input
                type="text"
                placeholder="URL"
                value={newLink.url}
                onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <button
                onClick={addLink}
                disabled={loading}
                className="w-full bg-brand-600 text-white py-2 rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar Link
              </button>
            </div>
          </div>

          {/* PIX */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Configuração PIX</h2>
            <input
              type="text"
              placeholder="Chave PIX (CPF, CNPJ, Email ou Celular)"
              value={profile.pix_key || ''}
              onChange={(e) => setProfile({...profile, pix_key: e.target.value})}
              onBlur={updateProfile}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={profile.pix_enabled}
                onChange={(e) => setProfile({...profile, pix_enabled: e.target.checked})}
                onBlur={updateProfile}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">Mostrar botão PIX na página</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-8 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Preview</h2>
          <PhonePreview profile={profile} links={links} />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Sua URL:</p>
            <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm">{publicUrl}</code>
          </div>
        </div>
      </div>
    </div>
  )
}

// Phone Preview Component
function PhonePreview({ profile, links }: { profile: User, links: Link[] }) {
  return (
    <div className="bg-gray-900 rounded-[2.5rem] p-3 max-w-sm mx-auto">
      <div className="bg-white rounded-[2rem] overflow-hidden min-h-[500px]">
        <div className="bg-brand-600 text-white p-6 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
            👤
          </div>
          <h3 className="font-bold text-xl">{profile.name || 'Seu Nome'}</h3>
          <p className="text-brand-100 text-sm mt-1">{profile.bio || 'Sua bio aqui'}</p>
        </div>
        
        <div className="p-4 space-y-3">
          {links.filter(l => l.active).map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-4 px-6 rounded-xl font-medium text-center transition-all"
            >
              {link.title}
            </a>
          ))}
          
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
        
        // Track view
        await supabase.from('page_views').insert([{ user_id: profileData.id }])
      }
      setLoading(false)
    }
    fetchProfile()
  }, [slug])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Página não encontrada</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-brand-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" /> : '👤'}
          </div>
          <h1 className="text-2xl font-black text-gray-900">{profile.name}</h1>
          <p className="text-gray-600 mt-2">{profile.bio}</p>
        </div>

        <div className="space-y-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white shadow-md hover:shadow-lg text-gray-900 py-4 px-6 rounded-2xl font-medium text-center transition-all"
            >
              {link.title}
            </a>
          ))}
          
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
    <div>
      {page === 'landing' && <LandingPage onStart={() => setPage('auth')} />}
      {page === 'auth' && <AuthPage onAuth={() => setPage('dashboard')} />}
      {page === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onLogout={() => {
            supabase.auth.signOut()
            setPage('landing')
          }} 
        />
      )}
    </div>
  )
}

export default App

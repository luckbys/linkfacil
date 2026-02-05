import { useState } from 'react'
import './index.css'
import { Link2, Share2, CreditCard, Smartphone, Palette, ChevronRight, Check } from 'lucide-react'

// Landing Page Component
function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
      {/* Header */}
      <nav className="px-6 py-4 flex justify-between items-center">
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
          Criar Minha Página
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-6">
          Seus links em uma<br />
          <span className="text-brand-600">página linda</span> 🎨
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Crie sua página de links com WhatsApp, PIX e design brasileiro. 
          Muito mais barato que o Linktree e sem complicação!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button 
            onClick={onStart}
            className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-brand-700 hover:scale-105 transition-all shadow-xl shadow-brand-500/30"
          >
            Começar Grátis
          </button>
          <button className="bg-white text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-gray-200 hover:border-brand-300 transition-all">
            Ver Exemplo
          </button>
        </div>

        {/* Price Badge */}
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
          <span className="text-2xl">R$ 9,90</span>
          <span className="text-sm">/mês</span>
          <span className="bg-green-200 px-2 py-1 rounded text-xs">vs R$ 45 do Linktree</span>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-black text-center text-gray-900 mb-16">
          Tudo que você precisa
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
              <CreditCard className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">PIX na Página</h3>
            <p className="text-gray-600">
              Receba pagamentos direto na sua página de links. Seu cliente vê o valor e paga na hora!
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Smartphone className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">WhatsApp Integrado</h3>
            <p className="text-gray-600">
              Botão de WhatsApp com mensagem personalizada. Seu cliente clica e já te chama!
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <Palette className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Temas Brasileiros</h3>
            <p className="text-gray-600">
              Cores e estilos que combinam com o Brasil. Carnaval, futebol, praia e muito mais!
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-brand-600 rounded-[3rem] p-12 text-white">
          <h2 className="text-4xl font-black mb-6">
            Pronto para começar?
          </h2>
          <p className="text-brand-100 text-xl mb-8">
            Crie sua página de links em menos de 2 minutos
          </p>
          <button 
            onClick={onStart}
            className="bg-white text-brand-600 px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all"
          >
            Criar Página Grátis →
          </button>
        </div>
      </section>
    </div>
  )
}

// Dashboard Component
function Dashboard() {
  const [links, setLinks] = useState([
    { id: 1, title: 'WhatsApp', url: 'https://wa.me/5511999999999', type: 'whatsapp' },
    { id: 2, title: 'Instagram', url: 'https://instagram.com/seuperfil', type: 'social' },
  ])
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const [pixKey, setPixKey] = useState('')
  const [profile, setProfile] = useState({
    name: 'Seu Nome',
    bio: 'Sua descrição aqui',
    color: 'brand'
  })

  const addLink = () => {
    if (newLink.title && newLink.url) {
      setLinks([...links, { ...newLink, id: Date.now(), type: 'link' }])
      setNewLink({ title: '', url: '' })
    }
  }

  const publicUrl = `https://linkfacil.app/@${profile.name.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black">LinkFácil</span>
          </div>
          <button className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold">
            Publicar
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="space-y-6">
          {/* Profile */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Seu Perfil</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input 
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea 
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Seus Links</h2>
            <div className="space-y-3 mb-4">
              {links.map((link) => (
                <div key={link.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{link.title}</p>
                    <p className="text-sm text-gray-500 truncate">{link.url}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <input 
                type="text"
                placeholder="Título do link"
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
                className="w-full bg-brand-600 text-white py-2 rounded-xl font-bold hover:bg-brand-700 transition-all"
              >
                Adicionar Link
              </button>
            </div>
          </div>

          {/* PIX */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Configuração PIX</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sua Chave PIX</label>
              <input 
                type="text"
                placeholder="CPF, CNPJ, Email ou Celular"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                Seus clientes poderão te pagar direto na página!
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-8 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Preview da Página</h2>
          <div className="bg-gray-900 rounded-[2.5rem] p-4 max-w-sm mx-auto">
            <div className="bg-white rounded-[2rem] overflow-hidden min-h-[600px]">
              {/* Phone Header */}
              <div className="bg-brand-600 text-white p-6 text-center">
                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">👤</span>
                </div>
                <h3 className="font-bold text-xl">{profile.name}</h3>
                <p className="text-brand-100 text-sm mt-1">{profile.bio}</p>
              </div>
              
              {/* Links */}
              <div className="p-4 space-y-3">
                {links.map((link) => (
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
                
                {pixKey && (
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2">
                    <span>Pagar com PIX</span>
                  </button>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-4 text-center">
                <p className="text-xs text-gray-400">feito com LinkFácil</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Sua URL:</p>
            <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm">{publicUrl}</code>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main App
function App() {
  const [page, setPage] = useState<'landing' | 'dashboard'>('landing')

  return (
    <div>
      {page === 'landing' ? (
        <LandingPage onStart={() => setPage('dashboard')} />
      ) : (
        <Dashboard />
      )}
    </div>
  )
}

export default App

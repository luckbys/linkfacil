# 📦 EtiquetaFácil - Micro SaaS de Geração de Etiquetas

## 🎯 Visão do Produto

**EtiquetaFácil** é um Micro SaaS que automatiza a geração de etiquetas de envio para vendedores de marketplace (Shopee, Mercado Livre, TikTok Shop, etc.)

**Problema:** Vendedores perdem tempo manualmente copiando endereços, formatando etiquetas, organizando por transportadora.

**Solução:** Importa pedidos automaticamente, gera etiquetas em lote, organiza por transportadora, imprime com 1 clique.

---

## ✨ Funcionalidades MVP

### Core Features:

| Feature | Descrição | Prioridade |
|---------|-----------|------------|
| **Integração ML** | Importa pedidos do Mercado Livre | P0 |
| **Integração Shopee** | Importa pedidos da Shopee | P0 |
| **Geração PDF** | Gera etiquetas em PDF (A4, 10x15cm) | P0 |
| **Múltiplas Transportadoras** | Correios, Loggi, Jadlog, Azul | P0 |
| **Lote/Batch** | Gera 100 etiquetas de uma vez | P0 |
| **Dashboard** | Visualiza pedidos pendentes | P1 |
| **Histórico** | Busca etiquetas antigas | P1 |
| **API Webhook** | Recebe novos pedidos em tempo real | P2 |

---

## 🏗️ Estrutura Técnica

### Stack Tecnológico:

```
Frontend: Next.js 14 + TypeScript + Tailwind CSS
Backend: Node.js + Express + TypeScript
Database: PostgreSQL (Supabase)
Storage: AWS S3 / Supabase Storage (PDFs)
PDF Generation: Puppeteer / PDFKit
Auth: Supabase Auth
Deploy: Vercel (frontend) + Railway/Render (backend)
```

### Arquitetura:

```
┌─────────────────┐
│   Next.js App   │ ◄── Dashboard, Upload, Visualização
│   (Vercel)      │
└────────┬────────┘
         │ API REST
┌────────▼────────┐
│  Node.js API    │ ◄── Integrações ML/Shopee, Geração PDF
│  (Railway)      │
└────────┬────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │ ◄── Pedidos, Clientes, Configurações
│   (Supabase)    │
└────────┬────────┘
         │
┌────────▼────────┐
│   S3 Storage    │ ◄── PDFs gerados
│   (AWS/Supabase)│
└─────────────────┘
```

### Database Schema:

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan TEXT DEFAULT 'free', -- free, starter, pro
  created_at TIMESTAMP DEFAULT NOW()
);

-- Marketplaces Integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  platform TEXT NOT NULL, -- 'mercadolivre', 'shopee', 'tiktok'
  access_token TEXT,
  refresh_token TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  platform TEXT NOT NULL,
  platform_order_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, printed, shipped
  
  -- Customer Info
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  
  -- Shipping Address
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zipcode TEXT,
  
  -- Shipping Info
  shipping_method TEXT, -- 'correios', 'loggi', 'jadlog'
  tracking_code TEXT,
  
  -- Products (JSON)
  products JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  printed_at TIMESTAMP,
  
  UNIQUE(user_id, platform, platform_order_id)
);

-- Labels (PDFs generated)
CREATE TABLE labels (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  pdf_url TEXT NOT NULL,
  format TEXT DEFAULT '10x15', -- '10x15', 'A4'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 💰 Modelo de Negócio

### Planos:

```
┌─────────────────────────────────────────────────────────┐
│  GRATUITO                                               │
│  R$ 0/mês                                               │
│  • 10 etiquetas/mês                                     │
│  • 1 integração                                         │
│  • Formato 10x15cm                                      │
│  • Correios apenas                                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  STARTER ⭐ (MAIS POPULAR)                              │
│  R$ 19,90/mês                                           │
│  • 100 etiquetas/mês                                    │
│  • Integrações ilimitadas                               │
│  • Formatos: 10x15cm, A4                                │
│  • Todas transportadoras                                │
│  • Lote: até 50 pedidos                                 │
│  • Histórico 30 dias                                    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  PRO                                                    │
│  R$ 49,90/mês                                           │
│  • Etiquetas ILIMITADAS                                 │
│  • TUDO do Starter +                                    │
│  • Lote: ilimitado                                      │
│  • Histórico 1 ano                                      │
│  • API/Webhook                                          │
│  • Múltiplos usuários (até 3)                           │
│  • Suporte prioritário                                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  ENTERPRISE                                             │
│  R$ 149,90/mês                                          │
│  • TUDO do Pro +                                        │
│  • Usuários ilimitados                                  │
│  • API dedicada                                         │
│  • Onboarding personalizado                             │
│  • SLA de suporte                                       │
└─────────────────────────────────────────────────────────┘
```

### Modelo Pay-Per-Use (Alternativa):

| Pacote | Preço | Etiquetas | Válido |
|--------|-------|-----------|--------|
| 20 etiquetas | R$ 9,90 | 20 | 30 dias |
| 50 etiquetas | R$ 19,90 | 50 | 30 dias |
| 100 etiquetas | R$ 29,90 | 100 | 30 dias |

---

## 📊 Projeção Financeira

### Métricas de Mercado:

| Dado | Valor | Fonte |
|------|-------|-------|
| Vendedores ML Brasil | 2.5 milhões | ML 2024 |
| Vendedores Shopee Brasil | 1.8 milhões | Shopee 2024 |
| Vendedores ativos (>10 vendas/mês) | ~500.000 | Estimativa |
| Ticket médio etiqueta (serviço atual) | R$ 0,50-1,00 | Mercado |

### Cenário Realista (12 meses):

| Mês | Novos Users | Total Users | Conversão Pro | Receita Mensal |
|-----|-------------|-------------|---------------|----------------|
| 1 | 100 | 100 | 2% | R$ 398 |
| 3 | 300 | 700 | 3% | R$ 2.093 |
| 6 | 500 | 2.000 | 4% | R$ 5.980 |
| 9 | 800 | 4.500 | 5% | R$ 13.455 |
| 12 | 1.000 | 8.000 | 6% | R$ 23.880 |

**Ano 1:**
- MRR Final: **R$ 23.880**
- ARR: **R$ 286.560**
- Valuation (10x): **R$ 2.8 milhões**

---

## 🛠️ Plano de Desenvolvimento (MVP em 14 dias)

### Semana 1: Fundação

#### Dia 1-2: Setup
- [ ] Criar repositório GitHub
- [ ] Setup Next.js + Tailwind
- [ ] Setup Supabase (DB + Auth)
- [ ] Setup estrutura de pastas
- [ ] Configurar deploy Vercel

#### Dia 3-4: Autenticação
- [ ] Login/cadastro com email
- [ ] Dashboard básico
- [ ] Configuração de perfil

#### Dia 5-7: Integrações
- [ ] API Mercado Livre (OAuth)
- [ ] Buscar pedidos pendentes
- [ ] Salvar no banco de dados

### Semana 2: Core Features

#### Dia 8-10: Geração de Etiquetas
- [ ] Template de etiqueta (HTML/CSS)
- [ ] Geração PDF com Puppeteer
- [ ] Download individual
- [ ] Preview no browser

#### Dia 11-12: Lote/Batch
- [ ] Seleção múltipla de pedidos
- [ ] Geração em lote (PDF único)
- [ ] Organização por transportadora

#### Dia 13-14: Pagamentos & Polish
- [ ] Integração Stripe/Mercado Pago
- [ ] Limites do plano Free
- [ ] Landing page básica
- [ ] Testes e correções

---

## 🎨 UI/UX Wireframes

### Dashboard Principal:

```
┌──────────────────────────────────────────────────────┐
│  EtiquetaFácil                      [Perfil] [Sair]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📦 Pedidos Pendentes (45)                           │
│                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │ Mercado     │ │ Shopee      │ │ TikTok      │    │
│  │ Livre       │ │ Shop        │ │ Shop        │    │
│  │ 20 pedidos  │ │ 18 pedidos  │ │ 7 pedidos   │    │
│  │ [Importar]  │ │ [Importar]  │ │ [Importar]  │    │
│  └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ Pedidos Recentes                    [+ Novos]  │  │
│  │                                                │  │
│  │ ☑️ [#12345] Ana Silva - São Paulo              │  │
│  │    Correios PAC - R$ 15,90                   │  │
│  │                                                │  │
│  │ ☑️ [#12346] Carlos Mendes - Rio de Janeiro     │  │
│  │    Loggi - R$ 12,50                          │  │
│  │                                                │  │
│  │ ☑️ [#12347] Maria Costa - Belo Horizonte       │  │
│  │    Correios SEDEX - R$ 22,90                 │  │
│  │                                                │  │
│  │ [Selecionar Todos]  [Gerar Etiquetas (3)]     │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Tela de Geração:

```
┌──────────────────────────────────────────────────────┐
│  Gerar Etiquetas                                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📋 15 pedidos selecionados                          │
│                                                      │
│  Formato:  ○ 10x15cm  ● A4 (4 etiquetas/página)     │
│                                                      │
│  Agrupar por:                                        │
│  ☑️ Correios (8)                                     │
│  ☑️ Loggi (4)                                        │
│  ☑️ Jadlog (3)                                       │
│                                                      │
│  Incluir:                                            │
│  ☑️ Código de barras                                 │
│  ☑️ Logo da loja                                     │
│  ☑️ Observações do cliente                           │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │         [  🖨️  GERAR ETIQUETAS  ]              │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📱 Estratégia de Lançamento

### Fase 1: Beta Fechado (Semana 1-2)
**Meta:** 20 vendedores beta

**Como recrutar:**
- Grupos de Facebook: "Vendedores Shopee", "Mercado Livre Brasil"
- Instagram: DM para perfis de dropshipping
- WhatsApp: Compartilhar em grupos de vendedores

**Oferta Beta:**
```
🎉 BETA ETIQUETAFÁCIL

Teste GRÁTIS por 30 dias:
✅ Etiquetas ilimitadas
✅ Todas integrações
✅ Suporte direto

Em troca, damos:
✅ 50% OFF vitalício no plano Pro
✅ Seu feedback molda o produto

Vagas: 20

[QUERO PARTICIPAR]
```

### Fase 2: Lançamento Público (Semana 3-4)

**Canais:**
- YouTube: Tutorial "Como gerar etiquetas em 1 clique"
- TikTok: Vídeos rápidos mostrando before/after
- Instagram: Stories de vendedores usando
- Grupos WhatsApp/Telegram de dropshipping

**Oferta de Lançamento:**
```
🚀 ETIQUETAFÁCIL ESTÁ NO AR!

Oferta especial de lançamento:
Plano Starter por R$ 9,90/mês
(em vez de R$ 19,90)

✅ 100 etiquetas/mês
✅ Todas integrações
✅ Todas transportadoras

⚠️ Só para os 50 primeiros
⏰ Acaba em 72h

[COMEÇAR GRÁTIS]
```

### Fase 3: Crescimento (Mês 2-3)

**Estratégias:**
1. **Indicação:** "Indique um amigo, ganhe 1 mês Pro"
2. **Conteúdo:** 2 vídeos/semana sobre logística
3. **Parcerias:** Influencers de dropshipping (comissão 30%)
4. **SEO:** "Como gerar etiqueta Mercado Livre", "Etiqueta Shopee"

---

## 🏆 Diferenciais Competitivos

| Feature | EtiquetaFácil | Concorrência |
|---------|---------------|--------------|
| **Preço** | R$ 0,20/etiqueta | R$ 0,50-1,00 |
| **Integração ML** | ✅ Nativa | ❌ Manual |
| **Integração Shopee** | ✅ Nativa | ❌ Manual |
| **Lote** | ✅ 100+ pedidos | ⚠️ 10-20 |
| **API** | ✅ Disponível | ❌ Não |
| **Multi-user** | ✅ Plano Pro | ❌ Não |

---

## 📈 KPIs de Sucesso

| Métrica | Meta Mês 1 | Meta Mês 3 | Meta Mês 6 |
|---------|------------|------------|------------|
| **Usuários cadastrados** | 200 | 1.000 | 3.000 |
| **Usuários ativos/mês** | 100 | 500 | 1.500 |
| **Taxa conversão Free→Pro** | 3% | 5% | 7% |
| **Etiquetas geradas/mês** | 1.000 | 10.000 | 50.000 |
| **Churn** | <10% | <8% | <5% |
| **NPS** | >40 | >50 | >60 |

---

## 💡 Oportunidades Futuras (Roadmap)

### Mês 3-6:
- [ ] App mobile (PWA)
- [ ] Integração com TikTok Shop
- [ ] Rastreamento automático
- [ ] Notificações de entrega

### Mês 6-12:
- [ ] Integração com ERPs (Tiny, Bling)
- [ ] Calculadora de frete em massa
- [ ] Sugestão de melhor transportadora
- [ ] Relatório de custos de envio

### Ano 2:
- [ ] Negociação de fretes (desconto em massa)
- [ ] White label para logísticas
- [ ] Expansão LATAM (MX, AR, CL)

---

## 🎯 Resumo Executivo

**Produto:** EtiquetaFácil - Geração automática de etiquetas para vendedores de marketplace

**Problema:** Vendedores perdem 2-3h/dia gerando etiquetas manualmente

**Solução:** SaaS que integra ML/Shopee, gera etiquetas em lote, organiza por transportadora

**Modelo:** Freemium (R$ 0 → R$ 19,90 → R$ 49,90)

**Meta Ano 1:**
- 8.000 usuários
- R$ 23.880 MRR
- R$ 286.560 ARR

**Investimento para MVP:** R$ 0 (só tempo de desenvolvimento)

**Tempo para MVP:** 14 dias

---

**Quer que eu comece a desenvolver o código do EtiquetaFácil?** Posso criar a estrutura completa! 🚀

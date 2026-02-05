# LinkFácil 🚀

Micro SaaS de páginas de links para o mercado brasileiro. Concorrente direto do Linktree, mas com **PIX integrado**, **temas brasileiros** e **preço acessível**.

## 💰 Modelo de Negócio

- **Preço**: R$ 9,90/mês (vs R$ 45 do Linktree)
- **Público-alvo**: Criadores de conteúdo, pequenos negócios, profissionais liberais
- **Diferenciais**: 
  - Pagamento via PIX direto na página
  - Botão de WhatsApp integrado
  - Interface em português
  - Temas com identidade brasileira

## ✨ Funcionalidades

### MVP (Pronto)
- ✅ Landing page conversiva
- ✅ Autenticação (email/senha)
- ✅ Dashboard para gerenciar links
- ✅ Preview em tempo real (visualização mobile)
- ✅ QR Code PIX dinâmico
- ✅ Páginas públicas por slug (`/@username`)
- ✅ Analytics básico (contagem de views)

### Roadmap
- [ ] Temas customizáveis (Carnaval, Futebol, Praia)
- [ ] Upload de foto de perfil
- [ ] Estatísticas detalhadas (cliques, geolocalização)
- [ ] Integração com Mercado Pago/Stripe
- [ ] Planos: Gratuito (limitado) e Pro (R$ 9,90)
- [ ] Domínio personalizado
- [ ] API para desenvolvedores

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **Backend/Auth**: Supabase (PostgreSQL + Auth)
- **PIX**: Implementação própria (EMV QR Code)
- **Deploy**: Vercel/Netlify (recomendado)

## 🚀 Como Rodar

### 1. Clone o repositório
```bash
git clone https://github.com/luckbys/linkfacil.git
cd linkfacil
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase
```

### 4. Configure o Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrations em `supabase/migrations/001_initial_schema.sql`
3. Copie as credenciais para o `.env.local`

### 5. Rode localmente
```bash
npm run dev
```

Acesse: http://localhost:5173

## 📁 Estrutura do Projeto

```
linkfacil/
├── src/
│   ├── App.tsx              # Componente principal
│   ├── index.css            # Estilos Tailwind
│   ├── lib/
│   │   ├── supabase.ts      # Cliente Supabase + tipos
│   │   └── pix.ts           # Gerador de QR Code PIX
│   └── main.tsx
├── supabase/
│   └── migrations/          # SQL do banco de dados
├── .env.example             # Template de variáveis
└── package.json
```

## 🎯 Como Funciona o PIX

O LinkFácil gera **QR Codes estáticos** seguindo o padrão EMV do Banco Central:

1. Usuário cadastra sua chave PIX (CPF, CNPJ, email, celular)
2. Visitante clica em "Pagar com PIX"
3. Sistema gera QR Code + código copia-e-cola
4. Visitante escaneia ou copia o código no app do banco
5. **Pagamento vai direto para a conta do usuário**

*Sem intermediários, sem taxas extras!*

## 📊 Estratégia de Crescimento

### Fase 1: Validação (Semana 1-2)
- Landing page + lista de espera
- Postar em grupos de Facebook (autônomos, pequenos negócios)
- Coletar 50+ emails de interessados

### Fase 2: MVP (Semana 3-4)
- Lançar versão gratuita (limite de 5 links)
- Coletar feedback dos primeiros usuários
- Iterar baseado no feedback

### Fase 3: Monetização (Semana 5-8)
- Implementar pagamentos (Stripe/Mercado Pago)
- Lançar plano Pro
- Meta: 100 usuários pagos = R$ 990/mês

## 🤝 Contribuição

Pull requests são bem-vindos! Para mudanças grandes, abra uma issue primeiro.

## 📄 Licença

MIT

---

**Feito com ❤️ no Brasil**

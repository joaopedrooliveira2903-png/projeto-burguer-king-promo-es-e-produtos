# 🍔 Burger King - Sistema Administrativo

Sistema de gerenciamento administrativo para Burger King, desenvolvido com HTML, CSS, Tailwind CSS e Supabase.

## ✨ Características

- 🔐 **Autenticação segura** com Supabase Auth
- 📊 **Painel administrativo** com estatísticas em tempo real
- 📝 **Gerenciamento de produtos** com CRUD completo
- 🎯 **Gerenciamento de promoções** ativas
- 🎨 **Design moderno** com Tailwind CSS
- 📱 **Responsivo** em todos os dispositivos
- ♿ **Acessibilidade** com Material Symbols
- 🎭 **Animações suaves** e feedback visual

## 🚀 Quick Start

### Pré-requisitos

- Node.js 16+ (para desenvolvimento local)
- Conta Supabase
- Navegador moderno

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/burger-king.git
   cd burger-king
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```
   
   Edite `.env.local` com suas credenciais Supabase:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_publica_aqui
   ```

3. **Inicie um servidor local** (se usar Vite)
   ```bash
   npm install
   npm run dev
   ```

   Como as páginas usam módulos JavaScript, sirva os arquivos por HTTP em vez de abrir `index.html` com `file://`. Você pode usar a extensão Live Server do VS Code ou iniciar um servidor na pasta do projeto:
   ```bash
   py -m http.server 8000
   ```
   Depois acesse `http://localhost:8000/`. No Live Server, abra `index.html` e escolha **Open with Live Server**.

## 📁 Estrutura do Projeto

```
burger-king/
├── 📄 index.html                    # Página inicial
├── 🔐 login.html                    # Página de login
├── 📝 RELATORIO_MELHORIAS.md         # Documentação das correções
├── 📖 README.md                     # Este arquivo
├── 🔑 .env.example                  # Exemplo de variáveis
├── 🚫 .gitignore                    # Arquivos ignorados pelo Git
│
├── 📁 css/
│   └── 🎨 style.css                 # Estilos customizados
│
├── 📁 js/
│   ├── 🔐 auth.js                   # Autenticação e autorização
│   ├── 🗄️  supabase.js               # Configuração Supabase
│   ├── 📊 painel.js                 # Lógica do painel
│   ├── 📝 produto.js                # Gerenciamento de produtos
│   ├── 🎯 promocoes.js              # Gerenciamento de promoções
│   └── 🧪 teste-supabase.js         # Testes de conexão
│
└── 📁 admin/
    ├── 📊 painel.html               # Painel administrativo
    ├── 📝 produto.html              # Página de produtos
    └── 🎯 promocoes.html            # Página de promoções
```

## 🔐 Configuração de Segurança

### Protegendo Credenciais

⚠️ **IMPORTANTE**: Nunca commite credenciais reais no repositório!

1. **Use `.env.local` para desenvolvimento**
   ```bash
   # .env.local (NÃO commitar)
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_publica
   ```

2. **Configure `.gitignore`**
   ```
   .env.local
   .env.*.local
   secrets.json
   ```

3. **Para produção, use variáveis de ambiente do servidor**
   - Vercel: Project Settings > Environment Variables
   - Netlify: Build & Deploy > Environment
   - GitHub Pages: Use Actions com secrets

## 🎯 Funcionalidades Principais

### 1. **Autenticação** (`login.html`)
- Login com email e senha
- Verificação de perfil de administrador
- Redirecionamento automático
- Mensagens de erro personalizadas

### 2. **Painel** (`admin/painel.html`)
- Dashboard com estatísticas
- Total de produtos
- Promoções ativas
- Vendas do dia (placeholder)
- Navegação rápida

### 3. **Gerenciamento de Produtos** (`admin/produto.html`)
- Criar novo produto
- Editar produtos existentes
- Deletar produtos
- Categorias dinâmicas
- Upload de imagens

### 4. **Gerenciamento de Promoções** (`admin/promocoes.html`)
- Criar promoções
- Ativar/desativar promoções
- Definir desconto
- Data de início e término

## 🎨 Design e Estilo

### Paleta de Cores
- **Vermelho Primário**: `#D62300` (Flame Red)
- **Marrom**: `#502314` (BK Brown)
- **Amarelo**: `#FFB906` (Flame Yellow)
- **Branco Off**: `#F5EBDC` (Off-white)
- **Superfície**: `#FFF8F1`

### Tipografia
- **Display**: Epilogue (800 weight)
- **Body**: Work Sans (400, 600, 700)

### Componentes Estilizados
- Botões com feedback hover
- Cards com sombra progressiva
- Inputs com foco visual
- Badges para status
- Modais elegantes
- Spinners de carregamento

## 📚 API Integration

### Supabase Auth
```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@burgerking.com',
    password: 'senha123'
});

// Logout
await supabase.auth.signOut();

// Verificar usuário
const { data: { user } } = await supabase.auth.getUser();
```

### Supabase Database
```javascript
// Buscar produtos
const { data, error } = await supabase
    .from('produtos_servicos')
    .select('*');

// Criar produto
const { data, error } = await supabase
    .from('produtos_servicos')
    .insert([{ nome: 'Burger', preco: 25.90 }]);

// Atualizar produto
const { data, error } = await supabase
    .from('produtos_servicos')
    .update({ preco: 29.90 })
    .eq('id', productId);

// Deletar produto
const { error } = await supabase
    .from('produtos_servicos')
    .delete()
    .eq('id', productId);
```

## 🧪 Testes

### Testar Autenticação
1. Acesse `login.html`
2. Use credenciais de teste
3. Verifique redirecionamento para painel

### Testar Responsividade
- Mobile: 375px
- Tablet: 768px
- Desktop: 1024px+

### Validar Links
- Todos os links internos devem funcionar
- Botões de navegação devem redirecionar corretamente

## 📱 Suporte a Dispositivos

| Dispositivo | Resolução | Status |
|-------------|-----------|--------|
| Mobile | 320px - 480px | ✅ Otimizado |
| Tablet | 481px - 768px | ✅ Otimizado |
| Desktop | 769px+ | ✅ Otimizado |
| Ultra-wide | 1920px+ | ✅ Suportado |

## 🐛 Conhecidos e Soluções

| Problema | Solução |
|----------|---------|
| Credenciais expostas | Use `.env.local` |
| CSS não carregando | Verifique caminho relativo |
| Supabase desconectado | Verifique chaves em `.env` |
| Login não funciona | Verifique dados do usuário em DB |

## 🔄 Melhorias Futuras

- [ ] Sistema de notificações push
- [ ] Dashboard com gráficos (Chart.js)
- [ ] Relatórios em PDF
- [ ] Sincronização em tempo real
- [ ] Modo escuro automático
- [ ] Multi-idioma (i18n)
- [ ] Dark mode toggle
- [ ] Análises avançadas

## 📖 Documentação Adicional

- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Material Symbols](https://fonts.google.com/icons)

## 👥 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 📞 Suporte

- 📧 Email: suporte@burgerking.com
- 💬 Discord: [Link do servidor]
- 🐛 Issues: GitHub Issues

## 🎉 Créditos

Desenvolvido com ❤️ para Burger King
- **Framework**: Tailwind CSS + Vanilla JavaScript
- **Backend**: Supabase
- **Ícones**: Material Symbols
- **Tipografia**: Google Fonts

---

**Versão**: 1.0.0  
**Última atualização**: 28 de Agosto de 2026  
**Status**: ✅ Em produção

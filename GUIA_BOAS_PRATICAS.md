# 📋 Guia de Boas Práticas - Burger King Admin

Este documento descreve as melhores práticas para desenvolver e manter o projeto Burger King Admin.

## 🎯 Princípios de Design

### 1. **Consistência Visual**
- Use a paleta de cores definida
- Mantenha espaçamento uniforme (múltiplos de 8px)
- Use tipografia consistente (Epilogue para títulos, Work Sans para corpo)

### 2. **Acessibilidade**
- Sempre adicione `alt` em imagens
- Use labels em formulários
- Mantenha contraste de cores (WCAG AA)
- Teste com leitor de tela

### 3. **Performance**
- Minimize CSS e JavaScript
- Use lazy loading para imagens
- Evite requests desnecessários
- Optimize imagens

## 🔐 Segurança

### Não Fazer ❌
```javascript
// ❌ Nunca exponha credenciais
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIs...';
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
```

### Fazer ✅
```javascript
// ✅ Use variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### Checklist de Segurança
- [ ] Todas as credenciais em `.env.local`
- [ ] `.gitignore` configurado corretamente
- [ ] Nenhuma chave de API no código
- [ ] Validação de entrada no cliente
- [ ] Validação de autorização no servidor
- [ ] HTTPS em produção

## 💻 Padrões de Código

### JavaScript
```javascript
// ✅ BOM: Nomes descritivos
async function carregarUsuarioAtual() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return user;
}

// ❌ RUIM: Nomes genéricos
async function get() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return user;
}
```

### Tratamento de Erros
```javascript
// ✅ BOM: Tratamento apropriado
try {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*');
    
    if (error) {
        console.error('Erro ao carregar usuários:', error);
        mostrarMensagem('Erro ao carregar dados', 'erro');
        return null;
    }
    
    return data;
} catch (err) {
    console.error('Erro inesperado:', err);
    mostrarMensagem('Erro inesperado', 'erro');
}

// ❌ RUIM: Sem tratamento
const data = await supabase.from('usuarios').select('*');
```

### Estrutura de Funções
```javascript
/**
 * Busca um produto pelo ID
 * @param {number} produtoId - ID do produto
 * @returns {Promise<Object|null>} Dados do produto ou null se não encontrado
 */
async function buscarProduto(produtoId) {
    if (!produtoId || typeof produtoId !== 'number') {
        console.error('ID do produto inválido');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('produtos_servicos')
            .select('*')
            .eq('id', produtoId)
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Erro ao buscar produto:', err);
        return null;
    }
}
```

## 🎨 Padrões CSS

### Nomes de Classes
```css
/* ✅ BOM: Nomes descritivos e específicos */
.btn-primary { }
.card-produto { }
.header-navegacao { }
.input-email { }

/* ❌ RUIM: Nomes genéricos */
.btn { }
.card { }
.header { }
.input { }
```

### Organização CSS
```css
/* 1. Variáveis */
:root {
    --primary: #D62300;
    --spacing: 8px;
}

/* 2. Reset e Base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* 3. Tipografia */
h1, h2, h3 { }
body { }

/* 4. Componentes */
.button { }
.card { }

/* 5. Layouts */
.container { }
.grid { }

/* 6. Responsividade */
@media (max-width: 768px) { }
```

## 📝 Convenções de Nomes

### Variáveis
```javascript
// ✅ camelCase para variáveis
const usuarioAtual = null;
let totalProdutos = 0;

// ❌ snake_case ou PascalCase em JS
const usuario_atual = null;  // Não em JS
let TotalProdutos = 0;       // Reservado para classes
```

### Classes CSS
```css
/* ✅ kebab-case para classes */
.card-header { }
.btn-primary { }
.header-navegacao { }

/* ❌ camelCase ou PascalCase em CSS */
.cardHeader { }
.BtnPrimary { }
```

### IDs HTML
```html
<!-- ✅ Descritivos e únicos -->
<div id="totalProdutos"></div>
<button id="btnNovoProduto"></button>

<!-- ❌ Genéricos -->
<div id="container"></div>
<button id="btn1"></button>
```

## 🧪 Testes

### Checklist de Testes Manuais
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas
- [ ] Redirect para login quando não autenticado
- [ ] Verificação de perfil admin
- [ ] Carregamento de produtos
- [ ] CRUD de produtos (Create, Read, Update, Delete)
- [ ] CRUD de promoções
- [ ] Responsividade em mobile
- [ ] Responsividade em tablet
- [ ] Responsividade em desktop
- [ ] Animações funcionam suavemente

### Testes Automatizados (Futuros)
```javascript
// Exemplo com Vitest/Jest
describe('Autenticação', () => {
    test('deve fazer login com credenciais válidas', async () => {
        const result = await login('admin@test.com', 'senha123');
        expect(result.success).toBe(true);
    });

    test('deve rejeitar credenciais inválidas', async () => {
        const result = await login('admin@test.com', 'errada');
        expect(result.error).toBeDefined();
    });
});
```

## 📊 Estrutura de Dados

### Modelo de Usuário (Supabase Auth)
```javascript
{
    id: string,              // UUID
    email: string,           // Email único
    email_confirmed_at: timestamp,
    phone: string,
    confirmed_at: timestamp,
    last_sign_in_at: timestamp,
    app_metadata: {
        provider: string,
        providers: array
    },
    user_metadata: {
        nome: string,
        tipo_usuario: 'ADMIN' | 'USER'
    }
}
```

### Tabela: produtos_servicos
```sql
CREATE TABLE produtos_servicos (
    id BIGINT PRIMARY KEY,
    nome VARCHAR NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    categoria_id BIGINT NOT NULL,
    imagem_url VARCHAR,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);
```

### Tabela: categorias
```sql
CREATE TABLE categorias (
    id BIGINT PRIMARY KEY,
    nome VARCHAR NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true
);
```

### Tabela: promocoes
```sql
CREATE TABLE promocoes (
    id BIGINT PRIMARY KEY,
    titulo VARCHAR NOT NULL,
    descricao TEXT,
    desconto_percentual DECIMAL(5,2),
    desconto_fixo DECIMAL(10,2),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Deployment

### Preparar para Produção
1. **Remover console.log**
   ```bash
   grep -r "console.log" . --include="*.js"
   ```

2. **Minificar CSS e JS**
   ```bash
   npm run build
   ```

3. **Testar variáveis de ambiente**
   ```bash
   # Verificar se .env está configurado corretamente
   echo $VITE_SUPABASE_URL
   ```

4. **Build final**
   ```bash
   npm run build
   npm run preview
   ```

### Deploy em Vercel
```bash
vercel
# Configurar variáveis de ambiente em Project Settings
```

### Deploy em Netlify
```bash
netlify deploy --prod
# Configurar variáveis em Build & Deploy > Environment
```

## 📚 Recursos Úteis

- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript Best Practices](https://javascript.info/)

## 🔄 Git Workflow

### Branches
- `main` - Produção
- `develop` - Desenvolvimento
- `feature/nome-da-feature` - Novas features
- `bugfix/nome-do-bug` - Correções

### Commits
```bash
# ✅ BOM
git commit -m "feat: adicionar validação de email no login"
git commit -m "fix: corrigir redirecionamento após logout"
git commit -m "docs: atualizar README"

# ❌ RUIM
git commit -m "alterações"
git commit -m "fix bug"
git commit -m "atualizar"
```

### Padrão de Mensagens
```
<tipo>(<escopo>): <assunto>

<corpo>

<rodapé>
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 📋 Checklist para Code Review

- [ ] Código segue convenções de nomes
- [ ] Sem credenciais expostas
- [ ] Sem console.log em produção
- [ ] Trata erros apropriadamente
- [ ] Comentários claros quando necessário
- [ ] Sem código duplicado
- [ ] Performance considerada
- [ ] Responsividade testada
- [ ] Acessibilidade considerada

---

**Versão**: 1.0.0  
**Data**: 28 de Agosto de 2026  
**Responsável**: Equipe de Desenvolvimento

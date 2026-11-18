import { supabase } from './supabase.js';
import { ehAdministrador, getPerfilAtual, sair } from './auth.js?v=2';

const listaProdutos = document.getElementById('listaProdutos');
const listaPromocoes = document.getElementById('listaPromocoes');
const itensCarrinho = document.getElementById('itensCarrinho');
const contadorCarrinho = document.getElementById('contadorCarrinho');
const totalCarrinho = document.getElementById('totalCarrinho');
const mensagem = document.getElementById('mensagem');
let produtos = [];
let carrinho = JSON.parse(localStorage.getItem('bk_carrinho') || '[]');

function escapeHTML(valor) {
    return String(valor ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function dinheiro(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function mostrarMensagem(texto, tipo = 'erro') {
    mensagem.textContent = texto;
    mensagem.className = `mt-4 rounded-lg p-4 text-sm font-semibold ${tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
}

function salvarCarrinho() {
    localStorage.setItem('bk_carrinho', JSON.stringify(carrinho));
}

function atualizarCarrinho() {
    const quantidade = carrinho.reduce((total, item) => total + item.quantidade, 0);
    const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
    contadorCarrinho.textContent = `Carrinho: ${quantidade}`;
    totalCarrinho.textContent = `Total: ${dinheiro(total)}`;
    itensCarrinho.innerHTML = carrinho.length
        ? carrinho.map(item => `<div class="flex items-center justify-between gap-3 py-3 border-b border-surface-container-high"><div><strong>${escapeHTML(item.nome)}</strong><p class="text-sm text-on-surface-variant">${item.quantidade} × ${dinheiro(item.preco)}</p></div><div class="flex items-center gap-2"><button type="button" data-acao="menos" data-id="${item.id}" class="w-9 h-9 border-2 border-bk-brown rounded-lg">−</button><span>${item.quantidade}</span><button type="button" data-acao="mais" data-id="${item.id}" class="w-9 h-9 border-2 border-bk-brown rounded-lg">+</button></div></div>`).join('')
        : '<p class="text-on-surface-variant">Seu carrinho está vazio.</p>';
    itensCarrinho.querySelectorAll('button').forEach(botao => botao.addEventListener('click', () => {
        const item = carrinho.find(produto => String(produto.id) === String(botao.dataset.id));
        if (!item) return;
        item.quantidade += botao.dataset.acao === 'mais' ? 1 : -1;
        carrinho = carrinho.filter(produto => produto.quantidade > 0);
        salvarCarrinho();
        atualizarCarrinho();
    }));
}

function adicionarAoCarrinho(produto) {
    const existente = carrinho.find(item => String(item.id) === String(produto.id));
    if (existente) existente.quantidade += 1;
    else carrinho.push({ id: produto.id, nome: produto.nome, preco: Number(produto.preco), quantidade: 1 });
    salvarCarrinho();
    atualizarCarrinho();
    mostrarMensagem(`${produto.nome} foi adicionado ao carrinho.`, 'sucesso');
}

async function carregarDados() {
    const [produtosResult, promocoesResult] = await Promise.all([
        supabase.from('produtos_servicos').select('*').eq('ativo', true),
        supabase.from('promocoes').select('*').eq('ativo', true)
    ]);
    if (produtosResult.error) throw produtosResult.error;
    produtos = produtosResult.data || [];
    listaProdutos.innerHTML = produtos.length ? produtos.map(produto => `<article class="bg-surface border-2 border-bk-brown rounded-xl p-5 flex flex-col"><div class="w-14 h-14 rounded-full bg-flame-yellow flex items-center justify-center mb-4"><span class="material-symbols-outlined text-bk-brown">lunch_dining</span></div><h3 class="font-display text-xl font-bold text-bk-brown">${escapeHTML(produto.nome)}</h3><p class="text-on-surface-variant mt-2 flex-1">${escapeHTML(produto.descricao || 'Delicioso produto Burger King.')}</p><div class="flex items-center justify-between gap-3 mt-5"><strong class="text-flame-red text-lg">${dinheiro(produto.preco)}</strong><button type="button" data-id="${produto.id}" class="btn-adicionar bg-flame-red text-white font-bold px-4 py-2 rounded-lg">Adicionar</button></div></article>`).join('') : '<p class="text-on-surface-variant">Nenhum produto disponível no momento.</p>';
    listaProdutos.querySelectorAll('.btn-adicionar').forEach(botao => botao.addEventListener('click', () => adicionarAoCarrinho(produtos.find(item => String(item.id) === String(botao.dataset.id)))));
    if (promocoesResult.error) throw promocoesResult.error;
    const promocoes = promocoesResult.data || [];
    listaPromocoes.innerHTML = promocoes.length ? promocoes.map(promo => `<article class="bg-bk-brown text-white rounded-xl p-5"><span class="text-flame-yellow font-bold">OFERTA</span><h3 class="font-display text-xl font-bold mt-2">${escapeHTML(promo.nome)}</h3><p class="mt-2 text-white/80">${escapeHTML(promo.descricao || 'Aproveite esta promoção!')}</p><strong class="inline-block mt-4 text-flame-yellow">${promo.percentual_desconto ?? promo.desconto_percentual ?? 0}% OFF</strong></article>`).join('') : '<p class="text-on-surface-variant">Nenhuma promoção ativa no momento.</p>';
}

document.getElementById('btnLimparCarrinho').addEventListener('click', () => { carrinho = []; salvarCarrinho(); atualizarCarrinho(); });
document.getElementById('btnSair').addEventListener('click', sair);
document.getElementById('btnFinalizar').addEventListener('click', async (event) => {
    if (!carrinho.length) return mostrarMensagem('Adicione pelo menos um produto ao carrinho.');
    const botao = event.currentTarget;
    botao.disabled = true;

    try {
        const usuario = await getPerfilAtual();
        if (!usuario) return;

        const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
        const { data: venda, error: vendaError } = await supabase
            .from('vendas')
            .insert({ usuario_id: usuario.id, total, status: 'PENDENTE' })
            .select('id')
            .single();

        if (vendaError) throw vendaError;

        const itens = carrinho.map((item) => ({
            venda_id: venda.id,
            produto_id: item.id,
            quantidade: item.quantidade,
            preco_unitario: item.preco
        }));
        const { error: itensError } = await supabase.from('itens_venda').insert(itens);

        if (itensError) {
            const { error: rollbackError } = await supabase
                .from('vendas')
                .delete()
                .eq('id', venda.id);
            if (rollbackError) console.error('Não foi possível remover o pedido incompleto:', rollbackError);
            throw itensError;
        }

        carrinho = [];
        salvarCarrinho();
        atualizarCarrinho();
        mostrarMensagem('Compra registrada com sucesso! Você pode acompanhar em Minhas compras.', 'sucesso');
    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        const detalhe = error.message || 'Falha de conexão com o Supabase.';
        mostrarMensagem(`Não foi possível registrar a compra: ${detalhe}. Confira as tabelas e políticas em supabase/usuario-vendas.sql.`);
    } finally {
        botao.disabled = false;
    }
});

const usuario = await getPerfilAtual();
if (usuario) {
    document.getElementById('nomeUsuario').textContent = `Olá, ${usuario.nome || 'cliente'}!`;
    if (ehAdministrador(usuario)) document.getElementById('linkAdmin').classList.remove('hidden');
    document.getElementById('linkAdmin').classList.add('md:flex');
    try { await carregarDados(); } catch (error) { console.error(error); mostrarMensagem(`Erro ao carregar cardápio: ${error.message}`); }
    atualizarCarrinho();
}

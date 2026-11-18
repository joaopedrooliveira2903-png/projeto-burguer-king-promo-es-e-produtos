import { supabase } from './supabase.js';
import { getPerfilAtual } from './auth.js';

const lista = document.getElementById('listaVendas');

function escaparHTML(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function dinheiro(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function mostrarErro(erro) {
    console.error('Erro ao carregar compras:', erro);
    const detalhe = erro?.message || erro?.details || 'Erro não identificado.';
    lista.innerHTML = `<div class="bg-red-100 text-red-800 border-2 border-red-700 rounded-xl p-5">
        <strong>Não foi possível carregar suas compras.</strong>
        <p class="mt-2 text-sm">${escaparHTML(detalhe)}</p>
        <p class="mt-2 text-sm">Confirme se o arquivo <code>supabase/usuario-vendas.sql</code> foi executado no projeto Supabase correto.</p>
    </div>`;
}

async function carregarCompras(usuario) {
    if (!lista) return;

    const { data: vendas, error: erroVendas } = await supabase
        .from('vendas')
        .select('id, total, status, criado_em')
        .eq('usuario_id', usuario.id)
        .order('criado_em', { ascending: false });

    if (erroVendas) {
        mostrarErro(erroVendas);
        return;
    }

    if (!vendas?.length) {
        lista.innerHTML = '<div class="bg-surface border-2 border-bk-brown rounded-xl p-6">Você ainda não realizou compras.</div>';
        return;
    }

    const idsVendas = vendas.map((venda) => venda.id);
    const { data: itens, error: erroItens } = await supabase
        .from('itens_venda')
        .select('venda_id, produto_id, quantidade, preco_unitario')
        .in('venda_id', idsVendas);

    if (erroItens) {
        mostrarErro(erroItens);
        return;
    }

    const idsProdutos = [...new Set((itens || []).map((item) => item.produto_id))];
    let produtosPorId = new Map();

    if (idsProdutos.length) {
        const { data: produtos, error: erroProdutos } = await supabase
            .from('produtos_servicos')
            .select('id, nome')
            .in('id', idsProdutos);

        if (erroProdutos) {
            mostrarErro(erroProdutos);
            return;
        }

        produtosPorId = new Map((produtos || []).map((produto) => [String(produto.id), produto.nome]));
    }

    const itensPorVenda = new Map();
    for (const item of itens || []) {
        const itensAtuais = itensPorVenda.get(String(item.venda_id)) || [];
        itensAtuais.push(item);
        itensPorVenda.set(String(item.venda_id), itensAtuais);
    }

    lista.innerHTML = vendas.map((venda) => {
        const data = venda.criado_em
            ? new Date(venda.criado_em).toLocaleString('pt-BR')
            : 'Data não informada';
        const itensDaVenda = itensPorVenda.get(String(venda.id)) || [];
        const itensHTML = itensDaVenda.length
            ? itensDaVenda.map((item) => {
                const nome = produtosPorId.get(String(item.produto_id)) || `Produto #${item.produto_id}`;
                return `<p>${Number(item.quantidade)}× ${escaparHTML(nome)} — ${dinheiro(Number(item.preco_unitario) * Number(item.quantidade))}</p>`;
            }).join('')
            : '<p class="text-on-surface-variant">Os itens deste pedido não estão disponíveis.</p>';

        return `<article class="bg-surface border-2 border-bk-brown rounded-xl p-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 class="font-display text-xl font-bold text-bk-brown">Pedido #${escaparHTML(venda.id)}</h2>
                    <p class="text-sm text-on-surface-variant">${escaparHTML(data)}</p>
                </div>
                <span class="px-3 py-1 rounded-full bg-flame-yellow text-bk-brown font-bold">${escaparHTML(venda.status || 'PENDENTE')}</span>
            </div>
            <div class="mt-4 pt-4 border-t border-surface-container-high space-y-2">${itensHTML}</div>
            <strong class="block mt-4 text-flame-red text-lg">Total: ${dinheiro(venda.total)}</strong>
        </article>`;
    }).join('');
}

if (lista) {
    const usuario = await getPerfilAtual();
    if (usuario) await carregarCompras(usuario);
}
import { supabase } from './supabase.js';
import { ehAdministrador, getUsuarioCatalogo } from './auth.js';

const lista = document.getElementById('listaProdutos');

function escapeHTML(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function ordenarMaisRecentes(itens) {
    return [...itens].sort((a, b) => {
        const dataA = Date.parse(a.criado_em || a.created_at || '') || 0;
        const dataB = Date.parse(b.criado_em || b.created_at || '') || 0;

        if (dataA !== dataB) return dataB - dataA;
        return String(b.id ?? '').localeCompare(String(a.id ?? ''), undefined, { numeric: true });
    });
}

function formatarPreco(valor) {
    const preco = Number(valor);
    return Number.isFinite(preco)
        ? preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : 'Preço não informado';
}

async function carregarProdutos() {
    if (!lista) return;

    const { data, error } = await supabase
        .from('produtos_servicos')
        .select('*');

    if (error) {
        console.error('Erro ao carregar produtos:', error);
        lista.innerHTML = `<div class="bg-red-100 text-red-800 border-2 border-red-700 rounded-xl p-6">
            <strong>Erro ao carregar produtos.</strong>
            <p class="mt-2 text-sm">${escapeHTML(error.message || 'Verifique as permissões da tabela no Supabase.')}</p>
        </div>`;
        return;
    }

    const produtos = ordenarMaisRecentes(data || []);

    if (!produtos.length) {
        lista.innerHTML = '<div class="bg-surface border-2 border-bk-brown rounded-xl p-6">Nenhum produto cadastrado.</div>';
        return;
    }

    const administrador = ehAdministrador(usuarioAtual);
    lista.innerHTML = produtos.map((produto) => `<article class="bg-surface border-2 border-bk-brown rounded-xl p-5">
        <div class="flex justify-between gap-3">
            <div>
                <h2 class="text-xl font-bold text-bk-brown">${escapeHTML(produto.nome)}</h2>
                <p class="text-on-surface-variant mt-1">${escapeHTML(produto.descricao || 'Sem descrição')}</p>
                <p class="text-sm text-on-surface-variant mt-2">Categoria: ${escapeHTML(produto.id_categoria ?? produto.categoria_id ?? 'Não informada')} · ${escapeHTML(produto.tipo || 'Produto')}</p>
            </div>
            <strong class="text-flame-red whitespace-nowrap">${formatarPreco(produto.preco)}</strong>
        </div>
        <div class="flex justify-between items-center mt-4 pt-3 border-t border-surface-container-high">
            <span class="text-sm font-bold ${produto.ativo ? 'text-green-700' : 'text-gray-600'}">${produto.ativo ? 'Ativo' : 'Inativo'}</span>
            ${administrador ? `<button type="button" data-id="${escapeHTML(produto.id)}" class="btn-excluir border-2 border-error-red text-error-red rounded-lg px-3 py-2 font-bold">Excluir</button>` : '<span class="text-sm text-on-surface-variant">Somente visualização</span>'}
        </div>
    </article>`).join('');

    if (!administrador) return;

    lista.querySelectorAll('.btn-excluir').forEach((button) => {
        button.addEventListener('click', async () => {
            if (!confirm('Deseja realmente excluir este produto?')) return;
            button.disabled = true;
            const { error: deleteError } = await supabase.from('produtos_servicos').delete().eq('id', button.dataset.id);
            if (deleteError) {
                console.error('Erro ao excluir produto:', deleteError);
                button.disabled = false;
                const mensagem = deleteError.code === '23503'
                    ? 'Este produto já está vinculado a uma venda e não pode ser excluído.'
                    : `Não foi possível excluir o produto: ${deleteError.message || 'verifique as permissões.'}`;
                alert(mensagem);
                return;
            }
            await carregarProdutos();
        });
    });
}

const usuarioAtual = await getUsuarioCatalogo();
if (usuarioAtual) {
    if (!ehAdministrador(usuarioAtual)) {
        document.querySelectorAll('a[href="painel.html"]').forEach((link) => {
            link.href = '../usuario/index.html';
            link.textContent = link.textContent.includes('BURGER KING') ? 'BURGER KING' : 'Voltar ao cardápio';
        });
        document.querySelector('a[href="produto.html"]')?.remove();
        const navegacao = document.querySelector('header .flex.items-center.gap-2');
        if (navegacao) {
            const linkPromocoes = document.createElement('a');
            linkPromocoes.href = 'promocoes.html';
            linkPromocoes.className = 'text-bk-brown font-bold hover:text-flame-red transition flex items-center gap-1 px-2';
            linkPromocoes.textContent = 'Promoções';
            navegacao.prepend(linkPromocoes);
        }
        const descricao = document.querySelector('main p.text-on-surface-variant.mt-1');
        if (descricao) descricao.textContent = 'Consulte os produtos disponíveis no cardápio. Você não pode alterá-los.';
    }
    await carregarProdutos();
}

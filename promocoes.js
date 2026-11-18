import { supabase } from './supabase.js';
import { ehAdministrador, getUsuarioCatalogo } from './auth.js';

const lista = document.getElementById('listaPromocoes');
let usuarioAtual = null;

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

async function carregarPromocoes() {
    if (!lista) return;

    const { data, error } = await supabase
        .from('promocoes')
        .select('*');

    if (error) {
        console.error('Erro ao carregar promoções:', error);
        lista.innerHTML = `<div class="bg-error-container border-2 border-error-red rounded-xl p-6">
            <p class="text-error-red font-bold">Erro ao carregar promoções.</p>
            <p class="text-error-red text-sm mt-2">${escapeHTML(error.message || 'Verifique as permissões da tabela no Supabase.')}</p>
        </div>`;
        return;
    }

    const promocoes = ordenarMaisRecentes(data || []);

    if (!promocoes.length) {
        lista.innerHTML = '<div class="bg-surface-container-lowest border-2 border-bk-brown rounded-xl p-6"><p>Nenhuma promoção cadastrada.</p></div>';
        return;
    }

    lista.innerHTML = promocoes.map((promocao) => {
        const percentual = promocao.desconto_percentual ?? promocao.percentual_desconto;
        const desconto = percentual !== null && percentual !== undefined
            ? `${percentual}% OFF`
            : promocao.desconto_fixo !== null && promocao.desconto_fixo !== undefined
                ? `R$ ${Number(promocao.desconto_fixo).toFixed(2)}`
                : promocao.descricao || 'Promoção';
        const classe = promocao.ativo ? 'bg-surface-container-lowest border-bk-brown' : 'bg-surface-container-highest border-on-surface-variant opacity-80';

        return `<article class="${classe} border-2 rounded-xl p-4 flex flex-col gap-4">
            <div class="flex justify-between items-start gap-4">
                <div>
                    <h3 class="font-headline-lg-mobile text-xl text-bk-brown">${escapeHTML(promocao.nome)}</h3>
                    <p class="font-body-lg text-flame-red font-bold mt-1">${escapeHTML(desconto)}</p>
                    <p class="text-sm text-on-surface-variant mt-2">De ${escapeHTML(promocao.data_inicio)} até ${escapeHTML(promocao.data_fim)}</p>
                </div>
                <span class="px-3 py-1 rounded-full border-2 ${promocao.ativo ? 'border-success-green text-success-green' : 'border-on-surface-variant text-on-surface-variant'}">${promocao.ativo ? 'Ativa' : 'Inativa'}</span>
            </div>
            ${ehAdministrador(usuarioAtual) ? `<div class="flex gap-4 pt-2 border-t border-surface-container-highest">
                <button type="button" data-id="${escapeHTML(promocao.id)}" class="btn-excluir flex-none min-h-touch-target-min w-[56px] bg-transparent border-2 border-error-red text-error-red rounded-lg flex items-center justify-center" aria-label="Excluir">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>` : '<p class="text-sm text-on-surface-variant border-t border-surface-container-highest pt-2">Somente visualização</p>'}
        </article>`;
    }).join('');

    lista.querySelectorAll('.btn-excluir').forEach((button) => {
        button.addEventListener('click', async () => {
            if (!confirm('Deseja realmente excluir esta promoção?')) return;
            const { error: deleteError } = await supabase.from('promocoes').delete().eq('id', button.dataset.id);
            if (deleteError) {
                console.error('Erro ao excluir promoção:', deleteError);
                alert('Não foi possível excluir.');
                return;
            }
            await carregarPromocoes();
        });
    });
}

const usuario = await getUsuarioCatalogo();
if (usuario) {
    usuarioAtual = usuario;
    if (ehAdministrador(usuario)) {
        document.getElementById('btnNovaPromocao')?.addEventListener('click', () => {
            window.location.href = 'nova-promocao.html';
        });
    } else {
        document.querySelectorAll('a[href="painel.html"]').forEach((link) => {
            link.href = '../usuario/index.html';
            link.textContent = link.textContent.includes('BURGER KING') ? 'BURGER KING' : 'Voltar ao cardápio';
        });
        document.getElementById('btnNovaPromocao')?.remove();
        const descricao = document.querySelector('main p.font-body-md');
        if (descricao) descricao.textContent = 'Consulte as promoções disponíveis. Você não pode alterá-las.';
        const navegacao = document.querySelector('header .flex.items-center.gap-2');
        if (navegacao) {
            const linkProdutos = document.createElement('a');
            linkProdutos.href = 'produtos.html';
            linkProdutos.className = 'text-bk-brown font-bold hover:text-flame-red transition flex items-center gap-1 px-2';
            linkProdutos.textContent = 'Produtos';
            navegacao.prepend(linkProdutos);
        }
        document.querySelectorAll('a[href="painel.html"]').forEach((link) => {
            if (link.closest('nav')) link.remove();
        });
    }
    if (lista) await carregarPromocoes();
}

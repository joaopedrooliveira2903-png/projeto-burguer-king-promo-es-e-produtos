import { supabase } from './supabase.js';
import { getUsuarioAtual } from './auth.js';

// ========================================
// ELEMENTOS DO HTML
// ========================================

const form = document.getElementById('promocaoForm');
const mensagem = document.getElementById('mensagem');

// ========================================
// MOSTRAR MENSAGEM
// ========================================

function mostrarMensagem(texto, tipo = 'erro') {
    if (!mensagem) {
        alert(texto);
        return;
    }

    mensagem.textContent = texto;
    mensagem.classList.remove(
        'hidden',
        'bg-green-100',
        'text-green-800',
        'bg-red-100',
        'text-red-800'
    );

    if (tipo === 'sucesso') {
        mensagem.classList.add(
            'bg-green-100',
            'text-green-800'
        );
    } else {
        mensagem.classList.add(
            'bg-red-100',
            'text-red-800'
        );
    }
}

// ========================================
// CADASTRAR PROMOÇÃO
// ========================================

async function cadastrarPromocao(event) {
    event.preventDefault();

    console.log('Tentando cadastrar promoção...');

    const botaoSubmit = form?.querySelector('button[type="submit"]');
    if (botaoSubmit) {
        botaoSubmit.disabled = true;
        botaoSubmit.dataset.textoOriginal = botaoSubmit.textContent;
        botaoSubmit.textContent = 'Cadastrando...';
    }

    try {
        // ====================================
        // VERIFICAR AUTENTICAÇÃO
        // ====================================

        const usuario = await getUsuarioAtual();
        if (!usuario) {
            mostrarMensagem('Você precisa estar autenticado.', 'erro');
            return;
        }

    // ====================================
    // PEGAR DADOS DO FORMULÁRIO
    // ====================================

    const nome = document
        .getElementById('nome')
        .value
        .trim();

    const descricao = document
        .getElementById('descricao')
        .value
        .trim();

    const descontoPercentualTexto = document
        .getElementById('desconto_percentual')
        .value;

    const data_inicio = document
        .getElementById('data_inicio')
        .value;

    const data_fim = document
        .getElementById('data_fim')
        .value;

    const ativo = document
        .getElementById('ativo')
        .checked;

    console.log({
        nome,
        descricao,
        descontoPercentualTexto,
        data_inicio,
        data_fim,
        ativo
    });

    // ====================================
    // VALIDAÇÕES
    // ====================================

    if (!nome) {
        mostrarMensagem('Digite o nome da promoção.', 'erro');
        return;
    }

    if (!data_inicio) {
        mostrarMensagem('Selecione a data de início.', 'erro');
        return;
    }

    if (!data_fim) {
        mostrarMensagem('Selecione a data de término.', 'erro');
        return;
    }

    // Validar que a data final é após a inicial
    if (new Date(data_fim) <= new Date(data_inicio)) {
        mostrarMensagem('A data de término deve ser após a data de início.', 'erro');
        return;
    }

    // Validar que existe pelo menos um tipo de desconto
    const descontoPercentual = descontoPercentualTexto === ''
        ? null
        : Number(descontoPercentualTexto);
    if (descontoPercentual === null) {
        mostrarMensagem('Defina o desconto percentual.', 'erro');
        return;
    }

    if (descontoPercentual !== null && (!Number.isFinite(descontoPercentual) || descontoPercentual < 0 || descontoPercentual > 100)) {
        mostrarMensagem('O desconto percentual deve estar entre 0 e 100.', 'erro');
        return;
    }

    // ====================================
    // OBJETO DA PROMOÇÃO
    // ====================================

    const promocao = {
        nome: nome,
        descricao: descricao || null,
        // Este é o nome da coluna usado na tabela promocoes.
        percentual_desconto: descontoPercentual,
        data_inicio: data_inicio,
        data_fim: data_fim,
        ativo: ativo
    };

    console.log('Promoção que será enviada ao Supabase:', promocao);

    // ====================================
    // INSERT
    // ====================================

        const { data, error } = await supabase
            .from('promocoes')
            .insert(promocao)
            .select()
            .single();

    // ====================================
    // TRATAR ERRO
    // ====================================

        if (error) {
            console.error('ERRO AO CADASTRAR:', error);
            mostrarMensagem(
                'Erro ao cadastrar promoção: ' + (error.message || 'verifique as permissões da tabela.'),
                'erro'
            );
            return;
        }

    // ====================================
    // SUCESSO
    // ====================================

        console.log('Promoção criada:', data);

        mostrarMensagem(
            'Promoção cadastrada com sucesso!',
            'sucesso'
        );

    // Limpa o formulário
        form.reset();

    // Redireciona após 2 segundos
        setTimeout(() => {
            window.location.href = 'promocoes.html';
        }, 1200);
    } catch (error) {
        console.error('Erro inesperado ao cadastrar promoção:', error);
        mostrarMensagem('Não foi possível cadastrar a promoção. Tente novamente.', 'erro');
    } finally {
        if (botaoSubmit) {
            botaoSubmit.disabled = false;
            botaoSubmit.textContent = botaoSubmit.dataset.textoOriginal || 'Criar Promoção';
        }
    }
}

// ========================================
// INICIALIZAÇÃO
// ========================================

async function iniciar() {
    console.log('Inicializando tela de nova promoção...');

    // Verificar autenticação
    const usuario = await getUsuarioAtual();
    if (!usuario) {
        window.location.href = '../login.html';
        return;
    }

    if (!form) {
        console.error('ERRO: #promocaoForm não encontrado.');
        return;
    }

    form.addEventListener('submit', cadastrarPromocao);

    console.log('Formulário de promoção pronto!');
}

iniciar();

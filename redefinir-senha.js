import { supabase } from './supabase.js';

const form = document.getElementById('redefinirForm');
const mensagem = document.getElementById('mensagem');
const botao = form.querySelector('button[type="submit"]');

let sessaoRecuperacaoValida = false;

function obterParametrosDaUrl() {
    const parametros = new URLSearchParams(window.location.search);
    const fragmento = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash;

    // Links antigos do Supabase usam o fragmento (#) e os novos usam (?code=).
    for (const [chave, valor] of new URLSearchParams(fragmento)) {
        if (!parametros.has(chave)) parametros.set(chave, valor);
    }

    return parametros;
}

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `rounded-lg p-4 text-sm font-semibold ${tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
}

async function prepararSessao() {
    botao.disabled = true;
    botao.classList.add('opacity-60', 'cursor-not-allowed');

    const parametros = obterParametrosDaUrl();
    const erroUrl = parametros.get('error_description');
    if (erroUrl) {
        let mensagemErro = erroUrl.replaceAll('+', ' ');
        try {
            mensagemErro = decodeURIComponent(mensagemErro);
        } catch {
            // Mantém a mensagem original se o provedor enviar texto já decodificado.
        }
        mostrarMensagem(mensagemErro, 'erro');
        return;
    }

    // Links antigos do Supabase chegam com access_token no fragmento.
    // Links mais novos podem chegar com ?code=... .
    if (parametros.get('code')) {
        const { error } = await supabase.auth.exchangeCodeForSession(parametros.get('code'));
        if (error) {
            console.error('Erro ao validar código de recuperação:', error);
            mostrarMensagem('Este link expirou ou já foi utilizado. Solicite um novo link.', 'erro');
            return;
        }
    }

    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
        mostrarMensagem('Link de recuperação inválido ou expirado. Solicite outro no login.', 'erro');
        return;
    }

    sessaoRecuperacaoValida = true;
    botao.disabled = false;
    botao.classList.remove('opacity-60', 'cursor-not-allowed');
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!sessaoRecuperacaoValida) {
        mostrarMensagem('Aguarde a validação do link de recuperação.', 'erro');
        return;
    }
    const senha = document.getElementById('novaSenha').value;
    const confirmacao = document.getElementById('confirmarSenha').value;

    if (senha.length < 6) {
        mostrarMensagem('A senha deve ter pelo menos 6 caracteres.', 'erro');
        return;
    }

    if (senha !== confirmacao) {
        mostrarMensagem('As senhas não são iguais.', 'erro');
        return;
    }

    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
        console.error('Erro ao redefinir senha:', error);
        mostrarMensagem('O link expirou ou é inválido. Solicite outro link no login.', 'erro');
        return;
    }

    mostrarMensagem('Senha alterada com sucesso! Redirecionando para o login...', 'sucesso');
    form.reset();
    await supabase.auth.signOut();
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
});

supabase.auth.onAuthStateChange((evento) => {
    if (evento === 'PASSWORD_RECOVERY') {
        sessaoRecuperacaoValida = true;
        botao.disabled = false;
        botao.classList.remove('opacity-60', 'cursor-not-allowed');
    }
});

prepararSessao().catch((error) => {
    console.error('Erro ao preparar recuperação:', error);
    mostrarMensagem('Não foi possível validar este link. Solicite outro no login.', 'erro');
});

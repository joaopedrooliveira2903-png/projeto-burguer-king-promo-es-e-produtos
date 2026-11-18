import { supabase } from './supabase.js';

function estaEmAreaInterna() {
    return window.location.pathname.includes('/admin/') || window.location.pathname.includes('/usuario/');
}

function caminhoPara(arquivo) {
    return estaEmAreaInterna() ? `../${arquivo}` : arquivo;
}

export function ehAdministrador(usuario) {
    return String(usuario?.tipo_usuario || '').trim().toUpperCase() === 'ADMIN';
}

export function podeConsultarCatalogo(usuario) {
    const tipo = String(usuario?.tipo_usuario || '').trim().toUpperCase();
    return tipo === 'ADMIN' || tipo === 'USER';
}

export function redirecionarPorPerfil(usuario) {
    window.location.href = ehAdministrador(usuario)
        ? caminhoPara('admin/painel.html')
        : caminhoPara('usuario/index.html');
}

export async function getPerfilAtual({ redirecionar = true } = {}) {
    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    // Usuário não logado
    if (error || !user) {
        if (redirecionar) {
            window.location.href = caminhoPara('login.html');
        }
        return null;
    }

    // Buscar perfil do usuário
    const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

    if (usuarioError || !usuario) {
        if (redirecionar) alert('Seu login foi reconhecido, mas o perfil ainda não foi criado. Execute o SQL de configuração do Supabase e tente novamente.');
        await supabase.auth.signOut();
        if (redirecionar) {
            window.location.href = caminhoPara('login.html');
        }
        return null;
    }

    return usuario;
}

export async function getUsuarioAtual() {
    const usuario = await getPerfilAtual();
    if (!usuario) return null;

    // Verificar se é administrador
    if (!ehAdministrador(usuario)) {
        alert('Acesso permitido somente para administradores.');
        window.location.href = caminhoPara('usuario/index.html');
        return null;
    }

    return usuario;
}

export async function getUsuarioCatalogo() {
    const usuario = await getPerfilAtual();
    if (!usuario) return null;

    if (!podeConsultarCatalogo(usuario)) {
        alert('Seu perfil não tem acesso às listagens de produtos e promoções.');
        window.location.href = caminhoPara('usuario/index.html');
        return null;
    }

    return usuario;
}

export async function sair() {
    await supabase.auth.signOut();
    window.location.href = caminhoPara('index.html');
}

    
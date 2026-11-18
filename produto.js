import { supabase } from './supabase.js';
import { getUsuarioAtual } from './auth.js';

console.log('produto.js carregado!');


// ========================================
// ELEMENTOS DO HTML
// ========================================

const form = document.getElementById('produtoForm');

const categoriaSelect =
    document.getElementById('categoria');

const mensagem =
    document.getElementById('mensagem');

document.getElementById('btnVoltar')?.addEventListener('click', () => {
    window.location.href = 'produtos.html';
});


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
// CARREGAR CATEGORIAS
// ========================================

async function carregarCategorias() {

    console.log(
        'Buscando categorias no Supabase...'
    );

    if (!categoriaSelect) {

        console.error(
            'ERRO: elemento #categoria não encontrado.'
        );

        return;
    }


    const {data, error} = await supabase
        .from('categorias')
        .select('id, nome')
        .order('nome');


    console.log('DATA:', data);
    console.log('ERROR:', error);


    if (error) {

        console.error(
            'Erro ao carregar categorias:',
            error
        );

        mostrarMensagem(
            'Erro ao carregar categorias: ' +
            error.message
        );

        return;
    }

    if (!Array.isArray(data)) {
        categoriaSelect.innerHTML = '<option value="">Nenhuma categoria disponível</option>';
        mostrarMensagem('Nenhuma categoria disponível para o produto.');
        return;
    }

    if (!data.length) {
        categoriaSelect.innerHTML = '<option value="">Nenhuma categoria cadastrada</option>';
        mostrarMensagem('Cadastre uma categoria antes de criar um produto.');
        return;
    }


    // Limpa o select

    categoriaSelect.innerHTML = '';


    // Opção inicial

    const opcaoInicial =
        document.createElement('option');

    opcaoInicial.value = '';

    opcaoInicial.textContent =
        'Selecione uma categoria';

    categoriaSelect.appendChild(
        opcaoInicial
    );


    // Adiciona as categorias

    data.forEach(categoria => {

        console.log(
            'Adicionando categoria:',
            categoria.nome,
            categoria.id
        );


        const option =
            document.createElement('option');


        option.value =
            categoria.id;


        option.textContent =
            categoria.nome;


        categoriaSelect.appendChild(
            option
        );

    });


    console.log(
        'TOTAL DE CATEGORIAS:',
        data.length
    );

    console.log(
        'TOTAL DE OPÇÕES NO SELECT:',
        categoriaSelect.options.length
    );
}


// ========================================
// CADASTRAR PRODUTO
// ========================================

async function cadastrarProduto(event) {

    event.preventDefault();

    console.log(
        'Tentando cadastrar produto...'
    );


    // ====================================
    // PEGAR DADOS DO FORMULÁRIO
    // ====================================

    const nome =
        document
            .getElementById('nome')
            .value
            .trim();


    const descricao =
        document
            .getElementById('descricao')
            .value
            .trim();


    const preco =
        document
            .getElementById('preco')
            .value;


    const tipo =
        document
            .getElementById('tipo')
            .value;


    const idCategoria =
        categoriaSelect.value;


    console.log({
        nome,
        descricao,
        tipo,
        idCategoria
    });


    // ====================================
    // VALIDAÇÕES
    // ====================================

    if (!nome) {

        mostrarMensagem(
            'Digite o nome do produto.'
        );

        return;
    }


    if (!preco || Number(preco) <= 0) {

        mostrarMensagem(
            'Digite um preço válido.'
        );

        return;
    }


    if (!tipo) {

        mostrarMensagem(
            'Selecione o tipo do produto.'
        );

        return;
    }


    if (!idCategoria) {

        mostrarMensagem(
            'Selecione uma categoria.'
        );

        return;
    }


    // ====================================
    // OBJETO DO PRODUTO
    // ====================================

    const produto = {

        nome: nome,

        descricao:
            descricao || null,

        preco:
            Number(preco),

        tipo:
            tipo,

        id_categoria:
            Number(idCategoria),

        ativo:
            true
    };


    console.log(
        'Produto que será enviado ao Supabase:',
        produto
    );


    // ====================================
    // INSERT
    // ====================================

    let data;
    let error;

    try {
        ({ data, error } = await supabase
            .from('produtos_servicos')
            .insert(produto)
            .select()
            .single());
    } catch (erro) {
        console.error('Erro inesperado ao cadastrar produto:', erro);
        mostrarMensagem('Não foi possível cadastrar o produto. Verifique sua conexão e tente novamente.');
        return;
    }


    // ====================================
    // TRATAR ERRO
    // ====================================

    if (error) {

        console.error(
            'ERRO AO CADASTRAR:',
            error
        );

        mostrarMensagem(
            'Erro ao cadastrar produto: ' +
            error.message
        );

        return;
    }


    // ====================================
    // SUCESSO
    // ====================================

    console.log(
        'Produto criado:',
        data
    );


    mostrarMensagem(
        'Produto cadastrado com sucesso!',
        'sucesso'
    );


    // Limpa o formulário

    form.reset();


    // Recarrega as categorias

    await carregarCategorias();

    setTimeout(() => {
        window.location.href = 'produtos.html';
    }, 800);
}


// ========================================
// INICIALIZAÇÃO
// ========================================

async function iniciar() {

    console.log(
        'Inicializando tela de produtos...'
    );


    const usuario = await getUsuarioAtual();

    if (!usuario) return;

    await carregarCategorias();


    if (!form) {

        console.error(
            'ERRO: #produtoForm não encontrado.'
        );

        return;
    }


    form.addEventListener(
        'submit',
        cadastrarProduto
    );


    console.log(
        'Formulário de produto pronto!'
    );
}


iniciar();
import { supabase } from './supabase.js';

import {
    getUsuarioAtual
} from './auth.js';


async function carregarPainel() {

    const usuario =
        await getUsuarioAtual();

    if (!usuario) return;


    // ==============================
    // NOME DO ADMIN
    // ==============================

    const titulo =
        document.getElementById(
            'tituloPainel'
        );

    if (titulo) {

        titulo.textContent =
            `Olá, ${usuario.nome}!`;
    }


    // ==============================
    // TOTAL DE PRODUTOS
    // ==============================

    const {
        count: totalProdutos,
        error: produtosError
    } = await supabase
        .from('produtos_servicos')
        .select('*', {
            count: 'exact',
            head: true
        });


    const elementoProdutos =
        document.getElementById(
            'totalProdutos'
        );


    if (elementoProdutos) {

        if (produtosError) {

            console.error(
                produtosError
            );

            elementoProdutos.textContent =
                '0';

        } else {

            elementoProdutos.textContent =
                totalProdutos ?? 0;
        }
    }


    // ==============================
    // PROMOÇÕES ATIVAS
    // ==============================

    const {
        count: totalPromocoes,
        error: promocoesError
    } = await supabase
        .from('promocoes')
        .select('*', {
            count: 'exact',
            head: true
        })
        .eq('ativo', true);


    const elementoPromocoes =
        document.getElementById(
            'promocoesAtivas'
        );


    if (elementoPromocoes) {

        if (promocoesError) {

            console.error(
                promocoesError
            );

            elementoPromocoes.textContent =
                '0';

        } else {

            elementoPromocoes.textContent =
                totalPromocoes ?? 0;
        }
    }


    // ==============================
    // VENDAS
    // ==============================
    //
    // O projeto ainda não possui
    // uma tabela de vendas.
    //

    const vendas =
        document.getElementById(
            'vendasHoje'
        );

    if (vendas) {

        vendas.textContent = '0';
    }


}


// Aguardar DOM estar pronto antes de carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', carregarPainel);
} else {
    carregarPainel();
}
import { supabase } from './supabase.js';

console.log('================================');
console.log('TESTE SUPABASE');
console.log('================================');

async function testarSupabase() {

    console.log('Tentando buscar categorias...');

    const {
        data,
        error
    } = await supabase
        .from('categorias')
        .select('*');

    if (error) {

        console.error(
            '❌ ERRO NO SUPABASE:',
            error
        );

        return;
    }

    console.log(
        '✅ SUPABASE CONECTADO!'
    );

    console.log(
        'Categorias encontradas:',
        data
    );

}

testarSupabase();
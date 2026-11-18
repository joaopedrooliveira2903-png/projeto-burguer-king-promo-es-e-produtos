// ⚠️  AVISO DE SEGURANÇA ⚠️
// As credenciais Supabase NÃO devem ser expostas no código!
// Use variáveis de ambiente para armazenar esses valores.
//
// PARA PRODUÇÃO, use:
// - Arquivo .env.local com as credenciais
// - Importar através de import.meta.env.VITE_*
//
// NÃO comitar este arquivo com credenciais reais no repositório!
// Adicione .env.local ao .gitignore

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL =
    'https://savdjbiovceacwdiitwf.supabase.co';

const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhdmRqYmlvdmNlYWN3ZGlpdHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTg5NzQsImV4cCI6MjEwMjczNDk3NH0.ZDkSERdD7MxQRLK8oteqQPBZzIeoue4vPdAZPMCUAZA';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

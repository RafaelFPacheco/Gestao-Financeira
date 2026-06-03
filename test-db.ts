import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const envUrl = envFile.split('\n').find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
const envKey = envFile.split('\n').find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY='))?.split('=')[1]?.trim();

const supabase = createClient(envUrl!, envKey!);

async function test() {
  console.log("Testing insert into revenues...");
  const { data, error } = await supabase.from('revenues').insert({
    offer: 'Teste de Diagnóstico',
    value: 100
  });
  
  if (error) {
    console.error("ERRO SUPABASE:", JSON.stringify(error, null, 2));
  } else {
    console.log("SUCESSO:", data);
  }
}

test();

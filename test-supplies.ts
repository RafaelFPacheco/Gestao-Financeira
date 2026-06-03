import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    acc[key.trim()] = value.join('=').trim().replace(/['"]/g, '');
  }
  return acc;
}, {} as any);

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing insert into supplies...");
  const { data, error } = await supabase.from('supplies').insert({
    partner: 'Test',
    description: 'Test',
    value: 100
  });
  console.log("Result:", { data, error });
}

test();

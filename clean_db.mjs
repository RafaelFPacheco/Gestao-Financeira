import postgres from 'postgres';

const sql = postgres('postgresql://postgres:9aY65r-DEdcmwV_@db.qqhlsdmnylycjglenqpe.supabase.co:5432/postgres', {
  ssl: 'require'
});

async function main() {
  try {
    console.log("A limpar o lixo antigo...");

    // 1. Apagar todas as despesas que são "Receita / Faturamento"
    const res1 = await sql`DELETE FROM expenses WHERE transaction_type = 'Receita / Faturamento' RETURNING id`;
    console.log(`Apagadas ${res1.length} falsas receitas do banco.`);

    // 2. Apagar todas as despesas de anúncios do banco (Facebk/Facebook)
    const res2 = await sql`DELETE FROM expenses WHERE category = 'Anúncios' AND (description ILIKE '%FACEBK%' OR description ILIKE '%FACEBOOK%') RETURNING id`;
    console.log(`Apagados ${res2.length} gastos de Ads do banco.`);

    // 3. Apagar transferências para o Rafael Pacheco antes do dia 1 de Julho de 2026
    const res3 = await sql`DELETE FROM expenses WHERE description ILIKE '%Rafael Pacheco%' AND created_at < '2026-07-01' RETURNING id`;
    console.log(`Apagadas ${res3.length} transferências antigas para o Rafael.`);

    console.log("Limpeza concluída com sucesso!");
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    process.exit(0);
  }
}

main();

import postgres from 'postgres';

const sql = postgres('postgresql://postgres:9aY65r-DEdcmwV_@db.qqhlsdmnylycjglenqpe.supabase.co:5432/postgres', {
  ssl: 'require'
});

async function main() {
  try {
    console.log("A mudar o nome da conta na base de dados...");

    const res = await sql`
      UPDATE marketing_metrics 
      SET source = 'Elasticos' 
      WHERE source = 'Conta Principal'
      RETURNING id
    `;
    console.log(`Atualizados ${res.length} registos na tabela marketing_metrics de "Conta Principal" para "Elasticos".`);

  } catch (error) {
    console.error("Erro:", error);
  } finally {
    process.exit(0);
  }
}

main();

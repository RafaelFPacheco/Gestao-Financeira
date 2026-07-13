import postgres from 'postgres';

const sql = postgres('postgresql://postgres:9aY65r-DEdcmwV_@db.qqhlsdmnylycjglenqpe.supabase.co:5432/postgres', {
  ssl: 'require'
});

async function main() {
  const data = await sql`SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'marketing_metrics'`;
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

main();

import postgres from 'postgres';

const sql = postgres('postgresql://postgres:9aY65r-DEdcmwV_@db.qqhlsdmnylycjglenqpe.supabase.co:5432/postgres', {
  ssl: 'require'
});

async function main() {
  const data = await sql`SELECT id, created_at, description, value FROM revenues ORDER BY id DESC LIMIT 20`;
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

main();

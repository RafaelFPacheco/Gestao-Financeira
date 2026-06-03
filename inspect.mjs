import postgres from 'postgres';

const sql = postgres('postgresql://postgres:9aY65r-DEdcmwV_@db.qqhlsdmnylycjglenqpe.supabase.co:5432/postgres', {
  ssl: 'require'
});

async function main() {
  try {
    const columns = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name IN ('expenses', 'marketing_metrics', 'revenues', 'goals');
    `;
    console.log(JSON.stringify(columns, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

main();

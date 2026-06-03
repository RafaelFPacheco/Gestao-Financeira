import postgres from 'postgres';

const sql = postgres('postgresql://postgres:9aY65r-DEdcmwV_@db.qqhlsdmnylycjglenqpe.supabase.co:5432/postgres', {
  ssl: 'require'
});

async function main() {
  try {
    console.log("Creating enum types...");
    await sql`
      DO $$ BEGIN
        CREATE TYPE expense_frequency AS ENUM ('Semanal', 'Mensal', 'Trimestral', 'Anual', 'Único');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await sql`
      DO $$ BEGIN
        CREATE TYPE expense_paid_by AS ENUM ('Rodrigo Severino', 'Gonçalo Miranda', 'Rafael Pacheco');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    console.log("Creating expenses table...");
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        description TEXT NOT NULL,
        value NUMERIC(10, 2) NOT NULL,
        frequency expense_frequency NOT NULL,
        paid_by expense_paid_by NOT NULL,
        receipt_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log("Database provisioned successfully.");
  } catch (err) {
    console.error("Error provisioning database:", err);
  } finally {
    await sql.end();
  }
}

main();

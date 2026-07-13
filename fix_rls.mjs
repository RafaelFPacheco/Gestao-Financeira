import postgres from 'postgres';

const sql = postgres('postgresql://postgres:9aY65r-DEdcmwV_@db.qqhlsdmnylycjglenqpe.supabase.co:5432/postgres', {
  ssl: 'require'
});

async function main() {
  try {
    console.log("Fixing RLS for marketing_metrics...");
    
    // Create marketing_metrics if it doesn't exist just in case
    await sql`
      CREATE TABLE IF NOT EXISTS marketing_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE NOT NULL,
        source VARCHAR(255) NOT NULL,
        spend DECIMAL(10,2) NOT NULL DEFAULT 0,
        revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Drop any existing policies
    await sql`DROP POLICY IF EXISTS "Enable read access for all users" ON marketing_metrics`;
    await sql`DROP POLICY IF EXISTS "Enable insert access for all users" ON marketing_metrics`;
    await sql`DROP POLICY IF EXISTS "Enable update access for all users" ON marketing_metrics`;
    await sql`DROP POLICY IF EXISTS "Enable delete access for all users" ON marketing_metrics`;
    await sql`DROP POLICY IF EXISTS "Permitir tudo para todos" ON marketing_metrics`;

    // Enable RLS and add open policies
    await sql`ALTER TABLE marketing_metrics ENABLE ROW LEVEL SECURITY`;
    
    await sql`
      CREATE POLICY "Permitir tudo para todos" 
      ON marketing_metrics 
      FOR ALL 
      USING (true) 
      WITH CHECK (true);
    `;

    console.log("RLS fixed successfully.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

main();

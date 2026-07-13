import postgres from 'postgres';

const sql = postgres('postgresql://postgres:9aY65r-DEdcmwV_@db.qqhlsdmnylycjglenqpe.supabase.co:5432/postgres', {
  ssl: 'require'
});

async function main() {
  try {
    console.log("A atualizar o histórico...");

    // Contabilista
    const res1 = await sql`
      UPDATE expenses 
      SET category = 'Contabilista' 
      WHERE description ILIKE '%R C R LDA%' OR description ILIKE '%CONTABILISTA%'
      RETURNING id
    `;
    console.log(`Atualizados ${res1.length} registos para Contabilista.`);

    // Impostos
    const res2 = await sql`
      UPDATE expenses 
      SET category = 'Impostos' 
      WHERE description ILIKE '%IMPOSTO DO SELO%' 
         OR description ILIKE '%CUSTO DE SERVICO INTERNACIONAL%' 
         OR description ILIKE '%SEGURANCA SOCIAL%' 
         OR description ILIKE '%COM.MAN.CONTA%'
      RETURNING id
    `;
    console.log(`Atualizados ${res2.length} registos para Impostos.`);

    // Software
    const res3 = await sql`
      UPDATE expenses 
      SET category = 'Software' 
      WHERE description ILIKE '%UTMIFY%' 
         OR description ILIKE '%PROXY%' 
         OR description ILIKE '%CAPCUT%' 
         OR description ILIKE '%EASYPAY%' 
         OR description ILIKE '%INVOICE EXPRES%'
      RETURNING id
    `;
    console.log(`Atualizados ${res3.length} registos para Software.`);

    // Salários (apenas para registos mais recentes, ou todos se a regra for geral)
    // Para o Rafael, apaguei os antigos, portanto os que existem podem ir para salários
    const res4 = await sql`
      UPDATE expenses 
      SET category = 'Salários' 
      WHERE description ILIKE '%RAFAEL PACHECO%' 
         OR description ILIKE '%GONCALO MIRANDA%' 
         OR description ILIKE '%GONÇALO MIRANDA%' 
         OR description ILIKE '%RODRIGO SEVERINO%'
      RETURNING id
    `;
    console.log(`Atualizados ${res4.length} registos para Salários.`);

    console.log("Histórico atualizado com sucesso!");
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    process.exit(0);
  }
}

main();

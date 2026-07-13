import { getReconciliationData } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";

export default async function ReconciliationPage() {
  const data = await getReconciliationData();

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <main className="min-h-screen p-6 md:p-10 lg:p-12 max-w-[1400px] mx-auto w-full">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao Dashboard
      </Link>

      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-glow flex items-center gap-3">
              <ArrowRightLeft className="text-primary" /> Cruzamento de Dados (Reconciliação)
            </h1>
            <p className="text-muted-foreground mt-2">
              Compara os gastos e receitas registados pelo Utmify com os movimentos reais do Banco.
              As diferenças podem dever-se a taxas de plataformas (ex: Hotmart) ou reembolsos.
            </p>
          </div>
          <Link href="/import" className="bg-secondary/50 hover:bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border">
            Importar Novos Dados
          </Link>
        </div>

        <div className="rounded-xl border border-border glass overflow-hidden shadow-xl mt-8">
          <div className="overflow-x-auto max-h-[700px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase sticky top-0 bg-background/95 backdrop-blur-md z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold w-32">Data</th>
                  
                  {/* Gastos */}
                  <th className="px-6 py-4 font-semibold text-right text-red-400 bg-red-500/5">Gasto Banco (Ads)</th>
                  <th className="px-6 py-4 font-semibold text-right text-red-400 bg-red-500/5">Gasto Utmify</th>
                  <th className="px-6 py-4 font-semibold text-right text-muted-foreground bg-red-500/5">Diferença (Gastos)</th>
                  
                  {/* Receitas */}
                  <th className="px-6 py-4 font-semibold text-right text-emerald-400 bg-emerald-500/5">Receita Banco</th>
                  <th className="px-6 py-4 font-semibold text-right text-emerald-400 bg-emerald-500/5">Receita Utmify</th>
                  <th className="px-6 py-4 font-semibold text-right text-muted-foreground bg-emerald-500/5">Diferença (Receitas)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {data.map((row, idx) => {
                  const spendDiff = row.bankSpend - row.utmifySpend;
                  // For spend diff: if Bank is higher than Utmify, we spent more than tracked.
                  
                  const revDiff = row.bankRevenue - row.utmifyRevenue;
                  // For rev diff: if Bank is lower than Utmify, it might be due to taxes. If Bank > Utmify, maybe extra un-tracked revenue.

                  return (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                        {new Date(row.date).toLocaleDateString('pt-PT')}
                      </td>
                      
                      {/* Gastos */}
                      <td className="px-6 py-4 text-right bg-red-500/5">{formatCurrency(row.bankSpend)}</td>
                      <td className="px-6 py-4 text-right bg-red-500/5 text-muted-foreground">{formatCurrency(row.utmifySpend)}</td>
                      <td className="px-6 py-4 text-right bg-red-500/5">
                        <span className={spendDiff > 0 ? "text-red-500 font-medium" : spendDiff < 0 ? "text-emerald-500 font-medium" : "text-muted-foreground"}>
                          {spendDiff > 0 ? '+' : ''}{spendDiff !== 0 ? formatCurrency(spendDiff) : '-'}
                        </span>
                      </td>

                      {/* Receitas */}
                      <td className="px-6 py-4 text-right bg-emerald-500/5">{formatCurrency(row.bankRevenue)}</td>
                      <td className="px-6 py-4 text-right bg-emerald-500/5 text-muted-foreground">{formatCurrency(row.utmifyRevenue)}</td>
                      <td className="px-6 py-4 text-right bg-emerald-500/5">
                        <span className={revDiff < 0 ? "text-red-500 font-medium" : revDiff > 0 ? "text-emerald-500 font-medium" : "text-muted-foreground"}>
                          {revDiff > 0 ? '+' : ''}{revDiff !== 0 ? formatCurrency(revDiff) : '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      Nenhum dado encontrado para comparar. Importa dados do banco e do Utmify para iniciar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

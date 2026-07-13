import Link from "next/link";
import { ArrowLeft, Building2, TrendingUp, ArrowRightLeft } from "lucide-react";

export default function ImportMenu() {
  return (
    <main className="min-h-screen p-6 md:p-10 lg:p-12 max-w-[1000px] mx-auto w-full">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao Dashboard
      </Link>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-glow">
            O que pretendes importar?
          </h1>
          <p className="text-muted-foreground mt-2">
            Escolhe o tipo de ficheiro que queres processar para atualizar o sistema.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Link href="/import/utmify" className="flex flex-col items-center justify-center p-10 glass border border-border hover:border-primary/50 rounded-2xl transition-all hover:-translate-y-1 group text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Relatório Utmify / Ads</h2>
            <p className="text-sm text-muted-foreground mt-2">Importa dados de vendas, faturamento diário, ROAS e gastos de contas específicas.</p>
          </Link>

          <Link href="/import/bank" className="flex flex-col items-center justify-center p-10 glass border border-border hover:border-blue-500/50 rounded-2xl transition-all hover:-translate-y-1 group text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Extrato Bancário (Millennium)</h2>
            <p className="text-sm text-muted-foreground mt-2">Importa despesas automáticas como FACEBK, UTMIFY e evita duplicações.</p>
          </Link>
          
          <Link href="/reconciliation" className="md:col-span-2 flex flex-col md:flex-row items-center justify-center p-6 glass border border-border hover:border-emerald-500/50 rounded-2xl transition-all hover:-translate-y-1 group text-center md:text-left gap-6">
            <div className="w-16 h-16 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowRightLeft className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Cruzamento de Dados (Reconciliação)</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Compara lado-a-lado o que importaste do Utmify com o que efetivamente saiu/entrou no Banco. Descobre diferenças, taxas e comissões.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

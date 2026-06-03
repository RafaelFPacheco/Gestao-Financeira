import { CreditCard, TrendingUp, Users, PiggyBank, HandCoins, Vault } from "lucide-react";

interface SummaryProps {
  totalExpenses: number;
  monthlyExpenses: number;
  partnerBalances: {
    rodrigo: number;
    goncalo: number;
    rafael: number;
    empresa: number;
  };
  totalOwedToCompany: number;
  totalSuprimentos: number;
  debtByPartner: {
    rodrigo: number;
    goncalo: number;
    rafael: number;
  };
  marketing: {
    totalRevenue: number;
    totalAdSpend: number;
    marketingProfit: number;
  };
}

export default function SummaryCards({ 
  totalExpenses, 
  monthlyExpenses, 
  partnerBalances, 
  totalOwedToCompany, 
  totalSuprimentos,
  debtByPartner,
  marketing
}: SummaryProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <div className="glass rounded-2xl border border-border/50 overflow-hidden shadow-2xl">
      {/* 1. Performance de Marketing */}
      <div className="p-6 md:p-8 border-b border-border/30 bg-emerald-500/[0.02]">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-emerald-500">
          <TrendingUp size={22} />
          Performance de Vendas (Utmify & Ads)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          <div>
            <p className="text-sm font-medium text-emerald-500/80 mb-1">Receita Total</p>
            <h3 className="text-3xl font-black tracking-tight text-emerald-500">{formatCurrency(marketing.totalRevenue)}</h3>
            <p className="text-xs text-muted-foreground mt-2">Ganhos importados via Utmify</p>
          </div>
          <div>
            <p className="text-sm font-medium text-red-500/80 mb-1">Gastos com Anúncios</p>
            <h3 className="text-3xl font-black tracking-tight text-red-500">{formatCurrency(marketing.totalAdSpend)}</h3>
            <p className="text-xs text-muted-foreground mt-2">Investimento Meta/Google Ads</p>
          </div>
          <div className={`p-4 rounded-xl border ${marketing.marketingProfit >= 0 ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
            <p className="text-sm font-medium text-foreground mb-1">Lucro Bruto (Ads)</p>
            <h3 className={`text-3xl font-black tracking-tight ${marketing.marketingProfit >= 0 ? 'text-foreground' : 'text-red-500'}`}>
              {formatCurrency(marketing.marketingProfit)}
            </h3>
            <p className="text-xs text-muted-foreground mt-2">Receitas - Gastos com Anúncios</p>
          </div>
        </div>
      </div>

      {/* 2. Despesas Gerais da Empresa */}
      <div className="p-6 md:p-8 border-b border-border/30 bg-primary/[0.02]">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-primary">
          <CreditCard size={22} />
          Despesas da Empresa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Gasto Total Acumulado</p>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(totalExpenses)}</h3>
            <p className="text-xs text-muted-foreground mt-2">Todas as saídas registadas na tabela</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Despesas Deste Mês</p>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(monthlyExpenses)}</h3>
            <p className="text-xs text-emerald-500 mt-2 font-medium">No mês atual</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Volume por Entidade</p>
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Empresa:</span>
                <span className="font-semibold text-primary">{formatCurrency(partnerBalances.empresa)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Rodrigo:</span>
                <span className="font-medium text-muted-foreground">{formatCurrency(partnerBalances.rodrigo)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Gonçalo:</span>
                <span className="font-medium text-muted-foreground">{formatCurrency(partnerBalances.goncalo)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Rafael:</span>
                <span className="font-medium text-muted-foreground">{formatCurrency(partnerBalances.rafael)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sócios: Dívidas e Suprimentos */}
      <div className="p-6 md:p-8 bg-orange-500/[0.02]">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-orange-500">
          <Users size={22} />
          Conta Corrente dos Sócios (Dívidas e Suprimentos)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          <div>
            <p className="text-sm font-medium text-orange-500/80 mb-1 flex items-center gap-2"><HandCoins size={14}/> A Receber dos Sócios</p>
            <h3 className="text-3xl font-black tracking-tight text-orange-500">{formatCurrency(totalOwedToCompany)}</h3>
            <p className="text-xs text-muted-foreground mt-2">Dívidas ativas dos sócios à empresa</p>
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-500/80 mb-1 flex items-center gap-2"><Vault size={14}/> Fundo de Suprimentos</p>
            <h3 className="text-3xl font-black tracking-tight text-emerald-500">{formatCurrency(totalSuprimentos)}</h3>
            <p className="text-xs text-muted-foreground mt-2">Dinheiro da empresa que pertence aos sócios</p>
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-background/50">
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2"><PiggyBank size={14}/> Balanço Individual</p>
            <div className="space-y-2">
              {[
                { name: 'Rafael Pacheco', value: debtByPartner.rafael },
                { name: 'Rodrigo Severino', value: debtByPartner.rodrigo },
                { name: 'Gonçalo Miranda', value: debtByPartner.goncalo }
              ].map(partner => (
                <div key={partner.name} className="flex justify-between items-center text-sm border-b border-border/30 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-muted-foreground">{partner.name}</span>
                  <span className={`font-bold ${partner.value > 0 ? 'text-orange-500' : partner.value < 0 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    {partner.value > 0 ? `Deve ${formatCurrency(partner.value)}` : 
                     partner.value < 0 ? `Tem ${formatCurrency(Math.abs(partner.value))}` : 
                     '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

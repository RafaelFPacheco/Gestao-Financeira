import DashboardSection from "@/components/DashboardSection";
import RevenueInputForm from "@/components/RevenueInputForm";
import RevenueChart from "@/components/RevenueChart";
import ExpenseInputForm from "@/components/ExpenseInputForm";
import CategoryChart from "@/components/CategoryChart";
import GoalsSection from "@/components/GoalsSection";
import SuppliesSection from "@/components/SuppliesSection";
import AdsSection from "@/components/AdsSection";
import ExpenseLogTable from "@/components/ExpenseLogTable";
import { getDashboardData } from "@/app/actions";
import Link from "next/link";
import { UploadCloud } from "lucide-react";

export default async function Home() {
  const { revenues, expenses, goals, recentExpenses, recentRevenues, supplies, marketingData } = await getDashboardData();

  return (
    <main className="min-h-screen p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto w-full">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            VEREDA100FIM
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Sistema de Gestão Financeira
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-background/50 border border-border px-3 py-2 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        
        {/* Faturamento Section */}
        <section>
          <DashboardSection 
            title="Faturamento"
            data={revenues}
            chartComponent={RevenueChart}
            formComponent={
              <div className="flex flex-col gap-4 h-full">
                <RevenueInputForm />
                <Link href="/import" className="w-full bg-background/50 hover:bg-white/5 border border-border text-foreground text-sm font-medium px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <UploadCloud size={18} className="text-primary" /> Importar Relatórios de Vendas
                </Link>
              </div>
            }
          />
        </section>

        {/* Despesas Section */}
        <section>
          <DashboardSection 
            title="Despesas"
            data={expenses}
            chartComponent={CategoryChart}
            formComponent={<ExpenseInputForm />}
          />
        </section>

        {/* Metas Section */}
        <section>
          <GoalsSection 
            goals={goals}
            revenues={revenues}
            expenses={expenses}
          />
        </section>

        {/* Ads Section */}
        <section>
          <AdsSection data={marketingData} />
        </section>

        {/* Suprimentos Section */}
        <section>
          <SuppliesSection supplies={supplies} />
        </section>

        {/* Bottom Section: Table Log */}
        <section>
          <ExpenseLogTable expenses={recentExpenses} revenues={recentRevenues} />
        </section>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

type TimeFilter = 'day' | 'week' | 'month' | 'year';

interface DashboardSectionProps {
  title: string;
  data: {
    day: { total: number; chartData: any[] };
    week: { total: number; chartData: any[] };
    month: { total: number; chartData: any[] };
    year: { total: number; chartData: any[] };
  };
  chartComponent: React.ComponentType<{ data: any[] }>;
  formComponent?: React.ReactNode;
}

export default function DashboardSection({ title, data, chartComponent: Chart, formComponent }: DashboardSectionProps) {
  const [filter, setFilter] = useState<TimeFilter>('month');

  const currentData = data[filter];

  return (
    <div className="bg-card text-card-foreground rounded-2xl p-5 md:p-6 shadow-sm border border-border flex flex-col gap-5 w-full">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-1">
        {/* Painel Esquerdo: Total e Gráfico */}
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Total</p>
            <p className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {formatCurrency(currentData.total)}
            </p>
          </div>
          
          <div className="w-full h-[300px] mt-2">
            <Chart data={currentData.chartData} />
          </div>

          {/* Filtros de Tempo */}
          <div className="flex justify-center mt-auto pt-2">
            <div className="flex bg-background/50 border border-border p-1 rounded-md">
              {(['day', 'week', 'month', 'year'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    filter === t
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background'
                  }`}
                >
                  {t === 'day' && 'Dia'}
                  {t === 'week' && 'Semana'}
                  {t === 'month' && 'Mês'}
                  {t === 'year' && 'Ano'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Painel Direito: Form */}
        {formComponent && (
          <div className="w-full lg:w-2/5 flex flex-col">
            {formComponent}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/utils/formatters";

type TimeFilter = 'all' | 'day' | 'week' | 'month' | 'year';

interface MarketingMetric {
  id: string;
  source: string;
  spend: number;
  revenue: number;
  date: string;
}

interface AdsSectionProps {
  data: MarketingMetric[];
}

function isInTimeRange(dateStr: string, type: TimeFilter, now: Date) {
  if (type === 'all') return true;
  
  const date = new Date(dateStr);
  if (type === 'day') {
    return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (type === 'week') {
    const dayOfWeek = now.getDay() || 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  }
  if (type === 'month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (type === 'year') {
    return date.getFullYear() === now.getFullYear();
  }
  return false;
}

export default function AdsSection({ data }: AdsSectionProps) {
  const [filter, setFilter] = useState<TimeFilter>('all');

  const { totalSpend, totalRevenue, totalProfit, roas } = useMemo(() => {
    const now = new Date();
    let spend = 0;
    let rev = 0;

    data.forEach(item => {
      if (isInTimeRange(item.date, filter, now)) {
        spend += Number(item.spend) || 0;
        rev += Number(item.revenue) || 0;
      }
    });

    const roasCalc = spend > 0 ? (rev / spend) : 0;
    const profit = rev - spend;

    return { totalSpend: spend, totalRevenue: rev, totalProfit: profit, roas: roasCalc };
  }, [data, filter]);

  return (
    <div className="bg-card text-card-foreground rounded-2xl p-5 md:p-6 shadow-sm border border-border flex flex-col gap-5 w-full">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Performance de Ads</h2>
        
        <div className="flex bg-background/50 border border-border p-1 rounded-md">
          {(['all', 'day', 'week', 'month', 'year'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filter === t
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background'
              }`}
            >
              {t === 'all' && 'Desde Sempre'}
              {t === 'day' && 'Dia'}
              {t === 'week' && 'Semana'}
              {t === 'month' && 'Mês'}
              {t === 'year' && 'Ano'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <div className="bg-background/30 rounded-xl p-5 border border-border flex flex-col">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Gasto em Ads</span>
          <span className="text-3xl font-bold text-red-500">
            {formatCurrency(totalSpend)}
          </span>
        </div>

        <div className="bg-background/30 rounded-xl p-5 border border-border flex flex-col">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Lucro de Ads</span>
          <span className="text-3xl font-bold text-emerald-500">
            {formatCurrency(totalProfit)}
          </span>
        </div>

        <div className="bg-background/30 rounded-xl p-5 border border-border flex flex-col">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">ROAS</span>
          <span className="text-3xl font-bold text-white">
            {roas.toFixed(2)}x
          </span>
        </div>
      </div>
    </div>
  );
}

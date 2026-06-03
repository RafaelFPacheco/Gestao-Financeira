"use client";

import { useState } from "react";
import { Target, Edit2, Check, X } from "lucide-react";
import { updateGoals } from "@/app/actions";

interface GoalsProps {
  goals: {
    actuals: {
      dailyRevenue: number;
      weeklyRevenue: number;
      monthlyRevenue: number;
      dailyProfit: number;
      weeklyProfit: number;
      monthlyProfit: number;
    };
    targets: {
      daily_revenue: number;
      weekly_revenue: number;
      monthly_revenue: number;
      daily_profit: number;
      weekly_profit: number;
      monthly_profit: number;
    };
  };
}

export default function GoalsPanel({ goals }: GoalsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    daily_revenue: goals.targets.daily_revenue || 0,
    weekly_revenue: goals.targets.weekly_revenue || 0,
    monthly_revenue: goals.targets.monthly_revenue || 0,
    daily_profit: goals.targets.daily_profit || 0,
    weekly_profit: goals.targets.weekly_profit || 0,
    monthly_profit: goals.targets.monthly_profit || 0,
  });

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

  const calculateProgress = (actual: number, target: number) => {
    if (target <= 0) return 0;
    const pct = (actual / target) * 100;
    return Math.min(Math.max(pct, 0), 100);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateGoals(form);
    setIsSaving(false);
    setIsEditing(false);
  };

  const ProgressBar = ({ title, actual, target, colorClass, bgClass }: any) => {
    const progress = calculateProgress(actual, target);
    const isCompleted = actual >= target && target > 0;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-right">
            <p className={`text-lg font-bold ${isCompleted ? colorClass : 'text-foreground'}`}>
              {formatCurrency(actual)}
            </p>
            <p className="text-xs text-muted-foreground">
              de {formatCurrency(target)}
            </p>
          </div>
        </div>
        <div className="h-3 w-full bg-background/50 rounded-full overflow-hidden border border-border/50">
          <div 
            className={`h-full ${colorClass.replace('text-', 'bg-')} transition-all duration-1000 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const EditInput = ({ label, value, field }: any) => (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
        <input 
          type="number" 
          value={value}
          onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
          className="w-full bg-background border border-border rounded-lg py-2 pl-7 pr-3 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>
    </div>
  );

  return (
    <div className="glass rounded-2xl border border-border/50 p-6 md:p-8 shadow-xl mt-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/30">
        <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
          <Target className="text-primary" size={24} />
          Metas de Performance
        </h2>
        
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-background/50 border border-transparent hover:border-border"
          >
            <Edit2 size={16} />
            Editar Metas
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border bg-background"
              disabled={isSaving}
            >
              <X size={16} />
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 text-sm font-medium text-primary-foreground transition-colors px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90"
              disabled={isSaving}
            >
              <Check size={16} />
              {isSaving ? "A gravar..." : "Guardar Metas"}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
          <div className="space-y-4 p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <h3 className="font-semibold text-emerald-500 mb-4">🎯 Metas de Faturação (Receitas)</h3>
            <EditInput label="Meta Diária" value={form.daily_revenue} field="daily_revenue" />
            <EditInput label="Meta Semanal" value={form.weekly_revenue} field="weekly_revenue" />
            <EditInput label="Meta Mensal" value={form.monthly_revenue} field="monthly_revenue" />
          </div>
          <div className="space-y-4 p-5 rounded-xl border border-primary/20 bg-primary/5">
            <h3 className="font-semibold text-primary mb-4">💰 Metas de Lucro Líquido</h3>
            <EditInput label="Meta Diária" value={form.daily_profit} field="daily_profit" />
            <EditInput label="Meta Semanal" value={form.weekly_profit} field="weekly_profit" />
            <EditInput label="Meta Mensal" value={form.monthly_profit} field="monthly_profit" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-300">
          <div className="space-y-8">
            <h3 className="font-semibold text-emerald-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Faturação (Receitas)
            </h3>
            <ProgressBar title="Hoje" actual={goals.actuals.dailyRevenue} target={goals.targets.daily_revenue} colorClass="text-emerald-500" />
            <ProgressBar title="Esta Semana" actual={goals.actuals.weeklyRevenue} target={goals.targets.weekly_revenue} colorClass="text-emerald-500" />
            <ProgressBar title="Este Mês" actual={goals.actuals.monthlyRevenue} target={goals.targets.monthly_revenue} colorClass="text-emerald-500" />
          </div>
          
          <div className="space-y-8">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span> Lucro Líquido
            </h3>
            <ProgressBar title="Hoje" actual={goals.actuals.dailyProfit} target={goals.targets.daily_profit} colorClass="text-primary" />
            <ProgressBar title="Esta Semana" actual={goals.actuals.weeklyProfit} target={goals.targets.weekly_profit} colorClass="text-primary" />
            <ProgressBar title="Este Mês" actual={goals.actuals.monthlyProfit} target={goals.targets.monthly_profit} colorClass="text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}

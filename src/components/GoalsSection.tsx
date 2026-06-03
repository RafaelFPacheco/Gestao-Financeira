"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import { Edit2, Check, X } from "lucide-react";
import { updateGoals } from "@/app/actions";

type TimeFilter = 'day' | 'week' | 'month' | 'year';

interface GoalsSectionProps {
  goals: any;
  revenues: Record<TimeFilter, { total: number }>;
  expenses: Record<TimeFilter, { total: number }>;
}

export default function GoalsSection({ goals, revenues, expenses }: GoalsSectionProps) {
  const [filter, setFilter] = useState<TimeFilter>('month');
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoals, setEditedGoals] = useState(goals);
  const [isSaving, setIsSaving] = useState(false);

  const actualRevenue = revenues[filter].total;
  const actualProfit = actualRevenue - expenses[filter].total;

  const revenueGoalKey = `${filter === 'year' ? 'yearly' : filter}_revenue`;
  const profitGoalKey = `${filter === 'year' ? 'yearly' : filter}_profit`;

  const revenueGoal = editedGoals[revenueGoalKey] || 0;
  const profitGoal = editedGoals[profitGoalKey] || 0;

  const revenuePercent = revenueGoal > 0 ? Math.min(100, Math.round((actualRevenue / revenueGoal) * 100)) : 0;
  const profitPercent = profitGoal > 0 ? Math.min(100, Math.max(0, Math.round((actualProfit / profitGoal) * 100))) : 0;

  const handleSave = async () => {
    setIsSaving(true);
    await updateGoals(editedGoals);
    setIsSaving(false);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditedGoals(goals);
    setIsEditing(false);
  };

  return (
    <div className="bg-card text-card-foreground rounded-2xl p-5 md:p-6 shadow-sm border border-border flex flex-col gap-5 w-full">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-bold">Metas</h2>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
              <Edit2 size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={handleSave} disabled={isSaving} className="p-1 bg-emerald-500/20 text-emerald-500 rounded hover:bg-emerald-500/30 transition-colors disabled:opacity-50">
                <Check size={16} />
              </button>
              <button onClick={cancelEdit} disabled={isSaving} className="p-1 bg-destructive/20 text-destructive rounded hover:bg-destructive/30 transition-colors disabled:opacity-50">
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {/* Faturamento */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Faturamento</h3>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">{formatCurrency(actualRevenue)}</span>
            <span className="text-muted-foreground text-lg mb-0.5">/</span>
            {isEditing ? (
              <input
                type="number"
                value={revenueGoal}
                onChange={(e) => setEditedGoals({ ...editedGoals, [revenueGoalKey]: Number(e.target.value) })}
                className="bg-background border border-border rounded px-2 py-1 text-lg font-medium w-28 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <span className="text-muted-foreground text-lg font-medium mb-0.5">{formatCurrency(revenueGoal)} de meta</span>
            )}
          </div>
          
          <div className="w-full bg-background border border-border rounded-full h-3 mt-1 overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-1000 ease-out"
              style={{ width: `${revenuePercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-md">
              {revenuePercent}%
            </span>
          </div>
        </div>

        {/* Lucro */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lucro</h3>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">{formatCurrency(actualProfit)}</span>
            <span className="text-muted-foreground text-lg mb-0.5">/</span>
            {isEditing ? (
              <input
                type="number"
                value={profitGoal}
                onChange={(e) => setEditedGoals({ ...editedGoals, [profitGoalKey]: Number(e.target.value) })}
                className="bg-background border border-border rounded px-2 py-1 text-lg font-medium w-28 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <span className="text-muted-foreground text-lg font-medium mb-0.5">{formatCurrency(profitGoal)} de meta</span>
            )}
          </div>
          
          <div className="w-full bg-background border border-border rounded-full h-3 mt-1 overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-1000 ease-out"
              style={{ width: `${profitPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-md">
              {profitPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Filtros de Tempo */}
      <div className="flex justify-center mt-2">
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
  );
}

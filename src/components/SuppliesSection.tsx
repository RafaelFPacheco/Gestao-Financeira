"use client";

import { useActionState, useEffect, useRef } from "react";
import { addSupply } from "@/app/actions";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface Supply {
  id: string;
  partner: string;
  description: string;
  value: number;
  created_at: string;
}

interface SuppliesSectionProps {
  supplies: Supply[];
}

export default function SuppliesSection({ supplies }: SuppliesSectionProps) {
  const [state, formAction, isPending] = useActionState(addSupply, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  // Calculate totals
  let rodrigoTotal = 0;
  let goncaloTotal = 0;
  let rafaelTotal = 0;
  let overallTotal = 0;

  supplies.forEach(s => {
    const val = Number(s.value) || 0;
    overallTotal += val;
    if (s.partner === 'Rodrigo Severino') {
      rodrigoTotal += val;
    } else if (s.partner === 'Gonçalo Miranda') {
      goncaloTotal += val;
    } else if (s.partner === 'Rafael Pacheco') {
      rafaelTotal += val;
    } else if (s.partner === 'Empresa') {
      rodrigoTotal += val / 3;
      goncaloTotal += val / 3;
      rafaelTotal += val / 3;
    }
  });

  return (
    <div className="bg-card text-card-foreground rounded-2xl p-5 md:p-6 shadow-sm border border-border flex flex-col gap-5 w-full">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold">Suprimentos</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-1">
        {/* Painel Esquerdo: Totais */}
        <div className="w-full lg:w-3/5 flex flex-col gap-6">
          
          <div className="bg-background/30 rounded-xl p-5 border border-border">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Totais por Sócio</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="font-medium">Rodrigo Severino</span>
                <span className="font-bold text-emerald-500">{formatCurrency(rodrigoTotal)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="font-medium">Gonçalo Miranda</span>
                <span className="font-bold text-emerald-500">{formatCurrency(goncaloTotal)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="font-medium">Rafael Pacheco</span>
                <span className="font-bold text-emerald-500">{formatCurrency(rafaelTotal)}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t-2 border-border flex justify-between items-end">
              <span className="text-sm font-bold uppercase text-muted-foreground">Valor Total Injetado</span>
              <span className="text-3xl font-black text-white">{formatCurrency(overallTotal)}</span>
            </div>
          </div>
          
        </div>

        {/* Painel Direito: Formulário */}
        <div className="w-full lg:w-2/5 flex flex-col">
          <div className="bg-background/50 border border-border rounded-xl p-5">
            <form ref={formRef} action={formAction} className="space-y-4">
              {state?.error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg">
                  {state.error}
                </div>
              )}
              {state?.success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-lg">
                  {state.success}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1.5" htmlFor="partner">Sócio que Injetou</label>
                <select 
                  id="partner"
                  name="partner"
                  required
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                >
                  <option value="">Selecione quem pagou...</option>
                  <option value="Empresa">Por Empresa (A dividir por 3)</option>
                  <option value="Rodrigo Severino">Rodrigo Severino</option>
                  <option value="Gonçalo Miranda">Gonçalo Miranda</option>
                  <option value="Rafael Pacheco">Rafael Pacheco</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" htmlFor="description">Descrição</label>
                <input 
                  type="text" 
                  id="description" 
                  name="description"
                  placeholder="Ex: Injeção de Capital Inicial" 
                  required
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" htmlFor="value">Valor (€)</label>
                  <input 
                    id="value"
                    name="value"
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" htmlFor="created_at">Data (Opcional)</label>
                  <input 
                    id="created_at"
                    name="created_at"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-muted-foreground" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium rounded-lg px-4 py-2.5 text-xs flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {isPending ? "A registar..." : (
                  <>
                    <Plus size={16} /> Registar Suprimento
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

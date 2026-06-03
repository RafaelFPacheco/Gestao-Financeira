"use client";

import { Plus } from "lucide-react";
import { addRevenue } from "@/app/actions";
import { useActionState, useEffect, useRef } from "react";

export default function RevenueInputForm() {
  const [state, formAction, isPending] = useActionState(addRevenue, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
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
          <label className="block text-xs font-medium mb-1.5" htmlFor="offer">Oferta</label>
          <input 
            type="text" 
            id="offer" 
            name="offer"
            placeholder="Ex: Mentoria VIP, Curso Online, E-book..." 
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
              <Plus size={18} /> Registar Faturamento
            </>
          )}
        </button>
      </form>
    </div>
  );
}

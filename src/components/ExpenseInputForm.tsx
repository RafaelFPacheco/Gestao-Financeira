"use client";

import { UploadCloud, Plus } from "lucide-react";
import { addExpense } from "@/app/actions";
import { useActionState } from "react";
import { useEffect, useRef } from "react";

export default function ExpenseInputForm() {
  const [state, formAction, isPending] = useActionState(addExpense, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      const label = document.getElementById('file-name-label');
      if (label) label.innerText = 'Clique para fazer upload ou arraste o ficheiro';
    }
  }, [state]);

  return (
    <div className="glass rounded-xl p-5 h-full flex flex-col justify-center">
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
          <label className="block text-xs font-medium mb-1.5" htmlFor="description">Descrição</label>
          <input 
            type="text" 
            id="description" 
            name="description"
            placeholder="Ex: Domínio Website, Material de Escritório" 
            required
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid grid-cols-2 gap-3 col-span-2">
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
          
          <div>
            <label className="block text-xs font-medium mb-1.5" htmlFor="frequency">Frequência</label>
            <select 
              id="frequency"
              name="frequency"
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
            >
              <option value="">Selecione...</option>
              <option value="Semanal">Semanal</option>
              <option value="Mensal">Mensal</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Anual">Anual</option>
              <option value="Único">Único</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" htmlFor="category">Categoria</label>
            <select 
              id="category"
              name="category"
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
            >
              <option value="">Selecione...</option>
              <option value="Software">Software / Serviços Cloud</option>
              <option value="Marketing">Marketing e Publicidade</option>
              <option value="Equipamentos">Equipamentos e Material</option>
              <option value="Escritório">Despesas de Escritório</option>
              <option value="Viagens">Viagens e Deslocações</option>
              <option value="Impostos">Impostos e Taxas</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" htmlFor="partner">Pago Por</label>
            <select 
              id="partner"
              name="partner"
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
            >
              <option value="">Selecione quem pagou...</option>
              <option value="Empresa">Empresa</option>
              <option value="Rodrigo Severino">Rodrigo Severino</option>
              <option value="Gonçalo Miranda">Gonçalo Miranda</option>
              <option value="Rafael Pacheco">Rafael Pacheco</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" htmlFor="transaction_type">Tipo de Movimento</label>
            <select 
              id="transaction_type"
              name="transaction_type"
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
            >
              <option value="Despesa da Empresa">Despesa da Empresa</option>
              <option value="Despesa Pessoal (Sócio deve à Empresa)">Despesa Pessoal (Sócio deve à Empresa)</option>
              <option value="Devolução / Entrada de Dinheiro">Devolução / Entrada de Dinheiro</option>
              <option value="Sócio pagou do próprio bolso">Sócio pagou do próprio bolso</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" htmlFor="receipt">Anexar Fatura/Recibo</label>
          <div className="relative border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group">
            <input 
              type="file" 
              id="receipt"
              name="receipt"
              accept=".pdf,.jpg,.jpeg,.png"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const label = document.getElementById('file-name-label');
                  if (label) label.innerText = file.name;
                }
              }}
            />
            <div className="p-2 bg-primary/10 text-primary rounded-full mb-2 group-hover:scale-110 transition-transform">
              <UploadCloud size={18} />
            </div>
            <p id="file-name-label" className="text-xs font-medium">Clique para fazer upload ou arraste</p>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium rounded-lg px-4 py-2.5 text-xs flex items-center justify-center gap-2 transition-colors mt-2"
        >
          {isPending ? "A registar..." : (
            <>
              <Plus size={16} /> Registar Despesa
            </>
          )}
        </button>
      </form>
    </div>
  );
}

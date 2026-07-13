"use client";

import { FileText, CheckCircle2, Trash2, Search, Filter, DownloadCloud, Edit2, X, Save } from "lucide-react";
import { markAsReimbursed, deleteExpense, editExpense, deleteRevenue, editRevenue } from "@/app/actions";
import { useTransition, useState } from "react";

export interface Expense {
  id: string;
  description?: string;
  offer?: string;
  value: number;
  frequency?: string;
  category?: string;
  paid_by?: string;
  created_at: string;
  receipt_url?: string | null;
  transaction_type?: string;
  is_reimbursed?: boolean | null;
  type?: 'expense' | 'revenue';
}

interface ExpenseLogTableProps {
  expenses: any[];
  revenues: any[];
}

export default function ExpenseLogTable({ expenses, revenues }: ExpenseLogTableProps) {
  const allTransactions = [
    ...expenses.map(e => ({ ...e, type: 'expense' })),
    ...revenues.map(r => ({ ...r, type: 'revenue', description: r.offer, transaction_type: 'Faturamento', paid_by: 'Cliente' }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPartner, setFilterPartner] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterCategory, setFilterCategory] = useState("Todas");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ description: "", value: 0, frequency: "", category: "Outros", created_at: "" });

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const handleReimburse = (id: string) => {
    startTransition(async () => {
      await markAsReimbursed(id);
    });
  };

  const handleDelete = (id: string, type?: 'expense' | 'revenue') => {
    if (window.confirm("Tem a certeza que deseja eliminar este registo? Esta ação não pode ser desfeita.")) {
      startTransition(async () => {
        if (type === 'revenue') {
          await deleteRevenue(id);
        } else {
          await deleteExpense(id);
        }
      });
    }
  };

  const startEditing = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm({
      description: expense.description || expense.offer || "",
      value: expense.value,
      frequency: expense.frequency || "Único",
      category: expense.category || "Outros",
      created_at: expense.created_at.split('T')[0]
    });
  };

  const saveEdit = (id: string, type?: 'expense' | 'revenue') => {
    startTransition(async () => {
      const formattedDate = editForm.created_at ? new Date(`${editForm.created_at}T12:00:00Z`).toISOString() : undefined;
      
      if (type === 'revenue') {
        const dataToSave = {
          offer: editForm.description,
          value: editForm.value,
          created_at: formattedDate
        };
        await editRevenue(id, dataToSave);
      } else {
        const dataToSave = {
          ...editForm,
          created_at: formattedDate
        };
        await editExpense(id, dataToSave);
      }
      setEditingId(null);
    });
  };

  const filteredExpenses = allTransactions.filter((expense) => {
    if (searchTerm && !expense.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterPartner !== "Todos" && expense.paid_by !== filterPartner) return false;
    if (filterCategory !== "Todas" && expense.category !== filterCategory) return false;
    
    if (filterStatus !== "Todos") {
      const isPartnerOwes = expense.transaction_type === 'Despesa Pessoal (Sócio deve à Empresa)' && expense.paid_by !== 'Empresa';
      const needsReturn = isPartnerOwes && !expense.is_reimbursed;
      const isDevolucao = expense.transaction_type === 'Devolução / Entrada de Dinheiro';
      
      if (filterStatus === "Em Dívida" && !needsReturn) return false;
      if (filterStatus === "Resolvido" && (!expense.is_reimbursed || !isPartnerOwes)) return false;
      if (filterStatus === "Transferência" && !isDevolucao) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["Data", "Descrição", "Tipo", "Pago Por", "Valor", "Estado"];
    const rows = filteredExpenses.map(exp => {
      const isPartnerOwes = exp.transaction_type === 'Despesa Pessoal (Sócio deve à Empresa)' && exp.paid_by !== 'Empresa';
      const estado = exp.type === 'revenue' ? "Recebido" :
                   exp.paid_by === 'Empresa' ? "-" :
                   exp.transaction_type === 'Devolução / Entrada de Dinheiro' ? "Transferência" :
                   exp.is_reimbursed ? "Resolvido" : "Em Dívida";
                   
      return [
        formatDate(exp.created_at),
        `"${(exp.description || exp.offer || "").replace(/"/g, '""')}"`,
        `"${exp.transaction_type}"`,
        `"${exp.paid_by}"`,
        exp.value.toString().replace(".", ","),
        estado
      ].join(";");
    });
    
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gestao_financeira_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = Array.from(new Set(allTransactions.map(e => e.category).filter(Boolean))).sort() as string[];

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/40">
        <div>
          <h3 className="text-lg font-semibold">Histórico de Transações</h3>
          <p className="text-sm text-muted-foreground mt-1">Registo completo de todos os movimentos e suprimentos</p>
        </div>
        
        <button 
          onClick={handleExportCSV}
          className="bg-secondary/80 hover:bg-secondary text-secondary-foreground text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <DownloadCloud size={16} /> Exportar Excel
        </button>
      </div>

      <div className="p-4 border-b border-border/50 bg-background/20 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={14} className="text-muted-foreground" />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-background/50 border border-border rounded-lg pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
            >
              <option value="Todas">Todas as Categorias</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={14} className="text-muted-foreground" />
            </div>
            <select
              value={filterPartner}
              onChange={(e) => setFilterPartner(e.target.value)}
              className="bg-background/50 border border-border rounded-lg pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
            >
              <option value="Todos">Todos os Sócios</option>
              <option value="Empresa">Empresa</option>
              <option value="Rodrigo Severino">Rodrigo Severino</option>
              <option value="Gonçalo Miranda">Gonçalo Miranda</option>
              <option value="Rafael Pacheco">Rafael Pacheco</option>
            </select>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
          >
            <option value="Todos">Todos os Estados</option>
            <option value="Em Dívida">Em Dívida</option>
            <option value="Resolvido">Resolvido</option>
            <option value="Transferência">Transferência</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-border">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Data</th>
              <th scope="col" className="px-6 py-4 font-medium">Descrição</th>
              <th scope="col" className="px-6 py-4 font-medium">Tipo & Categoria</th>
              <th scope="col" className="px-6 py-4 font-medium">Estado</th>
              <th scope="col" className="px-6 py-4 font-medium">Pago Por</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Valor</th>
              <th scope="col" className="px-6 py-4 font-medium text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Search size={32} className="opacity-20 mb-3" />
                    <p>Nenhuma transação encontrada.</p>
                  </div>
                </td>
              </tr>
            ) : filteredExpenses.map((expense) => {
              const isPartnerOwes = expense.transaction_type === 'Despesa Pessoal (Sócio deve à Empresa)' && expense.paid_by !== 'Empresa';
              const needsReturn = isPartnerOwes && !expense.is_reimbursed;
              const isEditing = editingId === expense.id;
              const isRevenue = expense.type === 'revenue';
              
              return (
                <tr key={expense.id} className={`hover:bg-white/[0.02] transition-colors group ${needsReturn ? 'bg-orange-500/5' : ''} ${isEditing ? 'bg-white/5' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                    {isEditing ? (
                      <input 
                        type="date"
                        value={editForm.created_at}
                        onChange={(e) => setEditForm({...editForm, created_at: e.target.value})}
                        className="bg-background border border-border rounded px-2 py-1 w-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    ) : (
                      formatDate(expense.created_at)
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="bg-background border border-border rounded px-2 py-1 w-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder={isRevenue ? "Ex: Mentoria VIP, Curso..." : "Descrição"}
                      />
                    ) : (expense.description || expense.offer)}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      !isRevenue ? (
                        <div className="flex flex-col gap-2">
                          <select 
                            value={editForm.frequency}
                            onChange={(e) => setEditForm({...editForm, frequency: e.target.value})}
                            className="bg-background border border-border rounded px-2 py-1 w-full text-xs focus:outline-none"
                          >
                            <option value="Único">Único</option>
                            <option value="Semanal">Semanal</option>
                            <option value="Mensal">Mensal</option>
                            <option value="Trimestral">Trimestral</option>
                            <option value="Anual">Anual</option>
                          </select>
                          <select 
                            value={editForm.category}
                            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                            className="bg-background border border-border rounded px-2 py-1 w-full text-xs focus:outline-none"
                          >
                            <option value="Software">Software</option>
                            <option value="Anúncios">Anúncios</option>
                            <option value="Equipamentos">Equipamentos</option>
                            <option value="Escritório">Escritório</option>
                            <option value="Viagens">Viagens</option>
                            <option value="Impostos">Impostos</option>
                            <option value="Outros">Outros</option>
                          </select>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 text-xs italic">Não aplicável</span>
                      )
                    ) : (
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${isRevenue ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary/50 text-secondary-foreground border-border/50'}`}>
                          {expense.transaction_type === 'Devolução / Entrada de Dinheiro' ? 'Devolução' : 
                           expense.transaction_type === 'Despesa Pessoal (Sócio deve à Empresa)' ? 'Despesa Pessoal' : 
                           isRevenue ? 'Faturamento' :
                           expense.frequency}
                        </span>
                        {!isRevenue && (expense.transaction_type === 'Despesa da Empresa' || expense.transaction_type === 'Sócio pagou do próprio bolso') && (
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                            {expense.category || 'Outros'}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isRevenue ? (
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                         Recebido
                       </span>
                    ) : expense.paid_by === 'Empresa' ? (
                      <span className="text-muted-foreground/50">-</span>
                    ) : expense.transaction_type === 'Devolução / Entrada de Dinheiro' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        Transferência
                      </span>
                    ) : expense.is_reimbursed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Resolvido
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse">
                        Em Dívida
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {expense.paid_by}
                  </td>
                  <td className="px-6 py-4 font-semibold text-right">
                    {isEditing ? (
                      <input 
                        type="number" 
                        step="0.01"
                        value={editForm.value}
                        onChange={(e) => setEditForm({...editForm, value: parseFloat(e.target.value)})}
                        className="bg-background border border-border rounded px-2 py-1 w-20 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    ) : (
                      <span className={isRevenue ? "text-emerald-500" : ""}>
                        {isRevenue ? "+" : ""}{formatCurrency(expense.value)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(expense.id, expense.type)} disabled={isPending} className="text-emerald-500 hover:bg-emerald-500/10 p-1.5 rounded disabled:opacity-50" title="Guardar">
                            <Save size={16} />
                          </button>
                          <button onClick={() => setEditingId(null)} disabled={isPending} className="text-muted-foreground hover:bg-white/10 p-1.5 rounded disabled:opacity-50" title="Cancelar">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          {!isRevenue && expense.receipt_url ? (
                            <a href={expense.receipt_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-primary/10" title="Ver Fatura">
                              <FileText size={16} />
                            </a>
                          ) : !isRevenue ? (
                            <span className="text-muted-foreground/30 text-xs w-[28px]">-</span>
                          ) : null}
                          
                          {needsReturn && (
                            <button 
                              onClick={() => handleReimburse(expense.id)}
                              disabled={isPending}
                              className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1.5 rounded border border-emerald-500/20 transition-all flex items-center gap-1 ml-1"
                              title="Marcar como Devolvido"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}

                          <button 
                            onClick={() => startEditing(expense)}
                            disabled={isPending}
                            className="text-muted-foreground hover:text-blue-400 transition-colors p-1.5 rounded-md hover:bg-blue-400/10 ml-1"
                            title="Editar Registo"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button 
                            onClick={() => handleDelete(expense.id, expense.type)}
                            disabled={isPending}
                            className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-500/10 ml-1"
                            title="Eliminar Registo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

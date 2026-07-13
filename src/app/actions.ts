"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addExpense(prevState: any, formData: FormData) {
  const description = formData.get("description") as string;
  const value = parseFloat(formData.get("value") as string);
  const frequency = formData.get("frequency") as string;
  const paid_by = formData.get("partner") as string;
  const transaction_type = formData.get("transaction_type") as string;
  const category = (formData.get("category") as string) || "Outros";
  const file = formData.get("receipt") as File | null;

  if (!description || isNaN(value) || !frequency || !paid_by || !transaction_type) {
    return { error: "Todos os campos obrigatórios devem ser preenchidos." };
  }

  const supabase = await createClient();
  let receipt_url = null;

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, file, { cacheControl: '3600', upsert: false });
      
    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return { error: "Erro ao anexar o ficheiro. Confirme se a pasta 'receipts' foi criada." };
    }
    
    const { data: publicUrlData } = supabase.storage.from("receipts").getPublicUrl(fileName);
    receipt_url = publicUrlData.publicUrl;
  }

  const dateInput = formData.get("created_at") as string;

  const insertData: any = {
    description,
    value,
    frequency,
    category,
    paid_by,
    transaction_type,
    receipt_url,
    is_reimbursed: (transaction_type === 'Despesa Pessoal (Sócio deve à Empresa)' || transaction_type === 'Sócio pagou do próprio bolso') ? false : null,
  };

  if (dateInput) {
    insertData.created_at = new Date(`${dateInput}T12:00:00Z`).toISOString();
  }

  const { error } = await supabase.from("expenses").insert(insertData);

  if (error) {
    console.error("Error inserting expense:", error);
    return { error: "Erro ao registar a transação na base de dados." };
  }

  revalidatePath("/");
  return { success: "Transação registada com sucesso!" };
}

export async function addRevenue(prevState: any, formData: FormData) {
  const offer = formData.get("offer") as string;
  const value = parseFloat(formData.get("value") as string);
  const dateInput = formData.get("created_at") as string;

  if (!offer || isNaN(value)) {
    return { error: "Oferta e Valor são obrigatórios." };
  }

  const supabase = await createClient();

  const insertData: any = {
    offer,
    value,
  };

  if (dateInput) {
    insertData.created_at = new Date(`${dateInput}T12:00:00Z`).toISOString();
  }

  const { error } = await supabase.from("revenues").insert(insertData);

  if (error) {
    console.error("Error inserting revenue:", error);
    return { error: "Erro ao registar o faturamento. A tabela revenues existe?" };
  }

  revalidatePath("/");
  return { success: "Faturamento registado com sucesso!" };
}

export async function addSupply(prevState: any, formData: FormData) {
  const partner = formData.get("partner") as string;
  const description = formData.get("description") as string;
  const value = parseFloat(formData.get("value") as string);
  const dateInput = formData.get("created_at") as string;

  if (!partner || isNaN(value)) {
    return { error: "Sócio e Valor são obrigatórios." };
  }

  const supabase = await createClient();

  const insertData: any = { partner, description, value };
  if (dateInput) {
    insertData.created_at = new Date(`${dateInput}T12:00:00Z`).toISOString();
  }

  const { error } = await supabase.from("supplies").insert(insertData);

  if (error) {
    console.error("Error inserting supply:", error);
    return { error: "Erro ao registar suprimento. A tabela 'supplies' existe?" };
  }

  revalidatePath("/");
  return { success: "Suprimento registado com sucesso!" };
}

// Helper to determine if a date is within day, week, month, year
function isInTimeRange(date: Date, type: 'day' | 'week' | 'month' | 'year', now: Date) {
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

const catColors: Record<string, string> = {
  "Software": "#8b5cf6",
  "Anúncios": "#f43f5e",
  "Equipamentos": "#eab308",
  "Escritório": "#06b6d4",
  "Viagens": "#f97316",
  "Impostos": "#ef4444",
  "Contabilista": "#10b981",
  "Ads": "#3b82f6",
  "Outros": "#64748b"
};

const offerColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#f43f5e"];

export async function getDashboardData() {
  const supabase = await createClient();
  const now = new Date();

  const [expensesRes, revenuesRes, goalsRes, marketingRes, suppliesRes] = await Promise.all([
    supabase.from("expenses").select("*").order("created_at", { ascending: false }),
    supabase.from("revenues").select("*").order("created_at", { ascending: false }),
    supabase.from("goals").select("*").eq("id", "global").single(),
    supabase.from("marketing_metrics").select("*"),
    supabase.from("supplies").select("*").order("created_at", { ascending: false })
  ]);

  const rawExps = expensesRes.data || [];
  const rawRevs = revenuesRes.data || [];
  const marketingData = marketingRes?.data || [];
  const supplies = suppliesRes?.data || [];
  
  const combinedMarketingData = [
    ...marketingData,
    ...rawExps.filter((e: any) => {
      if (e.category !== "Anúncios") return false;
      const eDate = new Date(e.created_at).toISOString().split('T')[0];
      const hasUtmify = marketingData.some((m: any) => new Date(m.date).toISOString().split('T')[0] === eDate);
      return !hasUtmify;
    }).map((e: any) => ({
      id: e.id,
      source: "Banco",
      spend: e.value,
      revenue: 0,
      date: e.created_at
    })),
    ...rawRevs.filter((r: any) => {
      const rDate = new Date(r.created_at).toISOString().split('T')[0];
      const hasUtmify = marketingData.some((m: any) => new Date(m.date).toISOString().split('T')[0] === rDate);
      return !hasUtmify;
    }).map((r: any) => ({
      id: r.id,
      source: "Banco",
      spend: 0,
      revenue: r.value,
      date: r.created_at
    }))
  ];

  const goals = goalsRes.data || {
    daily_revenue: 0,
    weekly_revenue: 0,
    monthly_revenue: 0,
    daily_profit: 0,
    weekly_profit: 0,
    monthly_profit: 0,
    yearly_revenue: 0,
    yearly_profit: 0
  };

  const exps = [
    ...rawExps,
    ...marketingData.filter((m: any) => {
      // Prevent double counting if there are actual Bank ad expenses on this day
      const mDate = new Date(m.date).toISOString().split('T')[0];
      const hasBankAdExpense = rawExps.some((e: any) => 
        (e.category === "Anúncios" || e.category === "Ads") && 
        new Date(e.created_at).toISOString().split('T')[0] === mDate
      );
      return !hasBankAdExpense;
    }).map((m: any) => ({
      id: `mkt-${m.id || Math.random()}`,
      description: `Gasto Ads: ${m.source}`,
      value: m.spend,
      category: "Ads",
      transaction_type: "Despesa da Empresa",
      paid_by: "Empresa",
      created_at: m.date
    }))
  ];

  const revs = [
    ...rawRevs,
    ...marketingData.filter((m: any) => {
      // Only include marketing revenue if we don't have actual revenues for this day
      // (assuming they might import bank revenues eventually, but for now rely on Utmify)
      const mDate = new Date(m.date).toISOString().split('T')[0];
      const hasBankRevenue = rawRevs.some((r: any) => new Date(r.created_at).toISOString().split('T')[0] === mDate);
      return !hasBankRevenue;
    }).map(m => ({
      id: `mkt-${m.id || Math.random()}`,
      offer: m.source,
      value: m.revenue,
      created_at: m.date
    }))
  ];

  const times = ['day', 'week', 'month', 'year'] as const;

  const result = {
    revenues: {
      day: { total: 0, chartData: [] as any[] },
      week: { total: 0, chartData: [] as any[] },
      month: { total: 0, chartData: [] as any[] },
      year: { total: 0, chartData: [] as any[] },
    },
    expenses: {
      day: { total: 0, chartData: [] as any[] },
      week: { total: 0, chartData: [] as any[] },
      month: { total: 0, chartData: [] as any[] },
      year: { total: 0, chartData: [] as any[] },
    },
    goals: goals,
    recentExpenses: exps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 300),
    recentRevenues: revs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 300),
    supplies,
    marketingData: combinedMarketingData
  };

  // Process Revenues
  times.forEach(time => {
    const timeRevs = revs.filter(r => isInTimeRange(new Date(r.created_at), time, now));
    const total = timeRevs.reduce((acc, curr) => acc + Number(curr.value), 0);
    
    const offerMap = new Map<string, number>();
    timeRevs.forEach(r => {
      const offerName = r.offer ? String(r.offer) : "Sem Oferta";
      offerMap.set(offerName, (offerMap.get(offerName) || 0) + Number(r.value));
    });

    const chartData = Array.from(offerMap.entries()).map(([offer, value], idx) => ({
      name: offer,
      value: Number(value) > 0 ? Number(value) : 0,
      color: offerColors[idx % offerColors.length]
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

    result.revenues[time] = { total, chartData };
  });

  // Process Expenses
  times.forEach(time => {
    const timeExps = exps.filter(e => {
      // Considera apenas despesas da empresa
      if (!(e.transaction_type === 'Despesa da Empresa' || e.transaction_type === 'Despesa Pessoal (Sócio deve à Empresa)' || e.transaction_type === 'Despesa Reembolsável')) {
        return false;
      }
      return isInTimeRange(new Date(e.created_at), time, now);
    });

    const total = timeExps.reduce((acc, curr) => acc + Number(curr.value), 0);
    
    const catMap = new Map<string, number>();
    timeExps.forEach(e => {
      const cat = e.category || 'Outros';
      catMap.set(cat, (catMap.get(cat) || 0) + Number(e.value));
    });

    const chartData = Array.from(catMap.entries()).map(([category, value]) => ({
      name: category,
      value,
      color: catColors[category] || "#64748b"
    })).sort((a, b) => b.value - a.value);

    result.expenses[time] = { total, chartData };
  });

  return result;
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  await supabase.from("expenses").delete().eq("id", id);
  revalidatePath("/");
  return { success: true };
}

export async function markAsReimbursed(id: string) {
  const supabase = await createClient();
  await supabase.from("expenses").update({ is_reimbursed: true, reimbursed_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/");
  return { success: true };
}

export async function updateGoals(updates: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .upsert({ id: 'global', ...updates }, { onConflict: "id" });

  if (error) {
    console.error("Error saving goals:", error);
    return { error: "Falha ao gravar metas." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function editExpense(id: string, updates: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update(updates)
    .eq("id", id);
    
  if (error) {
    console.error("Error editing expense:", error);
    return { error: "Erro ao editar o registo." };
  }
  
  revalidatePath("/");
  return { success: true };
}

export async function deleteRevenue(id: string) {
  const supabase = await createClient();
  await supabase.from("revenues").delete().eq("id", id);
  revalidatePath("/");
  return { success: true };
}

export async function editRevenue(id: string, updates: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("revenues")
    .update(updates)
    .eq("id", id);
    
  if (error) {
    console.error("Error editing revenue:", error);
    return { error: "Erro ao editar o registo." };
  }
  
  revalidatePath("/");
  return { success: true };
}

export async function saveMarketingMetrics(data: any[]): Promise<{success?: boolean, error?: string}> {
  const supabase = await createClient();
  
  for (const row of data) {
    const { data: existing } = await supabase
      .from("marketing_metrics")
      .select("id")
      .eq("date", row.date)
      .eq("source", row.source)
      .single();

    if (existing) {
      await supabase.from("marketing_metrics").update({
        spend: row.spend,
        revenue: row.revenue
      }).eq("id", existing.id);
    } else {
      await supabase.from("marketing_metrics").insert(row);
    }
  }

  revalidatePath("/");
  return { success: true };
}

export async function saveBankTransactions(data: any[]): Promise<{success?: boolean, count?: number, error?: string}> {
  const supabase = await createClient();
  
  let inserted = 0;
  for (const row of data) {
    const { data: existing } = await supabase
      .from("expenses")
      .select("id")
      .eq("description", row.description)
      .eq("value", row.value)
      .eq("created_at", row.created_at)
      .single();

    if (!existing) {
      const { error } = await supabase.from("expenses").insert(row);
      if (!error) inserted++;
      else console.error("Error inserting bank tx:", error);
    }
  }
  
  revalidatePath("/");
  return { success: true, count: inserted, error: undefined };
}

export async function getReconciliationData() {
  const supabase = await createClient();

  const [expensesRes, revenuesRes, marketingRes] = await Promise.all([
    supabase.from("expenses").select("*").in("category", ["Anúncios", "Ads"]).order("created_at", { ascending: false }),
    supabase.from("revenues").select("*").order("created_at", { ascending: false }), // Assuming some revenues from bank might exist
    supabase.from("marketing_metrics").select("*").order("date", { ascending: false })
  ]);

  const bankAds = expensesRes.data || [];
  const bankRevs = revenuesRes.data || [];
  const utmifyAds = marketingRes.data || [];

  const dateMap = new Map<string, {
    date: string,
    bankSpend: number,
    bankRevenue: number,
    utmifySpend: number,
    utmifyRevenue: number,
    details: {
      bankTx: any[],
      utmifyTx: any[]
    }
  }>();

  const getOrCreate = (d: string) => {
    if (!dateMap.has(d)) {
      dateMap.set(d, { date: d, bankSpend: 0, bankRevenue: 0, utmifySpend: 0, utmifyRevenue: 0, details: { bankTx: [], utmifyTx: [] } });
    }
    return dateMap.get(d)!;
  };

  // Process Bank Ads
  bankAds.forEach(tx => {
    const d = new Date(tx.created_at).toISOString().split('T')[0];
    const entry = getOrCreate(d);
    entry.bankSpend += Number(tx.value);
    entry.details.bankTx.push(tx);
  });

  // Process Bank Revenues (if any)
  bankRevs.forEach(tx => {
    const d = new Date(tx.created_at).toISOString().split('T')[0];
    const entry = getOrCreate(d);
    entry.bankRevenue += Number(tx.value);
    entry.details.bankTx.push(tx);
  });

  // Process Utmify
  utmifyAds.forEach(tx => {
    const d = new Date(tx.date).toISOString().split('T')[0];
    const entry = getOrCreate(d);
    entry.utmifySpend += Number(tx.spend);
    entry.utmifyRevenue += Number(tx.revenue);
    entry.details.utmifyTx.push(tx);
  });

  return Array.from(dateMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

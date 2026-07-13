"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Building2 } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveBankTransactions } from "@/app/actions";
import Link from "next/link";

type BankTransaction = {
  description: string;
  value: number;
  frequency: string;
  category: string;
  paid_by: string;
  transaction_type: string;
  created_at: string;
};

export default function BankImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedBank, setParsedBank] = useState<BankTransaction[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "parsing" | "success" | "error" | "saving" | "saved">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveCount, setSaveCount] = useState<number>(0);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };

  const normalizeKey = (k: string) => k.toLowerCase().trim();

  const findKey = (row: Record<string, string>, keywords: string[]) => {
    const keys = Object.keys(row);
    for (const kw of keywords) { if (keys.includes(kw)) return row[kw]; }
    for (const kw of keywords) { const match = keys.find(k => k.includes(kw)); if (match) return row[match]; }
    const cleanKeys = keys.map(k => ({ original: k, clean: k.replace(/[^a-z0-9]/g, '') }));
    const cleanKeywords = keywords.map(kw => kw.replace(/[^a-z0-9]/g, ''));
    for (const kw of cleanKeywords) {
      if (!kw) continue;
      const match = cleanKeys.find(ck => ck.clean.includes(kw));
      if (match) return row[match.original];
    }
    return undefined;
  };

  const cleanNumber = (val: string | undefined) => {
    if (!val) return "0";
    let clean = val.replace(/[^0-9.,-]/g, '');
    if (clean.includes('.') && clean.includes(',')) clean = clean.replace(/\./g, '').replace(',', '.');
    else if (clean.includes(',')) clean = clean.replace(',', '.');
    return clean;
  };

  const parseDate = (dateVal: string) => {
    try {
      if (dateVal.includes("/")) {
        const parts = dateVal.split("/");
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return new Date(dateVal).toISOString().split('T')[0];
    } catch(e) {
      return new Date().toISOString().split('T')[0];
    }
  }

  const processBankData = (data: any[]) => {
    let rawHeaders: string[] = [];
    if (data.length > 0) rawHeaders = Object.keys(data[0]);

    const transactions: BankTransaction[] = [];
    data.forEach((rawRow) => {
      const row: Record<string, string> = {};
      for (const [key, value] of Object.entries(rawRow)) row[normalizeKey(key)] = String(value);

      let dateVal = findKey(row, ["data lançamento", "data valor", "data", "date"]);
      if (!dateVal) return;
      dateVal = parseDate(dateVal);

      const desc = findKey(row, ["descrição", "description", "detalhe", "movimento"]);
      if (!desc) return;

      const amountStr = findKey(row, ["montante", "valor", "amount", "importância"]);
      const amount = parseFloat(cleanNumber(amountStr)) || 0;
      if (amount === 0) return;
      
      // Ignorar ganhos/receitas do banco
      if (amount > 0) return;

      let category = "Outros";
      let transaction_type = "Despesa da Empresa";
      
      const upperDesc = desc.toUpperCase();
      
      // Ignorar gastos de Ads (Facebk)
      if (upperDesc.includes("FACEBK") || upperDesc.includes("FACEBOOK")) return;
      else if (upperDesc.includes("UTMIFY")) category = "Software";

      // Ignorar transferências para o Rafael Pacheco antes do dia 1 do mês atual
      if (upperDesc.includes("RAFAEL") && upperDesc.includes("PACHECO")) {
        const txDate = new Date(dateVal);
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);
        if (txDate < currentMonthStart) return;
      }

      transactions.push({
        description: desc.trim(),
        value: Math.abs(amount),
        frequency: "Único",
        category,
        paid_by: "Empresa",
        transaction_type: "Despesa da Empresa",
        created_at: new Date(`${dateVal}T12:00:00Z`).toISOString()
      });
    });

    setParsedBank(transactions);
    setDetectedHeaders(rawHeaders);
    setStatus("success");
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setStatus("parsing");
    setSaveError(null);

    const isExcel = selectedFile.name.match(/\.(xlsx|xls)$/i);
    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const rawRows: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "" });
          
          let headerRowIndex = 0;
          for (let i = 0; i < Math.min(rawRows.length, 30); i++) {
            const rowStr = rawRows[i].join(" ").toLowerCase();
            if ((rowStr.includes("data") && rowStr.includes("descri")) || (rowStr.includes("data") && rowStr.includes("montante"))) {
              headerRowIndex = i;
              break;
            }
          }

          const headers = rawRows[headerRowIndex].map((h: any) => String(h || ""));
          const jsonData = rawRows.slice(headerRowIndex + 1).map(row => {
            const obj: Record<string, any> = {};
            headers.forEach((h, idx) => {
              obj[h] = row[idx];
            });
            return obj;
          });

          processBankData(jsonData);
        } catch (err) { console.error(err); setStatus("error"); }
      };
      reader.onerror = () => setStatus("error");
      reader.readAsArrayBuffer(selectedFile);
    } else {
      Papa.parse<any>(selectedFile, {
        header: true, skipEmptyLines: true,
        complete: (results) => processBankData(results.data),
        error: () => setStatus("error")
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleSaveToDatabase = async () => {
    setStatus("saving");
    try {
      const expensesOnly = parsedBank.filter(t => t.transaction_type === "Despesa da Empresa");
      const result = await saveBankTransactions(expensesOnly);
      if (result.error) throw new Error(result.error);
      setSaveCount(result.count || 0);
      setStatus("saved");
    } catch (err: any) {
      console.error(err); setSaveError(err.message || "Falha ao gravar na base de dados"); setStatus("error");
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <main className="min-h-screen p-6 md:p-10 lg:p-12 max-w-[1200px] mx-auto w-full">
      <Link href="/import" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Link>

      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-glow flex items-center gap-3">
              <Building2 className="text-blue-500" /> Extrato Bancário (Millennium)
            </h1>
            <p className="text-muted-foreground mt-2">Carrega o ficheiro Excel exportado do Millennium BCP. O sistema irá extrair e categorizar despesas automáticas.</p>
          </div>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 glass ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"}`}
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        >
          <input type="file" accept=".csv,.tsv,.xlsx,.xls" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
            <div className="p-4 bg-background/50 rounded-full shadow-lg border border-border"><UploadCloud className={`h-8 w-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} /></div>
            <div><p className="text-lg font-medium text-foreground">Clica ou arrasta o Extrato do Banco para aqui</p></div>
          </div>
        </div>

        {status === "success" && parsedBank.length === 0 && (
          <div className="flex flex-col space-y-3 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-500">
            <div className="flex items-center text-lg font-bold"><AlertCircle className="h-6 w-6 mr-3" /><span>Nenhum Dado Reconhecido!</span></div>
            <div className="mt-4 p-4 bg-black/20 rounded-lg border border-yellow-500/10">
              <p className="text-xs font-semibold mb-2 uppercase tracking-wider">Cabeçalhos detetados no ficheiro:</p>
              <div className="flex flex-wrap gap-2">{detectedHeaders.map((h, i) => <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs">{h}</span>)}</div>
            </div>
          </div>
        )}

        {(status === "success" || status === "saving" || status === "saved") && parsedBank.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {status === "saved" ? (
              <div className="flex items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500"><CheckCircle2 className="h-5 w-5 mr-3" /><span>Operação concluída com sucesso! Foram importadas {saveCount} novas despesas (duplicados ignorados).</span></div>
            ) : (
              <div className="flex items-center p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary"><CheckCircle2 className="h-5 w-5 mr-3" /><span>Ficheiro processado. Encontradas {parsedBank.length} linhas válidas.</span></div>
            )}

            <div className="rounded-xl border border-border glass overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-border/50 flex justify-between items-center bg-background/40">
                <h3 className="font-semibold text-foreground">Pré-visualização dos Dados Bancários</h3>
                <button onClick={handleSaveToDatabase} disabled={status === "saving" || status === "saved"} className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                  {status === "saving" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {status === "saved" ? "Guardado!" : "Gravar na Base de Dados"}
                </button>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase sticky top-0 bg-background">
                    <tr><th className="px-6 py-4 font-semibold">Data</th><th className="px-6 py-4 font-semibold">Descrição</th><th className="px-6 py-4 font-semibold">Categoria</th><th className="px-6 py-4 font-semibold text-right">Montante</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {parsedBank.map((row, idx) => {
                      const isExpense = row.transaction_type === "Despesa da Empresa";
                      return (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">{new Date(row.created_at).toLocaleDateString('pt-PT')}</td>
                          <td className="px-6 py-4">{row.description}</td>
                          <td className="px-6 py-4"><span className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded text-xs font-medium">{row.category}</span></td>
                          <td className={`px-6 py-4 text-right font-bold ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>{isExpense ? '-' : '+'}{formatCurrency(row.value)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

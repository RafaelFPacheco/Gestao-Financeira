"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveMarketingMetrics } from "@/app/actions";
import Link from "next/link";

type ParsedRow = {
  Date?: string;
  Spend?: string;
  Revenue?: string;
  Campaign?: string;
};

type DailyMetric = {
  date: string;
  spend: number;
  revenue: number;
  source: string;
};

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedData, setParsedData] = useState<DailyMetric[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "parsing" | "success" | "error" | "saving" | "saved">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const normalizeKey = (k: string) => k.toLowerCase().trim();

  const findKey = (row: Record<string, string>, keywords: string[]) => {
    const keys = Object.keys(row);
    
    // 1. Exact match by priority
    for (const kw of keywords) {
      if (keys.includes(kw)) return row[kw];
    }
    
    // 2. Partial match by priority
    for (const kw of keywords) {
      const match = keys.find(k => k.includes(kw));
      if (match) return row[match];
    }
    
    // 3. Clean match by priority
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
    if (clean.includes('.') && clean.includes(',')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.');
    }
    return clean;
  };

  const processParsedData = (data: any[]) => {
    const dailyMap = new Map<string, DailyMetric>();
    
    let rawHeaders: string[] = [];
    if (data.length > 0) {
      rawHeaders = Object.keys(data[0]);
    }

    data.forEach((rawRow) => {
      const row: Record<string, string> = {};
      for (const [key, value] of Object.entries(rawRow)) {
        row[normalizeKey(key)] = String(value);
      }

      let dateVal = findKey(row, ["date", "data", "dia", "reporting starts", "início", "day", "created_at"]);
      if (!dateVal) dateVal = new Date().toISOString().split('T')[0];
      
      try {
        // Simple date cleanup if it's in DD/MM/YYYY
        if (dateVal.includes("/")) {
          const parts = dateVal.split("/");
          if (parts.length === 3) {
            // Assume DD/MM/YYYY
            dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }
        dateVal = new Date(dateVal).toISOString().split('T')[0];
      } catch(e) {
        dateVal = new Date().toISOString().split('T')[0];
      }

      const spendStr = findKey(row, ["spend", "gastos", "gasto", "despesas", "valor gasto", "amount spent", "cost", "custo", "importância gasta"]);
      const spend = parseFloat(cleanNumber(spendStr)) || 0;
      
      const revenueStr = findKey(row, ["faturamento", "total revenue", "revenue", "receita", "valor de conversão", "purchase value", "purchase roas", "valor de compras", "lucro", "vendas"]);
      const revenue = parseFloat(cleanNumber(revenueStr)) || 0;
      
      if (spend === 0 && revenue === 0) return;

      if (!dailyMap.has(dateVal)) {
        dailyMap.set(dateVal, { date: dateVal, spend: 0, revenue: 0, source: "" });
      }
      
      const current = dailyMap.get(dateVal)!;
      current.spend += spend;
      current.revenue += revenue;
    });

    const results = Array.from(dailyMap.values()).map(r => {
      let source = "Misto";
      if (r.spend > 0 && r.revenue === 0) source = "Meta Ads";
      if (r.spend === 0 && r.revenue > 0) source = "Utmify / Vendas";
      return { ...r, source };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setParsedData(results);
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
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          processParsedData(json);
        } catch (err) {
          console.error(err);
          setStatus("error");
        }
      };
      reader.onerror = () => setStatus("error");
      reader.readAsArrayBuffer(selectedFile);
    } else {
      Papa.parse<any>(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processParsedData(results.data);
        },
        error: () => {
          setStatus("error");
        }
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSaveToDatabase = async () => {
    setStatus("saving");
    try {
      const result = await saveMarketingMetrics(parsedData);
      
      if (result.error) throw new Error(result.error);

      setStatus("saved");
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "Falha ao gravar na base de dados");
      setStatus("error");
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <main className="min-h-screen p-6 md:p-10 lg:p-12 max-w-[1200px] mx-auto w-full">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao Dashboard
      </Link>

      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-glow">
              Importar Relatórios de Performance
            </h1>
            <p className="text-muted-foreground mt-2">
              Carrega os teus relatórios do Utmify, Meta Ads ou Google Ads (CSV ou Excel). O sistema calcula os lucros automaticamente por dia.
            </p>
          </div>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 glass ${
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv,.tsv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
            <div className="p-4 bg-background/50 rounded-full shadow-lg border border-border">
              <UploadCloud className={`h-8 w-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                Clica ou arrasta o ficheiro para aqui
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Suporta Utmify / Meta Ads em CSV e Excel (.xlsx, .xls)
              </p>
            </div>
          </div>
        </div>

        {status === "success" && parsedData.length === 0 && (
          <div className="flex flex-col space-y-3 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-500">
            <div className="flex items-center text-lg font-bold">
              <AlertCircle className="h-6 w-6 mr-3" />
              <span>Nenhum Dado Financeiro Encontrado!</span>
            </div>
            <p className="text-sm opacity-90">
              O ficheiro foi lido, mas não encontrei colunas de Gasto, Receita ou Vendas.
            </p>
            <div className="mt-4 p-4 bg-black/20 rounded-lg border border-yellow-500/10">
              <p className="text-xs font-semibold mb-2 uppercase tracking-wider">Cabeçalhos detetados no ficheiro:</p>
              <div className="flex flex-wrap gap-2">
                {detectedHeaders.map((h, i) => (
                  <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {(status === "success" || status === "saving" || status === "saved") && parsedData.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {status === "saved" ? (
              <div className="flex items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500">
                <CheckCircle2 className="h-5 w-5 mr-3" />
                <span>Métricas guardadas com sucesso na base de dados! Podes voltar ao Dashboard.</span>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary">
                <CheckCircle2 className="h-5 w-5 mr-3" />
                <span>Ficheiro {file?.name} processado. Encontrados dados para {parsedData.length} dias diferentes.</span>
              </div>
            )}

            <div className="rounded-xl border border-border glass overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-border/50 flex justify-between items-center bg-background/40">
                <h3 className="font-semibold text-foreground">Pré-visualização (Por Dia)</h3>
                <button 
                  onClick={handleSaveToDatabase}
                  disabled={status === "saving" || status === "saved"}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  {status === "saving" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {status === "saved" ? "Guardado!" : "Gravar na Base de Dados"}
                </button>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase sticky top-0 bg-background">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Data</th>
                      <th className="px-6 py-4 font-semibold">Fonte</th>
                      <th className="px-6 py-4 font-semibold text-right text-red-400">Gastos (Ads)</th>
                      <th className="px-6 py-4 font-semibold text-right text-emerald-400">Receitas</th>
                      <th className="px-6 py-4 font-semibold text-right">Lucro Líquido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {parsedData.map((row, idx) => {
                      const profit = row.revenue - row.spend;
                      return (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                            {new Date(row.date).toLocaleDateString('pt-PT')}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded text-xs font-medium">
                              {row.source}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">{formatCurrency(row.spend)}</td>
                          <td className="px-6 py-4 text-right">{formatCurrency(row.revenue)}</td>
                          <td className={`px-6 py-4 text-right font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {formatCurrency(profit)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {status === "error" && (
          <div className="flex flex-col space-y-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-3" />
              <span className="font-semibold">Erro ao processar dados</span>
            </div>
            {saveError && <p className="text-sm ml-8 opacity-80">{saveError}</p>}
          </div>
        )}
      </div>
    </main>
  );
}

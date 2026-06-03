"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, CalendarDays, Infinity } from "lucide-react";

export default function TimeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTime = searchParams.get("time") || "all";

  const handleTimeChange = (time: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("time", time);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center bg-card/40 border border-border rounded-lg p-1">
      <button
        onClick={() => handleTimeChange("month")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
          currentTime === "month" 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }`}
      >
        <Calendar size={16} />
        <span className="hidden sm:inline">Este Mês</span>
      </button>
      <button
        onClick={() => handleTimeChange("year")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
          currentTime === "year" 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }`}
      >
        <CalendarDays size={16} />
        <span className="hidden sm:inline">Este Ano</span>
      </button>
      <button
        onClick={() => handleTimeChange("all")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
          currentTime === "all" 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }`}
      >
        <Infinity size={16} />
        <span className="hidden sm:inline">Sempre</span>
      </button>
    </div>
  );
}

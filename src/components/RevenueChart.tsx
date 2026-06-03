"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useMemo } from "react";
import { formatCurrency } from "@/utils/formatters";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface RevenueChartProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-[#131b2f]/95 backdrop-blur-sm border border-slate-800/80 rounded-lg p-3.5 shadow-2xl min-w-[180px]">
        <div className="flex items-center gap-2 mb-1.5 pb-2 border-b border-slate-700/50">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="font-semibold text-white truncate max-w-[200px]" title={data.name}>
            {data.name}
          </p>
        </div>
        
        <div className="flex justify-between items-center gap-4 text-sm mt-2">
          <span className="text-white font-medium">{formatCurrency(data.value)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data }: RevenueChartProps) {
  const legendPayload = useMemo(() => {
    return data.map(item => ({
      value: item.name,
      type: 'circle',
      id: item.name,
      color: item.color
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
        Sem dados para o período selecionado.
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={data.length > 1 ? 2 : 0}
            dataKey="value"
            stroke="transparent"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
          <Legend 
            // @ts-expect-error recharts typings omit payload but it works
            payload={legendPayload}
            verticalAlign="bottom" 
            height={24} 
            wrapperStyle={{ paddingTop: '20px' }} 
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

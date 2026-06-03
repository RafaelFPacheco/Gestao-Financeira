"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useMemo } from "react";

interface ChartData {
  name: string;
  value: number;
  color: string;
  frequency?: string;
}

interface ExpenseChartProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);
    
    return (
      <div className="bg-[#131b2f]/95 backdrop-blur-sm border border-slate-800/80 rounded-lg p-3.5 shadow-2xl min-w-[180px]">
        <div className="flex items-center gap-2 mb-1.5 pb-2 border-b border-slate-700/50">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="font-semibold text-white truncate max-w-[200px]" title={data.name}>
            {data.name}
          </p>
        </div>
        
        <div className="flex justify-between items-center gap-4 text-sm mt-2">
          <span className="text-slate-400 capitalize">{data.frequency || 'Sem Frequência'}</span>
          <span className="text-white font-medium">{formatCurrency(data.value)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ExpenseChart({ data }: ExpenseChartProps) {
  // Construir a legenda apenas com as frequências únicas que existem nos dados atuais
  const legendPayload = useMemo(() => {
    const uniqueFrequencies = Array.from(new Set(data.map(d => d.frequency))).filter(Boolean);
    return uniqueFrequencies.map(freq => {
      const item = data.find(d => d.frequency === freq);
      return {
        value: freq,
        type: 'circle',
        id: freq,
        color: item ? item.color : '#94a3b8'
      };
    });
  }, [data]);

  return (
    <div className="glass rounded-xl p-6 h-full min-h-[380px] flex flex-col">
      <h3 className="text-lg font-semibold mb-2">Custos por Frequência</h3>
      <div className="flex-1 w-full relative mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={2}
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
    </div>
  );
}

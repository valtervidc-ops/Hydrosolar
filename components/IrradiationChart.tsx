import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: number[];
}

export const IrradiationChart: React.FC<Props> = ({ data }) => {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const chartData = data.map((val, idx) => ({ month: months[idx], value: val }));
  const minVal = Math.min(...data);

  return (
    <div className="h-48 w-full bg-white p-2 rounded-xl border border-amber-100">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fef3c7" />
          <XAxis dataKey="month" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip 
            cursor={{fill: '#fef3c7', opacity: 0.4}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            formatter={(val: number) => [`${val} kWh/m²`, 'Irradiação']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value === minVal ? '#ef4444' : '#f59e0b'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="text-center text-xs text-amber-600 mt-1">
        Irradiação Mensal (Vermelho = Mês Crítico)
      </div>
    </div>
  );
};
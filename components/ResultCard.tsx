import React from 'react';

interface ResultCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  warning?: boolean;
  subtext?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, value, unit, icon, warning, subtext }) => (
  <div className={`p-4 rounded-xl border shadow-sm transition-all duration-200 ${warning ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className={`text-sm font-medium ${warning ? 'text-red-600' : 'text-slate-500'}`}>{title}</p>
        <div className="mt-1 flex items-baseline">
          <span className={`text-2xl font-bold ${warning ? 'text-red-700' : 'text-slate-800'}`}>{value}</span>
          {unit && <span className={`ml-1 text-sm ${warning ? 'text-red-600' : 'text-slate-500'}`}>{unit}</span>}
        </div>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
      {icon && <div className={`p-2 rounded-lg ${warning ? 'bg-red-100 text-red-500' : 'bg-primary/10 text-primary'}`}>{icon}</div>}
    </div>
  </div>
);
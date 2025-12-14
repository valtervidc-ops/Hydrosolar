import React from 'react';

interface InputGroupProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, value, onChange, unit, step = 1, min = 0, max }) => (
  <div className="flex flex-col mb-3">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
    <div className="flex items-center">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        min={min}
        max={max}
        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
      />
      {unit && <span className="ml-2 text-slate-600 font-medium">{unit}</span>}
    </div>
  </div>
);
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { CalculationResults, HydraulicInput } from '../types';

interface Props {
  results: CalculationResults;
  hydroInput: HydraulicInput;
}

export const PumpCurveChart: React.FC<Props> = ({ results, hydroInput }) => {
  // Generate curve data points: H = Hgeo + k * Q^2
  // We need to calculate 'k' for the system curve first.
  // h_tot = H_geo + hf + hL
  // hf and hL depend on Q^2.
  // Let's create a simplified array of points from 0 flow to 1.5x design flow.
  
  const data = [];
  const maxQ = results.designFlowLps * 1.5;
  const steps = 10;
  
  // Calculate system resistance coefficient approximately for the chart
  // Total Head = GeoHeight + Resistance * Q^2
  // Resistance = (TotalHead - GeoHeight) / (DesignFlow)^2
  const resistance = (results.manometricHead - hydroInput.geometricHeight) / Math.pow(results.designFlowLps, 2);

  for (let i = 0; i <= steps; i++) {
    const q = (maxQ / steps) * i;
    const h = hydroInput.geometricHeight + (resistance * Math.pow(q, 2));
    data.push({
      flow: parseFloat(q.toFixed(2)),
      head: parseFloat(h.toFixed(2)),
    });
  }

  return (
    <div className="h-64 w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Curva do Sistema (Altura Manométrica vs Caudal)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="flow" 
            label={{ value: 'Caudal (L/s)', position: 'insideBottomRight', offset: -5, fontSize: 12 }} 
            tick={{fontSize: 12}}
          />
          <YAxis 
            label={{ value: 'Altura (m)', angle: -90, position: 'insideLeft', fontSize: 12 }} 
            domain={[hydroInput.geometricHeight, 'auto']}
            tick={{fontSize: 12}}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} m`, 'Altura']}
            labelFormatter={(label: number) => `Caudal: ${label} L/s`}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="head" 
            stroke="#0ea5e9" 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6 }} 
          />
          <ReferenceLine x={results.designFlowLps} stroke="#ef4444" strokeDasharray="3 3">
            <Label value="Ponto de Operação" position="top" fill="#ef4444" fontSize={10} />
          </ReferenceLine>
          <ReferenceLine y={results.manometricHead} stroke="#ef4444" strokeDasharray="3 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
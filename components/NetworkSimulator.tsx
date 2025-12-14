import React, { useState } from 'react';
import { Plus, Trash2, Play } from 'lucide-react';
import { NetworkSegment } from '../types';
import { simulateNetwork } from '../utils/calculations';

interface Props {
  initialHead: number; // Reservoir height or Pump Head
  temperature: number;
  roughness: number;
}

export const NetworkSimulator: React.FC<Props> = ({ initialHead, temperature, roughness }) => {
  const [segments, setSegments] = useState<NetworkSegment[]>([
    { id: '1', length: 100, diameter: 50, elevationChange: 0, accessoriesK: 1.0, flow: 1.0 }
  ]);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const addSegment = () => {
    setSegments([...segments, { 
      id: (segments.length + 1).toString(), 
      length: 50, 
      diameter: 50, 
      elevationChange: 0, 
      accessoriesK: 0,
      flow: 1.0 
    }]);
  };

  const removeSegment = (idx: number) => {
    setSegments(segments.filter((_, i) => i !== idx));
  };

  const updateSegment = (idx: number, field: keyof NetworkSegment, val: number) => {
    const newSegs = [...segments];
    // @ts-ignore
    newSegs[idx][field] = val;
    setSegments(newSegs);
  };

  const handleSimulate = () => {
    const res = simulateNetwork(segments, initialHead, temperature, roughness);
    setSimulationResult(res);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Simulação de Rede (Perfil Linear)</h3>
        <p className="text-sm text-slate-500 mb-6">
          Defina os trechos da rede tubulada a partir do reservatório. O sistema calculará as pressões residuais nó a nó.
          <br/>
          <span className="text-xs font-mono bg-slate-100 p-1">Pressão Inicial = Altura Geométrica Reservatório ({initialHead} m)</span>
        </p>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-3 py-2">Trecho</th>
                <th className="px-3 py-2">Comp. (m)</th>
                <th className="px-3 py-2">Diâm. (mm)</th>
                <th className="px-3 py-2">ΔZ (m) (+Sobe/-Desce)</th>
                <th className="px-3 py-2">Σ K (Acess.)</th>
                <th className="px-3 py-2">Caudal (L/s)</th>
                <th className="px-3 py-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <input type="number" value={seg.length} onChange={(e) => updateSegment(idx, 'length', parseFloat(e.target.value))} className="w-20 p-1 border rounded" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={seg.diameter} onChange={(e) => updateSegment(idx, 'diameter', parseFloat(e.target.value))} className="w-20 p-1 border rounded" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={seg.elevationChange} onChange={(e) => updateSegment(idx, 'elevationChange', parseFloat(e.target.value))} className="w-20 p-1 border rounded" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={seg.accessoriesK} onChange={(e) => updateSegment(idx, 'accessoriesK', parseFloat(e.target.value))} className="w-16 p-1 border rounded" />
                  </td>
                  <td className="px-3 py-2">
                     <input type="number" value={seg.flow} onChange={(e) => updateSegment(idx, 'flow', parseFloat(e.target.value))} className="w-20 p-1 border rounded" />
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => removeSegment(idx)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4">
          <button onClick={addSegment} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20">
            <Plus className="w-4 h-4" /> Adicionar Trecho
          </button>
          <button onClick={handleSimulate} className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md">
            <Play className="w-4 h-4" /> Calcular Pressões
          </button>
        </div>
      </div>

      {simulationResult && (
        <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg">
           <h4 className="font-bold mb-4 flex items-center gap-2">Resultados da Simulação</h4>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left text-slate-300">
               <thead className="text-xs uppercase bg-slate-700 text-slate-400">
                 <tr>
                   <th className="px-4 py-2">Trecho</th>
                   <th className="px-4 py-2">Perda Carga (m)</th>
                   <th className="px-4 py-2">Velocidade (m/s)</th>
                   <th className="px-4 py-2">Pressão Inicial (m)</th>
                   <th className="px-4 py-2 text-white">Pressão Final (m)</th>
                 </tr>
               </thead>
               <tbody>
                 {simulationResult.segments.map((res: any, idx: number) => (
                   <tr key={idx} className="border-b border-slate-700">
                     <td className="px-4 py-2">Trecho {idx + 1}</td>
                     <td className="px-4 py-2 text-red-300">-{res.headLoss.toFixed(2)}</td>
                     <td className="px-4 py-2">{res.velocity.toFixed(2)}</td>
                     <td className="px-4 py-2">{res.pressureStart.toFixed(2)}</td>
                     <td className={`px-4 py-2 font-bold ${res.pressureEnd < 0 ? 'text-red-500' : 'text-green-400'}`}>
                       {res.pressureEnd.toFixed(2)}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           <div className="mt-4 pt-4 border-t border-slate-600 flex justify-between items-center">
             <span className="text-slate-400">Pressão Residual Final:</span>
             <span className={`text-2xl font-bold ${simulationResult.finalPressure < 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                {simulationResult.finalPressure.toFixed(2)} m.c.a.
             </span>
           </div>
        </div>
      )}
    </div>
  );
};
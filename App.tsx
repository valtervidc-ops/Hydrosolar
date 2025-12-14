import React, { useState, useEffect } from 'react';
import { Droplets, Sun, Activity, Settings, AlertTriangle, CheckCircle, Calculator, FileText, Database, GitBranch } from 'lucide-react';
import { DEFAULT_DEMOGRAPHICS, DEFAULT_HYDRAULICS, DEFAULT_SOLAR, MATERIALS, SOLAR_LOCATIONS } from './constants';
import { calculateSystem } from './utils/calculations';
import { InputGroup } from './components/InputGroup';
import { SelectGroup } from './components/SelectGroup';
import { ResultCard } from './components/ResultCard';
import { PumpCurveChart } from './components/PumpCurveChart';
import { NetworkSimulator } from './components/NetworkSimulator';
import { IrradiationChart } from './components/IrradiationChart';
import { PipeMaterial } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'demand' | 'volumes' | 'hydraulic' | 'network' | 'solar' | 'report'>('demand');
  const [demoInput, setDemoInput] = useState(DEFAULT_DEMOGRAPHICS);
  const [hydroInput, setHydroInput] = useState(DEFAULT_HYDRAULICS);
  const [solarInput, setSolarInput] = useState(DEFAULT_SOLAR);
  const [results, setResults] = useState(calculateSystem(DEFAULT_DEMOGRAPHICS, DEFAULT_HYDRAULICS, DEFAULT_SOLAR));

  useEffect(() => {
    const res = calculateSystem(demoInput, hydroInput, solarInput);
    setResults(res);
  }, [demoInput, hydroInput, solarInput]);

  const updateDemo = (key: keyof typeof demoInput, val: number) => setDemoInput(prev => ({ ...prev, [key]: val }));
  const updateHydro = (key: keyof typeof hydroInput, val: any) => setHydroInput(prev => ({ ...prev, [key]: val }));
  
  const updateSolar = (key: keyof typeof solarInput, val: any) => setSolarInput(prev => ({ ...prev, [key]: val }));
  const handleSolarLocationChange = (loc: string) => {
    setSolarInput(prev => ({ ...prev, location: loc }));
  };

  const handleMaterialChange = (val: string) => {
    const mat = val as PipeMaterial;
    setHydroInput(prev => ({
      ...prev,
      material: mat,
      roughness: MATERIALS[mat].roughness
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar / Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 z-10 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Droplets className="w-6 h-6" />
            </div>
            HydroSolar
          </div>
          <p className="text-xs text-slate-400 mt-2">v2.1 - Moz Edition</p>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <button onClick={() => setActiveTab('demand')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'demand' ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Calculator className="w-4 h-4" /> Demanda
          </button>
          
          <button onClick={() => setActiveTab('volumes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'volumes' ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Database className="w-4 h-4" /> Reservatórios & Volumes
          </button>

          <button onClick={() => setActiveTab('hydraulic')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'hydraulic' ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Activity className="w-4 h-4" /> Hidráulica Principal
          </button>

          <button onClick={() => setActiveTab('network')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'network' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <GitBranch className="w-4 h-4" /> Simulação de Rede
          </button>

          <button onClick={() => setActiveTab('solar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'solar' ? 'bg-amber-50 text-amber-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Sun className="w-4 h-4" /> Energia Solar
          </button>

          <div className="pt-4 mt-4 border-t border-slate-100">
             <button onClick={() => setActiveTab('report')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'report' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>
              <FileText className="w-4 h-4" /> Relatório Técnico
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-20 shadow-sm">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-800">
              {activeTab === 'demand' && 'Consumo Humano e Animal'}
              {activeTab === 'volumes' && 'Dimensionamento de Volumes'}
              {activeTab === 'hydraulic' && 'Hidráulica da Adutora'}
              {activeTab === 'network' && 'Simulador de Rede de Distribuição'}
              {activeTab === 'solar' && 'Dados Solares (Moçambique)'}
              {activeTab === 'report' && 'Relatório Técnico'}
            </h1>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8">
          
          {/* TAB: DEMAND */}
          {activeTab === 'demand' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">População Humana</h3>
                <InputGroup label="População Inicial" value={demoInput.initialPopulation} onChange={(v) => updateDemo('initialPopulation', v)} unit="hab" />
                <InputGroup label="Taxa Crescimento" value={demoInput.growthRate} onChange={(v) => updateDemo('growthRate', v)} unit="%" step={0.1} />
                <InputGroup label="Horizonte Projeto" value={demoInput.years} onChange={(v) => updateDemo('years', v)} unit="anos" />
                <InputGroup label="Consumo" value={demoInput.consumptionPerCapita} onChange={(v) => updateDemo('consumptionPerCapita', v)} unit="L/hab/dia" />
              </div>
              
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">População Animal</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <InputGroup label="Cavalos (25L)" value={demoInput.horses} onChange={(v) => updateDemo('horses', v)} unit="cb" />
                  <InputGroup label="Gado Leiteiro (35L)" value={demoInput.dairyCattle} onChange={(v) => updateDemo('dairyCattle', v)} unit="cb" />
                  <InputGroup label="Gado Corte (30L)" value={demoInput.beefCattle} onChange={(v) => updateDemo('beefCattle', v)} unit="cb" />
                  <InputGroup label="Porcos (13L)" value={demoInput.pigs} onChange={(v) => updateDemo('pigs', v)} unit="cb" />
                  <InputGroup label="Ovelhas (20L)" value={demoInput.sheep} onChange={(v) => updateDemo('sheep', v)} unit="cb" />
                  <InputGroup label="Cabritos (20L)" value={demoInput.goats} onChange={(v) => updateDemo('goats', v)} unit="cb" />
                  <InputGroup label="Aves (0.2L)" value={demoInput.birds} onChange={(v) => updateDemo('birds', v)} unit="cb" />
                </div>
                <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <ResultCard title="Consumo Diário Total (Futuro)" value={results.totalDailyDemandL.toLocaleString()} unit="Litros/dia" icon={<Droplets className="w-5 h-5"/>} />
                </div>
              </div>
            </div>
          )}

          {/* TAB: VOLUMES */}
          {activeTab === 'volumes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <ResultCard title="Volume de Consumo (1 dia)" value={(results.volConsumption/1000).toFixed(2)} unit="m³" subtext="Baseado na demanda diária total" />
                <ResultCard title="Volume de Incêndio" value={(results.volFire/1000).toFixed(2)} unit="m³" subtext="Reserva técnica (2 horas)" />
                <ResultCard title="Volume de Emergência" value={(results.volEmergency/1000).toFixed(2)} unit="m³" subtext="25% do consumo diário" />
                <ResultCard title="Volume de Equilíbrio" value={(results.volEquilibrium/1000).toFixed(2)} unit="m³" subtext="30% do consumo diário (Compensação)" />
              </div>
              <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl flex flex-col justify-center items-center text-center">
                 <h2 className="text-xl font-bold text-primary mb-2">Capacidade Total do Reservatório</h2>
                 <div className="text-5xl font-bold text-slate-800 my-4">
                   {(results.volTotalReservoir/1000).toFixed(1)} <span className="text-lg text-slate-500 font-normal">m³</span>
                 </div>
                 <p className="text-sm text-slate-500 max-w-xs">
                   Soma de todos os volumes operacionais e de segurança. Recomenda-se arredondar para o valor comercial superior.
                 </p>
              </div>
            </div>
          )}

          {/* TAB: HYDRAULIC */}
          {activeTab === 'hydraulic' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Adutora Principal</h3>
                    <InputGroup label="Comprimento (m)" value={hydroInput.pipeLength} onChange={(v) => updateHydro('pipeLength', v)} />
                    <InputGroup label="Diâmetro (mm)" value={hydroInput.pipeDiameterMM} onChange={(v) => updateHydro('pipeDiameterMM', v)} />
                    <SelectGroup label="Material" value={hydroInput.material} options={Object.entries(MATERIALS).map(([k, v]) => ({ value: k, label: v.name }))} onChange={handleMaterialChange} />
                    <InputGroup label="Altura Geométrica (m)" value={hydroInput.geometricHeight} onChange={(v) => updateHydro('geometricHeight', v)} />
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Acessórios</h3>
                    <div className="grid grid-cols-2 gap-3">
                       <InputGroup label="Tees" value={hydroInput.qtyTees} onChange={(v) => updateHydro('qtyTees', v)} />
                       <InputGroup label="Curvas 90" value={hydroInput.qtyElbows90} onChange={(v) => updateHydro('qtyElbows90', v)} />
                       <InputGroup label="Curvas 45" value={hydroInput.qtyElbows45} onChange={(v) => updateHydro('qtyElbows45', v)} />
                       <InputGroup label="Válvulas" value={hydroInput.qtyValves} onChange={(v) => updateHydro('qtyValves', v)} />
                    </div>
                 </div>
               </div>
               <div className="lg:col-span-2 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <ResultCard title="Velocidade" value={results.velocity.toFixed(2)} unit="m/s" warning={results.velocity > 3 || results.velocity < 0.6} subtext={results.velocity > 3 ? "Alta" : results.velocity < 0.6 ? "Baixa" : "OK"} />
                    <ResultCard title="Perda de Carga Total" value={results.totalHeadLoss.toFixed(2)} unit="m" />
                 </div>
                 <PumpCurveChart results={results} hydroInput={hydroInput} />
               </div>
             </div>
          )}

          {/* TAB: NETWORK SIMULATOR */}
          {activeTab === 'network' && (
            <NetworkSimulator 
              initialHead={hydroInput.geometricHeight} // Assuming Gravity feed from tank at height Z
              temperature={hydroInput.temperature} 
              roughness={hydroInput.roughness} 
            />
          )}

          {/* TAB: SOLAR */}
          {activeTab === 'solar' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                <h3 className="font-bold text-amber-600 mb-4 flex items-center gap-2">
                  <Sun className="w-4 h-4" /> Dados Solares
                </h3>
                <SelectGroup 
                   label="Localização (Moçambique)" 
                   value={solarInput.location} 
                   options={Object.keys(SOLAR_LOCATIONS).map(k => ({value: k, label: SOLAR_LOCATIONS[k].name}))} 
                   onChange={handleSolarLocationChange} 
                />
                <InputGroup label="Eficiência Sistema" value={solarInput.systemEfficiency} onChange={(v) => updateSolar('systemEfficiency', v)} step={0.01} max={1} />
                <InputGroup label="Potência Painel (W)" value={solarInput.panelPowerW} onChange={(v) => updateSolar('panelPowerW', v)} unit="W" />
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-slate-700 mb-4">Irradiação Mensal (kWh/m²/dia)</h3>
                  {solarInput.location !== 'Manual' && SOLAR_LOCATIONS[solarInput.location] && (
                    <IrradiationChart data={SOLAR_LOCATIONS[solarInput.location].monthlyIrradiation} />
                  )}
                  {solarInput.location === 'Manual' && (
                    <div className="text-center text-slate-400 py-8">Gráfico indisponível para modo manual</div>
                  )}
                </div>

                <div className="bg-amber-50 rounded-2xl p-8 border border-amber-100 flex flex-col items-center text-center">
                   <h2 className="text-lg font-bold text-amber-900 mb-2">Resultados (Pelo Mês Crítico)</h2>
                   <div className="text-4xl font-bold text-slate-800 my-4">
                      {results.numberOfPanels} <span className="text-xl font-normal text-slate-500">Painéis de {solarInput.panelPowerW}W</span>
                   </div>
                   <div className="text-sm text-amber-700 max-w-md">
                     Dimensionado com base no mês de menor irradiação ({results.selectedIrradiation} kWh/m²) para garantir o abastecimento o ano todo.
                   </div>
                   <div className="mt-4 grid grid-cols-2 gap-4 w-full max-w-md">
                      <div className="bg-white/50 p-2 rounded">Potência: {results.requiredSolarPowerKw.toFixed(2)} kWp</div>
                      <div className="bg-white/50 p-2 rounded">Energia: {results.dailyEnergyKwh.toFixed(2)} kWh/dia</div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REPORT */}
          {activeTab === 'report' && (
             <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
               <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <FileText className="w-6 h-6 text-primary" /> Relatório Técnico
               </h2>
               <div className="space-y-4 font-mono text-sm text-slate-700 bg-slate-50 p-6 rounded-xl border border-slate-200">
                  {results.justification.map((line, idx) => (
                    <div key={idx} className={`${line.startsWith('---') || line.endsWith(':') ? 'font-bold text-slate-900 mt-4 border-b border-slate-200 pb-1' : 'pl-4'}`}>
                      {line}
                    </div>
                  ))}
               </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
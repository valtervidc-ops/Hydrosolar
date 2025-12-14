import { DemographicsInput, HydraulicInput, SolarInput, CalculationResults, NetworkSegment, NetworkResult } from '../types';
import { 
  GRAVITY, SPECIFIC_WEIGHT_WATER, WATER_DENSITY,
  K_TEE_DIRECT, K_ELBOW_90, K_ELBOW_45, K_VALVE_GATE, K_REDUCER, K_EXIT,
  CONS_HORSE, CONS_DAIRY_CATTLE, CONS_BEEF_CATTLE, CONS_PIG, CONS_SHEEP, CONS_GOAT, CONS_BIRD,
  FIRE_FLOW_LPS, FIRE_DURATION_HOURS, EMERGENCY_PERCENTAGE, EQUILIBRIUM_PERCENTAGE,
  SOLAR_LOCATIONS
} from '../constants';

export const calculateSystem = (
  demo: DemographicsInput,
  hydro: HydraulicInput,
  solar: SolarInput
): CalculationResults => {
  const warnings: string[] = [];
  const justification: string[] = [];

  justification.push("--- RELATÓRIO TÉCNICO DE DIMENSIONAMENTO ---");

  // --- 1. PROJEÇÃO POPULACIONAL ---
  const factor = Math.pow(1 + demo.growthRate / 100, demo.years);
  const futurePopulation = Math.ceil(demo.initialPopulation * factor);

  // --- 2. DEMANDA (CONSUMO) ---
  const humanDemand = futurePopulation * demo.consumptionPerCapita;
  
  // Animal Demand (No growth rate applied to animals for simplicity, or apply same factor if desired. Assuming constant herd for now or applying simplified logic)
  // To apply growth to animals, we can use the same factor
  const demandHorses = Math.ceil(demo.horses * factor) * CONS_HORSE;
  const demandDairy = Math.ceil(demo.dairyCattle * factor) * CONS_DAIRY_CATTLE;
  const demandBeef = Math.ceil(demo.beefCattle * factor) * CONS_BEEF_CATTLE;
  const demandPigs = Math.ceil(demo.pigs * factor) * CONS_PIG;
  const demandSheep = Math.ceil(demo.sheep * factor) * CONS_SHEEP;
  const demandGoats = Math.ceil(demo.goats * factor) * CONS_GOAT;
  const demandBirds = Math.ceil(demo.birds * factor) * CONS_BIRD;

  const totalDailyDemandL = humanDemand + demandHorses + demandDairy + demandBeef + demandPigs + demandSheep + demandGoats + demandBirds;

  // --- 3. VOLUMES RESERVATÓRIO ---
  const volConsumption = totalDailyDemandL; // V_consumo (1 day)
  
  // V_incendio = Flow * Time
  const volFire = (FIRE_FLOW_LPS * 60 * 60 * FIRE_DURATION_HOURS); 
  
  // V_emergencia
  const volEmergency = totalDailyDemandL * EMERGENCY_PERCENTAGE;

  // V_equilibrio
  const volEquilibrium = totalDailyDemandL * EQUILIBRIUM_PERCENTAGE;

  const volTotalReservoir = volConsumption + volFire + volEmergency + volEquilibrium;

  justification.push(`1. CONSUMO E VOLUMES:`);
  justification.push(`   Consumo Diário Total: ${totalDailyDemandL.toLocaleString()} L/dia`);
  justification.push(`   Volume de Consumo (1 dia): ${(volConsumption/1000).toFixed(1)} m³`);
  justification.push(`   Volume Contra Incêndio (${FIRE_DURATION_HOURS}h @ ${FIRE_FLOW_LPS}L/s): ${(volFire/1000).toFixed(1)} m³`);
  justification.push(`   Volume de Emergência (${EMERGENCY_PERCENTAGE*100}%): ${(volEmergency/1000).toFixed(1)} m³`);
  justification.push(`   Volume de Equilíbrio (${EQUILIBRIUM_PERCENTAGE*100}%): ${(volEquilibrium/1000).toFixed(1)} m³`);
  justification.push(`   CAPACIDADE TOTAL REQUERIDA: ${(volTotalReservoir/1000).toFixed(2)} m³`);


  // --- 4. HIDRÁULICA (CAUDAL DE PROJETO) ---
  const designFlowLps = (hydro.k1 * hydro.k2 * totalDailyDemandL) / 86400;
  const designFlowM3s = designFlowLps / 1000;
  
  // --- 5. PARÂMETROS GEOMÉTRICOS & VELOCIDADE ---
  const diameterM = hydro.pipeDiameterMM / 1000;
  const area = (Math.PI * Math.pow(diameterM, 2)) / 4;
  const velocity = designFlowM3s / area;

  // Validation: Velocity
  if (velocity > 3.0) warnings.push("Velocidade excessiva (> 3.0 m/s).");
  if (velocity < 0.6 && velocity > 0) warnings.push("Velocidade muito baixa (< 0.6 m/s).");

  // --- 6. VISCOSIDADE E REYNOLDS ---
  const T = hydro.temperature;
  const viscosity = (1.78 * 1e-6) / (1 + 0.0337 * T + 0.000221 * Math.pow(T, 2));
  const reynolds = (velocity * diameterM) / viscosity;

  let flowRegime: 'Laminar' | 'Transição' | 'Turbulento' = 'Turbulento';
  if (reynolds < 2000) flowRegime = 'Laminar';
  else if (reynolds < 4000) flowRegime = 'Transição';
  
  // --- 7. FATOR DE ATRITO (f) ---
  let frictionFactor = 0.02; 
  if (reynolds < 2000 && reynolds > 0) {
     frictionFactor = 64 / reynolds;
  } else if (reynolds > 0) {
    const relativeRoughness = (hydro.roughness / 1000) / diameterM;
    const term1 = relativeRoughness / 3.7;
    const term2 = 5.74 / Math.pow(reynolds, 0.9);
    frictionFactor = 0.25 / Math.pow(Math.log10(term1 + term2), 2);
  }

  // --- 8. PERDAS DE CARGA ---
  const headLossDistributed = frictionFactor * (hydro.pipeLength / diameterM) * (Math.pow(velocity, 2) / (2 * GRAVITY));

  const kTotal = 
    (hydro.qtyTees * K_TEE_DIRECT) +
    (hydro.qtyElbows90 * K_ELBOW_90) +
    (hydro.qtyElbows45 * K_ELBOW_45) +
    (hydro.qtyValves * K_VALVE_GATE) + 
    (hydro.qtyReducers * K_REDUCER) +
    (1 * K_EXIT);
    
  const headLossLocalized = kTotal * (Math.pow(velocity, 2) / (2 * GRAVITY));
  const totalHeadLoss = headLossDistributed + headLossLocalized;
  const manometricHead = hydro.geometricHeight + totalHeadLoss;

  justification.push(`2. HIDRÁULICA E BERNOULLI:`);
  justification.push(`   Hman = ${hydro.geometricHeight}m (Geo) + ${totalHeadLoss.toFixed(2)}m (Perdas) = ${manometricHead.toFixed(2)} m.c.a.`);

  // --- 9. DIMENSIONAMENTO SOLAR (CRITICAL MONTH) ---
  const dailyHydraulicEnergyJ = ((totalDailyDemandL/1000) * SPECIFIC_WEIGHT_WATER * manometricHead);
  const dailyHydraulicEnergyKwh = dailyHydraulicEnergyJ / 3.6e6;
  const dailyEnergyKwh = dailyHydraulicEnergyKwh / solar.pumpEfficiency; 

  // Get Monthly Data
  let irradiationList = solar.manualIrradiation;
  if (solar.location !== 'Manual' && SOLAR_LOCATIONS[solar.location]) {
    irradiationList = SOLAR_LOCATIONS[solar.location].monthlyIrradiation;
  }

  // Find Critical Month (Minimum Irradiation)
  const minIrradiation = Math.min(...irradiationList);
  const criticalMonthIndex = irradiationList.indexOf(minIrradiation);
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  // Ps = Wd / (nReg * Hs_critical)
  const requiredSolarPowerKw = dailyEnergyKwh / (solar.systemEfficiency * minIrradiation);
  const numberOfPanels = Math.ceil((requiredSolarPowerKw * 1000) / solar.panelPowerW);

  justification.push(`3. ENERGIA SOLAR (MÊS CRÍTICO):`);
  justification.push(`   Localização: ${solar.location}`);
  justification.push(`   Mês Crítico: ${months[criticalMonthIndex]} com ${minIrradiation} kWh/m²/dia`);
  justification.push(`   Energia Requerida (Wd): ${dailyEnergyKwh.toFixed(2)} kWh/dia`);
  justification.push(`   Potência PV Calculada: ${requiredSolarPowerKw.toFixed(2)} kWp`);

  return {
    futurePopulation,
    totalDailyDemandL,
    
    volConsumption,
    volFire,
    volEmergency,
    volEquilibrium,
    volTotalReservoir,

    designFlowLps,
    designFlowM3s,
    velocity,
    viscosity,
    reynolds,
    flowRegime,
    frictionFactor,
    headLossDistributed,
    headLossLocalized,
    totalHeadLoss,
    manometricHead,
    kTotal,
    hydraulicPowerKw: dailyHydraulicEnergyKwh/24, // avg
    dailyEnergyKwh,
    requiredSolarPowerKw,
    numberOfPanels,
    selectedIrradiation: minIrradiation,
    criticalMonthIndex,
    warnings,
    justification
  };
};

// --- SIMPLIFIED NETWORK SIMULATOR (LINEAR) ---
export const simulateNetwork = (
  segments: NetworkSegment[], 
  initialHead: number, 
  temp: number,
  roughness: number
): NetworkResult => {
  const simResults = [];
  let currentHead = initialHead;

  // Viscosity
  const viscosity = (1.78 * 1e-6) / (1 + 0.0337 * temp + 0.000221 * Math.pow(temp, 2));

  for (const seg of segments) {
    const flowM3s = seg.flow / 1000;
    const diaM = seg.diameter / 1000;
    const area = (Math.PI * Math.pow(diaM, 2)) / 4;
    const velocity = flowM3s / area;
    
    // Reynolds
    const re = (velocity * diaM) / viscosity;
    
    // Friction (Swamee-Jain / Laminar)
    let f = 0.02;
    if (re > 0 && re < 2000) {
      f = 64 / re;
    } else if (re > 0) {
      const relRough = (roughness / 1000) / diaM;
      f = 0.25 / Math.pow(Math.log10((relRough / 3.7) + (5.74 / Math.pow(re, 0.9))), 2);
    }

    // Losses
    const hf = f * (seg.length / diaM) * (Math.pow(velocity, 2) / (2 * GRAVITY));
    const hL = seg.accessoriesK * (Math.pow(velocity, 2) / (2 * GRAVITY));
    const totalLoss = hf + hL;

    // Bernoulli: H_end = H_start - Losses + ElevationChange (Pump adds, Gravity pipe loses potential if going UP, gains if going DOWN)
    // In EPANET logic for a pipe: Head Loss is friction.
    // Pressure Head = Total Head - Elevation.
    // Let's assume input 'ElevationChange' is Z_end - Z_start.
    // If we are calculating Pressure Loss:
    // P_end/g = P_start/g - DeltaZ - Losses.
    
    const pressureStart = currentHead;
    const pressureEnd = pressureStart - seg.elevationChange - totalLoss;

    simResults.push({
      id: seg.id,
      headLoss: totalLoss,
      velocity: velocity,
      pressureStart,
      pressureEnd
    });

    currentHead = pressureEnd;
  }

  return {
    segments: simResults,
    finalPressure: currentHead
  };
};
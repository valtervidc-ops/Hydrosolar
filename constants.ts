import { PipeMaterial, SolarLocation } from './types';

// Physics
export const GRAVITY = 9.81; 
export const WATER_DENSITY = 1000;
export const SPECIFIC_WEIGHT_WATER = 9810; 

// Animal Consumption Rates (L/day)
export const CONS_HORSE = 25;
export const CONS_DAIRY_CATTLE = 35;
export const CONS_BEEF_CATTLE = 30;
export const CONS_PIG = 13;
export const CONS_SHEEP = 20;
export const CONS_GOAT = 20;
export const CONS_BIRD = 0.2;

// Volume Constants
export const FIRE_FLOW_LPS = 5; // Assumed minimal fire flow (can be adjusted)
export const FIRE_DURATION_HOURS = 2; 
export const EMERGENCY_PERCENTAGE = 0.25; // 25% of daily demand
export const EQUILIBRIUM_PERCENTAGE = 0.30; // 30% of daily demand

// Solar Data (Mozambique & Generic) - kWh/m²/day [Jan, Feb, ..., Dec]
export const SOLAR_LOCATIONS: Record<string, SolarLocation> = {
  'Maputo': { name: 'Maputo', monthlyIrradiation: [6.5, 6.2, 5.6, 4.9, 4.3, 3.9, 4.0, 4.6, 5.3, 5.9, 6.3, 6.6] },
  'Beira': { name: 'Beira', monthlyIrradiation: [6.2, 6.1, 5.8, 5.3, 4.7, 4.2, 4.3, 5.0, 5.8, 6.3, 6.4, 6.3] },
  'Nampula': { name: 'Nampula', monthlyIrradiation: [5.8, 5.9, 5.7, 5.6, 5.1, 4.6, 4.7, 5.4, 6.3, 6.8, 6.5, 5.9] },
  'Tete': { name: 'Tete', monthlyIrradiation: [6.0, 6.1, 6.2, 5.8, 5.4, 4.9, 5.1, 5.8, 6.6, 7.0, 6.8, 6.2] },
  'Lichinga': { name: 'Lichinga', monthlyIrradiation: [5.0, 5.2, 5.3, 5.4, 5.2, 4.8, 5.0, 5.8, 6.5, 6.7, 6.0, 5.1] },
  'Manual': { name: 'Manual (Personalizado)', monthlyIrradiation: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] },
};

// Loss Coefficients
export const K_TEE_DIRECT = 0.60;
export const K_ELBOW_90 = 0.40;
export const K_ELBOW_45 = 0.20;
export const K_VALVE_GATE = 0.20;
export const K_VALVE_CHECK = 2.50;
export const K_REDUCER = 0.15;
export const K_EXIT = 1.00;

// Materials
export const MATERIALS: Record<PipeMaterial, { name: string; roughness: number }> = {
  'PVC': { name: 'PVC / Plástico', roughness: 0.05 },
  'PEAD': { name: 'PEAD / Plástico', roughness: 0.0025 },
  'ConcreteSmooth': { name: 'Betão Liso', roughness: 0.025 },
  'ConcreteRough': { name: 'Betão Grosso', roughness: 0.25 },
  'Steel': { name: 'Aço', roughness: 0.1 },
  'Iron': { name: 'Ferro Fundido', roughness: 0.15 },
};

export const DEFAULT_DEMOGRAPHICS = {
  initialPopulation: 983,
  growthRate: 2.5,
  years: 20,
  consumptionPerCapita: 15,
  horses: 5,
  dairyCattle: 10,
  beefCattle: 45,
  pigs: 10,
  sheep: 20,
  goats: 20,
  birds: 88,
};

export const DEFAULT_HYDRAULICS = {
  k1: 1.2,
  k2: 1.5,
  pumpOperatingHours: 6,
  pipeLength: 1000,
  pipeDiameterMM: 50,
  material: 'PVC' as PipeMaterial,
  roughness: 0.05,
  temperature: 20,
  geometricHeight: 40,
  qtyTees: 7,
  qtyElbows90: 3,
  qtyElbows45: 0,
  qtyValves: 2,
  qtyReducers: 8,
};

export const DEFAULT_SOLAR = {
  location: 'Maputo',
  manualIrradiation: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  systemEfficiency: 0.83,
  panelPowerW: 450,
  pumpEfficiency: 0.60,
};
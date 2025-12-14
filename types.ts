export interface DemographicsInput {
  initialPopulation: number;
  growthRate: number; // percentage
  years: number;
  consumptionPerCapita: number; // liters/day
  
  // Revised Animal List
  horses: number;      // Cavalo (25)
  dairyCattle: number; // Gado Leiteiro (35)
  beefCattle: number;  // Gado Corte (30)
  pigs: number;        // Porco (13)
  sheep: number;       // Ovelha (20)
  goats: number;       // Cabrito (20)
  birds: number;       // Aves (0.2)
}

export type PipeMaterial = 'PVC' | 'PEAD' | 'ConcreteSmooth' | 'ConcreteRough' | 'Steel' | 'Iron';

export interface HydraulicInput {
  k1: number;
  k2: number;
  pumpOperatingHours: number;
  pipeLength: number;
  pipeDiameterMM: number;
  material: PipeMaterial;
  roughness: number;
  temperature: number;
  geometricHeight: number;
  
  // Localized Losses Inputs
  qtyTees: number;
  qtyElbows90: number;
  qtyElbows45: number;
  qtyValves: number;
  qtyReducers: number;
}

export interface NetworkSegment {
  id: string;
  length: number;
  diameter: number;
  elevationChange: number; // Positive = Uphill, Negative = Downhill
  accessoriesK: number; // Sum of K
  flow: number; // L/s flowing through this segment
}

export interface SolarLocation {
  name: string;
  monthlyIrradiation: number[]; // Jan-Dec
}

export interface SolarInput {
  location: string;
  manualIrradiation: number[]; // Jan-Dec if manual
  systemEfficiency: number;
  panelPowerW: number;
  pumpEfficiency: number;
}

export interface CalculationResults {
  // Demographics
  futurePopulation: number;
  totalDailyDemandL: number;
  
  // Volumes
  volConsumption: number;
  volFire: number;
  volEmergency: number;
  volEquilibrium: number;
  volTotalReservoir: number;

  // Main Flow
  designFlowLps: number;
  designFlowM3s: number;
  
  // Main Hydraulics
  velocity: number;
  viscosity: number;
  reynolds: number;
  flowRegime: 'Laminar' | 'Transição' | 'Turbulento';
  frictionFactor: number;
  headLossDistributed: number;
  headLossLocalized: number;
  totalHeadLoss: number;
  manometricHead: number;
  kTotal: number;
  
  // Solar
  selectedIrradiation: number; // The value used (e.g. critical month)
  criticalMonthIndex: number;
  hydraulicPowerKw: number;
  dailyEnergyKwh: number;
  requiredSolarPowerKw: number;
  numberOfPanels: number;
  
  // Report
  warnings: string[];
  justification: string[];
}

export interface NetworkResult {
  segments: {
    id: string;
    headLoss: number;
    velocity: number;
    pressureStart: number;
    pressureEnd: number;
  }[];
  finalPressure: number;
}
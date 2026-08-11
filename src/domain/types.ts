export interface Cuvette {
  id: string;
  name: string;
  diameterMm: number;
  heightMm: number;
  isCustom?: boolean;
}

export interface MixCalibration {
  diameterMm: number;
  heightMm: number;
  plasterGrams: number;
  waterGrams: number;
}

export interface ManufacturerWaterRatio {
  conventionalWaterPer100Powder?: number;
  vacuumWaterMinPer100Powder?: number;
  vacuumWaterMaxPer100Powder?: number;
}

export interface InvestmentMaterial {
  id: string;
  brand: string;
  name: string;
  calibration: MixCalibration;
  manufacturerWaterRatio?: ManufacturerWaterRatio;
  sourceLabel: string;
  sourceUrl: string;
  note?: string;
}

export interface ResinMaterial {
  id: string;
  brand: string;
  name: string;
  solidDensityGPerCm3: number;
  sourceLabel: string;
  sourceUrl: string;
  note?: string;
}

export interface MixInput {
  cuvette: Cuvette;
  figureVolumeCm3: number;
  reservePercent: number;
  calibration?: MixCalibration;
}

export interface MixResult {
  cuvetteVolumeCm3: number;
  figureVolumeCm3: number;
  fillVolumeCm3: number;
  reservePercent: number;
  plasterGrams: number;
  waterGrams: number;
  totalMixGrams: number;
  fillFraction: number;
}

export interface Cuvette {
  id: string;
  name: string;
  diameterMm: number;
  heightMm: number;
  isCustom?: boolean;
}

export type MixingMethod = 'conventional' | 'vacuum';

export interface ManufacturerWaterRatio {
  conventionalWaterPer100Powder: number;
  vacuumWaterMinPer100Powder: number;
  vacuumWaterMaxPer100Powder: number;
}

export interface InvestmentMaterial {
  id: string;
  brand: string;
  name: string;
  manufacturerWaterRatio: ManufacturerWaterRatio;
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

export interface FillVolumeResult {
  cuvetteVolumeCm3: number;
  figureVolumeCm3: number;
  fillVolumeCm3: number;
  fillFraction: number;
}

export interface MixInput {
  powderGrams: number;
  waterPer100Powder: number;
  reservePercent: number;
}

export interface MixResult {
  basePowderGrams: number;
  powderGrams: number;
  waterGrams: number;
  totalMixGrams: number;
  waterPer100Powder: number;
  reservePercent: number;
}

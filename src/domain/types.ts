export interface Cuvette {
  id: string;
  name: string;
  diameterMm: number;
  heightMm: number;
  isCustom?: boolean;
}

export interface MixInput {
  cuvette: Cuvette;
  figureVolumeCm3: number;
  reservePercent: number;
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

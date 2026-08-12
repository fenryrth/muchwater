import type { Cuvette, FillVolumeResult, MixInput, MixResult } from './types';

export function cylinderVolumeCm3(diameterMm: number, heightMm: number): number {
  if (!Number.isFinite(diameterMm) || !Number.isFinite(heightMm) || diameterMm <= 0 || heightMm <= 0) {
    return 0;
  }

  const radiusCm = diameterMm / 20;
  const heightCm = heightMm / 10;
  return Math.PI * radiusCm ** 2 * heightCm;
}

export function cuvetteVolumeCm3(cuvette: Cuvette): number {
  return cylinderVolumeCm3(cuvette.diameterMm, cuvette.heightMm);
}

export function calculateFillVolume(cuvette: Cuvette, figureVolumeCm3: number): FillVolumeResult {
  const cuvetteVolume = cuvetteVolumeCm3(cuvette);
  const figureVolume = Math.max(0, figureVolumeCm3);
  const fillVolume = cuvetteVolume - figureVolume;

  if (cuvetteVolume <= 0) {
    throw new Error('Cuvetten skal have en diameter og højde større end 0.');
  }

  if (fillVolume <= 0) {
    throw new Error('Figurens volumen skal være mindre end cuvettens volumen.');
  }

  return {
    cuvetteVolumeCm3: cuvetteVolume,
    figureVolumeCm3: figureVolume,
    fillVolumeCm3: fillVolume,
    fillFraction: fillVolume / cuvetteVolume,
  };
}

export function calculateMix(input: MixInput): MixResult {
  if (!Number.isFinite(input.powderGrams) || input.powderGrams < 0) {
    throw new Error('Pulvermængden skal være 0 gram eller mere.');
  }

  if (!Number.isFinite(input.waterPer100Powder) || input.waterPer100Powder <= 0) {
    throw new Error('Vand/pulver-forholdet skal være større end 0.');
  }

  const reservePercent = Math.max(0, input.reservePercent);
  const reserveFactor = 1 + reservePercent / 100;
  const powderGrams = input.powderGrams * reserveFactor;
  const waterGrams = powderGrams * input.waterPer100Powder / 100;

  return {
    basePowderGrams: input.powderGrams,
    powderGrams,
    waterGrams,
    totalMixGrams: powderGrams + waterGrams,
    waterPer100Powder: input.waterPer100Powder,
    reservePercent,
  };
}

export function roundGrams(value: number): number {
  return Math.round(value);
}

export function formatLitres(cm3: number): string {
  return (cm3 / 1000).toLocaleString('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

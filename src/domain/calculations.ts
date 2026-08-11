import type { Cuvette, MixInput, MixResult } from './types';

export const CALIBRATION = Object.freeze({
  diameterMm: 100,
  heightMm: 150,
  plasterGrams: 1730,
  waterGrams: 750,
});

function hasValidDimensions(...values: number[]): boolean {
  return values.every((value) => Number.isFinite(value) && value > 0);
}

export function cylinderVolumeCm3(diameterMm: number, heightMm: number): number {
  if (!hasValidDimensions(diameterMm, heightMm)) {
    return 0;
  }

  const radiusCm = diameterMm / 20;
  const heightCm = heightMm / 10;
  return Math.PI * radiusCm ** 2 * heightCm;
}

export function boxVolumeCm3(lengthMm: number, widthMm: number, heightMm: number): number {
  if (!hasValidDimensions(lengthMm, widthMm, heightMm)) {
    return 0;
  }

  return (lengthMm * widthMm * heightMm) / 1000;
}

export function ellipsoidVolumeCm3(lengthMm: number, widthMm: number, heightMm: number): number {
  if (!hasValidDimensions(lengthMm, widthMm, heightMm)) {
    return 0;
  }

  return (Math.PI / 6) * lengthMm * widthMm * heightMm / 1000;
}

export const CALIBRATION_VOLUME_CM3 = cylinderVolumeCm3(
  CALIBRATION.diameterMm,
  CALIBRATION.heightMm,
);

export function cuvetteVolumeCm3(cuvette: Cuvette): number {
  return cylinderVolumeCm3(cuvette.diameterMm, cuvette.heightMm);
}

export function calculateMix(input: MixInput): MixResult {
  const cuvetteVolume = cuvetteVolumeCm3(input.cuvette);
  const figureVolume = input.figureVolumeCm3;
  const reservePercent = input.reservePercent;

  if (cuvetteVolume <= 0) {
    throw new Error('Cuvetten skal have en diameter og højde større end 0.');
  }

  if (!Number.isFinite(figureVolume) || figureVolume < 0) {
    throw new Error('Figurens volumen skal være 0 eller større.');
  }

  if (!Number.isFinite(reservePercent) || reservePercent < 0 || reservePercent > 100) {
    throw new Error('Reserve skal være mellem 0 og 100 %.');
  }

  const fillVolume = cuvetteVolume - figureVolume;

  if (fillVolume <= 0) {
    throw new Error('Figurens volumen skal være mindre end cuvettens volumen.');
  }

  const scale = fillVolume / CALIBRATION_VOLUME_CM3;
  const reserveFactor = 1 + reservePercent / 100;
  const plasterGrams = CALIBRATION.plasterGrams * scale * reserveFactor;
  const waterGrams = CALIBRATION.waterGrams * scale * reserveFactor;

  return {
    cuvetteVolumeCm3: cuvetteVolume,
    figureVolumeCm3: figureVolume,
    fillVolumeCm3: fillVolume,
    reservePercent,
    plasterGrams,
    waterGrams,
    totalMixGrams: plasterGrams + waterGrams,
    fillFraction: fillVolume / cuvetteVolume,
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

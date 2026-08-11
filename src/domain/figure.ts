export function volumeFromMassAndDensity(massGrams: number, densityGPerCm3: number): number {
  if (!Number.isFinite(massGrams) || massGrams < 0) {
    throw new Error('Vægten skal være 0 gram eller mere.');
  }

  if (!Number.isFinite(densityGPerCm3) || densityGPerCm3 <= 0) {
    throw new Error('Densiteten skal være større end 0 g/cm³.');
  }

  return massGrams / densityGPerCm3;
}

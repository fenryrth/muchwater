import { describe, expect, it } from 'vitest';
import {
  calculateFillVolume,
  calculateMix,
  cylinderVolumeCm3,
} from './calculations';
import type { Cuvette } from './types';

const referenceCuvette: Cuvette = {
  id: 'reference',
  name: 'Reference',
  diameterMm: 100,
  heightMm: 150,
};

describe('geometry', () => {
  it('calculates a Ø100 × 150 mm cylinder volume', () => {
    expect(cylinderVolumeCm3(100, 150)).toBeCloseTo(1178.097245, 6);
  });

  it('subtracts figure volume from the cuvette volume', () => {
    const result = calculateFillVolume(referenceCuvette, 200);
    expect(result.fillVolumeCm3).toBeCloseTo(978.097245, 6);
  });

  it('rejects a figure that fills or exceeds the cuvette', () => {
    const cuvetteVolume = cylinderVolumeCm3(100, 150);
    expect(() => calculateFillVolume(referenceCuvette, cuvetteVolume)).toThrow(/mindre end cuvettens volumen/i);
  });
});

describe('manufacturer water/powder mix', () => {
  it('calculates Metacast conventional 40:100', () => {
    const result = calculateMix({
      powderGrams: 1000,
      waterPer100Powder: 40,
      reservePercent: 0,
    });

    expect(result.powderGrams).toBe(1000);
    expect(result.waterGrams).toBe(400);
    expect(result.totalMixGrams).toBe(1400);
  });

  it('calculates Metacast vacuum 38:100', () => {
    const result = calculateMix({
      powderGrams: 1000,
      waterPer100Powder: 38,
      reservePercent: 0,
    });

    expect(result.waterGrams).toBe(380);
  });

  it('adds reserve while preserving the manufacturer ratio', () => {
    const result = calculateMix({
      powderGrams: 1000,
      waterPer100Powder: 40,
      reservePercent: 5,
    });

    expect(result.powderGrams).toBe(1050);
    expect(result.waterGrams).toBe(420);
    expect(result.totalMixGrams).toBe(1470);
  });

  it('rejects an invalid water/powder ratio', () => {
    expect(() => calculateMix({
      powderGrams: 1000,
      waterPer100Powder: 0,
      reservePercent: 0,
    })).toThrow(/vand\/pulver-forholdet/i);
  });
});

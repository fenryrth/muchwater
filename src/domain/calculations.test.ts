import { describe, expect, it } from 'vitest';
import {
  CALIBRATION_VOLUME_CM3,
  boxVolumeCm3,
  calculateMix,
  cylinderVolumeCm3,
  ellipsoidVolumeCm3,
} from './calculations';
import type { Cuvette } from './types';

const referenceCuvette: Cuvette = {
  id: 'reference',
  name: 'Reference',
  diameterMm: 100,
  heightMm: 150,
};

describe('figure geometry helpers', () => {
  it('calculates the empirical reference cuvette volume', () => {
    expect(cylinderVolumeCm3(100, 150)).toBeCloseTo(1178.097245, 6);
    expect(CALIBRATION_VOLUME_CM3).toBeCloseTo(1178.097245, 6);
  });

  it('calculates a box volume from millimetres', () => {
    expect(boxVolumeCm3(100, 50, 20)).toBeCloseTo(100, 8);
  });

  it('calculates an ellipsoid volume from full outside dimensions', () => {
    expect(ellipsoidVolumeCm3(100, 100, 100)).toBeCloseTo(523.5987756, 6);
  });

  it('returns zero for incomplete or invalid geometric dimensions', () => {
    expect(boxVolumeCm3(100, 0, 20)).toBe(0);
    expect(cylinderVolumeCm3(-10, 20)).toBe(0);
    expect(ellipsoidVolumeCm3(100, Number.NaN, 20)).toBe(0);
  });
});

describe('calculateMix', () => {
  it('returns exactly the calibration mix for an empty reference cuvette', () => {
    const result = calculateMix({
      cuvette: referenceCuvette,
      figureVolumeCm3: 0,
      reservePercent: 0,
    });

    expect(result.plasterGrams).toBeCloseTo(1730, 8);
    expect(result.waterGrams).toBeCloseTo(750, 8);
  });

  it('scales linearly with the available fill volume', () => {
    const result = calculateMix({
      cuvette: referenceCuvette,
      figureVolumeCm3: CALIBRATION_VOLUME_CM3 / 2,
      reservePercent: 0,
    });

    expect(result.plasterGrams).toBeCloseTo(865, 8);
    expect(result.waterGrams).toBeCloseTo(375, 8);
  });

  it('adds reserve to both plaster and water without changing the ratio', () => {
    const result = calculateMix({
      cuvette: referenceCuvette,
      figureVolumeCm3: 0,
      reservePercent: 5,
    });

    expect(result.plasterGrams).toBeCloseTo(1816.5, 8);
    expect(result.waterGrams).toBeCloseTo(787.5, 8);
  });

  it('rejects a figure that fills or exceeds the cuvette', () => {
    expect(() =>
      calculateMix({
        cuvette: referenceCuvette,
        figureVolumeCm3: CALIBRATION_VOLUME_CM3,
        reservePercent: 0,
      }),
    ).toThrow(/mindre end cuvettens volumen/i);
  });

  it('rejects negative figure volume instead of silently correcting it', () => {
    expect(() =>
      calculateMix({
        cuvette: referenceCuvette,
        figureVolumeCm3: -1,
        reservePercent: 0,
      }),
    ).toThrow(/0 eller større/i);
  });

  it('rejects reserve outside the supported 0–100 percent range', () => {
    expect(() =>
      calculateMix({
        cuvette: referenceCuvette,
        figureVolumeCm3: 0,
        reservePercent: 101,
      }),
    ).toThrow(/mellem 0 og 100/i);
  });
});

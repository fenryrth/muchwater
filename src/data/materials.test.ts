import { describe, expect, it } from 'vitest';
import {
  GOLD_STAR_METACAST,
  RESIN_MATERIALS,
} from './materials';

describe('material presets', () => {
  it('keeps the Metacast atelier calibration and manufacturer ratio separate', () => {
    expect(GOLD_STAR_METACAST.calibration.plasterGrams).toBe(1730);
    expect(GOLD_STAR_METACAST.calibration.waterGrams).toBe(750);
    expect(GOLD_STAR_METACAST.manufacturerWaterRatio?.conventionalWaterPer100Powder).toBe(40);
    expect(GOLD_STAR_METACAST.manufacturerWaterRatio?.vacuumWaterMinPer100Powder).toBe(38);
    expect(GOLD_STAR_METACAST.manufacturerWaterRatio?.vacuumWaterMaxPer100Powder).toBe(40);
  });

  it('uses the Siraya Tech TDS solid density for Cast presets', () => {
    expect(RESIN_MATERIALS).toHaveLength(2);
    for (const resin of RESIN_MATERIALS) {
      expect(resin.solidDensityGPerCm3).toBe(1.2);
    }
  });
});

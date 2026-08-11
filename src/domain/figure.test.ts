import { describe, expect, it } from 'vitest';
import { volumeFromMassAndDensity } from './figure';

describe('volumeFromMassAndDensity', () => {
  it('converts mass and density to cubic centimetres', () => {
    expect(volumeFromMassAndDensity(184, 0.92)).toBeCloseTo(200, 8);
  });

  it('allows zero mass', () => {
    expect(volumeFromMassAndDensity(0, 1)).toBe(0);
  });

  it('rejects zero or negative density', () => {
    expect(() => volumeFromMassAndDensity(100, 0)).toThrow(/densiteten/i);
    expect(() => volumeFromMassAndDensity(100, -1)).toThrow(/densiteten/i);
  });
});

import type { Cuvette } from '../domain/types';

// Keep only verified workshop sizes as built-in presets.
// Additional user-specific cuvettes belong in localStorage.
export const DEFAULT_CUVETTES: Cuvette[] = [
  { id: '100x150', name: 'Ø100 × 150 mm', diameterMm: 100, heightMm: 150 },
];

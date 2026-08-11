import type { Cuvette } from '../domain/types';

// Only the empirically calibrated workshop reference is built in.
// Do not add assumed workshop sizes here; user-specific cuvettes belong in localStorage.
export const DEFAULT_CUVETTES: Cuvette[] = [
  { id: '100x150', name: 'Reference · Ø100 × 150 mm', diameterMm: 100, heightMm: 150 },
];

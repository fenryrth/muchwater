import type { Cuvette } from '../domain/types';

export const DEFAULT_CUVETTES: Cuvette[] = [
  { id: '100x150', name: 'Ø100 × 150 mm', diameterMm: 100, heightMm: 150 },
  { id: '120x180', name: 'Ø120 × 180 mm', diameterMm: 120, heightMm: 180 },
  { id: '150x200', name: 'Ø150 × 200 mm', diameterMm: 150, heightMm: 200 },
  { id: '200x250', name: 'Ø200 × 250 mm', diameterMm: 200, heightMm: 250 },
];

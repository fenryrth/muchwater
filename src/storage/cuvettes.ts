import type { Cuvette } from '../domain/types';

const STORAGE_KEY = 'muchwater.customCuvettes.v1';

export function loadCustomCuvettes(): Cuvette[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Cuvette[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomCuvettes(cuvettes: Cuvette[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cuvettes));
}

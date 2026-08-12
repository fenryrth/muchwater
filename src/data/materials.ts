import type { InvestmentMaterial, ResinMaterial } from '../domain/types';

export const GOLD_STAR_METACAST: InvestmentMaterial = {
  id: 'gold-star-metacast',
  brand: 'Gold Star Powders',
  name: 'Metacast',
  manufacturerWaterRatio: {
    conventionalWaterPer100Powder: 40,
    vacuumWaterMinPer100Powder: 38,
    vacuumWaterMaxPer100Powder: 40,
  },
  sourceLabel: 'Gold Star Powders · Metacast technical specification',
  sourceUrl: 'https://www.goldstarpowders.com/products/metacast-premium-investment-powder/',
  note: 'Producentforhold: 40:100 ved konventionel blanding og 38–40:100 ved vakuumblanding.',
};

export const SIRAYA_CAST_TRUE_BLUE: ResinMaterial = {
  id: 'siraya-tech-cast-true-blue',
  brand: 'Siraya Tech',
  name: 'Cast True Blue / Royal Blue',
  solidDensityGPerCm3: 1.2,
  sourceLabel: 'Siraya Tech · Cast Castable Resin TDS',
  sourceUrl: 'https://siraya.tech/pages/cast-castable-resin-tds',
  note: 'TDS solid density: 1.2 g/cm³.',
};

export const SIRAYA_CAST_PURPLE: ResinMaterial = {
  id: 'siraya-tech-cast-purple',
  brand: 'Siraya Tech',
  name: 'Cast Purple',
  solidDensityGPerCm3: 1.2,
  sourceLabel: 'Siraya Tech · Cast Castable Resin TDS',
  sourceUrl: 'https://siraya.tech/pages/cast-castable-resin-tds',
  note: 'TDS solid density: 1.2 g/cm³.',
};

export const INVESTMENT_MATERIALS: InvestmentMaterial[] = [GOLD_STAR_METACAST];

export const RESIN_MATERIALS: ResinMaterial[] = [
  SIRAYA_CAST_TRUE_BLUE,
  SIRAYA_CAST_PURPLE,
];

export const DEFAULT_INVESTMENT_ID = GOLD_STAR_METACAST.id;
export const DEFAULT_RESIN_ID = SIRAYA_CAST_TRUE_BLUE.id;

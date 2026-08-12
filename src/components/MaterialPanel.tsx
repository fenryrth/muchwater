import {
  INVESTMENT_MATERIALS,
  RESIN_MATERIALS,
} from '../data/materials';
import type { MixingMethod } from '../domain/types';
import './MaterialPanel.css';

interface MaterialPanelProps {
  investmentId: string;
  resinId: string;
  mixingMethod: MixingMethod;
  vacuumWaterPer100Powder: number;
  onInvestmentChange: (id: string) => void;
  onResinChange: (id: string) => void;
  onMixingMethodChange: (method: MixingMethod) => void;
  onVacuumWaterRatioChange: (ratio: number) => void;
}

function formatNumber(value: number, maximumFractionDigits = 2): string {
  return value.toLocaleString('da-DK', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
}

export function MaterialPanel({
  investmentId,
  resinId,
  mixingMethod,
  vacuumWaterPer100Powder,
  onInvestmentChange,
  onResinChange,
  onMixingMethodChange,
  onVacuumWaterRatioChange,
}: MaterialPanelProps) {
  const investment = INVESTMENT_MATERIALS.find((item) => item.id === investmentId) ?? INVESTMENT_MATERIALS[0];
  const resin = RESIN_MATERIALS.find((item) => item.id === resinId) ?? RESIN_MATERIALS[0];
  const ratio = investment.manufacturerWaterRatio;
  const activeRatio = mixingMethod === 'conventional'
    ? ratio.conventionalWaterPer100Powder
    : vacuumWaterPer100Powder;

  function updateVacuumRatio(value: string) {
    const parsed = Number(value.replace(',', '.'));
    if (!Number.isFinite(parsed)) return;
    const bounded = Math.min(ratio.vacuumWaterMaxPer100Powder, Math.max(ratio.vacuumWaterMinPer100Powder, parsed));
    onVacuumWaterRatioChange(bounded);
  }

  return (
    <div className="material-panel">
      <div className="material-grid">
        <div>
          <label className="field-label" htmlFor="investment-material">Gips / investment</label>
          <select
            id="investment-material"
            value={investment.id}
            onChange={(event) => onInvestmentChange(event.target.value)}
          >
            {INVESTMENT_MATERIALS.map((item) => (
              <option key={item.id} value={item.id}>{item.brand} · {item.name}</option>
            ))}
          </select>

          <div className="product-card">
            <span className="product-brand">{investment.brand}</span>
            <strong>{investment.name}</strong>
            <dl className="product-data">
              <div>
                <dt>Konventionel blanding</dt>
                <dd>{ratio.conventionalWaterPer100Powder} : 100</dd>
              </div>
              <div>
                <dt>Vakuumblanding</dt>
                <dd>{ratio.vacuumWaterMinPer100Powder}–{ratio.vacuumWaterMaxPer100Powder} : 100</dd>
              </div>
            </dl>

            <div className="mixing-controls">
              <label className="field-label" htmlFor="mixing-method">Blandemetode</label>
              <select
                id="mixing-method"
                value={mixingMethod}
                onChange={(event) => onMixingMethodChange(event.target.value as MixingMethod)}
              >
                <option value="conventional">Konventionel · 40:100</option>
                <option value="vacuum">Vakuum · 38–40:100</option>
              </select>

              {mixingMethod === 'vacuum' && (
                <label className="ratio-input-label">
                  Vand pr. 100 g pulver · g
                  <input
                    type="number"
                    min={ratio.vacuumWaterMinPer100Powder}
                    max={ratio.vacuumWaterMaxPer100Powder}
                    step="0.5"
                    value={vacuumWaterPer100Powder}
                    onChange={(event) => updateVacuumRatio(event.target.value)}
                  />
                </label>
              )}
            </div>

            <div className="active-ratio">
              <span>Aktivt producentforhold</span>
              <strong>{formatNumber(activeRatio, 1)} : 100</strong>
            </div>

            <a className="source-link" href={investment.sourceUrl} target="_blank" rel="noreferrer">
              Producentdata ↗
            </a>
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="resin-material">Resin</label>
          <select
            id="resin-material"
            value={resin.id}
            onChange={(event) => onResinChange(event.target.value)}
          >
            {RESIN_MATERIALS.map((item) => (
              <option key={item.id} value={item.id}>{item.brand} · {item.name}</option>
            ))}
          </select>

          <div className="product-card resin-product-card">
            <span className="product-brand">{resin.brand}</span>
            <strong>{resin.name}</strong>
            <dl className="product-data">
              <div>
                <dt>Solid densitet · TDS</dt>
                <dd>{formatNumber(resin.solidDensityGPerCm3, 2)} g/cm³</dd>
              </div>
            </dl>
            <a className="source-link" href={resin.sourceUrl} target="_blank" rel="noreferrer">
              Producentdata ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  INVESTMENT_MATERIALS,
  RESIN_MATERIALS,
} from '../data/materials';
import './MaterialPanel.css';

interface MaterialPanelProps {
  investmentId: string;
  resinId: string;
  onInvestmentChange: (id: string) => void;
  onResinChange: (id: string) => void;
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
  onInvestmentChange,
  onResinChange,
}: MaterialPanelProps) {
  const investment = INVESTMENT_MATERIALS.find((item) => item.id === investmentId) ?? INVESTMENT_MATERIALS[0];
  const resin = RESIN_MATERIALS.find((item) => item.id === resinId) ?? RESIN_MATERIALS[0];
  const atelierWaterRatio = investment.calibration.waterGrams / investment.calibration.plasterGrams * 100;
  const ratio = investment.manufacturerWaterRatio;

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
                <dt>Atelierkalibrering</dt>
                <dd>{investment.calibration.plasterGrams} g / {investment.calibration.waterGrams} g</dd>
              </div>
              <div>
                <dt>Atelier vand : pulver</dt>
                <dd>{formatNumber(atelierWaterRatio, 2)} : 100</dd>
              </div>
              {ratio?.conventionalWaterPer100Powder !== undefined && (
                <div>
                  <dt>Producent · konventionel</dt>
                  <dd>{ratio.conventionalWaterPer100Powder} : 100</dd>
                </div>
              )}
              {ratio?.vacuumWaterMinPer100Powder !== undefined && ratio.vacuumWaterMaxPer100Powder !== undefined && (
                <div>
                  <dt>Producent · vakuum</dt>
                  <dd>{ratio.vacuumWaterMinPer100Powder}–{ratio.vacuumWaterMaxPer100Powder} : 100</dd>
                </div>
              )}
            </dl>
            <p className="material-note">
              Muchwater bruger din empiriske atelierkalibrering til selve fyldeberegningen. Producentens forhold er referenceinformation og ændrer ikke automatisk din gennemprøvede opskrift.
            </p>
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
            <p className="material-note">
              Densiteten bruges som udgangspunkt, når figurvolumen beregnes fra vægten af en hærdet resinmodel. Du kan stadig korrigere densiteten i vægtberegningen.
            </p>
            <a className="source-link" href={resin.sourceUrl} target="_blank" rel="noreferrer">
              Producentdata ↗
            </a>
          </div>
        </div>
      </div>

      <div className="calibration-alert">
        <strong>Kalibrering før datablad</strong>
        <span>
          Metacast-databladets vand/pulver-forhold er lavere end atelierets nuværende 750/1730-reference. Muchwater ændrer derfor ikke blandingen ud fra databladet, før en ny fysisk fyldetest er målt.
        </span>
      </div>
    </div>
  );
}

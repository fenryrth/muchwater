import { useMemo, useState } from 'react';
import { FigureVolumePanel } from './components/FigureVolumePanel';
import { MaterialPanel } from './components/MaterialPanel';
import {
  calculateFillVolume,
  calculateMix,
  cuvetteVolumeCm3,
  formatLitres,
  roundGrams,
} from './domain/calculations';
import type { Cuvette, MixingMethod } from './domain/types';
import { DEFAULT_CUVETTES } from './data/cuvettes';
import {
  DEFAULT_INVESTMENT_ID,
  DEFAULT_RESIN_ID,
  INVESTMENT_MATERIALS,
  RESIN_MATERIALS,
} from './data/materials';
import { loadCustomCuvettes, saveCustomCuvettes } from './storage/cuvettes';

const RESERVE_PRESETS = [0, 3, 5, 10];

function numberFromInput(value: string): number {
  const normalized = value.replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function App() {
  const [customCuvettes, setCustomCuvettes] = useState<Cuvette[]>(() => loadCustomCuvettes());
  const [selectedId, setSelectedId] = useState(DEFAULT_CUVETTES[0].id);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState(DEFAULT_INVESTMENT_ID);
  const [selectedResinId, setSelectedResinId] = useState(DEFAULT_RESIN_ID);
  const [mixingMethod, setMixingMethod] = useState<MixingMethod>('conventional');
  const [vacuumWaterRatio, setVacuumWaterRatio] = useState(40);
  const [figureVolume, setFigureVolume] = useState(0);
  const [powderGrams, setPowderGrams] = useState(1000);
  const [reservePercent, setReservePercent] = useState(0);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDiameter, setCustomDiameter] = useState(100);
  const [customHeight, setCustomHeight] = useState(150);

  const cuvettes = useMemo(() => [...DEFAULT_CUVETTES, ...customCuvettes], [customCuvettes]);
  const selectedCuvette = cuvettes.find((item) => item.id === selectedId) ?? cuvettes[0];
  const selectedInvestment = INVESTMENT_MATERIALS.find((item) => item.id === selectedInvestmentId) ?? INVESTMENT_MATERIALS[0];
  const selectedResin = RESIN_MATERIALS.find((item) => item.id === selectedResinId) ?? RESIN_MATERIALS[0];
  const selectedVolume = cuvetteVolumeCm3(selectedCuvette);
  const activeWaterRatio = mixingMethod === 'conventional'
    ? selectedInvestment.manufacturerWaterRatio.conventionalWaterPer100Powder
    : vacuumWaterRatio;

  const fillResult = useMemo(() => {
    try {
      return {
        value: calculateFillVolume(selectedCuvette, figureVolume),
        error: '',
      };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : 'Fyldevolumen kunne ikke beregnes.',
      };
    }
  }, [selectedCuvette, figureVolume]);

  const mixResult = useMemo(() => {
    try {
      return {
        value: calculateMix({
          powderGrams,
          waterPer100Powder: activeWaterRatio,
          reservePercent,
        }),
        error: '',
      };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : 'Blandingen kunne ikke beregnes.',
      };
    }
  }, [powderGrams, activeWaterRatio, reservePercent]);

  function addCustomCuvette() {
    if (customDiameter <= 0 || customHeight <= 0) return;

    const id = `custom-${Date.now()}`;
    const fallbackName = `Ø${Math.round(customDiameter)} × ${Math.round(customHeight)} mm`;
    const next: Cuvette = {
      id,
      name: customName.trim() || fallbackName,
      diameterMm: customDiameter,
      heightMm: customHeight,
      isCustom: true,
    };

    const updated = [...customCuvettes, next];
    setCustomCuvettes(updated);
    saveCustomCuvettes(updated);
    setSelectedId(id);
    setCustomName('');
    setShowCustomForm(false);
  }

  function removeSelectedCustomCuvette() {
    if (!selectedCuvette.isCustom) return;
    const updated = customCuvettes.filter((item) => item.id !== selectedCuvette.id);
    setCustomCuvettes(updated);
    saveCustomCuvettes(updated);
    setSelectedId(DEFAULT_CUVETTES[0].id);
  }

  return (
    <main className="app-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">Digitalt støbeværktøj · v0.2.2</p>
          <h1>Muchwater</h1>
          <p className="subtitle">Investmentberegner til atelieret</p>
        </div>
        <div className="calibration-chip" title="Aktivt producentforhold">
          <span>{selectedInvestment.brand} · {selectedInvestment.name}</span>
          <strong>{activeWaterRatio.toLocaleString('da-DK')} : 100</strong>
          <small>{mixingMethod === 'conventional' ? 'Konventionel blanding' : 'Vakuumblanding'}</small>
        </div>
      </header>

      <section className="workspace" aria-label="Støbeberegner">
        <div className="controls-panel">
          <div className="step-card">
            <div className="step-heading">
              <span className="step-number">01</span>
              <div>
                <h2>Vælg cuvette</h2>
                <p>Indvendige mål bruges til at beregne geometrisk fyldevolumen.</p>
              </div>
            </div>

            <label className="field-label" htmlFor="cuvette">Cuvette</label>
            <select id="cuvette" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              {cuvettes.map((cuvette) => (
                <option key={cuvette.id} value={cuvette.id}>{cuvette.name}</option>
              ))}
            </select>

            <div className="measure-row">
              <div><span>Diameter</span><strong>{selectedCuvette.diameterMm} mm</strong></div>
              <div><span>Højde</span><strong>{selectedCuvette.heightMm} mm</strong></div>
              <div><span>Volumen</span><strong>{formatLitres(selectedVolume)} L</strong></div>
            </div>

            <div className="button-row">
              <button className="secondary-button" type="button" onClick={() => setShowCustomForm((value) => !value)}>
                {showCustomForm ? 'Luk' : '+ Ny cuvette'}
              </button>
              {selectedCuvette.isCustom && (
                <button className="text-button danger" type="button" onClick={removeSelectedCustomCuvette}>
                  Slet valgt
                </button>
              )}
            </div>

            {showCustomForm && (
              <div className="custom-form">
                <label>
                  Navn
                  <input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Fx Stor stålcuvette" />
                </label>
                <div className="two-column">
                  <label>
                    Diameter · mm
                    <input type="number" min="1" step="1" value={customDiameter} onChange={(event) => setCustomDiameter(numberFromInput(event.target.value))} />
                  </label>
                  <label>
                    Højde · mm
                    <input type="number" min="1" step="1" value={customHeight} onChange={(event) => setCustomHeight(numberFromInput(event.target.value))} />
                  </label>
                </div>
                <button className="primary-button compact" type="button" onClick={addCustomCuvette}>Gem cuvette</button>
              </div>
            )}
          </div>

          <div className="step-card">
            <div className="step-heading">
              <span className="step-number">02</span>
              <div>
                <h2>Materialer</h2>
                <p>Produktdata og blandingsforhold kommer fra producenternes tekniske oplysninger.</p>
              </div>
            </div>

            <MaterialPanel
              investmentId={selectedInvestment.id}
              resinId={selectedResin.id}
              mixingMethod={mixingMethod}
              vacuumWaterPer100Powder={vacuumWaterRatio}
              onInvestmentChange={setSelectedInvestmentId}
              onResinChange={setSelectedResinId}
              onMixingMethodChange={setMixingMethod}
              onVacuumWaterRatioChange={setVacuumWaterRatio}
            />
          </div>

          <div className="step-card">
            <div className="step-heading">
              <span className="step-number">03</span>
              <div>
                <h2>Figurens volumen</h2>
                <p>Indtast faktisk volumen eller beregn den fra vægt og resinens TDS-densitet.</p>
              </div>
            </div>

            <FigureVolumePanel
              volumeCm3={figureVolume}
              resin={selectedResin}
              onVolumeChange={setFigureVolume}
            />

            {fillResult.value ? (
              <div className="measure-row">
                <div><span>Cuvette</span><strong>{formatLitres(fillResult.value.cuvetteVolumeCm3)} L</strong></div>
                <div><span>Figur</span><strong>{(fillResult.value.figureVolumeCm3 / 1000).toLocaleString('da-DK', { maximumFractionDigits: 3 })} L</strong></div>
                <div><span>Fyldes med investment</span><strong>{formatLitres(fillResult.value.fillVolumeCm3)} L</strong></div>
              </div>
            ) : (
              <p className="inline-error">{fillResult.error}</p>
            )}
          </div>

          <div className="step-card">
            <div className="step-heading">
              <span className="step-number">04</span>
              <div>
                <h2>Pulvermængde</h2>
                <p>Angiv hvor meget investmentpulver du vil blande. Vandet beregnes fra det valgte producentforhold.</p>
              </div>
            </div>

            <label className="field-label" htmlFor="powder-grams">Investmentpulver · gram</label>
            <div className="unit-input">
              <input
                id="powder-grams"
                type="number"
                min="0"
                step="1"
                value={powderGrams}
                onChange={(event) => setPowderGrams(numberFromInput(event.target.value))}
              />
              <span>g</span>
            </div>

            <label className="field-label">Reserve</label>
            <div className="reserve-buttons" aria-label="Reserveprocent">
              {RESERVE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={reservePercent === preset ? 'reserve active' : 'reserve'}
                  onClick={() => setReservePercent(preset)}
                >
                  {preset} %
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="result-panel" aria-live="polite">
          <p className="eyebrow">Producentblanding</p>
          {mixResult.value ? (
            <>
              <div className="result-primary">
                <span>Investmentpulver</span>
                <strong>{roundGrams(mixResult.value.powderGrams).toLocaleString('da-DK')}</strong>
                <em>gram</em>
              </div>
              <div className="result-primary water">
                <span>Vand</span>
                <strong>{roundGrams(mixResult.value.waterGrams).toLocaleString('da-DK')}</strong>
                <em>gram</em>
              </div>

              <dl className="result-details">
                <div><dt>Investment</dt><dd>{selectedInvestment.name}</dd></div>
                <div><dt>Resin</dt><dd>{selectedResin.name}</dd></div>
                <div><dt>Blandemetode</dt><dd>{mixingMethod === 'conventional' ? 'Konventionel' : 'Vakuum'}</dd></div>
                <div><dt>Vand : pulver</dt><dd>{mixResult.value.waterPer100Powder.toLocaleString('da-DK')} : 100</dd></div>
                <div><dt>Grundmængde pulver</dt><dd>{roundGrams(mixResult.value.basePowderGrams).toLocaleString('da-DK')} g</dd></div>
                <div><dt>Reserve</dt><dd>{mixResult.value.reservePercent.toLocaleString('da-DK')} %</dd></div>
                <div><dt>Total blanding</dt><dd>{roundGrams(mixResult.value.totalMixGrams).toLocaleString('da-DK')} g</dd></div>
                {fillResult.value && <div><dt>Geometrisk fyldevolumen</dt><dd>{formatLitres(fillResult.value.fillVolumeCm3)} L</dd></div>}
              </dl>

              <div className="ratio-card">
                <span>Gold Star Metacast · producentforhold</span>
                <strong>{mixResult.value.waterPer100Powder.toLocaleString('da-DK')} : 100</strong>
                <small>{mixingMethod === 'conventional' ? 'Konventionel blanding' : 'Vakuumblanding'}</small>
              </div>
            </>
          ) : (
            <div className="error-card">
              <strong>Kan ikke beregne</strong>
              <p>{mixResult.error}</p>
            </div>
          )}
        </aside>
      </section>

      <footer>
        <span>Muchwater v0.2.2 · atelier calculator</span>
        <span>Materialedata fra producenternes tekniske dokumentation.</span>
      </footer>
    </main>
  );
}

export default App;

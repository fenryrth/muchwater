import { useMemo, useState } from 'react';
import {
  CALIBRATION,
  CALIBRATION_VOLUME_CM3,
  boxVolumeCm3,
  calculateMix,
  cuvetteVolumeCm3,
  cylinderVolumeCm3,
  ellipsoidVolumeCm3,
  formatLitres,
  roundGrams,
} from './domain/calculations';
import type { Cuvette } from './domain/types';
import { DEFAULT_CUVETTES } from './data/cuvettes';
import { loadCustomCuvettes, saveCustomCuvettes } from './storage/cuvettes';

const RESERVE_PRESETS = [0, 3, 5, 10];
type FigureMethod = 'volume' | 'box' | 'cylinder' | 'ellipsoid';

function numberFromInput(value: string): number {
  const normalized = value.replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function App() {
  const [customCuvettes, setCustomCuvettes] = useState<Cuvette[]>(() => loadCustomCuvettes());
  const [selectedId, setSelectedId] = useState(DEFAULT_CUVETTES[0].id);
  const [figureMethod, setFigureMethod] = useState<FigureMethod>('volume');
  const [directFigureVolume, setDirectFigureVolume] = useState(0);
  const [figureLength, setFigureLength] = useState(0);
  const [figureWidth, setFigureWidth] = useState(0);
  const [figureHeight, setFigureHeight] = useState(0);
  const [figureDiameter, setFigureDiameter] = useState(0);
  const [reservePercent, setReservePercent] = useState(5);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDiameter, setCustomDiameter] = useState(100);
  const [customHeight, setCustomHeight] = useState(150);

  const cuvettes = useMemo(() => [...DEFAULT_CUVETTES, ...customCuvettes], [customCuvettes]);
  const selectedCuvette = cuvettes.find((item) => item.id === selectedId) ?? cuvettes[0];
  const selectedVolume = cuvetteVolumeCm3(selectedCuvette);

  const figureInputReady = useMemo(() => {
    if (figureMethod === 'volume') return directFigureVolume >= 0;
    if (figureMethod === 'cylinder') return figureDiameter > 0 && figureHeight > 0;
    return figureLength > 0 && figureWidth > 0 && figureHeight > 0;
  }, [figureMethod, directFigureVolume, figureDiameter, figureLength, figureWidth, figureHeight]);

  const figureVolume = useMemo(() => {
    if (figureMethod === 'volume') return directFigureVolume;
    if (figureMethod === 'box') return boxVolumeCm3(figureLength, figureWidth, figureHeight);
    if (figureMethod === 'cylinder') return cylinderVolumeCm3(figureDiameter, figureHeight);
    return ellipsoidVolumeCm3(figureLength, figureWidth, figureHeight);
  }, [figureMethod, directFigureVolume, figureDiameter, figureLength, figureWidth, figureHeight]);

  const result = useMemo(() => {
    if (!figureInputReady) {
      return {
        value: null,
        error: 'Udfyld alle figurens mål med værdier større end 0.',
      };
    }

    try {
      return {
        value: calculateMix({
          cuvette: selectedCuvette,
          figureVolumeCm3: figureVolume,
          reservePercent,
        }),
        error: '',
      };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : 'Beregningen kunne ikke udføres.',
      };
    }
  }, [selectedCuvette, figureVolume, figureInputReady, reservePercent]);

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
          <p className="eyebrow">Digitalt støbeværktøj · v0.1</p>
          <h1>Muchwater</h1>
          <p className="subtitle">Gipsberegner til atelieret</p>
        </div>
        <div className="calibration-chip" title="Empirisk kalibrering">
          <span>Kalibreret</span>
          <strong>{CALIBRATION.plasterGrams} g / {CALIBRATION.waterGrams} g</strong>
          <small>Ø{CALIBRATION.diameterMm} × {CALIBRATION.heightMm} mm</small>
        </div>
      </header>

      <section className="workspace" aria-label="Støbeberegner">
        <div className="controls-panel">
          <div className="step-card">
            <div className="step-heading">
              <span className="step-number">01</span>
              <div>
                <h2>Vælg cuvette</h2>
                <p>Indvendige mål bruges i beregningen.</p>
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
                <h2>Figurens volumen</h2>
                <p>Brug kendt volumen eller et geometrisk mål-estimat.</p>
              </div>
            </div>

            <label className="field-label" htmlFor="figure-method">Metode</label>
            <select id="figure-method" value={figureMethod} onChange={(event) => setFigureMethod(event.target.value as FigureMethod)}>
              <option value="volume">Kendt volumen · mest præcis</option>
              <option value="ellipsoid">Ellipsoide · mål-estimat</option>
              <option value="cylinder">Cylinder · mål-estimat</option>
              <option value="box">Kasse / blok · mål-estimat</option>
            </select>

            {figureMethod === 'volume' && (
              <>
                <label className="field-label" htmlFor="figure-volume">Volumen · cm³ / ml</label>
                <div className="unit-input">
                  <input
                    id="figure-volume"
                    type="number"
                    min="0"
                    step="1"
                    value={directFigureVolume}
                    onChange={(event) => setDirectFigureVolume(numberFromInput(event.target.value))}
                  />
                  <span>cm³</span>
                </div>
                <p className="field-note">
                  Mest præcist. Til en fysisk figur kan volumen fx måles med vandfortrængning, når materialet tåler metoden.
                </p>
              </>
            )}

            {figureMethod === 'cylinder' && (
              <div className="dimension-grid two-column">
                <label className="dimension-field">
                  Diameter · mm
                  <input type="number" min="0" step="1" value={figureDiameter} onChange={(event) => setFigureDiameter(numberFromInput(event.target.value))} />
                </label>
                <label className="dimension-field">
                  Højde · mm
                  <input type="number" min="0" step="1" value={figureHeight} onChange={(event) => setFigureHeight(numberFromInput(event.target.value))} />
                </label>
              </div>
            )}

            {(figureMethod === 'box' || figureMethod === 'ellipsoid') && (
              <div className="dimension-grid three-column">
                <label className="dimension-field">
                  Længde · mm
                  <input type="number" min="0" step="1" value={figureLength} onChange={(event) => setFigureLength(numberFromInput(event.target.value))} />
                </label>
                <label className="dimension-field">
                  Bredde · mm
                  <input type="number" min="0" step="1" value={figureWidth} onChange={(event) => setFigureWidth(numberFromInput(event.target.value))} />
                </label>
                <label className="dimension-field">
                  Højde · mm
                  <input type="number" min="0" step="1" value={figureHeight} onChange={(event) => setFigureHeight(numberFromInput(event.target.value))} />
                </label>
              </div>
            )}

            {figureMethod !== 'volume' && (
              <>
                <p className="field-note warning-note">
                  Estimat: Appen antager, at figuren er en massiv {figureMethod === 'box' ? 'kasse/blok' : figureMethod === 'cylinder' ? 'cylinder' : 'ellipsoide'}. En organisk skulptur kan afvige betydeligt.
                </p>
                {figureInputReady && (
                  <div className="figure-volume-preview">
                    <span>Estimeret figurvolumen</span>
                    <strong>{figureVolume.toLocaleString('da-DK', { maximumFractionDigits: 1 })} cm³</strong>
                  </div>
                )}
              </>
            )}

            <div className="future-note">
              <span>V2</span>
              STL samt vægt → volumen for voks og resin er planlagt og får egne materialedensiteter.
            </div>
          </div>

          <div className="step-card">
            <div className="step-heading">
              <span className="step-number">03</span>
              <div>
                <h2>Reserve</h2>
                <p>Ekstra blanding til spild og rester i spanden.</p>
              </div>
            </div>

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
            <label className="field-label" htmlFor="reserve">Brugerdefineret · %</label>
            <input
              id="reserve"
              type="number"
              min="0"
              max="100"
              step="1"
              value={reservePercent}
              onChange={(event) => setReservePercent(numberFromInput(event.target.value))}
            />
          </div>
        </div>

        <aside className="result-panel" aria-live="polite">
          <p className="eyebrow">Blanding</p>
          {result.value ? (
            <>
              <div className="result-primary">
                <span>Gips</span>
                <strong>{roundGrams(result.value.plasterGrams).toLocaleString('da-DK')}</strong>
                <em>gram</em>
              </div>
              <div className="result-primary water">
                <span>Vand</span>
                <strong>{roundGrams(result.value.waterGrams).toLocaleString('da-DK')}</strong>
                <em>gram</em>
              </div>

              <dl className="result-details">
                <div><dt>Fyldevolumen</dt><dd>{formatLitres(result.value.fillVolumeCm3)} L</dd></div>
                <div><dt>Figurvolumen</dt><dd>{result.value.figureVolumeCm3.toLocaleString('da-DK', { maximumFractionDigits: 1 })} cm³</dd></div>
                <div><dt>Figuren optager</dt><dd>{Math.round((result.value.figureVolumeCm3 / result.value.cuvetteVolumeCm3) * 100)} %</dd></div>
                <div><dt>Reserve</dt><dd>{result.value.reservePercent.toLocaleString('da-DK')} %</dd></div>
                <div><dt>Total blanding</dt><dd>{roundGrams(result.value.totalMixGrams).toLocaleString('da-DK')} g</dd></div>
              </dl>

              <div className="ratio-card">
                <span>Fast blandingsforhold</span>
                <strong>{CALIBRATION.plasterGrams} : {CALIBRATION.waterGrams}</strong>
                <small>Skaleret fra {formatLitres(CALIBRATION_VOLUME_CM3)} L referencevolumen</small>
              </div>
            </>
          ) : (
            <div className="error-card">
              <strong>Kan ikke beregne</strong>
              <p>{result.error}</p>
            </div>
          )}
        </aside>
      </section>

      <footer>
        <span>Muchwater v0.1 · atelier calculator</span>
        <span>Beregningen er empirisk kalibreret – ikke baseret på teoretisk densitet.</span>
      </footer>
    </main>
  );
}

export default App;

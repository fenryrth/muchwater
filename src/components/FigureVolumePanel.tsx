import { useMemo, useState } from 'react';
import { volumeFromMassAndDensity } from '../domain/figure';
import { analyzeStl } from '../domain/stl';
import type { StlUnit } from '../domain/stl';
import './FigureVolumePanel.css';

interface FigureVolumePanelProps {
  volumeCm3: number;
  onVolumeChange: (volumeCm3: number) => void;
}

type VolumeMethod = 'manual' | 'weight' | 'stl';

const METHODS: Array<{ id: VolumeMethod; label: string }> = [
  { id: 'manual', label: 'Volumen' },
  { id: 'weight', label: 'Vægt' },
  { id: 'stl', label: 'STL' },
];

const STL_UNITS: Array<{ id: StlUnit; label: string }> = [
  { id: 'mm', label: 'Millimeter (mm)' },
  { id: 'cm', label: 'Centimeter (cm)' },
  { id: 'inch', label: 'Tommer (inch)' },
  { id: 'm', label: 'Meter (m)' },
];

function numberFromInput(value: string): number {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatVolume(value: number): string {
  return value.toLocaleString('da-DK', {
    minimumFractionDigits: value < 10 ? 2 : 1,
    maximumFractionDigits: 2,
  });
}

export function FigureVolumePanel({ volumeCm3, onVolumeChange }: FigureVolumePanelProps) {
  const [method, setMethod] = useState<VolumeMethod>('manual');
  const [massGrams, setMassGrams] = useState(0);
  const [density, setDensity] = useState(0);
  const [materialName, setMaterialName] = useState('');
  const [stlUnit, setStlUnit] = useState<StlUnit>('mm');
  const [stlBuffer, setStlBuffer] = useState<ArrayBuffer | null>(null);
  const [stlFileName, setStlFileName] = useState('');

  const weightCandidate = useMemo(() => {
    try {
      return {
        value: volumeFromMassAndDensity(massGrams, density),
        error: '',
      };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : 'Volumen kunne ikke beregnes.',
      };
    }
  }, [massGrams, density]);

  const stlCandidate = useMemo(() => {
    if (!stlBuffer) return { value: null, error: '' };

    try {
      return {
        value: analyzeStl(stlBuffer, stlUnit),
        error: '',
      };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : 'STL-filen kunne ikke analyseres.',
      };
    }
  }, [stlBuffer, stlUnit]);

  async function handleStlFile(file: File | undefined) {
    if (!file) {
      setStlBuffer(null);
      setStlFileName('');
      return;
    }

    setStlFileName(file.name);
    setStlBuffer(await file.arrayBuffer());
  }

  return (
    <div className="figure-volume-panel">
      <div className="method-tabs" role="tablist" aria-label="Metode til figurvolumen">
        {METHODS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={method === item.id}
            className={method === item.id ? 'method-tab active' : 'method-tab'}
            onClick={() => setMethod(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {method === 'manual' && (
        <div className="method-panel" role="tabpanel">
          <label className="field-label" htmlFor="figure-volume">Volumen · cm³ / ml</label>
          <div className="unit-input">
            <input
              id="figure-volume"
              type="number"
              min="0"
              step="1"
              value={volumeCm3}
              onChange={(event) => onVolumeChange(numberFromInput(event.target.value))}
            />
            <span>cm³</span>
          </div>
          <p className="field-note">
            Brug faktisk volumen. Til en fysisk figur kan vandfortrængning være en præcis metode, når materialet tåler det.
          </p>
        </div>
      )}

      {method === 'weight' && (
        <div className="method-panel" role="tabpanel">
          <div className="two-column">
            <label>
              Figurens vægt · g
              <input
                type="number"
                min="0"
                step="0.1"
                value={massGrams}
                onChange={(event) => setMassGrams(numberFromInput(event.target.value))}
              />
            </label>
            <label>
              Densitet · g/cm³
              <input
                type="number"
                min="0"
                step="0.001"
                value={density}
                onChange={(event) => setDensity(numberFromInput(event.target.value))}
                placeholder="Fra datablad eller måling"
              />
            </label>
          </div>

          <label>
            Materiale · valgfrit
            <input
              value={materialName}
              onChange={(event) => setMaterialName(event.target.value)}
              placeholder="Fx min støbevoks"
            />
          </label>

          <p className="field-note warning-note">
            Densitet varierer mellem produkter. Muchwater gætter derfor ikke en værdi for voks eller resin; brug producentens datablad eller din egen kalibrerede densitet.
          </p>

          {weightCandidate.value !== null && density > 0 ? (
            <div className="candidate-card">
              <div>
                <span>Beregnet figurvolumen</span>
                <strong>{formatVolume(weightCandidate.value)} cm³</strong>
                {materialName.trim() && <small>{materialName.trim()}</small>}
              </div>
              <button
                className="primary-button compact"
                type="button"
                onClick={() => onVolumeChange(weightCandidate.value ?? 0)}
              >
                Brug volumen
              </button>
            </div>
          ) : (
            density > 0 && weightCandidate.error && <p className="inline-error">{weightCandidate.error}</p>
          )}
        </div>
      )}

      {method === 'stl' && (
        <div className="method-panel" role="tabpanel">
          <div className="two-column">
            <label>
              STL-fil
              <input
                className="file-input"
                type="file"
                accept=".stl"
                onChange={(event) => void handleStlFile(event.target.files?.[0])}
              />
            </label>
            <label>
              STL-enhed
              <select value={stlUnit} onChange={(event) => setStlUnit(event.target.value as StlUnit)}>
                {STL_UNITS.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.label}</option>
                ))}
              </select>
            </label>
          </div>

          <p className="field-note warning-note">
            STL-formatet gemmer ikke, om koordinaterne er mm, cm eller tommer. Vælg derfor samme enhed som modellen blev eksporteret med.
          </p>

          {stlCandidate.error && <p className="inline-error">{stlCandidate.error}</p>}

          {stlCandidate.value && (
            <div className={stlCandidate.value.watertight ? 'stl-card valid' : 'stl-card invalid'}>
              <div className="stl-status-row">
                <div>
                  <span>{stlFileName || 'STL-model'}</span>
                  <strong>{stlCandidate.value.watertight ? 'Lukket mesh' : 'Mesh kræver kontrol'}</strong>
                </div>
                <span className="status-pill">{stlCandidate.value.watertight ? 'Watertight' : 'Åben'}</span>
              </div>

              <dl className="stl-details">
                <div><dt>Volumen</dt><dd>{formatVolume(stlCandidate.value.volumeCm3)} cm³</dd></div>
                <div><dt>Dimensioner</dt><dd>{Math.round(stlCandidate.value.dimensionsMm.x)} × {Math.round(stlCandidate.value.dimensionsMm.y)} × {Math.round(stlCandidate.value.dimensionsMm.z)} mm</dd></div>
                <div><dt>Trekanter</dt><dd>{stlCandidate.value.triangleCount.toLocaleString('da-DK')}</dd></div>
                <div><dt>Format</dt><dd>{stlCandidate.value.format.toUpperCase()}</dd></div>
              </dl>

              {!stlCandidate.value.watertight && (
                <p className="inline-error">
                  Modellen har {stlCandidate.value.boundaryEdgeCount.toLocaleString('da-DK')} åbne kanter og {stlCandidate.value.nonManifoldEdgeCount.toLocaleString('da-DK')} ikke-manifold kanter. Volumen bruges ikke automatisk.
                </p>
              )}

              <button
                className="primary-button compact"
                type="button"
                disabled={!stlCandidate.value.watertight || stlCandidate.value.volumeCm3 <= 0}
                onClick={() => onVolumeChange(stlCandidate.value?.volumeCm3 ?? 0)}
              >
                Brug STL-volumen
              </button>
            </div>
          )}
        </div>
      )}

      <div className="active-volume">
        <span>Aktivt figurvolumen i blandingen</span>
        <strong>{formatVolume(volumeCm3)} cm³</strong>
      </div>
    </div>
  );
}

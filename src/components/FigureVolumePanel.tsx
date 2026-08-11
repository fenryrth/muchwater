import { useEffect, useMemo, useState } from 'react';
import { volumeFromMassAndDensity } from '../domain/figure';
import type { ResinMaterial } from '../domain/types';
import './FigureVolumePanel.css';

interface FigureVolumePanelProps {
  volumeCm3: number;
  resin: ResinMaterial;
  onVolumeChange: (volumeCm3: number) => void;
}

type VolumeMethod = 'manual' | 'weight';

const METHODS: Array<{ id: VolumeMethod; label: string }> = [
  { id: 'manual', label: 'Volumen' },
  { id: 'weight', label: 'Vægt' },
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

export function FigureVolumePanel({ volumeCm3, resin, onVolumeChange }: FigureVolumePanelProps) {
  const [method, setMethod] = useState<VolumeMethod>('manual');
  const [massGrams, setMassGrams] = useState(0);
  const [density, setDensity] = useState(resin.solidDensityGPerCm3);

  useEffect(() => {
    setDensity(resin.solidDensityGPerCm3);
  }, [resin.id, resin.solidDensityGPerCm3]);

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
          <div className="selected-resin">
            <span>Valgt resin</span>
            <strong>{resin.brand} · {resin.name}</strong>
            <small>Producentens TDS: solid densitet {resin.solidDensityGPerCm3.toLocaleString('da-DK')} g/cm³</small>
          </div>

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
              Densitet brugt · g/cm³
              <input
                type="number"
                min="0"
                step="0.001"
                value={density}
                onChange={(event) => setDensity(numberFromInput(event.target.value))}
              />
            </label>
          </div>

          <p className="field-note warning-note">
            Preset-værdien kommer fra Siraya Techs TDS for hærdet/solid Cast-resin. Feltet er redigerbart, hvis du senere måler en mere præcis værdi for din egen print- og hærdningsproces.
          </p>

          {weightCandidate.value !== null && density > 0 ? (
            <div className="candidate-card">
              <div>
                <span>Beregnet figurvolumen</span>
                <strong>{formatVolume(weightCandidate.value)} cm³</strong>
                <small>{resin.name}</small>
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

      <div className="active-volume">
        <span>Aktivt figurvolumen i blandingen</span>
        <strong>{formatVolume(volumeCm3)} cm³</strong>
      </div>
    </div>
  );
}

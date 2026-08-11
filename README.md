# Muchwater

**Muchwater** er et digitalt støbeværktøj til atelieret. Version 1 beregner, hvor meget gips og vand der skal blandes til en cylindrisk cuvette, når figurens volumen trækkes fra og en valgfri reserve lægges til.

## Kalibrering

Projektets empiriske reference er:

- Cuvette: **Ø100 mm × 150 mm** (indvendige mål)
- Gips: **1730 g**
- Vand: **750 g**
- Geometrisk referencevolumen: ca. **1178,10 cm³**

Ved 0 cm³ figurvolumen og 0 % reserve skal referencecuvetten derfor altid give **1730 g gips + 750 g vand**. Dette er projektets vigtigste invariant og dækkes af automatiske tests.

## Version 1

- cylindriske cuvetter
- faste presets + egne cuvetter gemt lokalt i browseren
- figurinput med fire metoder:
  - kendt/faktisk volumen i cm³/ml — anbefalet
  - ellipsoide ud fra længde, bredde og højde — estimat
  - cylinder ud fra diameter og højde — estimat
  - kasse/blok ud fra længde, bredde og højde — estimat
- automatisk fratræk af figurens volumen
- reserve på 0, 3, 5, 10 % eller brugerdefineret 0–100 %
- resultat for gips, vand, total blanding, figurvolumen og fyldevolumen
- offline-first PWA-grundlag
- responsivt interface til PC, tablet og telefon
- testet, UI-uafhængig beregningskerne

> **Vigtigt:** Geometriske mål er kun estimater. En organisk skulptur har sjældent samme volumen som sin bounding box. Brug kendt/fysisk målt volumen, når præcision er vigtig. Vandfortrængning er én mulighed, hvis figurens materiale tåler det.

## Installation og test på Pop!_OS 24 med Conda

### 1. Klon projektet

Åbn Terminal og kør:

```bash
git clone https://github.com/fenryrth/muchwater.git
cd muchwater
```

Hvis du allerede har klonet projektet tidligere:

```bash
cd muchwater
git pull
```

### 2. Opret Conda-miljøet

Første gang:

```bash
conda env create -f environment.yml
conda activate muchwater
```

`environment.yml` installerer Node.js 22 i det isolerede Muchwater-miljø.

Hvis miljøet allerede findes:

```bash
conda activate muchwater
conda env update -f environment.yml --prune
```

### 3. Installer JavaScript-pakker

Første gang og når `package.json` ændrer sig:

```bash
npm install
```

### 4. Kør automatiske kontroller

```bash
npm test
npm run typecheck
npm run build
```

Forventning:

- alle Vitest-tests er grønne
- TypeScript melder ingen fejl
- Vite kan bygge en produktionsversion

### 5. Start appen

```bash
npm run dev
```

Vite viser en lokal adresse i terminalen, normalt:

```text
http://localhost:5173
```

Åbn adressen i Firefox, Chromium eller Chrome. Stop udviklingsserveren med `Ctrl+C`.

## Første manuelle kontrol

### Kontrol A — referencekalibreringen

Vælg/brug:

- cuvette: Ø100 × 150 mm
- figurmetode: Kendt volumen
- figurvolumen: 0 cm³
- reserve: 0 %

Resultatet skal være:

- **1730 g gips**
- **750 g vand**
- **2480 g total blanding**

### Kontrol B — figur fylder halvdelen

Samme cuvette og 0 % reserve, men figurvolumen ca. `589,05 cm³`.

Resultatet skal være ca.:

- **865 g gips**
- **375 g vand**

### Kontrol C — reserve

Referencecuvette, 0 cm³ figur og 5 % reserve.

Resultatet vises afrundet som ca.:

- **1817 g gips**
- **788 g vand**

### Kontrol D — målbaseret figur

Vælg fx `Ellipsoide` og indtast længde, bredde og højde. Appen skal vise det estimerede figurvolumen og bruge det direkte i gips-/vandberegningen. Skift tilbage til `Kendt volumen`, når du vil arbejde med et fysisk målt volumen.

## Beregningsprincip

1. Cuvettevolumen beregnes som en cylinder: `π × r² × h`.
2. Figurens volumen trækkes fra cuvettevolumen.
3. Det resterende fyldevolumen sammenlignes med referencevolumen Ø100 × 150 mm.
4. Både 1730 g gips og 750 g vand skaleres med samme faktor.
5. En eventuel reserve lægges på til sidst.

Det faste blandingsforhold ændres altså ikke af skaleringen.

## Projektstruktur

- `src/domain/calculations.ts` — formler, kalibrering og geometriske volumenhelpers
- `src/domain/calculations.test.ts` — regressionstests
- `src/domain/types.ts` — domænetyper
- `src/data/cuvettes.ts` — indbyggede cuvettepresets
- `src/storage/cuvettes.ts` — localStorage til egne cuvetter
- `src/App.tsx` — V1-workflow og UI
- `src/styles.css` — visuelt system og responsiv styling
- `public/` — PWA-manifest, ikon og service worker
- `AI.md` — teknisk overdragelse og vedligeholdelsesregler for AI/agenter
- `ROADMAP.md` — implementeret og planlagt funktionalitet

## Roadmap

Se [ROADMAP.md](ROADMAP.md). Version 2 planlægger STL-volumen samt vægt → volumen for voks og resin med redigerbare densiteter. Version 3 udvider mod et egentligt atelier-/batchværktøj.

## AI-overdragelse

Se [AI.md](AI.md). Den fil er projektets tekniske overdragelsesnotat. Fremtidige AI-agenter skal kontrollere `AI.md` og `ROADMAP.md` ved enhver kodeændring og opdatere dem, når projektstatus, arkitektur, domæneregler eller planlagte funktioner ændrer sig.

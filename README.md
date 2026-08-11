# Muchwater

**Muchwater** er et digitalt støbeværktøj til atelieret. Version 1 beregner, hvor meget gips og vand der skal blandes til en cylindrisk cuvette, når figurens volumen trækkes fra.

## Kalibrering

Projektets empiriske reference er:

- Cuvette: Ø100 mm × 150 mm (indvendige mål)
- Gips: 1730 g
- Vand: 750 g
- Geometrisk referencevolumen: ca. 1178,10 cm³

Ved 0 cm³ figurvolumen og 0 % reserve skal referencecuvetten derfor altid give **1730 g gips + 750 g vand**. Dette er en invariant og dækkes af automatiske tests.

## Version 1

- kalibreret Ø100 × 150 mm referencecuvette som eneste indbyggede preset
- egne cylindriske cuvetter med faktiske indvendige mål, gemt lokalt i browseren
- figurvolumen med fire metoder:
  - kendt/faktisk volumen i cm³/ml — **mest præcis og anbefalet**
  - ellipsoide ud fra længde, bredde og højde — estimat
  - cylinder ud fra diameter og højde — estimat
  - kasse/blok ud fra længde, bredde og højde — estimat
- automatisk fratræk af figurens volumen
- reserve på 0, 3, 5, 10 % eller brugerdefineret 0–100 %
- resultat for gips, vand, total blanding, figurvolumen og fyldevolumen
- offline-first PWA-grundlag
- responsivt interface til PC, tablet og telefon
- unit tests af beregningskernen og de geometriske volumenfunktioner

> **Vigtigt:** De målbaserede figurmetoder er estimater. En uregelmæssig skulptur har typisk mindre faktisk volumen end sin bounding box. Brug kendt eller fysisk målt volumen, når præcision er vigtig. Vandfortrængning kan være en metode, når figuren/materialet tåler det.

Andre cuvettestørrelser er ikke gættet ind i programmet. Opret dem i appen med de faktiske indvendige mål; de gemmes automatisk i browseren på den pågældende enhed.

## Installation på Pop!_OS 24 med Conda

### 1. Klon projektet

```bash
git clone https://github.com/fenryrth/muchwater.git
cd muchwater
```

Hvis du allerede har klonet projektet tidligere, så brug i stedet:

```bash
cd muchwater
git pull
```

### 2. Opret Conda-miljøet

```bash
conda env create -f environment.yml
conda activate muchwater
```

Hvis miljøet allerede findes efter en senere opdatering:

```bash
conda env update -f environment.yml --prune
conda activate muchwater
```

`environment.yml` installerer Node.js 22 via conda-forge.

### 3. Installer JavaScript-dependencies

```bash
npm install
```

### 4. Kør de automatiske kontroller

```bash
npm test
npm run typecheck
npm run build
```

Alle tre kommandoer skal afslutte uden fejl.

### 5. Start udviklingsversionen

```bash
npm run dev
```

Vite viser en lokal adresse i terminalen, normalt:

```text
http://localhost:5173
```

Åbn adressen i din browser. Stop serveren igen med `Ctrl+C` i terminalen.

## Første manuelle kontrol

### A. Referencekalibreringen

Start med referencecuvetten og vælg `Kendt volumen`:

- Figurvolumen: `0 cm³`
- Reserve: `0 %`

Resultatet skal være:

- **Gips: 1730 g**
- **Vand: 750 g**
- **Total blanding: 2480 g**

### B. Halvt fyldevolumen

- Cuvette: Ø100 × 150 mm
- Figurmetode: `Kendt volumen`
- Figurvolumen: ca. `589,05 cm³`
- Reserve: `0 %`

Resultatet skal være ca.:

- **Gips: 865 g**
- **Vand: 375 g**

### C. Reserve

- Cuvette: Ø100 × 150 mm
- Figurvolumen: `0 cm³`
- Reserve: `5 %`

Resultatet vises afrundet som ca.:

- **Gips: 1817 g**
- **Vand: 788 g**

### D. Figurens mål

Vælg fx `Ellipsoide`, indtast længde, bredde og højde, og kontrollér at appen viser et **estimeret figurvolumen**. Resultatet for gips og vand skal ændre sig, når målene ændres.

Skift også mellem `Cylinder` og `Kasse / blok` for at kontrollere de forskellige estimeringsmetoder. UI'et skal tydeligt fortælle, at de er estimater.

### E. Din egen cuvette

Opret én af dine virkelige cuvetter med dens **indvendige** diameter og højde. Genindlæs siden og kontrollér, at cuvetten stadig findes. Det validerer den lokale lagring.

### Produktionspreview

Efter `npm run build` kan den byggede version testes med:

```bash
npm run preview
```

## Beregningsprincip

1. Cuvettevolumen beregnes som en cylinder: `π × r² × h`.
2. Figurens volumen trækkes fra cuvettevolumen.
3. Det resterende fyldevolumen sammenlignes med referencevolumen Ø100 × 150 mm.
4. Både 1730 g gips og 750 g vand skaleres med samme faktor.
5. En eventuel reserve lægges på til sidst.

Det faste blandingsforhold ændres altså ikke af skaleringen.

For målbaseret figurinput beregnes først et estimat i cm³, og dette volumen sendes derefter gennem præcis den samme gips-/vandberegning som et kendt volumen.

## Roadmap

Se [ROADMAP.md](ROADMAP.md). Version 1 er implementeret og afventer første manuelle workshopstest. Version 2 planlægger STL-volumen samt vægt → volumen for voks og resin med redigerbare densiteter. Version 3 udvider mod et egentligt atelier-/batchværktøj.

## AI-overdragelse

Se [AI.md](AI.md). Den fil er projektets tekniske overdragelsesnotat. Fremtidige AI-agenter skal kontrollere både `AI.md` og `ROADMAP.md` ved kodeændringer og holde dem synkroniseret med projektets faktiske tilstand.

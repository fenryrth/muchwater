# Muchwater

**Muchwater** er et digitalt støbeværktøj til atelieret. Appen beregner, hvor meget gips og vand der skal blandes til en cylindrisk cuvette, når figurens faktiske volumen trækkes fra.

Aktuel version: **v0.2.0 — første V2-snit**.

## Kalibrering

Projektets empiriske reference er:

- Cuvette: Ø100 mm × 150 mm (indvendige mål)
- Gips: 1730 g
- Vand: 750 g
- Geometrisk referencevolumen: ca. 1178,10 cm³

Ved 0 cm³ figurvolumen og 0 % reserve skal referencecuvetten altid give **1730 g gips + 750 g vand**. Dette er en invariant og dækkes af automatiske tests.

## Version 1 — gipsberegner

- kalibreret Ø100 × 150 mm referencecuvette som eneste indbyggede preset
- egne cylindriske cuvetter med faktiske indvendige mål, gemt lokalt i browseren
- automatisk fratræk af figurvolumen
- reserve på 0, 3, 5, 10 % eller brugerdefineret
- resultat for gips, vand, total blanding og fyldevolumen
- offline-first PWA-grundlag
- responsivt interface til PC, tablet og telefon

## Version 2 — første implementering

Figurens volumen kan nu leveres på tre måder:

1. **Volumen** — skriv faktisk volumen direkte i cm³/ml.
2. **Vægt** — skriv figurens vægt og densitet i g/cm³; appen beregner `masse / densitet`.
3. **STL** — vælg en ASCII- eller binær STL-fil; appen analyserer den lokalt i browseren og beregner volumen.

STL-flowet viser også:

- modellens dimensioner
- trekantantal
- ASCII/binært format
- om mesh-kanttopologien ser lukket/watertight ud
- antal åbne og non-manifold kanter ved fejl

### Vigtigt om STL-enheder

STL-formatet gemmer ikke en standardiseret fysisk enhed. Muchwater kan derfor ikke vide, om filens tal betyder mm, cm, inch eller meter. Vælg den samme enhed, som modellen blev eksporteret med. Standardvalget i appen er mm, men det er et brugerinput — ikke metadata læst fra filen.

### Vigtigt om densitet

Densitet varierer mellem forskellige vokse, resiner og andre materialer. Muchwater gætter derfor ikke en universel densitet. Brug producentens datablad eller din egen målte/kalibrerede værdi.

### Aktuel V2-begrænsning

Første STL-version kontrollerer mesh-kanterne for åben/non-manifold geometri, men eksplicit validering af forkert face winding/orientering er stadig planlagt. Indtil den kontrol er implementeret, bør du sammenligne de første virkelige STL-resultater med volumen fra den 3D-software, modellen eksporteres fra.

## Installation på Pop!_OS 24 med Conda

### Første installation

```bash
git clone https://github.com/fenryrth/muchwater.git
cd muchwater
conda env create -f environment.yml
conda activate muchwater
npm install
```

### Når projektet allerede findes lokalt

```bash
cd ~/Documents/Python/muchwater
conda activate muchwater
git pull
```

Hvis `environment.yml` senere ændres, kan miljøet synkroniseres med:

```bash
conda env update -f environment.yml --prune
```

## Automatiske kontroller

Kør:

```bash
npm test
npm run typecheck
npm run build
```

Alle tre kommandoer skal afslutte uden fejl. I v0.2.0 er der **12 unit tests** fordelt på gipsberegning, vægt/densitet og STL-analyse.

## Start appen

```bash
npm run dev
```

Vite viser en lokal adresse i terminalen, normalt:

```text
http://localhost:5173
```

Åbn adressen i browseren. Stop serveren igen med `Ctrl+C`.

## Manuel test — V1-regression

Vælg:

- Cuvette: Ø100 × 150 mm
- Figurvolumen: `0 cm³`
- Reserve: `0 %`

Forventet resultat:

- **Gips: 1730 g**
- **Vand: 750 g**
- **Total blanding: 2480 g**

Test derefter ca. halv fyldevolumen:

- Cuvette: Ø100 × 150 mm
- Figurvolumen: ca. `589,05 cm³`
- Reserve: `0 %`

Forventet resultat ca.:

- **Gips: 865 g**
- **Vand: 375 g**

## Manuel test — V2 vægt

Under **Figurens volumen → Vægt** kan du teste matematikken med:

- Vægt: `184 g`
- Densitet: `0,92 g/cm³`

Den beregnede volumen skal være:

- **200,00 cm³**

Tryk **Brug volumen** og kontrollér, at aktivt figurvolumen bliver 200 cm³ og blandingsresultatet ændrer sig.

Denne densitet er kun et testtal til at kontrollere divisionen; den skal ikke opfattes som en universel voksdensitet.

## Manuel test — V2 STL

Brug helst en lukket STL-model, hvor du allerede kan se volumen i din 3D-software.

1. Gå til **Figurens volumen → STL**.
2. Vælg STL-filen.
3. Vælg den enhed, filen blev eksporteret i, typisk mm hvis det er dit workflow.
4. Kontrollér at dimensionerne i Muchwater svarer til modellens kendte dimensioner.
5. Kontrollér at status er **Watertight**.
6. Sammenlign Muchwaters cm³-volumen med volumen fra din 3D-software.
7. Tryk **Brug STL-volumen** og kontrollér at blandingsberegningen opdateres.

Hvis dimensionerne er fx 10× eller 25,4× forkerte, er STL-enheden sandsynligvis valgt forkert.

Hvis Muchwater markerer modellen som åben, bruges STL-volumen ikke automatisk. Reparér/forsegl mesh'et i din 3D-software og eksportér igen.

## Produktionspreview

Efter `npm run build` kan den byggede version testes med:

```bash
npm run preview
```

## Beregningsprincip

1. Cuvettevolumen beregnes som en cylinder: `π × r² × h`.
2. Figurens faktiske volumen kommer fra manuel input, vægt/densitet eller STL.
3. Figurens volumen trækkes fra cuvettevolumen.
4. Det resterende fyldevolumen sammenlignes med referencevolumen Ø100 × 150 mm.
5. Både 1730 g gips og 750 g vand skaleres med samme faktor.
6. Eventuel reserve lægges på til sidst.

Det faste blandingsforhold ændres ikke af skaleringen.

## Roadmap

Se [ROADMAP.md](ROADMAP.md) for implementeret og planlagt funktionalitet. Næste V2-snit fokuserer på stærkere STL-validering, gemte materialer/densiteter og gemte figurer/modeller. Version 3 udvider mod batchhistorik og et bredere atelier-workflow.

## AI-overdragelse

Se [AI.md](AI.md). Filen er projektets tekniske overdragelsesnotat og skal holdes synkron med projektet, når arkitektur, domæneregler, roadmap eller centrale beslutninger ændres.

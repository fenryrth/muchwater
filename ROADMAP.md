# Muchwater Roadmap

Statusnøgle:

- `[x]` implementeret og integreret
- `[ ]` planlagt / ikke implementeret
- `[-]` udsat eller under revurdering

En funktion markeres først `[x]`, når den er reelt brugbar. Stub-kode tæller ikke.

## V1 · Beregner

**Status: implementeret i første testbare udgave (`0.1.x`).**

### Beregningsmotor

- [x] Empirisk reference: 1730 g gips + 750 g vand i Ø100 × 150 mm
- [x] Cuvettevolumen som cylinder
- [x] Figurvolumen trækkes fra før skalering
- [x] Reserve lægges på efter figurvolumen er trukket fra
- [x] Fast gips/vand-forhold bevares ved skalering
- [x] Validering af ugyldig figurvolumen og reserve 0–100 %
- [x] Unit tests af referenceinvariant og lineær skalering

### Cuvetter

- [x] Cuvettepresets
- [x] Egne cylindriske cuvetter
- [x] Lokal lagring af egne cuvetter
- [x] Slet egne cuvetter
- [ ] Faktisk målt/kalibreret kapacitet pr. cuvette som alternativ til ren geometrisk volumen

### Figurinput

- [x] Kendt/faktisk figurvolumen i cm³/ml
- [x] Ellipsoide-estimat fra længde, bredde og højde
- [x] Cylinder-estimat fra diameter og højde
- [x] Kasse/blok-estimat fra længde, bredde og højde
- [x] Tydelig advarsel om at målbaserede metoder kun er estimater
- [x] Vis estimeret figurvolumen før/under beregning

### Resultat og UI

- [x] Gips i gram
- [x] Vand i gram
- [x] Total blanding
- [x] Fyldevolumen
- [x] Figurvolumen og andel af cuvetten
- [x] Reserveprocent
- [x] Responsivt værkstedsinterface
- [x] PWA/offline-grundlag

### Projekt og dokumentation

- [x] React + TypeScript + Vite
- [x] UI-uafhængig domænelogik
- [x] Vitest-tests af beregningsmotoren
- [x] Conda-miljø med Node.js 22
- [x] README med Pop!_OS/Conda-testvejledning
- [x] `AI.md` med arkitektur, invarianter og obligatorisk vedligeholdelsesregel
- [x] `ROADMAP.md` med implementeret og planlagt arbejde

## V1.1 · Kalibrering og værkstedsfinpudsning

**Status: planlagt efter praktisk test af V1.**

- [ ] Faktisk målt cuvettekapacitet i cm³/ml
- [ ] Gem standard-reserve pr. bruger/cuvette
- [ ] Gem seneste valgte cuvette, figurmetode og reserve
- [ ] Eksport/import af gemte cuvetter som lokal JSON-backup
- [ ] Printvenlig resultatvisning
- [ ] Gennemtestet PWA-installation på Chromium/Android
- [ ] Praktiske reference-tests fra rigtige atelierstøbninger
- [ ] Automatisk CI på GitHub for test, typecheck og build

## V2 · Model og materiale

**Status: planlagt.**

Målet er at gøre figurvolumen hurtigere og mere præcis uden manuel volumenmåling.

- [ ] STL-upload i browseren
- [ ] Beregn volumen fra lukket/watertight STL-mesh
- [ ] Vis STL-dimensioner og advarsel ved åbent/ugyldigt mesh
- [ ] Vægt → volumen
- [ ] Materialepresets for støbevoks og resin
- [ ] Redigerbar densitet (g/cm³), da produkter varierer
- [ ] Gemte materialer
- [ ] Gemte figurer/modeller
- [ ] Mulighed for at sammenligne volumenmetoder

Vigtig domæneregel: densiteter må aldrig hardcodes som universelle sandheder. De skal være presets med tydelig mulighed for kalibrering/redigering.

## V3 · Atelier og batch

**Status: langsigtet plan.**

- [ ] Batchhistorik
- [ ] Projektnavn/figur/cuvette/materiale på hver blanding
- [ ] Noter: for lidt / perfekt / for meget
- [ ] Registrer restmængde efter støbning
- [ ] Kalibreringsanalyse baseret på egne batches
- [ ] Korrektion må ikke anvendes automatisk uden brugeraccept
- [ ] Egne gips-/investment-opskrifter
- [ ] Eksport/print af batchrapport
- [ ] Mulig 3D-preview af STL
- [ ] Backup/import af lokale data
- [ ] Statistik for materialeforbrug
- [ ] Flere cuvetter til ét større arbejde

## Ikke besluttet endnu

- Backend/synkronisering mellem enheder. V1 er bevidst frontend-only og local-first.
- Login/cloud storage. Skal kun tilføjes, hvis et reelt workflow kræver det.
- Andre cuvettegeometrier end cylinder.
- React/TypeScript beholdes som nuværende frontend-stack; backend eller desktop-packaging indføres kun ved et konkret behov.

## Beslutningslog

### 2026-08-11 — Empirisk reference er autoritativ

Opskriften skaleres fra den praktiske reference 1730 g / 750 g / Ø100 × 150 mm. Appen forsøger ikke at udlede blandingsvolumen ved at lægge teoretiske råmaterialevolumener sammen.

### 2026-08-11 — Målbaseret figurinput i V1

V1 understøtter kasse, cylinder og ellipsoide som praktiske estimater, fordi atelierbrugeren ofte kender figurens mål før det faktiske volumen. Kendt/fysisk målt volumen er stadig standarden for højeste præcision, og UI'et skal altid markere de geometriske metoder som estimater.

### 2026-08-11 — Frontend-only i V1

V1 bruger React + TypeScript + Vite uden backend. Beregningen kræver ingen serverdata, og local-first/offline-first er værdifuldt i atelieret. En backend tilføjes kun, hvis senere synkronisering, backup eller anden reel funktionalitet kræver den.

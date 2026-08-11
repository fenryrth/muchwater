# Muchwater Roadmap

## V1 · Beregner

Status: implementeret i første udgave.

- [x] Empirisk reference: 1730 g gips + 750 g vand i Ø100 × 150 mm
- [x] Cuvettepresets
- [x] Egne cylindriske cuvetter
- [x] Figurvolumen i cm³/ml
- [x] Reserveprocent
- [x] Gips-, vand- og totalberegning
- [x] Lokal lagring af egne cuvetter
- [x] Responsivt værkstedsinterface
- [x] PWA/offline-grundlag
- [x] Unit tests af beregningsmotoren

## V2 · Model og materiale

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

- [ ] Batchhistorik
- [ ] Projektnavn/figur/cuvette/materiale på hver blanding
- [ ] Noter: for lidt / perfekt / for meget
- [ ] Registrer restmængde efter støbning
- [ ] Kalibreringsanalyse baseret på egne batches
- [ ] Egne gips-/investment-opskrifter
- [ ] Eksport/print af batchrapport
- [ ] Mulig 3D-preview af STL
- [ ] Backup/import af lokale data

## Ikke besluttet endnu

- Backend/synkronisering mellem enheder. V1 er bevidst frontend-only og local-first.
- Login/cloud storage. Skal kun tilføjes, hvis et reelt workflow kræver det.
- Andre cuvettegeometrier end cylinder.

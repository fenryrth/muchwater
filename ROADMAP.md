# Muchwater Roadmap

## V1 · Beregner

Status: **implementeret i første udgave og manuelt prøvet på Pop!_OS 24; afventer genkørsel af typecheck/build efter Vite type-fix.**

- [x] Empirisk reference: 1730 g gips + 750 g vand i Ø100 × 150 mm
- [x] Kalibreret referencecuvette som indbygget preset
- [x] Egne cylindriske cuvetter med faktiske indvendige mål
- [x] Figurvolumen i cm³/ml
- [x] Reserveprocent
- [x] Gips-, vand- og totalberegning
- [x] Lokal lagring af egne cuvetter
- [x] Responsivt værkstedsinterface
- [x] PWA/offline-grundlag
- [x] Unit tests af beregningsmotoren
- [x] Første bruger-/workshopstest på Pop!_OS 24: appen kører, 5/5 tests består
- [x] Fix for manglende Vite TypeScript client declarations
- [ ] Bekræft lokalt at `npm run typecheck` og `npm run build` består efter `git pull`

V1-regel: der må ikke tilføjes antagede cuvettestørrelser som standarddata. Kun verificerede værkstedsmål eller den empiriske reference må være presets.

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

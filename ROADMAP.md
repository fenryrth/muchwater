# Muchwater Roadmap

## V1 · Beregner

Status: **implementeret og manuelt prøvet på Pop!_OS 24.**

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
- [x] Første bruger-/workshopstest på Pop!_OS 24: appen kører, 5/5 oprindelige tests består
- [x] Fix for manglende Vite TypeScript client declarations

V1-regel: der må ikke tilføjes antagede cuvettestørrelser som standarddata. Kun verificerede værkstedsmål eller den empiriske reference må være presets.

## V2 · Model og materiale

Status: **første V2-snit implementeret som v0.2.0; afventer lokal test på Pop!_OS med brugerens egne STL-filer.**

### Implementeret i v0.2.0

- [x] Tre metoder til figurvolumen: manuel volumen, vægt/densitet og STL
- [x] Vægt → volumen via `masse / densitet`
- [x] Redigerbar densitet i g/cm³
- [x] Ingen gættede universelle voks-/resindensiteter
- [x] STL-upload og analyse direkte i browseren
- [x] ASCII STL
- [x] Binær STL
- [x] Signed-tetrahedron volumenberegning
- [x] Eksplicit STL-enhed: mm, cm, inch eller m
- [x] Vis STL-dimensioner, trekantantal og format
- [x] Kantbaseret watertight-kontrol
- [x] Åbne/non-manifold meshes blokeres fra automatisk brug
- [x] Unit tests for vægt/densitet og syntetiske ASCII/binære STL-filer

### Næste V2-snit

- [ ] Udvid mesh-validering med kontrol af inkonsistent face winding/orientering
- [ ] Materialepresets/templates for støbevoks og resin uden at fremstille generiske densiteter som fabriksdata
- [ ] Gem brugerens egne materialer og kalibrerede densiteter
- [ ] Gemte figurer/modeller
- [ ] Mulighed for at sammenligne volumenmetoder og gemme valgt kilde
- [ ] Bedre STL-fejlrapportering for meget store eller beskadigede filer
- [ ] Workshopstest med virkelige STL-filer og sammenligning mod kendt volumen fra 3D-software

Vigtig domæneregel: densiteter må aldrig hardcodes som universelle sandheder. De skal komme fra brugerens produktdata/kalibrering eller tydeligt mærkede templates med redigerbar værdi.

Vigtig STL-regel: STL-formatet har ingen standardiseret enhedsmetadata. Brugeren skal eksplicit vælge den enhed, modellen blev eksporteret med.

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

- Backend/synkronisering mellem enheder. Appen er bevidst frontend-only og local-first.
- Login/cloud storage. Skal kun tilføjes, hvis et reelt workflow kræver det.
- Andre cuvettegeometrier end cylinder.

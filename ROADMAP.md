# Muchwater Roadmap

## V1 · Beregner

Status: **implementeret og manuelt prøvet på Pop!_OS 24.**

- [x] Empirisk reference: 1730 g gips/investment + 750 g vand i Ø100 × 150 mm
- [x] Kalibreret referencecuvette som indbygget preset
- [x] Egne cylindriske cuvetter med faktiske indvendige mål
- [x] Figurvolumen i cm³/ml
- [x] Reserveprocent
- [x] Gips-, vand- og totalberegning
- [x] Lokal lagring af egne cuvetter
- [x] Responsivt værkstedsinterface
- [x] PWA/offline-grundlag
- [x] Unit tests af beregningsmotoren
- [x] Første bruger-/workshopstest på Pop!_OS 24
- [x] Vite TypeScript client declarations

V1-regel: der må ikke tilføjes antagede cuvettestørrelser som standarddata. Kun verificerede værkstedsmål eller den empiriske reference må være presets.

## V2 · Materialer og modelvolumen

Status: **materiale-fokuseret v0.2.1 implementeret; afventer lokal test på Pop!_OS.**

### Retningsændring

STL-funktionen fra det første V2-snit er fjernet efter brugerens beslutning. Den forventes sjældent brugt og passer dårligere til det daglige atelier-workflow end produkt- og materialevalg.

### Implementeret i v0.2.1

- [x] STL-upload, STL-parser og STL-tests fjernet
- [x] Nyt trin: Materialer
- [x] Separat valg af investment/gips og resin
- [x] Gold Star Powders Metacast som første verificerede investment-preset
- [x] Metacast producentdata: 40:100 conventional, 38–40:100 vacuum
- [x] Atelierets 1730/750-reference holdes separat fra fabrikantens ratio
- [x] Beregningsmotor understøtter materialespecifik empirisk kalibrering
- [x] Siraya Tech Cast True Blue / Royal Blue resinpreset
- [x] Siraya Tech Cast Purple resinpreset
- [x] Siraya Tech TDS solid density 1.2 g/cm³ som redigerbar startværdi
- [x] Vægt → volumen via `masse / densitet`
- [x] Produktkilder gemt sammen med preset-data
- [x] Unit tests for kritiske materialedata
- [x] PWA-cacheversion opdateret efter V2-ændringen

### Vigtig Metacast-kalibrering

Gold Star angiver officielt vand:pulver:

- konventionel blanding: `40:100`
- vakuumblanding: `38–40:100`

Atelierets nuværende empiriske reference `750/1730` svarer til ca. `43,35:100`.

Muchwater bruger fortsat **1730/750 til fyldevolumen**, fordi den fysisk kendte reference ikke må erstattes med fabrikantens forhold uden en ny målt referencefyldning.

### Næste V2-snit

- [ ] Lokal Pop!_OS-validering: `npm test`, `npm run typecheck`, `npm run build`
- [ ] Browsertest af materialevalg og Siraya vægtberegning
- [ ] Gem egne resinprodukter med navn + densitet
- [ ] Gem egne investmentprodukter med empirisk referencekalibrering
- [ ] Kalibreringsguide til nye investments
- [ ] Gem fabrikantens ratio separat fra atelierets kalibrering
- [ ] Gemte figurer/modeller med vægt og faktisk volumen
- [ ] Persistér senest valgte materialer mellem sessioner
- [ ] Overvej proces-/burnout-noter pr. materialekombination

Vigtig investment-regel: en ny gips/investment må ikke bruges til automatisk gram-beregning alene ud fra fabrikantens vand/pulver-ratio. Den skal have en verificeret empirisk fyldekalibrering.

Vigtig resin-regel: produktdensitet skal komme fra officiel TDS eller brugerens egen kalibrering og skal kunne korrigeres.

## V3 · Atelier og batch

- [ ] Batchhistorik
- [ ] Projektnavn/figur/cuvette/materialer på hver blanding
- [ ] Noter: for lidt / perfekt / for meget
- [ ] Registrer restmængde efter støbning
- [ ] Kalibreringsanalyse baseret på egne batches
- [ ] Flere gips-/investment-opskrifter
- [ ] Eksport/print af batchrapport
- [ ] Backup/import af lokale data
- [ ] Mulig synkronisering mellem enheder, hvis workflowet kræver det

## Ikke besluttet endnu

- Backend/synkronisering mellem enheder. Appen er bevidst frontend-only og local-first.
- Login/cloud storage. Skal kun tilføjes, hvis et reelt workflow kræver det.
- Andre cuvettegeometrier end cylinder.
- Automatisk burnout-planlægning. Kan senere være relevant pr. kombination af investment/resin, men er ikke en del af den nuværende beregningskerne.

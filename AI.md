# AI.md — Muchwater handover

Denne fil er skrevet til en ny AI eller udvikler, der skal kunne forstå projektet hurtigt og fortsætte uden at genopfinde centrale beslutninger. **Opdater filen i samme ændring/commit, når domæneregler, arkitektur, roadmap, kalibrering, materialedata, centrale workflows eller oplysninger her bliver forældede.**

## 1. Projektets formål

Muchwater er et professionelt, digitalt støbeværktøj til et skulpturatelier. Appen beregner investment/gips og vand til cylindriske cuvetter ud fra en empirisk værkstedskalibrering og figurens faktiske fortrængte volumen.

Aktuel version er **v0.2.1 / V2 materialer**.

V2 er bevidst omlagt fra STL-analyse til et mere praktisk atelier-workflow:

1. vælg cuvette
2. vælg investment/gips og resin
3. angiv figurvolumen direkte eller beregn den fra vægt + resinens densitet
4. vælg reserve
5. aflæs investment og vand

**STL-funktionen er fjernet efter brugerens udtrykkelige beslutning og skal ikke genintroduceres uden en ny anmodning.**

Brugeren er ikke udvikler. Installation, fejlmeddelelser og UI skal derfor være praktiske og selvforklarende. Undgå løsninger, der kræver daglig terminal-/kodehåndtering.

## 2. Ufravigelig empirisk grundkalibrering

Brugerens værkstedsreference er:

- referencecuvette: indvendig diameter 100 mm
- referencehøjde: 150 mm
- investment/gips: 1730 g
- vand: 750 g

Referencecuvettens geometriske volumen er:

`π × (5 cm)^2 × 15 cm = 1178.097245... cm³`

Ved tom referencecuvette og 0 % reserve er forventet resultat præcis:

- 1730 g investment/gips
- 750 g vand

Dette er projektets vigtigste regressionstest.

Brugeren har efterfølgende oplyst, at standardproduktet er **Gold Star Powders Metacast**. Muchwater knytter derfor denne empiriske atelierkalibrering til Metacast-preset'et.

## 3. Kritisk regel: atelierkalibrering og producentdata er to forskellige ting

Gold Star Powders' officielle Metacast-specifikation angiver vand:pulver:

- Conventional Mixing: `40:100`
- Vacuum Mixing: `38–40:100`

Kilde verificeret 2026-08-11:
`https://www.goldstarpowders.com/products/metacast-premium-investment-powder/`

Atelierreferencen `750 / 1730` svarer derimod til ca. `43,35:100`.

**Muchwater må ikke automatisk erstatte 1730/750 med producentens ratio.** Producentens ratio er referenceinformation, mens 1730/750 er den empiriske fyldekalibrering, der faktisk ligger til grund for appens volumenskalering.

Årsag: et vand/pulver-forhold alene fortæller ikke sikkert, hvor mange gram færdig slurry der skal til for at fylde et givet geometrisk volumen. Hvis brugeren ønsker at skifte til producentens 40:100 eller 38–40:100 som aktiv opskrift, skal der først udføres en ny fysisk referencefyldning og gemmes en ny empirisk kalibrering.

## 4. Hovedformel

For cylindrisk cuvette:

`cuvetteVolume = π × radius² × height`

`fillVolume = cuvetteVolume - figureVolume`

For den valgte investments empiriske kalibrering:

`referenceVolume = π × referenceRadius² × referenceHeight`

`scale = fillVolume / referenceVolume`

`investment = calibratedInvestmentGrams × scale × (1 + reservePercent / 100)`

`water = calibratedWaterGrams × scale × (1 + reservePercent / 100)`

V2.1 gør kalibreringen materialespecifik via `MixInput.calibration`. Default fallback er fortsat 1730/750-referencekalibreringen.

## 5. Figurvolumen

**Brug ikke figurens bounding-box/ydermål som volumen.** For en uregelmæssig skulptur overvurderer det normalt fortrængningen kraftigt.

Aktuelle inputmetoder:

1. Manuel faktisk volumen i cm³/ml.
2. Vægt/densitet: `volumeCm3 = massGrams / densityGPerCm3`.

Den valgte metode leverer kun `figureVolumeCm3`; selve investment-/vandmotoren er uafhængig af, hvordan volumen blev fundet.

## 6. Resinproduktdata

Standard resin-familie er **Siraya Tech Cast**.

Officiel Siraya Tech TDS angiver `Solid Density = 1.2 g/cm³` for:

- Cast Purple
- Cast True Blue / Royal Blue

Kilde verificeret 2026-08-11:
`https://siraya.tech/pages/cast-castable-resin-tds`

Muchwater har begge som resinpresets og bruger `1.2 g/cm³` som startværdi til vægt → volumen. Densitetsfeltet er stadig redigerbart.

### Siraya-dokumentationsforskellen

Sirayas separate Cast user guide bruger et generelt tal på `1.1 g/ml` i et eksempel til beregning af støbemetal fra printvægt. TDS'en angiver derimod eksplicit **solid density 1.2 g/cm³**.

Til Muchwaters formål — volumen ud fra vægten af en hærdet, fast resinmodel — er designbeslutningen at bruge TDS'ens **solid density 1.2 g/cm³**. Bevar denne begrundelse i dokumentationen, medmindre producenten opdaterer data eller brugeren leverer en egen kalibreret densitet.

User guide-kilde verificeret 2026-08-11:
`https://siraya.tech/pages/cast-resin-user-guide`

## 7. Materialepresets nu

Investment:

- Gold Star Powders · Metacast
  - empirisk atelierkalibrering: Ø100 × 150 mm → 1730 g / 750 g
  - producent ratio: 40:100 conventional, 38–40:100 vacuum

Resin:

- Siraya Tech · Cast True Blue / Royal Blue — solid density 1.2 g/cm³
- Siraya Tech · Cast Purple — solid density 1.2 g/cm³

**Tilføj ikke en ny investment som aktiv beregningspreset alene ud fra fabrikantens vand/pulver-ratio.** En investment skal have en verificeret empirisk fyldekalibrering, før Muchwater må bruge den til gram-beregning.

Nye resinpresets kan tilføjes fra officielle TDS-data, fordi resinens densitet kun bruges til `mass / density` og stadig kan redigeres af brugeren.

## 8. Arkitektur

Appen er **frontend-only, local-first og offline-first**:

- React + TypeScript
- Vite
- Vitest
- browser `localStorage` til egne cuvetter
- PWA-manifest + service worker
- ingen backend, login eller database

Der er ingen STL/3D-parser og ingen 3D dependency.

## 9. Filstruktur

- `src/domain/calculations.ts` — investment-/vandmotor; understøtter materialespecifik `MixCalibration`.
- `src/domain/calculations.test.ts` — referenceinvariant, skalering, reserve og materialespecifik kalibrering.
- `src/domain/figure.ts` — vægt/densitet → volumen.
- `src/domain/figure.test.ts` — tests for vægt/densitet.
- `src/domain/types.ts` — cuvette-, kalibrerings- og materialetyper.
- `src/data/cuvettes.ts` — verificerede indbyggede cuvetter.
- `src/data/materials.ts` — verificerede investment- og resinpresets samt officielle kilder.
- `src/data/materials.test.ts` — regressionstest for kritiske produktdata.
- `src/storage/cuvettes.ts` — localStorage-adapter for egne cuvetter.
- `src/components/MaterialPanel.tsx` — valg og produktdata for investment/resin.
- `src/components/MaterialPanel.css` — materialepanel styling.
- `src/components/FigureVolumePanel.tsx` — manuel volumen eller vægt/densitet.
- `src/components/FigureVolumePanel.css` — volumepanel styling.
- `src/App.tsx` — workflow: cuvette → materialer → figurvolumen → reserve → resultat.
- `src/styles.css` — globalt visuelt system.
- `src/vite-env.d.ts` — Vite client declarations; nødvendig for CSS-imports og `import.meta.env`.
- `public/` — PWA-manifest, ikon og service worker.
- `ROADMAP.md` — implementeret og planlagt funktionalitet.
- `README.md` — installation, produktdata og testvejledning.

## 10. UI-principper

Dette er et atelierinstrument, ikke et generisk admin-dashboard.

- store, hurtigt aflæselige gramresultater
- danske labels
- høj kontrast og store klik-/touchflader
- responsivt til PC/tablet/telefon
- ingen skjulte beregningsantagelser
- produktdata og atelierkalibrering skal visuelt holdes adskilt
- producentdata må aldrig præsenteres som brugerens verificerede værkstedsdata
- beregnet kandidatvolumen fra vægt aktiveres eksplicit med “Brug volumen”

Den visuelle retning er mørk, varm og materialebåret: kul/sort, gips/off-white, messing/oker og afdæmpet vandtone.

## 11. Data og migration

Custom cuvettes ligger under localStorage-nøglen:

`muchwater.customCuvettes.v1`

v0.2.1 ændrer ikke cuvetteformatet.

Materialepresets er aktuelt statiske verificerede data i `src/data/materials.ts`. Gemte egne materialer er næste V2-snit og skal have en versioneret storage-adapter i stedet for ad hoc localStorage-kald i UI-komponenter.

## 12. Definition of done

For enhver ændring der påvirker beregning eller materialedata:

1. Opdater/tilføj unit tests.
2. Verificer referenceinvarianten 1730/750.
3. Verificer officielle materialekilder, hvis produktdata ændres.
4. Kør `npm test`.
5. Kør `npm run typecheck`.
6. Kør `npm run build`.
7. Workshopstest relevante nye flows i browseren.
8. Opdater `AI.md`.
9. Opdater `README.md` og/eller `ROADMAP.md` hvis brugerflow/status ændres.

Efterlad aldrig `AI.md` eller `ROADMAP.md` med status, der ikke matcher `main`.

## 13. Lokal valideringshistorik

- 2026-08-11: V1 blev prøvet på Pop!_OS 24; browserappen kørte og 5/5 oprindelige tests bestod.
- Vite TypeScript declarations blev efterfølgende rettet via `src/vite-env.d.ts`.
- v0.2.0 introducerede kortvarigt STL-analyse.
- 2026-08-11: brugeren besluttede, at STL sjældent ville blive brugt og skulle fjernes. V2 blev derfor omlagt til materialevalg og vægt/densitet.
- v0.2.1 implementerer Gold Star Metacast + Siraya Tech Cast-presets og afventer lokal `npm test`, `npm run typecheck`, `npm run build` samt browsertest på Pop!_OS.
- Forventet v0.2.1-testtal: **11 tests i 3 testfiler**.

## 14. Næste prioriterede V2-arbejde

1. Gemte brugerdefinerede resinmaterialer med egen densitet.
2. Gemte brugerdefinerede investment-typer med eksplicit empirisk referencefyldning.
3. Et kalibreringsflow der guider brugeren gennem ny investment: referencecuvette → faktiske gram pulver/vand → gem preset.
4. Mulighed for at gemme producentens blandingsratio separat fra atelierkalibreringen.
5. Gemte figurer/modeller med vægt og volumen.
6. Senere evt. burnout-/procesnoter pr. materialekombination, hvis det giver praktisk værdi.

## 15. Fremtidig kalibrering

V3 kan bruge batchhistorik til at estimere systematisk over-/underforbrug. Dette må ikke automatisk overskrive grundkalibreringen uden brugerens tydelige handling. Bevar rå værkstedsreference og eventuelle personlige korrektioner som separate begreber.

## 16. Sprog og navngivning

Brugerfladen er dansk. Kode, typer, funktionsnavne og commits kan være engelsk. `Muchwater` er projektnavnet/reponavnet.

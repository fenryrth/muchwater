# AI.md — Muchwater handover

Denne fil er skrevet til en ny AI eller udvikler, der skal kunne forstå projektet hurtigt og fortsætte uden at genopfinde centrale beslutninger. **Opdater filen i samme ændring/commit, når domæneregler, arkitektur, roadmap, produktdata eller centrale workflows ændres.**

## 1. Projektets formål

Muchwater er et digitalt støbeværktøj til et skulpturatelier.

Aktuel version: **v0.2.2 / V2 producentdata**.

Workflow:

1. vælg cuvette
2. vælg investment og resin
3. vælg fabrikantens blandemetode/ratio
4. angiv figurvolumen direkte eller via vægt + resinens TDS-densitet
5. beregn geometrisk fyldevolumen
6. angiv pulvermængde
7. beregn vand efter fabrikantens vand/pulver-forhold
8. valgfri reserve bevarer samme vand/pulver-forhold

Brugeren er ikke udvikler. UI, installation og fejlmeddelelser skal være praktiske og selvforklarende.

## 2. Ufravigelig produktregel: kun producentdata

Brugeren besluttede 2026-08-12, at den tidligere empiriske **1730 g pulver / 750 g vand / Ø100 × 150 mm**-kalibrering skal fjernes helt.

**Den må ikke genintroduceres.**

Materialedata i Muchwater skal fremover komme fra officielle producentkilder. Ingen atelierreference, brugerafledt yield-faktor, antaget slurry-densitet eller skjult volumen→masse-konstant må bruges som materialegrundlag.

Geometriske formler er naturligvis almindelig matematik og er ikke produktdata.

## 3. Gold Star Powders Metacast — source of truth

Officiel produktside, verificeret 2026-08-12:

`https://www.goldstarpowders.com/products/metacast-premium-investment-powder/`

Officielt Metacast-datablad:

`https://www.goldstarpowders.com/wp-content/uploads/2024/11/GSP-Metacast-Datasheet.pdf`

Producentdata:

- Conventional Mixing: **40:100 vand:pulver**
- Vacuum Mixing: **38–40:100 vand:pulver**
- producenten instruerer i at veje pulver/vand og tilsætte pulver til vand

Muchwater bruger:

`waterGrams = powderGrams × waterPer100Powder / 100`

Konventionel metode er fast 40. Vakuummetoden tillader kun værdier i producentens publicerede interval 38–40.

### Ingen volumen→pulver-konvertering

De officielle Metacast-kilder, som projektet anvender, offentliggør vand/pulver-forholdet, men ikke en officiel faktor, der oversætter et bestemt slurry-/cuvettevolumen til gram pulver.

Derfor er geometri og materialemasse bevidst adskilt i appen:

- cuvette + figur → geometrisk fyldevolumen
- brugerens pulvermængde + fabrikantens ratio → pulver/vand

**Opfind ikke en conversion factor for at koble disse sammen.** Hvis Gold Star senere offentliggør en officiel yield/slurry-density/flask-quantity-metode, kan funktionen udvides med den dokumenterede producentværdi.

## 4. Siraya Tech Cast — source of truth

Officiel TDS, verificeret 2026-08-12:

`https://siraya.tech/pages/cast-castable-resin-tds`

TDS angiver **Solid Density = 1.2 g/cm³** for:

- Cast Purple
- Cast True Blue / Royal Blue

Muchwater bruger derfor:

`figureVolumeCm3 = massGrams / 1.2`

Densiteten er ikke redigerbar i v0.2.2, fordi materialeberegninger skal følge producentens tekniske data.

Sirayas generelle Cast user guide har et eksempel med 1.1 g/ml til metalvægtberegning, men projektets kildehierarki er: **produktspecifik TDS før generel user guide**, når TDS'en eksplicit angiver solid density for den konkrete resin.

## 5. Figurvolumen

Brug ikke figurens bounding-box/ydermål som volumen.

Aktuelle inputmetoder:

1. manuel faktisk volumen i cm³/ml
2. vægt → volumen med den valgte resins officielle solid density

Figurvolumen bruges kun til geometrisk fyldevolumen:

`fillVolume = cuvetteVolume - figureVolume`

## 6. Geometri

For cylindrisk cuvette:

`cuvetteVolume = π × radius² × height`

Cuvettemål indtastes i mm og konverteres internt til cm før cm³ beregnes.

Geometri må ikke bruges til at udlede investment-masse, medmindre en officiel producentmetode for volumen→masse senere tilføjes.

## 7. Reserve

Reserve er et brugerdefineret mængdetillæg, ikke et materialeparameter.

`powderWithReserve = powder × (1 + reservePercent / 100)`

Vandet beregnes derefter fra fabrikantens uændrede ratio:

`water = powderWithReserve × waterPer100Powder / 100`

Default reserve i v0.2.2 er 0 %.

## 8. Materialepresets nu

Investment:

- Gold Star Powders · Metacast
  - conventional 40:100
  - vacuum 38–40:100

Resin:

- Siraya Tech · Cast True Blue / Royal Blue — solid density 1.2 g/cm³
- Siraya Tech · Cast Purple — solid density 1.2 g/cm³

Nye materialepresets skal have officielle producentkilder gemt sammen med data.

## 9. Arkitektur

Appen er **frontend-only, local-first og offline-first**:

- React + TypeScript
- Vite
- Vitest
- browser `localStorage` til egne cuvetter
- PWA-manifest + service worker
- ingen backend, login eller database
- ingen STL/3D-parser

STL blev fjernet efter brugerens beslutning og må ikke genintroduceres uden en ny eksplicit anmodning.

## 10. Filstruktur

- `src/domain/calculations.ts` — geometri + fabrikant-ratio-beregning; ingen empirisk kalibrering.
- `src/domain/calculations.test.ts` — geometri, 40:100, 38:100, reserve og inputvalidering.
- `src/domain/figure.ts` — vægt/densitet → volumen.
- `src/domain/figure.test.ts` — tests for vægt/densitet.
- `src/domain/types.ts` — cuvette-, materiale-, mixing- og resultattyper.
- `src/data/cuvettes.ts` — indbyggede/verificerede cuvetter.
- `src/data/materials.ts` — officielle investment-/resinpresets og kilde-URL'er.
- `src/data/materials.test.ts` — regressionstest for producentdata.
- `src/storage/cuvettes.ts` — localStorage for egne cuvetter.
- `src/components/MaterialPanel.tsx` — producentmaterialer, blandemetode og ratio.
- `src/components/FigureVolumePanel.tsx` — manuel volumen eller producentdensitet via vægt.
- `src/App.tsx` — hovedworkflow.
- `README.md` — installation, principper og testvejledning.
- `ROADMAP.md` — implementeret og planlagt funktionalitet.

## 11. UI-principper

Dette er et atelierinstrument, ikke et generisk admin-dashboard.

- danske labels
- høj kontrast og store klik-/touchflader
- store gramresultater
- produktdata skal være tydeligt mærket med producent
- ingen empiriske kalibreringsbudskaber
- ingen skjulte materialekonstanter
- fabrikantens ratio skal være synlig i resultatet
- geometri og gram-beregning skal visuelt være forståelige som separate beregninger

## 12. Data og migration

Custom cuvettes ligger fortsat under:

`muchwater.customCuvettes.v1`

v0.2.2 ændrer ikke cuvetteformatet.

Materialepresets er statiske verificerede data i `src/data/materials.ts`.

## 13. Definition of done

Ved ændringer i materialedata eller beregningslogik:

1. verificer den officielle producentkilde
2. opdater/tilføj unit tests
3. kør `npm test`
4. kør `npm run typecheck`
5. kør `npm run build`
6. workshopstest relevante browserflows
7. opdater `AI.md`
8. opdater `README.md`/`ROADMAP.md` når status eller workflow ændres

Efterlad aldrig dokumentationen med en empirisk kalibrering eller andre data, som ikke længere findes i koden.

## 14. Lokal valideringshistorik

- V1 blev oprindeligt prøvet på Pop!_OS 24.
- Manglende Vite client declarations blev rettet med `src/vite-env.d.ts`.
- Et tidligt V2-snit introducerede STL; det blev senere fjernet på brugerens anmodning.
- v0.2.1 introducerede materialepresets men beholdt midlertidigt 1730/750 som empirisk Metacast-kalibrering.
- 2026-08-12: brugeren krævede, at empirisk kalibrering fjernes helt, og at materialeberegninger udelukkende baseres på producentdata.
- v0.2.2 implementerer denne regel og afventer lokal Pop!_OS-validering.
- Forventet v0.2.2-testtal: **12 tests i 3 testfiler**.

## 15. Næste V2-arbejde

1. lokal test af v0.2.2
2. persistér senest valgte investment, resin og blandemetode
3. tilføj flere materialer kun fra officielle producentkilder
4. gemte figurer/modeller med vægt og volumen
5. proces-/burnout-oplysninger fra producentdokumentation, hvis de giver praktisk værdi
6. hvis en producent offentliggør officiel slurry yield / volume-to-mass-metode, kan geometrisk fyldevolumen kobles til gram uden empirisk kalibrering

## 16. Sprog og navngivning

Brugerfladen er dansk. Kode, typer, funktionsnavne og commits kan være engelsk. `Muchwater` er projektnavnet/reponavnet.

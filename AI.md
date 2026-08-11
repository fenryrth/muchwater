# AI.md — Muchwater handover

Denne fil er skrevet til en ny AI eller udvikler, der skal kunne forstå projektet hurtigt og fortsætte uden at genopfinde centrale beslutninger. **Opdater filen i samme ændring/commit, når domæneregler, arkitektur, roadmap, kalibrering, centrale workflows eller oplysninger her bliver forældede.**

## 1. Projektets formål

Muchwater er et professionelt, digitalt støbeværktøj til et skulpturatelier. Appen beregner gips og vand til cylindriske cuvetter ud fra en empirisk værkstedskalibrering og figurens faktiske fortrængte volumen.

Projektet er nu på **v0.2.0 / første V2-snit**. Figurvolumen kan komme fra manuel volumen, vægt + densitet eller STL-analyse direkte i browseren.

Brugeren er ikke udvikler. Installation, fejlmeddelelser og UI skal derfor være praktiske og selvforklarende. Undgå løsninger, der kræver daglig terminal-/kodehåndtering.

## 2. Ufravigelig empirisk kalibrering

Kildedata fra værkstedet:

- referencecuvette: indvendig diameter 100 mm
- referencehøjde: 150 mm
- gips: 1730 g
- vand: 750 g

Referencecuvettens geometriske volumen er:

`π × (5 cm)^2 × 15 cm = 1178.097245... cm³`

Ved tom referencecuvette og 0 % reserve er forventet resultat præcis:

- 1730 g gips
- 750 g vand

Dette er projektets vigtigste regressionstest. Blandingen er en **empirisk kalibrering**; erstat den ikke med teoretiske antagelser om gipsdensitet eller additive gips-/vandvolumener.

## 3. Hovedformel

For cylindrisk cuvette:

`cuvetteVolume = π × radius² × height`

Alle cuvettemål konverteres fra mm til cm før volumen beregnes.

`fillVolume = cuvetteVolume - figureVolume`

`scale = fillVolume / referenceVolume`

`plaster = 1730 × scale × (1 + reservePercent / 100)`

`water = 750 × scale × (1 + reservePercent / 100)`

Blandingsforholdet 1730:750 bevares altid. Reserve lægges på begge komponenter med samme faktor.

## 4. Figurvolumen — domæneregler

**Brug ikke figurens bounding-box/ydermål som volumen.** For en uregelmæssig skulptur vil det normalt overvurdere fortrængningen kraftigt.

V2 har tre inputmetoder:

1. Manuel faktisk volumen i cm³/ml.
2. Vægt/densitet: `volumeCm3 = massGrams / densityGPerCm3`.
3. STL: beregn volumen fra trianguleret mesh client-side.

Den valgte metode leverer kun `figureVolumeCm3`; selve gips-/vandmotoren er fortsat uafhængig af inputmetoden.

### Densitet

Densitet varierer mellem voks-, resin- og andre produkter. **Opfind ikke en densitet og præsenter den som produktdata.** Første V2-snit kræver derfor, at brugeren selv indtaster densitet fra datablad eller egen kalibrering.

Gemte materialer og redigerbare materialetemplates er planlagt i næste V2-snit.

## 5. STL-regler

STL-analyse er client-side og har ingen upload/server.

Aktuel parser understøtter:

- ASCII STL
- binær STL
- signed tetrahedron volume
- dimensionsberegning
- trekantantal
- kantbaseret watertight-kontrol
- detektion af boundary edges og non-manifold edges

### Kritisk: STL har ingen enhedsmetadata

STL-formatet fortæller ikke, om koordinaterne er mm, cm, inch eller meter. UI skal derfor altid kræve et eksplicit enhedsvalg. Standard er mm, fordi det er almindeligt i 3D-print/CAD-workflows, men standarden må ikke fremstilles som filens kendte enhed.

### Aktuel STL-sikkerhedsbegrænsning

Kanttopologien kontrolleres, men **inkonsistent face winding/orientering kontrolleres endnu ikke eksplicit**. Et mesh kan i sjældne tilfælde være kantmæssigt lukket men have forkert orienterede faces, hvilket kan påvirke signed-volume-resultatet. Dette er et prioriteret næste V2-punkt i `ROADMAP.md`.

Indtil det er implementeret, bør virkelige STL-filer workshopstestes mod et kendt volumen fra den software, de eksporteres fra.

## 6. Arkitektur nu

Appen er fortsat **frontend-only, local-first og offline-first**:

- React + TypeScript
- Vite
- Vitest
- browser `localStorage` til egne cuvetter
- PWA-manifest + service worker
- ingen backend, login eller database
- ingen ekstern STL/3D-parser dependency

Begrundelse: beregningen behøver ingen server, STL-filer bør ikke forlade brugerens maskine, og værkstedsværktøjet skal være hurtigt og robust offline.

Tilføj ikke backend før et konkret krav, fx synkronisering eller backup på tværs af enheder, retfærdiggør kompleksiteten.

## 7. Cuvetter og værkstedsdata

Den eneste indbyggede cuvette er den empirisk kalibrerede reference **Ø100 × 150 mm**.

**Opfind ikke andre standardstørrelser.** Andre cuvetter er værkstedsdata og skal oprettes af brugeren med faktiske indvendige mål og gemmes via localStorage. Hvis brugeren senere giver en verificeret liste over egne cuvetter, kan de tilføjes som eksplicitte presets.

## 8. Filstruktur

- `src/domain/calculations.ts` — gips-/vandmotor og kalibreringskonstanter; UI-uafhængig.
- `src/domain/calculations.test.ts` — regressionstest for referenceblanding og volumenskalering.
- `src/domain/figure.ts` — vægt/densitet → volumen.
- `src/domain/figure.test.ts` — tests for vægt/densitet.
- `src/domain/stl.ts` — ASCII/binær STL-parser, volumen, dimensioner og kanttopologi.
- `src/domain/stl.test.ts` — syntetiske STL-regressionstests.
- `src/domain/types.ts` — kernedomænetyper.
- `src/data/cuvettes.ts` — kun verificerede indbyggede cuvetter.
- `src/storage/cuvettes.ts` — localStorage-adapter for custom cuvettes.
- `src/components/FigureVolumePanel.tsx` — V2 volume input UI: manuel, vægt, STL.
- `src/components/FigureVolumePanel.css` — V2 panel styling.
- `src/App.tsx` — overordnet workflow: cuvette → figurvolumen → reserve → resultat.
- `src/styles.css` — globalt visuelt system.
- `src/vite-env.d.ts` — Vites TypeScript client declarations; nødvendig for CSS-imports og `import.meta.env`.
- `public/` — PWA-manifest, ikon og service worker.
- `ROADMAP.md` — implementeret og planlagt funktionalitet.
- `README.md` — installation og testvejledning.

## 9. UI-principper

Dette er et atelierinstrument, ikke et generisk admin-dashboard.

- store, hurtigt aflæselige gramresultater
- få trin: cuvette → figurvolumen → reserve → resultat
- danske labels
- høj kontrast og store klik-/touchflader
- responsivt til PC/tablet/telefon
- ingen skjulte beregningsantagelser
- fejl forklares i almindeligt dansk
- beregnede kandidatvolumener fra vægt/STL skal aktiveres eksplicit med “Brug volumen”

Den visuelle retning er mørk, varm og materialebåret: kul/sort, gips/off-white, messing/oker og afdæmpet vandtone.

## 10. Data og migration

Custom cuvettes ligger under localStorage-nøglen:

`muchwater.customCuvettes.v1`

V2-snittet ændrer ikke cuvetteformatet, så eksisterende data skal fortsat virke uden migration.

Hvis en lagret datastruktur ændres senere, bump versionssuffixet eller implementer eksplicit migration. Ændr ikke eksisterende lagrede data tavst.

## 11. Definition of done

For enhver ændring der påvirker beregning eller modelanalyse:

1. Opdater/tilføj unit tests.
2. Verificer referenceinvarianten 1730/750.
3. Kør `npm test`.
4. Kør `npm run typecheck`.
5. Kør `npm run build`.
6. Workshopstest relevante nye flows i browseren.
7. Opdater `AI.md` hvis arkitektur/domæne/workflow ændres.
8. Opdater `README.md` og/eller `ROADMAP.md` hvis brugerflow/status ændres.

Efterlad aldrig `AI.md` eller `ROADMAP.md` med status, der ikke matcher `main`.

## 12. Lokal valideringshistorik

- 2026-08-11: Første V1-brugerprøve på Pop!_OS 24: appen kørte i browseren, og 5/5 oprindelige Vitest-tests bestod.
- Samme prøve fandt `TS2882` for CSS-import og `TS2339` for `import.meta.env`; årsagen var manglende Vite client declarations.
- Fix: `src/vite-env.d.ts` med `/// <reference types="vite/client" />`.
- V2 v0.2.0 er implementeret i repoet og afventer lokal `npm test`, `npm run typecheck`, `npm run build` samt test med virkelige STL-filer.

## 13. Næste prioriterede V2-arbejde

1. Face-winding/orienteringsvalidering for STL før volumen godkendes.
2. Gemte brugerdefinerede materialer med kalibreret densitet.
3. Materialetemplates for voks/resin uden falsk præcision.
4. Gemte figurer/modeller og volumen-kilde.
5. Sammenligning mellem manuel, vægtbaseret og STL-baseret volumen.

## 14. Fremtidig kalibrering

V3 kan bruge batchhistorik til at estimere systematisk over-/underforbrug. Dette må ikke automatisk overskrive grundkalibreringen uden brugerens tydelige handling. Bevar rå værkstedsreference og eventuelle personlige korrektioner som separate begreber.

## 15. Sprog og navngivning

Brugerfladen er dansk. Kode, typer, funktionsnavne og commits kan være engelsk. `Muchwater` er projektnavnet/reponavnet.

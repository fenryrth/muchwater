# AI.md — Muchwater handover

Denne fil er skrevet til en ny AI eller udvikler, der skal kunne forstå projektet hurtigt og fortsætte uden at genopfinde centrale beslutninger. **Opdater filen i samme ændring/commit, når domæneregler, arkitektur, roadmap, kalibrering, centrale workflows eller andre oplysninger her bliver forældede.**

## 1. Projektets formål

Muchwater er et professionelt, digitalt støbeværktøj til et skulpturatelier. Første funktion er at beregne gips og vand til en cylindrisk cuvette. Senere versioner skal også kunne udlede figurvolumen fra STL og fra vægt + materialedensitet (især voks og resin), samt føre batchhistorik.

Brugeren er ikke udvikler. Derfor skal installation, fejlmeddelelser og UI være praktiske og selvforklarende. Undgå løsninger der kræver daglig terminal-/kodehåndtering.

## 2. Ufravigelig empirisk kalibrering

Kildedata fra værkstedet:

- referencecuvette: indvendig diameter 100 mm
- referencehøjde: 150 mm
- gips: 1730 g
- vand: 750 g

Referencecuvettens geometriske volumen er:

`π × (5 cm)^2 × 15 cm = 1178.097245... cm³`

Ved tom referencecuvette og 0 % reserve er forventet resultat derfor præcis:

- 1730 g gips
- 750 g vand

Dette er projektets vigtigste regressionstest. Blandingen betragtes som en **empirisk kalibrering**; vi må ikke erstatte den med teoretiske antagelser om gipsdensitet eller summere tørstof-/vandvolumener.

## 3. Formel

For cylindrisk cuvette:

`cuvetteVolume = π × radius² × height`

Alle mål konverteres fra mm til cm før volumen beregnes.

`fillVolume = cuvetteVolume - figureVolume`

`scale = fillVolume / referenceVolume`

`plaster = 1730 × scale × (1 + reservePercent / 100)`

`water = 750 × scale × (1 + reservePercent / 100)`

Blandingsforholdet 1730:750 bevares altid. Reserve lægges på begge komponenter med samme faktor.

## 4. Vigtig modelregel

**Brug ikke figurens bounding-box/ydermål direkte som dens volumen.** Det vil typisk overvurdere en uregelmæssig skulpturs fortrængning kraftigt.

V1 tager derfor faktisk figurvolumen i cm³/ml. Fysisk kan dette fx findes ved vandfortrængning, når materialet tåler metoden.

V2 skal have:

1. STL → volumen, helst client-side.
2. Vægt → volumen via `volume = mass / density`.
3. Materialepresets for voks/resin, men densiteter skal være redigerbare og tydeligt mærket som produkt-/materialeafhængige.

## 5. Arkitektur nu

V1 er bevidst **frontend-only, local-first og offline-first**:

- React + TypeScript
- Vite
- Vitest
- browser `localStorage` til egne cuvetter
- PWA-manifest + simpel service worker
- ingen backend, login eller database endnu

Begrundelse: beregningen behøver ingen server, og værkstedsværktøjet skal være hurtigt, robust og fungere offline. Tilføj ikke backend før et konkret krav (fx synkronisering/backup på tværs af enheder) retfærdiggør kompleksiteten.

## 6. Cuvetter og værkstedsdata

Den eneste indbyggede cuvette er den empirisk kalibrerede reference **Ø100 × 150 mm**.

**Opfind ikke andre standardstørrelser på brugerens vegne.** Andre cuvetter er værkstedsdata og skal oprettes af brugeren med faktiske indvendige mål og gemmes via localStorage. Hvis brugeren senere giver en verificeret fast liste over egne cuvetter, kan de tilføjes som eksplicitte presets.

## 7. Filstruktur

- `src/domain/calculations.ts` — domæneformler og kalibreringskonstanter. Hold denne fil UI-uafhængig.
- `src/domain/calculations.test.ts` — regressionstests for de fysiske/beregningsmæssige regler.
- `src/domain/types.ts` — domænetyper.
- `src/data/cuvettes.ts` — kun verificerede indbyggede cuvettepresets; aktuelt kun referencecuvetten.
- `src/storage/cuvettes.ts` — localStorage-adapter.
- `src/App.tsx` — nuværende v1-workflow/UI.
- `src/styles.css` — visuelt system og responsiv styling.
- `src/vite-env.d.ts` — Vites TypeScript client declarations. Denne fil er nødvendig for typecheck af CSS side-effect imports og `import.meta.env`; slet den ikke uden en tilsvarende typekonfiguration.
- `public/` — PWA-manifest, ikon og service worker.
- `ROADMAP.md` — plan for v1–v3.
- `README.md` — installation og bruger-/udviklerintro.

## 8. UI-principper

Dette er et atelierinstrument, ikke et generisk admin-dashboard.

- store, hurtigt aflæselige gramresultater
- få trin: cuvette → figurvolumen → reserve → resultat
- danske labels
- høj kontrast og stor touch-/klikflade
- responsivt til PC/tablet/telefon
- ingen skjulte beregningsantagelser
- fejl skal forklares i almindeligt dansk

Den nuværende visuelle retning er mørk, varm og materialebåret (kul/sort, gips/off-white, messing/oker, afdæmpet vandtone). Bevar retningen medmindre brugeren ønsker en anden identitet.

## 9. Data og migration

Custom cuvettes ligger under localStorage-nøglen:

`muchwater.customCuvettes.v1`

Hvis datastrukturen ændres, bump versionssuffixet eller implementer eksplicit migration. Undgå at ændre eksisterende lagrede data tavst.

## 10. Definition of done for ændringer

Når beregningslogikken ændres:

1. Opdater/tilføj unit tests.
2. Verificer referenceinvarianten 1730/750.
3. Kør `npm test`.
4. Kør `npm run typecheck`.
5. Kør `npm run build`.
6. Opdater `AI.md` i samme ændring, hvis beslutningen påvirker overdragelse/arkitektur/domæne.
7. Opdater `README.md` eller `ROADMAP.md` i samme ændring, hvis brugerflow/roadmap ændres.

Ved ændringer uden for beregningslogikken gælder samme dokumentationsprincip: efterlad ikke `AI.md` eller `ROADMAP.md` med oplysninger, der ikke længere matcher `main`.

### Lokal valideringshistorik

- 2026-08-11: Første brugerprøve på Pop!_OS 24 viste, at appen kørte korrekt i browseren, og alle 5 Vitest-tests bestod.
- Samme prøve fandt TypeScript-fejl `TS2882` for `./styles.css` og `TS2339` for `import.meta.env`, fordi Vites client declarations manglede.
- Fix: `src/vite-env.d.ts` med `/// <reference types="vite/client" />` blev tilføjet. Næste lokale validering skal bekræfte `npm run typecheck` og `npm run build` efter `git pull`.

## 11. V2-designnoter

STL:

- Foretræk client-side parsing for privatliv/offlinebrug.
- Beregn meshvolumen via signed tetrahedron volume for trianguleret, lukket mesh.
- Detectér/advar om ikke-watertight eller åben mesh; et numerisk resultat uden kvalitetsadvarsel er farligt.
- Vis både beregnet volumen og mesh-dimensioner, men brug kun volumen til materialeberegningen.

Vægt/materiale:

- `volumeCm3 = massGrams / densityGPerCm3`
- densitet skal være redigerbar pr. materiale/preset
- gem evt. brugerens kalibrerede densitet lokalt
- undgå at præsentere generiske voks-/resinværdier som præcise fabriksdata

## 12. Fremtidig kalibrering

V3 kan bruge batchhistorik til at estimere systematisk over-/underforbrug. Dette må ikke automatisk overskrive grundkalibreringen uden brugerens tydelige handling. Bevar rå værkstedsreference og eventuelle personlige korrektioner som separate begreber.

## 13. Sprog og navngivning

Brugerfladen er dansk. Kode, typer, funktionsnavne og commits kan være engelsk. `Muchwater` er projektnavnet/reponavnet.

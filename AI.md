# AI.md — Muchwater handover

Denne fil er projektets primære tekniske overdragelse til en ny AI-agent eller udvikler. **Læs denne fil og `ROADMAP.md` før du ændrer projektet.**

## 1. Projektets formål

Muchwater er et professionelt, digitalt støbeværktøj til et skulpturatelier. Første funktion er at beregne gips og vand til en cylindrisk cuvette. Senere versioner skal også kunne udlede figurvolumen fra STL og fra vægt + materialedensitet, samt føre batchhistorik.

Brugeren er ikke udvikler. Installation, fejlmeddelelser og UI skal derfor være praktiske og selvforklarende. Undgå løsninger der kræver daglig terminal-/kodehåndtering.

Repo: `fenryrth/muchwater`

## 2. Ufravigelig empirisk kalibrering

Kildedata fra værkstedet:

- referencecuvette: indvendig diameter `100 mm`
- referencehøjde: `150 mm`
- gips: `1730 g`
- vand: `750 g`

Referencecuvettens geometriske volumen er:

`π × (5 cm)^2 × 15 cm = 1178.097245... cm³`

Ved tom referencecuvette og 0 % reserve er forventet resultat derfor præcis:

- `1730 g` gips
- `750 g` vand

Dette er projektets vigtigste regressionstest. Blandingen betragtes som en **empirisk kalibrering**; erstat den ikke med teoretiske antagelser om gipsdensitet, og summer ikke tørstof-/vandvolumener.

## 3. Formel

For cylindrisk cuvette:

`cuvetteVolume = π × radius² × height`

Alle mål konverteres fra mm til cm før volumen beregnes.

`fillVolume = cuvetteVolume - figureVolume`

`scale = fillVolume / referenceVolume`

`plaster = 1730 × scale × (1 + reservePercent / 100)`

`water = 750 × scale × (1 + reservePercent / 100)`

Blandingsforholdet 1730:750 bevares altid. Reserve lægges på begge komponenter med samme faktor.

### Beregningsinvariant

Følgende skal altid være sandt, medmindre ejeren eksplicit leverer en ny fysisk kalibrering:

```text
Ø100 × 150 mm
figur = 0 cm³
reserve = 0 %
=> 1730 g gips
=> 750 g vand
```

## 4. Figurvolumen i V1

V1 understøtter fire inputmetoder:

1. **Kendt volumen** i cm³/ml — anbefalet og mest præcis.
2. **Ellipsoide** — længde × bredde × højde, beregnet som massiv ellipsoide.
3. **Cylinder** — diameter × højde, beregnet som massiv cylinder.
4. **Kasse/blok** — længde × bredde × højde, beregnet som massiv blok.

De tre målbaserede metoder er **estimater**. De må aldrig præsenteres som den faktiske volumen af en organisk skulptur.

Vigtig modelregel: **Brug ikke en vilkårlig bounding box som om den var præcis figurvolumen.** En uregelmæssig skulptur vil typisk have væsentligt mindre volumen end sin bounding box.

Fysisk volumen kan fx findes ved vandfortrængning, når materialet tåler metoden.

Geometriske helpers ligger i `src/domain/calculations.ts` og skal forblive UI-uafhængige.

## 5. Arkitektur nu

V1 er bevidst **frontend-only, local-first og offline-first**:

- React + TypeScript
- Vite
- Vitest
- browser `localStorage` til egne cuvetter
- PWA-manifest + simpel service worker
- ingen backend, login eller database endnu

Begrundelse: beregningen behøver ingen server, og værkstedsværktøjet skal være hurtigt, robust og fungere offline. Tilføj ikke backend før et konkret krav, fx synkronisering/backup mellem enheder, retfærdiggør kompleksiteten.

## 6. Filstruktur

- `src/domain/calculations.ts` — domæneformler, kalibreringskonstanter og geometriske volumenhelpers. Hold filen UI-uafhængig.
- `src/domain/calculations.test.ts` — regressionstests for de fysiske/beregningsmæssige regler.
- `src/domain/types.ts` — domænetyper.
- `src/data/cuvettes.ts` — indbyggede cuvettepresets.
- `src/storage/cuvettes.ts` — localStorage-adapter.
- `src/App.tsx` — nuværende V1-workflow/UI, inkl. figurmetoder.
- `src/styles.css` — visuelt system og responsiv styling.
- `public/` — PWA-manifest, ikon og service worker.
- `ROADMAP.md` — produktstatus og plan for V1–V3.
- `README.md` — installation, test og bruger-/udviklerintro.

## 7. Inputvalidering

- cuvettedimensioner skal være > 0
- figurvolumen må være 0, men ikke negativ
- målbaserede figurmetoder kræver alle relevante dimensioner > 0
- figurvolumen skal være mindre end cuvettevolumen
- reserve skal være mellem 0 og 100 %

Ugyldige værdier må ikke tavst ændres til en anden fysisk værdi i domænelogikken. Vis i stedet en forståelig fejl.

## 8. UI-principper

Dette er et atelierinstrument, ikke et generisk admin-dashboard.

- store, hurtigt aflæselige gramresultater
- få trin: cuvette → figurvolumen → reserve → resultat
- danske labels
- høj kontrast og stor touch-/klikflade
- responsivt til PC/tablet/telefon
- ingen skjulte beregningsantagelser
- fejl skal forklares i almindeligt dansk
- målbaserede estimater skal være visuelt og sprogligt markeret som estimater

Den nuværende visuelle retning er mørk, varm og materialebåret (kul/sort, gips/off-white, messing/oker, afdæmpet vandtone). Bevar retningen medmindre brugeren ønsker en anden identitet.

## 9. Data og migration

Custom cuvettes ligger under localStorage-nøglen:

`muchwater.customCuvettes.v1`

Hvis datastrukturen ændres, bump versionssuffixet eller implementer eksplicit migration. Ændr ikke eksisterende lagrede data tavst.

## 10. Test og lokal udvikling

På Pop!_OS med Conda:

```bash
conda env create -f environment.yml
conda activate muchwater
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

`environment.yml` leverer Node.js 22.x via conda-forge.

### Definition of done for kodeændringer

Før en ændring afsluttes:

1. Kør relevante tests.
2. Verificer altid referenceinvarianten 1730/750, hvis beregningslogik berøres.
3. Kør `npm test`.
4. Kør `npm run typecheck`.
5. Kør `npm run build`.
6. Kontrollér `AI.md`.
7. Kontrollér `ROADMAP.md`.
8. Opdater dokumenterne i samme ændring/commit, hvis nedenstående regler udløses.

## 11. Obligatorisk vedligeholdelse af AI.md og ROADMAP.md

Denne regel gælder for alle fremtidige AI-agenter.

### Opdater `AI.md`, når mindst ét af disse ændres

- arkitektur eller teknologistack
- beregningsformel eller kalibrering
- inputvalidering eller centrale domæneregler
- data/persistens eller migrationsstrategi
- centrale filer og deres ansvar
- test-/startkommandoer
- kendte begrænsninger eller produktinvarianter

### Opdater `ROADMAP.md`, når mindst ét af disse ændres

- en funktion starter, afsluttes, udsættes eller fjernes
- scope flyttes mellem versioner
- ny planlagt funktion accepteres
- versionsstatus ændres

En feature markeres kun `[x]`, når den er reelt brugbar og integreret. Stub-kode tæller ikke som implementering.

## 12. V2-designnoter

### STL

- Foretræk client-side parsing for privatliv/offlinebrug.
- Beregn meshvolumen via signed tetrahedron volume for trianguleret, lukket mesh.
- Detectér/advar om ikke-watertight eller åben mesh; et numerisk resultat uden kvalitetsadvarsel er farligt.
- Vis både beregnet volumen og mesh-dimensioner, men brug kun volumen til materialeberegningen.

### Vægt/materiale

- `volumeCm3 = massGrams / densityGPerCm3`
- densitet skal være redigerbar pr. materiale/preset
- gem evt. brugerens kalibrerede densitet lokalt
- undgå at præsentere generiske voks-/resinværdier som præcise fabriksdata

## 13. Fremtidig kalibrering

V3 kan bruge batchhistorik til at estimere systematisk over-/underforbrug. Dette må ikke automatisk overskrive grundkalibreringen uden brugerens tydelige handling. Bevar rå værkstedsreference og eventuelle personlige korrektioner som separate begreber.

## 14. Arbejdsrækkefølge for næste AI

1. Læs `AI.md`.
2. Læs `ROADMAP.md`.
3. Kør tests før ændringer, hvis miljøet er tilgængeligt.
4. Implementer den mindste sammenhængende feature.
5. Tilføj/ret tests for domænelogik.
6. Kør test, typecheck og build.
7. Opdater `AI.md`/`ROADMAP.md` efter reglerne ovenfor.
8. Beskriv ændringen tydeligt i commit/PR.

## 15. Sprog og navngivning

Brugerfladen er dansk. Kode, typer, funktionsnavne og commits kan være engelsk. `Muchwater` er projektnavnet/reponavnet.

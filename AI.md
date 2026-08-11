# AI.md — Muchwater handover

Denne fil er skrevet til en ny AI eller udvikler, der skal kunne forstå projektet hurtigt og fortsætte uden at genopfinde centrale beslutninger. **Læs denne fil og `ROADMAP.md` før du ændrer projektet. Opdater filen i samme ændring/commit, når domæneregler, arkitektur, roadmap, kalibrering, centrale workflows eller andre oplysninger her bliver forældede.**

## 1. Projektets formål

Muchwater er et professionelt, digitalt støbeværktøj til et skulpturatelier. Første funktion er at beregne gips og vand til en cylindrisk cuvette. Senere versioner skal også kunne udlede figurvolumen fra STL og fra vægt + materialedensitet (især voks og resin), samt føre batchhistorik.

Brugeren er ikke udvikler. Derfor skal installation, fejlmeddelelser og UI være praktiske og selvforklarende. Undgå løsninger der kræver daglig terminal-/kodehåndtering.

Repo: `fenryrth/muchwater`

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

### Beregningsinvariant

Følgende skal altid være sandt, medmindre ejeren eksplicit leverer en ny fysisk kalibrering:

```text
Ø100 × 150 mm
figur = 0 cm³
reserve = 0 %
=> 1730 g gips
=> 750 g vand
```

## 3. Formel

For cylindrisk cuvette:

`cuvetteVolume = π × radius² × height`

Alle mål konverteres fra mm til cm før volumen beregnes.

`fillVolume = cuvetteVolume - figureVolume`

`scale = fillVolume / referenceVolume`

`plaster = 1730 × scale × (1 + reservePercent / 100)`

`water = 750 × scale × (1 + reservePercent / 100)`

Blandingsforholdet 1730:750 bevares altid. Reserve lægges på begge komponenter med samme faktor.

## 4. Figurvolumen i V1

V1 understøtter fire inputmetoder:

1. **Kendt/faktisk volumen** i cm³/ml — anbefalet og mest præcis.
2. **Ellipsoide** — længde × bredde × højde, beregnet som massiv ellipsoide.
3. **Cylinder** — diameter × højde, beregnet som massiv cylinder.
4. **Kasse/blok** — længde × bredde × højde, beregnet som massiv blok.

De tre målbaserede metoder er **estimater**. De må aldrig præsenteres som den faktiske volumen af en organisk skulptur.

Vigtig modelregel: **Brug ikke figurens bounding-box/ydermål som om de var præcis figurvolumen.** Det vil typisk overvurdere en uregelmæssig skulpturs fortrængning kraftigt. Fysisk volumen kan fx findes ved vandfortrængning, når materialet tåler metoden.

Geometriske helpers ligger i `src/domain/calculations.ts` og skal forblive UI-uafhængige.

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

- `src/domain/calculations.ts` — domæneformler, kalibreringskonstanter og geometriske volumenhelpers. Hold denne fil UI-uafhængig.
- `src/domain/calculations.test.ts` — regressionstests for de fysiske/beregningsmæssige regler og figurgeometri.
- `src/domain/types.ts` — domænetyper.
- `src/data/cuvettes.ts` — kun verificerede indbyggede cuvettepresets; aktuelt kun referencecuvetten.
- `src/storage/cuvettes.ts` — localStorage-adapter.
- `src/App.tsx` — nuværende V1-workflow/UI, inkl. figurmetoder.
- `src/styles.css` — visuelt system og responsiv styling.
- `public/` — PWA-manifest, ikon og service worker.
- `ROADMAP.md` — plan for V1–V3 og status på implementeringer.
- `README.md` — installation, test og bruger-/udviklerintro.

## 8. Inputvalidering

- cuvettedimensioner skal være > 0
- figurvolumen må være 0, men ikke negativ
- målbaserede figurmetoder kræver alle relevante dimensioner > 0
- figurvolumen skal være mindre end cuvettevolumen
- reserve skal være mellem 0 og 100 %

Ugyldige værdier må ikke tavst ændres til en anden fysisk værdi i domænelogikken. Vis i stedet en forståelig fejl.

## 9. UI-principper

Dette er et atelierinstrument, ikke et generisk admin-dashboard.

- store, hurtigt aflæselige gramresultater
- få trin: cuvette → figurvolumen → reserve → resultat
- danske labels
- høj kontrast og stor touch-/klikflade
- responsivt til PC/tablet/telefon
- ingen skjulte beregningsantagelser
- fejl skal forklares i almindeligt dansk
- målbaserede figurmetoder skal tydeligt mærkes som estimater

Den nuværende visuelle retning er mørk, varm og materialebåret (kul/sort, gips/off-white, messing/oker, afdæmpet vandtone). Bevar retningen medmindre brugeren ønsker en anden identitet.

## 10. Data og migration

Custom cuvettes ligger under localStorage-nøglen:

`muchwater.customCuvettes.v1`

Hvis datastrukturen ændres, bump versionssuffixet eller implementer eksplicit migration. Undgå at ændre eksisterende lagrede data tavst.

## 11. Definition of done for ændringer

Når beregningslogikken ændres:

1. Opdater/tilføj unit tests.
2. Verificer referenceinvarianten 1730/750.
3. Kør `npm test`.
4. Kør `npm run typecheck`.
5. Kør `npm run build`.
6. Kontrollér `AI.md`.
7. Kontrollér `ROADMAP.md`.
8. Opdater dokumenterne i samme ændring/commit, hvis projektets faktiske tilstand ellers ikke længere matcher dem.

Ved ændringer uden for beregningslogikken gælder samme dokumentationsprincip: efterlad ikke `AI.md` eller `ROADMAP.md` med oplysninger, der ikke længere matcher `main`.

## 12. Obligatorisk vedligeholdelse af AI.md og ROADMAP.md

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
- en ny planlagt funktion accepteres
- versionsstatus ændres

En feature markeres kun `[x]`, når den er reelt brugbar og integreret. Stub-kode tæller ikke som implementering.

## 13. V2-designnoter

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

## 14. Fremtidig kalibrering

V3 kan bruge batchhistorik til at estimere systematisk over-/underforbrug. Dette må ikke automatisk overskrive grundkalibreringen uden brugerens tydelige handling. Bevar rå værkstedsreference og eventuelle personlige korrektioner som separate begreber.

## 15. Arbejdsrækkefølge for næste AI

1. Læs `AI.md`.
2. Læs `ROADMAP.md`.
3. Kør tests før ændringer, hvis miljøet er tilgængeligt.
4. Implementer den mindste sammenhængende feature.
5. Tilføj/ret tests for domænelogik.
6. Kør test, typecheck og build.
7. Opdater `AI.md`/`ROADMAP.md` efter reglerne ovenfor.
8. Beskriv ændringen tydeligt i commit/PR.

## 16. Sprog og navngivning

Brugerfladen er dansk. Kode, typer, funktionsnavne og commits kan være engelsk. `Muchwater` er projektnavnet/reponavnet.

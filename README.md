# Muchwater

**Muchwater** er et digitalt støbeværktøj til atelieret. Appen beregner, hvor meget investment/gips og vand der skal blandes til en cylindrisk cuvette, når figurens faktiske volumen trækkes fra.

Aktuel version: **v0.2.1 — V2 materialer**.

## Grundkalibrering

Projektets empiriske værkstedsreference er:

- Cuvette: Ø100 mm × 150 mm (indvendige mål)
- Investment/gips: 1730 g
- Vand: 750 g
- Geometrisk referencevolumen: ca. 1178,10 cm³

Brugeren har oplyst, at standardproduktet er **Gold Star Powders Metacast**, så denne empiriske reference er nu knyttet til Metacast-preset'et.

Ved 0 cm³ figurvolumen og 0 % reserve skal referencecuvetten altid give:

- **1730 g investment/gips**
- **750 g vand**
- **2480 g total blanding**

Dette er en invariant og dækkes af automatiske tests.

## Version 2 — materialer

STL-funktionen fra det første V2-snit er fjernet. V2 fokuserer nu på et mere praktisk atelier-workflow:

1. vælg cuvette
2. vælg investment/gips og resin
3. angiv figurens volumen direkte eller beregn den fra vægt + resinens densitet
4. vælg reserve
5. aflæs investment og vand

### Gold Star Powders Metacast

Verificeret producentdata fra Gold Star Powders:

- Conventional Mixing — vand:pulver **40:100**
- Vacuum Mixing — vand:pulver **38–40:100**

Officiel produktside:
`https://www.goldstarpowders.com/products/metacast-premium-investment-powder/`

### Hvorfor bruger Muchwater stadig 1730 / 750?

Din empiriske reference 750 g vand til 1730 g Metacast svarer til ca. **43,35:100**, altså lidt mere vand end Gold Stars datablad angiver.

Muchwater ændrer ikke dette automatisk.

Grunden er, at fabrikantens vand/pulver-ratio alene ikke fortæller præcist, hvor mange gram færdig slurry der skal til for at fylde en bestemt cuvette. Den nuværende 1730/750-reference er derimod en fysisk atelierkalibrering, som allerede er knyttet til et kendt volumen.

Hvis du senere vil arbejde konsekvent efter fx 40:100 eller 38:100, bør vi først lave en ny fysisk referencefyldning og gemme den som en separat Metacast-kalibrering.

## Siraya Tech Cast

V2 har presets for:

- **Siraya Tech Cast True Blue / Royal Blue**
- **Siraya Tech Cast Purple**

Siraya Techs officielle TDS angiver **Solid Density = 1,2 g/cm³** for begge.

Officiel TDS:
`https://siraya.tech/pages/cast-castable-resin-tds`

Muchwater bruger 1,2 g/cm³ som startværdi, når volumen beregnes fra vægten af en hærdet resinmodel:

`volumen = vægt / densitet`

Densitetsfeltet kan stadig redigeres, hvis du senere får en bedre værdi for netop din print- og hærdningsproces.

Sirayas separate Cast user guide bruger også et generelt tal på 1,1 g/ml i en beregning af støbemetal fra printvægt. Muchwater vælger TDS'ens eksplicitte **solid density 1,2 g/cm³**, fordi denne funktion beregner volumen fra en fast, hærdet model.

## Version 1-funktioner der fortsat er med

- kalibreret Ø100 × 150 mm referencecuvette
- egne cylindriske cuvetter med faktiske indvendige mål
- lokal lagring af egne cuvetter
- figurvolumen i cm³/ml
- automatisk fratræk af figurens volumen
- reserve på 0, 3, 5, 10 % eller brugerdefineret
- resultat for investment, vand, total blanding og fyldevolumen
- offline-first PWA-grundlag
- responsivt interface til PC, tablet og telefon

## Installation på Pop!_OS 24 med Conda

### Første installation

```bash
git clone https://github.com/fenryrth/muchwater.git
cd muchwater
conda env create -f environment.yml
conda activate muchwater
npm install
```

### Når projektet allerede findes lokalt

```bash
cd ~/Documents/Python/muchwater
conda activate muchwater
git pull
```

Der er ikke tilføjet nye npm-dependencies i v0.2.1, men `npm install` er ufarligt at køre igen, hvis du vil sikre at miljøet er synkroniseret.

## Automatiske kontroller

Kør:

```bash
npm test
npm run typecheck
npm run build
```

Alle tre kommandoer skal afslutte uden fejl.

I v0.2.1 forventes **11 tests fordelt på 3 testfiler**:

- gips-/investmentberegning
- vægt/densitet
- verificerede materialepresets

## Start appen

```bash
npm run dev
```

Vite viser en lokal adresse i terminalen, normalt:

```text
http://localhost:5173
```

Åbn adressen i browseren. Stop serveren igen med `Ctrl+C`.

## Manuel test 1 — referenceblanding

Vælg:

- Cuvette: Ø100 × 150 mm
- Investment: Gold Star Powders · Metacast
- Figurvolumen: `0 cm³`
- Reserve: `0 %`

Forventet resultat:

- **Investment: 1730 g**
- **Vand: 750 g**
- **Total blanding: 2480 g**

## Manuel test 2 — Siraya Tech vægt → volumen

Vælg en af Siraya Tech Cast-varianterne og gå til:

**Figurens volumen → Vægt**

Preset-densiteten skal være:

```text
1,2 g/cm³
```

Test med:

```text
Vægt: 240 g
Densitet: 1,2 g/cm³
```

Den beregnede volumen skal være:

```text
200,00 cm³
```

Tryk **Brug volumen** og kontrollér, at aktivt figurvolumen bliver 200 cm³ og blandingsresultatet ændres.

## Manuel test 3 — materialepanelet

Kontrollér at appen viser:

**Metacast**

- atelierkalibrering: 1730 g / 750 g
- atelier vand:pulver: ca. 43,35:100
- producent konventionel: 40:100
- producent vakuum: 38–40:100

**Siraya Tech Cast**

- solid densitet: 1,2 g/cm³

Kontrollér også at der **ikke længere findes en STL-fane eller STL-upload**.

## Beregningsprincip

1. Cuvettevolumen beregnes som en cylinder: `π × r² × h`.
2. Figurens faktiske volumen kommer fra manuel input eller vægt/densitet.
3. Figurens volumen trækkes fra cuvettevolumen.
4. Det resterende fyldevolumen sammenlignes med den valgte investments empiriske referencevolumen.
5. Kalibrerede gram investment og vand skaleres med samme faktor.
6. Eventuel reserve lægges på til sidst.

## Nye investment-typer

Beregningsmotoren understøtter nu materialespecifikke kalibreringer, men Metacast er foreløbig den eneste investment, der har en verificeret fysisk reference.

En ny investment bør derfor ikke bare få fabrikantens blandingsratio indtastet og derefter bruges til automatisk gram-beregning. Det professionelle workflow bliver i stedet:

1. vælg en referencecuvette
2. bland den ønskede investment
3. registrér de faktiske gram pulver og vand, der fylder referencecuvetten
4. gem dette som materialets empiriske kalibrering

Det er planlagt som næste V2-snit.

## Produktionspreview

Efter `npm run build` kan den byggede version testes med:

```bash
npm run preview
```

## Roadmap

Se [ROADMAP.md](ROADMAP.md). Næste V2-snit fokuserer på egne gemte resinmaterialer, egne investment-kalibreringer og et guidet kalibreringsflow.

## AI-overdragelse

Se [AI.md](AI.md). Filen er projektets tekniske overdragelsesnotat og skal holdes synkron med projektet, når arkitektur, domæneregler, materialedata, roadmap eller centrale beslutninger ændres.

# Muchwater

**Muchwater** er et digitalt støbeværktøj til atelieret. Version 1 beregner, hvor meget gips og vand der skal blandes til en cylindrisk cuvette, når figurens faktiske volumen trækkes fra.

## Kalibrering

Projektets empiriske reference er:

- Cuvette: Ø100 mm × 150 mm (indvendige mål)
- Gips: 1730 g
- Vand: 750 g
- Geometrisk referencevolumen: ca. 1178,10 cm³

Ved 0 cm³ figurvolumen og 0 % reserve skal referencecuvetten derfor altid give **1730 g gips + 750 g vand**. Dette er en invariant og dækkes af automatiske tests.

## Version 1

- kalibreret Ø100 × 150 mm referencecuvette som eneste indbyggede preset
- egne cylindriske cuvetter med faktiske indvendige mål, gemt lokalt i browseren
- figurvolumen i cm³/ml
- automatisk fratræk af figurens volumen
- reserve på 0, 3, 5, 10 % eller brugerdefineret
- resultat for gips, vand, total blanding og fyldevolumen
- offline-first PWA-grundlag
- responsivt interface til PC, tablet og telefon
- unit tests af beregningskernen

> Figurens ydermål bruges bevidst ikke som volumen. For en uregelmæssig skulptur vil en bounding box næsten altid overvurdere det fortrængte volumen. I v1 bør faktisk volumen måles, fx med vandfortrængning når figuren/materialet tåler det.

Andre cuvettestørrelser er ikke gættet ind i programmet. Opret dem i appen med de faktiske indvendige mål; de gemmes automatisk i browseren på den pågældende enhed.

## Installation på Pop!_OS 24 med Conda

### 1. Klon projektet

```bash
git clone https://github.com/fenryrth/muchwater.git
cd muchwater
```

Hvis du allerede har klonet projektet tidligere, så brug i stedet:

```bash
cd muchwater
git pull
```

### 2. Opret Conda-miljøet

```bash
conda env create -f environment.yml
conda activate muchwater
```

Hvis miljøet allerede findes efter en senere opdatering:

```bash
conda env update -f environment.yml --prune
conda activate muchwater
```

### 3. Installer JavaScript-dependencies

```bash
npm install
```

### 4. Kør de automatiske kontroller

```bash
npm test
npm run typecheck
npm run build
```

Alle tre kommandoer skal afslutte uden fejl.

### 5. Start udviklingsversionen

```bash
npm run dev
```

Vite viser en lokal adresse i terminalen, normalt:

```text
http://localhost:5173
```

Åbn adressen i din browser. Stop serveren igen med `Ctrl+C` i terminalen.

## Første manuelle kontrol

Start med referencecuvetten og sæt:

- Figurvolumen: `0 cm³`
- Reserve: `0 %`

Resultatet skal være:

- **Gips: 1730 g**
- **Vand: 750 g**
- **Total blanding: 2480 g**

Test derefter halv fyldevolumen:

- Cuvette: Ø100 × 150 mm
- Figurvolumen: ca. `589,05 cm³`
- Reserve: `0 %`

Resultatet skal være ca.:

- **Gips: 865 g**
- **Vand: 375 g**

Til sidst bør du oprette én af dine virkelige cuvetter med dens indvendige diameter og højde, genindlæse siden og kontrollere at cuvetten stadig findes. Det validerer den lokale lagring.

### Produktionspreview

Efter `npm run build` kan den byggede version testes med:

```bash
npm run preview
```

## Beregningsprincip

1. Cuvettevolumen beregnes som en cylinder: `π × r² × h`.
2. Figurens volumen trækkes fra cuvettevolumen.
3. Det resterende fyldevolumen sammenlignes med referencevolumen Ø100 × 150 mm.
4. Både 1730 g gips og 750 g vand skaleres med samme faktor.
5. En eventuel reserve lægges på til sidst.

Det faste blandingsforhold ændres altså ikke af skaleringen.

## Roadmap

Se [ROADMAP.md](ROADMAP.md). Version 1 er implementeret og afventer første manuelle workshopstest. Version 2 planlægger STL-volumen samt vægt → volumen for voks og resin med redigerbare densiteter. Version 3 udvider mod et egentligt atelier-/batchværktøj.

## AI-overdragelse

Se [AI.md](AI.md). Den fil er projektets tekniske overdragelsesnotat og skal holdes synkron med projektet, når arkitektur, domæneregler, roadmap eller centrale beslutninger ændres.

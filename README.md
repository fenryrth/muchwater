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

- cylindriske cuvetter
- faste presets + egne cuvetter gemt lokalt i browseren
- figurvolumen i cm³/ml
- automatisk fratræk af figurens volumen
- reserve på 0, 3, 5, 10 % eller brugerdefineret
- resultat for gips, vand, total blanding og fyldevolumen
- offline-first PWA
- responsivt interface til PC, tablet og telefon
- testet beregningskerne

> Figurens ydermål bruges bevidst ikke som volumen. For en uregelmæssig skulptur vil en bounding box næsten altid overvurdere det fortrængte volumen. I v1 bør faktisk volumen måles, fx med vandfortrængning.

## Installation på Pop!_OS med Conda

```bash
git clone https://github.com/fenryrth/muchwater.git
cd muchwater
conda env create -f environment.yml
conda activate muchwater
npm install
npm run dev
```

Vite viser den lokale adresse i terminalen, normalt `http://localhost:5173`.

### Test og produktionsbuild

```bash
npm test
npm run typecheck
npm run build
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

Se [ROADMAP.md](ROADMAP.md). Version 2 planlægger STL-volumen samt vægt → volumen for voks og resin med redigerbare densiteter. Version 3 udvider mod et egentligt atelier-/batchværktøj.

## AI-overdragelse

Se [AI.md](AI.md). Den fil er projektets tekniske overdragelsesnotat og skal opdateres, når arkitektur, domæneregler, roadmap eller centrale beslutninger ændres.

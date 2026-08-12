# Muchwater

**Muchwater** er et digitalt støbeværktøj til atelieret.

Aktuel version: **v0.2.2 — producentdata som eneste materialekilde**.

## Grundprincip

Muchwater bruger ikke længere en empirisk 1730/750-kalibrering. Materialeberegninger baseres udelukkende på officielle producentoplysninger.

For **Gold Star Powders Metacast** angiver producenten:

- Conventional Mixing — vand:pulver **40:100**
- Vacuum Mixing — vand:pulver **38–40:100**

Officiel produktside:
`https://www.goldstarpowders.com/products/metacast-premium-investment-powder/`

Officielt datablad:
`https://www.goldstarpowders.com/wp-content/uploads/2024/11/GSP-Metacast-Datasheet.pdf`

Gold Star angiver vand/pulver-forholdet, men ikke en officiel omregning fra cuvettevolumen i cm³ til gram Metacast. Muchwater holder derfor de to beregninger adskilt:

1. cuvette og figur bruges til at beregne det geometriske fyldevolumen
2. brugeren angiver pulvermængden
3. Muchwater beregner vandmængden efter producentens valgte vand/pulver-forhold

Der anvendes ingen skjult densitet, yield-faktor eller atelierkalibrering til at omregne fyldevolumen til pulvergram.

## Siraya Tech Cast

V2 har presets for:

- **Siraya Tech Cast True Blue / Royal Blue**
- **Siraya Tech Cast Purple**

Siraya Techs officielle TDS angiver **Solid Density = 1,2 g/cm³** for begge produkter.

Officiel TDS:
`https://siraya.tech/pages/cast-castable-resin-tds`

Muchwater bruger TDS-værdien direkte ved vægt → volumen:

`volumen = vægt / 1,2`

Densiteten er produktdata og kan ikke redigeres i denne version.

## Workflow

1. Vælg cuvette.
2. Vælg investment og resin.
3. Vælg Metacast-blandemetode.
4. Angiv figurens volumen direkte eller beregn den fra resinfigurens vægt.
5. Aflæs geometrisk fyldevolumen.
6. Angiv ønsket pulvermængde.
7. Muchwater beregner vand og total blanding efter producentens ratio.
8. En valgfri reserve kan lægges på pulvermængden; vandet følger samme producentforhold.

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

## Automatiske kontroller

```bash
npm test
npm run typecheck
npm run build
```

Alle tre kommandoer skal afslutte uden fejl.

v0.2.2 forventer **12 tests i 3 testfiler**:

- geometri og producentens vand/pulver-beregning
- resin vægt/densitet
- verificerede materialepresets

## Start appen

```bash
npm run dev
```

Vite viser normalt:

```text
http://localhost:5173
```

## Manuel test 1 — Metacast konventionel

Vælg:

- Investment: Gold Star Powders · Metacast
- Blandemetode: Konventionel
- Pulvermængde: `1000 g`
- Reserve: `0 %`

Forventet resultat:

- **Pulver: 1000 g**
- **Vand: 400 g**
- **Total: 1400 g**
- **Vand:pulver: 40:100**

## Manuel test 2 — Metacast vakuum

Vælg vakuumblanding og sæt producentforholdet til `38`.

Med `1000 g` pulver og `0 %` reserve forventes:

- **Pulver: 1000 g**
- **Vand: 380 g**
- **Total: 1380 g**

Vakuumfeltet er begrænset til producentens interval **38–40 g vand pr. 100 g pulver**.

## Manuel test 3 — Siraya Tech vægt → volumen

Vælg en Siraya Tech Cast-variant og gå til **Figurens volumen → Vægt**.

Test:

```text
Vægt: 240 g
TDS solid densitet: 1,2 g/cm³
```

Forventet volumen:

```text
200,00 cm³
```

## Manuel test 4 — geometri

Med en tom Ø100 × 150 mm cuvette skal det geometriske volumen være ca. **1,178 L**.

Med en figur på `200 cm³` skal fyldevolumen være ca. **0,978 L**.

Dette er ren geometriberegning og påvirker ikke producentens vand/pulver-ratio.

## Beregningsprincip

### Geometri

`cuvetteVolume = π × radius² × height`

`fillVolume = cuvetteVolume - figureVolume`

### Metacast

`water = powder × waterPer100Powder / 100`

Ved reserve:

`powderWithReserve = powder × (1 + reservePercent / 100)`

`water = powderWithReserve × waterPer100Powder / 100`

### Siraya Tech Cast

`figureVolumeCm3 = massGrams / 1.2`

## Produktionspreview

```bash
npm run preview
```

## Roadmap

Se [ROADMAP.md](ROADMAP.md).

## AI-overdragelse

Se [AI.md](AI.md). Filen er projektets tekniske overdragelsesnotat og skal holdes synkron med kode, produktdata og roadmap.

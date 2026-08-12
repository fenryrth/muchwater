# Muchwater Roadmap

## V1 · Grundværktøj

Status: **implementeret og manuelt prøvet på Pop!_OS 24.**

- [x] Cylindrisk cuvettegeometri
- [x] Egne cuvetter med indvendige mål
- [x] Figurvolumen i cm³/ml
- [x] Lokal lagring af cuvetter
- [x] Responsivt værkstedsinterface
- [x] PWA/offline-grundlag
- [x] Unit tests

## V2 · Materialer og producentdata

Status: **v0.2.2 implementeret; afventer lokal test på Pop!_OS.**

### Retningsændringer

- [x] STL-funktionen fjernet
- [x] Empirisk 1730/750-kalibrering fjernet helt
- [x] Materialedata skal udelukkende komme fra officielle producentkilder
- [x] Geometrisk fyldevolumen og materialemasse er separate beregninger

### Implementeret i v0.2.2

- [x] Gold Star Powders Metacast som investment-preset
- [x] Metacast Conventional Mixing: 40:100 vand:pulver
- [x] Metacast Vacuum Mixing: 38–40:100 vand:pulver
- [x] Valg mellem konventionel og vakuumblanding
- [x] Vakuum-ratio begrænset til producentens 38–40 interval
- [x] Pulvermængde → vand ud fra producentforhold
- [x] Reserve bevarer samme producentforhold
- [x] Siraya Tech Cast True Blue / Royal Blue
- [x] Siraya Tech Cast Purple
- [x] Siraya Tech Cast TDS solid density 1.2 g/cm³
- [x] Vægt → figurvolumen med officiel TDS-densitet
- [x] Densiteten er ikke længere brugerredigerbar
- [x] Officielle kilde-URL'er gemt i materialedata
- [x] Unit tests for producentdata og ratioformler
- [x] PWA-cacheversion opdateret

### Beregningsgrænse

Gold Stars officielle Metacast-materiale angiver vand/pulver-forhold, men projektet har ingen officiel producentværdi for omregning fra cuvette-/slurryvolumen til gram pulver.

Muchwater gør derfor følgende:

- cuvette + figur → geometrisk fyldevolumen
- pulvermængde + producentratio → vand og total blanding

Der må ikke tilføjes en skjult eller empirisk volume-to-mass-faktor.

### Næste V2-snit

- [ ] Lokal Pop!_OS-validering: `npm test`, `npm run typecheck`, `npm run build`
- [ ] Browsertest af konventionel 40:100 og vakuum 38–40:100
- [ ] Persistér senest valgte materialer og blandemetode
- [ ] Tilføj flere investments fra officielle producentdata
- [ ] Tilføj flere castable resins fra officielle TDS-data
- [ ] Gemte figurer/modeller med vægt og volumen
- [ ] Producentens mixing/burnout-proces som valgfrit referencepanel
- [ ] Kobl kun fyldevolumen til gram, hvis producenten offentliggør en officiel yield/density/metode til dette

## V3 · Atelier og batch

- [ ] Batchhistorik
- [ ] Projektnavn/figur/cuvette/materialer på hver blanding
- [ ] Noter om faktisk forbrug og resultat
- [ ] Gem seneste arbejdsgange
- [ ] Eksport/print af batchrapport
- [ ] Backup/import af lokale data
- [ ] Mulig synkronisering mellem enheder, hvis workflowet kræver det

## Ikke besluttet endnu

- Backend/synkronisering mellem enheder
- Login/cloud storage
- Andre cuvettegeometrier end cylinder
- Burnout-planlægning som aktiv workflow-funktion

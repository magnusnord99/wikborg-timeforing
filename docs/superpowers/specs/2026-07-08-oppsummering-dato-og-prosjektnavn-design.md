# Design: Datonavigering i Oppsummering + rediger prosjektnavn

## Bakgrunn

Bruker (Øystein) ga følgende tilbakemelding via feedback-knappen i appen:

1. «Hadde vært dope å kunne bla i datoer inne på denne siden» — referer til Oppsummering-fanen, som i dag kun viser inneværende dag uten mulighet til å bla.
2. «Og kanskje at jeg kan redigere prosjekt-navn. Altså at jeg ikke må lage en ny hvis jeg vil det.» — prosjektnavn kan i dag kun settes ved opprettelse, ikke endres i ettertid.

To små, uavhengige UI-forbedringer i eksisterende paneler. Ingen nye tabeller eller migrasjoner nødvendig.

## 1. Datonavigering i Oppsummering-fanen

**Delt dato med Timer-fanen.** Appen har allerede en global `selectedDate`-state i `useTimeTrackerData` som `LogPanel` (Timer-fanen) bruker til dagsvisning, med kontroller for «Forrige dag» / «I dag» / «Neste dag» og en datovelger (`src/components/time-tracker/LogPanel.tsx:79-113`). `SummaryPanel` mottar allerede `entries` som er hentet for `selectedDate` (via `fetchEntries()` i `useTimeTrackerData.ts:77-93`), men eksponerer ingen UI for å endre datoen selv.

**Endring:** Legg de samme dato-kontrollene (gjenbrukt/faktorert ut) til i `SummaryPanel`, koblet til samme `selectedDate` / `setSelectedDate`. Blar man en dag frem i Oppsummering, følger Timer-fanen med — og omvendt. Dette er bevisst valgt fremfor uavhengig dato per fane, for enkelhet og konsistens med hvordan `TrackerHeader` allerede viser valgt dato globalt.

**Berørte filer:**
- `src/components/time-tracker/SummaryPanel.tsx` — motta `selectedDate`, `isToday`, `onDateChange`; render dato-kontrollene (samme layout/stiler som `LogPanel` sin `dateControls`/`dateToolbar`).
- `src/components/TimeTracker.tsx` — send `selectedDate`, `isToday`, `onDateChange={tracker.setSelectedDate}` til `SummaryPanel` (samme props som allerede sendes til `LogPanel`).
- `src/components/DailySummary.tsx` — bytt hardkodet «i dag»-tekst («Totalt i dag», «Ingen fullførte timer i dag ennå») til å reflektere valgt dato. Enkleste løsning: motta en `isToday: boolean`-prop og vise «i dag» når true, «denne dagen» når false. (Ingen behov for å formatere hele datoen i teksten — det er allerede synlig i dato-kontrollene over.)

**Ingen endring i datahenting** — `fetchEntries()` er allerede datostyrt, så ingen ny Supabase-spørring trengs.

## 2. Redigere prosjektnavn

**Inline redigering i prosjektlisten**, samme mønster som slette-bekreftelsen som allerede finnes i `ProjectCard` (`confirmDelete`-state med Bekreft/Avbryt).

**Endring:**
- `src/components/projects-list/ProjectCard.tsx` — legg til en blyant-knapp («Rediger») ved siden av prosjektnavnet. Klikk bytter visningen til et tekstfelt forhåndsutfylt med gjeldende navn, pluss Lagre/Avbryt-knapper (samme visuelle stil som confirm/avbryt for sletting).
- `src/components/ProjectsList.tsx` — hold `editingProjectId: string | null`-state (parallelt med eksisterende `confirmDelete`-state). Sender `isEditing`, `onRequestEdit`, `onCancelEdit`, `onSave(name)` ned til `ProjectCard`. Tomt/uendret navn lagres ikke (samme validering som ved opprettelse — `name.trim()`).
- `src/components/time-tracker/useTimeTrackerData.ts` — ny funksjon `renameProject(id, name)` som kaller `updateProjectRecord`, oppdaterer lokal `projects`-state optimistisk (samme mønster som `addProject`/`removeProject`), og viser feilmelding via `setNotice` ved feil.
- `src/components/time-tracker/trackerApi.ts` — ny `updateProjectRecord(id, name)`: `supabase.from('projects').update({ name }).eq('id', id).select().single()`.
- `src/components/time-tracker/ProjectsPanel.tsx` og `TimeTracker.tsx` — send `onRenameProject` gjennom samme vei som `onRemoveProject` i dag.

**Ingen databaseendring** — `name`-kolonnen på `projects`-tabellen finnes allerede og har ingen unikhets-constraint som ville kreve spesialhåndtering.

## Testing

- Manuelt: bla frem/tilbake i dato i Oppsummering, bekreft at Timer-fanen viser samme dato og riktige tall for historiske dager.
- Manuelt: rediger et prosjektnavn, bekreft at det oppdateres i lista, i aktiv timer-visning (hvis prosjektet er i bruk) og etter reload (persistert i Supabase).
- Manuelt: avbryt redigering uten å lagre — navnet skal forbli uendret.

## Scope-avgrensning

Ikke inkludert (ikke bedt om): uavhengig dato per fane, bulk-redigering av prosjekter, navnevalidering utover trim/tomt-sjekk, endring av week/month-visningene (de har allerede egen navigasjon).

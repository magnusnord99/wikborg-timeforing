# Design: Oppussing Prosjektstyring

**Dato:** 2026-06-09  
**Stack:** Next.js + Supabase + Vercel  
**Status:** Godkjent av bruker

---

## Oversikt

Webapplikasjon for å administrere boligoppussingsprosjekter. Systemet erstatter et Excel-ark og gir en gruppe kompiser verktøy for prosjektstyring, økonomi, tidsføring og kommunikasjon. Appen skal senere også finnes som mobilapp (React Native / Expo mot samme Supabase-backend).

Gruppen kjøper, pusser opp og selger boliger. Fortjeneste fordeles etter en fast formel. Flere prosjekter kan være aktive samtidig, og de samme personene deltar på alle prosjekter.

---

## Kjernedata

### Bruker
- Navn, e-post, auth via Supabase Auth
- Kan markere tilgjengelighetsperioder (utilgjengelig fra/til med valgfri årsak)

### Prosjekt
- Navn, adresse, status: `planlagt | aktivt | solgt`
- Kjøpspris, estimert salgspris, budsjett
- Liste over deltakere (alle brukere er med som standard)

### Utgifter
- Beløp, kategori, beskrivelse, dato
- Lagt inn av hvem, knyttet til prosjekt
- Valgfritt: kvitteringsbilde (Supabase Storage)

### Investeringer (innbetalinger)
- Beløp, dato, hvem betalte inn, hvilket prosjekt
- Brukes i fortjeneste-beregningen (10%-andelen)

### Tidsregistrering
- Timer, dato, beskrivelse, hvem, hvilket prosjekt
- Brukes i fortjeneste-beregningen (10%-andelen)

### Fortjeneste-kalkulator (automatisk)
Beregnes live basert på:
- **80%** deles likt på antall deltakere
- **10%** fordeles proporsjonalt etter investert beløp
- **10%** fordeles proporsjonalt etter antall timer

### Oppgave
- Tittel, beskrivelse, status: `ikke startet | pågår | ferdig`
- Ansvarlig person, prioritet, estimert tid, frist
- Kategori (f.eks. elektro, rør, maling, snekker)
- Kommentarer/samtale-tråd (alle deltakere kan kommentere)

### Hendelse (kalender-event)
- Tittel, dato/tid, beskrivelse
- Hvem må være tilstede (valgfritt)
- Eksempel: "Støper kommer", "Elektriker befaring"

### Melding
- Hovedtråd per prosjekt for generell kommunikasjon
- Enkel chat — ikke knyttet til oppgaver

### Dokument
- Filnavn, opplastet av, dato, kategori
- Lagret i Supabase Storage
- Eksempel: ordrebekreftelser, tegninger, kontrakter

### Handleliste
- Enkle sjekkliste-items per prosjekt
- Navn, antall, eventuelt hvem som kjøper

---

## Appstruktur og navigasjon

### Forside
Oversikt over alle prosjekter. Hvert prosjekt vises som et kort med:
- Status, adresse
- Budsjett-status (brukt vs. budsjettert)
- Fremdrift (% oppgaver ferdig)
- Neste hendelse i kalenderen

### Prosjektside (faner)

| Fane | Innhold |
|---|---|
| **Oversikt** | Dashbord: nøkkeltall, fremdrift, siste aktivitet, hvem er tilgjengelig |
| **Oppgaver** | Liste og kanban-visning, filtrerbar per person/status/kategori |
| **Kalender** | Måneds/ukevisning med oppgaver, hendelser og tilgjengelighet. Kan opprette oppgaver og hendelser direkte |
| **Økonomi** | Utgifter, investeringer per person, fortjeneste-kalkulator |
| **Tidsføring** | Logg timer, oversikt per person, totaler |
| **Handleliste** | Sjekkliste for materialer og innkjøp |
| **Dokumenter** | Filopplasting og oversikt, enkel mappestruktur |
| **Meldinger** | Én hovedtråd per prosjekt for teamkommunikasjon |

### Global navigasjon
- Alle prosjekter
- Min profil (tilgjengelighet, innstillinger)
- Notifikasjoner

---

## Teknisk arkitektur

### Stack
- **Frontend:** Next.js (App Router), React, TypeScript
- **Backend/DB:** Supabase (Postgres, Auth, Storage, Realtime)
- **Deploy:** Vercel
- **Styling:** Tailwind CSS + shadcn/ui

### Database (skjema-oversikt)
```
users (via Supabase Auth)
user_profiles (navn, tilgjengelighetsdata)
projects (navn, adresse, status, priser)
project_members (prosjekt ↔ bruker)
expenses (utgifter per prosjekt)
investments (innbetalinger per bruker per prosjekt)
time_entries (tidsregistreringer)
tasks (oppgaver)
task_comments (kommentarer på oppgaver)
events (kalender-hendelser)
messages (meldingstråd per prosjekt)
documents (metadata, fil i Supabase Storage)
shopping_items (handleliste)
availability (tilgjengelighetsperioder per bruker)
```

### Realtime
Meldinger og oppgave-oppdateringer bruker Supabase Realtime for live-oppdateringer uten sideoppdatering.

### Sikkerhet
- Row Level Security (RLS) på alle tabeller
- Brukere ser kun data for prosjekter de er deltakere i

---

## Mobilapp (fremtidig)
Når webappen er ferdig og stabil, lages mobilapp med React Native (Expo). Bruker samme Supabase-backend. Ingen endringer i backend kreves.

---

## Avgrensninger (utenfor scope nå)
- Ingen integrasjon mot Vipps eller bank
- Ingen automatisk regnskapseksport
- Ingen ekstern deling av prosjektdata (kun interne brukere)

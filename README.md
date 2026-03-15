# Wikborg Tidsføring

Enkel webaplikasjon for å føre timer på ulike prosjekter. Bruker Supabase for autentisering og database.

## Funksjoner

- **Innlogging** – E-post og passord via Supabase Auth
- **Prosjekter** – Legg til og fjern prosjekter
- **Tidslogging** – Start/Stopp med automatisk klokkeslett
- **Redigering** – Endre prosjekt, start- og sluttid på registreringer
- **Daglig oppsummering** – Oversikt over timer per prosjekt

## Oppsett

### 1. Supabase-prosjekt

1. Gå til [supabase.com](https://supabase.com) og opprett et prosjekt
2. Gå til **Project Settings → API** og kopier:
   - Project URL
   - anon public key

### 2. Database (migreringer)

Kjør migreringer fra prosjektmappen:

```bash
# Første gang: Logg inn og koble til prosjektet
npx supabase login
npm run db:link   # Velg prosjekt og skriv inn database-passord

# Push migreringer til Supabase
npm run db:push
```

Alternativt kan du kjøre SQL-en manuelt i **SQL Editor** i Supabase Dashboard.

### 3. Lokal utvikling

```bash
# Kopier env-fil
cp .env.example .env

# Fyll inn VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY i .env

# Installer avhengigheter
npm install

# Start utviklingsserver
npm run dev
```

### 4. E-postbekreftelse (valgfritt)

For produksjon bør du aktivere e-postbekreftelse i Supabase:
**Authentication → Providers → Email** – konfigurer etter behov.

## Sikkerhet

- Row Level Security (RLS) er aktivert på alle tabeller
- Brukere ser kun egne prosjekter og tidsregistreringer
- `user_id` settes automatisk ved innlogging

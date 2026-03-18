# Sikkerhet – Wikborg Tidsføring

## Gjennomført sikkerhetsgjennomgang

### ✅ Database (Supabase)

- **Row Level Security (RLS)** er aktivert på alle tabeller
- **Policies** sikrer at brukere kun kan lese/skrive egne data:
  - `auth.uid() = user_id` på alle operasjoner
  - `WITH CHECK` på UPDATE hindrer endring av `user_id` (privilege escalation)
- **Ingen service_role key** i frontend – kun anon key (RLS beskytter data)
- **Parameteriserte spørringer** – Supabase-klienten bruker dette, ingen SQL-injection

### ✅ Autentisering

- **Supabase Auth** – e-post/passord med JWT
- **Session** – håndteres av Supabase, tokens lagres sikkert
- **user_id** settes fra `auth.getUser()` – ikke fra brukerinput

### ✅ Frontend

- **React** – automatisk escaping mot XSS
- **Ingen hemmeligheter** – kun `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY` (anon key er beregnet på å være offentlig)

### ✅ Infrastruktur

- **Vercel** – HTTPS som standard
- **Security headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` – begrenser kamera/mikrofon/geolokasjon

### ✅ Konfigurasjon

- **.env** er i `.gitignore` – hemmeligheter committes ikke
- **Vercel** – miljøvariabler settes i dashboard, ikke i kode

---

## Anbefalinger for produksjon

### 1. Kjør den nye migreringen

```bash
npm run db:push
```

Dette legger til `WITH CHECK` på UPDATE-policies.

### 2. Supabase Auth – stram inn

I **Supabase Dashboard → Authentication → Providers → Email**:

- **Enable email confirmations** – krever at brukere bekrefter e-post
- **Minimum password length** – anbefalt 8+ tegn (Project Settings → Auth)

### 3. Supabase – begrens tilgjengelige URL-er

I **Authentication → URL Configuration**:

- **Site URL** – kun din produksjons-URL
- **Redirect URLs** – kun dine domener (fjern localhost i produksjon hvis ønskelig)

### 4. Overvåk bruk

- **Supabase Dashboard** – sjekk "Logs" for uvanlig aktivitet
- **Vercel** – sjekk deploy-logs og funksjonskjøring

### 5. Sterke passord

Vurder å informere brukere om å bruke sterke passord (store/små bokstaver, tall, tegn).

---

## Hva som beskytter sensitive data

1. **RLS** – selv med riktig API-kall kan ingen hente andres prosjekter eller timer
2. **JWT** – Supabase sender bruker-ID i token; backend stoler på dette
3. **HTTPS** – all trafikk er kryptert
4. **Ingen service_role** – ingen måte å omgå RLS fra frontend

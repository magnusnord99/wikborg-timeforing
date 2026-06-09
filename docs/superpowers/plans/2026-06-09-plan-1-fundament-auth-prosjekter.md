# Oppussing App – Plan 1: Fundament, Auth & Prosjekter

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap et nytt Next.js + Supabase prosjekt med autentisering, full databaseskjema og prosjektstyring (liste, opprette, se prosjekt med fanelayout).

**Architecture:** Next.js 15 App Router med server components for datahenting. Supabase SSR for auth-håndtering via cookies. Alle DB-kall skjer via typet Supabase-klient. Route groups `(auth)` og `(app)` skiller innloggingssider fra app-sider. Middleware beskytter alle app-ruter.

**Tech Stack:** Next.js 15, TypeScript, Supabase JS v2 + SSR, Tailwind CSS, shadcn/ui, Vitest

---

## Prosjektlokasjon

Nytt prosjekt opprettes i: `/Users/magnusnordmo/oppussing/`

---

## Filstruktur (Plan 1)

```
oppussing/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx              ← app-layout med sidemeny
│   │   │   ├── page.tsx                ← forside: alle prosjekter
│   │   │   └── prosjekter/
│   │   │       ├── ny/page.tsx         ← opprett prosjekt
│   │   │       └── [id]/
│   │   │           ├── layout.tsx      ← prosjekt-faner
│   │   │           └── page.tsx        ← prosjekt-oversikt (stub)
│   │   ├── auth/
│   │   │   └── callback/route.ts
│   │   └── layout.tsx                  ← root layout
│   ├── components/
│   │   ├── ui/                         ← shadcn-komponenter
│   │   ├── nav/
│   │   │   └── sidebar.tsx
│   │   └── projects/
│   │       ├── project-card.tsx
│   │       └── project-form.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               ← browser-klient
│   │   │   └── server.ts               ← server-klient
│   │   ├── types.ts                    ← alle TypeScript-typer
│   │   └── utils.ts                    ← cn() og andre hjelpere
│   └── middleware.ts
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql
├── src/lib/__tests__/
│   └── profit-calculator.test.ts       ← tester for fortjeneste-logikk
├── .env.local.example
├── vitest.config.ts
└── package.json
```

---

## Task 1: Bootstrap Next.js-prosjekt

**Files:**
- Create: `/Users/magnusnordmo/oppussing/` (nytt prosjekt via CLI)

- [ ] **Steg 1: Opprett Next.js-prosjekt**

```bash
cd /Users/magnusnordmo
npx create-next-app@latest oppussing \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack \
  --yes
```

Svar `Yes` på alle spørsmål. Forventet: ny mappe `oppussing/` opprettes.

- [ ] **Steg 2: Installer avhengigheter**

```bash
cd /Users/magnusnordmo/oppussing
npm install @supabase/supabase-js @supabase/ssr
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Steg 3: Initialiser shadcn/ui**

```bash
npx shadcn@latest init -d
```

Installer komponentene vi trenger i Plan 1:

```bash
npx shadcn@latest add button input label card badge dialog select textarea tabs avatar dropdown-menu separator sonner form
```

- [ ] **Steg 4: Opprett `.env.local.example`**

```
# /Users/magnusnordmo/oppussing/.env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Steg 5: Legg til Vitest-konfig**

Opprett `/Users/magnusnordmo/oppussing/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

Opprett `/Users/magnusnordmo/oppussing/src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

Legg til test-script i `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Steg 6: Initialiser git og commit**

```bash
cd /Users/magnusnordmo/oppussing
git init
echo ".env.local" >> .gitignore
git add -A
git commit -m "chore: bootstrap Next.js project with Supabase and shadcn/ui"
```

---

## Task 2: Supabase-skjema og migreringer

**Files:**
- Create: `supabase/migrations/0001_initial_schema.sql`

- [ ] **Steg 1: Opprett Supabase-prosjekt**

Gå til [supabase.com](https://supabase.com), opprett et nytt prosjekt (kall det f.eks. "oppussing"). Kopier `Project URL` og `anon public key` fra Settings → API.

- [ ] **Steg 2: Kopier og fyll inn env**

```bash
cd /Users/magnusnordmo/oppussing
cp .env.local.example .env.local
# Lim inn riktig NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY
```

- [ ] **Steg 3: Opprett Supabase CLI-mappestruktur**

```bash
mkdir -p supabase/migrations
```

- [ ] **Steg 4: Skriv migreringsfilen**

Opprett `/Users/magnusnordmo/oppussing/supabase/migrations/0001_initial_schema.sql`:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────
-- User profiles
-- ─────────────────────────────
create table public.user_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  email      text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────
-- Availability periods
-- ─────────────────────────────
create table public.availability (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.user_profiles(id) on delete cascade,
  start_date date not null,
  end_date   date not null,
  reason     text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────
-- Projects
-- ─────────────────────────────
create table public.projects (
  id                   uuid primary key default uuid_generate_v4(),
  name                 text not null,
  address              text not null,
  status               text not null default 'planlagt'
                         check (status in ('planlagt', 'aktivt', 'solgt')),
  purchase_price       numeric(12,2),
  estimated_sale_price numeric(12,2),
  budget               numeric(12,2),
  created_by           uuid not null references public.user_profiles(id),
  created_at           timestamptz not null default now()
);

-- ─────────────────────────────
-- Project members
-- ─────────────────────────────
create table public.project_members (
  id         uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references public.user_profiles(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  unique(project_id, user_id)
);

-- ─────────────────────────────
-- Expenses (utgifter)
-- ─────────────────────────────
create table public.expenses (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  amount      numeric(12,2) not null,
  category    text not null,
  description text not null,
  date        date not null,
  created_by  uuid not null references public.user_profiles(id),
  receipt_url text,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────
-- Investments (innbetalinger)
-- ─────────────────────────────
create table public.investments (
  id         uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references public.user_profiles(id) on delete cascade,
  amount     numeric(12,2) not null,
  date       date not null,
  note       text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────
-- Time entries (tidsregistreringer)
-- ─────────────────────────────
create table public.time_entries (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references public.user_profiles(id) on delete cascade,
  hours       numeric(5,2) not null,
  date        date not null,
  description text not null,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────
-- Tasks (oppgaver)
-- ─────────────────────────────
create table public.tasks (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  title           text not null,
  description     text,
  status          text not null default 'ikke_startet'
                    check (status in ('ikke_startet', 'pagaar', 'ferdig')),
  assigned_to     uuid references public.user_profiles(id),
  priority        text not null default 'normal'
                    check (priority in ('lav', 'normal', 'hoy')),
  category        text,
  estimated_hours numeric(5,2),
  due_date        date,
  created_by      uuid not null references public.user_profiles(id),
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────
-- Task comments
-- ─────────────────────────────
create table public.task_comments (
  id         uuid primary key default uuid_generate_v4(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  user_id    uuid not null references public.user_profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────
-- Calendar events (hendelser)
-- ─────────────────────────────
create table public.events (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  title        text not null,
  description  text,
  start_time   timestamptz not null,
  end_time     timestamptz,
  attendee_ids uuid[],
  created_by   uuid not null references public.user_profiles(id),
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────
-- Messages (meldinger)
-- ─────────────────────────────
create table public.messages (
  id         uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references public.user_profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────
-- Documents (dokumenter)
-- ─────────────────────────────
create table public.documents (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  name        text not null,
  file_url    text not null,
  category    text,
  uploaded_by uuid not null references public.user_profiles(id),
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────
-- Shopping items (handleliste)
-- ─────────────────────────────
create table public.shopping_items (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  name        text not null,
  quantity    text,
  assigned_to uuid references public.user_profiles(id),
  is_checked  boolean not null default false,
  created_by  uuid not null references public.user_profiles(id),
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────
-- Row Level Security
-- ─────────────────────────────
alter table public.user_profiles  enable row level security;
alter table public.availability   enable row level security;
alter table public.projects       enable row level security;
alter table public.project_members enable row level security;
alter table public.expenses       enable row level security;
alter table public.investments    enable row level security;
alter table public.time_entries   enable row level security;
alter table public.tasks          enable row level security;
alter table public.task_comments  enable row level security;
alter table public.events         enable row level security;
alter table public.messages       enable row level security;
alter table public.documents      enable row level security;
alter table public.shopping_items enable row level security;

-- user_profiles
create policy "Alle innloggede kan lese profiler"
  on public.user_profiles for select to authenticated using (true);
create policy "Brukere kan opprette egen profil"
  on public.user_profiles for insert to authenticated with check (auth.uid() = id);
create policy "Brukere kan oppdatere egen profil"
  on public.user_profiles for update to authenticated using (auth.uid() = id);

-- availability
create policy "Alle innloggede kan lese tilgjengelighet"
  on public.availability for select to authenticated using (true);
create policy "Brukere kan administrere egen tilgjengelighet"
  on public.availability for all to authenticated using (auth.uid() = user_id);

-- Helper function: sjekk om bruker er prosjektmedlem
create or replace function public.is_project_member(project_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from public.project_members
    where project_id = project_uuid and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- projects
create policy "Prosjektmedlemmer kan lese prosjekter"
  on public.projects for select to authenticated using (public.is_project_member(id));
create policy "Innloggede kan opprette prosjekter"
  on public.projects for insert to authenticated with check (auth.uid() = created_by);
create policy "Prosjektmedlemmer kan oppdatere prosjekter"
  on public.projects for update to authenticated using (public.is_project_member(id));

-- project_members
create policy "Prosjektmedlemmer kan lese medlemmer"
  on public.project_members for select to authenticated using (public.is_project_member(project_id));
create policy "Prosjektmedlemmer kan legge til medlemmer"
  on public.project_members for insert to authenticated
  with check (public.is_project_member(project_id) or auth.uid() = user_id);
create policy "Prosjektmedlemmer kan fjerne seg selv"
  on public.project_members for delete to authenticated using (auth.uid() = user_id);

-- Alle prosjekt-tabeller: prosjektmedlemmer kan lese og skrive
create policy "Prosjektmedlemmer kan administrere utgifter"
  on public.expenses for all to authenticated using (public.is_project_member(project_id));
create policy "Prosjektmedlemmer kan administrere investeringer"
  on public.investments for all to authenticated using (public.is_project_member(project_id));
create policy "Prosjektmedlemmer kan administrere tidsregistreringer"
  on public.time_entries for all to authenticated using (public.is_project_member(project_id));
create policy "Prosjektmedlemmer kan administrere oppgaver"
  on public.tasks for all to authenticated using (public.is_project_member(project_id));
create policy "Prosjektmedlemmer kan administrere hendelser"
  on public.events for all to authenticated using (public.is_project_member(project_id));
create policy "Prosjektmedlemmer kan administrere meldinger"
  on public.messages for all to authenticated using (public.is_project_member(project_id));
create policy "Prosjektmedlemmer kan administrere dokumenter"
  on public.documents for all to authenticated using (public.is_project_member(project_id));
create policy "Prosjektmedlemmer kan administrere handleliste"
  on public.shopping_items for all to authenticated using (public.is_project_member(project_id));
create policy "Prosjektmedlemmer kan administrere oppgavekommentarer"
  on public.task_comments for all to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and public.is_project_member(t.project_id)
    )
  );

-- ─────────────────────────────
-- Auto-opprett brukerprofil ved registrering
-- ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

- [ ] **Steg 5: Kjør migreringen i Supabase**

Gå til Supabase Dashboard → SQL Editor, lim inn hele innholdet fra `0001_initial_schema.sql` og kjør. Forventet: alle tabeller og policies opprettes uten feil.

- [ ] **Steg 6: Commit**

```bash
cd /Users/magnusnordmo/oppussing
git add supabase/
git commit -m "feat: add full database schema with RLS policies"
```

---

## Task 3: Supabase-klient og TypeScript-typer

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/types.ts`
- Create: `src/lib/utils.ts`

- [ ] **Steg 1: Skriv browser-klient**

Opprett `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Steg 2: Skriv server-klient**

Opprett `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — kan ignoreres
          }
        },
      },
    }
  )
}
```

- [ ] **Steg 3: Skriv TypeScript-typer**

Opprett `src/lib/types.ts`:

```typescript
export type ProjectStatus = 'planlagt' | 'aktivt' | 'solgt'
export type TaskStatus = 'ikke_startet' | 'pagaar' | 'ferdig'
export type TaskPriority = 'lav' | 'normal' | 'hoy'

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url: string | null
  created_at: string
}

export interface Availability {
  id: string
  user_id: string
  start_date: string
  end_date: string
  reason: string | null
  created_at: string
}

export interface Project {
  id: string
  name: string
  address: string
  status: ProjectStatus
  purchase_price: number | null
  estimated_sale_price: number | null
  budget: number | null
  created_by: string
  created_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  joined_at: string
  user_profiles?: UserProfile
}

export interface ProjectWithStats extends Project {
  project_members: ProjectMember[]
  task_total: number
  task_completed: number
  total_expenses: number
  next_event: CalendarEvent | null
}

export interface Expense {
  id: string
  project_id: string
  amount: number
  category: string
  description: string
  date: string
  created_by: string
  receipt_url: string | null
  created_at: string
  user_profiles?: UserProfile
}

export interface Investment {
  id: string
  project_id: string
  user_id: string
  amount: number
  date: string
  note: string | null
  created_at: string
  user_profiles?: UserProfile
}

export interface TimeEntry {
  id: string
  project_id: string
  user_id: string
  hours: number
  date: string
  description: string
  created_at: string
  user_profiles?: UserProfile
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  assigned_to: string | null
  priority: TaskPriority
  category: string | null
  estimated_hours: number | null
  due_date: string | null
  created_by: string
  created_at: string
  user_profiles?: UserProfile
  assigned_user?: UserProfile
}

export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  user_profiles?: UserProfile
}

export interface CalendarEvent {
  id: string
  project_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  attendee_ids: string[] | null
  created_by: string
  created_at: string
}

export interface Message {
  id: string
  project_id: string
  user_id: string
  content: string
  created_at: string
  user_profiles?: UserProfile
}

export interface Document {
  id: string
  project_id: string
  name: string
  file_url: string
  category: string | null
  uploaded_by: string
  created_at: string
  user_profiles?: UserProfile
}

export interface ShoppingItem {
  id: string
  project_id: string
  name: string
  quantity: string | null
  assigned_to: string | null
  is_checked: boolean
  created_by: string
  created_at: string
  assigned_user?: UserProfile
}

// Fortjeneste-beregning
export interface ProfitShare {
  user_id: string
  name: string
  equal_share: number
  investment_share: number
  hours_share: number
  total: number
}

export interface ProfitCalculation {
  gross_profit: number
  shares: ProfitShare[]
}
```

- [ ] **Steg 4: Oppdater `src/lib/utils.ts`**

`create-next-app` oppretter denne med `cn()`. Behold eksisterende innhold og legg til:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNOK(amount: number): string {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('nb-NO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  planlagt: 'Planlagt',
  aktivt: 'Aktivt',
  solgt: 'Solgt',
}

export const PROJECT_STATUS_COLOR: Record<string, string> = {
  planlagt: 'bg-yellow-100 text-yellow-800',
  aktivt: 'bg-green-100 text-green-800',
  solgt: 'bg-gray-100 text-gray-800',
}
```

- [ ] **Steg 5: Commit**

```bash
git add src/lib/
git commit -m "feat: add Supabase clients and TypeScript types"
```

---

## Task 4: Fortjeneste-kalkulator (med tester)

**Files:**
- Create: `src/lib/profit-calculator.ts`
- Create: `src/lib/__tests__/profit-calculator.test.ts`

- [ ] **Steg 1: Skriv testene**

Opprett `src/lib/__tests__/profit-calculator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateProfit } from '../profit-calculator'

describe('calculateProfit', () => {
  const members = [
    { user_id: 'a', name: 'Magnus' },
    { user_id: 'b', name: 'Lars' },
    { user_id: 'c', name: 'Ola' },
    { user_id: 'd', name: 'Per' },
    { user_id: 'e', name: 'Knut' },
  ]

  it('deler 80% likt, 10% etter timer, 10% etter investering', () => {
    const result = calculateProfit({
      estimated_sale_price: 6_500_000,
      purchase_price: 4_060_000,
      total_expenses: 793_585,
      members,
      investments: [
        { user_id: 'a', amount: 200_000 },
        { user_id: 'b', amount: 150_000 },
        { user_id: 'c', amount: 150_000 },
        { user_id: 'd', amount: 150_000 },
        { user_id: 'e', amount: 143_585 },
      ],
      time_entries: [
        { user_id: 'a', hours: 100 },
        { user_id: 'b', hours: 80 },
        { user_id: 'c', hours: 60 },
        { user_id: 'd', hours: 50 },
        { user_id: 'e', hours: 42 },
      ],
    })

    expect(result.gross_profit).toBe(6_500_000 - 4_060_000 - 793_585)
    expect(result.shares).toHaveLength(5)

    const totalDistributed = result.shares.reduce((sum, s) => sum + s.total, 0)
    expect(totalDistributed).toBeCloseTo(result.gross_profit, 0)

    // Magnus har mest timer og mest investert — skal ha mest
    const magnus = result.shares.find(s => s.user_id === 'a')!
    const knut = result.shares.find(s => s.user_id === 'e')!
    expect(magnus.total).toBeGreaterThan(knut.total)
  })

  it('returnerer lik fordeling når alle har like timer og investeringer', () => {
    const result = calculateProfit({
      estimated_sale_price: 2_000_000,
      purchase_price: 1_000_000,
      total_expenses: 200_000,
      members: members.slice(0, 2),
      investments: [
        { user_id: 'a', amount: 100_000 },
        { user_id: 'b', amount: 100_000 },
      ],
      time_entries: [
        { user_id: 'a', hours: 50 },
        { user_id: 'b', hours: 50 },
      ],
    })

    expect(result.shares[0].total).toBeCloseTo(result.shares[1].total, 0)
  })

  it('håndterer null timer og investeringer (0-verdier)', () => {
    const result = calculateProfit({
      estimated_sale_price: 2_000_000,
      purchase_price: 1_000_000,
      total_expenses: 0,
      members: members.slice(0, 2),
      investments: [],
      time_entries: [],
    })

    expect(result.shares[0].total).toBeCloseTo(result.shares[1].total, 0)
  })
})
```

- [ ] **Steg 2: Kjør testene — forvent FAIL**

```bash
cd /Users/magnusnordmo/oppussing
npm test
```

Forventet: `Cannot find module '../profit-calculator'`

- [ ] **Steg 3: Implementer fortjeneste-kalkulatoren**

Opprett `src/lib/profit-calculator.ts`:

```typescript
import type { ProfitCalculation, ProfitShare } from './types'

interface Member {
  user_id: string
  name: string
}

interface InvestmentInput {
  user_id: string
  amount: number
}

interface TimeInput {
  user_id: string
  hours: number
}

interface ProfitInput {
  estimated_sale_price: number
  purchase_price: number
  total_expenses: number
  members: Member[]
  investments: InvestmentInput[]
  time_entries: TimeInput[]
}

export function calculateProfit(input: ProfitInput): ProfitCalculation {
  const gross_profit = input.estimated_sale_price - input.purchase_price - input.total_expenses

  const total_investment = input.investments.reduce((sum, i) => sum + i.amount, 0)
  const total_hours = input.time_entries.reduce((sum, t) => sum + t.hours, 0)
  const member_count = input.members.length

  const equal_pool = gross_profit * 0.8
  const investment_pool = gross_profit * 0.1
  const hours_pool = gross_profit * 0.1

  const shares: ProfitShare[] = input.members.map(member => {
    const equal_share = member_count > 0 ? equal_pool / member_count : 0

    const member_investment = input.investments
      .filter(i => i.user_id === member.user_id)
      .reduce((sum, i) => sum + i.amount, 0)
    const investment_share = total_investment > 0
      ? (member_investment / total_investment) * investment_pool
      : investment_pool / member_count

    const member_hours = input.time_entries
      .filter(t => t.user_id === member.user_id)
      .reduce((sum, t) => sum + t.hours, 0)
    const hours_share = total_hours > 0
      ? (member_hours / total_hours) * hours_pool
      : hours_pool / member_count

    return {
      user_id: member.user_id,
      name: member.name,
      equal_share,
      investment_share,
      hours_share,
      total: equal_share + investment_share + hours_share,
    }
  })

  return { gross_profit, shares }
}
```

- [ ] **Steg 4: Kjør testene — forvent PASS**

```bash
npm test
```

Forventet: alle 3 tester PASS.

- [ ] **Steg 5: Commit**

```bash
git add src/lib/profit-calculator.ts src/lib/__tests__/
git commit -m "feat: add profit calculator with tests (80/10/10 model)"
```

---

## Task 5: Middleware og auth-callback

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/auth/callback/route.ts`

- [ ] **Steg 1: Skriv middleware**

Opprett `src/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/auth']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isPublicPath = PUBLIC_PATHS.some(p => request.nextUrl.pathname.startsWith(p))

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Steg 2: Skriv auth-callback route**

Opprett `src/app/auth/callback/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Innlogging+feilet`)
}
```

- [ ] **Steg 3: Commit**

```bash
git add src/middleware.ts src/app/auth/
git commit -m "feat: add auth middleware and OAuth callback route"
```

---

## Task 6: Login- og registreringssider

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(auth)/layout.tsx`

- [ ] **Steg 1: Skriv auth-layout**

Opprett `src/app/(auth)/layout.tsx`:

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
```

- [ ] **Steg 2: Skriv login-side**

Opprett `src/app/(auth)/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Feil e-post eller passord')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Logg inn</CardTitle>
        <CardDescription>Oppussingsappen</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logger inn...' : 'Logg inn'}
          </Button>
          <p className="text-sm text-gray-600">
            Ikke registrert?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Opprett konto
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
```

- [ ] **Steg 3: Skriv registreringsside**

Opprett `src/app/(auth)/register/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Opprett konto</CardTitle>
        <CardDescription>Bli med i oppussingsgruppen</CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Navn</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Fornavn Etternavn"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Minst 6 tegn"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Oppretter konto...' : 'Opprett konto'}
          </Button>
          <p className="text-sm text-gray-600">
            Har du allerede konto?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Logg inn
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
```

- [ ] **Steg 4: Commit**

```bash
git add src/app/\(auth\)/
git commit -m "feat: add login and register pages"
```

---

## Task 7: Root layout og app-layout med sidemeny

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/(app)/layout.tsx`
- Create: `src/components/nav/sidebar.tsx`

- [ ] **Steg 1: Oppdater root layout**

Erstatt innholdet i `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Oppussing',
  description: 'Prosjektstyring for boligoppussing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

- [ ] **Steg 2: Skriv sidemeny-komponent**

Opprett `src/components/nav/sidebar.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Home,
  LogOut,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UserProfile } from '@/lib/types'

interface SidebarProps {
  user: UserProfile
}

const navItems = [
  { href: '/', label: 'Prosjekter', icon: Home },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">🏠 Oppussing</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logg ut
        </Button>
      </div>
    </aside>
  )
}
```

- [ ] **Steg 3: Installer lucide-react**

```bash
npm install lucide-react
```

- [ ] **Steg 4: Skriv app-layout**

Opprett `src/app/(app)/layout.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/nav/sidebar'
import type { UserProfile } from '@/lib/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar user={profile as UserProfile} />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Steg 5: Commit**

```bash
git add src/app/layout.tsx src/app/\(app\)/layout.tsx src/components/nav/
git commit -m "feat: add app layout with sidebar navigation"
```

---

## Task 8: Forsiden — prosjektoversikt

**Files:**
- Create: `src/app/(app)/page.tsx`
- Create: `src/components/projects/project-card.tsx`

- [ ] **Steg 1: Skriv prosjektkort-komponent**

Opprett `src/components/projects/project-card.tsx`:

```typescript
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNOK, PROJECT_STATUS_LABEL, PROJECT_STATUS_COLOR } from '@/lib/utils'
import type { ProjectWithStats } from '@/lib/types'
import { MapPin, Users, CheckSquare, TrendingUp } from 'lucide-react'

interface ProjectCardProps {
  project: ProjectWithStats
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progress = project.task_total > 0
    ? Math.round((project.task_completed / project.task_total) * 100)
    : 0

  const budgetUsed = project.budget && project.budget > 0
    ? Math.round((project.total_expenses / project.budget) * 100)
    : null

  return (
    <Link href={`/prosjekter/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-tight">{project.name}</CardTitle>
            <Badge className={PROJECT_STATUS_COLOR[project.status]}>
              {PROJECT_STATUS_LABEL[project.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3 w-3" />
            {project.address}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>{project.project_members.length} deltakere</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckSquare className="h-4 w-4" />
              <span>{project.task_completed}/{project.task_total} oppgaver</span>
            </div>
          </div>

          {project.task_total > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Fremdrift</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {budgetUsed !== null && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Budsjett brukt</span>
                <span className={budgetUsed > 90 ? 'text-red-600 font-medium' : ''}>
                  {formatNOK(project.total_expenses)} / {formatNOK(project.budget!)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${budgetUsed > 90 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
            </div>
          )}

          {project.estimated_sale_price && project.purchase_price && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-md px-3 py-2">
              <TrendingUp className="h-4 w-4" />
              <span>
                Estimert fortjeneste:{' '}
                <strong>
                  {formatNOK(project.estimated_sale_price - project.purchase_price - project.total_expenses)}
                </strong>
              </span>
            </div>
          )}

          {project.next_event && (
            <p className="text-xs text-gray-500">
              Neste: {project.next_event.title} —{' '}
              {new Date(project.next_event.start_time).toLocaleDateString('nb-NO')}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
```

- [ ] **Steg 2: Skriv forsiden**

Opprett `src/app/(app)/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { ProjectCard } from '@/components/projects/project-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { ProjectWithStats } from '@/lib/types'

async function getProjects(userId: string): Promise<ProjectWithStats[]> {
  const supabase = await createClient()

  // Hent prosjekter brukeren er med i
  const { data: memberRows } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('user_id', userId)

  if (!memberRows || memberRows.length === 0) return []

  const projectIds = memberRows.map(r => r.project_id)

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      project_members(*, user_profiles(*))
    `)
    .in('id', projectIds)
    .order('created_at', { ascending: false })

  if (!projects) return []

  // Hent statistikk for hvert prosjekt
  const projectsWithStats = await Promise.all(
    projects.map(async project => {
      const [{ count: task_total }, { count: task_completed }, { data: expenses }, { data: next_event }] =
        await Promise.all([
          supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
          supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', project.id).eq('status', 'ferdig'),
          supabase.from('expenses').select('amount').eq('project_id', project.id),
          supabase.from('events').select('*').eq('project_id', project.id).gte('start_time', new Date().toISOString()).order('start_time').limit(1),
        ])

      const total_expenses = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0)

      return {
        ...project,
        task_total: task_total ?? 0,
        task_completed: task_completed ?? 0,
        total_expenses,
        next_event: next_event?.[0] ?? null,
      } as ProjectWithStats
    })
  )

  return projectsWithStats
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const projects = await getProjects(user.id)

  const active = projects.filter(p => p.status === 'aktivt')
  const planned = projects.filter(p => p.status === 'planlagt')
  const sold = projects.filter(p => p.status === 'solgt')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prosjekter</h1>
          <p className="text-gray-500 mt-1">{projects.length} prosjekter totalt</p>
        </div>
        <Button asChild>
          <Link href="/prosjekter/ny">
            <Plus className="h-4 w-4 mr-2" />
            Nytt prosjekt
          </Link>
        </Button>
      </div>

      {projects.length === 0 && (
        <div className="text-center py-24 text-gray-500">
          <p className="text-lg mb-4">Ingen prosjekter ennå</p>
          <Button asChild>
            <Link href="/prosjekter/ny">Opprett første prosjekt</Link>
          </Button>
        </div>
      )}

      {active.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Aktive</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {active.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      )}

      {planned.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Planlagte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {planned.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      )}

      {sold.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Solgte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sold.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Steg 3: Commit**

```bash
git add src/app/\(app\)/page.tsx src/components/projects/project-card.tsx
git commit -m "feat: add projects overview page with stats cards"
```

---

## Task 9: Opprett nytt prosjekt

**Files:**
- Create: `src/app/(app)/prosjekter/ny/page.tsx`
- Create: `src/components/projects/project-form.tsx`

- [ ] **Steg 1: Skriv prosjektskjema-komponent**

Opprett `src/components/projects/project-form.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { ProjectStatus } from '@/lib/types'

export function ProjectForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    address: '',
    status: 'planlagt' as ProjectStatus,
    purchase_price: '',
    estimated_sale_price: '',
    budget: '',
  })

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: form.name,
        address: form.address,
        status: form.status,
        purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
        estimated_sale_price: form.estimated_sale_price ? Number(form.estimated_sale_price) : null,
        budget: form.budget ? Number(form.budget) : null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error || !project) {
      toast.error('Kunne ikke opprette prosjekt')
      setLoading(false)
      return
    }

    // Legg til oppretter som medlem
    await supabase
      .from('project_members')
      .insert({ project_id: project.id, user_id: user.id })

    toast.success('Prosjekt opprettet!')
    router.push(`/prosjekter/${project.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Prosjektnavn *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={e => handleChange('name', e.target.value)}
          required
          placeholder="f.eks. Spjelkavika 12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse *</Label>
        <Input
          id="address"
          value={form.address}
          onChange={e => handleChange('address', e.target.value)}
          required
          placeholder="Gateveien 12, 6015 Ålesund"
        />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={form.status} onValueChange={v => handleChange('status', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planlagt">Planlagt</SelectItem>
            <SelectItem value="aktivt">Aktivt</SelectItem>
            <SelectItem value="solgt">Solgt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purchase_price">Kjøpspris (kr)</Label>
          <Input
            id="purchase_price"
            type="number"
            value={form.purchase_price}
            onChange={e => handleChange('purchase_price', e.target.value)}
            placeholder="4 060 000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimated_sale_price">Estimert salgspris (kr)</Label>
          <Input
            id="estimated_sale_price"
            type="number"
            value={form.estimated_sale_price}
            onChange={e => handleChange('estimated_sale_price', e.target.value)}
            placeholder="6 500 000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Budsjett oppussing (kr)</Label>
        <Input
          id="budget"
          type="number"
          value={form.budget}
          onChange={e => handleChange('budget', e.target.value)}
          placeholder="1 000 000"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Oppretter...' : 'Opprett prosjekt'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Avbryt
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Steg 2: Skriv ny-prosjekt-side**

Opprett `src/app/(app)/prosjekter/ny/page.tsx`:

```typescript
import { ProjectForm } from '@/components/projects/project-form'

export default function NyttProsjektPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nytt prosjekt</h1>
        <p className="text-gray-500 mt-1">Legg til et nytt boligprosjekt</p>
      </div>
      <ProjectForm />
    </div>
  )
}
```

- [ ] **Steg 3: Commit**

```bash
git add src/app/\(app\)/prosjekter/ny/ src/components/projects/project-form.tsx
git commit -m "feat: add create project page and form"
```

---

## Task 10: Prosjektside med fanelayout (stub)

**Files:**
- Create: `src/app/(app)/prosjekter/[id]/layout.tsx`
- Create: `src/app/(app)/prosjekter/[id]/page.tsx`

- [ ] **Steg 1: Skriv prosjekt-layout med faner**

Opprett `src/app/(app)/prosjekter/[id]/layout.tsx`:

```typescript
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_COLOR } from '@/lib/utils'
import type { Project } from '@/lib/types'

const TABS = [
  { href: '', label: 'Oversikt' },
  { href: '/oppgaver', label: 'Oppgaver' },
  { href: '/kalender', label: 'Kalender' },
  { href: '/okonomi', label: 'Økonomi' },
  { href: '/tidsforing', label: 'Tidsføring' },
  { href: '/handleliste', label: 'Handleliste' },
  { href: '/dokumenter', label: 'Dokumenter' },
  { href: '/meldinger', label: 'Meldinger' },
]

interface Props {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function ProsjektLayout({ children, params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Sjekk at bruker er prosjektmedlem
  const { data: membership } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) notFound()

  const p = project as Project

  return (
    <div className="flex flex-col min-h-screen">
      {/* Prosjekt-header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{p.address}</p>
          </div>
          <Badge className={PROJECT_STATUS_COLOR[p.status]}>
            {PROJECT_STATUS_LABEL[p.status]}
          </Badge>
        </div>

        {/* Faner */}
        <nav className="flex gap-1 mt-6 -mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <Link
              key={tab.href}
              href={`/prosjekter/${id}${tab.href}`}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 whitespace-nowrap transition-colors"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Innhold */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Steg 2: Skriv prosjekt-oversiktsside (stub)**

Opprett `src/app/(app)/prosjekter/[id]/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { formatNOK } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Project } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProsjektOversiktPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: project },
    { count: task_total },
    { count: task_completed },
    { data: expenses },
    { data: members },
  ] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', id),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', id).eq('status', 'ferdig'),
    supabase.from('expenses').select('amount').eq('project_id', id),
    supabase.from('project_members').select('*, user_profiles(*)').eq('project_id', id),
  ])

  if (!project) return null

  const p = project as Project
  const total_expenses = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0)
  const progress = (task_total ?? 0) > 0 ? Math.round(((task_completed ?? 0) / task_total!) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Kjøpspris</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{p.purchase_price ? formatNOK(p.purchase_price) : '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Utgifter hittil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNOK(total_expenses)}</p>
            {p.budget && (
              <p className="text-xs text-gray-500 mt-1">av {formatNOK(p.budget)} budsjett</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Fremdrift</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{progress}%</p>
            <p className="text-xs text-gray-500 mt-1">{task_completed ?? 0} av {task_total ?? 0} oppgaver</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Est. fortjeneste</CardTitle>
          </CardHeader>
          <CardContent>
            {p.estimated_sale_price && p.purchase_price ? (
              <>
                <p className="text-2xl font-bold text-green-700">
                  {formatNOK(p.estimated_sale_price - p.purchase_price - total_expenses)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Salg: {formatNOK(p.estimated_sale_price)}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-gray-400">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deltakere</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {(members ?? []).map((m: any) => (
              <div key={m.id} className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {m.user_profiles?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{m.user_profiles?.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-gray-400">
        {['Oppgaver', 'Kalender', 'Økonomi', 'Tidsføring', 'Meldinger'].map(tab => (
          <Card key={tab}>
            <CardContent className="py-8">
              <p className="text-sm">{tab} — kommer i neste plan</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Steg 3: Commit**

```bash
git add src/app/\(app\)/prosjekter/
git commit -m "feat: add project detail page with tabs layout and overview stats"
```

---

## Task 11: Deploy til Vercel

- [ ] **Steg 1: Push til GitHub**

```bash
cd /Users/magnusnordmo/oppussing
git remote add origin https://github.com/DITT_BRUKERNAVN/oppussing.git
git push -u origin main
```

*(Opprett GitHub-repo på github.com/new først)*

- [ ] **Steg 2: Koble til Vercel**

Gå til [vercel.com/new](https://vercel.com/new), importer GitHub-repoet. Vercel oppdager automatisk at det er Next.js.

- [ ] **Steg 3: Sett environment variables i Vercel**

I Vercel-prosjektets Settings → Environment Variables, legg til:
- `NEXT_PUBLIC_SUPABASE_URL` — fra Supabase Dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — fra Supabase Dashboard → Settings → API

- [ ] **Steg 4: Sett Supabase redirect URL**

I Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://ditt-prosjekt.vercel.app`
- Redirect URLs: legg til `https://ditt-prosjekt.vercel.app/auth/callback`

- [ ] **Steg 5: Verifiser deploy**

Åpne Vercel-URLen. Forventet:
- `/login` vises for ikke-innloggede brukere
- Registrering og innlogging fungerer
- Forside viser prosjektoversikt
- Kan opprette nytt prosjekt

---

## Verifisering av Plan 1

Etter alle tasks er fullført, skal følgende fungere:

- [ ] `npm test` — alle 3 fortjeneste-tester PASS
- [ ] `npm run dev` — appen starter uten feil
- [ ] Registrer ny bruker → oppretter profil automatisk
- [ ] Logg inn → videresendes til forsiden
- [ ] Opprett prosjekt → vises på forsiden med riktig status
- [ ] Klikk på prosjekt → ser oversikt med nøkkeltall og deltakere
- [ ] Deploy til Vercel → fungerer i produksjon

---

## Neste planer

- **Plan 2:** Oppgaver (CRUD + kommentarer + kanban) og kalender (måneds/ukevisning, hendelser, tilgjengelighet)
- **Plan 3:** Økonomi (utgifter, investeringer, fortjeneste-kalkulator live) og tidsføring
- **Plan 4:** Meldinger (realtime chat), dokumenter (filopplasting), handleliste

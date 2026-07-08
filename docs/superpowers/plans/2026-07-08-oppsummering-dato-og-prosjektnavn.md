# Oppsummering-dato og rediger prosjektnavn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La brukeren bla mellom datoer i Oppsummering-fanen (samme dato som Timer-fanen), og la brukeren redigere et prosjekts navn i ettertid uten å måtte opprette et nytt prosjekt.

**Architecture:** Ren frontend-endring i den eksisterende React + Supabase-appen (Vite, ingen server-side rendering). Begge features gjenbruker eksisterende state-mønstre i `useTimeTrackerData` (delt `selectedDate`, samme optimistisk oppdaterings-mønster som `addProject`/`removeProject`) og eksisterende stiler (`timeTrackerStyles`, `projectsListStyles`). Ingen nye avhengigheter, ingen databasemigrasjoner.

**Tech Stack:** React 18, TypeScript, Vite, Supabase JS v2, lucide-react (ikoner).

## Global Constraints

- Ingen nye npm-avhengigheter.
- Ingen databasemigrasjoner — `projects.name`-kolonnen finnes allerede.
- All UI-tekst på norsk (bokmål), i tråd med resten av appen.
- Gjenbruk eksisterende stilobjekter (`styles` fra `timeTrackerStyles.ts`, `styles` fra `projectsListStyles.ts`) — ikke opprett nye stilfiler.
- Prosjektet har ingen automatisert testoppsett (ingen test-runner i `package.json`). Verifiser hvert steg med `npm run build` (kjører `tsc -b && vite build`, fanger opp type- og kompileringsfeil) og manuell sjekk i `npm run dev`.

---

## Filstruktur (endringer)

```
src/
├── components/
│   ├── DailySummary.tsx                       ← modifiser: isToday-bevisst tekst
│   ├── ProjectsList.tsx                        ← modifiser: editingProjectId-state
│   ├── TimeTracker.tsx                         ← modifiser: nye props til SummaryPanel/ProjectsPanel
│   ├── projects-list/
│   │   ├── ProjectCard.tsx                     ← modifiser: inline redigeringsmodus
│   │   └── projectsListStyles.ts               ← modifiser: nye stiler (iconButton, editForm, editInput)
│   └── time-tracker/
│       ├── ProjectsPanel.tsx                   ← modifiser: send onRenameProject videre
│       ├── SummaryPanel.tsx                    ← modifiser: dato-kontroller
│       ├── trackerApi.ts                       ← modifiser: updateProjectRecord()
│       └── useTimeTrackerData.ts               ← modifiser: renameProject()
```

---

## Task 1: Rediger prosjektnavn

**Files:**
- Modify: `src/components/time-tracker/trackerApi.ts`
- Modify: `src/components/time-tracker/useTimeTrackerData.ts`
- Modify: `src/components/projects-list/projectsListStyles.ts`
- Modify: `src/components/projects-list/ProjectCard.tsx`
- Modify: `src/components/ProjectsList.tsx`
- Modify: `src/components/time-tracker/ProjectsPanel.tsx`
- Modify: `src/components/TimeTracker.tsx`

**Interfaces:**
- Produces: `renameProject(id: string, name: string): Promise<void>` på `useTimeTrackerData`-returverdien, brukt av `TimeTracker.tsx`.
- Produces: `ProjectCard` props `isEditing: boolean`, `onRequestEdit: () => void`, `onCancelEdit: () => void`, `onSaveEdit: (name: string) => void`.

- [ ] **Steg 1: Legg til `updateProjectRecord` i `trackerApi.ts`**

Åpne `src/components/time-tracker/trackerApi.ts` og legg til denne funksjonen etter `deleteProjectRecord` (etter linje 54):

```typescript
export async function updateProjectRecord(projectId: string, name: string) {
  return supabase.from('projects').update({ name }).eq('id', projectId).select().single()
}
```

- [ ] **Steg 2: Koble til `renameProject` i `useTimeTrackerData.ts`**

Åpne `src/components/time-tracker/useTimeTrackerData.ts`. Legg til `updateProjectRecord` i import-listen fra `./trackerApi` (linje 5-16), alfabetisk mellom `stopTimerEntry` og `updateEntryDescription`:

```typescript
import {
  createProjectRecord,
  createTimerEntry,
  deleteProjectRecord,
  deleteTimeEntry,
  fetchEntriesForDate,
  fetchEntriesForRange,
  fetchProjectsQuery,
  getSignedInUserId,
  stopTimerEntry,
  updateEntryDescription,
  updateProjectRecord,
  updateTimeEntry,
} from './trackerApi'
```

Legg til funksjonen `renameProject` rett etter `removeProject` (etter linje 227):

```typescript
  async function renameProject(id: string, name: string) {
    const { error } = await updateProjectRecord(id, name)

    if (error) {
      console.error('Feil ved endring av prosjektnavn:', error)
      setNotice({ type: 'error', text: 'Kunne ikke endre prosjektnavnet.' })
      return
    }

    setNotice(null)
    setProjects((previous) =>
      previous
        .map((project) => (project.id === id ? { ...project, name } : project))
        .sort((a, b) => a.name.localeCompare(b.name)),
    )
  }
```

Legg til `renameProject` i retur-objektet (etter `removeProject,` på linje 274):

```typescript
    addProject,
    removeProject,
    renameProject,
    saveSessionNote,
  }
}
```

- [ ] **Steg 3: Bygg for å sjekke typer**

Kjør: `npm run build`
Forventet: bygger uten feil (funksjonen brukes ikke ennå, men skal typesjekke rent).

- [ ] **Steg 4: Commit**

```bash
git add src/components/time-tracker/trackerApi.ts src/components/time-tracker/useTimeTrackerData.ts
git commit -m "feat: add renameProject data layer for editing project names"
```

- [ ] **Steg 5: Legg til nye stiler i `projectsListStyles.ts`**

Åpne `src/components/projects-list/projectsListStyles.ts`. Legg til disse tre stilene etter `removeButton` (etter linje 140, før `dangerButton`... plasser dem samlet etter `dangerButton` på slutten av objektet):

```typescript
  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    padding: 0,
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
  },
  editForm: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    flexWrap: 'wrap',
  },
  editInput: {
    flex: 1,
    minWidth: 220,
    padding: 10,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    fontSize: 14,
  },
```

(Legg dem inn rett før den avsluttende `}` i `styles`-objektet.)

- [ ] **Steg 6: Bygg full `ProjectCard.tsx` med redigeringsmodus**

Erstatt hele innholdet i `src/components/projects-list/ProjectCard.tsx` med:

```typescript
import { useState, type FormEvent } from 'react'
import { Check, Pencil, Play, Square, Trash2, X } from 'lucide-react'
import type { Project, TimeEntry } from '../../types'
import { styles } from './projectsListStyles'

interface Props {
  project: Project
  activeEntry: TimeEntry | null
  confirmDelete: boolean
  isEditing: boolean
  onStart: () => void
  onStop: () => void
  onRequestDelete: () => void
  onCancelDelete: () => void
  onRemove: () => void
  onRequestEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: (name: string) => void
}

export function ProjectCard({
  project,
  activeEntry,
  confirmDelete,
  isEditing,
  onStart,
  onStop,
  onRequestDelete,
  onCancelDelete,
  onRemove,
  onRequestEdit,
  onCancelEdit,
  onSaveEdit,
}: Props) {
  const [editValue, setEditValue] = useState(project.name)
  const isActive = activeEntry?.project_id === project.id

  function handleSaveEdit(e: FormEvent) {
    e.preventDefault()
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === project.name) {
      onCancelEdit()
      return
    }
    onSaveEdit(trimmed)
  }

  if (isEditing) {
    return (
      <li style={styles.item}>
        <form onSubmit={handleSaveEdit} style={styles.editForm}>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            style={styles.editInput}
          />
          <div style={styles.actions}>
            <button type="submit" style={styles.button}>
              <Check size={15} />
              <span>Lagre</span>
            </button>
            <button type="button" onClick={onCancelEdit} style={styles.ghostButton}>
              <X size={15} />
              <span>Avbryt</span>
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li style={styles.item}>
      <div style={styles.projectInfo}>
        <div style={styles.projectHeader}>
          <span style={styles.projectName}>{project.name}</span>
          <button
            type="button"
            onClick={() => {
              setEditValue(project.name)
              onRequestEdit()
            }}
            style={styles.iconButton}
            aria-label="Rediger prosjektnavn"
          >
            <Pencil size={14} />
          </button>
          {isActive && (
            <span style={styles.activeBadge}>
              <Play size={12} />
              <span>Aktiv nå</span>
            </span>
          )}
        </div>
        <span style={styles.projectMeta}>
          {isActive
            ? 'Timeren kjører på dette prosjektet.'
            : activeEntry
              ? 'Vent til aktiv timer er stoppet før du starter denne.'
              : 'Klar til å starte timer.'}
        </span>
      </div>

      <div style={styles.actions}>
        {isActive ? (
          <button type="button" onClick={onStop} style={{ ...styles.button, ...styles.stopButton }}>
            <Square size={15} />
            <span>Stopp</span>
          </button>
        ) : (
          <button type="button" onClick={onStart} disabled={!!activeEntry} style={styles.button}>
            <Play size={15} />
            <span>Start</span>
          </button>
        )}

        {confirmDelete ? (
          <>
            <button type="button" onClick={onRemove} style={{ ...styles.button, ...styles.dangerButton }}>
              <Check size={15} />
              <span>Bekreft</span>
            </button>
            <button type="button" onClick={onCancelDelete} style={styles.ghostButton}>
              <X size={15} />
              <span>Avbryt</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onRequestDelete}
            style={{ ...styles.ghostButton, ...styles.removeButton }}
          >
            <Trash2 size={15} />
            <span>Fjern</span>
          </button>
        )}
      </div>
    </li>
  )
}
```

- [ ] **Steg 7: Oppdater `ProjectsList.tsx` med `editingProjectId`-state**

Erstatt hele innholdet i `src/components/ProjectsList.tsx` med:

```typescript
import { useState, type FormEvent } from 'react'
import { FolderKanban, Plus } from 'lucide-react'
import type { Project, TimeEntry } from '../types'
import { ProjectCard } from './projects-list/ProjectCard'
import { styles } from './projects-list/projectsListStyles'

interface Props {
  projects: Project[]
  onAdd: (name: string) => void
  onRemove: (id: string) => void
  onRename: (id: string, name: string) => void
  activeEntry: TimeEntry | null
  onStart: (projectId: string) => void
  onStop: () => void
}

export function ProjectsList({
  projects,
  onAdd,
  onRemove,
  onRename,
  activeEntry,
  onStart,
  onStop,
}: Props) {
  const [newName, setNewName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    onAdd(name)
    setNewName('')
  }

  return (
    <div>
      <form onSubmit={handleAdd} style={styles.addForm}>
        <input
          type="text"
          placeholder="Nytt prosjekt, klient eller sak"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={styles.input}
        />
        <button type="submit" disabled={!newName.trim()} style={styles.addButton}>
          <Plus size={16} />
          <span>Legg til</span>
        </button>
      </form>

      <p style={styles.helperText}>
        {activeEntry
          ? 'Du har en aktiv timer. Stopp den før du starter en ny.'
          : 'Velg prosjektet du faktisk skal føre på, så holder fokusvisningen seg ren.'}
      </p>

      {projects.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyTitle}>
            <FolderKanban size={18} />
            <strong>Ingen prosjekter ennå</strong>
          </div>
          <p style={styles.emptyText}>Opprett det første prosjektet ditt for å kunne starte en timer.</p>
        </div>
      )}

      <ul style={styles.list}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            activeEntry={activeEntry}
            confirmDelete={confirmDelete === project.id}
            isEditing={editingProjectId === project.id}
            onStart={() => onStart(project.id)}
            onStop={onStop}
            onRequestDelete={() => setConfirmDelete(project.id)}
            onCancelDelete={() => setConfirmDelete(null)}
            onRemove={() => {
              onRemove(project.id)
              setConfirmDelete(null)
            }}
            onRequestEdit={() => setEditingProjectId(project.id)}
            onCancelEdit={() => setEditingProjectId(null)}
            onSaveEdit={(name) => {
              onRename(project.id, name)
              setEditingProjectId(null)
            }}
          />
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Steg 8: Send `onRenameProject` gjennom `ProjectsPanel.tsx`**

Erstatt hele innholdet i `src/components/time-tracker/ProjectsPanel.tsx` med:

```typescript
import type { Project, TimeEntry } from '../../types'
import { ProjectsList } from '../ProjectsList'
import { styles } from './timeTrackerStyles'

interface Props {
  projects: Project[]
  activeEntry: TimeEntry | null
  onAddProject: (name: string) => void
  onRemoveProject: (id: string) => void
  onRenameProject: (id: string, name: string) => void
  onStartTimer: (projectId: string) => void
  onStopTimer: () => void
}

export function ProjectsPanel({
  projects,
  activeEntry,
  onAddProject,
  onRemoveProject,
  onRenameProject,
  onStartTimer,
  onStopTimer,
}: Props) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Prosjekter</h2>
          <p style={styles.sectionDescription}>Velg hvor du skal føre tid, og start direkte.</p>
        </div>
        <span style={styles.sectionMeta}>{projects.length} totalt</span>
      </div>
      <ProjectsList
        projects={projects}
        onAdd={onAddProject}
        onRemove={onRemoveProject}
        onRename={onRenameProject}
        activeEntry={activeEntry}
        onStart={onStartTimer}
        onStop={onStopTimer}
      />
    </section>
  )
}
```

- [ ] **Steg 9: Koble `renameProject` til `ProjectsPanel` i `TimeTracker.tsx`**

Åpne `src/components/TimeTracker.tsx`. I `ProjectsPanel`-blokken (linje 78-87), legg til `onRenameProject` rett etter `onRemoveProject`:

```typescript
  } else if (tracker.activePanel === 'projects') {
    panel = (
      <ProjectsPanel
        projects={tracker.projects}
        activeEntry={tracker.activeEntry}
        onAddProject={(name) => void tracker.addProject(name)}
        onRemoveProject={(id) => void tracker.removeProject(id)}
        onRenameProject={(id, name) => void tracker.renameProject(id, name)}
        onStartTimer={(projectId) => void tracker.startTimer(projectId)}
        onStopTimer={() => void tracker.handleStopTimer()}
      />
    )
```

- [ ] **Steg 10: Bygg for å sjekke typer**

Kjør: `npm run build`
Forventet: bygger uten feil.

- [ ] **Steg 11: Manuell verifisering**

Kjør: `npm run dev`, åpne appen i nettleseren, gå til Prosjekter-fanen.

1. Klikk blyant-ikonet ved et prosjektnavn → tekstfelt med gjeldende navn vises, forhåndsutfylt og fokusert.
2. Endre navnet, klikk «Lagre» → navnet oppdateres i lista umiddelbart.
3. Last siden på nytt (F5) → det nye navnet er fortsatt der (bekrefter at det er lagret i Supabase).
4. Klikk blyant-ikonet igjen, endre teksten, klikk «Avbryt» → navnet er uendret.
5. Klikk blyant-ikonet, tøm feltet helt, klikk «Lagre» → ingenting endres (tomt navn lagres ikke), redigeringsmodus lukkes.

- [ ] **Steg 12: Commit**

```bash
git add src/components/projects-list/ProjectCard.tsx src/components/projects-list/projectsListStyles.ts src/components/ProjectsList.tsx src/components/time-tracker/ProjectsPanel.tsx src/components/TimeTracker.tsx
git commit -m "feat: allow renaming a project inline in the projects list"
```

---

## Task 2: Datonavigering i Oppsummering-fanen

**Files:**
- Modify: `src/components/DailySummary.tsx`
- Modify: `src/components/time-tracker/SummaryPanel.tsx`
- Modify: `src/components/TimeTracker.tsx`

**Interfaces:**
- Consumes: `shiftDate(dateString: string, days: number): string` og `toDateString(date: Date): string` fra `src/components/time-utils.ts` (finnes allerede).
- Consumes: `styles.dateControls`, `styles.dateToolbar`, `styles.dateInput`, `styles.dateHelper`, `styles.secondaryActionWide` fra `timeTrackerStyles` (finnes allerede, brukt av `LogPanel.tsx`).
- Produces: `SummaryPanel` props `selectedDate: string`, `isToday: boolean`, `onDateChange: (value: string) => void`.
- Produces: `DailySummary` prop `isToday: boolean`.

- [ ] **Steg 1: Legg `isToday`-bevisst tekst til i `DailySummary.tsx`**

Åpne `src/components/DailySummary.tsx`. Oppdater `Props`-interfacet (linje 4-7) til:

```typescript
interface Props {
  entries: TimeEntry[]
  projects: Project[]
  isToday: boolean
}
```

Oppdater funksjonssignaturen (linje 9) til:

```typescript
export function DailySummary({ entries, projects, isToday }: Props) {
```

Erstatt tomt-state-blokken (linje 33-39):

```typescript
  if (totalMinutes === 0) {
    return (
      <p style={{ color: '#94a3b8', margin: 0 }}>
        {isToday ? 'Ingen fullførte timer i dag ennå.' : 'Ingen fullførte timer denne dagen.'}
      </p>
    )
  }
```

Erstatt totalsummen (linje 43-45):

```typescript
      <div style={styles.total}>
        <strong>{isToday ? 'Totalt i dag:' : 'Totalt denne dagen:'}</strong> {formatHours(totalMinutes)}
      </div>
```

- [ ] **Steg 2: Legg til dato-kontroller i `SummaryPanel.tsx`**

Erstatt hele innholdet i `src/components/time-tracker/SummaryPanel.tsx` med:

```typescript
import { CalendarDays, Clock3 } from 'lucide-react'
import type { Project, TimeEntry } from '../../types'
import { DailySummary } from '../DailySummary'
import { formatHours, shiftDate, toDateString } from '../time-utils'
import { styles } from './timeTrackerStyles'

interface Props {
  entries: TimeEntry[]
  projects: Project[]
  totalCompletedMinutes: number
  selectedDate: string
  isToday: boolean
  onDateChange: (value: string) => void
}

export function SummaryPanel({
  entries,
  projects,
  totalCompletedMinutes,
  selectedDate,
  isToday,
  onDateChange,
}: Props) {
  const today = toDateString(new Date())

  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Oppsummering</h2>
          <p style={styles.sectionDescription}>Se hvordan tiden fordeler seg på prosjekter.</p>
        </div>
        <span style={styles.sectionMeta}>{formatHours(totalCompletedMinutes)}</span>
      </div>

      <div className="tracker-toolbar" style={styles.dateControls}>
        <button type="button" onClick={() => onDateChange(shiftDate(selectedDate, -1))} style={styles.secondaryActionWide}>
          <CalendarDays size={16} />
          <span>Forrige dag</span>
        </button>
        {!isToday && (
          <button type="button" onClick={() => onDateChange(today)} style={styles.secondaryActionWide}>
            <Clock3 size={16} />
            <span>I dag</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onDateChange(shiftDate(selectedDate, 1))}
          disabled={selectedDate >= today}
          style={styles.secondaryActionWide}
        >
          <CalendarDays size={16} />
          <span>Neste dag</span>
        </button>
      </div>

      <div className="tracker-toolbar" style={styles.dateToolbar}>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
          style={styles.dateInput}
        />
        <span style={styles.dateHelper}>
          {isToday ? 'Viser oppsummering for i dag.' : 'Viser oppsummering for valgt dato.'}
        </span>
      </div>

      <DailySummary entries={entries} projects={projects} isToday={isToday} />
    </section>
  )
}
```

- [ ] **Steg 3: Koble `selectedDate`/`isToday`/`onDateChange` til `SummaryPanel` i `TimeTracker.tsx`**

Åpne `src/components/TimeTracker.tsx`. Erstatt den innledende `SummaryPanel`-blokken (linje 50-56):

```typescript
  let panel = (
    <SummaryPanel
      entries={tracker.entries}
      projects={tracker.projects}
      totalCompletedMinutes={totalCompletedMinutes}
      selectedDate={tracker.selectedDate}
      isToday={isToday}
      onDateChange={tracker.setSelectedDate}
    />
  )
```

- [ ] **Steg 4: Bygg for å sjekke typer**

Kjør: `npm run build`
Forventet: bygger uten feil.

- [ ] **Steg 5: Manuell verifisering**

Kjør: `npm run dev`, åpne appen, gå til Oppsummering-fanen (chart-ikonet).

1. Klikk «Forrige dag» → dato-velgeren viser gårsdagens dato, og oppsummeringen oppdateres (viser evt. «Ingen fullførte timer denne dagen.»).
2. Bytt til Timer-fanen → samme (gårsdagens) dato er valgt der også, som bekrefter delt state.
3. Fra Timer-fanen, klikk «I dag» → bytt tilbake til Oppsummering-fanen → dagens dato og data vises igjen.
4. På Oppsummering-fanen, med dagens dato valgt, sjekk at «Neste dag»-knappen er deaktivert (kan ikke bla frem i tid).
5. Bruk datovelgeren direkte i Oppsummering til å hoppe til en dato for en uke siden → riktig historikk vises.

- [ ] **Steg 6: Commit**

```bash
git add src/components/DailySummary.tsx src/components/time-tracker/SummaryPanel.tsx src/components/TimeTracker.tsx
git commit -m "feat: add date navigation to the Oppsummering panel"
```

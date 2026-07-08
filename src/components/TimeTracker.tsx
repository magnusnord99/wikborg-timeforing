import { useEffect } from 'react'
import {
  formatDigitalDuration,
  getMinutesBetween,
  getSecondsBetween,
  toDateString,
} from './time-utils'
import { createTrackerNavItems } from './time-tracker/createTrackerNavItems'
import { FocusPanel } from './time-tracker/FocusPanel'
import { LogPanel } from './time-tracker/LogPanel'
import { ProjectsPanel } from './time-tracker/ProjectsPanel'
import { SummaryPanel } from './time-tracker/SummaryPanel'
import { TrackerHeader } from './time-tracker/TrackerHeader'
import { TrackerNotice } from './time-tracker/TrackerNotice'
import { TrackerRail } from './time-tracker/TrackerRail'
import { styles } from './time-tracker/timeTrackerStyles'
import { useTimeTrackerData } from './time-tracker/useTimeTrackerData'

export function TimeTracker() {
  const tracker = useTimeTrackerData()
  const completedEntries = tracker.entries.filter((entry) => entry.end_time)
  const totalCompletedMinutes = completedEntries.reduce(
    (sum, entry) => sum + getMinutesBetween(entry.start_time, entry.end_time!),
    0,
  )
  const activeProject = tracker.projects.find((project) => project.id === tracker.activeEntry?.project_id) ?? null
  const isToday = tracker.selectedDate === toDateString(new Date())
  const activeSeconds = tracker.activeEntry
    ? getSecondsBetween(tracker.activeEntry.start_time, new Date(tracker.now).toISOString())
    : 0
  const activeDurationLabel = formatDigitalDuration(activeSeconds)

  useEffect(() => {
    if (tracker.activeEntry) {
      const projectLabel = activeProject?.name ? ` ${activeProject.name}` : ''
      document.title = `● ${activeDurationLabel}${projectLabel} | Wikborg Tidsføring`
      return
    }

    document.title = 'Wikborg Tidsføring'
  }, [activeDurationLabel, activeProject?.name, tracker.activeEntry])

  const navItems = createTrackerNavItems({
    hasActiveEntry: !!tracker.activeEntry,
    projectCount: tracker.projects.length,
    entryCount: tracker.entries.length,
    totalCompletedMinutes,
  })

  let panel = (
    <SummaryPanel
      entries={tracker.entries}
      projects={tracker.projects}
      totalCompletedMinutes={totalCompletedMinutes}
    />
  )

  if (tracker.activePanel === 'focus') {
    panel = (
      <FocusPanel
        projects={tracker.projects}
        activeEntry={tracker.activeEntry}
        activeProject={activeProject}
        activeDurationLabel={activeDurationLabel}
        totalCompletedMinutes={totalCompletedMinutes}
        entriesCount={tracker.entries.length}
        completedEntriesCount={completedEntries.length}
        sessionNote={tracker.sessionNote}
        onSessionNoteChange={tracker.setSessionNote}
        onSaveSessionNote={() => void tracker.saveSessionNote()}
        onStartTimer={(id) => void tracker.startTimer(id)}
        onStopTimer={() => void tracker.handleStopTimer()}
        onOpenLog={() => tracker.setActivePanel('log')}
        onOpenSummary={() => tracker.setActivePanel('summary')}
      />
    )
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
  } else if (tracker.activePanel === 'log') {
    panel = (
      <LogPanel
        entries={tracker.entries}
        projects={tracker.projects}
        activeEntry={tracker.activeEntry}
        selectedDate={tracker.selectedDate}
        isToday={isToday}
        loading={tracker.loading}
        now={tracker.now}
        onDateChange={tracker.setSelectedDate}
        onEditEntry={(id, updates) => void tracker.updateEntry(id, updates)}
        onDeleteEntry={(id) => void tracker.deleteEntry(id)}
        viewMode={tracker.viewMode}
        onViewModeChange={tracker.setViewMode}
        selectedWeek={tracker.selectedWeek}
        selectedMonth={tracker.selectedMonth}
        rangeEntries={tracker.rangeEntries}
        rangeLoading={tracker.rangeLoading}
        onDayClick={tracker.handleDayClick}
        onWeekNav={tracker.handleWeekNav}
        onMonthNav={tracker.handleMonthNav}
      />
    )
  }

  return (
    <div className="tracker-shell" style={styles.layout}>
      <div className="tracker-layout" style={styles.workspace}>
        <TrackerRail
          activePanel={tracker.activePanel}
          activeEntry={!!tracker.activeEntry}
          navItems={navItems}
          onSelect={tracker.setActivePanel}
        />
        <div className="tracker-content-stack" style={styles.contentStack}>
          <TrackerHeader
            activeEntry={!!tracker.activeEntry}
            isToday={isToday}
            selectedDate={tracker.selectedDate}
            activeDurationLabel={activeDurationLabel}
          />
          {tracker.notice && <TrackerNotice notice={tracker.notice} onDismiss={() => tracker.setNotice(null)} />}
          {panel}
        </div>
      </div>
    </div>
  )
}

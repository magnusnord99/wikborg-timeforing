import { Clock3, LogOut, MessageSquarePlus } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FeedbackModal } from '../FeedbackModal'
import type { PanelId, TrackerNavItem } from './types'
import { styles } from './timeTrackerStyles'

interface Props {
  activePanel: PanelId
  activeEntry: boolean
  navItems: TrackerNavItem[]
  onSelect: (panelId: PanelId) => void
}

export function TrackerRail({ activePanel, activeEntry, navItems, onSelect }: Props) {
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <>
      <aside className="tracker-rail" style={styles.rail}>
        <div className="tracker-rail-top" style={styles.railTop}>
          <div style={styles.brandMark} title="Wikborg Tidsforing">
            <Clock3 size={18} />
          </div>
        </div>

        <nav className="tracker-nav" style={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePanel === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={isActive ? 'tracker-nav-button tracker-nav-button--active' : 'tracker-nav-button'}
                style={styles.navButton}
                aria-label={item.label}
                title={`${item.label}: ${item.meta}`}
              >
                <span style={styles.navIconWrap}>
                  <Icon size={18} />
                  {item.id === 'focus' && activeEntry && <span style={styles.liveDot} />}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="tracker-rail-footer" style={styles.railFooter}>
          <button
            type="button"
            onClick={() => setShowFeedback(true)}
            style={styles.logoutRail}
            aria-label="Send tilbakemelding"
            title="Send tilbakemelding"
          >
            <MessageSquarePlus size={16} />
          </button>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            style={styles.logoutRail}
            aria-label="Logg ut"
            title="Logg ut"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </>
  )
}
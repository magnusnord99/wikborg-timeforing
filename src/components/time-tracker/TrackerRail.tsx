import { Clock3, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { PanelId, TrackerNavItem } from './types'
import { styles } from './timeTrackerStyles'

interface Props {
  activePanel: PanelId
  activeEntry: boolean
  navItems: TrackerNavItem[]
  onSelect: (panelId: PanelId) => void
}

export function TrackerRail({ activePanel, activeEntry, navItems, onSelect }: Props) {
  return (
    <aside className="tracker-rail" style={styles.rail}>
      <div style={styles.railTop}>
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

      <div style={styles.railFooter}>
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
  )
}
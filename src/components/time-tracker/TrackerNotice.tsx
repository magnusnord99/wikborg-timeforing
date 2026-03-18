import { BellRing } from 'lucide-react'
import type { TrackerNotice as TrackerNoticeState } from './types'
import { styles } from './timeTrackerStyles'

interface Props {
  notice: TrackerNoticeState
  onDismiss: () => void
}

export function TrackerNotice({ notice, onDismiss }: Props) {
  return (
    <div
      style={{
        ...styles.notice,
        ...(notice.type === 'error' ? styles.noticeError : styles.noticeInfo),
      }}
    >
      <div style={styles.noticeContent}>
        <BellRing size={16} />
        <span>{notice.text}</span>
      </div>
      <button type="button" onClick={onDismiss} style={styles.noticeDismiss}>
        Lukk
      </button>
    </div>
  )
}
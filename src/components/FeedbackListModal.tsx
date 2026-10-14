import { useEffect, useState } from 'react'
import { Bug, Check, Lightbulb, Trash2, Undo2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Props {
  onClose: () => void
}

interface FeedbackRow {
  id: string
  type: 'bug' | 'feature'
  title: string
  description: string | null
  created_at: string
  resolved: boolean
}

export function FeedbackListModal({ onClose }: Props) {
  const [rows, setRows] = useState<FeedbackRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [showResolved, setShowResolved] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      const { data, error: err } = await supabase
        .from('feedback')
        .select('id, type, title, description, created_at, resolved')
        .order('created_at', { ascending: false })

      if (!active) return
      if (err) {
        setError('Kunne ikke hente tilbakemeldinger.')
      } else {
        setRows(data ?? [])
      }
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  async function toggleResolved(row: FeedbackRow) {
    const resolved = !row.resolved
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, resolved } : r)))
    const { error: err } = await supabase.from('feedback').update({ resolved }).eq('id', row.id)
    if (err) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, resolved: row.resolved } : r)))
    }
  }

  async function handleDelete(id: string) {
    setConfirmDeleteId(null)
    const previous = rows
    setRows((prev) => prev.filter((r) => r.id !== id))
    const { error: err } = await supabase.from('feedback').delete().eq('id', id)
    if (err) {
      setRows(previous)
    }
  }

  const open = rows.filter((r) => !r.resolved)
  const resolved = rows.filter((r) => r.resolved)

  function renderRow(row: FeedbackRow) {
    const Icon = row.type === 'bug' ? Bug : Lightbulb
    const isConfirming = confirmDeleteId === row.id

    return (
      <li key={row.id} style={styles.row}>
        <span style={row.type === 'bug' ? styles.typeIconDanger : styles.typeIcon}>
          <Icon size={15} />
        </span>
        <div style={styles.rowBody}>
          <p style={styles.rowTitle}>{row.title}</p>
          {row.description && <p style={styles.rowDescription}>{row.description}</p>}
          <span style={styles.rowDate}>
            {new Date(row.created_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div style={styles.rowActions}>
          <button
            type="button"
            onClick={() => toggleResolved(row)}
            style={styles.iconButton}
            aria-label={row.resolved ? 'Gjenåpne' : 'Marker som løst'}
            title={row.resolved ? 'Gjenåpne' : 'Marker som løst'}
          >
            {row.resolved ? <Undo2 size={15} /> : <Check size={15} />}
          </button>
          {isConfirming ? (
            <button
              type="button"
              onClick={() => handleDelete(row.id)}
              style={styles.confirmDeleteButton}
              onBlur={() => setConfirmDeleteId(null)}
            >
              Slett?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDeleteId(row.id)}
              style={styles.iconButton}
              aria-label="Slett"
              title="Slett"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </li>
    )
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} role="dialog" aria-modal="true">
        <div style={styles.header}>
          <h2 style={styles.title}>Tilbakemeldinger</h2>
          <button onClick={onClose} style={styles.closeButton} aria-label="Lukk">
            <X size={18} />
          </button>
        </div>

        {loading && <p style={styles.helperText}>Laster...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!loading && !error && (
          <div style={styles.body}>
            {open.length === 0 ? (
              <p style={styles.helperText}>Ingen åpne tilbakemeldinger.</p>
            ) : (
              <ul style={styles.list}>{open.map(renderRow)}</ul>
            )}

            {resolved.length > 0 && (
              <div style={styles.resolvedSection}>
                <button type="button" onClick={() => setShowResolved((v) => !v)} style={styles.resolvedToggle}>
                  {showResolved ? 'Skjul løste' : `Vis løste (${resolved.length})`}
                </button>
                {showResolved && <ul style={styles.list}>{resolved.map(renderRow)}</ul>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(2, 6, 23, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-elevated-border)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 560,
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-soft)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
  },
  closeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
  },
  body: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  helperText: {
    margin: 0,
    fontSize: 14,
    color: 'var(--color-text-muted)',
  },
  error: {
    margin: 0,
    fontSize: 13,
    color: '#fca5a5',
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  row: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
  },
  typeIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 8,
    background: 'var(--color-accent-soft)',
    color: '#bfdbfe',
    flexShrink: 0,
  },
  typeIconDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 8,
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#fca5a5',
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  rowTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
  },
  rowDescription: {
    margin: 0,
    fontSize: 13,
    color: 'var(--color-text-muted)',
  },
  rowDate: {
    fontSize: 12,
    color: 'var(--color-text-muted)',
  },
  rowActions: {
    display: 'flex',
    gap: 6,
    flexShrink: 0,
  },
  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
  },
  confirmDeleteButton: {
    padding: '0 10px',
    height: 30,
    borderRadius: 8,
    border: '1px solid rgba(239, 68, 68, 0.4)',
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  resolvedSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingTop: 8,
    borderTop: '1px solid var(--color-border)',
  },
  resolvedToggle: {
    alignSelf: 'flex-start',
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-muted)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
  },
}

import { useState } from 'react'
import { X, Bug, Lightbulb, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Props {
  onClose: () => void
}

type FeedbackType = 'bug' | 'feature'

export function FeedbackModal({ onClose }: Props) {
  const [type, setType] = useState<FeedbackType>('feature')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Ikke innlogget.')
      setLoading(false)
      return
    }

    const { error: err } = await supabase.from('feedback').insert({
      user_id: user.id,
      type,
      title: title.trim(),
      description: description.trim() || null,
    })

    setLoading(false)
    if (err) {
      setError('Noe gikk galt. Prøv igjen.')
      return
    }
    setSubmitted(true)
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} role="dialog" aria-modal="true">
        <div style={styles.header}>
          <h2 style={styles.title}>Send tilbakemelding</h2>
          <button onClick={onClose} style={styles.closeButton} aria-label="Lukk">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={styles.successState}>
            <span style={styles.successIcon}>✓</span>
            <p style={styles.successText}>Takk! Tilbakemeldingen er sendt.</p>
            <button onClick={onClose} style={styles.submitButton}>
              Lukk
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.typeToggle}>
              <button
                type="button"
                onClick={() => setType('feature')}
                style={type === 'feature' ? { ...styles.typeBtn, ...styles.typeBtnActive } : styles.typeBtn}
              >
                <Lightbulb size={15} />
                <span>Forslag</span>
              </button>
              <button
                type="button"
                onClick={() => setType('bug')}
                style={type === 'bug' ? { ...styles.typeBtn, ...styles.typeBtnActiveDanger } : styles.typeBtn}
              >
                <Bug size={15} />
                <span>Feil</span>
              </button>
            </div>

            <label style={styles.label}>
              <span style={styles.labelText}>Tittel *</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === 'bug' ? 'Hva skjer som ikke skal skje?' : 'Hva ønsker du deg?'}
                required
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              <span style={styles.labelText}>Beskrivelse</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Legg til mer detaljer her (valgfritt)"
                rows={4}
                style={styles.textarea}
              />
            </label>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" disabled={loading || !title.trim()} style={styles.submitButton}>
              <Send size={15} />
              <span>{loading ? 'Sender...' : 'Send inn'}</span>
            </button>
          </form>
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
    maxWidth: 440,
    boxShadow: 'var(--shadow-soft)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  typeToggle: {
    display: 'flex',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 16px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    fontWeight: 500,
  },
  typeBtnActive: {
    background: 'var(--color-accent-soft)',
    borderColor: 'rgba(96, 165, 250, 0.4)',
    color: '#bfdbfe',
  },
  typeBtnActiveDanger: {
    background: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  labelText: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
  },
  input: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    fontSize: 14,
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    fontSize: 14,
    resize: 'vertical',
  },
  error: {
    margin: 0,
    fontSize: 13,
    color: '#fca5a5',
  },
  submitButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 16px',
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-accent)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14,
  },
  successState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '16px 0',
  },
  successIcon: {
    fontSize: 40,
    color: 'var(--color-success)',
  },
  successText: {
    margin: 0,
    color: 'var(--color-text-muted)',
    fontSize: 15,
  },
}

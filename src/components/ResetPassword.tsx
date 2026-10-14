import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function ResetPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passordene er ikke like.' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setMessage({ type: 'success', text: 'Passordet er oppdatert.' })
      setTimeout(onDone, 1000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Noe gikk galt',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Wikborg Tidsføring</h1>
        <p style={styles.subtitle}>Velg nytt passord</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            placeholder="Nytt passord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            autoComplete="new-password"
            minLength={6}
          />
          <input
            type="password"
            placeholder="Bekreft nytt passord"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
            autoComplete="new-password"
            minLength={6}
          />
          {message && (
            <p
              style={{
                ...styles.message,
                color: message.type === 'error' ? '#f87171' : '#34d399',
              }}
            >
              {message.text}
            </p>
          )}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Venter...' : 'Oppdater passord'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    background: 'var(--color-panel-strong)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    boxShadow: 'var(--shadow-soft)',
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'center',
  },
  subtitle: {
    margin: '8px 0 24px',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    fontSize: 14,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    fontSize: 16,
  },
  message: {
    margin: 0,
    fontSize: 14,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    border: 'none',
    background: 'var(--color-accent)',
    color: 'white',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
}

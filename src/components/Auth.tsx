import { useState } from 'react'
import { supabase } from '../lib/supabase'

type AuthMode = 'login' | 'signup' | 'forgot'

export function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<AuthMode>('login')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage({ type: 'success', text: 'Sjekk e-posten din for å bekrefte kontoen.' })
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Sjekk e-posten din for lenke til å tilbakestille passordet.' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
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
        <p style={styles.subtitle}>
          {mode === 'login' && 'Logg inn for å fortsette'}
          {mode === 'signup' && 'Opprett konto'}
          {mode === 'forgot' && 'Tilbakestill passord'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            autoComplete="email"
          />
          {mode !== 'forgot' && (
            <input
              type="password"
              placeholder="Passord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
            />
          )}
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
            {loading
              ? 'Venter...'
              : mode === 'login'
                ? 'Logg inn'
                : mode === 'signup'
                  ? 'Opprett konto'
                  : 'Send lenke'}
          </button>
        </form>

        {mode === 'login' && (
          <button
            type="button"
            onClick={() => {
              setMode('forgot')
              setMessage(null)
            }}
            style={styles.forgot}
          >
            Glemt passord?
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signup' ? 'login' : mode === 'forgot' ? 'login' : 'signup')
            setMessage(null)
          }}
          style={styles.switch}
        >
          {mode === 'login' && 'Har du ikke konto? Registrer deg'}
          {mode === 'signup' && 'Har du konto? Logg inn'}
          {mode === 'forgot' && 'Tilbake til innlogging'}
        </button>
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
  switch: {
    marginTop: 24,
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    fontSize: 14,
    cursor: 'pointer',
    textDecoration: 'underline',
    width: '100%',
  },
  forgot: {
    marginTop: 16,
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    fontSize: 13,
    cursor: 'pointer',
    textDecoration: 'underline',
    width: '100%',
  },
}

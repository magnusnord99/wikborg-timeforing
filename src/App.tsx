import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import { Auth } from './components/Auth'
import { TimeTracker } from './components/TimeTracker'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => subscription.unsubscribe()
  }, [])

  if (!isSupabaseConfigured()) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
      }}>
        <h1 style={{ marginBottom: 16 }}>Wikborg Tidsføring</h1>
        <p style={{ color: '#94a3b8', maxWidth: 400 }}>
          Kopier <code>.env.example</code> til <code>.env</code> og fyll inn
          Supabase URL og anon key fra prosjektet ditt.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Laster...</p>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return <TimeTracker />
}

export default App

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState<{email:string, role:string} | null>(null)

  useEffect(() => {
    fetch('http://localhost:4000/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data || null))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold">Alahad Bank</div>
          <nav className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-blue-600">Login</Link>
            <Link to="/register" className="text-sm text-blue-600">Register</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm text-blue-600">Admin</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/settings" className="text-sm text-blue-600">Settings</Link>
            )}
            <Link to="/privacy" className="text-sm text-slate-600">Privacy</Link>
            <Link to="/terms" className="text-sm text-slate-600">Terms</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Welcome to Alahad Bank</h1>
            <p className="text-slate-600 mb-6">Secure, modern demo banking portal with consent-based identity verification.</p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/login')} className="px-4 py-2 rounded bg-blue-600 text-white">Sign In</button>
              <button onClick={() => navigate('/register')} className="px-4 py-2 rounded border border-slate-300">Create Account</button>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold mb-2">Privacy-first selfie verification</h2>
            <p className="text-sm text-slate-600">We request camera access only with your explicit consent and store images securely for demonstration.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

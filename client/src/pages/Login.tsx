import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [otp, setOtp] = useState('')
  const [phase, setPhase] = useState<'login'|'otp'>('login')

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    const data = await res.json()
    if (!res.ok) return setMessage(data.error || 'Login failed')
    setUserId(data.userId)
    setMessage(`Demo OTP (for testing): ${data.otp}`)
    setPhase('otp')
  }

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    const res = await fetch('http://localhost:4000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code: otp }),
      credentials: 'include',
    })
    if (!res.ok) {
      const data = await res.json()
      return setMessage(data.error || 'OTP invalid')
    }
    navigate('/selfie')
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
      {message && <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-amber-800 text-sm">{message}</div>}
      {phase === 'login' ? (
        <form onSubmit={submitLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="w-full rounded border px-3 py-2" />
          </div>
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">Continue</button>
        </form>
      ) : (
        <form onSubmit={submitOtp} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Enter OTP</label>
            <input value={otp} onChange={e=>setOtp(e.target.value)} required className="w-full rounded border px-3 py-2 tracking-widest" />
          </div>
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">Verify</button>
        </form>
      )}
    </div>
  )
}


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [asAdmin, setAsAdmin] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const res = await fetch('http://localhost:4000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, admin: asAdmin }),
    })
    const data = await res.json()
    if (!res.ok) return setMessage(data.error || 'Registration failed')
    navigate('/login')
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="text-2xl font-semibold mb-6">Create account</h1>
      {message && <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-800 text-sm">{message}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="w-full rounded border px-3 py-2" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={asAdmin} onChange={e=>setAsAdmin(e.target.checked)} /> Register as admin (demo)</label>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">Create</button>
      </form>
    </div>
  )
}


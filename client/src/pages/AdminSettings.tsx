import { useEffect, useState } from 'react'

export default function AdminSettings() {
  const [retentionDays, setRetentionDays] = useState<number>(30)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:4000/api/admin/settings', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setRetentionDays(d.retentionDays))
  }, [])

  const save = async () => {
    setMessage(null)
    const res = await fetch('http://localhost:4000/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ retentionDays }),
      credentials: 'include',
    })
    if (!res.ok) {
      const d = await res.json()
      setMessage(d.error ? 'Invalid value' : 'Save failed')
      return
    }
    setMessage('Saved')
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="text-2xl font-semibold mb-6">Admin Settings</h1>
      {message && <div className="mb-4 rounded border border-emerald-300 bg-emerald-50 p-3 text-emerald-800 text-sm">{message}</div>}
      <label className="block text-sm mb-1">Selfie retention (days)</label>
      <input type="number" min={1} max={365} value={retentionDays} onChange={e=>setRetentionDays(Number(e.target.value))} className="w-full rounded border px-3 py-2 mb-4" />
      <button onClick={save} className="rounded bg-blue-600 px-4 py-2 text-white">Save</button>
    </div>
  )
}


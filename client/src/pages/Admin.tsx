import { useEffect, useState } from 'react'

type Row = { id:number; file_path:string; created_at:string; user_email:string }

export default function Admin() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:4000/api/admin/selfies', { credentials: 'include' })
      .then(async r => {
        if (!r.ok) throw new Error('Forbidden')
        return r.json()
      })
      .then(data => setRows(data.rows))
      .catch(e => setError(e.message))
  }, [])

  return (
    <div className="mx-auto max-w-5xl py-12">
      <h1 className="text-2xl font-semibold mb-6">Admin - Selfies</h1>
      {error && <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-800 text-sm">{error}</div>}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {rows.map(r => (
          <div key={r.id} className="rounded border bg-white p-3">
            <img src={`http://localhost:4000/${r.file_path}`} className="w-full rounded" />
            <div className="mt-2 text-sm text-slate-600">{r.user_email}</div>
            <div className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


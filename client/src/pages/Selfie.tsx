import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Selfie() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [consented, setConsented] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play()
      }
    } catch (e) {
      setStatus('Camera permission was denied.')
    }
  }

  const captureAndUpload = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const w = 640, h = 480
    canvasRef.current.width = w
    canvasRef.current.height = h
    const ctx = canvasRef.current.getContext('2d')!
    ctx.drawImage(videoRef.current, 0, 0, w, h)
    const blob: Blob = await new Promise(resolve => canvasRef.current!.toBlob(b => resolve(b!), 'image/jpeg', 0.92)!)
    const form = new FormData()
    form.append('selfie', blob, 'selfie.jpg')
    const res = await fetch('http://localhost:4000/api/selfie/consented', { method: 'POST', body: form, credentials: 'include' })
    const data = await res.json()
    if (!res.ok) return setStatus(data.error || 'Upload failed')
    setStatus('Selfie uploaded successfully. Redirecting to dashboard...')
    setTimeout(() => navigate('/'), 1200)
  }

  if (!consented) {
    return (
      <div className="mx-auto max-w-md py-12">
        <h1 className="text-2xl font-semibold mb-4">Selfie verification</h1>
        <p className="text-sm text-slate-600 mb-6">We will request access to your camera to capture a single image for identity verification. By proceeding, you consent to capture and storage for this demo.</p>
        <div className="flex gap-3">
          <button onClick={() => { setConsented(true); startCamera() }} className="rounded bg-blue-600 px-4 py-2 text-white">I consent</button>
          <button onClick={() => navigate('/')} className="rounded border px-4 py-2">Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <h1 className="text-2xl font-semibold mb-4">Capture selfie</h1>
      {status && <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-amber-800 text-sm">{status}</div>}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <video ref={videoRef} className="w-full rounded border bg-black aspect-video" />
        <div>
          <button onClick={captureAndUpload} className="rounded bg-blue-600 px-4 py-2 text-white">Capture & Upload</button>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  )
}


import { useEffect, useState } from 'react'

export default function Toast({ message }: { message: string }) {
  const [show, setShow] = useState(true)
  useEffect(() => { const t = setTimeout(() => setShow(false), 2000); return () => clearTimeout(t) }, [])
  if (!show) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-lg border border-amber-400 text-amber-100 animate-pop">
      {message}
    </div>
  )
}


import { useState } from 'react'

export default function Chest({ label, onOpen }: { label: string, onOpen: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="chest w-64 h-44 m-4 shadow-deep" onClick={() => { setOpen(true); onOpen() }}>
      <div className="absolute inset-0 p-3">
        <div className="chest-lid absolute left-2 right-2 top-2 h-1/2 rounded-t-lg transition-transform duration-300" style={{ transform: open ? 'rotateX(60deg)' : 'rotateX(0deg)' }} />
        <div className="absolute left-2 right-2 bottom-2 top-1/2 rounded-b-lg flex items-center justify-center">
          <div className="brass-bevel px-3 py-1 rounded text-sm tracking-wide">{label}</div>
        </div>
      </div>
      <div className={`absolute inset-0 pointer-events-none ${open ? 'animate-shimmer' : ''}`}></div>
    </div>
  )
}


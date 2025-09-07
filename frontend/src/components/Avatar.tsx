function hashStr(s: string) {
  let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0 }
  return Math.abs(h)
}

export default function Avatar({ email, size = 72 }: { email: string, size?: number }) {
  const initials = (email?.[0] || 'U').toUpperCase()
  const h = hashStr(email || 'user')
  const colors = [
    ['#7b5cff', '#3ad1ff'],
    ['#ff7b00', '#ffd27d'],
    ['#2aa84a', '#9be15d'],
    ['#ff3b7f', '#ff99c8'],
    ['#00b2ff', '#7ef9ff'],
    ['#f2b705', '#ffd27d']
  ]
  const [c1, c2] = colors[h % colors.length]
  const ring = `conic-gradient(from 0deg, ${c1}, ${c2})`

  return (
    <div style={{ width: size, height: size, background: ring }} className="rounded-full p-[3px] shadow-deep">
      <div className="rounded-full flex items-center justify-center" style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg,#1b1428,#0f0a18)'}}>
        <span className="text-xl font-black text-amber-100 drop-shadow">{initials}</span>
      </div>
    </div>
  )
}


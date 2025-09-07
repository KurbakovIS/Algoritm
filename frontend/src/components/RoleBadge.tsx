export default function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    intern: 'from-green-600 to-green-800',
    junior: 'from-sky-600 to-sky-800',
    middle: 'from-indigo-600 to-indigo-800',
    senior: 'from-purple-700 to-purple-900',
    lead: 'from-amber-600 to-amber-800',
    'teamlead': 'from-amber-600 to-amber-800',
  }
  const g = colors[role] || 'from-stone-600 to-stone-800'
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-amber-100 bg-gradient-to-b ${g} shadow-bevel`}> {role} </span>
  )
}


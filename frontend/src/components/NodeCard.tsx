type Node = { id: number, title: string, description: string, checkpoint: boolean, resources: string[], parent_id?: number }

function typeBadge(node: Node) {
  const t = node.title || ''
  if (t.startsWith('Side:')) return <span className="text-xs px-2 py-1 rounded bg-pink-600/40">Side Quest</span>
  if (t.startsWith('Ветка:')) return <span className="text-xs px-2 py-1 rounded bg-sky-600/40">Branch</span>
  if (t.startsWith('Чекпоинт')) return <span className="glow-pulse text-xs px-2 py-1 rounded bg-tavern-brass/40">Checkpoint</span>
  return null
}

export default function NodeCard({ node, onOpen }: { node: Node, onOpen: () => void }) {
  return (
    <div onClick={onOpen} className="card-3d p-4 w-72 shadow-bevel hover:shadow-deep cursor-pointer animate-pop">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-lg text-amber-200 drop-shadow">{node.title}</h3>
        {typeBadge(node)}
      </div>
      <p className="text-sm text-amber-100/90 mt-2">{node.description}</p>
      <div className="mt-3 text-xs text-amber-100/70">Ресурсы: {node.resources.length}</div>
    </div>
  )
}

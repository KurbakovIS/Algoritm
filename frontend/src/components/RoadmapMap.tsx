import NodeCard from './NodeCard'

type Node = { id: number, title: string, description: string, checkpoint: boolean, resources: string[], parent_id?: number }

export default function RoadmapMap({ nodes, onOpen }: { nodes: Node[], onOpen: (id: number) => void }) {
  // Simple layered layout: roots on top, children below
  const roots = nodes.filter(n => !n.parent_id)
  const children = nodes.filter(n => n.parent_id)
  return (
    <div className="relative w-full">
      <div className="flex flex-wrap gap-6 justify-center mb-8">
        {roots.map(n => (<NodeCard key={n.id} node={n} onOpen={() => onOpen(n.id)} />))}
      </div>
      <div className="flex flex-wrap gap-6 justify-center">
        {children.map(n => (<NodeCard key={n.id} node={n} onOpen={() => onOpen(n.id)} />))}
      </div>
    </div>
  )
}


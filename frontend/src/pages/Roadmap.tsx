import { useEffect, useState } from 'react'
import { Roadmap } from '../api'
import RoadmapMap from '../components/RoadmapMap'

type Node = { id: number, title: string, description: string, checkpoint: boolean, resources: string[], parent_id?: number }

export default function RoadmapPage({ direction, onOpen }: { direction: string, onOpen: (id: number) => void }) {
  const [nodes, setNodes] = useState<Node[]>([])
  useEffect(() => { (async () => setNodes(await Roadmap.byDirection(direction)))() }, [direction])
  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h2 className="text-2xl font-extrabold text-amber-200 mb-4">Путь: {direction}</h2>
      <div className="wood-panel p-4 rounded-xl">
        <RoadmapMap nodes={nodes} onOpen={onOpen} />
      </div>
    </div>
  )
}


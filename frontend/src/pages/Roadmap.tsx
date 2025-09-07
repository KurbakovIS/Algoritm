import { useEffect, useState } from 'react'
import { Roadmap } from '../api'
import RoadmapMap from '../components/RoadmapMap'

type Node = { id: number, title: string, description: string, checkpoint: boolean, resources: string[], parent_id?: number, direction: string }

export default function RoadmapPage({ direction, onOpen }: { direction: string, onOpen: (id: number) => void }) {
  const [nodes, setNodes] = useState<Node[]>([])
  useEffect(() => { (async () => setNodes(await Roadmap.byDirection(direction)))() }, [direction])
  return (
    <div className="max-w-7xl mx-auto">
      <div className="modern-card p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          {direction === 'career' ? 'Карьерный Роадмап' : `Путь: ${direction}`}
        </h2>
        <p className="text-gray-600 text-center text-lg">
          Следуйте по пути от начинающего разработчика до эксперта
        </p>
      </div>
      <RoadmapMap nodes={nodes} onOpen={onOpen} />
    </div>
  )
}

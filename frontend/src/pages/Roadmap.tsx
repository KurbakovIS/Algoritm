import { useEffect, useState } from 'react'
import { Roadmap } from '../api'
import RoadmapMap from '../components/RoadmapMap'

type Node = { id: number, title: string, description: string, checkpoint: boolean, resources: string[], parent_id?: number, direction: string }

export default function RoadmapPage({ direction, onOpen }: { direction: string, onOpen: (id: number) => void }) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => { (async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await Roadmap.byDirection(direction)
      setNodes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки роадмапа')
    } finally {
      setLoading(false)
    }
  })() }, [direction])
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="modern-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Загрузка роадмапа...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="modern-card p-8 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Ошибка загрузки</h2>
          <p className="text-white mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="modern-btn px-4 py-2"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

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

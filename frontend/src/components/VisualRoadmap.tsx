import { useEffect, useState } from 'react'
import { Progress } from '../api'

type Node = { 
  id: number
  title: string
  description: string
  checkpoint: boolean
  resources: string[]
  parent_id?: number
  direction: string
}

type NodeWithProgress = Node & {
  status: 'not_started' | 'in_progress' | 'completed'
  score: number
}

type RoadmapLevel = {
  level: number
  nodes: NodeWithProgress[]
}

export default function VisualRoadmap({ nodes, onOpen }: { nodes: Node[], onOpen: (id: number) => void }) {
  const [nodesWithProgress, setNodesWithProgress] = useState<NodeWithProgress[]>([])
  const [levels, setLevels] = useState<RoadmapLevel[]>([])
  const [selectedNode, setSelectedNode] = useState<NodeWithProgress | null>(null)

  useEffect(() => {
    // Загружаем прогресс пользователя
    const loadProgress = async () => {
      try {
        const progress = await Progress.mine()
        const progressMap = new Map(progress.map((p: any) => [p.node_id, p]))
        
        const nodesWithStatus = nodes.map(node => ({
          ...node,
          status: progressMap.get(node.id)?.status || 'not_started',
          score: progressMap.get(node.id)?.score || 0
        }))
        
        setNodesWithProgress(nodesWithStatus)
        buildLevels(nodesWithStatus)
      } catch (error) {
        console.error('Failed to load progress:', error)
        // Если не удалось загрузить прогресс, показываем без него
        const nodesWithStatus = nodes.map(node => ({
          ...node,
          status: 'not_started' as const,
          score: 0
        }))
        setNodesWithProgress(nodesWithStatus)
        buildLevels(nodesWithStatus)
      }
    }

    loadProgress()
  }, [nodes])

  const buildLevels = (nodes: NodeWithProgress[]) => {
    const levelMap = new Map<number, NodeWithProgress[]>()
    
    // Сначала добавляем корневые узлы (без parent_id)
    const roots = nodes.filter(n => !n.parent_id)
    levelMap.set(0, roots)
    
    // Затем строим уровни на основе иерархии
    let currentLevel = 0
    let hasMoreLevels = true
    
    while (hasMoreLevels) {
      const currentLevelNodes = levelMap.get(currentLevel) || []
      const nextLevelNodes: NodeWithProgress[] = []
      
      currentLevelNodes.forEach(node => {
        const children = nodes.filter(n => n.parent_id === node.id)
        nextLevelNodes.push(...children)
      })
      
      if (nextLevelNodes.length > 0) {
        levelMap.set(currentLevel + 1, nextLevelNodes)
        currentLevel++
      } else {
        hasMoreLevels = false
      }
    }
    
    const levelsArray = Array.from(levelMap.entries()).map(([level, nodes]) => ({
      level,
      nodes
    }))
    
    setLevels(levelsArray)
  }

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-yellow-500'
      default: return 'bg-gray-600'
    }
  }

  const getNodeStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓'
      case 'in_progress': return '⏳'
      default: return '○'
    }
  }

  const getCheckpointStyle = (isCheckpoint: boolean) => {
    if (isCheckpoint) {
      return 'ring-2 ring-amber-400 ring-opacity-50 glow-pulse'
    }
    return ''
  }

  return (
    <div className="relative w-full min-h-screen">
      {/* Legend */}
      <div className="modern-card p-6 mb-8">
        <div className="flex justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400"></div>
            <span className="text-white">Не начато</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-white">В процессе</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-white">Завершено</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500 ring-2 ring-purple-300"></div>
            <span className="text-white">Чекпоинт</span>
          </div>
        </div>
      </div>

      {/* Уровни роадмапа */}
      <div className="space-y-16">
        {levels.map((level, levelIndex) => (
          <div key={level.level} className="relative flex flex-col items-center">
            {/* Вертикальная линия */}
            {levelIndex < levels.length - 1 && (
              <div className="absolute top-full left-1/2 w-0.5 h-16 bg-amber-600/30 transform -translate-x-1/2"></div>
            )}
            
            {/* Заголовок уровня */}
            <div className="text-center mb-8">
              <div className="inline-block px-6 py-2 rounded-full bg-amber-900/50 border border-amber-700/50">
                <span className="text-amber-200 font-bold">
                  {level.level === 0 ? 'Основы' : 
                   level.level === 1 ? 'Продвинутый уровень' :
                   level.level === 2 ? 'Экспертный уровень' :
                   `Уровень ${level.level + 1}`}
                </span>
              </div>
            </div>

            {/* Узлы уровня */}
            <div className="flex flex-col items-center space-y-8">
              {level.nodes.map((node, nodeIndex) => (
                <div key={node.id} className="relative flex flex-col items-center">
                  {/* Соединительная линия */}
                  {nodeIndex < level.nodes.length - 1 && (
                    <div className="absolute top-full left-1/2 w-0.5 h-8 bg-amber-600/40 transform -translate-x-1/2"></div>
                  )}
                  
                  {/* Чекпоинт */}
                  <div 
                    className={`
                      relative group cursor-pointer transition-all duration-300 hover:scale-110
                      ${getCheckpointStyle(node.checkpoint)}
                    `}
                    onClick={() => setSelectedNode(node)}
                  >
                    {/* Статус индикатор */}
                    <div className={`
                      absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold
                      ${getNodeStatusColor(node.status)}
                      shadow-lg
                    `}>
                      {getNodeStatusIcon(node.status)}
                    </div>

                    {/* Круг чекпоинта */}
                    <div className="w-20 h-20 rounded-full bg-slate-700 border-4 border-amber-500 flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                      <div className="text-center text-white font-bold text-sm px-2">
                        {node.title.split(' ').slice(0, 2).join(' ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal для деталей */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedNode(null)}>
          <div className="modern-card p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-4">{selectedNode.title}</h3>
            <p className="text-white mb-6 leading-relaxed">{selectedNode.description}</p>
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-2">Ресурсы:</h4>
              <ul className="list-disc list-inside text-white space-y-1">
                {selectedNode.resources.map((resource, index) => (
                  <li key={index}>{resource}</li>
                ))}
              </ul>
            </div>
            <button 
              className="modern-btn w-full py-3 text-lg"
              onClick={() => { setSelectedNode(null); onOpen(selectedNode.id); }}
            >
              Открыть урок
            </button>
          </div>
        </div>
      )}

      {/* Статистика */}
      <div className="mt-16">
        <div className="modern-card p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Ваш прогресс</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {nodesWithProgress.filter(n => n.status === 'completed').length}
              </div>
              <div className="text-sm text-white">Завершено</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {nodesWithProgress.filter(n => n.status === 'in_progress').length}
              </div>
              <div className="text-sm text-white">В процессе</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400 mb-2">
                {nodesWithProgress.filter(n => n.status === 'not_started').length}
              </div>
              <div className="text-sm text-white">Не начато</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {nodesWithProgress.reduce((sum, n) => sum + n.score, 0)}
              </div>
              <div className="text-sm text-white">Всего очков</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
            <span className="text-gray-700">Не начато</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-gray-700">В процессе</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-700">Завершено</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500 ring-2 ring-purple-300"></div>
            <span className="text-gray-700">Чекпоинт</span>
          </div>
        </div>
      </div>

      {/* Уровни роадмапа */}
      <div className="space-y-16">
        {levels.map((level, levelIndex) => (
          <div key={level.level} className="relative">
            {/* Линия уровня */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent transform -translate-y-1/2"></div>
            
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
            <div className="flex flex-wrap justify-center gap-6">
              {level.nodes.map((node, nodeIndex) => (
                <div key={node.id} className="relative">
                  {/* Соединительная линия к родителю */}
                  {node.parent_id && (
                    <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-amber-600/40 transform -translate-x-1/2"></div>
                  )}
                  
                  {/* Узел */}
                  <div 
                    className={`
                      relative group cursor-pointer transition-all duration-300 hover:scale-105
                      ${getCheckpointStyle(node.checkpoint)}
                    `}
                    onClick={() => onOpen(node.id)}
                  >
                    {/* Статус индикатор */}
                    <div className={`
                      absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold
                      ${getNodeStatusColor(node.status)}
                      shadow-lg
                    `}>
                      {getNodeStatusIcon(node.status)}
                    </div>

                    {/* Карточка узла */}
                    <div className="modern-card w-72 p-6 group-hover:shadow-xl transition-all duration-300">
                      {/* Заголовок */}
                      <h3 className="font-bold text-lg text-gray-800 mb-3 group-hover:text-gray-900 transition-colors">
                        {node.title}
                      </h3>
                      
                      {/* Описание */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {node.description}
                      </p>
                      
                      {/* Ресурсы и очки */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>Ресурсы: {node.resources.length}</span>
                        {node.score > 0 && (
                          <span className="text-purple-600 font-medium">Очки: {node.score}</span>
                        )}
                      </div>
                      
                      {/* Прогресс бар для в процессе */}
                      {node.status === 'in_progress' && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Статистика */}
      <div className="mt-16">
        <div className="modern-card p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Ваш прогресс</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {nodesWithProgress.filter(n => n.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Завершено</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {nodesWithProgress.filter(n => n.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-600">В процессе</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400 mb-2">
                {nodesWithProgress.filter(n => n.status === 'not_started').length}
              </div>
              <div className="text-sm text-gray-600">Не начато</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {nodesWithProgress.reduce((sum, n) => sum + n.score, 0)}
              </div>
              <div className="text-sm text-gray-600">Всего очков</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

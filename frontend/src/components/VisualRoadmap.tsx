import React, { useEffect, useMemo, useState } from 'react';
import { Progress, Roadmap } from '../api';

// --- Types ---
type Node = {
  id: number;
  title: string;
  description: string;
  checkpoint: boolean;
  resources: string[];
  direction: string;
  children: Node[];
};

type NodeWithProgress = Omit<Node, 'children'> & {
  children: NodeWithProgress[];
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
};

type PositionedNode = NodeWithProgress & {
  x: number;
  y: number;
  isLocked: boolean;
};

// --- Helper --- 
const getAdventureIcon = (node: Node) => {
  if (node.checkpoint) return '🏆';
  if (node.direction.toLowerCase().includes('backend')) return '⚙️';
  if (node.direction.toLowerCase().includes('frontend')) return '🎨';
  return '📚';
};

// --- Component ---
export default function VisualRoadmap({ onOpen, direction }: { onOpen: (id: number) => void, direction?: string }) {
  const [nodes, setNodes] = useState<NodeWithProgress[]>([]);
  const [selectedNode, setSelectedNode] = useState<PositionedNode | null>(null);

  // Data Fetching
  useEffect(() => {
    const loadData = async () => {
      try {
        let roadmapData;
        if (direction) {
          // Загружаем только узлы для конкретного направления
          roadmapData = await Roadmap.byDirection(direction);
        } else {
          // Загружаем все узлы
          roadmapData = await Roadmap.getTree();
        }
        
        const progress = await Progress.mine();
        const progressMap = new Map(progress.map((p: any) => [p.node_id, p]));

        const enrichNodesWithProgress = (nodes: Node[]): NodeWithProgress[] => {
          return nodes.map(node => ({
            ...node,
            status: progressMap.get(node.id)?.status || 'not_started',
            score: progressMap.get(node.id)?.score || 0,
            children: enrichNodesWithProgress(node.children),
          }));
        };

        setNodes(enrichNodesWithProgress(roadmapData));

      } catch (error) {
        console.error('Failed to load roadmap data:', error);
      }
    };
    loadData();
  }, [direction]);

  // Positioning Logic - улучшенный алгоритм без наложений
  const positionedNodes = useMemo(() => {
    if (nodes.length === 0) return [];

    const positioned = new Map<number, PositionedNode>();
    const nodesToProcess: { node: NodeWithProgress; x: number; y: number; isLocked: boolean; level: number }[] = [];

    // Find root nodes (nodes that are not children of any other node)
    const allNodeIds = new Set<number>();
    const childNodeIds = new Set<number>();
    const traverse = (nodes: NodeWithProgress[]) => {
      nodes.forEach(n => {
        allNodeIds.add(n.id);
        n.children.forEach(c => childNodeIds.add(c.id));
        traverse(n.children);
      });
    }
    traverse(nodes);
    const rootIds = [...allNodeIds].filter(id => !childNodeIds.has(id));
    const nodeMap = new Map<number, NodeWithProgress>();
    const buildMap = (nodes: NodeWithProgress[]) => nodes.forEach(n => { nodeMap.set(n.id, n); buildMap(n.children); });
    buildMap(nodes);
    const roots = rootIds.map(id => nodeMap.get(id)!).filter(Boolean);

    // Размещаем корневые узлы горизонтально
    roots.forEach((root, index) => {
      nodesToProcess.push({ node: root, x: (index - (roots.length - 1) / 2) * 300, y: 100, isLocked: false, level: 0 });
    });

    const visited = new Set<number>();
    const levelPositions = new Map<number, number[]>(); // Отслеживаем позиции на каждом уровне

    while (nodesToProcess.length > 0) {
      const { node, x, y, isLocked, level } = nodesToProcess.shift()!;
      if (visited.has(node.id)) continue;
      visited.add(node.id);

      // Проверяем наложения и корректируем позицию
      let finalX = x;
      let finalY = y;
      
      if (!levelPositions.has(level)) {
        levelPositions.set(level, []);
      }
      
      const existingPositions = levelPositions.get(level)!;
      const minDistance = 120; // Минимальное расстояние между узлами
      
      // Ищем свободную позицию
      let attempts = 0;
      while (attempts < 10) {
        const tooClose = existingPositions.some(pos => Math.abs(pos - finalX) < minDistance);
        if (!tooClose) break;
        finalX += minDistance;
        attempts++;
      }
      
      existingPositions.push(finalX);
      levelPositions.set(level, existingPositions);

      positioned.set(node.id, { ...node, x: finalX, y: finalY, isLocked });

      const childIsLocked = isLocked || node.status !== 'completed';
      const nextLevel = level + 1;
      
      // Размещаем дочерние узлы вертикально вниз
      node.children.forEach((child, index) => {
        const childX = finalX + (index - (node.children.length - 1) / 2) * 150;
        const childY = finalY + 200; // Фиксированное расстояние вниз
        nodesToProcess.push({ node: child, x: childX, y: childY, isLocked: childIsLocked, level: nextLevel });
      });
    }

    return Array.from(positioned.values());
  }, [nodes]);

  const connections = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; isCompleted: boolean }[] = [];
    const nodesMap = new Map(positionedNodes.map(n => [n.id, n]));

    positionedNodes.forEach(node => {
      node.children.forEach(child => {
        if (nodesMap.has(child.id)) {
          const childNode = nodesMap.get(child.id)!;
          lines.push({
            x1: node.x,
            y1: node.y,
            x2: childNode.x,
            y2: childNode.y,
            isCompleted: node.status === 'completed' && !childNode.isLocked,
          });
        }
      });
    });
    return lines;
  }, [positionedNodes]);

  // --- Render ---
  // Адаптивные размеры карты без скролла
  const mapDimensions = useMemo(() => {
    if (positionedNodes.length === 0) return { width: '100%', height: '100%', offsetX: 0, offsetY: 0 };
    
    const xs = positionedNodes.map(n => n.x);
    const ys = positionedNodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    // Центрируем карту в контейнере
    const contentWidth = maxX - minX + 200;
    const contentHeight = maxY - minY + 200;
    
    return {
      width: '100%',
      height: '100%',
      offsetX: -minX + 100,
      offsetY: -minY + 100,
      contentWidth,
      contentHeight
    };
  }, [positionedNodes]);

  return (
    <div className="w-full h-[80vh] bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden p-4">
      <div
        className="relative transition-all duration-500 w-full h-full flex items-center justify-center"
        style={{ width: mapDimensions.width, height: mapDimensions.height }}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="path-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#fde047', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {connections.map((line, index) => (
            <line
              key={index}
              x1={`calc(50% + ${line.x1 + mapDimensions.offsetX}px)`}
              y1={`calc(50% + ${line.y1 + mapDimensions.offsetY}px)`}
              x2={`calc(50% + ${line.x2 + mapDimensions.offsetX}px)`}
              y2={`calc(50% + ${line.y2 + mapDimensions.offsetY}px)`}
              stroke={line.isCompleted ? "url(#path-gradient)" : "#4b5563"}
              strokeWidth="4"
              strokeDasharray={line.isCompleted ? "none" : "8 4"}
            />
          ))}
        </svg>

        {/* Nodes */}
        {positionedNodes.map(node => (
          <div
            key={node.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${!node.isLocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            style={{ 
              left: `calc(50% + ${node.x + mapDimensions.offsetX}px)`, 
              top: `calc(50% + ${node.y + mapDimensions.offsetY}px)` 
            }}
            onClick={() => !node.isLocked && setSelectedNode(node)}
          >
            <div className={`relative w-20 h-20 flex items-center justify-center rounded-full border-4 transition-all duration-300 ${node.isLocked ? 'border-gray-600 bg-gray-800' : 'border-amber-400 bg-slate-700 hover:bg-amber-500 hover:scale-110'}`}>
              <span className="text-3xl drop-shadow-lg">{node.isLocked ? '🔒' : getAdventureIcon(node)}</span>
              {node.status === 'completed' && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-slate-800">✓</div>
              )}
              {node.status === 'in_progress' && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-slate-800">⏳</div>
              )}
            </div>
            <div className="text-center mt-2 w-32 text-white text-sm font-semibold truncate">{node.title}</div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedNode(null)}>
          <div className="modern-card p-8 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{getAdventureIcon(selectedNode)}</div>
              <h3 className="text-3xl font-bold text-white mb-2">{selectedNode.title}</h3>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed text-lg">{selectedNode.description}</p>
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-amber-300 mb-3">Ресурсы:</h4>
              <ul className="list-none space-y-2">
                {selectedNode.resources.map((resource, index) => (
                  <li key={index} className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-3">
                    <span className="text-amber-400">⚡</span>
                    <span className="text-white">{resource}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <button 
                className="modern-btn px-8 py-4 text-xl font-bold"
                onClick={() => { setSelectedNode(null); onOpen(selectedNode.id); }}
              >
                Начать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

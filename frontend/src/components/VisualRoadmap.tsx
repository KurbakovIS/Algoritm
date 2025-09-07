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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  // Обработчики для зума и панорамирования
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, zoom * delta));
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

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

    // Размещаем корневые узлы горизонтально с адаптивным расстоянием
    const rootSpacing = Math.max(200, Math.min(300, 400 / Math.max(1, roots.length - 1)));
    roots.forEach((root, index) => {
      nodesToProcess.push({ node: root, x: (index - (roots.length - 1) / 2) * rootSpacing, y: 80, isLocked: false, level: 0 });
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
      const minDistance = Math.max(100, Math.min(150, 200 / Math.max(1, level))); // Адаптивное расстояние
      
      // Ищем свободную позицию
      let attempts = 0;
      while (attempts < 15) {
        const tooClose = existingPositions.some(pos => Math.abs(pos - finalX) < minDistance);
        if (!tooClose) break;
        finalX += minDistance * (attempts % 2 === 0 ? 1 : -1); // Чередуем направление
        attempts++;
      }
      
      existingPositions.push(finalX);
      levelPositions.set(level, existingPositions);

      positioned.set(node.id, { ...node, x: finalX, y: finalY, isLocked });

      const childIsLocked = isLocked || node.status !== 'completed';
      const nextLevel = level + 1;
      
ую то г      // Размещаем дочерние узлы вертикально вниз с адаптивным расстоянием
      const childSpacing = Math.max(120, Math.min(180, 250 / Math.max(1, node.children.length - 1)));
      const verticalSpacing = Math.max(150, Math.min(200, 300 / Math.max(1, level + 1)));
      node.children.forEach((child, index) => {
        const childX = finalX + (index - (node.children.length - 1) / 2) * childSpacing;
        const childY = finalY + verticalSpacing;
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
  // Адаптивные размеры карты с улучшенным центрированием
  const mapDimensions = useMemo(() => {
    if (positionedNodes.length === 0) return { width: '100%', height: '100%', offsetX: 0, offsetY: 0 };
    
    const xs = positionedNodes.map(n => n.x);
    const ys = positionedNodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    // Улучшенное центрирование с отступами
    const padding = 150; // Увеличенный отступ
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;
    
    return {
      width: '100%',
      height: '100%',
      offsetX: -minX + padding,
      offsetY: -minY + padding,
      contentWidth,
      contentHeight
    };
  }, [positionedNodes]);

  return (
    <div className="w-full min-h-[60vh] max-h-[90vh] bg-slate-800/50 rounded-2xl border border-slate-700 overflow-auto p-4 relative">
      {/* Кнопки управления */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setZoom(Math.min(3, zoom * 1.2))}
          className="glass px-3 py-2 text-white hover:bg-white/20 transition-colors rounded-lg text-sm"
        >
          +
        </button>
        <button
          onClick={() => setZoom(Math.max(0.3, zoom * 0.8))}
          className="glass px-3 py-2 text-white hover:bg-white/20 transition-colors rounded-lg text-sm"
        >
          -
        </button>
        <button
          onClick={resetView}
          className="glass px-3 py-2 text-white hover:bg-white/20 transition-colors rounded-lg text-sm"
        >
          ⌂
        </button>
      </div>
      
      <div
        className="relative transition-all duration-500 w-full h-full flex items-center justify-center"
        style={{ 
          width: mapDimensions.width, 
          height: mapDimensions.height,
          minHeight: '500px',
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transformOrigin: 'center center'
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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

import React, { useEffect, useState, useRef } from 'react';
import { Progress, Roadmap } from '../api';

// --- Types ---
type Node = {
  id: number;
  title: string;
  description: string;
  checkpoint: boolean;
  resources: string[];
  direction: string;
  parent_id?: number;
  children: Node[];
};

type NodeWithProgress = Omit<Node, 'children'> & {
  children: NodeWithProgress[];
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
};

// --- SVG Components ---
const QuestNode = ({ 
  x, 
  y, 
  status, 
  checkpoint, 
  nodeNumber, 
  isMainNode,
  onClick 
}: {
  x: number;
  y: number;
  status: string;
  checkpoint: boolean;
  nodeNumber: number;
  isMainNode: boolean;
  onClick: () => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981'; // green-500
      case 'in_progress': return '#f59e0b'; // amber-500
      default: return '#6b7280'; // gray-500
    }
  };

  const radius = isMainNode ? 35 : 25;
  const statusColor = getStatusColor(status);

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Shadow */}
      <circle
        cx={x + 3}
        cy={y + 3}
        r={radius}
        fill="rgba(0, 0, 0, 0.3)"
      />
      
      {/* Main circle with gradient */}
      <defs>
        <radialGradient id={`nodeGradient-${nodeNumber}`} cx="30%" cy="30%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="70%" stopColor={statusColor} />
          <stop offset="100%" stopColor="#8b4513" />
        </radialGradient>
      </defs>
      
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={`url(#nodeGradient-${nodeNumber})`}
        stroke="#ffd700"
        strokeWidth="4"
      />
      
      {/* Inner highlight */}
      <circle
        cx={x - radius/4}
        cy={y - radius/4}
        r={radius * 0.4}
        fill="rgba(255, 255, 255, 0.3)"
      />
      
      {/* Node number */}
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fontSize={isMainNode ? "18" : "14"}
        fontWeight="bold"
        fill="#000000"
        fontFamily="Arial"
      >
        {nodeNumber}
      </text>
      
      {/* Star rating */}
      {status === 'completed' && (
        <g>
          {[0, 1, 2].map(i => (
            <text
              key={i}
              x={x - 15 + i * 15}
              y={y - radius - 15}
              fontSize="16"
              fill="#ffd700"
            >
              ★
            </text>
          ))}
        </g>
      )}
      
      {status === 'in_progress' && (
        <g>
          {[0, 1].map(i => (
            <text
              key={i}
              x={x - 7.5 + i * 15}
              y={y - radius - 15}
              fontSize="16"
              fill="#ffd700"
            >
              ★
            </text>
          ))}
        </g>
      )}
      
      {/* Checkpoint gem */}
      {checkpoint && (
        <text
          x={x}
          y={y - radius - 35}
          textAnchor="middle"
          fontSize="20"
          fill="#00bfff"
        >
          💎
        </text>
      )}
    </g>
  );
};

const WindingPath = ({ points }: { points: { x: number; y: number }[] }) => {
  if (points.length < 2) return null;

  const pathData = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    return `${path} L ${point.x} ${point.y}`;
  }, '');

  return (
    <g>
      {/* Path shadow */}
      <path
        d={pathData}
        stroke="#6b5b47"
        strokeWidth="24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Main path */}
      <path
        d={pathData}
        stroke="#8b7355"
        strokeWidth="20"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Path texture */}
      <path
        d={pathData}
        stroke="#a67c52"
        strokeWidth="16"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="10,5"
        opacity="0.3"
      />
    </g>
  );
};

const ForestBackground = ({ width, height }: { width: number; height: number }) => {
  const trees = [];
  
  // Generate random trees
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 15 + 5;
    
    trees.push(
      <g key={i}>
        {/* Tree trunk */}
        <rect
          x={x - 2}
          y={y - size}
          width="4"
          height={size}
          fill="#4a2c17"
        />
        {/* Tree crown */}
        <circle
          cx={x}
          cy={y - size}
          r={size * 0.8}
          fill="#2d5016"
        />
      </g>
    );
  }
  
  return <g>{trees}</g>;
};

const TreasureChest = ({ x, y }: { x: number; y: number }) => (
  <g>
    {/* Chest shadow */}
    <rect
      x={x + 2}
      y={y + 2}
      width="30"
      height="20"
      fill="rgba(0, 0, 0, 0.3)"
      rx="3"
    />
    
    {/* Chest body */}
    <rect
      x={x}
      y={y}
      width="30"
      height="20"
      fill="#8b4513"
      stroke="#654321"
      strokeWidth="2"
      rx="3"
    />
    
    {/* Chest lid */}
    <rect
      x={x + 2}
      y={y - 5}
      width="26"
      height="8"
      fill="#a0522d"
      stroke="#654321"
      strokeWidth="1"
      rx="2"
    />
    
    {/* Gold inside */}
    <rect
      x={x + 5}
      y={y + 5}
      width="20"
      height="10"
      fill="#ffd700"
      opacity="0.8"
      rx="1"
    />
    
    {/* Lock */}
    <circle
      cx={x + 15}
      cy={y + 10}
      r="3"
      fill="#ffd700"
      stroke="#b8860b"
      strokeWidth="1"
    />
    
    {/* Treasure icon */}
    <text
      x={x + 15}
      y={y + 12}
      textAnchor="middle"
      fontSize="12"
      fill="#000000"
    >
      🏆
    </text>
  </g>
);

const FinishFlag = ({ x, y }: { x: number; y: number }) => (
  <g>
    {/* Flag shadow */}
    <rect
      x={x + 2}
      y={y + 2}
      width="3"
      height="40"
      fill="rgba(0, 0, 0, 0.3)"
    />
    
    {/* Flag pole */}
    <rect
      x={x}
      y={y}
      width="3"
      height="40"
      fill="#8b4513"
    />
    
    {/* Flag */}
    <rect
      x={x + 3}
      y={y - 30}
      width="20"
      height="15"
      fill="#ff0000"
      stroke="#cc0000"
      strokeWidth="1"
    />
    
    {/* Flag pattern */}
    <rect
      x={x + 5}
      y={y - 28}
      width="16"
      height="3"
      fill="#ffffff"
    />
    <rect
      x={x + 5}
      y={y - 22}
      width="16"
      height="3"
      fill="#ffffff"
    />
    
    {/* Finish icon */}
    <text
      x={x + 13}
      y={y - 20}
      textAnchor="middle"
      fontSize="10"
      fill="#000000"
    >
      🏁
    </text>
  </g>
);

// --- Main Component ---
export default function GameMapSVG({ onOpen, direction }: { onOpen: (id: number) => void, direction?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<NodeWithProgress[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Data Fetching
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        let roadmapData;
        if (direction) {
          roadmapData = await Roadmap.byDirection(direction);
        } else {
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

        const enrichedNodes = enrichNodesWithProgress(roadmapData);
        console.log('Loaded roadmap data:', roadmapData);
        console.log('Enriched nodes:', enrichedNodes);
        setNodes(enrichedNodes);
        
        // Load expanded nodes from localStorage
        const savedExpanded = localStorage.getItem('roadmap-expanded-nodes');
        if (savedExpanded) {
          setExpandedNodes(new Set(JSON.parse(savedExpanded)));
        }

      } catch (error) {
        console.error('Failed to load roadmap data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [direction]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle node expansion
  const toggleNodeExpansion = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
    localStorage.setItem('roadmap-expanded-nodes', JSON.stringify([...newExpanded]));
  };

  // Find root nodes
  const getRootNodes = (nodes: NodeWithProgress[]): NodeWithProgress[] => {
    return nodes.filter(node => !node.parent_id);
  };

  // Generate winding path points
  const generatePathPoints = (width: number, height: number) => {
    const points = [];
    const startX = 80;
    const startY = height / 2;
    const endX = width - 80;
    const endY = height / 2;
    
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = startX + (endX - startX) * t;
      const y = startY + Math.sin(t * Math.PI * 3) * 100 + Math.sin(t * Math.PI * 7) * 50;
      points.push({ x, y });
    }
    
    return points;
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Загрузка карты приключений...</p>
        </div>
      </div>
    );
  }

  const rootNodes = getRootNodes(nodes);
  if (rootNodes.length === 0) {
    return (
      <div className="w-full h-screen bg-slate-800 flex items-center justify-center">
        <p className="text-white text-xl">Нет данных для отображения</p>
      </div>
    );
  }

  // Flatten all nodes for sequential placement along path
  const allNodes: NodeWithProgress[] = [];
  const flattenNodes = (nodeList: NodeWithProgress[]) => {
    nodeList.forEach(node => {
      allNodes.push(node);
      if (expandedNodes.has(node.id)) {
        flattenNodes(node.children);
      }
    });
  };
  flattenNodes(rootNodes);

  const pathPoints = generatePathPoints(dimensions.width, dimensions.height);
  
  // Place nodes along the winding path
  const nodePositions: { node: NodeWithProgress, x: number, y: number, index: number }[] = [];
  allNodes.forEach((node, index) => {
    const t = index / Math.max(allNodes.length - 1, 1);
    const pathIndex = Math.floor(t * (pathPoints.length - 1));
    const nextPathIndex = Math.min(pathIndex + 1, pathPoints.length - 1);
    const localT = (t * (pathPoints.length - 1)) - pathIndex;
    
    const x = pathPoints[pathIndex].x + (pathPoints[nextPathIndex].x - pathPoints[pathIndex].x) * localT;
    const y = pathPoints[pathIndex].y + (pathPoints[nextPathIndex].y - pathPoints[pathIndex].y) * localT;
    
    nodePositions.push({ node, x, y, index });
  });

  return (
    <div ref={containerRef} className="w-full h-screen bg-slate-800 relative overflow-hidden">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-full"
      >
        {/* Parchment background */}
        <defs>
          <linearGradient id="parchmentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af8c" />
            <stop offset="30%" stopColor="#c9a96e" />
            <stop offset="70%" stopColor="#b8946f" />
            <stop offset="100%" stopColor="#a67c52" />
          </linearGradient>
        </defs>
        
        <rect
          width={dimensions.width}
          height={dimensions.height}
          fill="url(#parchmentGradient)"
        />
        
        {/* Forest background */}
        <ForestBackground width={dimensions.width} height={dimensions.height} />
        
        {/* Winding path */}
        <WindingPath points={pathPoints} />
        
        {/* Decorative elements */}
        <TreasureChest x={30} y={dimensions.height / 2 - 20} />
        <FinishFlag x={dimensions.width - 50} y={dimensions.height / 2 - 30} />
        
        {/* Quest nodes */}
        {nodePositions.map(({ node, x, y, index }) => (
          <QuestNode
            key={node.id}
            x={x}
            y={y}
            status={node.status}
            checkpoint={node.checkpoint}
            nodeNumber={index + 1}
            isMainNode={!node.parent_id}
            onClick={() => {
              if (node.children.length > 0) {
                toggleNodeExpansion(node.id);
              } else {
                setSelectedNode(node);
              }
            }}
          />
        ))}
      </svg>

      {/* Enhanced Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedNode(null)}>
          <div className="modern-card p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-3xl font-bold text-white mb-2">{selectedNode.title}</h3>
              <div className="flex justify-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedNode.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  selectedNode.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {selectedNode.status === 'completed' ? '✅ Завершено' :
                   selectedNode.status === 'in_progress' ? '⏳ В процессе' :
                   '🔒 Не начато'}
                </span>
                {selectedNode.checkpoint && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-500/20 text-amber-400">
                    🏆 Чекпоинт
                  </span>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-amber-300 mb-3">Описание квеста:</h4>
              <p className="text-white/80 leading-relaxed text-lg bg-slate-700/30 rounded-lg p-4">{selectedNode.description}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-amber-300 mb-3">📚 Материалы для изучения:</h4>
              <ul className="list-none space-y-3">
                {selectedNode.resources.map((resource, index) => (
                  <li key={index} className="flex items-start gap-3 bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
                    <span className="text-amber-400 text-xl mt-1">📖</span>
                    <div className="flex-1">
                      <span className="text-white block mb-1">{resource}</span>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(resource)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 text-sm underline"
                      >
                        🔍 Найти материалы
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-amber-300 mb-3">📊 Прогресс:</h4>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white">Очки опыта:</span>
                  <span className="text-amber-400 font-bold">{selectedNode.score} XP</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      selectedNode.status === 'completed' ? 'bg-green-500' :
                      selectedNode.status === 'in_progress' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: selectedNode.status === 'completed' ? '100%' : 
                             selectedNode.status === 'in_progress' ? '50%' : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button 
                className="modern-btn px-8 py-4 text-xl font-bold bg-green-600 hover:bg-green-700"
                onClick={() => { setSelectedNode(null); onOpen(selectedNode.id); }}
              >
                🚀 Начать квест
              </button>
              <button 
                className="modern-btn px-8 py-4 text-xl font-bold bg-slate-600 hover:bg-slate-700"
                onClick={() => setSelectedNode(null)}
              >
                ✕ Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

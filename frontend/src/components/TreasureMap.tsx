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

// --- Helper Functions ---
const getAdventureIcon = (node: Node) => {
  if (node.checkpoint) return '🏆';
  if (node.direction.toLowerCase().includes('backend')) return '⚙️';
  if (node.direction.toLowerCase().includes('frontend')) return '🎨';
  if (node.direction.toLowerCase().includes('devops')) return '🚀';
  if (node.direction.toLowerCase().includes('career')) return '💼';
  return '📚';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return '#10b981'; // green-500
    case 'in_progress': return '#f59e0b'; // amber-500
    default: return '#6b7280'; // gray-500
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return '✅';
    case 'in_progress': return '⏳';
    default: return '🔒';
  }
};

// --- Component ---
export default function TreasureMap({ onOpen, direction }: { onOpen: (id: number) => void, direction?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<NodeWithProgress[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

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

  // Draw treasure map
  useEffect(() => {
    if (!canvasRef.current || loading || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw parchment background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#d4af8c'); // parchment light
    gradient.addColorStop(0.3, '#c9a96e'); // parchment medium
    gradient.addColorStop(0.7, '#b8946f'); // parchment dark
    gradient.addColorStop(1, '#a67c52'); // parchment darker
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw forest background
    ctx.fillStyle = '#2d5016'; // dark green
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 15 + 5;
      
      // Draw tree trunk
      ctx.fillStyle = '#4a2c17'; // brown trunk
      ctx.fillRect(x - 2, y - size, 4, size);
      
      // Draw tree crown
      ctx.fillStyle = '#2d5016'; // dark green
      ctx.beginPath();
      ctx.arc(x, y - size, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw winding path
    ctx.strokeStyle = '#8b7355'; // path color
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Create winding path
    const pathPoints = [];
    const startX = 50;
    const startY = canvas.height / 2;
    const endX = canvas.width - 50;
    const endY = canvas.height / 2;
    
    // Generate winding path points
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = startX + (endX - startX) * t;
      const y = startY + Math.sin(t * Math.PI * 3) * 100 + Math.sin(t * Math.PI * 7) * 50;
      pathPoints.push({ x, y });
    }
    
    // Draw path
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) {
      ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx.stroke();
    
    // Draw path border
    ctx.strokeStyle = '#6b5b47'; // darker path border
    ctx.lineWidth = 24;
    ctx.stroke();
    
    // Redraw path on top
    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 20;
    ctx.stroke();

    // Draw decorative elements
    // Draw treasure chest at start
    ctx.fillStyle = '#8b4513'; // saddle brown
    ctx.fillRect(30, canvas.height / 2 - 20, 30, 20);
    ctx.fillStyle = '#ffd700'; // gold
    ctx.fillRect(35, canvas.height / 2 - 15, 20, 10);
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText('🏆', 45, canvas.height / 2 - 5);

    // Draw finish flag at end
    ctx.fillStyle = '#ff0000'; // red
    ctx.fillRect(canvas.width - 50, canvas.height / 2 - 30, 3, 40);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(canvas.width - 47, canvas.height / 2 - 30, 20, 15);
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.fillText('🏁', canvas.width - 37, canvas.height / 2 - 20);

    // Draw some decorative trees around the path
    ctx.fillStyle = '#2d5016'; // dark green
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 10 + 5;
      
      // Only draw if not too close to path
      let tooClose = false;
      for (const point of pathPoints) {
        if (Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2) < 50) {
          tooClose = true;
          break;
        }
      }
      
      if (!tooClose) {
        // Draw tree trunk
        ctx.fillStyle = '#4a2c17'; // brown trunk
        ctx.fillRect(x - 1, y - size, 2, size);
        
        // Draw tree crown
        ctx.fillStyle = '#2d5016'; // dark green
        ctx.beginPath();
        ctx.arc(x, y - size, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const rootNodes = getRootNodes(nodes);
    if (rootNodes.length === 0) return;

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

    // Draw nodes along the path
    nodePositions.forEach(({ node, x, y, index }) => {
      const isMainNode = !node.parent_id;
      const nodeRadius = isMainNode ? 35 : 25;
      const statusColor = getStatusColor(node.status);
      const adventureIcon = getAdventureIcon(node);
      const statusIcon = getStatusIcon(node.status);
      const hasChildren = node.children.length > 0;
      const isExpanded = expandedNodes.has(node.id);

      // Draw node shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(x + 3, y + 3, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw node circle with gradient
      const nodeGradient = ctx.createRadialGradient(x - nodeRadius/3, y - nodeRadius/3, 0, x, y, nodeRadius);
      nodeGradient.addColorStop(0, '#ffd700'); // gold
      nodeGradient.addColorStop(0.7, statusColor);
      nodeGradient.addColorStop(1, '#8b4513'); // saddle brown
      
      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#ffd700'; // gold
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw inner circle for depth
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(x - nodeRadius/4, y - nodeRadius/4, nodeRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Draw node number
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${isMainNode ? '18px' : '14px'} Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), x, y);

      // Draw star rating above node
      if (node.status === 'completed') {
        const starY = y - nodeRadius - 15;
        for (let i = 0; i < 3; i++) {
          const starX = x - 15 + i * 15;
          ctx.fillStyle = '#ffd700';
          ctx.font = '16px Arial';
          ctx.fillText('★', starX, starY);
        }
      } else if (node.status === 'in_progress') {
        const starY = y - nodeRadius - 15;
        for (let i = 0; i < 2; i++) {
          const starX = x - 7.5 + i * 15;
          ctx.fillStyle = '#ffd700';
          ctx.font = '16px Arial';
          ctx.fillText('★', starX, starY);
        }
      }

      // Draw special gem for checkpoints
      if (node.checkpoint) {
        const gemY = y - nodeRadius - 35;
        ctx.fillStyle = '#00bfff'; // deep sky blue
        ctx.font = '20px Arial';
        ctx.fillText('💎', x, gemY);
      }

      // Draw expansion indicator
      if (hasChildren) {
        const expandY = y + nodeRadius + 15;
        ctx.fillStyle = '#ffd700';
        ctx.font = '16px Arial';
        ctx.fillText(isExpanded ? '📂' : '📁', x, expandY);
      }
    });


    // Handle click events
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      // Check if click is on any node
      for (const { node, x, y } of nodePositions) {
        const isMainNode = !node.parent_id;
        const nodeRadius = isMainNode ? 35 : 25;
        const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
        
        if (distance <= nodeRadius) {
          if (node.children.length > 0) {
            toggleNodeExpansion(node.id);
          } else {
            setSelectedNode(node);
          }
          return;
        }
      }
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleClick);
    };
  }, [nodes, loading, expandedNodes]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Загрузка карты сокровищ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-800 relative overflow-hidden">
      {/* Canvas for treasure map */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        style={{ background: 'transparent' }}
      />

      {/* Enhanced Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedNode(null)}>
          <div className="modern-card p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{getAdventureIcon(selectedNode)}</div>
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
              <h4 className="text-xl font-semibold text-amber-300 mb-3">Описание задачи:</h4>
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
                🚀 Начать изучение
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

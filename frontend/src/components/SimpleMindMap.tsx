import React, { useEffect, useRef, useState } from 'react';
import MindMap from 'simple-mind-map';
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

// --- Helper --- 
const getAdventureIcon = (node: Node) => {
  if (node.checkpoint) return '🏆';
  if (node.direction.toLowerCase().includes('backend')) return '⚙️';
  if (node.direction.toLowerCase().includes('frontend')) return '🎨';
  return '📚';
};

// --- Component ---
export default function SimpleMindMap({ onOpen, direction }: { onOpen: (id: number) => void, direction?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mindMapRef = useRef<MindMap | null>(null);
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

  // Convert our data to SimpleMindMap format
  const convertToMindMapData = (nodes: NodeWithProgress[]): any => {
    console.log('Converting nodes to mindmap format:', nodes);
    
    if (nodes.length === 0) {
      console.log('No nodes found, showing loading message');
      return { data: { text: 'Загрузка...' }, children: [] };
    }

    // If we have nodes, use them directly (they should already be in tree format)
    // Find root nodes (nodes without parent_id or with parent_id = null)
    const rootNodes = nodes.filter(node => !node.parent_id);
    console.log('Root nodes found:', rootNodes);

    if (rootNodes.length === 0) {
      console.log('No root nodes found, showing no data message');
      return { data: { text: 'Нет данных' }, children: [] };
    }

    // Convert to SimpleMindMap format with expansion support
    const convertNode = (node: NodeWithProgress): any => {
      const statusIcon = node.status === 'completed' ? '✅' : 
                        node.status === 'in_progress' ? '⏳' : '🔒';
      const adventureIcon = getAdventureIcon(node);
      const isExpanded = expandedNodes.has(node.id);
      const hasChildren = node.children.length > 0;
      const expandIcon = hasChildren ? (isExpanded ? '📂' : '📁') : '';
      
      return {
        data: {
          text: `${adventureIcon} ${node.title} ${statusIcon} ${expandIcon}`,
          id: node.id,
          status: node.status,
          checkpoint: node.checkpoint,
          description: node.description,
          resources: node.resources,
          hasChildren: hasChildren,
          isExpanded: isExpanded
        },
        children: isExpanded ? node.children.map(convertNode) : []
      };
    };

    // If multiple roots, create a parent node
    if (rootNodes.length > 1) {
      return {
        data: { text: `🎯 ${direction || 'Роадмап'}` },
        children: rootNodes.map(convertNode)
      };
    }

    return convertNode(rootNodes[0]);
  };

  // Initialize MindMap
  useEffect(() => {
    if (!containerRef.current || loading) return;

    // Define custom theme
    MindMap.defineTheme('roadmap-theme', {
      backgroundColor: 'rgb(30, 41, 59)', // slate-800
      lineColor: 'rgb(251, 191, 36)', // amber-400
      lineWidth: 3,
      generalizationLineWidth: 3,
      generalizationLineColor: 'rgb(245, 158, 11)', // amber-500
      root: {
        fillColor: 'rgb(59, 130, 246)', // blue-500
        color: 'rgb(255, 255, 255)',
        borderColor: 'rgb(251, 191, 36)',
        borderWidth: 2,
        fontSize: 16,
        fontWeight: 'bold'
      },
      second: {
        fillColor: 'rgb(51, 65, 85)', // slate-700
        color: 'rgb(255, 255, 255)',
        borderColor: 'rgb(251, 191, 36)',
        borderWidth: 2,
        fontSize: 14,
        fontWeight: 'bold'
      },
      node: {
        fontSize: 12,
        color: 'rgb(226, 232, 240)', // slate-200
        fillColor: 'rgb(51, 65, 85)', // slate-700
        borderColor: 'rgb(100, 116, 139)', // slate-500
        borderWidth: 1
      },
      generalization: {
        fontSize: 14,
        fillColor: 'rgb(71, 85, 105)', // slate-600
        borderColor: 'rgb(100, 116, 139)',
        borderWidth: 1,
        color: 'rgb(226, 232, 240)'
      }
    });

    const mindMap = new MindMap({
      el: containerRef.current,
      data: convertToMindMapData(nodes),
      theme: 'roadmap-theme',
      themeConfig: {
        paddingX: 10,
        paddingY: 10,
        nodePadding: 8,
        // Reduce spacing for better fit
        levelDistance: 100, // Distance between levels
        siblingDistance: 80, // Distance between siblings
        nodeDistance: 60 // Distance between parent and child
      },
      // Fixed positioning for root node
      initialPosition: { x: 0, y: 50 }, // Root node at top with small offset
      rootPosition: 'top-center',
      // Auto-fit to screen
      fit: true, // Auto-fit the mindmap to container
      autoFit: true, // Enable auto-fitting
      // Disable editing and restrict interactions
      enableFreeDrag: false, // Disable dragging for read-only mode
      enableCtrlKeyNodeSelection: false, // Disable multi-selection
      enableNodeEdit: false, // Completely disable editing
      enableNodeAdd: false, // Disable adding new nodes
      enableNodeDelete: false, // Disable deleting nodes
      enableNodeDrag: false, // Disable node dragging
      enableNodeContextMenu: false, // Disable context menu
      enableKeyboard: false, // Disable keyboard shortcuts
      enableMousewheel: false, // Disable mousewheel zoom
      // Custom node content with click handlers
      customCreateNodeContent: (node: any) => {
        const nodeData = node.nodeData.data;
        if (!nodeData || !nodeData.id) return null;

        const el = document.createElement('div');
        el.style.cssText = `
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
          user-select: none;
        `;
        
        el.innerHTML = `
          <div style="text-align: center; color: white; font-size: 10px; line-height: 1.1; pointer-events: none; max-width: 120px; word-wrap: break-word;">
            ${nodeData.text}
          </div>
        `;

        // Add click handler with expansion support
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('Node clicked:', nodeData);
          
          const nodeWithProgress = findNodeById(nodes, nodeData.id);
          if (nodeWithProgress) {
            // If node has children, toggle expansion
            if (nodeData.hasChildren) {
              toggleNodeExpansion(nodeData.id);
            } else {
              // If no children, open modal
              setSelectedNode(nodeWithProgress);
            }
          }
        }); 

        // Add hover effects (read-only mode)
        el.addEventListener('mouseenter', () => {
          el.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          el.style.borderColor = 'rgb(251, 191, 36)';
          el.style.borderWidth = '2px';
        });

        el.addEventListener('mouseleave', () => {
          el.style.backgroundColor = 'transparent';
          el.style.borderColor = 'transparent';
          el.style.borderWidth = '0px';
        });

        return el;
      }
    });

    mindMapRef.current = mindMap;

    // Auto-fit the mindmap to screen after initialization
    setTimeout(() => {
      if (mindMapRef.current) {
        mindMapRef.current.view.fit();
      }
    }, 100);

    // Handle window resize for auto-fitting
    const handleResize = () => {
      if (mindMapRef.current) {
        setTimeout(() => {
          mindMapRef.current?.view.fit();
        }, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mindMapRef.current) {
        mindMapRef.current.destroy();
        mindMapRef.current = null;
      }
    };
  }, [nodes, loading, expandedNodes]);

  // Find node by ID helper
  const findNodeById = (nodes: NodeWithProgress[], id: number): NodeWithProgress | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] max-h-[90vh] bg-slate-800/50 rounded-2xl border border-slate-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Загрузка роадмапа...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-transparent overflow-hidden relative">
      {/* MindMap Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '500px' }}
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

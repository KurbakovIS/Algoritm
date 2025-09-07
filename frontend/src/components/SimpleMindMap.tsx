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

        setNodes(enrichNodesWithProgress(roadmapData));

      } catch (error) {
        console.error('Failed to load roadmap data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [direction]);

  // Convert our data to SimpleMindMap format
  const convertToMindMapData = (nodes: NodeWithProgress[]): any => {
    if (nodes.length === 0) return { data: { text: 'Загрузка...' }, children: [] };

    // Find root nodes
    const allNodeIds = new Set<number>();
    const childNodeIds = new Set<number>();
    const traverse = (nodes: NodeWithProgress[]) => {
      nodes.forEach(n => {
        allNodeIds.add(n.id);
        n.children.forEach(c => childNodeIds.add(c.id));
        traverse(n.children);
      });
    };
    traverse(nodes);
    const rootIds = [...allNodeIds].filter(id => !childNodeIds.has(id));
    const nodeMap = new Map<number, NodeWithProgress>();
    const buildMap = (nodes: NodeWithProgress[]) => nodes.forEach(n => { nodeMap.set(n.id, n); buildMap(n.children); });
    buildMap(nodes);
    const roots = rootIds.map(id => nodeMap.get(id)!).filter(Boolean);

    if (roots.length === 0) return { data: { text: 'Нет данных' }, children: [] };

    // Convert to SimpleMindMap format
    const convertNode = (node: NodeWithProgress): any => {
      const statusIcon = node.status === 'completed' ? '✅' : 
                        node.status === 'in_progress' ? '⏳' : '🔒';
      const adventureIcon = getAdventureIcon(node);
      
      return {
        data: {
          text: `${adventureIcon} ${node.title} ${statusIcon}`,
          id: node.id,
          status: node.status,
          checkpoint: node.checkpoint,
          description: node.description,
          resources: node.resources
        },
        children: node.children.map(convertNode)
      };
    };

    // If multiple roots, create a parent node
    if (roots.length > 1) {
      return {
        data: { text: `🎯 ${direction || 'Роадмап'}` },
        children: roots.map(convertNode)
      };
    }

    return convertNode(roots[0]);
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
        fontSize: 20,
        fontWeight: 'bold'
      },
      second: {
        fillColor: 'rgb(51, 65, 85)', // slate-700
        color: 'rgb(255, 255, 255)',
        borderColor: 'rgb(251, 191, 36)',
        borderWidth: 2,
        fontSize: 16,
        fontWeight: 'bold'
      },
      node: {
        fontSize: 14,
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
        paddingX: 20,
        paddingY: 20,
        nodePadding: 10
      },
      // Enable plugins
      enableFreeDrag: true,
      enableCtrlKeyNodeSelection: true,
      enableNodeEdit: false,
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
          <div style="text-align: center; color: white; font-size: 12px; line-height: 1.2; pointer-events: none;">
            ${nodeData.text}
          </div>
        `;

        // Add click handler
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('Node clicked:', nodeData);
          const nodeWithProgress = findNodeById(nodes, nodeData.id);
          if (nodeWithProgress) {
            console.log('Found node:', nodeWithProgress);
            setSelectedNode(nodeWithProgress);
          }
        }); 

        // Add hover effects
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.05)';
          el.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });

        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.backgroundColor = 'transparent';
        });

        return el;
      }
    });

    mindMapRef.current = mindMap;

    return () => {
      if (mindMapRef.current) {
        mindMapRef.current.destroy();
        mindMapRef.current = null;
      }
    };
  }, [nodes, loading]);

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
    <div className="w-full min-h-[60vh] max-h-[90vh] bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden relative">
      {/* MindMap Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />

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

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
export default function VisualRoadmap({ onOpen }: { onOpen: (id: number) => void }) {
  const [nodes, setNodes] = useState<NodeWithProgress[]>([]);
  const [selectedNode, setSelectedNode] = useState<PositionedNode | null>(null);

  // Data Fetching
  useEffect(() => {
    const loadData = async () => {
      try {
        const [roadmapTree, progress] = await Promise.all([Roadmap.getTree(), Progress.mine()]);
        
        const progressMap = new Map(progress.map((p: any) => [p.node_id, p]));

        const enrichNodesWithProgress = (nodes: Node[]): NodeWithProgress[] => {
          return nodes.map(node => ({
            ...node,
            status: progressMap.get(node.id)?.status || 'not_started',
            score: progressMap.get(node.id)?.score || 0,
            children: enrichNodesWithProgress(node.children),
          }));
        };

        setNodes(enrichNodesWithProgress(roadmapTree));

      } catch (error) {
        console.error('Failed to load roadmap data:', error);
      }
    };
    loadData();
  }, []);

  // Positioning Logic
  const positionedNodes = useMemo(() => {
    if (nodes.length === 0) return [];

    const positioned = new Map<number, PositionedNode>();
    const nodesToProcess: { node: NodeWithProgress; x: number; y: number; isLocked: boolean }[] = [];

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

    roots.forEach((root, index) => {
      nodesToProcess.push({ node: root, x: (index - (roots.length - 1) / 2) * 400, y: 50, isLocked: false });
    });

    const visited = new Set<number>();

    while (nodesToProcess.length > 0) {
      const { node, x, y, isLocked } = nodesToProcess.shift()!;
      if (visited.has(node.id)) continue;
      visited.add(node.id);

      positioned.set(node.id, { ...node, x, y, isLocked });

      const childIsLocked = isLocked || node.status !== 'completed';
      node.children.forEach((child, index) => {
        const angle = (index / (node.children.length -1) || 0) * Math.PI * 0.6 - Math.PI * 0.3;
        const newX = x + Math.sin(angle) * 250;
        const newY = y + Math.cos(angle) * 150;
        nodesToProcess.push({ node: child, x: newX, y: newY, isLocked: childIsLocked });
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
  // The rest of the component remains largely the same...
  const mapDimensions = useMemo(() => {
    if (positionedNodes.length === 0) return { width: 1200, height: 800, offsetX: 0, offsetY: 0 };
    const xs = positionedNodes.map(n => n.x);
    const ys = positionedNodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      width: maxX - minX + 300,
      height: maxY - minY + 200,
      offsetX: -minX + 150,
      offsetY: -minY + 100,
    };
  }, [positionedNodes]);

  return (
    <div className="w-full h-[80vh] bg-slate-800/50 rounded-2xl border border-slate-700 overflow-auto p-4">
      <div
        className="relative transition-all duration-500"
        style={{ width: mapDimensions.width, height: mapDimensions.height }}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full" style={{ transform: `translate(${mapDimensions.offsetX}px, ${mapDimensions.offsetY}px)` }}>
          <defs>
            <linearGradient id="path-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#fde047', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {connections.map((line, index) => (
            <line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
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
            style={{ left: node.x + mapDimensions.offsetX, top: node.y + mapDimensions.offsetY }}
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

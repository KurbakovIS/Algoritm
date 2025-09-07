import React, { useEffect, useMemo, useState } from 'react';
import { Progress } from '../api';

// Types
type Node = {
  id: number;
  title: string;
  description: string;
  checkpoint: boolean;
  resources: string[];
  parent_id?: number;
  direction: string;
};

type NodeWithProgress = Node & {
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
};

type PositionedNode = NodeWithProgress & {
  x: number;
  y: number;
  isLocked: boolean;
};

// Helper to get Adventure Icons
const getAdventureIcon = (node: Node) => {
  if (node.checkpoint) return '🏆'; // Trophy for checkpoints
  if (node.direction.toLowerCase().includes('backend')) return '⚙️'; // Gear for backend
  if (node.direction.toLowerCase().includes('frontend')) return '🎨'; // Palette for frontend
  return '📚'; // Book for general topics
};

export default function VisualRoadmap({ nodes, onOpen }: { nodes: Node[]; onOpen: (id: number) => void }) {
  const [nodesWithProgress, setNodesWithProgress] = useState<NodeWithProgress[]>([]);
  const [selectedNode, setSelectedNode] = useState<PositionedNode | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await Progress.mine();
        const progressMap = new Map(progress.map((p: any) => [p.node_id, p]));
        const nodesWithStatus = nodes.map((node) => ({
          ...node,
          status: progressMap.get(node.id)?.status || 'not_started',
          score: progressMap.get(node.id)?.score || 0,
        }));
        setNodesWithProgress(nodesWithStatus);
      } catch (error) {
        console.error('Failed to load progress:', error);
        const nodesWithStatus = nodes.map((node) => ({
          ...node,
          status: 'not_started' as const,
          score: 0,
        }));
        setNodesWithProgress(nodesWithStatus);
      }
    };
    if (nodes.length > 0) {
      loadProgress();
    }
  }, [nodes]);

  const positionedNodes = useMemo(() => {
    if (nodesWithProgress.length === 0) return [];

    const positioned = new Map<number, PositionedNode>();
    const nodesById = new Map(nodesWithProgress.map(n => [n.id, n]));

    const placeNode = (node: NodeWithProgress, x: number, y: number, isLocked: boolean) => {
      const positionedNode: PositionedNode = { ...node, x, y, isLocked };
      positioned.set(node.id, positionedNode);

      const children = nodesWithProgress.filter(n => n.parent_id === node.id);
      const childIsLocked = isLocked || node.status !== 'completed';
      
      children.forEach((child, index) => {
        // Spread children out
        const newX = x + (index % 2 === 0 ? -150 - (index * 20) : 150 + (index * 20));
        const newY = y + 120;
        if (!positioned.has(child.id)) {
          placeNode(child, newX, newY, childIsLocked);
        }
      });
    };

    const roots = nodesWithProgress.filter(n => !n.parent_id);
    roots.forEach((root, index) => {
      placeNode(root, (index - (roots.length - 1) / 2) * 300, 50, false);
    });

    return Array.from(positioned.values());
  }, [nodesWithProgress]);

  const connections = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; isCompleted: boolean }[] = [];
    const nodesMap = new Map(positionedNodes.map(n => [n.id, n]));

    positionedNodes.forEach(node => {
      if (node.parent_id && nodesMap.has(node.parent_id)) {
        const parent = nodesMap.get(node.parent_id)!;
        lines.push({
          x1: parent.x,
          y1: parent.y,
          x2: node.x,
          y2: node.y,
          isCompleted: parent.status === 'completed' && !node.isLocked
        });
      }
    });
    return lines;
  }, [positionedNodes]);

  const mapDimensions = useMemo(() => {
    if (positionedNodes.length === 0) return { width: 1200, height: 800 };
    const xs = positionedNodes.map(n => n.x);
    const ys = positionedNodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      width: maxX - minX + 300, // Add padding
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

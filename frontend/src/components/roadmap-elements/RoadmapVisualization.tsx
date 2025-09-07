import React, { useState, useEffect } from 'react';
import RoadmapNode from './RoadmapNode';
import NodeConnection from './NodeConnection';

interface Node {
  id: number;
  title: string;
  description: string;
  checkpoint: boolean;
  resources: string;
  direction: string;
  children: Node[];
}

interface RoadmapVisualizationProps {
  width: number;
  height: number;
  nodes: Node[];
  onNodeClick?: (node: Node) => void;
}

interface NodePosition {
  node: Node;
  x: number;
  y: number;
}

const RoadmapVisualization: React.FC<RoadmapVisualizationProps> = ({ 
  width, 
  height, 
  nodes, 
  onNodeClick 
}) => {
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);

  // Функция для размещения узлов
  const calculateNodePositions = (nodes: Node[], startX: number, startY: number): NodePosition[] => {
    const positions: NodePosition[] = [];
    const nodeSpacing = 200; // Расстояние между узлами
    const levelSpacing = 150; // Расстояние между уровнями
    
    let currentX = startX;
    let currentY = startY;
    
    // Размещаем корневые узлы горизонтально
    nodes.forEach((node, index) => {
      positions.push({
        node,
        x: currentX,
        y: currentY
      });
      
      // Размещаем дочерние узлы
      if (node.children.length > 0) {
        const childStartX = currentX - (node.children.length - 1) * nodeSpacing / 2;
        node.children.forEach((child, childIndex) => {
          positions.push({
            node: child,
            x: childStartX + childIndex * nodeSpacing,
            y: currentY + levelSpacing
          });
          
          // Размещаем внуков (если есть)
          if (child.children.length > 0) {
            const grandChildStartX = childStartX + childIndex * nodeSpacing - (child.children.length - 1) * nodeSpacing / 2;
            child.children.forEach((grandChild, grandChildIndex) => {
              positions.push({
                node: grandChild,
                x: grandChildStartX + grandChildIndex * nodeSpacing,
                y: currentY + levelSpacing * 2
              });
            });
          }
        });
      }
      
      currentX += nodeSpacing * 2; // Увеличиваем расстояние для следующего корневого узла
    });
    
    return positions;
  };

  useEffect(() => {
    const positions = calculateNodePositions(nodes, 150, 100);
    setNodePositions(positions);
  }, [nodes, width, height]);

  // Функция для получения позиции узла
  const getNodePosition = (nodeId: number): { x: number; y: number } | null => {
    const position = nodePositions.find(pos => pos.node.id === nodeId);
    return position ? { x: position.x, y: position.y } : null;
  };

  // Функция для получения всех связей
  const getConnections = () => {
    const connections: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    
    nodePositions.forEach(({ node, x, y }) => {
      node.children.forEach(child => {
        const childPos = getNodePosition(child.id);
        if (childPos) {
          connections.push({
            x1: x,
            y1: y + 30, // От нижней части родительского узла
            x2: childPos.x,
            y2: childPos.y - 30 // К верхней части дочернего узла
          });
        }
      });
    });
    
    return connections;
  };

  return (
    <g>
      {/* Связи между узлами */}
      {getConnections().map((connection, index) => (
        <NodeConnection
          key={index}
          x1={connection.x1}
          y1={connection.y1}
          x2={connection.x2}
          y2={connection.y2}
        />
      ))}
      
      {/* Узлы */}
      {nodePositions.map(({ node, x, y }) => (
        <RoadmapNode
          key={node.id}
          x={x}
          y={y}
          title={node.title}
          description={node.description}
          direction={node.direction}
          checkpoint={node.checkpoint}
          onClick={() => onNodeClick?.(node)}
        />
      ))}
    </g>
  );
};

export default RoadmapVisualization;

import React, { useEffect, useState, useRef } from 'react';
import { BackgroundLayers, RoadmapVisualization } from './roadmap-elements';
import { Roadmap } from '../api';

interface GameMapSVGProps {
  direction?: string;
  onOpen?: (id: number) => void;
}

const GameMapSVG: React.FC<GameMapSVGProps> = ({ direction, onOpen }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  // Load roadmap data
  useEffect(() => {
    const loadRoadmapData = async () => {
      try {
        setLoading(true);
        
        // Загружаем данные в зависимости от выбранного направления
        let roadmapData;
        if (direction) {
          // Загружаем узлы для конкретного направления
          roadmapData = await Roadmap.byDirection(direction);
          console.log(`Loaded roadmap data for direction "${direction}":`, roadmapData);
        } else {
          // Загружаем все узлы
          roadmapData = await Roadmap.getTree();
          console.log('Loaded all roadmap data:', roadmapData);
        }
        
        // Фильтруем только корневые узлы
        const allNodes = roadmapData || [];
        let rootNodes;
        
        if (direction) {
          // Для конкретного направления берем только корневой узел этого направления
          rootNodes = allNodes.filter(node => {
            // Проверяем, не является ли этот узел дочерним для какого-либо другого узла
            return !allNodes.some(otherNode => 
              otherNode.children && otherNode.children.some(child => child.id === node.id)
            );
          });
        } else {
          // Для всех направлений берем корневые узлы всех направлений
          rootNodes = allNodes.filter(node => {
            return !allNodes.some(otherNode => 
              otherNode.children && otherNode.children.some(child => child.id === node.id)
            );
          });
        }
        
        console.log('Root nodes for direction:', direction, rootNodes);
        setNodes(rootNodes);

      } catch (error) {
        console.error('Failed to load roadmap data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRoadmapData();
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

  return (
    <div ref={containerRef} className="w-full h-screen bg-slate-800 relative overflow-hidden">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-full"
      >
        {/* Многослойный фон */}
        <BackgroundLayers width={dimensions.width} height={dimensions.height} />
        
        {/* Визуализация роадмапа */}
        <RoadmapVisualization
          width={dimensions.width}
          height={dimensions.height}
          nodes={nodes}
          onNodeClick={(node) => {
            console.log('Node clicked:', node);
            onOpen?.(node.id);
          }}
        />
      </svg>
    </div>
  );
};

export default GameMapSVG;
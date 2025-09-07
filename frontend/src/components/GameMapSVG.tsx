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
        
        // Тестовые данные для проверки отображения
        const testNodes = [
          {
            id: 1,
            title: "Frontend Adventurer",
            description: "Start your quest in the realms of HTML/CSS/JS.",
            checkpoint: false,
            resources: "[\"https://developer.mozilla.org\"]",
            direction: "frontend",
            children: [
              {
                id: 2,
                title: "HTML & Semantics",
                description: "Structure pages with meaning.",
                checkpoint: true,
                resources: "[\"https://web.dev/learn/html/\"]",
                direction: "frontend",
                children: []
              }
            ]
          },
          {
            id: 13,
            title: "Junior Developer",
            description: "Начальный уровень разработчика.",
            checkpoint: false,
            resources: "[\"https://roadmap.sh/\"]",
            direction: "career",
            children: [
              {
                id: 14,
                title: "Junior Developer",
                description: "Основы программирования.",
                checkpoint: true,
                resources: "[\"https://github.com/kamranahmedse/developer-roadmap\"]",
                direction: "career",
                children: []
              }
            ]
          }
        ];
        
        console.log('Using test nodes:', testNodes);
        setNodes(testNodes);
        
        // Попробуем также загрузить реальные данные
        try {
          const roadmapData = await Roadmap.getTree();
          console.log('Loaded roadmap data from API:', roadmapData);
          console.log('Roadmap data type:', typeof roadmapData);
          console.log('Roadmap data length:', roadmapData?.length);
          // setNodes(roadmapData || []);
        } catch (apiError) {
          console.error('API error:', apiError);
        }
        
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
        
        {/* Тестовый узел для проверки */}
        <circle
          cx={200}
          cy={200}
          r={30}
          fill="#ff0000"
          stroke="#000000"
          strokeWidth="2"
        />
        <text
          x={200}
          y={250}
          textAnchor="middle"
          fontSize="12"
          fill="#000000"
        >
          Test Node
        </text>
        
        {/* Визуализация роадмапа */}
        {console.log('GameMapSVG rendering with nodes:', nodes)}
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
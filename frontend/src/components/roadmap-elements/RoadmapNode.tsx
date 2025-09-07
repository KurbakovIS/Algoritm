import React from 'react';

interface RoadmapNodeProps {
  x: number;
  y: number;
  title: string;
  description: string;
  direction: string;
  checkpoint: boolean;
  onClick: () => void;
}

const RoadmapNode: React.FC<RoadmapNodeProps> = ({ 
  x, 
  y, 
  title, 
  description, 
  direction, 
  checkpoint, 
  onClick 
}) => {
  // Определяем изображение в зависимости от направления
  const getNodeImage = (direction: string) => {
    switch (direction) {
      case 'career':
        // Для карьерного пути используем разные изображения в зависимости от уровня
        if (title.toLowerCase().includes('junior')) {
          return '/roadmap-assets/village solid.png'; // Деревня для джуна
        } else if (title.toLowerCase().includes('middle')) {
          return '/roadmap-assets/watchtower solid.png'; // Башня для мидла
        } else if (title.toLowerCase().includes('senior') || title.toLowerCase().includes('tech lead')) {
          return '/roadmap-assets/open-city solid.png'; // Город для сеньора
        }
        return '/roadmap-assets/home solid.png'; // Дом по умолчанию
      default:
        return '/roadmap-assets/home solid.png'; // Дом для всех остальных направлений
    }
  };

  const nodeImage = getNodeImage(direction);
  const nodeSize = 60; // Размер узла

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Тень узла */}
      <rect
        x={x - nodeSize/2 + 3}
        y={y - nodeSize/2 + 3}
        width={nodeSize}
        height={nodeSize}
        fill="rgba(0, 0, 0, 0.3)"
        rx="8"
      />
      
      {/* Основной узел */}
      <rect
        x={x - nodeSize/2}
        y={y - nodeSize/2}
        width={nodeSize}
        height={nodeSize}
        fill="#8b4513"
        stroke="#ffd700"
        strokeWidth="3"
        rx="8"
      />
      
      {/* Изображение узла */}
      <image
        href={nodeImage}
        x={x - nodeSize/2 + 8}
        y={y - nodeSize/2 + 8}
        width={nodeSize - 16}
        height={nodeSize - 16}
        preserveAspectRatio="xMidYMid meet"
        onError={(e) => {
          console.error('Failed to load image:', nodeImage);
          // Fallback к простому кругу
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {/* Fallback - простой круг если изображение не загрузилось */}
      <circle
        cx={x}
        cy={y}
        r={nodeSize/2 - 8}
        fill="#ffd700"
        opacity="0.8"
        style={{ display: 'none' }}
        id={`fallback-${x}-${y}`}
      />
      
      {/* Чекпоинт индикатор */}
      {checkpoint && (
        <circle
          cx={x + nodeSize/2 - 8}
          cy={y - nodeSize/2 + 8}
          r="8"
          fill="#ffd700"
          stroke="#8b4513"
          strokeWidth="2"
        />
      )}
      
      {/* Название узла */}
      <text
        x={x}
        y={y + nodeSize/2 + 20}
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#8b4513"
        style={{ pointerEvents: 'none' }}
      >
        {title}
      </text>
    </g>
  );
};

export default RoadmapNode;

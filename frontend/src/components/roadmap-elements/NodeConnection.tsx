import React from 'react';

interface NodeConnectionProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const NodeConnection: React.FC<NodeConnectionProps> = ({ x1, y1, x2, y2 }) => {
  return (
    <g>
      {/* Тень связи */}
      <line
        x1={x1 + 2}
        y1={y1 + 2}
        x2={x2 + 2}
        y2={y2 + 2}
        stroke="rgba(0, 0, 0, 0.3)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Основная связь */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#8b4513"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="10,5"
      />
      
      {/* Декоративные элементы связи */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#ffd700"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="5,10"
        opacity="0.7"
      />
    </g>
  );
};

export default NodeConnection;

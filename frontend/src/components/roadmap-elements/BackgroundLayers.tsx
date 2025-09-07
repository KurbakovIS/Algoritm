import React from 'react';

interface BackgroundLayersProps {
  width: number;
  height: number;
}

const BackgroundLayers: React.FC<BackgroundLayersProps> = ({ width, height }) => {
  return (
    <g>
      {/* Основной фон - base-paper-1 (пока заглушка) */}
      <rect
        width={width}
        height={height}
        fill="#d4af8c"
      />
      
      {/* Прозрачная топография поверх основного фона */}
      <defs>
        <pattern id="topographyPattern" patternUnits="userSpaceOnUse" width="100%" height="100%">
          <image 
            href="/roadmap-assets/topography2.png" 
            width="100%" 
            height="100%" 
            preserveAspectRatio="xMidYMid slice" 
            opacity="0.3"
          />
        </pattern>
      </defs>
      
      <rect
        width={width}
        height={height}
        fill="url(#topographyPattern)"
        opacity="0.3"
      />
      
      {/* Рамка фона */}
      <defs>
        <pattern id="borderPattern" patternUnits="userSpaceOnUse" width="100%" height="100%">
          <image 
            href="/roadmap-assets/border 3.png" 
            width="100%" 
            height="100%" 
            preserveAspectRatio="xMidYMid slice" 
          />
        </pattern>
      </defs>
      
      <rect
        width={width}
        height={height}
        fill="url(#borderPattern)"
      />
    </g>
  );
};

export default BackgroundLayers;

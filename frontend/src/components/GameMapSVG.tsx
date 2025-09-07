import React, { useEffect, useState, useRef } from 'react';
import { BackgroundLayers } from './roadmap-elements';

interface GameMapSVGProps {
  direction?: string;
  onOpen?: (id: number) => void;
}

const GameMapSVG: React.FC<GameMapSVGProps> = ({ direction, onOpen }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

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
        
        {/* Здесь будут ваши новые компоненты */}
      </svg>
    </div>
  );
};

export default GameMapSVG;
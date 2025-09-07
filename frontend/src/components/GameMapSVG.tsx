import React, { useEffect, useState, useRef } from 'react';

const GameMapSVG = () => {
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
        {/* Parchment background image */}
        <defs>
          <pattern id="parchmentPattern" patternUnits="userSpaceOnUse" width="100%" height="100%">
            <image href="/parchment-bg.jpg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
          </pattern>
        </defs>
        
        <rect
          width={dimensions.width}
          height={dimensions.height}
          fill="url(#parchmentPattern)"
        />
        
        {/* Здесь будут ваши новые компоненты */}
      </svg>
    </div>
  );
};

export default GameMapSVG;